import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCard } from '../scripts/lib/v2/card-contract.mjs';
import { validateAgainstSchema } from '../scripts/lib/v2/schema-validate.mjs';
import { anvandCard, ersattCard, json, larmCard, nyCard, projektCard } from './helpers/v2-fixtures.mjs';

test('all fixture card types satisfy contract v1', () => {
  for (const card of [nyCard(), ersattCard(), projektCard(), anvandCard(), larmCard()]) {
    const result = validateCard(json(card));
    assert.deepEqual(result.errors, [], `${card.type}: ${result.errors.join('; ')}`);
    assert.equal(result.valid, true);
  }
});

test('missing required fields are reported by path', () => {
  const card = json(nyCard());
  delete card.because;
  delete card.skeptic;
  const result = validateCard(card);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('$.because: saknas'));
  assert.ok(result.errors.includes('$.skeptic: saknas'));
});

test('unknown fields, wrong enums and wrong types are rejected', () => {
  const result = validateCard(json(nyCard({ type: 'IDE', confidence: 1.4, extra: true, contract_version: 2 })));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.startsWith('$.type:')));
  assert.ok(result.errors.some((error) => error.startsWith('$.confidence:')));
  assert.ok(result.errors.includes('$.extra: okänt fält'));
  assert.ok(result.errors.some((error) => error.startsWith('$.contract_version:')));
});

test('nested observation and anchor rules are enforced', () => {
  const result = validateCard(json(nyCard({
    observations: [{ source: 'x', source_kind: 'rumor', observed_at: '19 okt', value: 'v', verified: 'ja' }],
    anchors: []
  })));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.startsWith('$.observations[0].source_kind:')));
  assert.ok(result.errors.some((error) => error.startsWith('$.observations[0].observed_at: ogiltigt format')));
  assert.ok(result.errors.some((error) => error.startsWith('$.observations[0].verified:')));
  assert.ok(result.errors.some((error) => error.startsWith('$.anchors: färre än 1')));
});

test('measure accepts null but validates objects', () => {
  assert.equal(validateCard(json(nyCard({ measure: null }))).valid, true);
  const result = validateCard(json(nyCard({ measure: { metric: 'x', baseline: '0', check_after_days: 0.5 } })));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.startsWith('$.measure.check_after_days:')));
});

test('card id pattern is enforced', () => {
  const result = validateCard(json(nyCard({ card_id: 'AR-1234' })));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.startsWith('$.card_id: matchar inte')));
});

test('schema validator refuses keywords it does not implement', () => {
  assert.throws(() => validateAgainstSchema({}, { type: 'object', oneOf: [] }), /stöds inte: oneOf/);
});
