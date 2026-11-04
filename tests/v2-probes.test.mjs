import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { acceptableVersions, answeredVersion, consecutiveFailures, gradeAnswers, gradeP1, gradeP2, parseProbeRow, probeObservations, probeVersions, recordHistory, stockholmDay, webRegression, webVerified } from '../scripts/lib/v2/detectors/probes.mjs';
import { codexProbeArgs, CODEX_PROBE_MARKER, PROBES, runCodexProbe } from '../scripts/lib/v2/harness/monitor.mjs';
import { awaitingWebVerification } from '../scripts/lib/v2/harness/controller.mjs';

const canary = { canary_code: 'GK-NEW234', canary_code_prev: 'GK-OLD567', valid_from: '2026-11-08T23:05:00.000Z' };
const versions = [{ version: '1.0.4', at: '2026-11-02T01:00:00Z' }, { version: '1.0.5', at: '2026-11-05T01:00:00Z' }];
const facitPatterns = [/logg/iu, /growth log/iu];
const row = (yta, probe, answer, askedAt, n = 1) => ({
  observation_id: `OB-${Buffer.from(`${yta}${probe}${askedAt}${n}`).toString('hex').slice(0, 12).padEnd(12, '0')}`,
  data: { yta, probe, asked_at: askedAt, answer_excerpt: answer, n, day: stockholmDay(askedAt) }
});

test('P1 bedöms mot koden som gällde när frågan ställdes (giltighetsfönster)', () => {
  assert.equal(gradeP1('Koden är GK-OLD567', canary, '2026-11-08T22:00:00Z').pass, true, 'före rotationen gäller föregående kod');
  assert.equal(gradeP1('GK-NEW234', canary, '2026-11-08T22:00:00Z').pass, false);
  assert.equal(gradeP1('gk-new234', canary, '2026-11-09T06:30:00Z').pass, true, 'efter rotationen gäller den nya koden');
  assert.equal(gradeP1('GK-OLD567', canary, '2026-11-09T06:30:00Z').pass, false);
  assert.equal(gradeP1('x', {}, '2026-11-09T06:30:00Z').pass, false);
});

test('P2 godtar föregående version bara inom 26 timmar efter publicering', () => {
  assert.deepEqual(acceptableVersions(versions, '2026-11-05T06:30:00Z'), ['1.0.5', '1.0.4']);
  assert.deepEqual(acceptableVersions(versions, '2026-11-07T06:30:00Z'), ['1.0.5']);
  assert.deepEqual(acceptableVersions(versions, '2026-11-01T06:30:00Z'), []);
  assert.equal(gradeP2('gk-probe version: 1.0.4', versions, '2026-11-05T06:30:00Z').pass, true);
  assert.equal(gradeP2('gk-probe version: 1.0.4', versions, '2026-11-07T06:30:00Z').pass, false);
  assert.equal(gradeP2('Svara exakt: gk-probe version: 1.0.5', versions, '2026-11-07T06:30:00Z').pass, true);
  assert.equal(answeredVersion('Svara exakt: gk-probe version: 1.0.5'), '1.0.5');
});

test('bara dagens första svar per yta och probe räknas; inget omdöme från klienten', () => {
  const rows = [
    row('chatgpt', 'P1', 'GK-NEW234', '2026-11-09T05:45:00Z', 1),
    row('chatgpt', 'P1', 'GK-OLD567', '2026-11-09T05:50:00Z', 2),
    { ...row('claude_ai', 'P2', 'gk-probe version: 1.0.5', '2026-11-09T05:30:00Z'), data: { ...row('claude_ai', 'P2', 'gk-probe version: 1.0.5', '2026-11-09T05:30:00Z').data, verdict: 'pass' } }
  ];
  const graded = gradeAnswers(rows, { canary, versions, facitPatterns });
  assert.deepEqual(graded.map((g) => [g.yta, g.probe, g.n, g.status]), [
    ['chatgpt', 'P1', 1, 'GRADED_PASS'],
    ['chatgpt', 'P1', 2, 'GRADED_IGNORED'],
    ['claude_ai', 'P2', 1, 'GRADED_PASS']
  ]);
  // Ett påstått omdöme i indata ignoreras: bedömningen görs alltid av motorn.
  const forged = { ...row('chatgpt', 'P3', 'vet ej', '2026-11-09T05:45:00Z'), data: { ...row('chatgpt', 'P3', 'vet ej', '2026-11-09T05:45:00Z').data, verdict: 'pass', pass: true } };
  assert.equal(gradeAnswers([forged], { canary, versions, facitPatterns })[0].status, 'GRADED_FAIL');
  assert.equal(parseProbeRow({ data_json: JSON.stringify({ yta: 'okand', probe: 'P1' }) }), null);
});

test('underkännande ger en observation dag 1 och larmet probe_failed dag 2', () => {
  const day1 = gradeAnswers([row('chatgpt', 'P1', 'fel kod', '2026-11-09T05:45:00Z')], { canary, versions, facitPatterns });
  let history = recordHistory({}, day1);
  const first = probeObservations(day1, history, '2026-11-09T06:00:00Z');
  assert.equal(first.length, 1);
  assert.equal(first[0].alert_trigger, null);
  assert.equal(first[0].source_kind, 'probe');

  const day2 = gradeAnswers([row('chatgpt', 'P1', 'fel igen', '2026-11-10T05:45:00Z')], { canary, versions, facitPatterns });
  history = recordHistory(history, day2);
  assert.ok(consecutiveFailures(history, 'chatgpt', 'P1'));
  const second = probeObservations(day2, history, '2026-11-10T06:00:00Z');
  assert.equal(second[0].alert_trigger, 'probe_failed');
  assert.notEqual(first[0].dedupe_key, second[0].dedupe_key);

  const passed = recordHistory(history, [{ yta: 'chatgpt', probe: 'P1', day: '2026-11-11', verdict: 'pass' }]);
  assert.ok(!consecutiveFailures(passed, 'chatgpt', 'P1'));
  const gap = recordHistory({}, [{ yta: 'codex', probe: 'P3', day: '2026-11-01', verdict: 'fail' }, { yta: 'codex', probe: 'P3', day: '2026-11-09', verdict: 'fail' }]);
  assert.ok(!consecutiveFailures(gap, 'codex', 'P3'), 'två underkännanden med en vecka emellan är inte i rad');
});

test('versionsläge, webbverifiering och webbregression (T19b)', () => {
  const graded = [
    { yta: 'claude_ai', probe: 'P2', asked_at: '2026-11-06T05:30:00Z', verdict: 'pass', version: '1.0.5' },
    { yta: 'claude_ai', probe: 'P3', asked_at: '2026-11-06T05:30:00Z', verdict: 'pass' },
    { yta: 'chatgpt', probe: 'P2', asked_at: '2026-11-06T05:45:00Z', verdict: 'pass', version: '1.0.4' }
  ];
  const state = probeVersions(null, graded, versions);
  assert.deepEqual(state.surfaces, { claude_ai: { version: '1.0.5', at: '2026-11-06T05:30:00Z' }, chatgpt: { version: '1.0.4', at: '2026-11-06T05:45:00Z' } });
  assert.equal(state.published, '1.0.5');
  assert.equal(webVerified(graded, '2026-11-05T01:00:00Z', '1.0.5'), false, 'ChatGPT har inte den nya versionen och saknar P3');
  const later = [...graded,
    { yta: 'chatgpt', probe: 'P2', asked_at: '2026-11-07T05:45:00Z', verdict: 'pass', version: '1.0.5' },
    { yta: 'chatgpt', probe: 'P3', asked_at: '2026-11-07T05:45:00Z', verdict: 'pass' }];
  assert.equal(webVerified(later, '2026-11-05T01:00:00Z', '1.0.5'), true);
  const history = recordHistory({}, [
    { yta: 'chatgpt', probe: 'P3', day: '2026-11-06', verdict: 'fail' },
    { yta: 'chatgpt', probe: 'P3', day: '2026-11-07', verdict: 'fail' },
    { yta: 'claude_code', probe: 'P3', day: '2026-11-06', verdict: 'fail' },
    { yta: 'claude_code', probe: 'P3', day: '2026-11-07', verdict: 'fail' }
  ]);
  assert.deepEqual(webRegression(history), ['chatgpt'], 'bara webbytorna ger beslutspunkt; lokala ytor återställs i nattfasen');
});

test('Codex-proben: ephemeral, skrivskyddad, markör och svar ur -o-filen', async () => {
  const args = codexProbeArgs({ workDir: 'W', outFile: 'W/svar.txt' });
  for (const flag of ['--ephemeral', '--skip-git-repo-check', 'read-only', '-o']) assert.ok(args.includes(flag), flag);
  assert.ok(!args.includes('--ignore-user-config'), 'Jonas konfiguration behövs för Notion och gk-karna');
  let input = null;
  const result = await runCodexProbe({
    question: PROBES.P1,
    codex: { command: 'codex', shell: false },
    run: async (_cmd, _args, stdin) => { input = stdin; return { code: 0, stdout: '', stderr: '' }; },
    read: async () => 'GK-NEW234\n'
  });
  assert.ok(input.startsWith(CODEX_PROBE_MARKER));
  assert.deepEqual(result, { ok: true, answer: 'GK-NEW234\n' });
  const empty = await runCodexProbe({ question: PROBES.P1, codex: {}, run: async () => ({ code: 0 }), read: async () => '' });
  assert.equal(empty.ok, false);
});

test('nattfasen väntar på webbverifiering bara när den krävs', () => {
  const rows = [{ card_id: 'R2-a', published_version: '1.0.5', published_at: '2026-11-05T01:00:00Z' }];
  assert.equal(awaitingWebVerification(rows, { required: false, now: '2026-11-06T00:00:00Z' }), null);
  assert.equal(awaitingWebVerification(rows, { required: true, now: '2026-11-06T00:00:00Z' }).card_id, 'R2-a');
  assert.equal(awaitingWebVerification([{ ...rows[0], web_verified_at: '2026-11-06T06:00:00Z' }], { required: true, now: '2026-11-06T07:00:00Z' }), null);
  assert.equal(awaitingWebVerification([{ ...rows[0], rolled_back_at: '2026-11-05T02:00:00Z' }], { required: true, now: '2026-11-06T00:00:00Z' }), null);
  assert.equal(awaitingWebVerification(rows, { required: true, now: '2026-11-20T00:00:00Z' }), null, 'spärren släpper efter 7 dagar');
});

test('flödena: verktyget är fristående från motorns signerade väg och probfrågorna är ordagranna', () => {
  const tool = readFileSync(new URL('../n8n/gk-kvitto-probsvar.workflow.ts', import.meta.url), 'utf8');
  const probes = readFileSync(new URL('../n8n/r2-probes.workflow.ts', import.meta.url), 'utf8');
  assert.match(tool, /\['claude_ai', 'chatgpt'\]\.includes\(yta\)/, 'verktyget tar bara emot webbytor');
  assert.match(probes, /\['claude_code', 'codex'\]\.includes\(yta\)/, 'motorns väg tar bara emot lokala ytor');
  assert.match(probes, /createHmac\('sha256', secret\)/);
  assert.ok(!/createHmac/.test(tool), 'verktyget körs bara manuellt via n8n-MCP och publiceras inte');
  for (const source of [tool, probes]) {
    assert.match(source, /högst 10 probsvar per yta och dag/);
    const outside = source.replace(/jsCode: `(?:[^`\\]|\\.)*`/g, '');
    assert.ok(!/^\s*function\s/m.test(outside) && !/=>/.test(outside), 'SDK:n tillåter inga funktioner utanför jsCode');
  }
  assert.match(tool, /högst 60 kvitton per timme och yta/);
  const doc = readFileSync(new URL('../scripts/lib/v2/harness/monitor.mjs', import.meta.url), 'utf8');
  assert.match(doc, /Läs noden \[TEST\] Kanariefakta i Notion och svara bara med koden\./);
});
