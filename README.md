# AI Radar

AI Radar är Jonas personliga GitHub-bevakare. Systemet söker varje dag efter nya och trendande repos, jämför dem med aktiva projekt och mål och filtrerar hårt bort brus.

Det bygger tre separata lager:

1. **Permanent kvalitetsranking** – endast exakta, evidensbaserade och starka projektmatchningar.
2. **Telegram-notiser** – endast nya exceptionella fynd som klarar den hårdaste notifieringsgränsen.
3. **Katalog och dagshistorik** – alla analyserade repos, även sådant som arkiverats.

En tom eller mycket kort ranking är ett korrekt resultat. Systemet ska hellre missa ett halvbra repo än att rekommendera generiska AI-verktyg.

## Dagligt flöde

GitHub Actions kör varje natt:

1. Kör hela testsviten.
2. Samlar kandidater från GitHub Trending och Search API.
3. Hämtar metadata och README-utdrag.
4. Laddar den kanoniska katalogen över Jonas nio aktiva projekt.
5. Analyserar kandidater via OpenRouter i små JSON-batchar.
6. Validerar modellsvaret och kräver konkret evidens.
7. Tillämpar deterministiska kvalitetsgrindar, freshness och diversifiering.
8. Uppdaterar historik, kvalitetsranking och notifieringskö.
9. Skickar pending-kön till Telegram.
10. Commitar radar-, leverans- och statusfiler till repot.

Modellen får beskriva och bedöma kandidaterna. Node-koden bestämmer alltid om ett repo faktiskt får rankas eller notifieras.

## Kanonisk projektkatalog

`projects/catalog.json` är enda source of truth för projektmatchning. Den innehåller exakt nio projektprofiler:

1. Golfkuponger
2. Stock Signals
3. Ullebets
4. Nyabolaget-ekosystemet
5. FAIV
6. AI Radar
7. Sankdig
8. Res-kungen
9. Apify Scraper

Varje profil beskriver bland annat:

- affärsmodell och norrstjärna,
- målgrupper,
- vad som redan finns,
- centrala arbetsflöden,
- aktuella behov och begränsningar,
- tillväxt- och intäktsmotorer,
- teknisk stack,
- värdefulla matchningsområden,
- discovery-termer,
- negativa matchningar,
- krav för att ett externt repo ska få klassas som `exact`,
- hur Telegram-nyttan ska formuleras.

AI Radar följer alltså inte alla repos på Jonas GitHub-konto. Gamla versioner, kopior, skolprojekt, mallar och presentationsrepos ska inte påverka matchningen.

Äldre fristående `projects/*.md` får ligga kvar som dokumentation men laddas inte längre in i modellkontexten.

## Kontextprioritering

Analysen laddar kontext i följande ordning:

1. hela `GOALS.md`,
2. hela och validerade `projects/catalog.json`,
3. frivillig idékontext från `ideas/*.md`,
4. frivilliga kandidater från `chatgpt-genererade-ideer/candidates/*.md`.

Kärnkontexten får aldrig kapas. Om `GOALS.md` eller projektkatalogen är ogiltig eller större än den tillåtna budgeten stoppar analysen tydligt. Endast den frivilliga idékontexten får trunkeras.

Standardbudgeten är 70 000 tecken och kan ändras med `PROJECT_CONTEXT_MAX_CHARS`.

## Grundpoäng

Varje repo får en spårbar grundpoäng på 0–100:

| Dimension | Max |
|---|---:|
| Projektmatchning | 30 |
| Konkret tids-/affärsnytta | 20 |
| Enkelhet att testa | 15 |
| Teknisk passform | 15 |
| Repo-kvalitet och aktivitet | 10 |
| Timing och nyhetsvärde | 10 |

En hög grundpoäng räcker inte för att komma in i rankingen.

## Hårda kvalitetskrav

Ett repo får visas i huvudrankingen endast när allt detta stämmer:

- analysen kommer från modellen, aldrig fallback,
- `assessment_version` är aktuell,
- `match_type` är `exact`, inte `adjacent` eller `generic`,
- minst ett namngivet aktivt projekt matchas konkret,
- projektnamnet är ett exakt `display_name` från `projects/catalog.json`,
- score är minst 78,
- confidence är minst 0,72,
- project fit är minst 23/30,
- concrete value är minst 13/20,
- testability är minst 7/15,
- ett konkret användningsfall finns,
- ett praktiskt nästa test finns,
- en verklig differentiator finns,
- minst ett README-/metadata-baserat evidensobjekt finns.

En exact-match måste kunna knytas till minst ett namngivet behov, arbetsflöde, tillväxtmål eller konkret utvecklingsarbete i projektprofilen. Gemensam stack, bransch eller ämnesord räcker inte.

Kvalitetsnivåer:

- **Exceptionell:** score minst 86 och confidence minst 0,82, efter samtliga grindar.
- **Stark:** passerar samtliga grindar men når inte exceptionell nivå.
- **Arkiv:** allt annat. Syns i dagshistoriken men inte i huvudrankingen.

Generiska agent-, Codex-, MCP- eller AI-repos kommer därför inte in bara för att de är populära eller tekniskt intressanta.

## Notifieringsregler

Ett repo får skickas till Telegram endast när:

- nivån är **Exceptionell**,
- score är minst 88,
- confidence är minst 0,85,
- project fit är minst 25/30,
- concrete value är minst 15/20,
- repot är nytt, aldrig tidigare notifierat eller har förbättrats minst 10 poäng sedan tidigare notifiering,
- samma repo inte redan ligger i pending-kön eller leveranshistoriken.

Projekt med `notification_tier: strict` kräver dessutom direkt koppling till ett aktuellt produkt-, publik- eller intäktsmål. Allmän framtida potential ska klassas som `adjacent`.

Notisen innehåller projekt, konkret användning, unik skillnad, evidens och ett tydligt nästa test.

## Telegram-leverans

Telegram körs efter en lyckad analys och använder repository secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Leveransen är retry-säker:

- `notifications/pending.json` innehåller oskickade notiser.
- Endast lyckade notiser tas bort ur pending.
- Lyckade leveranser sparas i `notifications/sent.json` med ett deterministiskt notification-ID och Telegram message-ID.
- Misslyckade notiser ligger kvar och försöks igen nästa körning.
- Ett redan skickat notification-ID skickas aldrig en gång till.
- Token och chat-ID skrivs aldrig till statusfiler eller loggar av applikationskoden.

Om Telegram delvis misslyckas blir workflowen röd, men commit-steget sparar ändå pending-kön och `status/telegram.json`. Därmed tappas ingen notis.

En manuell workflow-körning kan markera `telegram_smoke_test` för att skicka ett separat anslutningstest utan att skapa en falsk repo-notis.

## Diversifiering

Huvudrankingen visar högst två repos från samma kategori. Ett tredje liknande agent-framework kan alltså vara välbedömt och sparat i katalogen, men får inte tränga undan bättre och mer varierade fynd.

## Freshness och manuell feedback

`state/feedback.json` kan användas för att styra enskilda repos:

```json
{
  "owner/repo": { "status": "testing" }
}
```

Tillåtna statusar:

- `saved` – relevant och ska sparas.
- `testing` – testas aktivt.
- `adopted` – används och ska prioriteras.
- `rejected` – ska inte visas i rankingen.

Otestade fynd åldras:

- 0–30 dagar: inget avdrag.
- 31–60 dagar: −3 rankingpoäng.
- 61–90 dagar: −7 rankingpoäng.
- över 90 dagar: försvinner ur huvudrankingen.

`adopted`, `testing` och `saved` skyddas mot freshness-avdrag. Grundpoängen ändras aldrig; rankingen använder en separat `ranking_score`.

## Kvalitetsövervakning

Varje körning skriver `status/quality.json` med bland annat:

- andel exact/adjacent/generic,
- rekommendationsgrad,
- genomsnittlig confidence,
- antal som föll på varje kvalitetsgrind,
- kategorikoncentration före diversifieringscap,
- antal slutliga rankingposter.

`quality_status` blir `warning` när exempelvis över 20 % av kandidaterna släpps igenom, när en tillräckligt stor ranking domineras av samma kategori eller när confidence är för låg. Teknisk status och kvalitetsstatus hålls separata.

## Viktiga filer

```txt
GOALS.md                         # Övergripande mål och matchningsregler
projects/catalog.json             # Kanoniska profiler för de nio aktiva projekten
scripts/lib/project-context.mjs   # Validering och prioriterad kontextladdning

data/
  latest.json                     # Dagens råa kandidater
  raw/YYYY-MM-DD.json             # Historisk rådata

state/
  repo-catalog.json               # Permanent minne över alla bedömda externa repos
  feedback.json                   # Manuell saved/testing/adopted/rejected-status

rankings/
  all-time.json                   # Maskinläsbar strikt ranking
  all-time.md                     # Läsbar strikt ranking
  latest.json / latest.md         # Senaste ranking
  daily/YYYY-MM-DD.json|md        # Alla dagens bedömningar och arkivorsaker

notifications/
  pending.json                    # Oskickade exceptionella notiser
  sent.json                       # Leveranshistorik och deduplicering
  latest.md                       # Dagens nya exceptionella fynd
  daily/YYYY-MM-DD.md             # Notishistorik

status/
  latest.json                     # Teknisk radarstatus och sammanfattning
  quality.json                    # Kvalitetsdrift och gate-statistik
  telegram.json                   # Senaste Telegram-leveransstatus
```

## Secrets och variables

Kärnan behöver:

- `GITHUB_TOKEN` – tillhandahålls automatiskt av GitHub Actions.
- `OPENROUTER_API_KEY` – GitHub Actions secret.
- `OPENROUTER_MODEL` – GitHub repository variable.
- `TELEGRAM_BOT_TOKEN` – GitHub Actions secret.
- `TELEGRAM_CHAT_ID` – GitHub Actions secret.
- `PROJECT_CONTEXT_MAX_CHARS` – valfri gräns, default 70 000.

Ingen `.env` behövs för GitHub Actions. En lokal `.env` får endast användas lokalt och måste vara git-ignorerad.

## Status

- Teknisk `healthy` – alla nya analyser kom från validerade modellresponser.
- Teknisk `degraded` – minst en kandidat använde konservativ fallback.
- `quality_status: healthy` – rekommendationsmönstret ligger inom precisionströsklarna.
- `quality_status: warning` – systemet verkar bli för generöst, koncentrerat eller osäkert.
- Telegram `healthy` – samtliga pending-notiser skickades.
- Telegram `degraded` – minst en notis skickades och minst en ligger kvar för retry.
- Telegram `failed` – konfiguration eller samtliga leveranser misslyckades.
- Telegram `idle` – ingen pending-notis och inget smoke test fanns.

Fallbackanalyser sparas i historiken men kan aldrig rankas eller notifieras.

## Manuell körning

```bash
npm test
npm run radar
OPENROUTER_API_KEY=... OPENROUTER_MODEL=... npm run analyze
TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... npm run notify
```

Node.js 20 eller senare krävs.
