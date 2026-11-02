import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { afterPublish, breakerTripped, judgeP2, judgeP3, parseFacitPatterns, PROBE_MARKER, runLocalProbe } from '../scripts/lib/v2/harness/monitor.mjs';

const FACIT = readFileSync(new URL('./fixtures/p3-facit.md', import.meta.url), 'utf8');
const GOOD_P3 = 'Lärdomen sparas under ## Logg i kunskapsnoden i Company Knowledge som saken gäller, annars som en rad i Growth Log. Format: - Lärdom [notion-las-forst]: <text> (YYYY-MM-DD, agent, källa). Nyckeln i kebab-case; sök efter Lärdom [ först.';

test('P2: exakt publicerad version', () => {
  assert.equal(judgeP2('gk-probe version: 1.0.4', '1.0.4').pass, true);
  assert.equal(judgeP2('gk-probe version: 1.0.41', '1.0.4').pass, false);
  assert.equal(judgeP2('gk-probe version: 1.0.3', '1.0.4').pass, false);
});

test('P3: facit tolkas ur p3-facit.md och bedöms deterministiskt', () => {
  const patterns = parseFacitPatterns(FACIT);
  assert.equal(patterns.length, 6);
  assert.equal(judgeP3(GOOD_P3, patterns).pass, true);
  assert.equal(judgeP3('Spara den i Notion.', patterns).pass, false);
  assert.equal(judgeP3(GOOD_P3, []).pass, false);
});

test('lokal återställning: underkänd P3 efter publicering ger rollback i samma körning (T19a)', async () => {
  const patterns = parseFacitPatterns(FACIT);
  let rolledBack = 0;
  const answers = { P2: 'gk-probe version: 1.0.4', P3: 'Ingen aning.' };
  const result = await afterPublish({
    version: '1.0.4', facitPatterns: patterns,
    probe: async (name) => ({ ok: true, answer: answers[name] }),
    rollback: async () => { rolledBack += 1; return { ok: true, version: '1.0.5' }; }
  });
  assert.equal(result.verified, false);
  assert.equal(result.rolled_back, true);
  assert.equal(rolledBack, 1);
  const ok = await afterPublish({
    version: '1.0.4', facitPatterns: patterns,
    probe: async (name) => ({ ok: true, answer: name === 'P2' ? 'gk-probe version: 1.0.4' : GOOD_P3 }),
    rollback: async () => { rolledBack += 1; return { ok: true }; }
  });
  assert.equal(ok.verified, true);
  assert.equal(rolledBack, 1);
  const broken = await afterPublish({ version: '1.0.4', facitPatterns: patterns, probe: async () => ({ ok: false }), rollback: async () => ({ ok: false, reason: 'konflikt' }) });
  assert.deepEqual([broken.verified, broken.rolled_back], [false, false]);
});

test('probe-cc: markör, ingen sparad session, Jonas konfiguration (ingen motor-CLAUDE_CONFIG_DIR)', async () => {
  let seen;
  const result = await runLocalProbe({
    question: 'Vilken version har gk-probe?', claude: { command: 'claude' }, env: { PATH: 'x' },
    run: async (claude, args, input, options) => { seen = { args, input, options }; return { code: 0, stdout: JSON.stringify({ is_error: false, result: 'gk-probe version: 1.0.4' }) }; }
  });
  assert.equal(result.answer, 'gk-probe version: 1.0.4');
  assert.ok(seen.input.startsWith(PROBE_MARKER));
  assert.ok(seen.args.includes('--no-session-persistence'));
  assert.ok(!seen.args.includes('--restricted'));
  assert.equal(seen.options.env.CLAUDE_CONFIG_DIR, undefined);
});

test('brytaren: två återställningar inom 14 dagar', () => {
  const now = '2026-11-20T00:00:00Z';
  assert.equal(breakerTripped(['2026-11-10T00:00:00Z'], undefined, now), false);
  assert.equal(breakerTripped(['2026-11-10T00:00:00Z', '2026-11-19T00:00:00Z'], undefined, now), true);
  assert.equal(breakerTripped(['2026-10-01T00:00:00Z', '2026-11-19T00:00:00Z'], undefined, now), false);
});
