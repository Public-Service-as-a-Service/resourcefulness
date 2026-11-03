# Rådighet – självskattningsverktyg (NOSAD)

Ett webbverktyg där offentliga organisationer skattar sin **digitala rådighet** inom fyra områden:

1. **Diarium och ärendehantering**
2. **E-post och samarbete**
3. **Identitet och inloggning (IAM/SSO)**
4. **Övriga verksamhetssystem**

Varje område har en mognadstrappa i fem steg – från *Beroende* (t.ex. drift i Azure eller på egna
Microsoft-servrar med MSSQL) till *Rådig* (öppen källkod i hela stacken, i egen eller samverkansdrift).
Trapporna bygger på [Rådig – från beroende till rådighet](https://radig.codeberg.page/radig/)
(referensarkitektur, byteskarta, sju principer och kravkatalog för verksamhetssystem) och finns i
[`src/ladders.js`](src/ladders.js) samt publikt på sidan `/trappor`.

| Steg | Namn | Generellt innebär det |
|---|---|---|
| 1 | Beroende | Proprietärt, i hyperscaler-moln eller på Windows Server/MSSQL; låst till en leverantör |
| 2 | Medveten | Fortfarande proprietärt, men kartlagt (beroendekarta), data exporterbar, exitklausul |
| 3 | Kravställd | Rådigs krav uppfyllda: EU-drift utan tredjelandskontroll, SSO mot egen IdP, öppna API:er/format |
| 4 | Öppen | Öppen källkod med kommersiell support, i egen eller svensk drift |
| 5 | Rådig | Öppen källkod i hela stacken, samförvaltad med andra, exit övad |

Exempel på öppna lösningar i trapporna: Keycloak/Zitadel, Univention Nubus, privacyIDEA (IAM);
Open-Xchange/grommunio, Nextcloud, Collabora Online, Element/Matrix, Jitsi, openDesk (arbetsplats);
Open Zaak/Open Formulieren, ESSArch (ärende/arkiv); Open ePlatform, Apache Superset, QGIS, PostgreSQL (övrigt).
Produktnamnen är exempel att utvärdera – kontrollera alltid juridisk kontroll och licens.

## Funktioner

- Utseende som [nosad.se](https://nosad.se/) med NOSAD-loggan (markeringspenna) och favicon.
- Inträde med e-postadress, som håller isär svaren. Respondenten kan återkomma och uppdatera sin skattning (formuläret förifylls).
- Per område: nuläge (1–5 eller "vet inte"), mål om 2–3 år och valfri kommentar. Resultatsidan visar nästa steg.
- **Alla inskick sparas** (historik) i SQLite i **WAL-läge**.
- **Dold adminsida** på en hemlig sökväg (`ADMIN_PATH`), valfritt även lösenordsskyddad (`ADMIN_PASSWORD`).
  Sammanställningen är anonymiserad: bara aggregat från varje respondents senaste skattning, inga e-postadresser,
  kommentarer i slumpad ordning utan koppling till person, och fördelningar visas först när minst
  `ADMIN_MIN_GROUP_SIZE` (standard 3) har svarat.
- Inga npm-beroenden: Node.js inbyggda `node:http` och `node:sqlite`. Ingen JavaScript i webbläsaren, strikt CSP.

## Köra lokalt

Kräver Node.js 22.13 eller senare.

```bash
ADMIN_PATH=admin-lokal npm start
```

Öppna http://localhost:3000 och adminsidan på http://localhost:3000/admin-lokal.

```bash
npm test
```

## Miljövariabler

| Variabel | Standard | Beskrivning |
|---|---|---|
| `PORT` | `3000` | Port att lyssna på |
| `DATABASE_PATH` | `./data/radighet.db` (`/data/radighet.db` i Docker) | SQLite-fil |
| `ADMIN_PATH` | slumpas vid start | Hemlig sökväg till adminsidan, t.ex. `admin-7f3c9a2e1b` |
| `ADMIN_PASSWORD` | tomt | Om satt krävs HTTP Basic-inloggning (valfritt användarnamn) |
| `ADMIN_MIN_GROUP_SIZE` | `3` | Minsta antal respondenter innan fördelningar visas |
| `COOKIE_SECURE` | `false` (`true` i compose) | Sätt `Secure` på sessionskakan – använd med HTTPS |

## Driftsätta på DokPloy

**Alternativ A – Docker Compose (rekommenderas)**

1. I DokPloy: *Create Service → Compose*, välj detta Git-repo och gren, compose-fil `docker-compose.yml`.
2. Under *Environment*, sätt minst `ADMIN_PATH` (en lång, slumpad sträng) och gärna `ADMIN_PASSWORD`.
3. Under *Domains*: lägg till domän, tjänst `radighet`, container-port `3000`, slå på HTTPS (Let's Encrypt).
4. *Deploy*. Databasen ligger i den namngivna volymen `radighet-data` och överlever omdeploy.

**Alternativ B – Application med Dockerfile**

1. *Create Service → Application*, källa Git, *Build Type: Dockerfile*.
2. Sätt miljövariablerna ovan, lägg till en *Volume mount* till `/data`, och en domän mot port `3000`.

Säkerhetskopiering: kopiera `radighet.db` tillsammans med `-wal`/`-shm` när tjänsten är stoppad, eller kör
`sqlite3 /data/radighet.db ".backup /data/backup.db"`.

## Dataskydd

E-postadressen är en personuppgift. Den används enbart för att skilja svar åt och visas aldrig i
sammanställningen. Informera respondenterna om ändamål och lagringstid enligt organisationens GDPR-rutiner.

## Licens

Koden: MIT. Mognadstrapporna bygger på Rådig (text CC BY 4.0).
