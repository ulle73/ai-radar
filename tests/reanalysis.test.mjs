import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldAnalyze } from '../scripts/analyze-radar.mjs';

test('old assessment schema is always reanalyzed', () => {
  const repo = { full_name: 'acme/tool', stargazers_count: 1000 };
  const previous = {
    repo: 'acme/tool',
    assessment_version: 1,
    project_context_version: 1,
    last_analyzed: '2026-08-01',
    stars: 1000
  };
  assert.equal(shouldAnalyze(repo, previous, '2026-08-02', 1), true);
});

test('fresh assessments without the current project context version are reanalyzed', () => {
  const repo = { full_name: 'acme/tool', stargazers_count: 1050 };
  const previous = {
    repo: 'acme/tool',
    assessment_version: 2,
    last_analyzed: '2026-08-01',
    stars: 1000
  };
  assert.equal(shouldAnalyze(repo, previous, '2026-08-02', 1), true);
});

test('fresh assessments from an older project context are reanalyzed', () => {
  const repo = { full_name: 'acme/tool', stargazers_count: 1050 };
  const previous = {
    repo: 'acme/tool',
    assessment_version: 2,
    project_context_version: 1,
    last_analyzed: '2026-08-01',
    stars: 1000
  };
  assert.equal(shouldAnalyze(repo, previous, '2026-08-02', 2), true);
});

test('fresh assessments from the current project context are reused when growth is insignificant', () => {
  const repo = { full_name: 'acme/tool', stargazers_count: 1050 };
  const previous = {
    repo: 'acme/tool',
    assessment_version: 2,
    project_context_version: 1,
    last_analyzed: '2026-08-01',
    stars: 1000
  };
  assert.equal(shouldAnalyze(repo, previous, '2026-08-02', 1), false);
});
