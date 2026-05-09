# Projekt: företagslistor.se / nyabolaget data- och listplattform

## Status
Aktivt projekt.

## Kort beskrivning
En plattform för att sälja filtrerade företagslistor, särskilt nystartade bolag i Sverige. Data hämtas från SCB/Bolagsverket-relaterade öppna källor, processas till Excel/CSV och ska kunna köpas via en webbsida med Stripe.

Projektet inkluderar även pipeline för dagliga/veckovisa datauttag, exportfiler, leveransklara filer, adminflöde och eventuellt automatiserad leverans efter betalning.

## Mål
- Sälja filtrerade listor med nystartade företag.
- Göra köpet enkelt: välj filter, se antal/pris, betala med Stripe, få Excel/CSV.
- Kunna trigga SCB-hämtningar över valfria datumintervall i admin.
- Automatisera daglig pipeline och exports.
- Skapa trovärdig landningssida med listpreview och tydlig nytta.
- Få dataformatet stabilt för leverans, sälj och e-postkampanjer.

## Stack
- Next.js
- React
- Tailwind
- shadcn/ui
- Supabase Postgres/Auth/Storage
- Stripe Checkout + webhooks
- Vercel
- Node.js scripts
- Excel/CSV exports
- SCB API / öppna datakällor

## Viktiga datafält
Delivery-ready filer bör innehålla:
- E-post
- Företagsnamn
- OrgNr
- Säteslän
- Säteskommun
- Bransch
- Telefon
- Kontaktperson namn
- Kontaktperson roll
- PostAdress
- PostNr

## Viktiga constraints
- Excel `.xlsx` bör vara standardformat om exportflödet stödjer det stabilt.
- Stripe webhooks måste vara stabila.
- MAX_SNAPSHOT_AGE_DAYS eller liknande gating ska inte råka blocka köpflöden.
- Datakvalitet och leveransbarhet är viktigare än snygg SaaS-känsla.
- UI bör visa listpreview med riktiga kolumner, inte generisk AI-hero.
- Köparen ska förstå: data från offentliga källor, direkt leverans, Excel-kompatibelt, säkert betalt.

## Relevanta GitHub-kategorier
- nextjs
- stripe
- supabase
- excel export
- csv export
- data pipeline
- scraping
- public data
- lead generation
- B2B lists
- admin dashboard
- cron jobs
- webhooks
- vercel

## Vad som vore värdefullt att hitta
- Bra exempel på Stripe-gated digital file delivery.
- Scripts för Excel/CSV-generering i Node.
- Admin dashboards för data exports.
- Billiga/enkla databerikningsverktyg.
- Scraping/ETL-verktyg som passar Node/Vercel/GitHub Actions.
- Webhook-retry och logging-lösningar.
- UI-patterns för filter → antal → pris → checkout.
- Open source-verkyg för e-postvalidering eller datarensning.

## Vad som inte är relevant
- Stora enterprise data warehouses.
- Komplexa no-code pipelines om de blir dyra.
- Lead-gen SaaS som inte kan anpassas till svensk bolagsdata.
- System som kräver manuell handpåläggning för varje export.

## Matchningsregler för AI Radar
Hög relevans om ett repo hjälper med:
- SCB/datahämtning
- lead list generation
- Excel/CSV export
- Stripe digital delivery
- Supabase admin/dataflöden
- cronjobs och automatiserad pipeline
- scraping och datarensning

Låg relevans om det bara är generell CRM/SaaS utan koppling till dataexport, leadlistor eller digital leverans.
