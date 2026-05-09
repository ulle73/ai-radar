# Idé: AI-plattform för bröllopsplanering

## Status
Aktiv idé/researchspår.

## Kort beskrivning
En AI-driven bröllopsplattform där par kan planera hela bröllopet genom naturligt språk och ett projektminne, snarare än att hoppa mellan kalkylblad, dokument, designverktyg, chattar och PDF:er.

Kärnan är inte “en chatbot”, utan ett system som förstår budget, gästlista, relationer, bordsplacering, körschema, designstil, texter och leverantörsdata — och genererar konkreta leverabler.

## Problem
Bröllopsplanering är fragmenterad, emotionellt laddad och administrativt tung. Par måste hantera budget, gästlista, relationer, texter, körschema, leverantörer och design i många olika verktyg samtidigt.

## Målgrupp
- Förlovade par i Sverige.
- Par som vill planera själva men behöver struktur.
- Bröllopskoordinatorer som vill effektivisera administration.
- Mindre leverantörer/venues som vill erbjuda planeringsstöd.

## Affärspotential
Möjligt som B2C-produkt med engångsköp, prenumeration eller premium templates. Kan även ha B2B-spår mot bröllopskoordinatorer/venues.

Sverige verkar inte ha lika tydliga AI-native konkurrenter som USA, men konkurrens finns indirekt från checklistor, mallar, planners, Notion templates, koordinatorer och internationella appar.

## Möjlig MVP
- Landningssida + bröllopstest.
- AI-projektminne för budget, datum, stil och gästlista.
- Generera checklista och 90-dagars plan.
- Gästlista + bordsplaceringslogik i enkel version.
- Textgenerator för inbjudan, vigselprogram, tackkort, talutkast.
- Export till PDF/CSV.

## Leverabler produkten kan skapa
- Budgetförslag
- Checklista
- Körschema
- Inbjudningstext
- Vigselprogram
- Talutkast
- Bordsplacering
- Leverantörsbrief
- Att-göra-listor

## Stack / implementation
- Next.js
- Supabase
- Stripe
- LLM API
- PDF-export
- CSV/Excel export
- Dokument-/template-system
- Eventuell drag-and-drop för bordsplacering

## Vad GitHub-radarn bör leta efter
- AI planning tools.
- Event planning templates.
- PDF/document generation.
- Guest list / seating chart UI.
- Drag-and-drop table planners.
- Budget planners.
- AI document/template generation.
- Notion-like project memory.

## Vad som ska ignoreras
- Generiska wedding inspiration sites utan teknisk nytta.
- Endast design/invitation templates utan planeringslogik.
- Enterprise event management som är för tungt.

## Matchningsregler för AI Radar
Hög relevans om ett repo hjälper med:
- AI project memory
- checklist/planning systems
- PDF export
- guest list/seating chart
- budget planner
- template generation
- Notion-like docs

Låg relevans om det bara är generiska wedding templates utan app-/systemnytta.
