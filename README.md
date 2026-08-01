# AI Radar

AI Radar är Jonas personliga GitHub-bevakare. Systemet söker varje dag efter nya och trendande repos, jämför dem med aktiva projekt och mål och filtrerar hårt bort brus.

Det bygger tre separata lager:

1. **Permanent kvalitetsranking** – endast exakta, evidensbaserade och starka projektmatchningar.
2. **Notifieringskö** – endast nya exceptionella fynd som senare kan skickas till Telegram.
3. **Katalog och dagshistorik** – alla analyserade repos, även sådant som arkiverats.

En tom eller mycket kort ranking är ett korrekt resultat. Systemet ska hellre missa ett halvbra repo än att rekommendera generiska AI-verktyg.

## Dagligt flöde

GitHub Actions kör varje natt:

1. Kör hela testsviten.
2. Samlar kandidater från GitHub Trending och Search API.
3. Hämtar metadata och README-utdrag.
4. Analyserar kandidater via OpenRouter i små JSON-batchar.
5. Validerar modellsvaret och kräver konkret evidens.
6. Tillämpar deterministiska kvalitetsgrindar, freshness och diversifiering.
7. Uppdaterar historik, kvalitetsranking, notifieringskö och statusfiler.
8. Commitar resultatet till repot.

Modellen får beskriva och bedöma kandidaterna. Node-koden bestämmer alltid om ett repo faktiskt får rankas eller notifieras.

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
- score är minst 78,
- confidence är minst 0,72,
- project fit är minst 23/30,
- concrete value är minst 13/20,
- testability är minst 7/15,
- ett konkret användningsfall finns,
- ett praktiskt nästa test finns,
- en verklig differentiator finns,
- minst ett README-/metadata-baserat evidensobjekt finns.

Kvalitetsnivåer:

- **Exceptionell:** score minst 86 och confidence minst 0,82, efter samtliga grindar.
- **Stark:** passerar samtliga grindar men når inte exceptionell nivå.
- **Arkiv:** allt annat. Syns i dagshistoriken men inte i huvudrankingen.

Generiska agent-, Codex-, MCP- eller AI-repos kommer därför inte in bara för att de är populära eller tekniskt intressanta.

## Notifieringsregler

Ett repo läggs i den framtida Telegram-kön endast när:

- nivån är **Exceptionell**,
- score är minst 88,
- confidence är minst 0,85,
- project fit är minst 25/30,
- concrete value är minst 15/20,
- repot är nytt eller har förbättrats minst 10 poäng sedan tidigare notifiering,
- samma repo inte redan ligger i pending-kön.

Notisen innehåller projekt, konkret användning, unik skillnad, evidens och ett tydligt nästa test.

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
data/
  latest.json                     # Dagens råa kandidater
  raw/YYYY-MM-DD.json             # Historisk rådata

state/
  repo-catalog.json               # Permanent minne över alla bedömda repos
  feedback.json                   # Manuell saved/testing/adopted/rejected-status

rankings/
  all-time.json                   # Maskinläsbar strikt ranking
  all-time.md                     # Läsbar strikt ranking
  latest.json / latest.md         # Senaste ranking
  daily/YYYY-MM-DD.json|md        # Alla dagens bedömningar och arkivorsaker

notifications/
  pending.json                    # Kö för framtida Telegram-transport
  latest.md                       # Dagens nya exceptionella fynd
  daily/YYYY-MM-DD.md             # Notishistorik

status/
  latest.json                     # Teknisk status och sammanfattning
  quality.json                    # Kvalitetsdrift och gate-statistik
```

## Secrets och variables

Kärnan behöver:

- `GITHUB_TOKEN` – tillhandahålls automatiskt av GitHub Actions.
- `OPENROUTER_API_KEY` – GitHub Actions secret.
- `OPENROUTER_MODEL` – GitHub repository variable.

För Telegram senare behövs även:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Ingen ny secret krävs för kvalitetslagret.

## Status

- Teknisk `healthy` – alla nya analyser kom från validerade modellresponser.
- Teknisk `degraded` – minst en kandidat använde konservativ fallback.
- `quality_status: healthy` – rekommendationsmönstret ligger inom precisionströsklarna.
- `quality_status: warning` – systemet verkar bli för generöst, koncentrerat eller osäkert.

Fallbackanalyser sparas i historiken men kan aldrig rankas eller notifieras.

## Manuell körning

```bash
npm test
npm run radar
OPENROUTER_API_KEY=... OPENROUTER_MODEL=... npm run analyze
```

Node.js 20 eller senare krävs.

## Projektkontext

Analysen läser automatiskt:

- `GOALS.md`
- `projects/*.md`
- `ideas/*.md`
- `chatgpt-genererade-ideer/candidates/*.md`

Uppdatera kontextfilerna när projekt eller prioriteringar ändras. Det är de konkreta projekten i dessa filer som avgör om en match kan klassas som `exact`.
