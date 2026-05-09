# Projekt: AI Byggstart / Bygg med AI

## Status
Aktiv produktidé / planerat MVP-projekt.

## Kort beskrivning
En svensk AI-byggplattform som hjälper användare gå från idé till byggbar MVP. Produkten ska inte kännas som en statisk AI-kurs, utan som ett system som guidar användaren genom idétest, rekommenderad byggväg, prompts, templates, felsökning och deployment.

Målgruppen är entreprenörer, konsulter och småföretagare som vill bygga MVP:er, lead generators, dashboards, automationer eller interna appar med AI-stöd.

## Mål
- Skapa premium landningssida.
- Bygga ett gratis “byggtest” som ger rekommenderad track, 7-dagars plan, första prompt och risklista.
- Bygga en portal med moduler, promptbibliotek, troubleshooting guides, templates och checklistor.
- Stripe-gate:a paid content.
- Göra det praktiskt och action-orienterat, inte kursigt.
- Differentiera genom verklig felsökning: Vercel, Supabase, Stripe, Git, env vars, RLS osv.

## Föreslagen pricing
- Launch: cirka 199 kr
- Normalpris kan senare vara högre
- Pro-version kan innehålla mer avancerade templates, personliga byggspår eller mer guidning

## Stack
- Next.js
- React
- Tailwind
- shadcn/ui
- Supabase Auth + DB
- Stripe Checkout + webhooks
- Vercel
- Analytics: PostHog/Plausible/GA4
- Markdown/content collections

## MVP-innehåll
- Landningssida
- Gratis byggtest
- Portal login
- 5 core modules
- Cirka 30 prompts
- Cirka 15 troubleshooting guides
- Templates/checklists:
  - PRD.md
  - AI_RULES.md
  - DEPLOY_CHECKLIST.md
  - SECURITY_CHECKLIST.md
  - SUPABASE_CHECKLIST.md
  - STRIPE_CHECKLIST.md

## Viktiga constraints
- Ska kännas som ett byggsystem, inte en kurs.
- Ska vara svenskt, konkret och praktiskt.
- Ska fokusera på verkliga problem som uppstår när man bygger med AI.
- UI/design ska inte freebasas generiskt. Vid UI/designarbete bör relevant DESIGN.md från `https://github.com/voltagent/awesome-design-md` användas som designkälla.
- För mycket avancerad agent-teknik får inte göra MVP:n tung.

## Relevanta GitHub-kategorier
- AI agents
- prompt library
- learning platform
- Next.js
- Supabase
- Stripe
- Vercel
- templates
- troubleshooting
- developer education
- app starter kits
- boilerplates
- code generation

## Vad som vore värdefullt att hitta
- Bra open source-portaler för kurser/content.
- Promptbibliotek och prompt-management.
- Agent workflows som kan guida användare steg för steg.
- Boilerplates för Next.js + Supabase + Stripe.
- Felsökningsverktyg för deployment, env vars, Stripe webhooks, Supabase RLS.
- UI-kit för premium learning/productized service.
- Markdown-baserade docs/portal-lösningar.

## Vad som inte är relevant
- Generiska AI-kurser utan byggsystem.
- För tunga LMS-system.
- Enterprise learning platforms.
- Kodgenereringsverktyg som kräver dyra API-kostnader direkt i MVP.

## Matchningsregler för AI Radar
Hög relevans om ett repo hjälper med:
- AI-byggflöden
- promptbibliotek
- app templates
- Next/Supabase/Stripe boilerplate
- troubleshooting docs
- deployment automation
- onboarding/step-by-step flows

Låg relevans om repo mest är teori, kursmaterial eller generell AI-hype utan praktisk byggnytta.
