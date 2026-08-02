import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAssessment } from '../scripts/lib/assessment.mjs';

function modelAssessment(project) {
  return {
    repo: 'acme/tool',
    summary_sv: 'Konkret verktyg för ett aktivt projekt.',
    project_matches: [{ project, reason: 'Löser ett namngivet arbetsflöde.' }],
    match_type: 'exact',
    category: 'workflow-tool',
    concrete_use_case: 'Testa verktyget i ett befintligt arbetsflöde.',
    next_step: 'Kör ett avgränsat test.',
    differentiator: 'Tillför en konkret funktion som saknas.',
    evidence: ['README beskriver den konkreta funktionen.'],
    dimensions: {
      project_fit: 25,
      concrete_value: 15,
      testability: 10,
      technical_fit: 10,
      repo_quality: 8,
      timing: 8
    },
    risks: [],
    confidence: 0.86
  };
}

test('canonical project display names are accepted', () => {
  const errors = validateAssessment(
    modelAssessment('Golfkuponger'),
    'acme/tool',
    'model',
    ['Golfkuponger', 'Stock Signals']
  );
  assert.deepEqual(errors, []);
});

test('aliases and invented project names are rejected', () => {
  const errors = validateAssessment(
    modelAssessment('stock-signals'),
    'acme/tool',
    'model',
    ['Golfkuponger', 'Stock Signals']
  );
  assert.ok(errors.some((error) => /project_matches.*canonical/i.test(error)));
});
