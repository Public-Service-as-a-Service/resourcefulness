// Följdfrågor: strategi för de kommande två åren (per område) och de största
// utmaningarna att nå full rådighet (en gemensam fråga för hela skattningen).

import { LEVELS } from './ladders.js';

// Strategier ordnade från mer beroende till mer rådighet. `target` anger
// ungefär vilket steg strategin leder till (används för målmätaren och
// snittet i sammanställningen). `null` betyder "samma som i dag".
export const STRATEGIES = [
  {
    id: 'samla',
    title: 'Samla mer hos en stor leverantör',
    text: 'T.ex. flytta fler tjänster till Microsoft 365/Azure, AWS eller Google för att förenkla och standardisera.',
    target: 1,
  },
  {
    id: 'behalla',
    title: 'Behålla nuvarande lösning',
    text: 'Inga större förändringar planeras – vi förvaltar det vi har.',
    target: null,
  },
  {
    id: 'kartlagga',
    title: 'Kartlägga beroenden och säkra en exitväg',
    text: 'Vi behåller lösningen men tar reda på var och av vem den driftas, säkrar export av vår data och exitklausuler i avtalen.',
    target: 2,
  },
  {
    id: 'kravstalla',
    title: 'Ställa rådighetskrav vid upphandling och avtalsförnyelse',
    text: 'T.ex. drift i Sverige/EU utan tredjelandskontroll, inloggning via egen identitetsplattform och öppna gränssnitt och format.',
    target: 3,
  },
  {
    id: 'oppen',
    title: 'Byta till öppen källkod',
    text: 'Gå över till en lösning med öppen källkod och kommersiell support, i egen drift eller hos svensk/europeisk leverantör.',
    target: 4,
  },
  {
    id: 'samverka',
    title: 'Samförvalta öppen källkod med andra',
    text: 'Driva och vidareutveckla öppna lösningar tillsammans med andra offentliga aktörer, med övad exit.',
    target: 5,
  },
];

export const STRATEGY_IDS = STRATEGIES.map((s) => s.id);

export function strategyById(id) {
  return STRATEGIES.find((s) => s.id === id) ?? null;
}

// Vilket steg strategin ungefär leder till, givet nuläget.
export function strategyTarget(strategyId, current) {
  const s = strategyById(strategyId);
  if (!s) return null;
  return s.target ?? (LEVELS.includes(current) ? current : null);
}

// Tolkar ett gammalt målsteg (före strategifrågan) som en strategi.
export function strategyFromTarget(target, current) {
  if (!LEVELS.includes(target)) return null;
  if (target === current) return 'behalla';
  return STRATEGIES.find((s) => s.target === target)?.id ?? null;
}

export const MAX_CHALLENGES = 3;

// Vanliga hinder för rådighet, bl.a. från forskning om inlåsning,
// bytes­kostnader och digital suveränitet i offentlig sektor.
export const CHALLENGES = [
  {
    id: 'kostnad',
    title: 'Kostnader',
    text: 'Bytet kostar: migrering, utbildning och dubbla system under övergången – och budget saknas.',
  },
  {
    id: 'sakerhet',
    title: 'Säkerhetsskäl',
    text: 'Osäkerhet om alternativen är lika säkra, eller krav på säkerhetsskydd och informationsklassning som är svåra att uppfylla.',
  },
  {
    id: 'exit',
    title: 'Avsaknad av exitplaner',
    text: 'Vi vet inte hur vi skulle ta oss ur nuvarande lösning eller få ut vår data i användbart skick.',
  },
  {
    id: 'inlasning',
    title: 'Inlåsning till leverantörer',
    text: 'Proprietära format, licensvillkor, paketerade avtal och tillägg som binder oss till leverantören.',
  },
  {
    id: 'styrning',
    title: 'Avsaknad av styrning',
    text: 'Ingen beslutad målbild, strategi eller arkitekturstyrning – frågan saknar tydlig ägare.',
  },
  {
    id: 'ledning',
    title: 'Svag förankring hos ledning och politik',
    text: 'Rådighet prioriteras inte; frågan ses som teknisk snarare än strategisk.',
  },
  {
    id: 'kompetens',
    title: 'Brist på kompetens och resurser',
    text: 'Vi saknar egen kompetens eller tid för att driva, förvalta och utveckla andra lösningar.',
  },
  {
    id: 'alternativ',
    title: 'Saknar mogna alternativ',
    text: 'Det finns inga likvärdiga öppna eller europeiska alternativ som täcker våra behov.',
  },
  {
    id: 'integration',
    title: 'Beroenden mellan system',
    text: 'Andra system, e-tjänster och integrationer kräver t.ex. Entra ID, Office-format eller Teams.',
  },
  {
    id: 'omvarld',
    title: 'Omvärlden använder samma leverantör',
    text: 'Samarbetspartner, andra myndigheter och leverantörer förväntar sig samma verktyg (nätverkseffekter).',
  },
  {
    id: 'upphandling',
    title: 'Upphandling och avtal',
    text: 'LOU, ramavtal och långa avtalsperioder gör det svårt att ställa krav eller byta.',
  },
  {
    id: 'juridik',
    title: 'Oklar juridik',
    text: 'Osäkert vad som gäller kring t.ex. CLOUD Act, GDPR, sekretess och röjande – och vem som ska bedöma det.',
  },
  {
    id: 'anvandare',
    title: 'Användarnas vanor',
    text: 'Förändringsmotstånd och oro för att nya verktyg försämrar arbetsmiljö eller produktivitet.',
  },
];

export const CHALLENGE_IDS = CHALLENGES.map((c) => c.id);

export function challengeById(id) {
  return CHALLENGES.find((c) => c.id === id) ?? null;
}

export function parseChallenges(stored) {
  if (!stored) return [];
  return [...new Set(String(stored).split(','))].filter((id) => CHALLENGE_IDS.includes(id));
}

// Äldre skattningar hade utmaningar per område. Slå ihop dem till en gemensam
// lista: de som valts i flest områden först, högst MAX_CHALLENGES stycken.
export function mergeLegacyChallenges(storedPerArea) {
  const counts = new Map();
  for (const stored of storedPerArea) {
    for (const id of parseChallenges(stored)) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return CHALLENGE_IDS.filter((id) => counts.has(id))
    .sort((x, y) => counts.get(y) - counts.get(x))
    .slice(0, MAX_CHALLENGES);
}
