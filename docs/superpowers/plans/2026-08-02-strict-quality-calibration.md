# Strict Quality Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AI Radar precision-first so only concrete, high-confidence, project-specific repos appear in the main ranking or notification queue.

**Architecture:** Extend the model schema with evidence and match specificity, then place all ranking and notification eligibility in a deterministic quality module. Keep the complete catalog and daily history unchanged, while rendering only quality-gated, diversified and freshness-adjusted entries in the permanent ranking.

**Tech Stack:** Node.js 20 ESM, built-in `node:test`, GitHub Actions, OpenRouter JSON responses.

## Global Constraints

- Prefer false negatives over false positives.
- Fallback assessments may never enter the main ranking or notification queue.
- A high raw score alone is insufficient.
- Keep all analyzed repos in history for auditability.
- Add no runtime dependencies.
- Existing scheduled workflow and OpenRouter secrets remain unchanged.

---

### Task 1: Deterministic quality gates

**Files:**
- Create: `scripts/lib/quality.mjs`
- Test: `tests/quality.test.mjs`

**Interfaces:**
- Produces: `classifyQuality(entry)`, `rankingScore(entry, date, feedback)`, `buildStrictRanking(catalog, date, feedback, limits)`, `buildQualityMetrics(assessments, eligibleBeforeCap, finalRanking)`.

- [ ] Write failing tests for exact/generic/fallback gates, category cap, freshness and feedback.
- [ ] Run `npm test` and verify failures reference missing quality module.
- [ ] Implement quality levels, deterministic adjustments and metrics.
- [ ] Run `npm test` and verify all Task 1 tests pass.

### Task 2: Evidence-rich model schema

**Files:**
- Modify: `scripts/lib/assessment.mjs`
- Modify: `scripts/analyze-radar.mjs`
- Modify: `tests/ai-radar.test.mjs`

**Interfaces:**
- Assessment objects gain `assessment_version`, `match_type`, `category`, `concrete_use_case`, `next_step`, `differentiator`, `evidence` and `quality_tier`.

- [ ] Write failing validation and normalization tests for required evidence fields.
- [ ] Update OpenRouter prompt schema and skeptical scoring instructions.
- [ ] Require and normalize the new fields for model assessments.
- [ ] Make fallback objects valid historical records with `match_type=generic`, empty evidence and `assessment_version=2`.
- [ ] Run `npm test`.

### Task 3: Strict ranking and notification integration

**Files:**
- Modify: `scripts/lib/catalog.mjs`
- Modify: `scripts/analyze-radar.mjs`
- Modify: `tests/ai-radar.test.mjs`

**Interfaces:**
- `buildAllTimeRanking(catalog, date, feedback)` delegates to the strict quality module.
- `buildNotifications(...)` requires exceptional quality and deterministic notification thresholds.

- [ ] Write failing integration tests for generic high-score exclusion and exceptional notification eligibility.
- [ ] Load `state/feedback.json` with an empty-object fallback.
- [ ] Integrate strict ranking and notification gates.
- [ ] Force reanalysis when `assessment_version !== 2`.
- [ ] Run `npm test`.

### Task 4: Quality telemetry and documentation

**Files:**
- Modify: `scripts/analyze-radar.mjs`
- Modify: `scripts/lib/render.mjs`
- Modify: `README.md`
- Create: `state/feedback.json`
- Test: `tests/quality.test.mjs`

**Interfaces:**
- Produces `status/quality.json` and adds `quality_status` plus strict-ranking counts to `status/latest.json`.

- [ ] Write failing tests for recommendation-rate and category-concentration warnings.
- [ ] Write quality telemetry files and expose quality status in daily markdown.
- [ ] Document ranking gates, feedback statuses and why an empty ranking is valid.
- [ ] Run `npm test`.

### Task 5: Remote verification

**Files:**
- No product files beyond previous tasks.

- [ ] Open a pull request to `main`.
- [ ] Verify the GitHub Actions test workflow passes on the PR merge commit.
- [ ] Review the complete diff for accidental workflow, secret or collection changes.
- [ ] Keep the PR unmerged until explicitly approved.
