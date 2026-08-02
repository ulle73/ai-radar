# Canonical Project Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give AI Radar a validated, complete and priority-aware source of truth for Jonas nine active projects so every external repo can be matched against concrete needs and business goals.

**Architecture:** Store project knowledge in one versioned JSON catalog and load it through a small deterministic context module. Always include the full catalog before optional idea files, validate all required projects and stop on invalid core context instead of silently truncating it.

**Tech Stack:** Node.js 20 ESM, built-in `node:test`, JSON, Markdown, GitHub Actions.

## Global Constraints

- The canonical catalog contains exactly nine active project profiles.
- All nine profiles must always reach the model prompt.
- Legacy `projects/*.md` files are not part of the canonical matching context.
- Core context may never be silently truncated.
- Optional idea context is lower priority and may be truncated.
- Add no runtime dependencies.
- Prefer false negatives over vague project matches.

---

### Task 1: Project catalog contract

**Files:**
- Create: `projects/catalog.json`
- Create: `tests/project-context.test.mjs`

**Interfaces:**
- Catalog root: `{ version, updated_at, matching_policy, projects }`.
- Each project exposes stable identity, business context, technical context, matching targets and exclusions.

- [ ] Write failing tests that load `projects/catalog.json` and require the exact nine project IDs.
- [ ] Add assertions for Golfkuponger Shopify/intäktsfokus, Apify Scraper SaaS and Sankdig data-topic scope.
- [ ] Create the complete catalog with all nine profiles.
- [ ] Run `npm test` and keep loader-related tests failing until Task 2.

### Task 2: Deterministic context loader

**Files:**
- Create: `scripts/lib/project-context.mjs`
- Modify: `scripts/analyze-radar.mjs`
- Test: `tests/project-context.test.mjs`

**Interfaces:**
- `EXPECTED_PROJECT_IDS: string[]`
- `validateProjectCatalog(catalog): string[]`
- `renderProjectCatalog(catalog): string`
- `loadAnalysisContext({ root, maxChars }): Promise<string>`

- [ ] Add failing tests proving all project display names survive a small optional-context budget.
- [ ] Add a failing test for duplicate or missing project IDs.
- [ ] Implement catalog validation and deterministic priority sorting.
- [ ] Render concise JSON-derived model context with explicit exact-match rules.
- [ ] Load `GOALS.md` and the full catalog before optional ideas/candidates.
- [ ] Throw when mandatory context exceeds `maxChars`; truncate only optional context.
- [ ] Replace the old local `loadContext` implementation in `scripts/analyze-radar.mjs`.
- [ ] Run `npm test`.

### Task 3: Matching instructions and documentation

**Files:**
- Modify: `GOALS.md`
- Modify: `README.md`
- Modify: `scripts/analyze-radar.mjs`
- Test: `tests/project-context.test.mjs`

**Interfaces:**
- Model prompt must use exact catalog display names and tie `exact` matches to explicit profile needs.

- [ ] Update prompt rules so shared technology alone cannot create an exact match.
- [ ] Replace outdated project priorities in `GOALS.md` with the nine canonical profiles.
- [ ] Document `projects/catalog.json` as the source of truth in `README.md`.
- [ ] Add tests for the canonical project instruction text.
- [ ] Run `npm test`.

### Task 4: Remote verification

**Files:**
- No additional product files.

- [ ] Review every profile for unsupported claims and conflicting aliases.
- [ ] Open a pull request to `main`.
- [ ] Verify GitHub Actions tests pass on the pull request.
- [ ] Inspect the complete diff for accidental secret, workflow or output-state changes.
- [ ] Merge only after verification.
