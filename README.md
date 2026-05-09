# AI Radar

AI Radar är ett personligt research- och idéspaningsrepo för att bevaka nya/trendande GitHub-repon och koppla dem till mina aktiva projekt och idéer.

Målet är att skapa en daglig radar som hittar nya open source-verktyg, agents, automationer, devtools, e-handelslösningar, data-/tradingverktyg och andra repo-fynd som kan vara värda att testa i mina egna projekt.

## Vad systemet ska göra

Varje natt kör GitHub Actions ett cronjob som:

1. Hämtar nya/trendande/populära GitHub-repon via GitHub Search API.
2. Hämtar README för varje repo.
3. Sparar raw JSON med metadata + README-utdrag.
4. Skapar en daglig markdown-summary utan LLM-kostnad.
5. Commitar och pushar resultatet till detta repo.

Senare kan en ChatGPT Task läsa senaste summary-filen och jämföra fynden mot:

- `/projects` – aktiva projekt
- `/ideas` – idébank
- `/chatgpt-genererade-ideer` – AI-genererade idéförslag/kandidater

## Gratis baseline utan LLM

Den dagliga summary-filen skapas utan OpenAI/LLM-anrop. Den bygger på:

- repo-namn
- URL
- description
- stars
- forks
- språk
- topics
- created/updated/pushed timestamps
- README-utdrag
- enkel trend-score baserat på stjärnor, ålder och aktivitet

Det betyder att den dagliga insamlingen kan köras gratis med GitHub Actions och GitHub API. Den blir inte lika smart som en LLM-summary, men tillräckligt bra för att ChatGPT Task senare ska kunna läsa och analysera filen.

## Mappstruktur

```txt
.github/workflows/
  daily-github-radar.yml       # Nattligt cronjob

scripts/
  fetch-github-trending.mjs    # Hämtar repos, README och skriver filer

data/
  latest.json                  # Senaste raw-resultatet
  latest.md                    # Senaste markdown-summary
  raw/YYYY-MM-DD.json          # Daglig raw-data
  summaries/YYYY-MM-DD.md      # Daglig summary

projects/
  README.md                    # Lägg aktiva projektfiler här

ideas/
  README.md                    # Lägg idéfiler här

chatgpt-genererade-ideer/
  README.md
  candidates/                  # Nya AI-idéer som inte är godkända än
  approved/                    # Idéer som är värda att spara vidare
  rejected/                    # Idéer som ska ignoreras
```

## Manuell körning

```bash
npm run radar
```

Det kräver Node.js 20+.

Lokalt kan du sätta en GitHub-token för högre API-limit:

```bash
GITHUB_TOKEN=ghp_xxx npm run radar
```

I GitHub Actions används automatiskt `secrets.GITHUB_TOKEN`.

## Konfiguration

Workflow/script kan styras med miljövariabler:

| Variabel | Default | Beskrivning |
| --- | ---: | --- |
| `RADAR_MAX_REPOS` | `30` | Max antal repon att spara per körning |
| `RADAR_README_MAX_CHARS` | `25000` | Max README-tecken som sparas i raw JSON |
| `RADAR_SUMMARY_README_CHARS` | `1600` | Max README-utdrag i markdown-summary |
| `RADAR_NEW_DAYS` | `7` | Hur långt bak nya repon ska sökas |
| `RADAR_PUSHED_DAYS` | `7` | Hur långt bak nyligen pushade repon ska sökas |
| `RADAR_MIN_STARS_NEW` | `20` | Minsta stars för nya repon |
| `RADAR_MIN_STARS_ACTIVE` | `500` | Minsta stars för nyligen aktiva repon |
| `RADAR_KEYWORDS` | se script | Kommaseparerade extra keywords att bevaka |

## ChatGPT Task-prompt för senare

När daily radar är igång kan en ChatGPT Task använda ungefär denna instruktion:

```txt
Varje dag: läs senaste filen i /data/latest.md i repo ulle73/ai-radar.
Läs även /projects/*.md, /ideas/*.md och /chatgpt-genererade-ideer/candidates/*.md om de finns.

Gör följande:
1. Summera de viktigaste repo-fynden.
2. Matcha varje relevant repo mot mina aktiva projekt.
3. Matcha varje relevant repo mot min idébank.
4. Föreslå max 3 konkreta actions.
5. Föreslå max 3 nya idékandidater, men lägg dem inte automatiskt i /ideas utan markera dem som candidates.
6. Lista vilka repon som är brus och bör ignoreras.
```

## Viktigt om “trending”

GitHub har inget officiellt REST-API för exakt samma lista som sidan `github.com/trending`. Därför använder detta repo en praktisk approximation:

- nya repon med snabb star-tillväxt
- nyligen aktiva populära repon
- keyword-baserade sökningar inom områden som AI agents, automation, Next.js, Supabase, WordPress, WooCommerce, scraping, trading och devtools

Det är tillräckligt för syftet: att hitta relevanta repo-fynd tidigt och koppla dem till projekt/idéer.

## Rekommenderat arbetsflöde

1. Låt GitHub Actions samla data varje natt.
2. Låt ChatGPT Task läsa `/data/latest.md` varje morgon.
3. Om något är intressant: skapa en idékandidat under `/chatgpt-genererade-ideer/candidates`.
4. Flytta bara starka idéer till `/ideas` manuellt eller efter tydligt beslut.
5. Använd Codex först när något ska implementeras i ett riktigt projekt.
