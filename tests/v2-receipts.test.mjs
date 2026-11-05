import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReceiptRow, receiptCoverage, summarizeReceipts } from '../scripts/lib/v2/detectors/receipts.mjs';
import { splitMeasurements } from '../scripts/lib/v2/judge/grouping.mjs';

const receipt = (yta, skill, session, day) => ({ observed_at: `${day}T08:00:00Z`, data: { yta, skill, uppgiftstyp: 'notion', session_hash: session, day } });

test('kvitton räknas en gång per session, skill och dag', () => {
  const summary = summarizeReceipts([
    receipt('claude_ai', 'gk-arbetssatt', 's1', '2026-11-05'),
    receipt('claude_ai', 'gk-arbetssatt', 's1', '2026-11-05'),
    receipt('claude_ai', 'notion-dokumentation', 's1', '2026-11-05'),
    receipt('chatgpt', 'gk-arbetssatt', 's2', '2026-11-05'),
    receipt('chatgpt', 'gk-arbetssatt', 's2', '2026-11-06')
  ]);
  assert.equal(summary['2026-11-05'].claude_ai.receipts, 2);
  assert.deepEqual(summary['2026-11-05'].claude_ai.skills, { 'gk-arbetssatt': 1, 'notion-dokumentation': 1 });
  assert.equal(summary['2026-11-06'].chatgpt.receipts, 1);
});

test('kvitton tas bara från webbytorna', () => {
  assert.equal(parseReceiptRow(receipt('claude_code', 'gk-arbetssatt', 's', '2026-11-05')), null);
  assert.equal(parseReceiptRow({ data_json: '{trasig' }), null);
  assert.equal(parseReceiptRow({ data_json: JSON.stringify({ yta: 'chatgpt', skill: 'gk-arbetssatt', day: '2026-11-05' }) }).yta, 'chatgpt');
});

test('T17: minst 1 kvitto per dag i 3 dagar från claude.ai och ChatGPT', () => {
  const days = ['2026-11-05', '2026-11-06', '2026-11-07'];
  const all = days.flatMap((day) => [receipt('claude_ai', 'gk-arbetssatt', 'a', day), receipt('chatgpt', 'gk-arbetssatt', 'b', day)]);
  assert.deepEqual(receiptCoverage(summarizeReceipts(all), days), { ok: true, missing: { claude_ai: [], chatgpt: [] } });
  const gaps = receiptCoverage(summarizeReceipts(all.slice(0, 5)), days);
  assert.equal(gaps.ok, false);
  assert.deepEqual(gaps.missing.chatgpt, ['2026-11-07']);
});

test('kvitton är mätdata för domaren, inte belägg för misstag 2', () => {
  const { measurements, judgeable } = splitMeasurements([{ observation_id: 'OB-1', source_kind: 'receipt', data: {} }]);
  assert.equal(measurements.length, 1);
  assert.equal(judgeable.length, 0);
});
