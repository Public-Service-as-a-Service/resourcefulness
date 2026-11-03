import http from 'node:http';
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { openDb } from './db.js';
import { AREAS, LEVELS } from './ladders.js';
import * as views from './views.js';

const SESSION_COOKIE = 'radighet_session';
const MAX_BODY = 64 * 1024;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
};

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(new URLSearchParams(Buffer.concat(chunks).toString('utf8'))));
    req.on('error', reject);
  });
}

function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

export function normalizeEmail(raw) {
  const email = String(raw ?? '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

function parseLevel(v) {
  const n = Number.parseInt(v, 10);
  return LEVELS.includes(n) ? n : null;
}

export function createApp(options = {}) {
  const config = {
    dbFile: options.dbFile ?? process.env.DATABASE_PATH ?? './data/radighet.db',
    adminPath: (options.adminPath ?? process.env.ADMIN_PATH ?? '').replace(/^\/+|\/+$/g, ''),
    adminPassword: options.adminPassword ?? process.env.ADMIN_PASSWORD ?? '',
    minGroup: Number(options.minGroup ?? process.env.ADMIN_MIN_GROUP_SIZE ?? 3),
    secureCookies: options.secureCookies ?? process.env.COOKIE_SECURE === 'true',
  };
  if (!config.adminPath) {
    config.adminPath = `admin-${randomBytes(12).toString('hex')}`;
    config.generatedAdminPath = true;
  }

  const store = openDb(config.dbFile);

  function send(res, status, html, headers = {}) {
    res.writeHead(status, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...headers,
    });
    res.end(html);
  }

  function redirect(res, location, headers = {}) {
    res.writeHead(303, { Location: location, 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...headers });
    res.end();
  }

  function sessionCookie(token, maxAge) {
    return [
      `${SESSION_COOKIE}=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${maxAge}`,
      ...(config.secureCookies ? ['Secure'] : []),
    ].join('; ');
  }

  // Enkelt CSRF-skydd för formulär: om webbläsaren skickar Origin måste den
  // matcha värden (kompletterar SameSite=Lax på sessionskakan).
  function sameOrigin(req) {
    const origin = req.headers.origin;
    if (!origin || origin === 'null') return !origin;
    try {
      const host = req.headers['x-forwarded-host'] ?? req.headers.host;
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  function adminAuthorized(req) {
    if (!config.adminPassword) return true;
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Basic ')) return false;
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const pass = decoded.slice(decoded.indexOf(':') + 1);
    return safeEqual(pass, config.adminPassword);
  }

  async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = req.method;
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE];
    const user = store.respondentForSession(token);
    const page = (title, body, opts = {}) => views.layout({ title, body, user, ...opts });

    if (method === 'POST' && !sameOrigin(req)) {
      return send(res, 403, page('Förbjudet', '<hr><h2>Förbjudet</h2><p>Ogiltig förfrågan.</p>'));
    }

    if (path === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('ok');
    }

    if (path === '/favicon.svg' || path === '/favicon.ico') {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' });
      return res.end(views.FAVICON_SVG);
    }

    if (path === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('User-agent: *\nDisallow: /skatta\nDisallow: /resultat\n');
    }

    if (path === '/' && method === 'GET') {
      return send(res, 200, page('Start', views.startPage({ user }), { current: '/' }));
    }

    if (path === '/trappor' && method === 'GET') {
      return send(res, 200, page('Mognadstrapporna', views.laddersPage(), { current: '/trappor' }));
    }

    if (path === '/start' && method === 'POST') {
      const body = await readBody(req);
      const raw = body.get('email') ?? '';
      const email = normalizeEmail(raw);
      if (!email) {
        return send(
          res,
          400,
          page('Start', views.startPage({ user: null, error: 'Ange en giltig e-postadress.', email: raw })),
        );
      }
      const newToken = store.login(email);
      return redirect(res, '/skatta', { 'Set-Cookie': sessionCookie(newToken, 60 * 60 * 24 * 30) });
    }

    if (path === '/logga-ut') {
      if (token) store.logout(token);
      return redirect(res, '/', { 'Set-Cookie': sessionCookie('', 0) });
    }

    if (path === '/skatta' || path === '/resultat') {
      if (!user) return redirect(res, '/');
    }

    if (path === '/skatta' && method === 'GET') {
      const previous = store.latestAnswers(user.id);
      return send(res, 200, page('Självskattning', views.assessPage({ user, previous }), { current: '/skatta' }));
    }

    if (path === '/skatta' && method === 'POST') {
      const body = await readBody(req);
      const answers = AREAS.map((a) => ({
        area: a.id,
        current: parseLevel(body.get(`${a.id}_current`)),
        target: parseLevel(body.get(`${a.id}_target`)),
        comment: (body.get(`${a.id}_comment`) ?? '').trim().slice(0, 2000),
      }));
      const anyAnswered = answers.some((a) => a.current || a.target || a.comment);
      if (!anyAnswered) {
        return send(
          res,
          400,
          page(
            'Självskattning',
            views.assessPage({
              user,
              previous: store.latestAnswers(user.id),
              error: 'Välj en nivå för minst ett område innan du sparar.',
            }),
          ),
        );
      }
      store.saveSubmission(user.id, answers);
      return redirect(res, '/resultat?sparad=1');
    }

    if (path === '/resultat' && method === 'GET') {
      const latest = store.latestAnswers(user.id);
      return send(
        res,
        200,
        page('Mitt resultat', views.resultPage({ user, latest, saved: url.searchParams.has('sparad') }), {
          current: '/resultat',
        }),
      );
    }

    if (path === `/${config.adminPath}` && method === 'GET') {
      if (!adminAuthorized(req)) {
        return send(res, 401, page('Inloggning krävs', '<hr><h2>Inloggning krävs</h2>'), {
          'WWW-Authenticate': 'Basic realm="Radighet admin", charset="UTF-8"',
        });
      }
      const html = views.layout({
        title: 'Sammanställning',
        body: views.adminPage({ summary: store.summary(), minGroup: config.minGroup }),
        user: null,
        wide: true,
        robots: 'noindex, nofollow',
      });
      return send(res, 200, html);
    }

    return send(res, 404, page('Hittades inte', views.notFoundPage()));
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      const status = err.status ?? 500;
      if (status >= 500) console.error(err);
      if (!res.headersSent) send(res, status, views.layout({ title: 'Fel', body: '<hr><h2>Något gick fel</h2>' }));
      else res.end();
    });
  });

  return { server, store, config };
}

// Starta servern när filen körs direkt.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { server, store, config } = createApp();
  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, () => {
    console.log(`Rådighet lyssnar på port ${port}, databas: ${config.dbFile} (WAL)`);
    if (config.generatedAdminPath) {
      console.log(
        `ADMIN_PATH är inte satt – tillfällig adminsida: /${config.adminPath} (sätt ADMIN_PATH för en beständig adress)`,
      );
    }
  });
  const shutdown = () => {
    server.close(() => {
      store.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
