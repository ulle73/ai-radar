// Observationer är det enda en hypotes får byggas på (docs/V2-SPEC.md, avsnitt 1 och 5).
// Detektorerna skapar dem utan AI; domaren får dem som underlag.

import { createHash } from 'node:crypto';

const AREAS = Object.freeze(['tools_hub', 'social', 'sales', 'projects']);
// Ändras tillsammans med n8n/r2-observation-ingest.workflow.ts, schemas/card.v1.schema.json,
// schemas/judge-output.v1.schema.json och V2-SPEC §7 (tests/v2-observation-enums.test.mjs kontrollerar det).
const SOURCE_KINDS = Object.freeze([
  'primary', 'aggregator', 'data', 'social', 'repo', 'video', 'transcript',
  'session_transcript', 'notion_lesson', 'eval', 'n8n_error', 'hub_health', 'probe', 'receipt', 'metric'
]);
const ALERT_TRIGGERS = Object.freeze([
  'competitor_campaign_live', 'sales_deviation', 'platform_breaking_change', 'security_advisory',
  'hub_regression', 'probe_failed', 'liveness_lost', 'hub_health_failure'
]);
// Larmutlösare som går direkt från Observation Ingest till Discord, utan domaren (C1).
const DIRECT_ALERTS = Object.freeze(['hub_regression', 'probe_failed', 'liveness_lost', 'hub_health_failure']);

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`observation: ${field} saknas`);
  return value.trim();
}

function isoOf(value, field) {
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  if (!Number.isFinite(time)) throw new Error(`observation: ogiltigt datum i ${field}`);
  return new Date(time).toISOString();
}

export function observationId(dedupeKey) {
  return `OB-${createHash('sha1').update(dedupeKey).digest('hex').slice(0, 12)}`;
}

export function makeObservation({
  detector,
  area,
  dedupe_key: dedupeKey,
  observed_at: observedAt,
  source,
  source_kind: sourceKind,
  url = null,
  value,
  verified = true,
  anchors = [],
  alert_trigger: alertTrigger = null,
  data = {}
}) {
  if (!AREAS.includes(area)) throw new Error(`observation: okänt område ${area}`);
  if (!SOURCE_KINDS.includes(sourceKind)) throw new Error(`observation: okänd source_kind ${sourceKind}`);
  if (alertTrigger !== null && !ALERT_TRIGGERS.includes(alertTrigger)) {
    throw new Error(`observation: okänd alert_trigger ${alertTrigger}`);
  }
  const key = requireText(dedupeKey, 'dedupe_key');
  return {
    observation_id: observationId(key),
    detector: requireText(detector, 'detector'),
    area,
    dedupe_key: key,
    observed_at: isoOf(observedAt, 'observed_at'),
    source: requireText(source, 'source'),
    source_kind: sourceKind,
    url,
    value: requireText(value, 'value'),
    verified: Boolean(verified),
    anchors,
    alert_trigger: alertTrigger,
    data
  };
}

// Formen som kortkontraktet (schemas/card.v1.schema.json) använder i observations[].
export function toCardObservation(observation) {
  const card = {
    source: observation.source,
    source_kind: observation.source_kind,
    observed_at: observation.observed_at,
    value: observation.value,
    verified: observation.verified
  };
  if (observation.url) card.url = observation.url;
  return card;
}

export function dedupeObservations(observations, seenKeys = []) {
  const seen = new Set(seenKeys);
  const result = [];
  for (const observation of observations) {
    if (seen.has(observation.dedupe_key)) continue;
    seen.add(observation.dedupe_key);
    result.push(observation);
  }
  return result;
}

export { ALERT_TRIGGERS, AREAS, DIRECT_ALERTS, SOURCE_KINDS };
