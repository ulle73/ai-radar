import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQualityMetrics,
  buildStrictRanking,
  classifyQuality,
  rankingScore
} from '../scripts/lib/quality.mjs';

function entry(repo, overrides = {}) {
  return {
    repo,
    url: `https://github.com/${repo}`,
    summary_sv: 'Konkret verktyg för ett namngivet projekt.',
    project_matches: [{ project: 'FAIV', reason: 'Skapar kampanjmaterial från befintliga produktbilder.' }],
    dimensions: {
      project_fit: 25,
      concrete_value: 15,
      testability: 10,
      technical_fit: 12,
      repo_quality: 8,
      timing: 8
    },
    score: 78,
    confidence: 0.8,
    analysis_mode: 'model',
    assessment_version: 2,
    match_type: 'exact',
    category: 'product-video',
    concrete_use_case: 'Generera korta FAIV-kampanjvideor från fem befintliga produktbilder.',
    next_step: 'Kör fem bilder genom repots exempel och jämför output och tidsåtgång.',
    differentiator: 'Kör lokalt och har ett färdigt bild-till-video-flöde.',
    evidence: ['README visar bild-till-video-pipeline.'],
    first_seen: '2026-08-01',
    last_seen: '2026-08-02',
    ...overrides
  };
}

test('generic high-score repos are archived instead of ranked', () => {
  const result = classifyQuality(entry('acme/generic-agent', {
    score: 95,
    confidence: 0.95,
    match_type: 'generic'
  }));
  assert.equal(result.tier, 'archive');
  assert.ok(result.failed_gates.includes('exact_match'));
});

test('exact evidence-backed matches can qualify as strong', () => {
  const result = classifyQuality(entry('acme/product-video', { score: 80 }));
  assert.equal(result.tier, 'strong');
  assert.deepEqual(result.failed_gates, []);
});

test('exceptional tier requires both high score and confidence', () => {
  assert.equal(classifyQuality(entry('acme/excellent', { score: 90, confidence: 0.9 })).tier, 'exceptional');
  assert.equal(classifyQuality(entry('acme/uncertain', { score: 90, confidence: 0.8 })).tier, 'strong');
});

test('fallback assessments can never qualify for the main ranking', () => {
  const result = classifyQuality(entry('acme/fallback', {
    score: 99,
    confidence: 0.99,
    analysis_mode: 'fallback'
  }));
  assert.equal(result.tier, 'archive');
  assert.ok(result.failed_gates.includes('model_analysis'));
});

test('ranking score applies freshness penalty but protects adopted repos', () => {
  const stale = entry('acme/stale', { score: 85, confidence: 0.9, last_seen: '2026-05-01' });
  assert.equal(rankingScore(stale, '2026-08-02', null), null);
  assert.equal(rankingScore(stale, '2026-08-02', { status: 'adopted' }), 89);
});

test('strict ranking caps duplicate categories at two and rejects feedback-rejected repos', () => {
  const catalog = {
    repos: {
      a: entry('acme/a', { score: 92, confidence: 0.92, category: 'agent-framework' }),
      b: entry('acme/b', { score: 90, confidence: 0.9, category: 'agent-framework' }),
      c: entry('acme/c', { score: 89, confidence: 0.9, category: 'agent-framework' }),
      d: entry('acme/d', { score: 88, confidence: 0.9, category: 'product-video' })
    }
  };
  const ranking = buildStrictRanking(catalog, '2026-08-02', { 'acme/d': { status: 'rejected' } });
  assert.deepEqual(ranking.map((item) => item.repo), ['acme/a', 'acme/b']);
});

test('quality metrics warn when recommendation rate exceeds twenty percent', () => {
  const assessments = Array.from({ length: 10 }, (_, index) => entry(`acme/${index}`, {
    score: index < 3 ? 88 : 40,
    confidence: index < 3 ? 0.9 : 0.5,
    match_type: index < 3 ? 'exact' : 'generic',
    category: index < 3 ? 'agent-framework' : 'other'
  }));
  const eligible = assessments.slice(0, 3);
  const metrics = buildQualityMetrics(assessments, eligible, eligible.slice(0, 2));
  assert.equal(metrics.quality_status, 'warning');
  assert.ok(metrics.warning_reasons.includes('recommendation_rate_above_20_percent'));
  assert.equal(metrics.recommendation_rate, 0.3);
});

test('quality metrics report gate exclusions and average confidence', () => {
  const assessments = [
    entry('acme/exact'),
    entry('acme/generic', { match_type: 'generic', confidence: 0.4, score: 90 })
  ];
  const metrics = buildQualityMetrics(assessments, [assessments[0]], [assessments[0]]);
  assert.equal(metrics.match_types.exact, 1);
  assert.equal(metrics.match_types.generic, 1);
  assert.equal(metrics.excluded_by_gate.exact_match, 1);
  assert.equal(metrics.average_confidence, 0.6);
});
