// Sidan »Om rådighet« – kort om Rådig-initiativet och de EU- och andra
// initiativ som styr arbetet mot digital rådighet.

const RADIG = 'https://radig.codefloe.page/radig/';

export const ABOUT_CSS = `
.about dl{margin:0 0 1.5rem}
.about dt{font-weight:700;margin-top:1rem}
.about dd{margin:0}
.about .lead{font-size:1.15rem}
.about .quote{border-left:4px solid var(--accent);padding-left:1rem;margin:1.5rem 0}
`;

function list(items) {
  return `<dl>\n${items
    .map(([name, href, text]) => `<dt>${href ? `<a href="${href}">${name}</a>` : name}</dt><dd>${text}</dd>`)
    .join('\n')}\n</dl>`;
}

const EU = [
  [
    'NIS2-direktivet (EU) 2022/2555',
    'https://eur-lex.europa.eu/eli/dir/2022/2555/oj',
    'Krav på riskhantering, leverantörskedjans säkerhet och ledningens ansvar. Genomförs i Sverige genom cybersäkerhetslagen.',
  ],
  [
    'CER-direktivet (EU) 2022/2557',
    'https://eur-lex.europa.eu/eli/dir/2022/2557/oj',
    'Motståndskraft hos samhällsviktiga verksamheter. Genomförs i Sverige genom CER-lagen.',
  ],
  [
    'Dataförordningen, Data Act (EU) 2023/2854',
    'https://eur-lex.europa.eu/eli/reg/2023/2854/oj',
    'Ger rätt att byta molntjänst och flytta data utan inlåsning, och fasar ut avgifter för byte.',
  ],
  [
    'Förordningen om ett interoperabelt Europa (EU) 2024/903',
    'https://eur-lex.europa.eu/eli/reg/2024/903/oj',
    'Främjar öppna standarder, öppen källkod och återanvändning av lösningar mellan offentliga organisationer.',
  ],
  [
    'Dataskyddsförordningen (GDPR) och Schrems II-domen',
    'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
    'Ställer krav vid överföring av personuppgifter till tredjeland. Amerikansk lagstiftning (CLOUD Act, FISA 702) gör frågan om vem som kontrollerar leverantören avgörande.',
  ],
  [
    'EU-kommissionens Cloud Sovereignty Framework',
    'https://europeanstack.com/guides/eu-cloud-sovereignty-framework',
    'Bedömer molntjänsters suveränitet i nivåerna SEAL-0–4. Används som lägstanivå i upphandling.',
  ],
  [
    'Cloud and AI Development Act (CADA)',
    'https://digital-strategy.ec.europa.eu/en/policies/cloud-and-ai-development-act',
    'Kommissionens förslag för att bygga ut europeisk moln- och AI-kapacitet.',
  ],
];

const SE = [
  [
    'Sveriges molnpolicy (regeringsbeslut 28 maj 2026, Fi2026/01233)',
    '',
    'Styr statliga myndigheters användning av molntjänster. För kommuner och regioner fungerar den som vägledning.',
  ],
  [
    'Cybersäkerhetslagen (2025:1506)',
    '',
    'Det svenska genomförandet av NIS2, i kraft sedan 15 januari 2026.',
  ],
  ['CER-lagen', '', 'Det svenska genomförandet av CER-direktivet, i kraft 1 januari 2027.'],
  [
    'Säkerhetsskyddslagen',
    '',
    'Skärpta krav vid utkontraktering och anmälningsplikt från 1 januari 2027.',
  ],
  [
    'Förordning (2024:1005) om statlig it-drift',
    '',
    'Samordnad statlig it-drift hos utpekade myndigheter som alternativ till kommersiella molntjänster.',
  ],
  [
    'eSam och Sambruks nätverk Digital suveränitet',
    'https://www.esamverka.se/',
    'Samverkan mellan myndigheter, kommuner och regioner om rättsliga bedömningar, kravställning och gemensamma lösningar.',
  ],
];

const OTHER = [
  ['openDesk och ZenDiS (Tyskland)', 'https://www.opendesk.eu/', 'Statlig samarbetssvit byggd på öppen källkod.'],
  ['La Suite numérique (Frankrike)', 'https://lasuite.numerique.gouv.fr/', 'Den franska statens öppna samarbetsverktyg.'],
  ['Schleswig-Holstein (Tyskland)', '', 'Delstaten byter från Microsoft till öppen källkod i hela förvaltningen.'],
  ['Nederländerna', '', 'Gemensam molnpolicy och statsmoln för hela statsförvaltningen.'],
];

export function aboutPage() {
  return `<div class="about">
<h1 style="margin-top:2rem">Om rådighet</h1>
<p class="lead">Digital rådighet betyder att organisationen själv bestämmer över sina system, sina data och sina leverantörsbyten.</p>

<h2>Initiativet Rådig</h2>
<p><a href="${RADIG}">Rådig – från beroende till rådighet</a> är ett öppet samverkansprojekt för kommuner, regioner och myndigheter. Föreningen Sambruk tog fram analysen som underlag för ledning och politik. Analysen beskriver hur en offentlig organisation kan minska sitt beroende av Microsoft, Google och de stora amerikanska molnleverantörerna, lager för lager och i rätt ordning.</p>
<p class="quote">»Kan vi fortsätta fungera i morgon om leverantören stänger av, höjer priset eller tvingas lyda ett annat lands lag?«</p>
<p>Målet är inte noll beroende. Målet är att inget enskilt beroende ska kunna stoppa verksamheten. Europeisk kontroll (SEAL-3) bedöms vara nåbar för nästan hela mjukvaru- och molnstacken inom ungefär fem år. Arbetet följer sju principer, bland annat att stoppa nya beroenden först, bygga identiteten före allt som hänger på den och bygga exitvägen innan den behövs. Det görs enligt en färdplan i sex faser.</p>
<p>Rådig innehåller också fallstudier, juridiska analyser och mallar för kravkatalog, beroendekarta och exitplan. Allt är öppet: texten är CC BY 4.0 och koden EUPL-1.2. Bidrag tas emot via <a href="https://codefloe.com/Radig">Codefloe</a>.</p>
<p>Det här verktyget bygger på Rådig. <a href="/trappor">Mognadstrapporna</a> och självskattningen hjälper er att se var ni står och vart ni vill.</p>

<h2>EU-initiativ som styr</h2>
${list(EU)}

<h2>Svenska initiativ</h2>
${list(SE)}

<h2>Förebilder i andra länder</h2>
${list(OTHER)}

<p class="meta">Källa: <a href="${RADIG}">Rådig</a>, utgåva 2026.09 (CC BY 4.0).</p>
</div>`;
}
