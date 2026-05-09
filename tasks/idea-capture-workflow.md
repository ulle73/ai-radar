# Idea Capture Workflow

Det här dokumentet beskriver hur nya idéer som Jonas postar i ChatGPT-tråden ska sparas i AI Radar.

## Grundregel

När Jonas postar en ny idé, ett nytt ämne för deep research eller börjar resonera om en möjlig produkt/affärsidé i ChatGPT-tråden ska ChatGPT hjälpa till att omvandla den till en strukturerad idéfil.

Idéfilen ska normalt sparas under:

```txt
ideas/
```

Om idén är väldigt lös, oprövad eller AI-genererad från GitHub Radar bör den först sparas under:

```txt
chatgpt-genererade-ideer/candidates/
```

## När en idé ska sparas direkt i `/ideas`

Spara direkt i `/ideas` när idén har minst ett av följande:

- Jonas har själv formulerat idén.
- Idén har tydlig affärspotential.
- Idén kan bli ett projekt, en produkt, en researchfråga eller ett test.
- Jonas uttrycker att idén ska sparas, utredas eller följas upp.

## När en idé ska sparas som kandidat

Spara i `chatgpt-genererade-ideer/candidates/` när:

- idén huvudsakligen kommer från GitHub Radar eller AI-förslag
- idén är intressant men osäker
- idén kan vara brus
- Jonas inte uttryckligen har godkänt den som riktig idé

## Rekommenderat filnamn

Använd kebab-case:

```txt
ideas/ai-wedding-planner.md
ideas/golf-training-aids.md
ideas/cold-email-system.md
```

## Rekommenderad struktur

```md
# Idé: Namn

## Status
Ny idé / aktiv researchidé / pausad / kandidat

## Kort beskrivning

## Problem

## Målgrupp

## Affärspotential

## Möjlig MVP

## Stack / implementation

## Vad GitHub-radarn bör leta efter

## Vad som ska ignoreras

## Matchningsregler för AI Radar
```

## Viktigt

- Skriv kort och tydligt.
- Lägg hellre till en första enkel version snabbt än att vänta på perfekt research.
- Uppdatera filen senare när mer research finns.
- Fyll inte idébanken med brus. Kandidater kan ligga separat tills Jonas godkänner dem.
