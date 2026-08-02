# Canonical AI Radar Project Profiles

## Goal

AI Radar ska matcha externa GitHub-repos mot Jonas verkliga, aktiva projekt och affärsmål utan att läsa alla hans GitHub-repos eller förlita sig på vaga projektnamn.

## Canonical source

`projects/catalog.json` blir den enda kanoniska projektkatalogen för modellmatchning. Äldre fristående markdownprofiler får ligga kvar som historisk dokumentation men ska inte laddas in i analyskontexten.

Katalogen innehåller exakt nio profiler:

1. Golfkuponger
2. Stock Signals
3. Ullebets
4. Nyabolaget-ekosystemet
5. FAIV
6. AI Radar
7. Sankdig
8. Res-kungen
9. Apify Scraper

## Profile contents

Varje profil ska innehålla:

- stabilt `id` och exakt `display_name`,
- prioritet och notifieringsnivå,
- huvudrepo och stödrepos,
- alias som modellen kan känna igen,
- tydlig produktbeskrivning,
- norrstjärna och affärsmodell,
- målgrupper,
- befintliga funktioner och arbetsflöden,
- nuvarande problem och begränsningar,
- tillväxt- och intäktsmotorer,
- teknisk stack,
- områden där externa repos kan skapa hög nytta,
- discovery-termer,
- negativa matchningar,
- krav för att få klassas som en exakt match,
- fokus för Telegram-formuleringen.

## Matching behavior

Modellen ska använda katalogens exakta `display_name` i `project_matches`. En matchning får vara `exact` endast när det externa repot:

1. löser ett namngivet problem,
2. förbättrar ett befintligt arbetsflöde,
3. möjliggör en definierad tillväxtmotor, eller
4. ersätter konkret utvecklingsarbete i profilen.

Gemensam teknik eller ett gemensamt ämnesord räcker inte.

## Priority

Primära Telegram-projekt:

1. Golfkuponger
2. Stock Signals
3. Ullebets
4. Nyabolaget-ekosystemet
5. FAIV
6. AI Radar

Sankdig, Res-kungen och Apify Scraper får notifiera endast vid mycket specifik och stark matchning.

## Context loading

Den nuvarande godtyckliga kapningen efter 32 000 tecken ersätts med en prioriterad loader:

1. `GOALS.md`
2. hela `projects/catalog.json`
3. frivillig idékontext i återstående budget

Kärnkontexten får aldrig kapas mitt i projektkatalogen. Om katalogen är ogiltig eller inte ryms ska analysen stoppa tydligt i stället för att tyst förlora projekt.

## Validation

Katalogen ska valideras deterministiskt:

- version är ett positivt heltal,
- `projects` är en icke-tom array,
- projekt-ID:n och visningsnamn är unika,
- prioritet är unik och positiv,
- obligatoriska text- och arrayfält finns,
- exakt nio förväntade projekt-ID:n finns.

## Golfkuponger

Golfkuponger ska beskrivas som en Shopify-baserad golfvärdesplattform, inte som ett vanligt presentkortsplugin. Privatpersoner köper digitala värdebevis; företag kan köpa digitala och fysiska företagspaket. Kupongerna kan användas hos 300+ svenska golfklubbar och via utvalda internationella partners. App och partnerflöden finns redan.

Norrstjärnan är ökade intäkter genom fler privatkunder, mer friskvårdsförsäljning, större B2B-affärer, bättre Shopify-konvertering, återköp, fler distributionspartners och starkare klubbnätverk.

## Testing

Tester ska verifiera att:

- katalogen innehåller exakt de nio projekten,
- samtliga projekt kommer med i renderad modellkontext,
- Golfkuponger innehåller Shopify och intäktsfokus,
- Apify Scraper är SaaS,
- Sankdig inkluderar nya golfämnen och datakällor,
- optional idékontext kapas före kärnkontexten,
- ogiltig katalog ger ett tydligt fel.
