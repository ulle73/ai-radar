import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { actionForScore, fallbackAssessment, parseModelJson, scoreAssessment, validateAssessment } from '../scripts/lib/assessment.mjs';
import { buildAllTimeRanking, buildNotifications, capRankingActions, upsertCatalog } from '../scripts/lib/catalog.mjs';
import { renderAllTimeMarkdown, renderDailyMarkdown, renderNotificationsMarkdown } from '../scripts/lib/render.mjs';
import { runAnalyzer } from '../scripts/analyze-radar.mjs';

const dimensions = { project_fit: 26, concrete_value: 17, testability: 12, technical_fit: 13, repo_quality: 8, timing: 9 };

function assessment(name, score, overrides = {}) {
  return {
    repo: name,
    url: `https://github.com/${name}`,
    summary_sv: `${name} summary`,
    project_matches: [{ project: 'FAIV', reason: 'Concrete campaign use' }],
    dimensions: { project_fit: 25, concrete_value: 18, testability: 12, technical_fit: 12, repo_quality: 8, timing: Math.max(0, Math.min(10, score - 75)) },
    score,
    action: score >= 85 ? 'Testa nu' : score >= 70 ? 'Spara för senare' : score >= 55 ? 'Bevaka' : 'Ignorera',
    analysis_mode: 'model',
    risks: [],
    confidence: 0.8,
    source_names: ['GitHub Trending – daily'],
    stars: 1000,
    ...overrides
  };
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2));
}

test('scores fixed dimensions and applies stable thresholds', () => {
  assert.equal(scoreAssessment({ dimensions }), 85);
  assert.equal(actionForScore(85), 'Testa nu');
  assert.equal(actionForScore(84), 'Spara för senare');
  assert.equal(actionForScore(55), 'Bevaka');
  assert.equal(actionForScore(54), 'Ignorera');
});

test('extracts JSON from fenced model output', () => {
  assert.deepEqual(parseModelJson('```json\n[{"repo":"acme/tool"}]\n```'), [{ repo: 'acme/tool' }]);
});

test('rejects wrong repo and invalid dimensions', () => {
  const errors = validateAssessment({
    repo: 'wrong/repo',
    summary_sv: 'Kort summering',
    project_matches: [],
    dimensions: { ...dimensions, project_fit: 99 },
    risks: [],
    confidence: 0.7
  }, 'acme/tool');
  assert.ok(errors.some((error) => error.includes('repo')));
  assert.ok(errors.some((error) => error.includes('project_fit')));
});

test('fallback is conservative and finds a concrete FAIV match', () => {
  const result = fallbackAssessment({
    full_name: 'acme/product-video',
    html_url: 'https://github.com/acme/product-video',
    description: 'Create ecommerce product videos from images',
    language: 'TypeScript',
    topics: ['video', 'ecommerce'],
    stargazers_count: 1200,
    source_names: ['GitHub Trending – daily']
  }, 'model unavailable');
  assert.equal(result.analysis_mode, 'fallback');
  assert.ok(result.project_matches.some((match) => match.project === 'FAIV'));
  assert.ok(result.score < 82);
});

test('catalog preserves first_seen while updating score', () => {
  const first = upsertCatalog(null, [assessment('acme/tool', 80)], '2026-08-01');
  const second = upsertCatalog(first, [assessment('acme/tool', 88)], '2026-08-02');
  assert.equal(second.repos['acme/tool'].first_seen, '2026-08-01');
  assert.equal(second.repos['acme/tool'].last_seen, '2026-08-02');
  assert.equal(second.repos['acme/tool'].score, 88);
});

test('ranking caps actions at five Testa nu and ten Spara för senare', () => {
  const capped = capRankingActions(Array.from({ length: 20 }, (_, index) => assessment(`acme/tool-${index}`, 100 - index)));
  assert.equal(capped.filter((entry) => entry.action === 'Testa nu').length, 5);
  assert.equal(capped.filter((entry) => entry.action === 'Spara för senare').length, 10);
});

test('notifications deduplicate pending entries', () => {
  const result = buildNotifications({
    assessments: [assessment('acme/new-tool', 90)],
    previousCatalog: { version: 1, repos: {} },
    historicalSeen: new Set(),
    existingPending: [{ repo: 'acme/new-tool', created_at: '2026-08-01' }],
    date: '2026-08-02'
  });
  assert.equal(result.newNotifications.length, 0);
  assert.equal(result.pending.length, 1);
});

test('notifications allow a ten-point score improvement', () => {
  const result = buildNotifications({
    assessments: [assessment('acme/tool', 91)],
    previousCatalog: { version: 1, repos: { 'acme/tool': { repo: 'acme/tool', notified_at: '2026-07-01', notified_score: 80, score: 80 } } },
    historicalSeen: new Set(['acme/tool']),
    existingPending: [],
    date: '2026-08-02'
  });
  assert.equal(result.newNotifications.length, 1);
});

test('all-time ranking excludes ignored repos and sorts descending', () => {
  const catalog = upsertCatalog(null, [assessment('acme/a', 75), assessment('acme/b', 90), assessment('acme/c', 40)], '2026-08-01');
  assert.deepEqual(buildAllTimeRanking(catalog).map((entry) => entry.repo), ['acme/b', 'acme/a']);
});

test('renderers expose ranking, degraded status and empty notification days', () => {
  const entry = assessment('acme/tool', 91, { first_seen: '2026-08-01', last_seen: '2026-08-01' });
  assert.match(renderAllTimeMarkdown([entry], '2026-08-01'), /Permanent totalranking/);
  assert.match(renderDailyMarkdown([entry], { date: '2026-08-01', status: 'degraded', reasons: ['fallback used'] }), /fallback used/);
  assert.match(renderNotificationsMarkdown([], '2026-08-01'), /Inga nya notifieringsvärda repos/);
});

test('analyzer creates degraded outputs and suppresses bootstrap notifications without OpenRouter', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ai-radar-test-'));
  const repo = {
    full_name: 'acme/product-video',
    html_url: 'https://github.com/acme/product-video',
    description: 'Create ecommerce product videos from images',
    language: 'TypeScript',
    topics: ['video', 'ecommerce'],
    stargazers_count: 1200,
    source_names: ['GitHub Trending – daily'],
    readme_excerpt: 'Turn product images into short campaign videos.'
  };
  await writeJson(path.join(root, 'data/latest.json'), { meta: { date: '2026-08-01' }, repos: [repo] });
  await writeJson(path.join(root, 'data/raw/2026-07-31.json'), { repos: [repo] });
  await writeFile(path.join(root, 'GOALS.md'), '# Goals\nPrioritera FAIV och konkreta verktyg.');
  const result = await runAnalyzer({ root, env: {}, now: new Date('2026-08-01T08:00:00Z'), fetchImpl: async () => { throw new Error('fetch should not be called'); } });
  assert.equal(result.status.status, 'degraded');
  assert.equal(result.notifications.length, 0);
  const ranking = JSON.parse(await readFile(path.join(root, 'rankings/all-time.json'), 'utf8'));
  const pending = JSON.parse(await readFile(path.join(root, 'notifications/pending.json'), 'utf8'));
  assert.equal(ranking[0].repo, 'acme/product-video');
  assert.deepEqual(pending, []);
});
