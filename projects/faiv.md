# Projekt: FAIV.se redesign och webshop

## Status
Aktivt kundprojekt.

## Kort beskrivning
FAIV.se ska utvecklas från en svag WordPress/WooCommerce-sida med låg eller ingen onlineförsäljning till en mer konverteringsdriven, modern och premium e-handel för fordonsbelysning, extraljus, LED-ramper och relaterade produkter.

Projektet drivs i WordPress, WooCommerce, Divi och Divi Child theme. Fokus är att förbättra första intrycket, hero, kategoriupplevelse, produktkort, kampanjer, trust, checkout och enkel administration.

## Mål
- Öka försäljningen i WooCommerce.
- Göra sidan mer lik en stark e-handelsaktör, med ekstralys.no som viktig visuell/UX-inspiration.
- Skapa tydliga vägar till både webbshop och verkstad.
- Göra det enkelt för FAIV att aktivera/inaktivera kampanjer i admin.
- Förbättra trust, produktpresentation, kategorisidor och köpupplevelse.
- Kunna testa kampanjer, rabattkoder och checkout säkert på staging innan live.

## Stack
- WordPress
- WooCommerce
- Divi
- Divi Child theme
- ACF Options Page för adminvänliga toggles
- Custom CSS/JS/PHP i child theme
- Eventuellt Microsoft Clarity / GA4 / Plausible för analys
- Staging: `https://faiv.se/excelsior/`

## Viktiga constraints
- Styling och WooCommerce-overrides ska ligga i Divi Child theme.
- Live ska inte påverkas innan godkännande.
- Divi Child theme ska kunna aktiveras som en tydlig switch när staging är klar.
- Hero och kampanjsektioner ska vara premium, automotive och konverteringsdrivna.
- Undvik generisk AI-design. Vid UI/designarbete ska relevant DESIGN.md från `https://github.com/voltagent/awesome-design-md` användas som designkälla om sådan finns.
- Hero-knappen `Våra tjänster` ska länka till `#tjanster`.
- Hero-knappen `Kontakta oss` ska länka till `#kontakt`.

## Relevanta GitHub-kategorier
- wordpress
- woocommerce
- divi
- php
- ecommerce
- conversion optimization
- product cards
- checkout
- web analytics
- campaign management
- ACF
- frontend UI
- CSS
- JavaScript
- WordPress admin UX

## Vad som vore värdefullt att hitta
- WooCommerce-produktkort och kategori-UX som kan inspirera FAIV.
- Adminvänliga kampanj-/bannerlösningar för WordPress.
- Bra WooCommerce checkout/testflöden.
- Verktyg för produktdata, produkttexter och internlänkning.
- UI-komponenter för premium automotive/e-commerce.
- Analytics/heatmap/event tracking som är enkelt att installera.
- Performance- och Core Web Vitals-verktyg för WordPress.
- AI-agent eller script som kan föreslå produkttexter, kategoritexter eller SEO-förbättringar från WooCommerce-data.

## Vad som inte är relevant
- Headless e-commerce som kräver total rebuild om det inte har tydlig migration/path från WooCommerce.
- Tunga enterprise-CMS som inte passar en mindre kund.
- Generiska SaaS-dashboardprojekt utan koppling till WordPress/WooCommerce.
- Komplexa design systems som kräver att hela FAIV byggs om från noll.

## Matchningsregler för AI Radar
Hög relevans om ett repo hjälper med:
- WooCommerce-konvertering
- WordPress admin-toggles
- produktkort/kategorisidor
- kampanjhantering
- premium e-commerce UI
- analytics/tracking
- AI-assisterad produkttext/SEO

Låg relevans om ett repo bara är allmän webapp-teknik utan tydlig koppling till WordPress, WooCommerce eller konvertering.
