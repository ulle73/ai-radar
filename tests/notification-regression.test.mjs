import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNotifications } from '../scripts/lib/catalog.mjs';

function exceptionalAssessment() {
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
    risks: []
  };
}

test('historically seen exceptional repo is notified when it has never been sent', () => {
  const result = buildNotifications({
    assessments: [exceptionalAssessment()],
    previousCatalog: {
      version: 2,
      repos: {
        'yc-software/qm': {
          repo: 'yc-software/qm',
          first_seen: '2026-08-01',
          notified_at: null,
          notified_score: null
        }
      }
    },
    historicalSeen: new Set(['yc-software/qm']),
    existingPending: [],
    date: '2026-08-02'
  });

  assert.equal(result.newNotifications.length, 1);
  assert.equal(result.newNotifications[0].repo, 'yc-software/qm');
  assert.equal(result.newNotifications[0].kind, 'first_exceptional_match');
});
