# Personal AI Radar Design

## Goal

AI Radar ska varje dag upptäcka nya och trendande GitHub-repon, bedöma deras konkreta nytta för Jonas och hans projekt, skapa korta notifieringskandidater för nya starka fynd och samtidigt underhålla en kumulativ totalranking över alla relevanta repon som systemet har rekommenderat.

## Non-goals

- Skicka generiska listor över allt som trendar.
- Notifiera varje dag när inget nytt är tillräckligt relevant.
- Låta en språkmodell ensam skapa eller validera slutrapporten.
- Skicka samma repo flera gånger utan en materiell förändring.
- Implementera Telegram-transport i första versionen; systemet producerar en stabil pending-kö som kan kopplas till Telegram utan att ändra analysmotorn.

## Architecture

1. `fetch-github-trending.mjs` fortsätter samla GitHub Trending daily/weekly, Search API-resultat, metadata och README-utdrag.
2. `analyze-radar.mjs` läser dagens kandidater, Jonas mål/projekt och den befintliga katalogen.
3. Nya eller ej tidigare bedömda repos analyseras i små batchar via OpenRouter. Modellen returnerar strikt JSON med separata delpoäng och kort svensk motivering.
4. Koden validerar modellsvaret, fyller saknade poster med deterministisk fallback och beräknar totalpoängen själv.
5. En permanent katalog lagrar varje rekommenderat repo, första/senaste upptäckt, projektmatchning, poäng, status och notifieringshistorik.
6. Koden genererar tre artefakter: dagens analys, notifieringskandidater och kumulativ ranking.
7. Workflowen kör tester före insamling/analys och skriver status `healthy`, `degraded` eller `failed`.

## Scoring

Poängen är jämförbar över tid och består av fasta dimensioner:

- Projektmatchning: 0–30
- Konkret tids-/affärsnytta: 0–20
- Enkelhet att testa: 0–15
- Teknisk passform: 0–15
- Repo-kvalitet och aktivitet: 0–10
- Timing/nyhetsvärde: 0–10

Total: 0–100.

Actions sätts deterministiskt:

- 85–100: `Testa nu`
- 70–84: `Spara för senare`
- 55–69: `Bevaka`
- 0–54: `Ignorera`

Den publicerade rankingen får högst fem `Testa nu` och högst tio `Spara för senare`; överskjutande poster nedgraderas till nästa action.

## Notification rules

Ett repo blir notifieringskandidat endast om:

- totalpoäng är minst 82,
- action är `Testa nu` eller `Spara för senare`,
- minst en konkret projektmatchning finns,
- repot inte tidigare har notifierats,
- repot är nytt jämfört med historiska raw-filer, eller har ökat minst 10 poäng sedan senaste notifiering.

En dag kan ge noll notifieringar. Pending-kön är idempotent och använder repo full name som nyckel.

## Persistent files

- `state/repo-catalog.json` – permanent maskinläsbar katalog.
- `rankings/all-time.json` – sorterad relevant ranking.
- `rankings/all-time.md` – läsbar totalranking.
- `rankings/daily/YYYY-MM-DD.json` – dagens strukturerade analys.
- `rankings/daily/YYYY-MM-DD.md` – dagens läsbara analys.
- `notifications/pending.json` – notifieringar som väntar på transport.
- `notifications/daily/YYYY-MM-DD.md` – dagens notifieringsförslag.
- `status/latest.json` – health/degraded-status och orsaker.

## Error handling

- Ett misslyckat OpenRouter-anrop får inte stoppa hela körningen; endast berörda batchar går till fallback.
- Fallbackresultat märks tydligt och får konservativ poäng.
- Om GitHub-data saknas eller är tom stoppas analysen med exit code 1.
- `degraded` används om någon batch går till fallback eller modellen saknas.
- Workflowen committar status även vid degraded körning, men tester måste vara gröna.

## Secrets and variables

Kärnan behöver:

- `GITHUB_TOKEN` – GitHub Actions tillhandahåller automatiskt.
- `OPENROUTER_API_KEY` – befintlig GitHub secret.
- `OPENROUTER_MODEL` – befintlig repository variable.

Telegram kräver senare `TELEGRAM_BOT_TOKEN` och `TELEGRAM_CHAT_ID`, men de behövs inte för denna version eftersom notifieringskön redan produceras.

## Testing

Node:s inbyggda test runner används utan nya dependencies. Tester täcker:

- poängsumma och actiongränser,
- robust JSON-extraktion och validering,
- deterministisk fallback,
- katalog-upsert och deduplicering,
- notifieringsregler,
- maxgränser för actions,
- rendering av kumulativ ranking.
