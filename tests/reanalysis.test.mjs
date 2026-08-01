import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldAnalyze } from '../scripts/analyze-radar.mjs';

test('assessment version one is always reanalyzed under version two rules', () => {
  const repo = { full_name: 'acme/tool', stargazers_count: 1000 };
  const previous = {
    repo: 'acme/tool',
    assessment_version: 1,
    last_analyzed: '2026-08-01',
    stars: 1000
  };
  assert.equal(shouldAnalyze(repo, previous, '2026-08-02'), true);
});

test('fresh version two assessments are reused when growth is insignificant', () => {
  const repo = { full_name: 'acme/tool', stargazers_count: 1050 };
  const previous = {
    repo: 'acme/tool',
    assessment_version: 2,
    last_analyzed: '2026-08-01',
    stars: 1000
  };
  assert.equal(shouldAnalyze(repo, previous, '2026-08-02'), false);
});
