# Projekt: stock-signals

## Status
Aktivt tekniskt/researchprojekt.

## Kort beskrivning
Eget datasystem och signalsystem för aktiemarknaden, främst S&P 500 och marknadsbredd. Målet är att skapa extremt förenklade signaler utan öppna tolkningar.

Systemet ska inte säga saker som “long-bias”, “var försiktig”, “bevaka” eller “kanske”. Det ska ge tydliga, binära eller mycket konkreta signaler baserat på indikatorer.

## Mål
- Bygga en stabil indikatorpipeline.
- Samla tekniska indikatorer, breadth-indikatorer och makroindikatorer.
- Skapa enkla signalregler ovanpå indikatorerna.
- Undvika subjektiva tolkningar.
- Kunna köra dagliga uppdateringar.
- Kunna lagra indikatorer i databas/tabeller som `stock_daily_indicators`.

## Stack
- Node.js
- PostgreSQL/Supabase-liknande databas
- GitHub repo: `stock-signals`
- CLI-scripts
- Web scraping/API-källor
- Eventuellt Playwright för svårare datakällor
- Barchart, FRED, Yahoo/andra gratis datakällor om tillgängliga

## Indikatorområden
- SMA/MA, t.ex. SMA200
- Market breadth, t.ex. stocks above moving averages
- OBV / z-score-varianter
- Volymindikatorer
- Risk-on/risk-off
- Makroindikatorer
- Ränta, kredit, inflation, arbetsmarknad, likviditet
- Sentiment/volatilitet om gratis data finns

## Viktiga constraints
- Signaler ska vara extremt enkla.
- Systemet ska inte ge öppna tolkningar.
- Indikatorer bör byggas först, signaler ovanpå när datan finns.
- Gratis datakällor prioriteras.
- Scraping ska vara robust, inte för skört.
- Trading/investeringsoutput ska ses som analysverktyg, inte finansiell rådgivning.

## Relevanta GitHub-kategorier
- trading indicators
- quant
- market breadth
- technical analysis
- financial data
- macro data
- scraping
- backtesting
- time series
- postgres
- nodejs
- playwright
- charting

## Vad som vore värdefullt att hitta
- Open source-bibliotek för tekniska indikatorer i Node.js.
- Gratis datakällor för breadth/makro.
- FRED API-exempel.
- Robust scraping av finansiella sidor.
- Backtesting-ramverk som är enkelt nog.
- Risk management-regler som kan kodas binärt.
- Databasmodeller för daily indicators.
- Verktyg för att bygga signaler som kan testas historiskt.

## Vad som inte är relevant
- Crypto-only trading bots om de inte har generell indikatornytta.
- Högfrekvenshandel.
- Komplexa ML-modeller som inte går att förklara enkelt.
- Betalda datakällor utan tydlig gratis nivå.
- Repo som mest säljer en tradingkurs eller black-box-strategi.

## Matchningsregler för AI Radar
Hög relevans om ett repo hjälper med:
- tekniska indikatorer
- breadth-data
- makrodata
- gratis finansiella datakällor
- scraping/API-hämtning
- backtesting
- daily jobs/pipelines
- tydliga signalregler

Låg relevans om ett repo är hype, black-box, crypto-only eller saknar tydlig datanytta.
