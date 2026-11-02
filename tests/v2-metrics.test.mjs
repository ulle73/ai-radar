import test from 'node:test';
import assert from 'node:assert/strict';
import { baselineOf, freezeResult, isAutonomous, isoWeek, memoryWindowObservation, repeatedLessonKeys, snapshotObservations, summarize, weekly, weekStart } from '../scripts/lib/v2/harness/metrics.mjs';
import { groupObservations, memoryBreach, splitMeasurements } from '../scripts/lib/v2/judge/grouping.mjs';
import { buildCard } from '../scripts/lib/v2/judge/card-builder.mjs';
import { harnessRules } from '../scripts/lib/v2/judge/prompt.mjs';

const session = (overrides) => ({
  client: 'claude_code', session_hash: 'h', started_at: '2026-10-20T08:00:00.000Z', ended_at: null,
  instructions: 0, corrections: 0, notion_calls: 0, verified: false, gk_session: false, ...overrides
});

test('isoWeek och weekStart', () => {
  assert.equal(isoWeek('2026-11-02T10:00:00Z'), '2026-W45');
  assert.equal(isoWeek('2026-11-01T23:00:00Z'), '2026-W44');
  assert.equal(isoWeek('2026-01-01T00:00:00Z'), '2026-W01');
  assert.equal(weekStart('2026-11-05T12:00:00Z').toISOString(), '2026-11-02T00:00:00.000Z');
});

test('huvudmåttet: verifierad, 0 rättelser och högst 1 instruktion efter den första', () => {
  assert.ok(isAutonomous(session({ verified: true, instructions: 1 })));
  assert.ok(!isAutonomous(session({ verified: true, instructions: 2 })));
  assert.ok(!isAutonomous(session({ verified: true, corrections: 1 })));
  assert.ok(!isAutonomous(session({ verified: false })));
});

test('summarize: minnesanvändning bara bland Golfkuponger-sessioner', () => {
  const result = summarize([
    session({ gk_session: true, notion_calls: 2, verified: true }),
    session({ gk_session: true }),
    session({ gk_session: false, notion_calls: 5, corrections: 1, client: 'codex' })
  ]);
  assert.equal(result.sessions, 3);
  assert.equal(result.gk_sessions, 2);
  assert.equal(result.memory_usage, 0.5);
  assert.equal(result.correction_rate, 0.3333);
  assert.equal(result.autonomous_verified, 1);
  assert.deepEqual(Object.keys(result.by_client), ['claude_code', 'codex']);
  assert.equal(summarize([]).memory_usage, null);
});

test('weekly: bara hela veckor i fönstret', () => {
  const weeks = weekly([session({ started_at: '2026-10-06T08:00:00Z' }), session({ started_at: '2026-10-13T08:00:00Z' })], { from: '2026-10-05T00:00:00Z', to: '2026-10-19T00:00:00Z' });
  assert.deepEqual(weeks.map((week) => [week.week, week.sessions]), [['2026-W41', 1], ['2026-W42', 1]]);
});

test('freeze (T13): samma indata ger samma digest; körtid ingår inte', () => {
  const sessions = [session({ verified: true }), session({ started_at: '2026-10-13T08:00:00Z', gk_session: true, notion_calls: 1 })];
  const stats = { files: 2, unreadable_files: 0, bad_lines: 0, excluded: {} };
  const a = freezeResult({ source: '2026-11-01', from: '2026-10-05T00:00:00Z', to: '2026-11-02T00:00:00Z', sessions, stats });
  const b = freezeResult({ source: '2026-11-01', from: '2026-10-05T00:00:00Z', to: '2026-11-02T00:00:00Z', sessions: structuredClone(sessions), stats: { ...stats } });
  assert.equal(a.digest, b.digest);
  assert.deepEqual(a, b);
  assert.equal(a.weeks.length, 4);
  assert.equal(a.baseline.autonomous_verified_per_week, 0.25);
  assert.equal(a.baseline.memory_usage, 1);
  assert.ok(!JSON.stringify(a).includes(new Date().toISOString().slice(0, 13)));
});

test('baselineOf: upprepade lärdomsnycklar saknar baslinje före lärdomsformatet', () => {
  assert.equal(baselineOf([], summarize([])).repeated_lesson_keys, null);
});

test('upprepade misstag: minst 2 rader på 30 dagar', () => {
  const keys = repeatedLessonKeys([
    { key: 'a', date: '2026-10-20' }, { key: 'a', date: '2026-10-30' },
    { key: 'b', date: '2026-10-30' },
    { key: 'c', date: '2026-08-01' }, { key: 'c', date: '2026-10-30' }
  ], '2026-11-02T00:00:00Z');
  assert.deepEqual(keys, ['a']);
});

test('snapshot: ett mått per observation med {week, name, value, baseline}', () => {
  const observations = snapshotObservations({ week: '2026-W45', summary: summarize([session({ gk_session: true, notion_calls: 1 })]), baseline: { memory_usage: 0.16, correction_rate: 0.27, autonomous_verified_per_week: 2.25, sessions_per_week: 20 }, now: '2026-11-09T00:00:00Z' });
  const memory = observations.find((observation) => observation.data.name === 'memory_usage');
  assert.deepEqual(memory.data, { week: '2026-W45', name: 'memory_usage', value: 1, baseline: 0.16 });
  assert.ok(observations.every((observation) => observation.source_kind === 'metric'));
  assert.equal(new Set(observations.map((observation) => observation.dedupe_key)).size, observations.length);
});

test('tröskel (b): minnesmåttet blir ett harness-jobb bara 20 procentenheter under baslinjen', () => {
  const now = '2026-11-20T10:00:00Z';
  const recent = Array.from({ length: 6 }, (_, i) => session({ gk_session: true, notion_calls: i === 0 ? 1 : 0, started_at: '2026-11-18T10:00:00Z' }));
  const breach = memoryWindowObservation({ sessions: recent, baseline: { memory_usage: 0.5 }, now });
  assert.equal(breach.data.name, 'memory_usage_7d');
  assert.equal(breach.data.gk_sessions, 6);
  assert.ok(memoryBreach(breach));
  const jobs = groupObservations([breach], { now });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].harness.kind, 'memory');
  assert.equal(jobs[0].harness.mistake_ref, 'notion-anvands-inte');

  const close = memoryWindowObservation({ sessions: recent, baseline: { memory_usage: 0.3 }, now });
  assert.ok(!memoryBreach(close));
  assert.equal(groupObservations([close], { now }).length, 0);

  const few = memoryWindowObservation({ sessions: recent.slice(0, 3), baseline: { memory_usage: 0.9 }, now });
  assert.ok(!memoryBreach(few), 'för få sessioner i fönstret');
  assert.equal(memoryWindowObservation({ sessions: recent, baseline: null, now }), null);
});

test('tröskel (b): kort och prompt för minnesjobb', () => {
  const now = '2026-11-20T10:00:00Z';
  const recent = Array.from({ length: 6 }, () => session({ gk_session: true, started_at: '2026-11-18T10:00:00Z' }));
  const [job] = groupObservations([memoryWindowObservation({ sessions: recent, baseline: { memory_usage: 0.4 }, now })], { now });
  job.harness.blob_shas = { 'gk-arbetssatt': 'a'.repeat(40) };
  assert.match(harnessRules(job), /minnet används inte/);
  const card = buildCard({
    job,
    draft: { decision: 'CARD', type: 'ANVAND', area: 'tools_hub', title: 'Läs Notion först', recommendation: 'Förtydliga regeln', because: 'Andelen sjönk', target_kind: 'skill', target_ref: 'gk-arbetssatt', rule_text: 'Läs Notion först.', anchors: [], confidence: 0.6 },
    skeptic: { verdict: 'PASS', reason: 'ok' },
    now
  });
  assert.equal(card.mistake_ref, 'notion-anvands-inte');
  assert.equal(card.dedupe_key, `card:harness:notion-anvands-inte:gk-arbetssatt:${'a'.repeat(40)}`);
  assert.match(card.measure.metric, /Notion-anrop per 7 dagar/);
  assert.equal(card.measure.baseline, '0 % (baslinje 40 %)');
});

test('mätdata bedöms inte av domaren; probsvar lämnas åt probes.mjs', () => {
  const obs = (source_kind, data = {}) => ({ observation_id: `OB-${source_kind}`, source_kind, data, dedupe_key: source_kind, observed_at: '2026-11-02T00:00:00Z', area: 'tools_hub', detector: 'x' });
  const { measurements, judgeable } = splitMeasurements([
    obs('session_transcript'), obs('metric', { name: 'memory_usage' }), obs('metric', { name: 'memory_usage_7d' }),
    obs('receipt'), obs('probe'), obs('notion_lesson', { key: 'a' }), obs('primary')
  ]);
  assert.deepEqual(measurements.map((item) => item.source_kind), ['session_transcript', 'metric', 'receipt']);
  assert.deepEqual(judgeable.map((item) => item.source_kind), ['metric', 'notion_lesson', 'primary']);
});
