import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runAnalyzer } from '../scripts/analyze-radar.mjs';
import { writeCanonicalProjectCatalog } from './helpers/project-context-fixture.mjs';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2));
}

function exceptionalCatalogEntry() {
  return {
    repo: 'yc-software/qm',
    url: 'https://github.com/yc-software/qm',
    summary_sv: 'Multiplayer agent-harness med isolerade arbetsmiljöer.',
    project_matches: [{ project: 'FAIV', reason: 'Kan ge separat AI-arbetsyta per användare.' }],
    dimensions: {
      project_fit: 25,
      concrete_value: 18,
      testability: 12,
      technical_fit: 15,
      repo_quality: 9,
      timing: 10
    },
    score: 89,
    confidence: 0.85,
    action: 'Testa nu',
    quality_tier: 'exceptional',
    analysis_mode: 'model',
    assessment_version: 2,
    match_type: 'exact',
    category: 'agent-harness',
    concrete_use_case: 'Testa separata arbetsmiljöer för två användare i samma agentinstans.',
    next_step: 'Kör en demo med två samtidiga användare.',
    differentiator: 'Isolerade arbetsmiljöer med delat minne.',
    evidence: ['README beskriver isolerade arbetsmiljöer per användare.'],
    risks: [],
    source_names: ['GitHub Search API'],
    stars: 5244,
    language: 'TypeScript',
    first_seen: '2026-08-01',
    last_seen: '2026-08-02',
    first_recommended: '2026-08-01',
    last_analyzed: '2026-08-02',
    notified_at: null,
    notified_score: null
  };
}

test('reused exceptional assessment that was never sent enters the notification queue', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ai-radar-reused-notification-'));
  const repo = {
    full_name: 'yc-software/qm',
    html_url: 'https://github.com/yc-software/qm',
    description: 'Multiplayer agent harness',
    language: 'TypeScript',
    topics: ['agents'],
    stargazers_count: 5244,
    source_names: ['GitHub Search API'],
    readme_excerpt: 'Isolated workspaces per user.'
  };

  await writeJson(path.join(root, 'data/latest.json'), { meta: { date: '2026-08-02' }, repos: [repo] });
  await writeJson(path.join(root, 'data/raw/2026-08-01.json'), { repos: [repo] });
  await writeJson(path.join(root, 'state/repo-catalog.json'), {
    version: 2,
    updated_at: '2026-08-02',
    repos: { 'yc-software/qm': exceptionalCatalogEntry() }
  });
  await writeJson(path.join(root, 'state/feedback.json'), {});
  await writeJson(path.join(root, 'notifications/pending.json'), []);
  await writeFile(path.join(root, 'GOALS.md'), '# Goals\nPrioritera FAIV.');
  await writeCanonicalProjectCatalog(root);

  const result = await runAnalyzer({
    root,
    env: {},
    now: new Date('2026-08-02T07:00:00Z'),
    fetchImpl: async () => { throw new Error('fetch should not be called for reused assessments'); }
  });

  assert.equal(result.status.reused_today, 1);
  assert.equal(result.status.new_notifications, 1);
  assert.equal(result.notifications[0].repo, 'yc-software/qm');
  assert.equal(result.notifications[0].kind, 'first_exceptional_match');
});
