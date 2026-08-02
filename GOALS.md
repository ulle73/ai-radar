# GOALS.md

Det här dokumentet är AI Radars norrstjärna.

Alla GitHub-fynd, repo-rankningar och Telegram-notiser ska bedömas mot de aktiva projekten i `projects/catalog.json`. Den filen är den kanoniska källan för projektnamn, affärsmål, befintliga funktioner, teknik, aktuella behov, tillväxtmotorer och negativa matchningar.

Äldre projektfiler i `projects/*.md` är historisk dokumentation och ska inte användas som modellens source of truth.

## Övergripande mål

AI Radar ska hitta praktiska open source-verktyg, tekniska metoder, dataresurser, workflows och komponenter som hjälper Jonas att:

1. dra in mer pengar,
2. bygga och validera snabbare,
3. förbättra befintliga produkter,
4. minska manuellt och felkänsligt arbete,
5. skapa bättre content och kampanjer,
6. få starkare data, analys och beslutsunderlag,
7. hitta nya möjligheter som kan testas billigt.

Radarn ska inte hitta “coola repos”. Den ska hitta något som har en tydlig plats i ett namngivet projekt och som går att testa praktiskt.

## Kanoniska projekt

AI Radar följer exakt dessa nio projektprofiler, i prioriterad ordning:

1. **Golfkuponger**
2. **Stock Signals**
3. **Ullebets**
4. **Nyabolaget-ekosystemet**
5. **FAIV**
6. **AI Radar**
7. **Sankdig**
8. **Res-kungen**
9. **Apify Scraper**

Den följer inte alla Jonas GitHub-repos. Kopior, skolprojekt, mallar, presentationer, gamla versioner och inaktiva experiment ska inte påverka matchningen.

## Prioritering

### Primära Telegram-projekt

Följande projekt får utlösa Telegram när matchningen är exceptionell och exact:

1. Golfkuponger
2. Stock Signals
3. Ullebets
4. Nyabolaget-ekosystemet
5. FAIV
6. AI Radar

### Striktare sekundära projekt

Följande projekt finns i ranking och discovery men ska bara notifiera när nyttan är direkt kopplad till ett aktuellt produkt-, publik- eller intäktsmål:

7. Sankdig
8. Res-kungen
9. Apify Scraper

## Exakt matchning

Ett externt repo får klassas som `exact` endast när det gör minst en av följande saker i en projektprofil:

- löser ett namngivet `current_need`,
- förbättrar ett befintligt `core_workflow`,
- möjliggör en definierad `growth_lever`,
- ersätter konkret utvecklingsarbete som annars behöver byggas,
- tillför en datakälla eller metod som kan testas i projektets verkliga flöde.

Gemensam teknik, bransch eller ämnesord räcker inte.

Exempel som **inte** räcker:

- båda använder Next.js,
- båda handlar om AI,
- båda har Telegram,
- båda handlar om golf,
- båda använder scraping,
- repot har många stars,
- repot är populärt på GitHub Trending.

## Vad varje stark rekommendation måste svara på

En stark eller exceptionell match ska tydligt ange:

1. Vilket exakt projekt gäller det?
2. Vilket befintligt problem, arbetsflöde eller tillväxtmål påverkas?
3. Vad finns redan i projektet?
4. Vad tillför repot som inte redan finns?
5. Vilken konkret ekonomisk, produktmässig eller teknisk nytta kan uppstå?
6. Vad är viktigaste risken eller antagandet?
7. Vilket litet test ska Jonas göra först?

Om detta inte kan besvaras ska matchningen vara `adjacent` eller `generic`.

## Affärsprioritet

När två repos är tekniskt lika bra ska AI Radar prioritera det som har tydligast väg till:

1. mer intäkt,
2. högre konvertering,
3. större ordervärde eller återköp,
4. fler B2B-kunder eller partners,
5. lägre kostnad eller mindre manuellt arbete,
6. bättre datakvalitet eller beslut,
7. snabbare validering av en produktidé.

Teknisk elegans utan tydlig effekt ska väga lågt.

## Projektprinciper

### Golfkuponger

Golfkuponger är högst prioriterat. Norrstjärnan är ökade intäkter genom Shopify-konvertering, friskvård, B2B/företagspaket, presentköp, återköp, content, nya klubbar och distributionspartners. App, digitala kuponger och partnerflöden finns redan. Radarn ska förbättra det befintliga systemet, inte föreslå att grunden byggs om från noll.

### Stock Signals

Prioritera transparenta datakällor, indikatorer, signalvalidering, optionskontext, walk-forward-testning, charting, datakvalitet och notifieringar. Black-box trading och obevisad historisk avkastning ska filtreras bort.

### Ullebets

Prioritera odds capture, canonical identity, data coverage, leakage-safe modelltestning, CLV, settlement, observability, read-API och frontend för league rankings och matchup scores. Tipsterrepos och stakinghype är inte relevanta.

### Nyabolaget-ekosystemet

Skilj alltid mellan Nyabolaget.se, Företagslistor.se och datapipelinen. Prioritera partnerkonvertering, onboarding, programmatisk SEO, lifecycle-flöden, företagsdata, deduplicering, listförsäljning, Stripe och automatisk leverans. Spamverktyg är inte relevant.

### FAIV

Prioritera WooCommerce-intäkt, SEO, produktdata, recensioner, content intelligence, kampanjer, WordPress-prestanda och koppling mellan content, produkt, lead och order. Generisk AI-content och automatiserad kopiering ska filtreras bort.

### AI Radar

Prioritera bättre project context, repo discovery, strukturerad LLM-output, evidens, calibration, feedback, observability och Telegram UX. Ett generiskt agent- eller memoryrepo är inte relevant utan en konkret förbättring av radarns pipeline.

### Sankdig

Radarn får hitta både tekniska förbättringar och nya verifierbara golfämnen/datamöjligheter. En stark match ska kunna bli ett konkret nytt ämne för målgruppen eller förbättra sourcing, källkontroll, rendering, publicering eller analytics.

### Res-kungen

Prioritera riktig rese- och prisdata, flexible dates, multi-airport, geo, destination similarity, affiliate och boende-attach. Produkten ska fortsätta ge 3–5 bra val och inte bli ännu en generell itinerary-chatbot.

### Apify Scraper

Bedöm projektet som extern kundbetald SaaS. Prioritera billing, credits, margins, job reliability, data quality, multi-tenancy, export och scrapers med tydlig betalningsvilja. Fler scrapers är inte värde i sig.

## Föredragen teknik och arbetssätt

Teknisk passform är positiv när den ligger nära ett projekts verkliga stack, bland annat:

- Next.js, React, TypeScript och Node.js,
- Shopify för Golfkuponger,
- WordPress och WooCommerce för FAIV,
- Python där Ullebets och contentpipelines använder det,
- PostgreSQL, Supabase, Neon och MongoDB där de redan finns,
- Stripe,
- GitHub Actions,
- Apify,
- OpenAI/OpenRouter och strukturerade LLM-flöden,
- Telegram,
- robusta cronjobs, queues och data pipelines.

Stackmatchning får dock aldrig ensam skapa en exact-match.

## Filtrera bort brus

Repos ska få låg relevans om de är:

- hype utan praktisk nytta,
- generiska agent- eller MCP-ramverk,
- för enterprise eller dyra att införa,
- långt från ett aktuellt behov,
- svåra att testa,
- black-box inom trading eller betting,
- spammy inom lead generation,
- osäkra juridiskt eller datamässigt,
- ersättningar för något som redan finns,
- stora sidoprojekt med oklar payoff.

## Rankingprincip

Bedöm varje repo utifrån:

- exakt projektmatchning,
- konkret intäkts-, tids- eller produktnytta,
- enkelhet att testa,
- teknisk integrationspassning,
- kvalitet och aktivitet i repot,
- timing,
- evidens från README och metadata,
- viktigaste risk,
- om det skapar ny edge eller bara duplicerar befintlig funktion.

Den bästa typen av fynd är:

> Ett välunderhållet repo som löser ett känt problem i ett namngivet projekt, passar befintlig arkitektur, kan testas inom dagar och har tydlig väg till intäkt, högre kvalitet eller betydande tidsbesparing.
