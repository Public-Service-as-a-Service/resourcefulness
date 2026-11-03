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
    body: new URLSearchParams(fields),
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
    arende_target: '3',
    arende_comment: 'Kör på MSSQL <script>',
    epost_current: '2',
    iam_current: '',
    ovriga_current: '4',
  });
  assert.equal(res.status, 303);

  const result = await (await fetch(`${base}/resultat`, { headers: { cookie: c1 } })).text();
  assert.match(result, /1 – Beroende/);
  assert.match(result, /Nästa steg – 2\. Medveten/);

  // Förifyllt formulär
  const form = await (await fetch(`${base}/skatta`, { headers: { cookie: c1 } })).text();
  assert.match(form, /id="arende-1" name="arende_current" value="1" checked/);

  // Under gränsen för anonymitet visas inga fördelningar
  let admin = await (await fetch(`${base}/hemlig-admin`)).text();
  assert.match(admin, /minst 2 personer/);

  // Samma person skickar igen – bara senaste räknas
  await submit(c1, { arende_current: '2', epost_current: '2', ovriga_current: '4' });
  const c2 = await login('bo@region.se');
  await submit(c2, { arende_current: '4', arende_target: '5', epost_current: '3' });

  admin = await (await fetch(`${base}/hemlig-admin`)).text();
  assert.doesNotMatch(admin, /anna@kommun\.se|bo@region\.se/);
  assert.match(admin, /<b>2<\/b><span>har skattat/);
  assert.match(admin, /<b>3<\/b><span>inskick totalt/);
  const s = app.store.summary();
  assert.equal(s.areas.arende.avgCurrent, 3); // (2 + 4) / 2
  assert.equal(s.areas.arende.current[1], 0);
  assert.equal(s.areas.iam.nUnknown, 2);
  assert.doesNotMatch(admin, /<script>/);
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

test('adminsidan kan rensa databasen efter bekräftelse', async () => {
  const c = await login('rensa@example.se');
  await submit(c, { arende_current: '3' });
  assert.ok(app.store.summary().totals.submissions > 0);

  let admin = await (await fetch(`${base}/hemlig-admin`)).text();
  assert.match(admin, /action="\/hemlig-admin\/rensa"/);

  // Fel bekräftelse – inget tas bort
  let res = await fetch(`${base}/hemlig-admin/rensa`, { method: 'POST', body: new URLSearchParams({ confirm: 'ja' }) });
  assert.equal(res.status, 400);
  assert.ok(app.store.summary().totals.submissions > 0);

  // Rätt bekräftelse
  res = await fetch(`${base}/hemlig-admin/rensa`, {
    method: 'POST',
    body: new URLSearchParams({ confirm: 'RENSA' }),
    redirect: 'manual',
  });
  assert.equal(res.status, 303);
  const t = app.store.summary().totals;
  assert.equal(t.registered, 0);
  assert.equal(t.submissions, 0);
  // Sessionen är borta
  assert.equal((await fetch(`${base}/skatta`, { headers: { cookie: c }, redirect: 'manual' })).status, 303);
  admin = await (await fetch(`${base}/hemlig-admin?rensad=1`)).text();
  assert.match(admin, /Databasen är rensad/);
});

test('rensning kräver admin-lösenord när det är satt', async () => {
  const dir2 = mkdtempSync(join(tmpdir(), 'radighet-'));
  const app2 = createApp({ dbFile: join(dir2, 't.db'), adminPath: 'x', adminPassword: 'hemligt' });
  await new Promise((r) => app2.server.listen(0, r));
  const res = await fetch(`http://127.0.0.1:${app2.server.address().port}/x/rensa`, {
    method: 'POST',
    body: new URLSearchParams({ confirm: 'RENSA' }),
  });
  assert.equal(res.status, 401);
  await new Promise((r) => app2.server.close(r));
  app2.store.close();
  rmSync(dir2, { recursive: true, force: true });
});
