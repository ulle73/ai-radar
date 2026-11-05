import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { changeEntry, dueForOutcome, growthLogRow, learnerClient, measureReached, mergeLessonLedger, OUTCOME, outcomeFor, weeklySummary } from '../scripts/lib/v2/harness/learner.mjs';

const NOW = '2026-11-20T02:00:00Z';
const card = {
  card_id: 'R2-20261102-abcd1234',
  target: { kind: 'skill', ref: 'gk-arbetssatt' },
  mistake_ref: 'notion-las-forst',
  measure: { metric: 'lärdomsnyckeln notion-las-forst per 14 dagar', baseline: '3 rader på 14 dagar', check_after_days: 14 }
};

test('loggrad: daterad, märkt R2, utan länkar', () => {
  const entry = changeEntry({ card, kind: 'published', version: '1.0.5', detail: 'Lokal P2/P3 godkänd.', now: '2026-11-03T01:00:00Z' });
  assert.equal(entry.date, '2026-11-03');
  assert.match(entry.text, /publicerade gk-karna 1\.0\.5.*gk-arbetssatt \[notion-las-forst\].*\(R2\)$/);
  assert.ok(!/https?:|@/.test(entry.text));
  assert.match(changeEntry({ card, kind: 'rolled_back', detail: 'P3.' }).text, /återställde kort R2-20261102-abcd1234/);
  assert.throws(() => changeEntry({ card, kind: 'okänd' }));
});

test('Growth Log-rad: typ efter slag, källan anger R2', () => {
  assert.equal(growthLogRow({ kind: 'weekly', title: 'v', summary: 's', now: NOW }).type, 'Testresultat');
  assert.equal(growthLogRow({ kind: 'decision', title: 'b', summary: 's' }).type, 'Beslut');
  const row = growthLogRow({ kind: 'regression', title: 'r', summary: 's', now: NOW });
  assert.equal(row.type, 'Ändrad bedömning');
  assert.equal(row.date, '2026-11-20');
  assert.match(row.source, /R2/);
});

test('veckosammanfattning: mått mot baslinjen och veckans kort', () => {
  const result = weeklySummary({
    week: '2026-W46',
    summary: { sessions: 22, autonomous_verified: 4, memory_usage: 0.3, correction_rate: 0.2 },
    baseline: { autonomous_verified_per_week: 2.25, memory_usage: 0.1579, correction_rate: 0.275 },
    cards: [
      { card_id: 'a', published_at: '2026-11-10T01:00:00Z' },
      { card_id: 'b', published_at: '2026-11-03T01:00:00Z' },
      { card_id: 'c', rolled_back_at: '2026-11-12T01:00:00Z', published_at: '2026-11-12T00:30:00Z' }
    ],
    from: '2026-11-09T00:00:00Z',
    to: '2026-11-16T00:00:00Z'
  });
  assert.ok(result.current.startsWith('Förbättringsmotorns mått vecka 2026-W46'));
  assert.match(result.current, /2 publicerade, 1 återställda/);
  assert.match(result.current, /minnesanvändning 30 % \(baslinje 16 %\)/);
  assert.equal(result.row.title, 'Förbättringsmotorn vecka 2026-W46: 2 publicerade, 1 återställda och 0 beslutspunkter');
  assert.equal(result.row.date, '2026-11-16');
});

test('uppföljning: bara publicerade, ej återställda kort utan utfall vars dag passerat', () => {
  const rows = [
    { card_id: 'a', published_version: '1.0.5', outcome_due: '2026-11-17T00:00:00Z' },
    { card_id: 'b', published_version: '1.0.6', outcome_due: '2026-11-25T00:00:00Z' },
    { card_id: 'c', published_version: '1.0.7', outcome_due: '2026-11-10T00:00:00Z', rolled_back_at: '2026-11-03T00:00:00Z' },
    { card_id: 'd', published_version: '1.0.8', outcome_due: '2026-11-10T00:00:00Z', outcome: OUTCOME.REACHED },
    { card_id: 'e', outcome_due: '2026-11-10T00:00:00Z' }
  ];
  assert.deepEqual(dueForOutcome(rows, NOW).map((row) => row.card_id), ['a']);
});

test('måttet för lärdomsnyckel: färre rader efter publiceringen än i baslinjen', () => {
  const lessons = [
    { key: 'notion-las-forst', date: '2026-11-05' },
    { key: 'notion-las-forst', date: '2026-11-01' },
    { key: 'annan', date: '2026-11-06' }
  ];
  const reached = measureReached({ card, publishedAt: '2026-11-03T01:00:00Z', lessons, now: NOW });
  assert.deepEqual([reached.known, reached.reached], [true, true]);
  assert.match(reached.detail, /1 rader på 14 dagar efter publiceringen mot 3 före/);
  const many = [...lessons, { key: 'notion-las-forst', date: '2026-11-08' }, { key: 'notion-las-forst', date: '2026-11-12' }];
  assert.equal(measureReached({ card, publishedAt: '2026-11-03T01:00:00Z', lessons: many, now: NOW }).reached, false);
});

test('måttet för minnet: minst 10 procentenheter högre; gammalt mått ger inget utfall', () => {
  const memoryCard = { ...card, mistake_ref: 'notion-anvands-inte', measure: { metric: 'andel Golfkuponger-sessioner med Notion-anrop per 7 dagar', baseline: '10 % (baslinje 40 %)', check_after_days: 14 } };
  assert.equal(measureReached({ card: memoryCard, publishedAt: '2026-11-03', memory: { at: '2026-11-19T12:00:00Z', value: 0.25 }, now: NOW }).reached, true);
  assert.equal(measureReached({ card: memoryCard, publishedAt: '2026-11-03', memory: { at: '2026-11-19T12:00:00Z', value: 0.15 }, now: NOW }).reached, false);
  assert.equal(measureReached({ card: memoryCard, publishedAt: '2026-11-03', memory: { at: '2026-11-10T12:00:00Z', value: 0.9 }, now: NOW }).known, false);
  assert.equal(measureReached({ card: memoryCard, publishedAt: '2026-11-03', memory: null, now: NOW }).known, false);
});

test('ej nått: första gången öppnas kortet igen, andra gången beslutspunkt', () => {
  const miss = { known: true, reached: false };
  assert.equal(outcomeFor({ result: { known: true, reached: true }, card, rows: [] }), OUTCOME.REACHED);
  assert.equal(outcomeFor({ result: miss, card, rows: [] }), OUTCOME.REOPENED);
  const earlier = { card_id: 'R2-20261020-00000000', outcome: OUTCOME.REOPENED, card_json: JSON.stringify({ mistake_ref: 'notion-las-forst' }) };
  assert.equal(outcomeFor({ result: miss, card, rows: [earlier] }), OUTCOME.DECISION);
  const otherKey = { ...earlier, card_json: JSON.stringify({ mistake_ref: 'annan' }) };
  assert.equal(outcomeFor({ result: miss, card, rows: [otherKey] }), OUTCOME.REOPENED);
  assert.equal(outcomeFor({ result: { known: false }, card, rows: [] }), null);
});

test('lärdomsreskontran dedupliceras på text_hash och rensar gamla rader', () => {
  const obs = (key, date, hash) => ({ source_kind: 'notion_lesson', data: { key, date, text_hash: hash } });
  let ledger = mergeLessonLedger(null, [obs('a', '2026-11-01', 'h1'), obs('a', '2026-11-01', 'h1'), { source_kind: 'primary', data: {} }], NOW);
  assert.equal(ledger.rows.length, 1);
  ledger = mergeLessonLedger({ rows: [...ledger.rows, { key: 'gammal', date: '2026-06-01', text_hash: 'h0' }] }, [obs('b', '2026-11-02', 'h2')], NOW);
  assert.deepEqual(ledger.rows.map((row) => row.key), ['a', 'b']);
});

test('learner-klienten kräver läsning tillbaka', async () => {
  const sent = [];
  const ok = learnerClient(async (payload) => { sent.push(payload); return { status: 200, body: { ok: true, readback: true } }; });
  await ok.log({ date: '2026-11-03', text: 'x' });
  assert.deepEqual(sent[0], { action: 'log', entry: { date: '2026-11-03', text: 'x' } });
  const noReadback = learnerClient(async () => ({ status: 200, body: { ok: true, readback: false } }));
  await assert.rejects(noReadback.log({}), /läsas tillbaka/);
  const failed = learnerClient(async () => ({ status: 502, body: { ok: false, error: 'raden hittades inte' } }));
  await assert.rejects(failed.growth({}), /502/);
});

test('flödet R2 – Learner: fasta mål, signatur, läsning tillbaka och inga funktioner utanför jsCode', () => {
  const source = readFileSync(new URL('../n8n/r2-learner.workflow.ts', import.meta.url), 'utf8');
  assert.match(source, /path: 'r2-learner'/);
  assert.match(source, /createHmac\('sha256', secret\)/);
  assert.match(source, /blocks\/40a3774f-b232-8197-aecc-c229d1b68c6b\/children/);
  assert.match(source, /databases\/f3fdd542-83a2-4dc9-9ee7-cac981cf289a\/query/);
  for (const name of ['Check Log Read Back', 'Check Weekly Read Back', 'Check Growth Read Back']) assert.ok(source.includes(`name: '${name}'`), name);
  const outsideCode = source.replace(/jsCode: `(?:[^`\\]|\\.)*`/g, '');
  assert.ok(!/^\s*function\s/m.test(outsideCode), 'SDK:n tillåter inga funktionsdeklarationer');
  assert.ok(!/=>/.test(outsideCode), 'SDK:n tillåter inga pilfunktioner utanför jsCode');
});
