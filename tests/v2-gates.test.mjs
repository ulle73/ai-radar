import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCard, selectForBrief } from '../scripts/lib/v2/gates.mjs';
import {
  BUDGET,
  NOW,
  anvandCard,
  ersattCard,
  inventory,
  json,
  larmCard,
  nyCard,
  projektCard
} from './helpers/v2-fixtures.mjs';

function evaluate(card, overrides = {}) {
  return evaluateCard(json(card), { inventory: inventory(), budget: BUDGET, now: NOW, ...overrides });
}

function failed(result) {
  return result.gates.filter((gate) => !gate.pass).map((gate) => gate.id);
}

function reasonOf(result, id) {
  return result.gates.find((gate) => gate.id === id)?.reason || '';
}

test('every well-formed card type passes all gates', () => {
  for (const card of [nyCard(), ersattCard(), projektCard(), anvandCard(), larmCard()]) {
    const result = evaluate(card);
    assert.deepEqual(failed(result), [], `${card.type}: ${JSON.stringify(result.gates)}`);
    assert.equal(result.publishable, true);
    assert.equal(result.unverified, false);
  }
});

test('G1 rejects cards backed only by an aggregator', () => {
  const result = evaluate(nyCard({
    observations: [{
      source: 'agentnative.inc/updates',
      source_kind: 'aggregator',
      url: 'https://agentnative.inc/updates',
      observed_at: '2026-10-18T10:00:00Z',
      value: 'Rumors of a new model',
      verified: true
    }]
  }));
  assert.deepEqual(failed(result), ['G1']);
});

test('G1 requires a vendor primary source for platform news', () => {
  const aggregatorOnly = evaluate(anvandCard({
    platform_news: true,
    observations: [
      { source: 'agentnative', source_kind: 'aggregator', url: 'https://agentnative.inc/updates', observed_at: '2026-10-18T10:00:00Z', value: 'x', verified: true },
      { source: 'YouTube', source_kind: 'video', observed_at: '2026-10-18T10:00:00Z', value: 'nämnt i video', verified: true }
    ]
  }));
  assert.deepEqual(failed(aggregatorOnly), ['G1']);
  assert.match(reasonOf(aggregatorOnly, 'G1'), /primärkälla/);

  const fakePrimary = evaluate(anvandCard({
    platform_news: true,
    observations: [{ source: 'blogg', source_kind: 'primary', url: 'https://claude-news.example.com/x', observed_at: '2026-10-18T10:00:00Z', value: 'x', verified: true }]
  }));
  assert.deepEqual(failed(fakePrimary), ['G1']);

  const realPrimary = evaluate(anvandCard({
    platform_news: true,
    observations: [{ source: 'Claude Code-release', source_kind: 'primary', url: 'https://github.com/anthropics/claude-code/releases', observed_at: '2026-10-18T10:00:00Z', value: 'ny version', verified: true }]
  }));
  assert.deepEqual(failed(realPrimary), []);
});

test('G1 rejects stale, future and unverified observations', () => {
  const stale = evaluate(nyCard({ observations: [{ ...nyCard().observations[0], observed_at: '2026-06-01T00:00:00Z' }] }));
  const future = evaluate(nyCard({ observations: [{ ...nyCard().observations[0], observed_at: '2026-10-25T00:00:00Z' }] }));
  const unverified = evaluate(nyCard({ observations: [{ ...nyCard().observations[0], verified: false }] }));
  for (const result of [stale, future, unverified]) assert.deepEqual(failed(result), ['G1']);
});

test('G2 rejects invented anchors and targets', () => {
  const anchor = evaluate(nyCard({ anchors: [{ kind: 'skill', ref: 'golf-magic' }] }));
  assert.ok(failed(anchor).includes('G2'));
  assert.match(reasonOf(anchor, 'G2'), /golf-magic/);

  const target = evaluate(projektCard({ target: { kind: 'repo', ref: 'ulle73/okant-repo', branch: 'radar/x' } }));
  assert.ok(failed(target).includes('G2'));
});

test('G3 rejects NY for something the hub already has, including tool- prefix', () => {
  assert.ok(failed(evaluate(nyCard({ target: { kind: 'skill', ref: 'hyperframes' } }))).includes('G3'));
  assert.ok(failed(evaluate(nyCard({ target: { kind: 'tool', ref: 'ffmpeg' } }))).includes('G3'));
});

test('G3 enforces the decision cooldown and needs new evidence after a no', () => {
  const recent = evaluate(nyCard(), { decisions: [{ dedupe_key: 'skill:caption-kit', decided_at: '2026-09-01T00:00:00Z', outcome: 'INTE_NU' }] });
  assert.deepEqual(failed(recent), ['G3']);

  const oldNoWithoutEvidence = evaluate(
    nyCard({ observations: [{ ...nyCard().observations[0], observed_at: '2026-07-01T00:00:00Z' }] }),
    { decisions: [{ dedupe_key: 'skill:caption-kit', decided_at: '2026-07-10T00:00:00Z', outcome: 'NEJ' }] }
  );
  assert.ok(failed(oldNoWithoutEvidence).includes('G3'));

  const oldNoWithEvidence = evaluate(nyCard(), { decisions: [{ dedupe_key: 'skill:caption-kit', decided_at: '2026-07-10T00:00:00Z', outcome: 'NEJ' }] });
  assert.deepEqual(failed(oldNoWithEvidence), []);
});

test('G4 rejects a because clause without a named entity from our stack', () => {
  const result = evaluate(nyCard({ because: 'Det här verktyget är populärt och används av många utvecklare världen över.' }));
  assert.deepEqual(failed(result), ['G4']);
  assert.match(reasonOf(result, 'G4'), /namngiven entitet/);
});

test('G4 rejects generic phrasing without a number, even when an entity is named', () => {
  const generic = evaluate(nyCard({ because: 'hyperframes blir bättre och det här kommer att öka engagemang på alla era kanaler.' }));
  assert.deepEqual(failed(generic), ['G4']);
  assert.match(reasonOf(generic, 'G4'), /öka engagemang/);

  const withNumber = evaluate(nyCard({ because: 'hyperframes-klippen med ordsynk fick 3,1× fler visningar, vilket kan öka engagemang i content-engine.' }));
  assert.deepEqual(failed(withNumber), []);
});

test('G4 rejects a too short because clause', () => {
  assert.deepEqual(failed(evaluate(nyCard({ because: 'hyperframes behöver detta nu.' }))), ['G4']);
});

test('G5 rejects skeptic REJECT and penalises DOWNGRADE', () => {
  assert.deepEqual(failed(evaluate(nyCard({ skeptic: { verdict: 'REJECT', reason: 'Finns redan i Claude Code.' } }))), ['G5']);
  const passed = evaluate(nyCard());
  const downgraded = evaluate(nyCard({ skeptic: { verdict: 'DOWNGRADE', reason: 'Osäker nytta.' } }));
  assert.equal(downgraded.publishable, true);
  assert.equal(downgraded.rank_score, passed.rank_score - 15);
});

test('G6 fails closed on invalid contracts, fallback analysis and expired cards', () => {
  const broken = json(nyCard());
  delete broken.target;
  const invalid = evaluateCard(broken, { inventory: inventory(), budget: BUDGET, now: NOW });
  assert.equal(invalid.publishable, false);
  assert.equal(invalid.gates[0].id, 'G6');
  assert.match(invalid.gates[0].reason, /target: saknas/);

  assert.deepEqual(failed(evaluate(nyCard({ analysis_mode: 'fallback' }))), ['G6']);
  assert.deepEqual(failed(evaluate(nyCard({ expires_at: '2026-10-01T00:00:00Z' }))), ['G6']);
});

test('G8 fails closed when the budget is spent or unknown', () => {
  assert.deepEqual(failed(evaluate(nyCard(), { budget: { spent_sek: 250, cap_sek: 250 } })), ['G8']);
  assert.deepEqual(failed(evaluate(nyCard(), { budget: null })), ['G8']);
});

test('NY requires a clean scan, an allowed license and both clients', () => {
  const scan = evaluate(nyCard({ security: { static_scan: 'findings', license: 'MIT', clients: ['claude', 'codex'] } }));
  const license = evaluate(nyCard({ security: { static_scan: 'clean', license: 'GPL-3.0', clients: ['claude', 'codex'] } }));
  const missing = evaluate(nyCard({ security: undefined }));
  const oneClient = evaluate(nyCard({ security: { static_scan: 'clean', license: 'MIT', clients: ['codex'] } }));
  for (const result of [scan, license, missing, oneClient]) assert.deepEqual(failed(result), ['TYP']);

  const explained = evaluate(nyCard({ security: { static_scan: 'clean', license: 'MIT', clients: ['codex'], client_note: 'Kräver node_repl som bara finns i Codex.' } }));
  assert.deepEqual(failed(explained), []);
});

test('NY with a failed test is rejected; an unrun test makes it unverified', () => {
  assert.deepEqual(failed(evaluate(nyCard({ test: { ...nyCard().test, outcome: 'fail' } }))), ['TYP']);
  const unrun = evaluate(nyCard({ test: { kind: 'smoke', outcome: 'not_run', verified: false } }));
  assert.equal(unrun.publishable, true);
  assert.equal(unrun.unverified, true);
});

test('ERSATT requires an A/B test where the new one wins without losing', () => {
  const noAb = evaluate(ersattCard({ test: { ...nyCard().test } }));
  assert.deepEqual(failed(noAb), ['TYP']);
  assert.match(reasonOf(noAb, 'TYP'), /A\/B/);

  const oldWins = ersattCard();
  oldWins.test.ab.criteria = [{ name: 'tid', winner: 'new' }, { name: 'bildkvalitet', winner: 'old' }];
  assert.deepEqual(failed(evaluate(oldWins)), ['TYP']);

  const onlyTies = ersattCard();
  onlyTies.test.ab.criteria = [{ name: 'tid', winner: 'tie' }];
  assert.deepEqual(failed(evaluate(onlyTies)), ['TYP']);
});

test('ERSATT requires that the replaced thing exists in the hub', () => {
  const result = evaluate(ersattCard({ replaces: 'okand-skill' }));
  assert.ok(failed(result).includes('TYP'));
});

test('PROJEKT never targets main, protected branches or Fabric', () => {
  const main = evaluate(projektCard({ target: { kind: 'repo', ref: 'ulle73/content-engine', branch: 'main' } }));
  assert.deepEqual(failed(main), ['TYP']);

  const protectedRef = evaluate(projektCard({
    anchors: [{ kind: 'repo', ref: 'golfkuponger-app' }],
    because: 'golfkuponger-app saknar 2 av 4 spårningshändelser i checkout, så konverteringen kan inte mätas per kanal.',
    target: { kind: 'repo', ref: 'ulle73/golfkuponger-app', branch: 'redesign/app-v2' }
  }));
  assert.deepEqual(failed(protectedRef), ['TYP']);

  const noPrefix = evaluate(projektCard({ target: { kind: 'repo', ref: 'ulle73/content-engine', branch: 'feature/x' } }));
  assert.deepEqual(failed(noPrefix), ['TYP']);

  const fabric = evaluate(projektCard({ action_on_ok: 'Uppdatera sektionen i Fabric-temat direkt.' }));
  assert.deepEqual(failed(fabric), ['TYP']);
  assert.match(reasonOf(fabric, 'TYP'), /Fabric/);
});

test('PROJEKT requires a measure with baseline', () => {
  assert.deepEqual(failed(evaluate(projektCard({ measure: null }))), ['TYP']);
});

test('ANVAND requires a short rule', () => {
  assert.deepEqual(failed(evaluate(anvandCard({ rule_text: null }))), ['TYP']);
  assert.deepEqual(failed(evaluate(anvandCard({ rule_text: 'a\nb\nc\nd' }))), ['TYP']);
});

test('LARM requires urgency and an observation from the last 48 hours', () => {
  assert.deepEqual(failed(evaluate(larmCard({ urgency: undefined }))), ['TYP']);
  const old = larmCard();
  old.observations[0].observed_at = '2026-10-15T06:00:00Z';
  assert.deepEqual(failed(evaluate(old)), ['TYP']);
  assert.deepEqual(failed(evaluate(larmCard({ urgency: { ...larmCard().urgency, expires_at: '2026-10-19T07:00:00Z' } }))), ['TYP']);
});

test('G7 caps the brief at 3 cards and 2 per area, keeps alerts apart and holds unverified cards', () => {
  const cards = [
    nyCard({ card_id: 'R2-hub-1', dedupe_key: 'test:a', confidence: 0.95 }),
    nyCard({ card_id: 'R2-hub-2', dedupe_key: 'test:b', confidence: 0.9, target: { kind: 'skill', ref: 'kit-b' } }),
    nyCard({ card_id: 'R2-hub-3', dedupe_key: 'test:c', confidence: 0.85, target: { kind: 'skill', ref: 'kit-c' } }),
    projektCard({ card_id: 'R2-soc-1', confidence: 0.7 }),
    projektCard({ card_id: 'R2-soc-2', confidence: 0.6, dedupe_key: 'test:d' }),
    nyCard({ card_id: 'R2-hub-4', dedupe_key: 'test:e', confidence: 0.99, target: { kind: 'skill', ref: 'kit-e' }, test: { kind: 'smoke', outcome: 'not_run', verified: false } }),
    larmCard(),
    nyCard({ card_id: 'R2-bad-1', dedupe_key: 'test:f', analysis_mode: 'fallback' })
  ];
  const { brief, alerts, held } = selectForBrief(cards.map((card) => evaluate(card)));

  assert.deepEqual(brief.map((item) => item.card_id), ['R2-hub-1', 'R2-hub-2', 'R2-soc-1']);
  assert.deepEqual(alerts.map((item) => item.card_id), ['R2-test-0005']);
  const heldById = Object.fromEntries(held.map((item) => [item.card_id, item.reason]));
  assert.match(heldById['R2-hub-3'], /max 2 per område/);
  assert.match(heldById['R2-soc-2'], /brevet är fullt/);
  assert.match(heldById['R2-hub-4'], /overifierad/);
  assert.match(heldById['R2-bad-1'], /grindarna/);
});

test('an empty day produces an empty brief', () => {
  assert.deepEqual(selectForBrief([]), { brief: [], alerts: [], held: [] });
});

test('a scan or test that has not run yet makes NY and ERSATT unverified, never rejected or briefed', () => {
  const notScanned = evaluate(nyCard({ security: { static_scan: 'not_run', license: null, clients: [] } }));
  assert.deepEqual(failed(notScanned), []);
  assert.equal(notScanned.unverified, true);

  const abPending = evaluate(ersattCard({ test: { kind: 'ab', outcome: 'not_run', verified: false } }));
  assert.deepEqual(failed(abPending), []);
  assert.equal(abPending.unverified, true);

  const abPassedWithoutData = evaluate(ersattCard({ test: { kind: 'ab', outcome: 'pass', verified: true } }));
  assert.deepEqual(failed(abPassedWithoutData), ['TYP']);

  const { brief, held } = selectForBrief([notScanned, abPending]);
  assert.deepEqual(brief, []);
  assert.equal(held.length, 2);
});
