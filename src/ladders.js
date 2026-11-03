// Mognadstrappor för rådighet.
//
// Varje område har fem nivåer, från starkt beroende av en enskild
// (utomeuropeisk) leverantör till full rådighet med öppen källkod i egen
// eller samverkansdrift. Trapporna bygger på Rådigs referensarkitektur,
// byteskarta och kravkatalog: https://radig.codeberg.page/radig/

export const LEVELS = [1, 2, 3, 4, 5];

export const LEVEL_NAMES = {
  1: 'Beroende',
  2: 'Medveten',
  3: 'Kravställd',
  4: 'Öppen',
  5: 'Rådig',
};

export const AREAS = [
  {
    id: 'arende',
    title: 'Diarium och ärendehantering',
    lead:
      'Systemet där ärenden registreras, handläggs och diarieförs – ofta kärnan i myndighetsutövningen och kopplat till e-arkivet.',
    radigLayer: 'Lager 7 · Verksamhetssystem & data',
    levels: {
      1: {
        summary:
          'Proprietärt system som driftas i hyperscaler-moln (Azure/AWS) eller internt på Windows Server med MSSQL.',
        details: [
          'Tjock Windows-klient och/eller Office-tillägg (Outlook, Word) krävs för att arbeta.',
          'Inloggning enbart via Active Directory eller Entra ID.',
          'Export av ärenden och handlingar är begränsad eller kostar extra.',
          'Ingen exitplan – vi vet inte hur vi skulle byta.',
        ],
      },
      2: {
        summary:
          'Fortfarande proprietärt, men vi vet var och av vem det driftas och har säkrat vår data.',
        details: [
          'Driftplats, underleverantörer och tillämplig lag är dokumenterade i en beroendekarta.',
          'Webbklient finns som fungerar i vanlig webbläsare.',
          'Fullständig export i öppna format (PDF/A, XML enligt FGS, CSV/JSON) är testad.',
          'Exitklausul och dataexport vid avtalsslut finns i avtalet.',
        ],
      },
      3: {
        summary:
          'Systemet uppfyller Rådigs kravkatalog: svensk/EU-drift utan tredjelandskontroll, egen IdP och öppna gränssnitt.',
        details: [
          'Drift i Sverige/EU hos leverantör som inte kontrolleras från tredjeland – eller på egen plattform.',
          'SSO via OIDC/SAML mot egen identitetsplattform (t.ex. Keycloak), inte bara Entra ID.',
          'Öppen databas (PostgreSQL) och dokumenterade API:er; inga hårda M365-beroenden.',
          'E-arkivleverans enligt FGS (t.ex. till ESSArch eller annat öppet e-arkiv).',
        ],
      },
      4: {
        summary:
          'Ärendehantering byggd på öppen källkod med kommersiell support, i egen eller svensk drift.',
        details: [
          'Öppen källkod-lösning, t.ex. Open Zaak + Open Formulieren (Common Ground, NL), eller ett ärendeflöde på Alfresco Community/Nextcloud – med avtalad svensk/EU-support.',
          'Körs containeriserat (Kubernetes) på egen plattform eller hos svensk molnleverantör (t.ex. Safespring, Elastx, Cleura).',
          'Integrationer via öppna API:er och öppen integrationsplattform (t.ex. Apache Camel).',
          'Exitvägen är dokumenterad och övad.',
        ],
      },
      5: {
        summary:
          'Hela stacken är öppen källkod och samförvaltas med andra offentliga aktörer.',
        details: [
          'Linux, PostgreSQL, Kubernetes och applikation – allt öppen källkod.',
          'Koden delas och samutvecklas med andra organisationer (t.ex. via Sambruk eller offentligkod.se).',
          'Öppna standarder genom hela kedjan: ODF, PDF/A, FGS, OIDC.',
          'Organisationen kan själv – eller med valfri leverantör – drifta, vidareutveckla och flytta systemet.',
        ],
      },
    },
  },
  {
    id: 'epost',
    title: 'E-post och samarbete',
    lead:
      'E-post, kalender, filer, dokumentsamarbete, chatt och videomöten – den digitala arbetsplatsen.',
    radigLayer: 'Lager 5 · Digital arbetsplats',
    levels: {
      1: {
        summary:
          'Microsoft 365 i Azure (Exchange Online, Teams, SharePoint/OneDrive) är enda plattformen.',
        details: [
          'All e-post, filer och möten ligger i amerikanskt kontrollerat moln (omfattas av CLOUD Act).',
          'Dokument skapas i OOXML (docx/xlsx) och kräver Office.',
          'Ingen alternativ kanal om tjänsten stängs av eller priset höjs.',
        ],
      },
      2: {
        summary:
          'Microsoft-plattform i egen drift (Exchange Server, SharePoint Server, filservrar på Windows Server) – eller M365 med tydliga undantag.',
        details: [
          'Data ligger i egna datacenter eller sekretessklassad information hålls utanför molnet.',
          'Fortfarande låst till Microsofts licenser, protokoll och klienter.',
          'Beroenden och exitväg är kartlagda.',
        ],
      },
      3: {
        summary:
          'Öppna format och protokoll är standard och öppna verktyg är i pilot vid sidan av Microsoft.',
        details: [
          'ODF och PDF/A är standardformat; IMAP/CalDAV/CardDAV är påslaget.',
          'Pilot med t.ex. Nextcloud + Collabora Online, Element/Matrix och Jitsi/OpenTalk i någon förvaltning.',
          'Nya tjänster väljs webbaserade så att klienten (OS) kan bytas senare.',
        ],
      },
      4: {
        summary:
          'E-post och samarbete körs på öppen källkod hos svensk/EU-leverantör eller i egen drift.',
        details: [
          'E-post/kalender: Open-Xchange + Dovecot eller grommunio.',
          'Filer och dokument: Nextcloud (eller OpenCloud) med Collabora Online; LibreOffice på klienten.',
          'Chatt och video: Element/Matrix, Jitsi, OpenTalk eller BigBlueButton.',
          'Microsoft 365 finns kvar endast som dokumenterade undantag.',
        ],
      },
      5: {
        summary:
          'Hela digitala arbetsplatsen är öppen källkod, i egen eller samverkansdrift.',
        details: [
          'Paketerad svit (t.ex. openDesk eller motsvarande samverkanslösning) i egen/svensk drift.',
          'Inga M365-licenser kvar; Linux-klienter möjliga eftersom allt fungerar i webbläsaren.',
          'Federation med andra organisationer via öppna protokoll (Matrix, e-post, CalDAV).',
          'Exitplan och dataportabilitet är testade.',
        ],
      },
    },
  },
  {
    id: 'iam',
    title: 'Identitet och inloggning (IAM/SSO)',
    lead:
      'Katalog, inloggning (SSO), flerfaktorsautentisering, behörigheter och certifikat – navet som allt annat hänger på.',
    radigLayer: 'Lager 3 · Identitet & katalog',
    levels: {
      1: {
        summary:
          'Entra ID (Azure AD) är enda identitetsleverantör – med Conditional Access, Intune och Microsoft Authenticator.',
        details: [
          'Stängs kontot av slutar i princip alla system att fungera.',
          'Behörighetsstyrning och MFA ligger helt hos Microsoft.',
        ],
      },
      2: {
        summary:
          'Active Directory på egna Windows-servrar är master, med ADFS eller synk till Entra ID för SSO.',
        details: [
          'Katalogen finns i egen drift, men inloggning till molntjänster går via Entra ID.',
          'Certifikat via AD CS, GPO för klientstyrning.',
          'Vi vet vilka system som är beroende av Entra ID.',
        ],
      },
      3: {
        summary:
          'En fristående öppen identitetsplattform (Keycloak) är införd och används för nya system.',
        details: [
          'Nya system ansluts via OIDC/SAML till Keycloak, inte direkt till Entra ID.',
          'MFA via öppna standarder (FIDO2/WebAuthn, TOTP).',
          'AD finns kvar som katalog under övergången.',
        ],
      },
      4: {
        summary:
          'Öppen IdP är primär för alla system och katalogen är öppen källkod.',
        details: [
          'Keycloak eller Zitadel som enda IdP; SCIM-provisionering till systemen.',
          'Katalog i Univention Nubus/OpenLDAP eller Samba AD.',
          'MFA via privacyIDEA och FIDO2-nycklar; e-legitimation (BankID/Freja) via federation.',
          'Entra ID används bara för kvarvarande undantag.',
        ],
      },
      5: {
        summary:
          'Hela identitetskedjan är öppen källkod i egen eller svensk drift – inga Entra-beroenden.',
        details: [
          'Katalog, IdP, MFA och PKI (t.ex. EJBCA, step-ca) i öppen källkod.',
          'Lösenord/hemligheter (Passbolt, Vaultwarden, OpenBao) och privilegierad åtkomst (Apache Guacamole) i egen drift.',
          'Federation med andra aktörer via öppna standarder (SAML/OIDC).',
          'Exit och återställning av identitetsplattformen är övade.',
        ],
      },
    },
  },
  {
    id: 'ovriga',
    title: 'Övriga verksamhetssystem',
    lead:
      'Resten av systemportföljen: ekonomi, HR, e-tjänster, e-arkiv, GIS, BI/datalager, integrationer m.m.',
    radigLayer: 'Lager 6–7 · Integration & verksamhetssystem',
    levels: {
      1: {
        summary:
          'De flesta system är proprietära, i hyperscaler-moln eller internt på Windows Server + MSSQL, och vi vet inte alltid var de driftas.',
        details: [
          'Svenska leverantörers SaaS ligger ofta i Azure/AWS – beroendet syns inte i avtalet.',
          'Tjocka Windows-klienter, Power BI, Power Platform och Office-tillägg är vanliga.',
          'Data är svår att få ut.',
        ],
      },
      2: {
        summary:
          'Portföljen är kartlagd: vi har en beroendekarta och vet var varje system driftas och av vem.',
        details: [
          'Beroendekarta med driftplats, underleverantörer och avtalsslut för varje system.',
          'Rådigs sju krav ställs i nya upphandlingar.',
          'Avvikelser dokumenteras med omprövningsdatum.',
        ],
      },
      3: {
        summary:
          'Kraven ställs vid varje avtalsförnyelse och flertalet system uppfyller dem.',
        details: [
          'Webbklient, SSO mot egen IdP, öppna API:er och fullständig export.',
          'Drift i Sverige/EU utan tredjelandskontroll.',
          'Flytt från MSSQL till PostgreSQL och från Power BI till t.ex. Apache Superset är påbörjad.',
        ],
      },
      4: {
        summary:
          'Merparten körs på öppen plattform i egen eller svensk drift, och öppen källkod väljs när den finns.',
        details: [
          'Linux, PostgreSQL och Kubernetes som standardplattform.',
          'Exempel: Open ePlatform för e-tjänster, ESSArch för e-arkiv, QGIS/GeoServer för GIS, Apache Superset för BI, Apache Camel för integration, Baserow/Grist i stället för Power Apps.',
          'Exitplan finns för varje kritiskt system.',
        ],
      },
      5: {
        summary:
          'Öppen källkod är förstahandsval i hela portföljen och utvecklas tillsammans med andra.',
        details: [
          'Egenutvecklad och upphandlad kod publiceras (t.ex. på offentligkod.se).',
          'Samutveckling och samförvaltning med andra offentliga aktörer.',
          'Kvarvarande proprietära system är dokumenterade undantag med omprövningsdatum.',
        ],
      },
    },
  },
];

export const AREA_IDS = AREAS.map((a) => a.id);

export function areaById(id) {
  return AREAS.find((a) => a.id === id);
}
