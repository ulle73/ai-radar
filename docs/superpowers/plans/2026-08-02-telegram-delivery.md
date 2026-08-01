# Telegram Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver pending AI Radar notifications to Telegram reliably, with retry-safe queue semantics and auditable status.

**Architecture:** A pure delivery module handles formatting, deduplication and Telegram API calls. A small CLI handles repository files and exit codes. GitHub Actions runs it after analysis and commits delivery state even when Telegram fails.

**Tech Stack:** Node.js 20 ESM, built-in `fetch`, `node:test`, GitHub Actions, Telegram Bot API.

## Global Constraints

- Never log the bot token or chat ID.
- Remove only successfully delivered notifications from pending.
- Keep failed notifications for retry.
- Never send the same notification ID twice.
- Add no runtime dependencies.
- Telegram failure must make the workflow visible as failed while still preserving status and queue files.

---

### Task 1: Delivery behavior

**Files:**
- Create: `tests/telegram.test.mjs`
- Create: `scripts/lib/telegram.mjs`

**Interfaces:**
- Produces: `notificationId(item)`, `formatTelegramMessage(item)`, `deliverPendingNotifications(options)`, `sendSmokeTest(options)`.

- [ ] Write failing tests for HTML escaping, successful delivery, failed delivery retention, sent-history deduplication, missing configuration and smoke test.
- [ ] Run `npm test` and verify failure because `scripts/lib/telegram.mjs` is missing.
- [ ] Implement the minimum pure delivery module.
- [ ] Run `npm test` and verify all tests pass.

### Task 2: Repository file runner

**Files:**
- Create: `scripts/send-telegram.mjs`
- Create: `notifications/sent.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: `deliverPendingNotifications` and `sendSmokeTest`.
- Produces: updated pending/sent files and `status/telegram.json`.

- [ ] Add a CLI that reads files, calls the delivery module and writes status atomically enough for the single-job workflow.
- [ ] Add `npm run notify`.
- [ ] Exit non-zero for `failed` or `degraded`, but only after writing files.
- [ ] Run `npm test`.

### Task 3: Workflow integration

**Files:**
- Modify: `.github/workflows/daily-github-radar.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes secrets `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.

- [ ] Add `workflow_dispatch.inputs.telegram_smoke_test`.
- [ ] Add an identified analysis step and Telegram step.
- [ ] Make the commit step run after Telegram failure only when analysis succeeded.
- [ ] Document queue, retry and smoke-test behavior.
- [ ] Run GitHub Actions tests and inspect the final workflow diff.
