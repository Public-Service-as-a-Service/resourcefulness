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
    arende_challenges: 'kostnad',
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
  assert.match(result, /Största utmaningar: Kostnader/);

  // Förifyllt formulär
  const form = await (await fetch(`${base}/skatta`, { headers: { cookie: c1 } })).text();
  assert.match(form, /id="arende-1" name="arende_current" value="1" checked/);

  // Under gränsen för anonymitet visas inga fördelningar
  let admin = await (await fetch(`${base}/hemlig-admin`)).text();
  assert.match(admin, /minst 2 personer/);

  // Samma person skickar igen – bara senaste räknas
  await submit(c1, { arende_current: '2', epost_current: '2', ovriga_current: '4' });
  const c2 = await login('bo@region.se');
  await submit(c2, { arende_current: '4', arende_strategy: 'samverka', arende_challenges: 'omvarld', epost_current: '3' });

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
  assert.match(admin, /Största utmaningarna – alla områden/);
});

test('strategi och utmaningar sparas och förifylls', async () => {
  const c = await login('cecilia@kommun.se');
  const body = new URLSearchParams({ iam_current: '2', iam_strategy: 'behalla' });
  body.append('iam_challenges', 'kompetens');
  body.append('iam_challenges', 'inlasning');
  const res = await submit(c, body);
  assert.equal(res.status, 303);
  const latest = app.store.latestAnswers((await app.store.db.prepare("SELECT id FROM respondents WHERE email='cecilia@kommun.se'").get()).id);
  assert.equal(latest.byArea.iam.strategy, 'behalla');
  assert.equal(latest.byArea.iam.target_level, 2); // behålla = samma som i dag
  assert.deepEqual(latest.byArea.iam.challenges, ['kompetens', 'inlasning']);
  const form = await (await fetch(`${base}/skatta`, { headers: { cookie: c } })).text();
  assert.match(form, /name="iam_strategy" value="behalla" checked/);
  assert.match(form, /name="iam_challenges" value="kompetens" checked/);
  assert.match(form, /Hur ser er strategi ut för de kommande två åren\?/);
  assert.match(form, /Vad ser ni som de största utmaningarna att nå full rådighet\?/);
});

test('fler än tre utmaningar avvisas och formuläret behåller svaren', async () => {
  const c = await login('dan@kommun.se');
  const body = new URLSearchParams({ epost_current: '3' });
  for (const id of ['kostnad', 'sakerhet', 'exit', 'styrning']) body.append('epost_challenges', id);
  const res = await submit(c, body);
  assert.equal(res.status, 400);
  const html = await res.text();
  assert.match(html, /högst 3 utmaningar/);
  assert.match(html, /name="epost_current" value="3" checked/);
  assert.match(html, /name="epost_challenges" value="styrning" checked/);
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
