// Sidan »Om rådighet« – en presentation i bildformat (c:a 10 minuter).
// Innehållet bygger på Rådig – från beroende till rådighet (utgåva 2026.09,
// CC BY 4.0) och EU-kommissionens Cloud Sovereignty Framework (SEAL-nivåer).
// Ingen JavaScript: navigering sker med ankarlänkar, bilderna skalar med
// containerfrågor och varje bild blir en egen sida vid utskrift.

import { esc } from './views.js';

const RADIG = 'https://radig.codeberg.page/radig/';

export const DECK_CSS = `
body.deck{max-width:1100px}
html:has(body.deck){scroll-snap-type:y proximity;scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html:has(body.deck){scroll-behavior:auto}}
.deck-intro{margin:2rem 0 1rem}
.deck-toc{font-size:.85rem;columns:2 16rem;padding-left:1.2rem;margin:0 0 2rem}
.deck-toc li{margin-bottom:.15rem}
.slide-wrap{scroll-snap-align:start;scroll-margin-top:.5rem;margin:0 0 2.5rem}
.slide{container-type:inline-size;position:relative;aspect-ratio:16/9;background:#fff;border:1px solid var(--line);
border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.07);overflow:hidden;color:#333}
.slide .in{position:absolute;inset:0;padding:4.5cqi 5.5cqi 6.5cqi;display:flex;flex-direction:column;font-size:1.75cqi;line-height:1.45}
.slide p{margin:0 0 .8em}
.slide .kicker{font-size:.8em;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:.4em}
.slide h2,.slide h3{margin:0 0 .7em;line-height:1.15}
.slide h2{font-size:3.6cqi}
.slide h2::first-letter{text-transform:none}
.slide h3{font-size:1.15em;font-weight:700;margin:0 0 .3em}
.slide ul,.slide ol{margin:0;padding-left:1.2em}
.slide li{margin-bottom:.35em}
.slide .grow{flex:1;min-height:0}
.slide .foot{position:absolute;left:5.5cqi;right:5.5cqi;bottom:2cqi;display:flex;justify-content:space-between;align-items:center;font-size:1.25cqi;color:var(--muted)}
.slide .foot a{text-decoration:none;padding:0 .4em}
.slide .foot .pager a[aria-disabled]{visibility:hidden}
.slide .brand mark{font-size:1em;margin-right:.6em}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:3cqi}
.cols3{display:grid;grid-template-columns:repeat(3,1fr);gap:2cqi}
.cols4{display:grid;grid-template-columns:repeat(4,1fr);gap:1.6cqi}
.card{background:#f6f6fb;border-radius:.5em;padding:.9em 1em;border-top:.35em solid var(--accent)}
.card.soft{border-top-color:var(--l3)}
.card.warn{border-top-color:#b00020;background:#fdf3f4}
.card p:last-child,.card ul:last-child{margin-bottom:0}
.card .n{display:inline-block;min-width:1.7em;text-align:center;border-radius:.8em .3em;background:#333;color:#fff;font-weight:700;margin-right:.4em}
.small-s{font-size:.82em}
.muted{color:var(--muted)}
.title-slide .in{justify-content:center;background:linear-gradient(135deg,#fff 55%,#eef 100%)}
.title-slide h2{font-size:7cqi;margin-bottom:.3em}
.title-slide .lead{font-size:2.3cqi;max-width:42em}
.big-quote{font-size:3cqi;line-height:1.3;border-left:.25em solid var(--accent);padding-left:.8em;margin:0 0 1em}
.statement{font-size:3.4cqi;line-height:1.25;margin:0 0 1em}
.statement mark{margin:0;line-height:1.5}
.kpi-s{background:#fff;border:.12em solid var(--line);border-radius:.5em;padding:.7em .9em}
.kpi-s b{display:block;font-size:2.4em;line-height:1.1;color:var(--accent)}
.stack{display:grid;grid-template-columns:auto 1fr 1.25fr auto;font-size:.82em;border-radius:.5em;overflow:hidden;border:1px solid var(--line)}
.stack>div{padding:.32em .7em;border-bottom:1px solid var(--line);background:#fff}
.stack>.h{background:#333;color:#fff;font-weight:700}
.stack>.hub{background:#eef;font-weight:700}
.stack>.hz{color:var(--muted);background:#fafafa}
.stack .ph{text-align:center;white-space:nowrap}
.flow{display:flex;gap:.6cqi;align-items:stretch;margin:0 0 1.4em}
.flow>div{flex:1;background:var(--accent);color:#fff;padding:.8em .9em;font-weight:700;position:relative;clip-path:polygon(0 0,calc(100% - .8em) 0,100% 50%,calc(100% - .8em) 100%,0 100%,.8em 50%)}
.flow>div:first-child{clip-path:polygon(0 0,calc(100% - .8em) 0,100% 50%,calc(100% - .8em) 100%,0 100%)}
.flow>div span{display:block;font-size:.75em;opacity:.8;font-weight:400}
.flow>div:nth-child(1){background:var(--l5)}.flow>div:nth-child(2){background:#2a2ab8}.flow>div:nth-child(3){background:var(--l4)}
.flow>div:nth-child(4){background:#5c5cc4}.flow>div:nth-child(5){background:var(--l3)}.flow>div:nth-child(6){background:#9494d4;color:#222}
.pat{display:grid;grid-template-rows:auto auto 1fr}
.pat .prob{font-size:.85em;color:#8a1020;margin-bottom:.5em}
.pat .prob b,.pat .sol b{font-weight:700}
.seal{display:grid;grid-template-columns:repeat(5,1fr);gap:.5cqi;margin-bottom:1.2em}
.seal>div{border-radius:.4em;padding:.7em .7em .8em;font-size:.85em;background:#f3f3f8}
.seal>div b{display:block;font-size:1.35em;margin-bottom:.15em}
.seal .lvl{display:block;font-size:.8em;font-weight:700;margin-bottom:.35em}
.seal>div:nth-child(1){border-top:.45em solid #b00020}
.seal>div:nth-child(2){border-top:.45em solid #e07b00}
.seal>div:nth-child(3){border-top:.45em solid #d4b100}
.seal>div:nth-child(4){border-top:.45em solid var(--accent);background:#eef}
.seal>div:nth-child(5){border-top:.45em solid #333}
.seal .tag{display:inline-block;background:var(--accent);color:#fff;border-radius:.8em .3em;padding:0 .5em;font-size:.8em;font-weight:700;margin-top:.4em}
.seal .tag.hz{background:#777}
.sov{display:grid;grid-template-columns:repeat(4,1fr);gap:.5em;font-size:.82em;margin:0 0 1em}
.sov>div{background:#f6f6fb;border-radius:.4em;padding:.45em .6em}
.sov b{color:var(--accent)}
.steps{counter-reset:s;list-style:none;padding:0!important}
.steps li{counter-increment:s;position:relative;padding-left:2.2em;margin-bottom:.8em}
.steps li::before{content:counter(s);position:absolute;left:0;top:0;width:1.6em;text-align:center;border-radius:.8em .3em;background:#333;color:#fff;font-weight:700}
.notes{margin:.6rem 0 0;font-size:.9rem;max-width:75ch}
.notes summary{cursor:pointer;color:var(--link-color)}
.notes p{margin:.5rem 0 0}
@media (max-width:44rem){
  .slide{aspect-ratio:auto}
  .slide .in{position:static;padding:1.25rem 1rem 3rem;font-size:.95rem}
  .slide h2{font-size:1.5rem}.title-slide h2{font-size:2.2rem}.title-slide .lead{font-size:1.05rem}
  .big-quote,.statement{font-size:1.2rem}
  .slide .foot{font-size:.75rem;left:1rem;right:1rem;bottom:.6rem}
  .cols,.cols3,.cols4,.seal,.sov{grid-template-columns:1fr}
  .flow{flex-direction:column}.flow>div,.flow>div:first-child{clip-path:none;border-radius:.3em}
  .stack{grid-template-columns:auto 1fr auto}.stack .alt{display:none}
}
@media print{
  @page{size:A4 landscape;margin:0}
  header,footer,hr,.deck-intro,.deck-toc,.notes,.slide .foot .pager{display:none!important}
  body.deck{max-width:none;padding:0;background:#fff}
  .slide-wrap{margin:0;break-after:page;break-inside:avoid}
  .slide{border:0;box-shadow:none;border-radius:0;width:100vw;max-height:100vh}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
`;

// Varje bild: rubrik (för innehållsförteckningen), html och talarmanus.
const SLIDES = [
  {
    toc: 'Om rådighet',
    cls: 'title-slide',
    html: `
<p class="kicker">NOSAD · Rådighet</p>
<h2>Om rådighet</h2>
<p class="lead">Från beroende till rådighet – målbild, principer, lösningsmönster och hur rådighet kan bedömas.</p>
<p class="small-s muted">Bygger på <a href="${RADIG}">Rådig – från beroende till rådighet</a> (utgåva 2026.09, Föreningen Sambruk m.fl., CC&nbsp;BY&nbsp;4.0) och EU-kommissionens Cloud Sovereignty Framework.</p>`,
    notes: [
      'Välkomna. Det här är en kort dragning, ungefär tio minuter, om vad digital rådighet är och hur vi kan arbeta mot den.',
      'Vi går igenom fyra saker: målbilden, principerna som styr ordningen, lösningsmönster som återkommer och till sist hur man kan bedöma rådighet – med EU:s SEAL-nivåer som skala.',
    ],
  },
  {
    toc: 'Vad är rådighet?',
    html: `
<p class="kicker">Utgångspunkt</p>
<h2>Vad är rådighet?</h2>
<p class="big-quote">»Kan vi fortsätta fungera i morgon om leverantören stänger av, höjer priset eller tvingas lyda ett annat lands lag?«</p>
<div class="cols3 grow">
  <div class="card warn"><h3>Avstängning</h3><p>ICC i Haag 2025: chefsåklagaren förlorade sin Microsoft-hostade e-post efter amerikanska sanktioner.</p></div>
  <div class="card warn"><h3>Pris</h3><p>Västra Götalandsregionens nya Microsoftavtal: +43,5&nbsp;% första året.</p></div>
  <div class="card warn"><h3>Lag</h3><p>CLOUD Act och FISA 702 gäller amerikanska leverantörer – även när datan ligger i EU.</p></div>
</div>
<p class="small-s"><strong>Rådighet</strong> betyder att själv råda över något. <strong>Oberoende är kontroll – inte renhet.</strong></p>`,
    notes: [
      'Ordet rådighet betyder helt enkelt att själv råda över något. Rådig formulerar det som en testfråga: kan vi fortsätta fungera i morgon om leverantören stänger av, höjer priset eller tvingas lyda ett annat lands lag?',
      'Det här är inte teoretiskt. ICC:s chefsåklagare förlorade sin e-post efter sanktioner. VGR fick en prisökning på 43,5 procent vid förnyelsen. Och amerikansk lag följer med leverantören, inte med datacentret.',
      'Poängen: oberoende handlar om kontroll, inte om renhet. Vi ska inte bli av med alla beroenden – vi ska kunna hantera dem.',
    ],
  },
  {
    toc: 'Målbild',
    html: `
<p class="kicker">Målbild</p>
<h2>Inget enskilt beroende ska kunna stoppa verksamheten</h2>
<p class="statement">Målet är inte noll beroende – utan att <strong>inget enskilt beroende kan stoppa verksamheten.</strong></p>
<div class="cols4 grow">
  <div class="kpi-s"><b>Nivå 3</b>Europeisk kontroll för mjukvara och moln – målnivån.</div>
  <div class="kpi-s"><b>~5 år</b>Nåbart för nästan hela mjukvaru- och molnstacken.</div>
  <div class="kpi-s"><b>Horisont</b>Hårdvara, mobil-OS och webbläsarmotor – hanteras som dokumenterade undantag.</div>
  <div class="kpi-s"><b>Tillsammans</b>Ingen organisation bör bygga identitetsplattform, samarbetssvit och kravkatalog ensam.</div>
</div>`,
    notes: [
      'Målbilden i en mening: inget enskilt beroende ska kunna stoppa verksamheten.',
      'Konkret siktar Rådig på nivå 3 – europeisk kontroll – för mjukvara och moln. Det betyder att leverantören inte kontrolleras från tredjeland: en europeisk leverantör eller egen drift. Det bedöms nåbart inom ungefär fem år.',
      'Allt går inte. Processorer, mobiloperativsystem och webbläsarmotorer saknar europeiska alternativ – de är horisont och hanteras som dokumenterade undantag.',
      'Och det viktigaste: gör det tillsammans. Ingen kommun eller myndighet ska behöva bygga allt själv.',
    ],
  },
  {
    toc: 'Målbilden lager för lager',
    html: `
<p class="kicker">Målbild · referensarkitektur</p>
<h2>Åtta lager – och var beroendet sitter</h2>
<div class="stack grow" role="table" aria-label="Lager, beroende i dag, målbild och fas">
  <div class="h" role="columnheader">Lager</div><div class="h" role="columnheader">I dag</div><div class="h alt" role="columnheader">Målbild – europeiskt/öppet</div><div class="h ph" role="columnheader">Fas</div>
  <div>7 Verksamhetssystem &amp; data</div><div>SQL Server, Power BI, SaaS på Azure/AWS</div><div class="alt">PostgreSQL, Superset, krav vid varje avtalsslut</div><div class="ph">5 löpande</div>
  <div>6 Utveckling, integration &amp; AI</div><div>GitHub, Power Platform, Copilot</div><div class="alt">Forgejo/GitLab, Frends, Eneo, Mistral</div><div class="ph">1 &amp; 5</div>
  <div>5 Digital arbetsplats</div><div>Microsoft 365, Google Workspace</div><div class="alt">Collabora, Open-Xchange, Nextcloud, Element – openDesk</div><div class="ph">3</div>
  <div>4 Klienter &amp; enheter</div><div>Windows, Intune, ChromeOS</div><div class="alt">Linux med opsi, Relution</div><div class="ph">4</div>
  <div class="hub">3 Identitet &amp; katalog – navet</div><div class="hub">AD, Entra ID – kritisk risk</div><div class="hub alt">Univention Nubus + Keycloak, privacyIDEA</div><div class="hub ph">2</div>
  <div>2 Plattform &amp; drift</div><div>Azure, AWS, Google Cloud</div><div class="alt">Svenska/EU-moln, Proxmox, OpenStack</div><div class="ph">1</div>
  <div>1 Nät &amp; grundtjänster</div><div>Cloudflare, Route 53, Google Fonts</div><div class="alt">deSEC, Bunny.net, Matomo, OSM</div><div class="ph">1</div>
  <div class="hz">0 Hårdvara</div><div class="hz">Intel/AMD, Nvidia</div><div class="hz alt">Horisont</div><div class="hz ph">–</div>
</div>`,
    notes: [
      'Rådig delar upp it-miljön i åtta lager, från hårdvara längst ner till verksamhetssystem och data högst upp.',
      'Microsoft finns i alla lager utom hårdvaran. Men risken är inte jämnt fördelad: identitet och katalog är det enda lagret med kritisk risk. Stängs inloggningen av, stannar allt samtidigt – e-post, verksamhetssystem och datorn.',
      'Kolumnen till höger visar målbilden: för varje lager utom hårdvaran finns beprövade europeiska eller öppna alternativ. Fasen anger i vilken ordning lagret tas – och den ordningen kommer från principerna.',
    ],
  },
  {
    toc: 'Sju principer',
    html: `
<p class="kicker">Principer</p>
<h2>Sju principer som styr ordningen</h2>
<div class="cols4 grow small-s">
  <div class="card"><h3><span class="n">1</span>Stoppa inflödet först</h3><p>Inga nya beroenden medan de gamla byggs bort. Krav från dag ett.</p></div>
  <div class="card"><h3><span class="n">2</span>Osynligt före synligt</h3><p>Drift, nät, databaser och kodhosting byts utan att medarbetarna märker det.</p></div>
  <div class="card"><h3><span class="n">3</span>Identiteten före allt</h3><p>Bygg det egna navet innan något annat kopplas in.</p></div>
  <div class="card"><h3><span class="n">4</span>Webbläsaren som brygga</h3><p>När allt körs i webbläsaren blir operativsystemet utbytbart.</p></div>
  <div class="card"><h3><span class="n">5</span>Öppna format före nya verktyg</h3><p>ODF, PDF/A och öppna protokoll gör varje byte reversibelt.</p></div>
  <div class="card"><h3><span class="n">6</span>Pilot → mät → skala</h3><p>Förvaltning för förvaltning – aldrig big bang.</p></div>
  <div class="card"><h3><span class="n">7</span>Bygg exitvägen i förväg</h3><p>Dataportabilitet, exportformat, avtalsvillkor och en plan B per kritisk tjänst.</p></div>
  <div class="card warn"><h3>Vanligaste misstaget</h3><p>Att börja med Office. Då sitter Entra, Exchange och Windows kvar – och beroendet minskar inte.</p></div>
</div>`,
    notes: [
      'Sju principer, hämtade ur de europeiska migrationsfallen, styr ordningen.',
      'Först: stoppa inflödet. Varje nytt system som kopplas till Entra ökar skulden. Sedan det osynliga före det synliga – det ger snabbast riskminskning med lägst friktion.',
      'Identiteten före allt som hänger på den. Webbläsaren som brygga, så att klienten kan bytas sist. Öppna format gör varje byte reversibelt.',
      'Pilot, mät, skala – München och Kiel visar vad big bang leder till. Och bygg exitvägen innan du behöver den.',
      'Det vanligaste misstaget är att börja med Office. Det syns mest, men minskar inte beroendet.',
    ],
  },
  {
    toc: 'Ordningen – färdplanen',
    html: `
<p class="kicker">Principerna i praktiken</p>
<h2>Ordningen: sex faser över fem år</h2>
<div class="flow">
  <div>Fas 0<span>Styrning &amp; kartläggning · 0–6 mån</span></div>
  <div>Fas 1<span>Grunden under huven · 6–18 mån</span></div>
  <div>Fas 2<span>Identitet &amp; katalog · 12–24 mån</span></div>
  <div>Fas 3<span>Samarbetsplattformen · 18–36 mån</span></div>
  <div>Fas 4<span>Klienten · 30–48 mån</span></div>
  <div>Fas 5<span>Verksamhetssystem, data &amp; AI · löpande</span></div>
</div>
<div class="cols grow">
  <div><h3>Ordningen i fem meningar</h3><ol><li>Börja under huven.</li><li>Bygg identiteten.</li><li>Flytta samarbetet till webbläsaren.</li><li>Byt klienten sist.</li><li>Ställ krav på verksamhetssystemen hela vägen.</li></ol></div>
  <div class="card soft"><h3>Varför den ordningen?</h3><p>Fas 0–1 syns inte för medarbetarna men avgör allt som kommer sedan. Fas 3 är den fas medarbetarna minns – och den ekonomiska vändpunkten när licenserna kan sägas upp.</p></div>
</div>`,
    notes: [
      'Principerna blir en färdplan i sex faser. Fas 0 är styrning och kartläggning: beroendekarta, exitplaner, stopp för nya beroenden. Den upprepas varje år.',
      'Fas 1 flyttar drift, nät och databaser – osynligt för medarbetarna. Fas 2 bygger identitetsnavet. Fas 3 flyttar samarbetet till webbläsaren. Fas 4 byter klienten. Fas 5 pågår hela tiden: krav vid varje avtalsslut.',
      'Sammanfattat i fem meningar: börja under huven, bygg identiteten, flytta samarbetet till webbläsaren, byt klienten sist och ställ krav på verksamhetssystemen hela vägen.',
    ],
  },
  {
    toc: 'Lösningsmönster – arkitektur',
    html: `
<p class="kicker">Lösningsmönster · arkitektur</p>
<h2>Mönster som återkommer i de europeiska fallen</h2>
<div class="cols3 grow">
  <div class="card pat"><h3>Eget identitetsnav</h3>
    <p class="prob"><b>Problem:</b> varje nytt system kopplas till Entra – beroendet växer av sig självt.</p>
    <p class="sol"><b>Mönster:</b> egen IdP (Univention Nubus + Keycloak, MFA, PKI). Alla system ansluts via OIDC/SAML och SCIM. Samba AD i samexistens under övergången.</p></div>
  <div class="card pat"><h3>Webbläsaren som brygga</h3>
    <p class="prob"><b>Problem:</b> kontorspaket och klient låser varandra.</p>
    <p class="sol"><b>Mönster:</b> kontor, e-post, filer och chatt i webbläsaren – Collabora, Open-Xchange, Nextcloud, Element – paketerat som openDesk. Klienten byts sist.</p></div>
  <div class="card pat"><h3>Under huven först</h3>
    <p class="prob"><b>Problem:</b> kritisk drift ligger hos hyperscaler.</p>
    <p class="sol"><b>Mönster:</b> drift hos svensk/europeisk leverantör eller egen Proxmox/OpenStack/Kubernetes, PostgreSQL som standard, Forgejo för kod. Ingen märker bytet.</p></div>
</div>`,
    notes: [
      'Ur fallen – Schleswig-Holstein, openDesk, Frankrike, Nederländerna, Aarhus – återkommer några lösningsmönster.',
      'Det första är det egna identitetsnavet. Problemet är att allt nytt kopplas till Entra. Mönstret, som openDesk använder, är en egen identitetsleverantör där alla system ansluts med öppna protokoll. Byter man inte navet byter man i praktiken ingenting.',
      'Det andra är webbläsaren som brygga: när samarbetet finns i webbläsaren spelar operativsystemet mindre roll.',
      'Det tredje: börja under huven. Flytta drift och databaser först – ingen medarbetare märker det, men riskminskningen är stor. Aarhus flyttade 60 system från Azure till ungefär en tredjedel av kostnaden.',
    ],
  },
  {
    toc: 'Lösningsmönster – styrning',
    html: `
<p class="kicker">Lösningsmönster · styrning och avtal</p>
<h2>Rådighet byggs också i avtal och beslut</h2>
<div class="cols4 grow small-s">
  <div class="card pat"><h3>Kravställ vid avtalsslut</h3>
    <p class="sol">Sju krav på verksamhetssystem: drift utan tredjelandskontroll, SSO mot egen IdP, öppna API:er och format, inga hårda M365-beroenden, webbklient, öppen databas, exit och kontinuitet.</p></div>
  <div class="card pat"><h3>Exitväg och beroendekarta</h3>
    <p class="sol">Kartlägg beroenden med kill-switch-risk. Exitplan per kritisk tjänst, dataexport i öppna format, escrow vid konkurs.</p></div>
  <div class="card pat"><h3>Forkbart före SaaS</h3>
    <p class="sol">Öppen källkod går att forka och driva själv – en molntjänst går inte. Kontrollera ägande och licens, inte var utvecklarna sitter.</p></div>
  <div class="card pat"><h3>Dokumenterade undantag</h3>
    <p class="sol">Där nivå 3 saknas: nivå 2 som dokumenterat undantag med årlig omprövning – inte ett skäl att vänta.</p></div>
</div>
<p class="small-s" style="margin-top:1em"><strong>Samverkan som mönster:</strong> gemensam identitetsplattform, gemensam samarbetssvit och gemensam kravställning – som openDesk (Tyskland) och La Suite (Frankrike).</p>`,
    notes: [
      'Rådighet handlar lika mycket om avtal och styrning som om teknik.',
      'I verksamhetssystemen byts inte produkter utan villkor. Rådigs kravkatalog har sju krav som ställs vid varje avtalsförnyelse – och system som inte kan uppfylla dem byts.',
      'Exitvägen byggs i förväg: beroendekarta, exitplan och dataexport. Cybersäkerhetslagen och CER-lagen kräver ändå mycket av detta.',
      'Föredra det som går att forka. Keycloak kan vara acceptabelt trots amerikansk sponsor, Entra ID kan det inte. Och se upp med produkter som är europeiska bara på pappret.',
      'Där målnivån inte går att nå används dokumenterade undantag med årlig omprövning. Och sist: gör det tillsammans.',
    ],
  },
  {
    toc: 'Bedöma rådighet – SEAL-skalan',
    html: `
<p class="kicker">Bedömning</p>
<h2>En skala för rådighet: SEAL-nivåerna</h2>
<div class="seal">
  <div><span class="lvl">SEAL-0</span><b>Ingen suveränitet</b>Tjänst, teknik och drift helt under kontroll av aktörer utanför EU.<br><span class="muted">T.ex. amerikansk SaaS i global drift.</span></div>
  <div><span class="lvl">SEAL-1</span><b>Jurisdiktionell</b>EU-rätt gäller formellt men är svår att hävda i praktiken.<br><span class="muted">T.ex. »data i EU« hos amerikansk leverantör.</span><br><span class="tag hz">≈ CADA nivå 1</span></div>
  <div><span class="lvl">SEAL-2</span><b>Datasuveränitet</b>EU-rätt går att hävda, men väsentliga beroenden utanför EU kvarstår.<br><span class="muted">Ingen åtkomst utifrån, ingen fjärravstängning.</span><br><span class="tag hz">≈ CADA nivå 2</span></div>
  <div><span class="lvl">SEAL-3</span><b>Digital resiliens</b>Europeiska aktörer har avgörande inflytande; påverkan utifrån är marginell.<br><span class="muted">Europeisk leverantör eller egen drift.</span><br><span class="tag">≈ nivå 3 · målnivå</span></div>
  <div><span class="lvl">SEAL-4</span><b>Full digital suveränitet</b>Teknik och drift helt under EU-kontroll, bara EU-rätt.<br><span class="muted">Även hårdvara, chip, firmware.</span><br><span class="tag hz">≈ nivå 4 · horisont</span></div>
</div>
<p class="small-s grow">SEAL (Sovereignty Effective Assurance Levels) kommer från EU-kommissionens <em>Cloud Sovereignty Framework</em> (okt 2025). Rådigs nivåtrappa följer förslaget till <em>Cloud and AI Development Act</em> (CADA, juni 2026). Jämförelsen mellan skalorna är ungefärlig.</p>`,
    notes: [
      'Hur vet vi var vi står? Vi behöver en gemensam skala. EU-kommissionens Cloud Sovereignty Framework har en sådan: SEAL-nivåerna, från noll till fyra.',
      'SEAL-0 betyder att allt kontrolleras utanför EU. SEAL-1: EU-rätt gäller på papperet – typiskt »data i EU«-erbjudanden från amerikanska leverantörer. SEAL-2: EU-rätt går att hävda, men beroenden kvarstår. SEAL-3: europeisk kontroll med marginell påverkan utifrån. SEAL-4: full kontroll, ända ner i hårdvaran.',
      'Rådigs egen trappa följer CADA-förslagets fyra nivåer och lägger sig ungefär på samma ställen. Målnivån – nivå 3 – motsvarar SEAL-3. SEAL-4 är horisonten.',
    ],
  },
  {
    toc: 'Bedöma rådighet – så går det till',
    html: `
<p class="kicker">Bedömning i praktiken</p>
<h2>Så kan en bedömning gå till</h2>
<div class="cols grow">
  <ol class="steps">
    <li><strong>Kartlägg</strong> tjänster och system per lager – beroendekartan.</li>
    <li><strong>Bedöm varje tjänst</strong> mot de åtta suveränitetsmålen och sätt en SEAL-nivå per mål.</li>
    <li><strong>Lägsta nivån styr.</strong> Tjänstens SEAL är dess svagaste mål – en stark datalagring väger inte upp en amerikansk ägare.</li>
    <li><strong>Jämför med målnivån</strong> (SEAL-3) och prioritera efter risk vid avstängning och bytbarhet.</li>
  </ol>
  <div>
    <div class="sov">
      <div><b>SOV-1</b> Strategisk</div><div><b>SOV-2</b> Juridik &amp; jurisdiktion</div><div><b>SOV-3</b> Data &amp; AI</div><div><b>SOV-4</b> Drift</div>
      <div><b>SOV-5</b> Leveranskedja</div><div><b>SOV-6</b> Teknik</div><div><b>SOV-7</b> Säkerhet &amp; regelefterlevnad</div><div><b>SOV-8</b> Miljö</div>
    </div>
    <div class="card soft small-s"><h3>Kontrollfrågor</h3><ul>
      <li>Vem kontrollerar leverantören juridiskt?</li>
      <li>Kan någon utanför EU stänga av eller få åtkomst?</li>
      <li>Kan vi exportera, forka eller flytta – finns exitplan?</li>
      <li>Fungerar inloggningen om tjänsten försvinner?</li></ul></div>
  </div>
</div>`,
    notes: [
      'En bedömning kan gå till i fyra steg. Först kartläggningen – Rådigs fas 0 – där varje tjänst placeras i sitt lager.',
      'Sedan bedöms varje tjänst mot de åtta suveränitetsmålen i ramverket: strategi, juridik, data, drift, leveranskedja, teknik, säkerhet och miljö.',
      'Den viktiga regeln: lägsta nivån styr. En tjänst med data i Sverige men en ägare i tredjeland når inte högre än sitt svagaste mål.',
      'Till sist jämförs resultatet med målnivån. Rådig bedömer också varje lager efter beroendegrad, risk vid avstängning och bytbarhet – det avgör vad som tas först.',
    ],
  },
  {
    toc: 'Från bedömning till självskattning',
    html: `
<p class="kicker">Bedömning · självskattning</p>
<h2>Två skalor som kompletterar varandra</h2>
<div class="cols grow">
  <div class="card"><h3>SEAL – var står tjänsten?</h3><p>Mäter <strong>kontroll</strong>: vem som i sista hand kan styra, stänga av eller få åtkomst. Används per tjänst och i upphandling som lägstanivå.</p></div>
  <div class="card soft"><h3>Mognadstrappan – var står vi?</h3><p>Mäter <strong>vägen dit</strong> inom fyra områden: diarium, e-post och samarbete, identitet, övriga verksamhetssystem.</p>
    <p class="small-s"><span class="step">1</span>Beroende <span class="step">2</span>Medveten <span class="step">3</span>Kravställd <span class="step">4</span>Öppen <span class="step">5</span>Rådig</p></div>
</div>
<p class="small-s">Steg 1–2 ligger typiskt på SEAL-0–1. Steg 3 kräver europeisk drift utan tredjelandskontroll. Steg 4–5 når målnivån och lägger till öppen källkod, samförvaltning och övad exit.</p>`,
    notes: [
      'SEAL-skalan säger hur mycket kontroll en enskild tjänst ger. Men en organisation behöver också veta hur långt den har kommit på vägen.',
      'Det är vad mognadstrappan i det här verktyget gör: fem steg, från Beroende till Rådig, inom fyra områden. Steg tre, Kravställd, motsvarar att Rådigs krav är uppfyllda. Steg fem betyder öppen källkod i hela stacken, förvaltad tillsammans med andra, och en exit som är övad.',
      'Skalorna kompletterar varandra: SEAL för tjänsten och upphandlingen, trappan för organisationens utveckling.',
    ],
  },
  {
    toc: 'Fem beslut – nästa steg',
    html: `
<p class="kicker">Nästa steg</p>
<h2>Fem beslut som behövs – innan tekniken</h2>
<div class="cols grow">
  <ol class="steps">
    <li><strong>Målnivå:</strong> nivå 3 (SEAL-3) för mjukvara och moln, nivå 4 som horisont.</li>
    <li><strong>Principer och arkitekturstyrning:</strong> öppna standarder, öppen källkod först, drift i Sverige/EU, exitvillkor – och stopp för nya beroenden.</li>
    <li><strong>Finansiering av fas 0–1:</strong> räkna med dubbla kostnader i 2–3 år.</li>
    <li><strong>Kompetens:</strong> kompetenscenter/OSPO, svenska driftpartners, utbildning.</li>
    <li><strong>Gör det tillsammans:</strong> gemensam identitetsplattform, samarbetssvit och kravställning.</li>
  </ol>
  <div class="card warn"><h3>Om vi inte beslutar</h3><ul>
    <li>Beroendet växer av sig självt – varje nytt system kopplas till Entra.</li>
    <li>Licenskostnaden stiger vid varje förnyelse.</li>
    <li>Kompetensen att ta över byggs aldrig upp.</li></ul>
    <p style="margin-top:1em"><a class="button" href="/">Gör självskattningen</a></p></div>
</div>`,
    notes: [
      'Till sist: fem beslut som behövs innan tekniken. En beslutad målnivå, så att varje upphandling inte blir en ny förhandling. Principer och arkitekturstyrning. Finansiering av de första, osynliga faserna. Kompetens. Och samverkan.',
      'Beslutar vi inte växer beroendet av sig självt.',
      'Ett första steg kan vara att göra självskattningen i det här verktyget – den ger en bild av var ni står i dag och vart ni vill om två till tre år. Tack!',
    ],
  },
  {
    toc: 'Källor',
    html: `
<p class="kicker">Källor och vidare läsning</p>
<h2>Läs mer</h2>
<ul class="grow">
  <li><a href="${RADIG}">Rådig – från beroende till rådighet</a> (utgåva 2026.09, faktaläge 9 sep 2026, CC BY 4.0)</li>
  <li><a href="${RADIG}analys/02-vad-ar-oberoende/">Vad menar vi med »oberoende«?</a> – nivåtrappan</li>
  <li><a href="${RADIG}analys/04-referensarkitektur/">Referensarkitektur: åtta lager</a></li>
  <li><a href="${RADIG}analys/07-principer/">Sju principer som styr ordningen</a></li>
  <li><a href="${RADIG}analys/08-fardplan/">Färdplanen: sex faser över fem år</a></li>
  <li><a href="${RADIG}mallar/kravkatalog-verksamhetssystem/">Kravkatalog för verksamhetssystem</a></li>
  <li><a href="${RADIG}analys/14-beslut/">Fem beslut som behövs nu</a></li>
  <li>EU-kommissionen: <em>Cloud Sovereignty Framework</em>, v1.2.1 (okt 2025) – SEAL-nivåer och suveränitetsmålen SOV-1–8</li>
</ul>
<p class="small-s muted">Produktnamn är exempel att utvärdera – kontrollera alltid juridisk kontroll och licens.</p>`,
    notes: ['Bilden med källor visas vid behov, till exempel vid frågor.'],
  },
];

function slideHtml(slide, i, total) {
  const n = i + 1;
  const prev = n > 1 ? `<a href="#bild-${n - 1}" aria-label="Föregående bild">‹</a>` : '<a aria-disabled="true">‹</a>';
  const next = n < total ? `<a href="#bild-${n + 1}" aria-label="Nästa bild">›</a>` : '<a aria-disabled="true">›</a>';
  const notes = slide.notes.map((p) => `<p>${esc(p)}</p>`).join('');
  return `<section class="slide-wrap" id="bild-${n}" aria-label="Bild ${n} av ${total}: ${esc(slide.toc)}">
<div class="slide${slide.cls ? ` ${slide.cls}` : ''}"><div class="in">${slide.html}
<div class="foot"><span class="brand"><mark>NOSAD</mark> Om rådighet</span><span class="pager">${prev} ${n}&nbsp;/&nbsp;${total} ${next}</span></div>
</div></div>
<details class="notes"><summary>Talarmanus</summary>${notes}</details>
</section>`;
}

export function aboutPage() {
  const total = SLIDES.length;
  return `<div class="deck-intro">
<h1 style="margin-top:0">Om rådighet</h1>
</div>
<nav aria-label="Bilder"><ol class="deck-toc">
${SLIDES.map((s, i) => `<li><a href="#bild-${i + 1}">${esc(s.toc)}</a></li>`).join('\n')}
</ol></nav>
${SLIDES.map((s, i) => slideHtml(s, i, total)).join('\n')}`;
}
