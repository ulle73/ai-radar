// Bygger ett kort enligt kontraktet (schemas/card.v1.schema.json) av domarens bedömning.
// Fält som modellen inte får styra sätts här: id, observationer, dedupe-nyckel, testläge och giltighet.

import { createHash } from 'node:crypto';
import { toCardObservation } from '../observation.mjs';

const DAY_MS = 86400000;

function text(value, max, fallback = '') {
  const cleaned = String(value ?? '').replace(/\s+/g, ' ').trim();
  return (cleaned || fallback).slice(0, max);
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

export function cardIdFor(job, now) {
  const day = new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
  return `R2-${day}-${createHash('sha1').update(job.key).digest('hex').slice(0, 8)}`;
}

function testFor(type, task) {
  const base = { outcome: 'not_run', verified: false, ...(task ? { task: text(task, 500) } : {}) };
  if (type === 'NY') return { kind: 'smoke', ...base };
  if (type === 'ERSATT') return { kind: 'ab', ...base };
  return { kind: 'none', ...base };
}

export function buildCard({ job, draft, skeptic, now = new Date(), expiresDays = 14 }) {
  if (!draft || draft.decision !== 'CARD' || draft.type === 'NONE' || draft.target_kind === 'none') return null;
  const nowMs = new Date(now).getTime();
  const type = draft.type;

  const card = {
    contract_version: 1,
    card_id: cardIdFor(job, now),
    area: draft.area,
    type,
    title: text(draft.title, 120, 'Utan rubrik'),
    recommendation: text(draft.recommendation, 300),
    because: text(draft.because, 600),
    analysis_mode: 'model',
    platform_news: job.detector === 'releases',
    observations: job.observations.slice(0, 10).map(toCardObservation),
    anchors: (draft.anchors || []).slice(0, 10).map((anchor) => ({ kind: anchor.kind, ref: text(anchor.ref, 200) })),
    target: {
      kind: draft.target_kind,
      ref: text(draft.target_ref, 200),
      ...(draft.target_branch ? { branch: text(draft.target_branch, 120) } : {})
    },
    replaces: type === 'ERSATT' && draft.replaces ? text(draft.replaces, 200) : null,
    test: testFor(type, draft.test_task),
    skeptic: {
      verdict: skeptic?.verdict || 'REJECT',
      reason: text(skeptic?.reason, 500, 'skeptikern svarade inte')
    },
    rule_text: type === 'ANVAND' && draft.rule_text ? String(draft.rule_text).trim().slice(0, 400) : null,
    action_on_ok: text(draft.action_on_ok, 500),
    effort_hours: clamp(draft.effort_hours, 0, 200),
    monthly_cost_sek: clamp(draft.monthly_cost_sek, 0, 100000),
    risk: text(draft.risk, 300, 'okänd'),
    measure: draft.measure_metric && draft.measure_baseline && Number.isInteger(draft.measure_days) && draft.measure_days >= 1
      ? { metric: text(draft.measure_metric, 200), baseline: text(draft.measure_baseline, 200), check_after_days: draft.measure_days }
      : null,
    confidence: clamp(draft.confidence, 0, 1),
    dedupe_key: `card:${job.key}`,
    expires_at: new Date(nowMs + expiresDays * DAY_MS).toISOString()
  };

  if (type === 'NY' || type === 'ERSATT') {
    card.security = { static_scan: 'not_run', license: null, clients: [] };
  }
  if (type === 'LARM' && draft.urgency_trigger) {
    card.urgency = {
      trigger: draft.urgency_trigger,
      reason: text(draft.urgency_reason, 300, 'tidskritiskt'),
      expires_at: new Date(nowMs + 2 * DAY_MS).toISOString()
    };
  }
  return card;
}
