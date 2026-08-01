# Personal AI Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bygg en personlig GitHub-radar med strukturerad analys, hård filtrering, notifieringskö och kumulativ ranking.

**Architecture:** Behåll befintlig GitHub-insamling. Lägg analyslogik i små testbara moduler, använd OpenRouter i batchar med JSON-output, beräkna poäng och actions deterministiskt och skriv permanenta state/ranking/notifieringsfiler.

**Tech Stack:** Node.js 20+, ES modules, built-in `node:test`, GitHub Actions, OpenRouter API, JSON/Markdown.

## Global Constraints

- Inga nya npm-dependencies.
- Vanliga dagar får ge noll notifieringar.
- Max fem `Testa nu` och max tio `Spara för senare` i rankingen.
- Modellfel ska ge `degraded`, inte falsk `healthy`.
- Telegram-transport ligger utanför första implementationen; pending-kön ska vara transportoberoende.

---

### Task 1: Scoring and validation

**Files:** `scripts/lib/assessment.mjs`, `tests/ai-radar.test.mjs`

- [x] Skriv tester för fasta dimensioner, actions, JSON-extraktion, validering och konservativ fallback.
- [x] Implementera bedömningshjälparna.
- [x] Verifiera testerna lokalt.

### Task 2: Catalog and notification rules

**Files:** `scripts/lib/catalog.mjs`, `tests/ai-radar.test.mjs`

- [x] Testa first/last seen, sortering, actiongränser och notifieringsdeduplicering.
- [x] Implementera kumulativ katalog och pending-kö.
- [x] Verifiera testerna lokalt.

### Task 3: Deterministic rendering

**Files:** `scripts/lib/render.mjs`, `tests/ai-radar.test.mjs`

- [x] Testa ranking, status och tomma notifieringsdagar.
- [x] Implementera markdown-renderers.

### Task 4: Daily analyzer

**Files:** `scripts/analyze-radar.mjs`, `package.json`

- [x] Testa en komplett degraded-körning utan OpenRouter.
- [x] Implementera batchad OpenRouter-analys och per-repo fallback.
- [x] Skriv state, ranking, notifieringar och status.
- [x] Lägg till `analyze`, `rank` och `test` scripts.

### Task 5: Workflow and documentation

**Files:** `.github/workflows/daily-github-radar.yml`, `.github/workflows/test.yml`, `README.md`

- [x] Kör tester före nattlig insamling.
- [x] Byt från fri markdown-ranking till strukturerad analys.
- [x] Committera data, ranking, state, notifieringar och status.
- [x] Lägg till separat PR-testworkflow.
- [x] Dokumentera secrets, outputs och framtida Telegram-koppling.
