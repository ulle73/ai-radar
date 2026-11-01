import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALERT_TRIGGERS, DIRECT_ALERTS, SOURCE_KINDS } from '../scripts/lib/v2/observation.mjs';

// De fem gemensamma listorna (designen "Självförbättrande hubb", Datakontrakt) måste stämma överens.
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const card = JSON.parse(read('schemas/card.v1.schema.json'));
const judge = JSON.parse(read('schemas/judge-output.v1.schema.json'));
const ingest = read('n8n/r2-observation-ingest.workflow.ts');
const spec = read('docs/V2-SPEC.md');

const sorted = (list) => [...list].sort();

function tsList(name) {
  const match = ingest.match(new RegExp(`const ${name} = \\[([^\\]]*)\\]`));
  assert.ok(match, `${name} saknas i ingest-flödet`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function specRow(label) {
  const row = spec.split('\n').find((line) => line.startsWith(`| \`${label}\``));
  assert.ok(row, `raden ${label} saknas i V2-SPEC §7`);
  const cells = row.split('|');
  return [...new Set([...cells[2].matchAll(/`([a-z0-9_]+)`/g)].map((m) => m[1]))];
}

test('source_kind är samma på alla fem ställen', () => {
  const expected = sorted(SOURCE_KINDS);
  assert.deepEqual(sorted(tsList('KINDS')), expected);
  assert.deepEqual(sorted(card.properties.observations.items.properties.source_kind.enum), expected);
  assert.deepEqual(sorted(specRow('observations[].source_kind')), expected);
  for (const kind of ['session_transcript', 'notion_lesson', 'eval', 'n8n_error', 'hub_health', 'probe', 'receipt', 'metric']) {
    assert.ok(SOURCE_KINDS.includes(kind), kind);
  }
});

test('alert_trigger är samma på alla fem ställen', () => {
  const expected = sorted(ALERT_TRIGGERS);
  assert.deepEqual(sorted(tsList('TRIGGERS')), expected);
  assert.deepEqual(sorted(card.properties.urgency.properties.trigger.enum), expected);
  assert.deepEqual(sorted(judge.properties.urgency_trigger.enum.filter((value) => value !== null)), expected);
  assert.deepEqual(sorted(specRow('urgency.trigger')), expected);
  assert.deepEqual(sorted(tsList('DIRECT')), sorted(DIRECT_ALERTS));
  assert.deepEqual(sorted(DIRECT_ALERTS), ['hub_health_failure', 'hub_regression', 'liveness_lost', 'probe_failed']);
});

test('security.clients har claude_ai och chatgpt', () => {
  const clients = card.properties.security.properties.clients.items.enum;
  assert.deepEqual(sorted(clients), ['chatgpt', 'claude', 'claude_ai', 'codex']);
  assert.deepEqual(sorted(specRow('security.clients')), sorted(clients));
});

test('mistake_ref är valfritt och följer mönstret', () => {
  const property = card.properties.mistake_ref;
  assert.equal(property.pattern, '^[a-z0-9-]{3,48}$');
  assert.ok(!card.required.includes('mistake_ref'));
});
