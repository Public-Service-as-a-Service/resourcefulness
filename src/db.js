import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { AREA_IDS } from './ladders.js';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dagar

export function openDb(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS respondents (
      id          INTEGER PRIMARY KEY,
      email       TEXT NOT NULL UNIQUE,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token         TEXT PRIMARY KEY,
      respondent_id INTEGER NOT NULL REFERENCES respondents(id) ON DELETE CASCADE,
      expires_at    INTEGER NOT NULL
    );

    -- Varje inskickad självskattning sparas (historik bevaras).
    CREATE TABLE IF NOT EXISTS submissions (
      id            INTEGER PRIMARY KEY,
      respondent_id INTEGER NOT NULL REFERENCES respondents(id) ON DELETE CASCADE,
      created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE TABLE IF NOT EXISTS answers (
      id            INTEGER PRIMARY KEY,
      submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
      area          TEXT NOT NULL,
      current_level INTEGER CHECK (current_level BETWEEN 1 AND 5),
      target_level  INTEGER CHECK (target_level BETWEEN 1 AND 5),
      comment       TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_resp ON submissions(respondent_id, id);
    CREATE INDEX IF NOT EXISTS idx_answers_sub ON answers(submission_id);
  `);
  return new Store(db);
}

class Store {
  constructor(db) {
    this.db = db;
  }

  close() {
    this.db.close();
  }

  // --- Respondenter och sessioner -------------------------------------------

  login(email) {
    const db = this.db;
    db.prepare('INSERT INTO respondents (email) VALUES (?) ON CONFLICT(email) DO NOTHING').run(email);
    const { id } = db.prepare('SELECT id FROM respondents WHERE email = ?').get(email);
    const token = randomBytes(32).toString('base64url');
    db.prepare('INSERT INTO sessions (token, respondent_id, expires_at) VALUES (?, ?, ?)').run(
      token,
      id,
      Date.now() + SESSION_TTL_MS,
    );
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
    return token;
  }

  respondentForSession(token) {
    if (!token) return null;
    return (
      this.db
        .prepare(
          `SELECT r.id, r.email FROM sessions s JOIN respondents r ON r.id = s.respondent_id
           WHERE s.token = ? AND s.expires_at > ?`,
        )
        .get(token, Date.now()) ?? null
    );
  }

  logout(token) {
    this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  // --- Svar --------------------------------------------------------------------

  saveSubmission(respondentId, answers) {
    const db = this.db;
    db.exec('BEGIN IMMEDIATE');
    try {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO submissions (respondent_id) VALUES (?)')
        .run(respondentId);
      const ins = db.prepare(
        'INSERT INTO answers (submission_id, area, current_level, target_level, comment) VALUES (?, ?, ?, ?, ?)',
      );
      for (const a of answers) {
        ins.run(lastInsertRowid, a.area, a.current ?? null, a.target ?? null, a.comment || null);
      }
      db.exec('COMMIT');
      return Number(lastInsertRowid);
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  latestAnswers(respondentId) {
    const sub = this.db
      .prepare('SELECT id, created_at FROM submissions WHERE respondent_id = ? ORDER BY id DESC LIMIT 1')
      .get(respondentId);
    if (!sub) return null;
    const rows = this.db
      .prepare('SELECT area, current_level, target_level, comment FROM answers WHERE submission_id = ?')
      .all(sub.id);
    const byArea = {};
    for (const r of rows) byArea[r.area] = r;
    return { createdAt: sub.created_at, byArea };
  }

  // --- Anonymiserad sammanställning ------------------------------------------
  // Bygger enbart på respektive respondents senaste inskick och returnerar
  // aldrig e-postadresser eller id:n.

  summary() {
    const db = this.db;
    const latest = `
      SELECT s.id FROM submissions s
      WHERE s.id = (SELECT MAX(id) FROM submissions WHERE respondent_id = s.respondent_id)`;

    const totals = db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM respondents) AS registered,
           (SELECT COUNT(DISTINCT respondent_id) FROM submissions) AS answered,
           (SELECT COUNT(*) FROM submissions) AS submissions,
           (SELECT COUNT(DISTINCT substr(email, instr(email, '@') + 1)) FROM respondents
              WHERE id IN (SELECT respondent_id FROM submissions)) AS organisations`,
      )
      .get();

    const dist = db
      .prepare(
        `SELECT area, current_level AS level, COUNT(*) AS n FROM answers
         WHERE submission_id IN (${latest}) AND current_level IS NOT NULL
         GROUP BY area, current_level`,
      )
      .all();
    const targetDist = db
      .prepare(
        `SELECT area, target_level AS level, COUNT(*) AS n FROM answers
         WHERE submission_id IN (${latest}) AND target_level IS NOT NULL
         GROUP BY area, target_level`,
      )
      .all();
    const stats = db
      .prepare(
        `SELECT area,
                AVG(current_level) AS avg_current,
                AVG(target_level)  AS avg_target,
                COUNT(current_level) AS n_current,
                COUNT(target_level)  AS n_target,
                SUM(current_level IS NULL) AS n_unknown
         FROM answers WHERE submission_id IN (${latest})
         GROUP BY area`,
      )
      .all();
    // Kommentarer visas utan koppling till person och i slumpad ordning.
    const comments = db
      .prepare(
        `SELECT area, comment FROM answers
         WHERE submission_id IN (${latest}) AND comment IS NOT NULL AND trim(comment) <> ''
         ORDER BY random()`,
      )
      .all();
    const perMonth = db
      .prepare(
        `SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS n FROM submissions
         GROUP BY month ORDER BY month`,
      )
      .all();

    const areas = {};
    for (const id of AREA_IDS) {
      areas[id] = {
        current: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        target: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        avgCurrent: null,
        avgTarget: null,
        nCurrent: 0,
        nTarget: 0,
        nUnknown: 0,
        comments: [],
      };
    }
    for (const r of dist) if (areas[r.area]) areas[r.area].current[r.level] = r.n;
    for (const r of targetDist) if (areas[r.area]) areas[r.area].target[r.level] = r.n;
    for (const r of stats) {
      const a = areas[r.area];
      if (!a) continue;
      a.avgCurrent = r.avg_current;
      a.avgTarget = r.avg_target;
      a.nCurrent = r.n_current;
      a.nTarget = r.n_target;
      a.nUnknown = r.n_unknown;
    }
    for (const r of comments) if (areas[r.area]) areas[r.area].comments.push(r.comment);

    return { totals, areas, perMonth };
  }
}
