import { AREAS, LEVELS, LEVEL_NAMES } from './ladders.js';
import { CHALLENGES, MAX_CHALLENGES, STRATEGIES, challengeById, strategyById } from './questions.js';

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// NOSAD-ikonen (samma som nosad.se använder som favicon).
export const FAVICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88"><path d="M17.89 0h88.9c8.85 0 16.1 7.24 16.1 16.1v90.68c0 8.85-7.24 16.1-16.1 16.1H16.1c-8.85 0-16.1-7.24-16.1-16.1v-88.9C0 8.05 8.05 0 17.89 0zm14.53 31.06h17.52l22.79 33.55V31.06h17.74v60.76H72.73L50.07 58.46v33.36H32.42V31.06z" fill-rule="evenodd" clip-rule="evenodd"/></svg>';

// Stilen följer nosad.se: smal läskolumn, Arial, #FBFBFB, blå länkar och
// loggan som ett svart »överstrykningspenna«-märke.
const CSS = `
html{box-sizing:border-box;font-size:16px}*,*:before,*:after{box-sizing:inherit}
body,h1,h2,h3,h4,h5,h6,p{margin:0;padding:0;font-weight:400}
:root{--font-regular:Arial,"Open Sans",sans-serif;--font-size:clamp(1rem,calc(1rem + ((1vw - 0.48rem) * 0.6944)),1.25rem);
--text-color:#333333;--muted:#666666;--link-color:#1616B2;--background-color:#FBFBFB;--link-visited-color:#822998;
--link-hover-color:#424AE0;--line:#dddddd;--card:#ffffff;--accent:#1616B2;
--l1:#d9d9e8;--l2:#b3b3dc;--l3:#7d7dcc;--l4:#4545be;--l5:#1616B2}
html{font-size:var(--font-size);background:var(--background-color)}
body{background:var(--background-color);font-family:var(--font-regular);line-height:1.75;max-width:55ch;padding:1rem;margin:auto;color:var(--text-color)}
body.wide{max-width:75ch}
p{margin-bottom:1rem}
h1,h2,h3,h4{margin:3rem 0 1.38rem;font-family:var(--font-regular);font-weight:400;line-height:1.3}
h1{font-size:2.441rem}h2{font-size:1.953rem}h3{font-size:1.563rem}h4{font-size:1.25rem}
h2::first-letter{text-transform:uppercase}
small,.small{font-size:.8rem}
a{text-underline-offset:2px}a:link{color:var(--link-color)}a:visited{color:var(--link-visited-color)}a:hover{color:var(--link-hover-color)}
hr{margin-top:3rem;margin-left:calc(-1px - ((100vw - 100%)/2) + 1px);margin-right:calc(-1px - ((100vw - 100%)/2) + 1px);border:5px solid #fff}
strong{font-weight:700!important}
footer{margin-top:3rem;text-align:center}
ul li{margin-bottom:.5rem}
mark{margin:0 -.4em;padding:.1em .4em;border-radius:.8em .3em;color:#fff;background:0 0;
background-image:linear-gradient(to right,rgba(0,0,0,.8),rgba(0,0,0,.8) 4%,rgba(0,0,0,.8));
-webkit-box-decoration-break:clone;box-decoration-break:clone}
.logo{text-decoration:none}
.logo .sub{color:var(--text-color);margin-left:.9em;font-size:.9rem}
#navbar ul{list-style-type:none;padding:0;display:flex;flex-wrap:wrap;column-gap:.75rem;row-gap:.25rem;font-size:.9rem}#navbar ul li{margin:0;white-space:nowrap}
#navbar ul li a{text-decoration:none}#navbar ul li a:hover{text-decoration:underline;text-underline-offset:.5em;text-decoration-thickness:3px}
#navbar ul li a[aria-current]{text-decoration:underline;text-underline-offset:.5em;text-decoration-thickness:3px}
label{display:block;font-weight:700;margin-bottom:.25rem}
input[type=email],input[type=text],select,textarea{font:inherit;width:100%;padding:.5rem .6rem;border:2px solid #333;border-radius:4px;background:#fff;color:#333}
textarea{min-height:5rem}
input:focus-visible,select:focus-visible,textarea:focus-visible,button:focus-visible,.level:focus-within{outline:3px solid var(--link-hover-color);outline-offset:2px}
button,.button{font:inherit;display:inline-block;background:#333;color:#fff!important;border:0;border-radius:.8em .3em;padding:.5rem 1.2rem;cursor:pointer;text-decoration:none}
button:hover,.button:hover{background:#000}
.notice{border-left:5px solid #333;background:#fff;padding:.75rem 1rem;margin:1.5rem 0}
.error{border-left-color:#b00020}
fieldset{border:0;padding:0;margin:0 0 1.5rem}
legend{font-weight:700;margin-bottom:.5rem}
.level{display:flex;gap:.75rem;align-items:flex-start;background:var(--card);border:2px solid var(--line);border-radius:6px;padding:.75rem 1rem;margin-bottom:.6rem;cursor:pointer;font-weight:400}
.level:hover{border-color:#999}
.level:has(input:checked){border-color:var(--accent);box-shadow:inset 6px 0 0 var(--accent)}
.level input{margin-top:.45rem;flex:none;accent-color:var(--accent);width:1.1rem;height:1.1rem}
.level .name{font-weight:700}
.level ul{margin:.4rem 0 0;padding-left:1.1rem;font-size:.9rem;color:var(--muted)}
.level ul li{margin-bottom:.2rem}
.level details summary{font-size:.85rem;color:var(--link-color);cursor:pointer;margin-top:.25rem}
.meta{color:var(--muted);font-size:.85rem}
.q{font-size:1.1rem;font-weight:700;margin:1.75rem 0 .25rem}
.q .qn{display:inline-block;min-width:1.6rem;text-align:center;border-radius:50%;border:2px solid #333;font-size:.85rem;line-height:1.4rem;margin-right:.4rem}
.qhelp{color:var(--muted);font-size:.9rem;margin-bottom:.75rem}
.level.compact{padding:.5rem .8rem;margin-bottom:.4rem}
.level.compact input{margin-top:.35rem}
.level .text{display:block;font-size:.9rem;color:var(--muted)}
.choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:.4rem}
.choices .level{margin:0}
.scale{list-style:none;padding:0;margin:.5rem 0}
.scale li{margin-bottom:.35rem}
.howto{background:#fff;border:2px solid var(--line);border-radius:6px;padding:1rem 1.2rem;margin:1.5rem 0}
.howto h3{margin:0 0 .5rem;font-size:1.25rem}
.howto ol{padding-left:1.2rem;margin:.25rem 0 .75rem}
dl.glossary dt{font-weight:700}dl.glossary dd{margin:0 0 .5rem}
.area-lead{margin-bottom:1rem}
.step{display:inline-block;min-width:1.6rem;text-align:center;border-radius:.8em .3em;background:#333;color:#fff;padding:0 .4rem;margin-right:.35rem;font-size:.85rem}
.ladder{list-style:none;padding:0;margin:0}
.ladder li{position:relative;padding:.5rem 0 .5rem 0;border-bottom:1px solid var(--line)}
.ladder li ul{list-style:disc;padding-left:1.2rem;margin:.25rem 0 0;font-size:.9rem;color:var(--muted)}
.result{background:#fff;border:2px solid var(--line);border-radius:6px;padding:1rem;margin-bottom:1rem}
.result h3{margin:0 0 .5rem;font-size:1.25rem}
.meter{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:.5rem 0 .75rem}
.meter span{height:12px;border-radius:2px;background:#e6e6e6}
.meter span.on{background:var(--accent)}
.meter span.target{background:repeating-linear-gradient(45deg,#e6e6e6,#e6e6e6 3px,#9a9ad6 3px,#9a9ad6 6px)}
.bars{margin:.5rem 0 1.5rem}
.bar-row{display:grid;grid-template-columns:7.5rem 1fr 2.5rem;gap:.5rem;align-items:center;font-size:.85rem;margin-bottom:.3rem}
.bar-track{background:#ececec;border-radius:2px;height:1.1rem;overflow:hidden}
.bar-fill{height:100%;background:var(--accent)}
.bar-fill.t{background:#9a9ad6}
.bar-row.wide-label{grid-template-columns:minmax(9rem,16rem) 1fr 2.5rem}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:.75rem;margin:1rem 0}
.kpi{background:#fff;border:2px solid var(--line);border-radius:6px;padding:.75rem}
.kpi b{display:block;font-size:1.6rem;line-height:1.2}
.kpi span{font-size:.8rem;color:var(--muted)}
table{border-collapse:collapse;width:100%;font-size:.9rem}
th,td{text-align:left;padding:6px 8px;vertical-align:top}
tr:nth-child(even){background-color:#f2f2f2}
.comments{font-size:.9rem;padding-left:1.1rem}
.visually-hidden{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:30rem){.bar-row{grid-template-columns:5.5rem 1fr 2rem}h1{font-size:1.9rem}h2{font-size:1.6rem}}
`;

export function layout({ title, body, user = null, current = '', wide = false, robots = '', bodyClass = '', extraCss = '' }) {
  const nav = [
    ['/', 'Start'],
    ['/trappor', 'Mognadstrapporna'],
    ['/om-radighet', 'Om rådighet'],
    ...(user ? [['/skatta', 'Självskattning'], ['/resultat', 'Mitt resultat']] : []),
  ];
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<title>${esc(title)} – Rådighet · NOSAD</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Självskattningsverktyg för digital rådighet i offentlig sektor – från beroende till öppen källkod.">
${robots ? `<meta name="robots" content="${esc(robots)}">` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${CSS}${extraCss}</style>
</head>
<body${bodyClass || wide ? ` class="${bodyClass || 'wide'}"` : ''}>
<header>
  <a class="logo" href="/"><mark>NOSAD</mark><span class="sub">Rådighet</span></a>
  <nav id="navbar" style="margin-top:1rem" aria-label="Huvudmeny">
    <ul>
      ${nav
        .map(
          ([href, text]) =>
            `<li><a href="${href}"${current === href ? ' aria-current="page"' : ''}>${esc(text)}</a></li>`,
        )
        .join('\n      ')}
    </ul>
  </nav>
  ${user ? `<p class="meta">Inloggad som ${esc(user.email)} · <a href="/logga-ut">Logga ut</a></p>` : ''}
</header>
<main>
${body}
</main>
<hr>
<footer>
  <section>
    <p class="small">Mognadstrapporna bygger på <a href="https://radig.codeberg.page/radig/">Rådig – från beroende till rådighet</a> (CC BY 4.0).</p>
    <p class="small">Ett verktyg i <a href="https://nosad.se/">NOSAD</a> – Nätverk för samverkan kring öppna data och öppen källkod. Källkoden är öppen.</p>
  </section>
</footer>
</body>
</html>`;
}

export function startPage({ user, error = '', email = '' }) {
  const form = user
    ? `<p><a class="button" href="/skatta">Fortsätt till självskattningen</a></p>`
    : `<form method="post" action="/start" novalidate>
  ${error ? `<div class="notice error" role="alert">${esc(error)}</div>` : ''}
  <label for="email">Din e-postadress</label>
  <p class="meta" id="email-hint" style="margin-bottom:.4rem">E-postadressen används endast för att särskilja olika respondenter (och så att du kan återkomma och uppdatera din skattning). Alla resultat anonymiseras när de presenteras – din e-postadress visas aldrig.</p>
  <input type="email" id="email" name="email" autocomplete="email" required maxlength="254" value="${esc(email)}" aria-describedby="email-hint"${error ? ' aria-invalid="true"' : ''}>
  <p style="margin-top:1rem"><button type="submit">Starta självskattningen</button></p>
</form>`;
  return `<hr>
<h2>Hur rådig är din organisation?</h2>
<p>Kan ni fortsätta fungera i morgon om leverantören stänger av, höjer priset eller tvingas lyda ett annat lands lag? Det här verktyget hjälper dig att skatta var din organisation står i dag – och vart ni vill.</p>
<p>Du skattar fyra områden på en trappa i fem steg, från <strong>beroende</strong> (t.ex. drift i Azure eller på egna Microsoft-servrar med MSSQL) till <strong>rådig</strong> (öppen källkod i egen eller samverkansdrift):</p>
<ul>
${AREAS.map((a) => `  <li>${esc(a.title)}</li>`).join('\n')}
</ul>
<p>Det tar ungefär fem minuter. <a href="/trappor">Läs mognadstrapporna</a> först om du vill.</p>
<h2>Kom igång</h2>
${form}`;
}

// Allmän, enkel beskrivning av stegen – gäller alla områden.
const LEVEL_PLAIN = {
  1: 'Vi är helt beroende av en leverantör och vet inte hur vi skulle byta.',
  2: 'Fortfarande beroende, men vi vet hur beroendet ser ut och har säkrat vår data och en exitväg.',
  3: 'Vi ställer krav som leverantören uppfyller: drift i Sverige/EU, inloggning via egen plattform, öppna gränssnitt.',
  4: 'Vi använder öppen källkod med support, i egen drift eller hos svensk/europeisk leverantör.',
  5: 'Allt är öppen källkod, vi förvaltar tillsammans med andra och har övat att byta.',
};

const GLOSSARY = [
  ['Hyperscaler', 'De globala molnjättarna, t.ex. Microsoft Azure, Amazon AWS och Google Cloud.'],
  ['Tredjelandskontroll', 'Leverantören ägs eller styrs från ett land utanför EU/EES och kan tvingas lämna ut data enligt det landets lag (t.ex. amerikanska CLOUD Act).'],
  ['Exitplan / exitväg', 'En dokumenterad plan för hur ni byter lösning och får med er all data – helst testad.'],
  ['IdP, SSO', 'Identitetsleverantör (Identity Provider) – tjänsten som sköter inloggningen. SSO (Single Sign-On) betyder att man loggar in en gång för alla system.'],
  ['Öppen källkod', 'Programvara vars källkod är fri att använda, granska, ändra och dela. Vem som helst kan drifta och vidareutveckla den.'],
  ['Öppna format och API:er', 'Dokumenterade sätt att lagra och hämta data (t.ex. ODF, PDF/A, CSV) som inte kräver en viss leverantörs program.'],
];

function levelOption(area, level, checked) {
  const l = area.levels[level];
  const id = `${area.id}-${level}`;
  return `<label class="level" for="${id}">
    <input type="radio" id="${id}" name="${area.id}_current" value="${level}"${checked ? ' checked' : ''}>
    <span>
      <span class="name"><span class="step">${level}</span>${esc(LEVEL_NAMES[level])}</span><br>
      ${esc(l.summary)}
      <details><summary>Vad kännetecknar steget?</summary>
        <ul>${l.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      </details>
    </span>
  </label>`;
}

function strategyOption(area, s, checked) {
  const id = `${area.id}-s-${s?.id ?? 'ingen'}`;
  return `<label class="level compact" for="${id}">
      <input type="radio" id="${id}" name="${area.id}_strategy" value="${esc(s?.id ?? '')}"${checked ? ' checked' : ''}>
      <span><span class="name">${esc(s?.title ?? 'Ingen uttalad strategi / vet inte')}</span>
      <span class="text">${esc(s?.text ?? 'Det finns inget beslut, eller så känner jag inte till det.')}</span></span>
    </label>`;
}

function challengeOption(area, c, checked) {
  const id = `${area.id}-c-${c.id}`;
  return `<label class="level compact" for="${id}">
      <input type="checkbox" id="${id}" name="${area.id}_challenges" value="${c.id}"${checked ? ' checked' : ''}>
      <span><span class="name">${esc(c.title)}</span><span class="text">${esc(c.text)}</span></span>
    </label>`;
}

export function assessPage({ user, previous, error = '' }) {
  const prev = previous?.byArea ?? {};
  const sections = AREAS.map((area, i) => {
    const p = prev[area.id] ?? {};
    const chosen = new Set(p.challenges ?? []);
    return `<section aria-labelledby="h-${area.id}">
  <p class="meta" style="margin:0">Område ${i + 1} av ${AREAS.length}</p>
  <h2 id="h-${area.id}" style="margin-top:.25rem">${esc(area.title)}</h2>
  <p class="area-lead">${esc(area.lead)}</p>
  <fieldset>
    <legend class="q"><span class="qn">1</span>Var står ni i dag?</legend>
    <p class="qhelp">Välj det steg som bäst beskriver nuläget. Stämmer bara delar av ett steg – välj steget under.</p>
    ${LEVELS.map((lvl) => levelOption(area, lvl, p.current_level === lvl)).join('\n    ')}
    <label class="level" for="${area.id}-0">
      <input type="radio" id="${area.id}-0" name="${area.id}_current" value=""${previous && p.current_level == null ? ' checked' : ''}>
      <span><span class="name">Vet inte</span><br>Jag kan inte bedöma området.</span>
    </label>
  </fieldset>
  <fieldset>
    <legend class="q"><span class="qn">2</span>Hur ser er strategi ut för de kommande två åren?</legend>
    <p class="qhelp">Välj det som bäst beskriver vad ni har beslutat eller planerar för området – inte vad du personligen önskar.</p>
    ${STRATEGIES.map((st) => strategyOption(area, st, p.strategy === st.id)).join('\n    ')}
    ${strategyOption(area, null, previous && !p.strategy)}
  </fieldset>
  <fieldset>
    <legend class="q"><span class="qn">3</span>Vad ser ni som de största utmaningarna att nå full rådighet?</legend>
    <p class="qhelp">Välj <strong>upp till ${MAX_CHALLENGES}</strong> alternativ – de som väger tyngst för området.</p>
    <div class="choices">
    ${CHALLENGES.map((c) => challengeOption(area, c, chosen.has(c.id))).join('\n    ')}
    </div>
  </fieldset>
  <label class="q" for="${area.id}-comment"><span class="qn">4</span>Kommentar <span class="meta" style="font-weight:400">(valfri)</span></label>
  <p class="qhelp">T.ex. vilka system det gäller, andra hinder eller planer.</p>
  <textarea id="${area.id}-comment" name="${area.id}_comment" maxlength="2000">${esc(p.comment ?? '')}</textarea>
  <p class="meta">Undvik personuppgifter i kommentaren. Kommentarer kan visas i den anonymiserade sammanställningen.</p>
</section>`;
  }).join('\n<hr>\n');

  return `<hr>
<h2>Självskattning</h2>
${error ? `<div class="notice error" role="alert">${esc(error)}</div>` : ''}
<div class="howto">
  <h3>Så går det till</h3>
  <p style="margin-bottom:.5rem">Du går igenom ${AREAS.length} områden. För varje område svarar du på:</p>
  <ol>
    <li><strong>Nuläge</strong> – var ni står i dag på en trappa i fem steg.</li>
    <li><strong>Strategi</strong> – vad ni planerar för de kommande två åren.</li>
    <li><strong>Utmaningar</strong> – upp till ${MAX_CHALLENGES} saker som gör det svårt att nå full rådighet.</li>
    <li><strong>Kommentar</strong> – frivilligt.</li>
  </ol>
  <p style="margin-bottom:.5rem">Stegen betyder i korthet:</p>
  <ul class="scale">
    ${LEVELS.map((l) => `<li><span class="step">${l}</span><strong>${esc(LEVEL_NAMES[l])}:</strong> ${esc(LEVEL_PLAIN[l])}</li>`).join('\n    ')}
  </ul>
  <p class="meta" style="margin-bottom:.5rem">Du kan hoppa över frågor och områden du inte känner till – "Vet inte" är ett bra svar. Det tar ungefär tio minuter.${
    previous ? ' Formuläret är förifyllt med din senaste skattning; varje inskick sparas som en ny version.' : ''
  }</p>
  <details><summary>Ordlista</summary>
    <dl class="glossary">
      ${GLOSSARY.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('\n      ')}
    </dl>
  </details>
</div>
<form method="post" action="/skatta">
${sections}
<hr>
<p><button type="submit">Spara och visa resultat</button></p>
</form>`;
}

function meter(current, target) {
  return `<div class="meter" aria-hidden="true">${LEVELS.map((l) => {
    const cls = current && l <= current ? 'on' : target && l <= target ? 'target' : '';
    return `<span class="${cls}"></span>`;
  }).join('')}</div>`;
}

export function resultPage({ user, latest, saved }) {
  if (!latest) {
    return `<hr><h2>Mitt resultat</h2><p>Du har inte gjort någon självskattning än.</p><p><a class="button" href="/skatta">Gör självskattningen</a></p>`;
  }
  const cards = AREAS.map((area) => {
    const a = latest.byArea[area.id] ?? {};
    const cur = a.current_level ?? null;
    const tgt = a.target_level ?? null;
    const next = cur ? (cur < 5 ? cur + 1 : null) : 1;
    const nextBlock = next
      ? `<p style="margin:.5rem 0 .25rem"><strong>Nästa steg – ${next}. ${esc(LEVEL_NAMES[next])}:</strong> ${esc(
          area.levels[next].summary,
        )}</p>
         <ul class="small">${area.levels[next].details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
      : `<p style="margin:.5rem 0 0">Ni är på högsta steget. Dela gärna era erfarenheter i nätverket!</p>`;
    return `<div class="result">
  <h3>${esc(area.title)}</h3>
  ${meter(cur, tgt)}
  <p style="margin:0">I dag: <strong>${cur ? `${cur} – ${esc(LEVEL_NAMES[cur])}` : 'Vet inte'}</strong></p>
  <p style="margin:0">Strategi: <strong>${esc(strategyById(a.strategy)?.title ?? 'Ingen uttalad strategi')}</strong>${
    tgt ? ` <span class="meta">(leder ungefär till steg ${tgt} – ${esc(LEVEL_NAMES[tgt])})</span>` : ''
  }</p>
  ${
    a.challenges?.length
      ? `<p style="margin:0">Största utmaningar: ${a.challenges.map((c) => esc(challengeById(c)?.title)).join(', ')}</p>`
      : ''
  }
  ${nextBlock}
</div>`;
  }).join('\n');

  const date = new Date(latest.createdAt).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });
  return `<hr>
<h2>Mitt resultat</h2>
${saved ? '<div class="notice" role="status">Tack! Din självskattning är sparad.</div>' : ''}
<p class="meta">Senast sparad ${esc(date)}. Mörka fält visar nuläget, randiga fält vart er strategi ungefär leder.</p>
${cards}
<h3>Så kommer ni vidare</h3>
<p>Rådig föreslår en ordning: <strong>stoppa inflödet</strong> av nya beroenden först, ta <strong>det osynliga före det synliga</strong>, bygg <strong>identiteten före allt som hänger på den</strong>, använd <strong>webbläsaren som brygga</strong> och byt klienten sist. Läs mer i <a href="https://radig.codeberg.page/radig/analys/07-principer/">Rådigs sju principer</a> och <a href="https://radig.codeberg.page/radig/mallar/kravkatalog-verksamhetssystem/">kravkatalogen för verksamhetssystem</a>.</p>
<p><a class="button" href="/skatta">Uppdatera min skattning</a></p>`;
}

export function laddersPage() {
  return `<hr>
<h2>Mognadstrapporna</h2>
<p>Varje område skattas i fem steg. De lägsta stegen beskriver ett starkt beroende av en enskild leverantör – t.ex. drift i Azure eller på egna Microsoft-servrar med MSSQL. De högsta beskriver full rådighet: öppen källkod, öppna standarder och drift som organisationen själv – eller tillsammans med andra – kontrollerar.</p>
<p>Stegen är generella: <strong>1 Beroende</strong> → <strong>2 Medveten</strong> (kartlagt och data säkrad) → <strong>3 Kravställd</strong> (EU-drift, egen IdP, öppna gränssnitt) → <strong>4 Öppen</strong> (öppen källkod med support) → <strong>5 Rådig</strong> (öppen källkod i hela stacken, samförvaltad).</p>
<p class="meta">Produktnamnen är exempel att utvärdera, inte rekommendationer att upphandla. Kontrollera alltid juridisk kontroll, ägarförhållanden och licens.</p>
${AREAS.map(
  (area) => `<h3 id="${area.id}">${esc(area.title)}</h3>
<p>${esc(area.lead)} <span class="meta">(${esc(area.radigLayer)})</span></p>
<ol class="ladder">
${LEVELS.map(
  (lvl) => `  <li><span class="step">${lvl}</span><strong>${esc(LEVEL_NAMES[lvl])}.</strong> ${esc(area.levels[lvl].summary)}
    <ul>${area.levels[lvl].details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></li>`,
).join('\n')}
</ol>`,
).join('\n')}`;
}

function bars(dist, total, cls = '') {
  return `<div class="bars">${LEVELS.map((l) => {
    const n = dist[l] ?? 0;
    const pct = total ? Math.round((n / total) * 100) : 0;
    return `<div class="bar-row"><span>${l} ${esc(LEVEL_NAMES[l])}</span><span class="bar-track"><span class="bar-fill ${cls}" style="display:block;width:${pct}%"></span></span><span>${n}</span></div>`;
  }).join('')}</div>`;
}

// Staplar för frågor med namngivna alternativ; andelen räknas på antal svarande.
function countBars(options, counts, respondents, cls = '') {
  return `<div class="bars">${options
    .map((o) => {
      const n = counts[o.id] ?? 0;
      const pct = respondents ? Math.round((n / respondents) * 100) : 0;
      return `<div class="bar-row wide-label"><span>${esc(o.title)}</span><span class="bar-track"><span class="bar-fill ${cls}" style="display:block;width:${pct}%"></span></span><span>${n}</span></div>`;
    })
    .join('')}</div>`;
}

const sortedChallenges = (counts) => [...CHALLENGES].sort((x, y) => (counts[y.id] ?? 0) - (counts[x.id] ?? 0));

const fmt = (x) => (x == null ? '–' : x.toFixed(1).replace('.', ','));

export function adminPage({ summary, minGroup }) {
  const { totals, areas, challengeTotals, perMonth } = summary;
  const kpis = `<div class="kpis">
  <div class="kpi"><b>${totals.answered}</b><span>har skattat</span></div>
  <div class="kpi"><b>${totals.registered}</b><span>har registrerat sig</span></div>
  <div class="kpi"><b>${totals.submissions}</b><span>inskick totalt</span></div>
  <div class="kpi"><b>${totals.organisations}</b><span>e-postdomäner</span></div>
</div>`;

  if (totals.answered < minGroup) {
    return `<hr><h2>Sammanställning</h2>${kpis}
<div class="notice">För att skydda respondenternas anonymitet visas fördelningar först när minst ${minGroup} personer har skattat.</div>`;
  }

  const overview = `<table>
<thead><tr><th>Område</th><th>Snitt i dag</th><th>Snitt enligt strategi</th><th>Svar</th><th>Vet ej</th></tr></thead>
<tbody>
${AREAS.map((area) => {
  const a = areas[area.id];
  return `<tr><td><a href="#a-${area.id}">${esc(area.title)}</a></td><td>${fmt(a.avgCurrent)}</td><td>${fmt(a.avgTarget)}</td><td>${a.nCurrent}</td><td>${a.nUnknown}</td></tr>`;
}).join('\n')}
</tbody></table>`;

  const details = AREAS.map((area) => {
    const a = areas[area.id];
    return `<h3 id="a-${area.id}">${esc(area.title)}</h3>
<p class="meta">Snitt i dag ${fmt(a.avgCurrent)} · snitt enligt strategi ${fmt(a.avgTarget)} · ${a.nCurrent} svar med nivå, ${a.nUnknown} vet ej</p>
<h4 style="margin:1rem 0 .25rem">Nuläge</h4>
${bars(a.current, a.nCurrent)}
<h4 style="margin:1rem 0 .25rem">Strategi för de kommande två åren</h4>
${countBars(STRATEGIES, a.strategies, a.nStrategy, 't')}
<h4 style="margin:1rem 0 .25rem">Största utmaningar <span class="meta">(${a.nChallenges} har svarat, upp till ${MAX_CHALLENGES} val var)</span></h4>
${countBars(sortedChallenges(a.challenges), a.challenges, a.nChallenges)}
${
  a.comments.length
    ? `<details><summary>Kommentarer (${a.comments.length}, slumpad ordning)</summary><ul class="comments">${a.comments
        .map((c) => `<li>${esc(c)}</li>`)
        .join('')}</ul></details>`
    : ''
}`;
  }).join('\n');

  const challengeRespondents = Math.max(0, ...AREAS.map((area) => areas[area.id].nChallenges));
  const challengeOverview = `<h3>Största utmaningarna – alla områden</h3>
<p class="meta">Antal gånger varje utmaning valts, summerat över alla områden.</p>
${countBars(sortedChallenges(challengeTotals), challengeTotals, Math.max(1, ...Object.values(challengeTotals)))}`;

  const months = perMonth.length
    ? `<h3>Inskick per månad</h3><table><thead><tr><th>Månad</th><th>Inskick</th></tr></thead><tbody>${perMonth
        .map((m) => `<tr><td>${esc(m.month)}</td><td>${m.n}</td></tr>`)
        .join('')}</tbody></table>`
    : '';

  return `<hr>
<h2>Sammanställning</h2>
<p class="meta">Anonymiserad: bygger på varje respondents senaste skattning. E-postadresser visas aldrig. Kommentarer visas utan koppling till person.</p>
${kpis}
${overview}
${challengeRespondents ? challengeOverview : ''}
${details}
${months}`;
}

export function notFoundPage() {
  return `<hr><h2>Sidan finns inte</h2><p><a href="/">Till startsidan</a></p>`;
}
