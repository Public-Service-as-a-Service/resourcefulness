import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp, normalizeEmail } from '../src/server.js';

let app, base, dir;

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'radighet-'));
  app = createApp({ dbFile: join(dir, 'test.db'), adminPath: 'hemlig-admin', minGroup: 2 });
  await new Promise((r) => app.server.listen(0, r));
  base = `http://127.0.0.1:${app.server.address().port}`;
});

after(async () => {
  await new Promise((r) => app.server.close(r));
  app.store.close();
  rmSync(dir, { recursive: true, force: true });
});

async function login(email) {
  const res = await fetch(`${base}/start`, {
    method: 'POST',
    body: new URLSearchParams({ email }),
    redirect: 'manual',
  });
  assert.equal(res.status, 303);
  return res.headers.get('set-cookie').split(';')[0];
}

async function submit(cookie, fields) {
  return fetch(`${base}/skatta`, {
    method: 'POST',
    headers: { cookie },
    body: fields instanceof URLSearchParams ? fields : new URLSearchParams(fields),
    redirect: 'manual',
  });
}

test('normalizeEmail', () => {
  assert.equal(normalizeEmail('  Anna@Example.SE '), 'anna@example.se');
  assert.equal(normalizeEmail('inte-en-adress'), null);
  assert.equal(normalizeEmail('a@b'), null);
});

test('databasen kör i WAL-läge', () => {
  const { journal_mode } = app.store.db.prepare('PRAGMA journal_mode').get();
  assert.equal(journal_mode, 'wal');
});

test('startsidan visar NOSAD-loggan och e-postformulär', async () => {
  const html = await (await fetch(base)).text();
  assert.match(html, /<mark>NOSAD<\/mark>/);
  assert.match(html, /type="email"/);
});

test('självskattning kräver inloggning', async () => {
  const res = await fetch(`${base}/skatta`, { redirect: 'manual' });
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/');
});

test('ogiltig e-post avvisas', async () => {
  const res = await fetch(`${base}/start`, { method: 'POST', body: new URLSearchParams({ email: 'x' }) });
  assert.equal(res.status, 400);
});

test('flöde: logga in, skatta, se resultat och adminsammanställning', async () => {
  const c1 = await login('anna@kommun.se');
  let res = await submit(c1, {
    arende_current: '1',
    arende_strategy: 'kravstalla',
    challenges: 'kostnad',
    arende_comment: 'Kör på MSSQL <script>',
    epost_current: '2',
    iam_current: '',
    ovriga_current: '4',
  });
  assert.equal(res.status, 303);

  const result = await (await fetch(`${base}/resultat`, { headers: { cookie: c1 } })).text();
  assert.match(result, /1 – Beroende/);
  assert.match(result, /Nästa steg – 2\. Medveten/);
  assert.match(result, /Ställa rådighetskrav/);
  assert.match(result, /<h3>Största utmaningar<\/h3>\s*<ul><li><strong>Kostnader/);

  // Förifyllt formulär
  const form = await (await fetch(`${base}/skatta`, { headers: { cookie: c1 } })).text();
  assert.match(form, /id="arende-1" name="arende_current" value="1" checked/);

  // Under gränsen för anonymitet visas inga fördelningar
  let admin = await (await fetch(`${base}/hemlig-admin`)).text();
  assert.match(admin, /minst 2 personer/);

  // Samma person skickar igen – bara senaste räknas
  await submit(c1, { arende_current: '2', epost_current: '2', ovriga_current: '4' });
  const c2 = await login('bo@region.se');
  await submit(c2, { arende_current: '4', arende_strategy: 'samverka', challenges: 'omvarld', epost_current: '3' });

  admin = await (await fetch(`${base}/hemlig-admin`)).text();
  assert.doesNotMatch(admin, /anna@kommun\.se|bo@region\.se/);
  assert.match(admin, /<b>2<\/b><span>har skattat/);
  assert.match(admin, /<b>3<\/b><span>inskick totalt/);
  const s = app.store.summary();
  assert.equal(s.areas.arende.avgCurrent, 3); // (2 + 4) / 2
  assert.equal(s.areas.arende.current[1], 0);
  assert.equal(s.areas.iam.nUnknown, 2);
  assert.doesNotMatch(admin, /<script>/);
  assert.equal(s.areas.arende.strategies.samverka, 1);
  assert.equal(s.areas.arende.avgTarget, 5); // anna skickade om utan strategi
  assert.match(admin, /Största utmaningarna/);
  // anna skickade om utan utmaningar – bara bos val räknas
  assert.equal(s.challenges.n, 1);
  assert.equal(s.challenges.counts.omvarld, 1);
  assert.equal(s.challenges.counts.kostnad, 0);
});

test('strategi och utmaningar sparas och förifylls', async () => {
  const c = await login('cecilia@kommun.se');
  const body = new URLSearchParams({ iam_current: '2', iam_strategy: 'behalla' });
  body.append('challenges', 'kompetens');
  body.append('challenges', 'inlasning');
  const res = await submit(c, body);
  assert.equal(res.status, 303);
  const latest = app.store.latestAnswers((await app.store.db.prepare("SELECT id FROM respondents WHERE email='cecilia@kommun.se'").get()).id);
  assert.equal(latest.byArea.iam.strategy, 'behalla');
  assert.equal(latest.byArea.iam.target_level, 2); // behålla = samma som i dag
  assert.deepEqual(latest.challenges, ['kompetens', 'inlasning']);
  const form = await (await fetch(`${base}/skatta`, { headers: { cookie: c } })).text();
  assert.match(form, /name="iam_strategy" value="behalla" checked/);
  assert.match(form, /name="challenges" value="kompetens" checked/);
  assert.equal(form.match(/Vad ser ni som de största utmaningarna/g).length, 1);
  assert.doesNotMatch(form, /iam_challenges/);
  assert.match(form, /Hur ser er strategi ut för de kommande två åren\?/);
  assert.match(form, /Vad ser ni som de största utmaningarna att nå full rådighet\?/);
});

test('fler än tre utmaningar avvisas och formuläret behåller svaren', async () => {
  const c = await login('dan@kommun.se');
  const body = new URLSearchParams({ epost_current: '3' });
  for (const id of ['kostnad', 'sakerhet', 'exit', 'styrning']) body.append('challenges', id);
  const res = await submit(c, body);
  assert.equal(res.status, 400);
  const html = await res.text();
  assert.match(html, /högst 3 utmaningar/);
  assert.match(html, /name="epost_current" value="3" checked/);
  assert.match(html, /name="challenges" value="styrning" checked/);
});

test('tomt inskick avvisas', async () => {
  const c = await login('tom@example.se');
  const res = await submit(c, {});
  assert.equal(res.status, 400);
});

test('POST från annan origin avvisas', async () => {
  const res = await fetch(`${base}/start`, {
    method: 'POST',
    headers: { origin: 'https://evil.example' },
    body: new URLSearchParams({ email: 'a@b.se' }),
  });
  assert.equal(res.status, 403);
});

test('adminsidan kan skyddas med lösenord', async () => {
  const dir2 = mkdtempSync(join(tmpdir(), 'radighet-'));
  const app2 = createApp({ dbFile: join(dir2, 't.db'), adminPath: 'x', adminPassword: 'hemligt' });
  await new Promise((r) => app2.server.listen(0, r));
  const url = `http://127.0.0.1:${app2.server.address().port}/x`;
  assert.equal((await fetch(url)).status, 401);
  const ok = await fetch(url, { headers: { authorization: `Basic ${Buffer.from('admin:hemligt').toString('base64')}` } });
  assert.equal(ok.status, 200);
  await new Promise((r) => app2.server.close(r));
  app2.store.close();
  rmSync(dir2, { recursive: true, force: true });
});

test('sidan Om rådighet beskriver initiativet och styrande initiativ', async () => {
  const res = await fetch(`${base}/om-radighet`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /aria-current="page">Om rådighet/);
  for (const text of ['Initiativet Rådig', 'EU-initiativ som styr', 'NIS2', 'Data Act', 'molnpolicy']) {
    assert.ok(html.includes(text), `saknar ${text}`);
  }
  assert.doesNotMatch(html, /<script/);
});

test('äldre skattningar med utmaningar per område slås ihop till en gemensam lista', async () => {
  const c = await login('gamla@kommun.se');
  await submit(c, { arende_current: '2' });
  const db = app.store.db;
  const { id: rid } = db.prepare("SELECT id FROM respondents WHERE email='gamla@kommun.se'").get();
  const { id: sid } = db.prepare('SELECT MAX(id) AS id FROM submissions WHERE respondent_id = ?').get(rid);
  // Simulera ett inskick från före ändringen: utmaningar per område, inget på inskicket.
  db.prepare('UPDATE submissions SET challenges = NULL WHERE id = ?').run(sid);
  db.prepare("UPDATE answers SET challenges = 'kostnad,exit' WHERE submission_id = ? AND area = 'arende'").run(sid);
  db.prepare("UPDATE answers SET challenges = 'exit,styrning' WHERE submission_id = ? AND area = 'epost'").run(sid);
  db.prepare("UPDATE answers SET challenges = 'exit,kompetens' WHERE submission_id = ? AND area = 'iam'").run(sid);
  const latest = app.store.latestAnswers(rid);
  assert.equal(latest.challenges.length, 3);
  assert.equal(latest.challenges[0], 'exit'); // vald i flest områden
  const s = app.store.summary();
  assert.ok(s.challenges.counts.exit >= 1);
});

test('äldre databas utan strategikolumner migreras', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const dir3 = mkdtempSync(join(tmpdir(), 'radighet-'));
  const file = join(dir3, 'old.db');
  const old = new DatabaseSync(file);
  old.exec(`CREATE TABLE respondents (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT 'x');
    CREATE TABLE submissions (id INTEGER PRIMARY KEY, respondent_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT 'x');
    CREATE TABLE answers (id INTEGER PRIMARY KEY, submission_id INTEGER NOT NULL, area TEXT NOT NULL,
      current_level INTEGER, target_level INTEGER, comment TEXT);
    INSERT INTO respondents (id, email) VALUES (1, 'e@f.se');
    INSERT INTO submissions (id, respondent_id) VALUES (1, 1);
    INSERT INTO answers (submission_id, area, current_level, target_level) VALUES (1, 'arende', 1, 4);`);
  old.close();
  const { openDb } = await import('../src/db.js');
  const store = openDb(file);
  assert.equal(store.latestAnswers(1).byArea.arende.strategy, 'oppen');
  store.close();
  rmSync(dir3, { recursive: true, force: true });
});

test('admin: export som JSON och fabriksåterställning', async () => {
  const dir3 = mkdtempSync(join(tmpdir(), 'radighet-'));
  const app3 = createApp({ dbFile: join(dir3, 't.db'), adminPath: 'adm', adminPassword: 'pw' });
  await new Promise((r) => app3.server.listen(0, r));
  const b = `http://127.0.0.1:${app3.server.address().port}`;
  const auth = { authorization: `Basic ${Buffer.from('admin:pw').toString('base64')}` };
  try {
    const login3 = await fetch(`${b}/start`, {
      method: 'POST',
      body: new URLSearchParams({ email: 'cia@kommun.se' }),
      redirect: 'manual',
    });
    const cookie = login3.headers.get('set-cookie').split(';')[0];
    await fetch(`${b}/skatta`, {
      method: 'POST',
      headers: { cookie },
      body: new URLSearchParams({ arende_current: '3', arende_comment: 'Hej', challenges: 'kostnad' }),
      redirect: 'manual',
    });

    // Knappen finns längst ner på adminsidan
    const admin = await (await fetch(`${b}/adm`, { headers: auth })).text();
    assert.match(admin, /Fabriksåterställ/);
    assert.ok(admin.lastIndexOf('Fabriksåterställ') > admin.lastIndexOf('Sammanställning'));
    assert.match(admin, /href="\/adm\/export\.json"/);

    // Export kräver inloggning
    assert.equal((await fetch(`${b}/adm/export.json`)).status, 401);
    const exp = await fetch(`${b}/adm/export.json`, { headers: auth });
    assert.equal(exp.status, 200);
    assert.match(exp.headers.get('content-type'), /application\/json/);
    assert.match(exp.headers.get('content-disposition'), /attachment; filename="radighet-/);
    const data = await exp.json();
    assert.equal(data.respondents[0].email, 'cia@kommun.se');
    assert.equal(data.submissions.length, 1);
    assert.deepEqual(data.submissions[0].challenges, ['kostnad']);
    assert.equal(data.submissions[0].answers.find((a) => a.area === 'arende').comment, 'Hej');

    const anon = await (await fetch(`${b}/adm/export.json?anonym=1`, { headers: auth })).json();
    assert.equal(anon.respondents[0].domain, 'kommun.se');
    assert.doesNotMatch(JSON.stringify(anon), /cia@/);

    // Fel bekräftelse raderar inget
    let res = await fetch(`${b}/adm/fabriksaterstallning`, {
      method: 'POST',
      headers: auth,
      body: new URLSearchParams({ confirm: 'radera?' }),
      redirect: 'manual',
    });
    assert.equal(res.status, 400);
    assert.equal(app3.store.summary().totals.registered, 1);

    // Utan lösenord går det inte
    res = await fetch(`${b}/adm/fabriksaterstallning`, {
      method: 'POST',
      body: new URLSearchParams({ confirm: 'RADERA' }),
      redirect: 'manual',
    });
    assert.equal(res.status, 401);

    res = await fetch(`${b}/adm/fabriksaterstallning`, {
      method: 'POST',
      headers: auth,
      body: new URLSearchParams({ confirm: 'RADERA' }),
      redirect: 'manual',
    });
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/adm?nollstalld=1');
    const t = app3.store.summary().totals;
    assert.equal(t.registered, 0);
    assert.equal(t.submissions, 0);
    // Sessionen är borta
    const skatta = await fetch(`${b}/skatta`, { headers: { cookie }, redirect: 'manual' });
    assert.equal(skatta.status, 303);
    const after = await (await fetch(`${b}/adm?nollstalld=1`, { headers: auth })).text();
    assert.match(after, /Fabriksåterställningen är klar/);
  } finally {
    await new Promise((r) => app3.server.close(r));
    app3.store.close();
    rmSync(dir3, { recursive: true, force: true });
  }
});
