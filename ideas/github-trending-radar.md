# Idé: GitHub Trending Radar / AI Radar

## Status
Aktivt systemprojekt.

## Kort beskrivning
Ett personligt AI-radar-system som dagligen hämtar trendande/populära GitHub-repon, README och metadata, sparar dem i ett repo och låter ChatGPT Task analysera vad som passar Jonas aktiva projekt och idébank.

## Problem
Det kommer hela tiden nya open source-verktyg, agents, boilerplates och developer tools. Utan systematisk bevakning missar man relevanta möjligheter eller drunknar i brus.

## Mål
- Dagligen hitta relevanta GitHub-repon.
- Spara historik i markdown/JSON.
- Jämföra fynd mot aktiva projekt.
- Jämföra fynd mot idébank.
- Föreslå konkreta actions.
- Skapa nya idékandidater utan att fylla huvudidébanken med brus.

## Nuvarande implementation
Repo: `ulle73/ai-radar`

Systemet använder:
- GitHub Actions cron
- GitHub Trending daily
- GitHub Trending weekly
- GitHub Trending Developers weekly
- GitHub Search API
- README-hämtning
- Raw JSON + markdown summary

## Möjlig vidareutveckling
- ChatGPT Task läser `data/latest.md` varje morgon.
- Veckosammanfattning som hittar mönster.
- Scoring mot `/projects` och `/ideas`.
- Automatisk creation av idékandidater i `/chatgpt-genererade-ideer/candidates` via GitHub Actions + LLM API om man vill lägga till kostnad senare.
- Dashboard/webbvy över fynd.
- Filtering per kategori: AI agents, e-commerce, trading, leadgen, devtools.

## Stack / implementation
- GitHub Actions
- Node.js
- GitHub API
- Markdown/JSON
- ChatGPT Task
- Eventuellt OpenAI API senare

## Vad GitHub-radarn bör leta efter för denna idé
- Tools för repo-intelligence.
- GitHub trend scraping.
- README summarization.
- Open source monitoring.
- LLM scoring pipelines.
- GitHub Actions automation.
- Static dashboards for markdown/JSON.

## Vad som ska ignoreras
- Tunga enterprise intelligence platforms.
- Betalda trendverktyg utan tydlig nytta.
- Repo-recommendation som inte kan anpassas mot egna projekt.

## Matchningsregler för AI Radar
Hög relevans om ett repo hjälper med:
- trendspaning
- repo crawling
- README extraction
- markdown knowledge base
- scoring/ranking
- GitHub Actions automation
- ChatGPT/LLM workflow

Låg relevans om det bara är social trend browsing utan automatisering eller filbaserad historik.
