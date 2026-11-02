import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLessons, extractLessons, isSelfAgent, parseLessonLine } from '../scripts/lib/v2/detectors/lessons.mjs';
import { collectObservations } from '../scripts/lib/v2/heartbeat.mjs';

const NOW = '2026-11-02T10:00:00Z';

test('regex: formatet i gk-arbetssatt tolkas, även med Notions escapade hakparenteser och datum-taggar', () => {
  assert.deepEqual(parseLessonLine('- Lärdom [notion-las-forst]: Läs nodens Aktuell bild innan svar om Smode. (2026-11-02, ChatGPT, chatt)'), {
    key: 'notion-las-forst', text: 'Läs nodens Aktuell bild innan svar om Smode.', date: '2026-11-02', agent: 'ChatGPT', source: 'chatt'
  });
  assert.equal(parseLessonLine('- Lärdom \\[notion-las-forst\\]: Läs först. (2026-11-02, Claude, session)').key, 'notion-las-forst');
  assert.equal(parseLessonLine('- Lärdom [smode-avtal]: Kolla avtalet. (<date start="2026-11-01" />, Codex, rättelse från Jonas)').date, '2026-11-01');
  assert.equal(parseLessonLine('* Lärdom [abc]: x (2026-11-02, Claude, chatt)').key, 'abc');
});

test('regex: fel format ger ingen lärdom', () => {
  for (const line of [
    'Lärdom [notion-las-forst]: utan punkt (2026-11-02, Claude, chatt)',
    '- Lärdom [Notion Läs Först]: versaler och mellanslag (2026-11-02, Claude, chatt)',
    '- Lärdom [ab]: för kort nyckel (2026-11-02, Claude, chatt)',
    '- Lärdom [notion-las-forst]: saknar parentes',
    '- Lärdom [notion-las-forst]: fel datum (2 nov, Claude, chatt)',
    '- Lärdom [notion-las-forst]: två fält (2026-11-02, Claude)',
    '- Lärdom notion-las-forst: utan hakparenteser (2026-11-02, Claude, chatt)'
  ]) {
    assert.equal(parseLessonLine(line), null, line);
  }
});

test('filter: rader från agenten R2 (motorn själv) räknas inte', () => {
  assert.ok(isSelfAgent('R2'));
  assert.ok(isSelfAgent(' ai radar '));
  assert.ok(!isSelfAgent('Claude'));
  const page = { page_id: 'p1', markdown: [
    '## Logg',
    '- Lärdom [notion-las-forst]: Läs först. (2026-11-01, ChatGPT, chatt)',
    '- Lärdom [notion-las-forst]: Motorns egen rad. (2026-11-01, R2, harness)',
    'vanlig text'
  ].join('\n') };
  assert.equal(extractLessons(page).length, 1);
});

test('detectLessons: en observation per rad, stabil dedupe-nyckel, gamla rader hoppas över', () => {
  const pages = [
    { page_id: 'p1', source: 'knowledge', markdown: '- Lärdom [notion-las-forst]: A. (2026-11-01, ChatGPT, chatt)\n- Lärdom [notion-las-forst]: B. (2026-10-30, Claude, session)' },
    { page_id: 'p2', source: 'growth_log', markdown: '- Lärdom [notion-las-forst]: C. (2026-08-01, Codex, chatt)' }
  ];
  const first = detectLessons({ pages, now: NOW });
  assert.equal(first.length, 2);
  assert.equal(first[0].source_kind, 'notion_lesson');
  assert.equal(first[0].data.key, 'notion-las-forst');
  assert.match(first[0].dedupe_key, /^lesson:notion-las-forst:[0-9a-f]{12}$/);
  assert.deepEqual(detectLessons({ pages, now: NOW }).map((o) => o.dedupe_key), first.map((o) => o.dedupe_key));
  assert.notEqual(first[0].dedupe_key, first[1].dedupe_key);
});

test('heartbeat registrerar lärdomsdetektorn bara när datafeeden har lesson_pages', async () => {
  const sources = { releases: { github: [] }, youtube: { channels: [] }, ci: { repos: [] }, installed: { tools: [] } };
  const base = { mode: 'private', sources, fetchJson: async () => [], fetchText: async () => '', now: NOW };
  const without = await collectObservations({ ...base, dataFeed: async () => ({ sales_rows: [], log_entries: [] }) });
  assert.ok(!without.stats.some((s) => s.source === 'lessons'));
  const withLessons = await collectObservations({
    ...base,
    dataFeed: async () => ({ sales_rows: [], log_entries: [], lesson_pages: [{ page_id: 'p1', markdown: '- Lärdom [notion-las-forst]: A. (2026-11-01, ChatGPT, chatt)' }] })
  });
  assert.deepEqual(withLessons.stats.find((s) => s.source === 'lessons'), { source: 'lessons', ok: true, observations: 1 });
  assert.equal(withLessons.observations.filter((o) => o.detector === 'lessons').length, 1);
});
