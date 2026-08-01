# AI Radar

AI Radar är Jonas personliga GitHub-bevakare. Systemet söker varje dag efter nya och trendande repos, jämför dem med Jonas aktiva projekt och mål, filtrerar bort brus och bygger två slutprodukter:

1. **Notifieringskandidater** – endast nya, starka och konkreta fynd som senare kan skickas till Telegram.
2. **Permanent totalranking** – en kumulativ lista över alla historiskt relevanta repos som systemet har rekommenderat.

En vanlig dag får ge noll notifieringar.

## Dagligt flöde

GitHub Actions kör varje natt:

1. Tester.
2. Insamling från GitHub Trending daily/weekly och kompletterande Search API-sökningar.
3. README- och metadatahämtning.
4. Strukturerad OpenRouter-analys i små batchar.
5. Deterministisk poängberäkning och validering.
6. Uppdatering av katalog, totalranking, daglig analys och notifieringskö.
7. Commit av alla resultat.

Modellen skriver inte längre hela markdownrapporten. Den returnerar endast strukturerad JSON. Node-koden räknar poäng, sätter actions, begränsar antalet starka rekommendationer och bygger filerna.

## Poängmodell

Varje repo bedöms på en stabil 0–100-skala:

| Dimension | Max |
|---|---:|
| Projektmatchning | 30 |
| Konkret tids-/affärsnytta | 20 |
| Enkelhet att testa | 15 |
| Teknisk passform | 15 |
| Repo-kvalitet och aktivitet | 10 |
| Timing och nyhetsvärde | 10 |

Actions:

- `85–100`: Testa nu
- `70–84`: Spara för senare
- `55–69`: Bevaka
- `0–54`: Ignorera

Den permanenta rankingen visar högst fem `Testa nu` och högst tio `Spara för senare`.

## Notifieringsregler

Ett repo läggs i notifieringskön endast när:

- poängen är minst 82,
- en konkret projektmatchning finns,
- modellanalysen validerades,
- repot är nytt jämfört med historiska raw-filer, eller har förbättrats minst 10 poäng sedan tidigare notifiering,
- samma repo inte redan ligger i pending-kön.

Exempel på framtida Telegram-meddelande:

> **Nytt repo upptäckt**
>
> Ett verktyg som skapar korta produktvideor från bilder.
>
> **Passar:** FAIV  
> **Varför:** Kan automatisera kampanjmaterial från befintliga produktbilder.  
> **Bedömning:** 88/100 – Testa nu

## Viktiga filer

```txt
data/
  latest.json                     # Dagens råa kandidater
  raw/YYYY-MM-DD.json             # Historisk rådata

state/
  repo-catalog.json               # Permanent minne över bedömda repos

rankings/
  all-time.json                   # Maskinläsbar totalranking
  all-time.md                     # Permanent läsbar totalranking
  latest.json / latest.md         # Samma ranking för enkel åtkomst
  daily/YYYY-MM-DD.json|md        # Dagens analys

notifications/
  pending.json                    # Transportoberoende kö för framtida Telegram
  latest.md                       # Dagens nya notiser
  daily/YYYY-MM-DD.md             # Notishistorik

status/
  latest.json                     # healthy/degraded och exakta orsaker
```

## Secrets och variables

Kärnan behöver bara:

- `GITHUB_TOKEN` – tillhandahålls automatiskt av GitHub Actions.
- `OPENROUTER_API_KEY` – GitHub Actions secret.
- `OPENROUTER_MODEL` – GitHub repository variable.

Den befintliga workflowen använde redan båda OpenRouter-värdena, så ingen ny secret krävs för analysen.

För Telegram senare behövs:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

De behövs inte ännu. `notifications/pending.json` är redan förberedd som kö till transportsteget.

## Status

- `healthy` – alla nya analyser kom från en validerad modellrespons.
- `degraded` – insamlingen fungerade, men en eller flera analyser använde konservativ fallback.
- Workflow-fel – rådata saknas eller tester/insamling misslyckades.

En ny commit betyder därför inte längre automatiskt att AI-analysen lyckades; statusen framgår uttryckligen i `status/latest.json`.

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

Uppdatera dessa filer när projektprioriteringar ändras. Det är denna kontext som gör radarn personlig i stället för till en generell GitHub Trending-lista.
