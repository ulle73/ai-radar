# Projekt: Socials v2

## Status
Aktivt app-/SaaS-projekt med reviewutmaningar.

## Kort beskrivning
Socials v2 är en workspace-baserad app för content planning och publicering till Instagram och LinkedIn. Appen ska hjälpa användare planera, godkänna, schemalägga och publicera innehåll.

Projektet har haft särskilda utmaningar med Meta App Review och permissions för Instagram.

## Mål
- Bygga ett fungerande content planning + publishing-system.
- Stödja workspace-baserad hantering.
- Koppla Instagram professionella konton.
- Publicera/schemalägga Instagram-innehåll efter användarens godkännande.
- Hantera LinkedIn om det ingår i scope.
- Få igenom Meta App Review med tydliga videos och permission-motiveringar.

## Stack
- Next.js / React
- Supabase eller liknande DB/Auth
- Meta Graph API
- Instagram API permissions
- LinkedIn API
- Stripe/SaaS-flöden kan vara relevanta
- Vercel

## Viktiga Meta-permissions
- `instagram_business_basic`
- `instagram_business_content_publish`

## Viktiga constraints
- Meta App Review kräver extremt tydlig demonstration av appens flöde.
- UI/video kan behöva vara på engelska eller tydligt förklarad med engelska captions.
- Appen måste visa varför varje permission behövs.
- API-anrop/loggar och app roles kan påverka review.
- Publicering ska vara användarinitierad/godkänd, inte spammy automation.

## Relevanta GitHub-kategorier
- instagram api
- meta graph api
- linkedin api
- social media scheduler
- content calendar
- approval workflow
- SaaS
- workspace
- Next.js
- Supabase
- queue jobs
- cron jobs

## Vad som vore värdefullt att hitta
- Open source content calendar/scheduler-komponenter.
- Exempel på Meta Graph API integrationer.
- Hantering av OAuth, tokens och refresh.
- Schemaläggningsköer för publicering.
- Approval workflow UI.
- Multi-workspace SaaS-strukturer.
- Review-video/checklistor för Meta App Review.

## Vad som inte är relevant
- Spammy social media automation.
- Massposting utan användargodkännande.
- Repo som bryter mot plattformspolicys.
- Generiska social media dashboards utan API/publiceringsnytta.

## Matchningsregler för AI Radar
Hög relevans om ett repo hjälper med:
- Meta/Instagram API
- LinkedIn API
- content calendars
- scheduled jobs
- workspaces
- approval workflows
- OAuth/tokenhantering
- SaaS multi-tenant patterns

Låg relevans om det främst är growth-hacking, bots eller spam automation.
