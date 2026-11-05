import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import {
  assertClaudeSubscription, claudeArgs, classifyClaudeFailure, engineEnv, parseClaudeResult, readDpapiSecret, resolveClaude, runClaudeJson
} from '../scripts/lib/v2/judge/claude.mjs';
import { judgeEnv, quotaCause } from '../scripts/lib/v2/judge/codex.mjs';
import { availableBackends, inNightWindow, jobsAllowed, markQuota, nightKey, recordJobs, clearQuota } from '../scripts/lib/v2/judge/backends.mjs';
import { groupObservations } from '../scripts/lib/v2/judge/grouping.mjs';
import { buildCard, harnessDedupeKey } from '../scripts/lib/v2/judge/card-builder.mjs';
import { buildJudgePrompt } from '../scripts/lib/v2/judge/prompt.mjs';
import { judgeJob, toQueueResult } from '../scripts/lib/v2/judge/judge.mjs';
import { evaluateCard } from '../scripts/lib/v2/gates.mjs';
import { validateCard } from '../scripts/lib/v2/card-contract.mjs';
import { makeObservation } from '../scripts/lib/v2/observation.mjs';
import { inventory } from './helpers/v2-fixtures.mjs';

const SETTINGS = 'C:\\gk-engine\\config\\run-settings.json';

test('claudeArgs: motorns isolering, schema och inga verktyg som standard', () => {
  const args = claudeArgs({ settingsFile: SETTINGS, schema: { type: 'object' }, model: 'sonnet' });
  for (const flag of ['-p', '--restricted', '--strict-mcp-config', '--no-session-persistence']) assert.ok(args.includes(flag), flag);
  assert.equal(args[args.indexOf('--tools') + 1], '');
  assert.equal(args[args.indexOf('--disallowedTools') + 1], 'mcp__*');
  assert.equal(args[args.indexOf('--settings') + 1], SETTINGS);
  assert.equal(args[args.indexOf('--output-format') + 1], 'json');
  assert.equal(args[args.indexOf('--json-schema') + 1], '{"type":"object"}');
  assert.equal(args[args.indexOf('--model') + 1], 'sonnet');
  assert.ok(!args.includes('--dangerously-skip-permissions'));
  assert.throws(() => claudeArgs({}), /settingsFile/);
});

test('claudeArgs: utföraren får bara Read och Edit och ett tak för turer', () => {
  const args = claudeArgs({ settingsFile: SETTINGS, tools: 'Read,Edit', maxTurns: 30 });
  assert.equal(args[args.indexOf('--tools') + 1], 'Read,Edit');
  assert.equal(args[args.indexOf('--max-turns') + 1], '30');
  assert.ok(!args.includes('--json-schema'));
});

test('gränsfel (V1) och okänd utgång stoppar; vanliga fel gör det inte', () => {
  const limit = classifyClaudeFailure({ code: 1, stdout: JSON.stringify({ is_error: true, result: "You've hit your session limit · resets 9:40pm (Europe/Stockholm)" }) });
  assert.equal(limit.cause, 'quota');
  assert.equal(classifyClaudeFailure({ code: 1, stdout: '', stderr: 'API Error: 429 rate_limit_error' }).cause, 'quota');
  assert.equal(classifyClaudeFailure({ code: 3, stdout: 'skräp', stderr: '' }).cause, 'limit_or_unknown');
  assert.equal(classifyClaudeFailure({ code: 1, stdout: JSON.stringify({ is_error: true, result: 'Invalid schema' }) }).cause, null);
  assert.equal(quotaCause('ERROR: You have run out of credits. Purchase more'), 'quota');
  assert.equal(quotaCause('Selected model is at capacity'), null);
});

test('runClaudeJson läser structured_output och kastar kvotfel med cause', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'r2-claude-test-'));
  const schemaPath = path.join(dir, 's.json');
  await writeFile(schemaPath, JSON.stringify({ type: 'object' }));
  try {
    const calls = [];
    const ok = await runClaudeJson({
      prompt: 'p', schemaPath, claude: { command: 'claude', shell: false }, settingsFile: SETTINGS, env: {},
      run: async (claude, args, input, options) => {
        calls.push({ args, input, cwd: options.cwd });
        return { code: 0, stdout: JSON.stringify({ type: 'result', is_error: false, result: '', structured_output: { a: 1 } }), stderr: '' };
      }
    });
    assert.deepEqual(ok, { a: 1 });
    assert.equal(calls[0].input, 'p');
    assert.ok(calls[0].cwd.includes('ai-radar-claude-'), 'tom arbetsmapp');
    const fromText = await runClaudeJson({
      prompt: 'p', schemaPath, claude: { command: 'claude' }, settingsFile: SETTINGS, env: {},
      run: async () => ({ code: 0, stdout: JSON.stringify({ is_error: false, result: '```json\n{"b":2}\n```' }), stderr: '' })
    });
    assert.deepEqual(fromText, { b: 2 });
    await assert.rejects(runClaudeJson({
      prompt: 'p', schemaPath, claude: { command: 'claude' }, settingsFile: SETTINGS, env: {},
      run: async () => ({ code: 1, stdout: JSON.stringify({ is_error: true, result: "You've hit your session limit · resets 9:40pm" }), stderr: '' })
    }), (error) => error.cause === 'quota');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('engineEnv tar bort debiteringsvariabler (V13) och sätter motorns konfiguration', () => {
  const env = engineEnv({
    token: 'tok', configDir: 'C:\\cfg',
    env: { PATH: 'x', ANTHROPIC_API_KEY: 'a', ANTHROPIC_AUTH_TOKEN: 'b', CLAUDE_CODE_USE_BEDROCK: '1', CLAUDE_CODE_USE_VERTEX: '1',
      CLAUDE_CODE_USE_FOUNDRY: '1', ANTHROPIC_PROFILE: 'p', CLAUDE_CODE_USE_ANTHROPIC_AWS: '1', CLAUDE_CODE_USE_MANTLE: '1', CLAUDE_CODE_OAUTH_TOKEN: 'gammal' }
  });
  assert.deepEqual(Object.keys(env).sort(), ['CLAUDE_CODE_OAUTH_TOKEN', 'CLAUDE_CONFIG_DIR', 'PATH']);
  assert.equal(env.CLAUDE_CODE_OAUTH_TOKEN, 'tok');
  assert.equal(env.CLAUDE_CONFIG_DIR, 'C:\\cfg');
  assert.equal(judgeEnv({ OPENAI_API_KEY: 'x', HOME: 'h' }).OPENAI_API_KEY, undefined);
});

test('assertClaudeSubscription kräver oauth_token', async () => {
  const run = (output) => async () => ({ code: 0, stdout: output, stderr: '' });
  assert.equal(await assertClaudeSubscription({}, { run: run('{"loggedIn":true,"authMethod":"oauth_token"}') }), 'oauth_token');
  await assert.rejects(assertClaudeSubscription({}, { run: run('{"authMethod":"api_key"}') }), /abonnemanget/);
  await assert.rejects(assertClaudeSubscription({}, { run: run('Not logged in') }), /abonnemanget/);
});

test('resolveClaude hittar binären under node_modules i PATH', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'r2-path-'));
  try {
    const bin = path.join(dir, 'node_modules', '@anthropic-ai', 'claude-code', 'bin');
    await mkdir(bin, { recursive: true });
    await writeFile(path.join(bin, 'claude.exe'), '');
    assert.equal(resolveClaude([], { PATH: dir }).command, path.join(bin, 'claude.exe'));
    assert.equal(resolveClaude([], { PATH: path.join(dir, 'saknas') }).command, 'claude');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  assert.throws(() => readDpapiSecret(path.join(os.tmpdir(), 'finns-inte.dpapi')), /saknas/);
  assert.equal(parseClaudeResult('rad\n{"a":1}').a, 1);
});

test('nattfönster, nattnyckel och tak per natt', () => {
  const at = (h, m) => new Date(2026, 10, 2, h, m);
  assert.ok(inNightWindow(at(23, 45)));
  assert.ok(inNightWindow(at(2, 0)));
  assert.ok(!inNightWindow(at(5, 0)));
  assert.ok(!inNightWindow(at(14, 0)));
  assert.equal(nightKey(at(2, 0)), '2026-11-01');
  assert.equal(nightKey(at(23, 45)), '2026-11-02');
  let state = {};
  assert.deepEqual(jobsAllowed({ state, now: at(23, 45), maxPerRun: 4, maxPerNight: 20 }), { night: '2026-11-02', used: 0, allowed: 4 });
  state = recordJobs(state, { night: '2026-11-02', count: 18 });
  assert.equal(jobsAllowed({ state, now: new Date(2026, 10, 3, 1, 0), maxPerRun: 4, maxPerNight: 20 }).allowed, 2);
  assert.equal(jobsAllowed({ state, now: at(23, 45), maxPerRun: 4, maxPerNight: 20 }).used, 18);
  assert.equal(jobsAllowed({ state, now: new Date(2026, 10, 3, 23, 45), maxPerRun: 4, maxPerNight: 20 }).allowed, 4);
});

test('backend med kvotfel vilar ett dygn och ordningen följer config', () => {
  const now = new Date('2026-11-02T00:00:00Z');
  let state = markQuota({}, 'codex', now, 'slut på krediter');
  assert.deepEqual(availableBackends({ order: ['claude', 'codex'], state, now }), ['claude']);
  assert.deepEqual(availableBackends({ order: ['claude', 'codex'], state, now: new Date('2026-11-03T00:00:01Z') }), ['claude', 'codex']);
  state = clearQuota(state, 'codex');
  assert.deepEqual(availableBackends({ order: ['codex', 'claude'], state, now }), ['codex', 'claude']);
});

const lesson = (n, date, key = 'notion-las-forst') => makeObservation({
  detector: 'lessons', area: 'tools_hub', dedupe_key: `lesson:${key}:h${n}`, observed_at: `${date}T08:00:00Z`,
  source: 'Notion – Company Knowledge', source_kind: 'notion_lesson', value: `Lärdom [${key}] rad ${n}`,
  data: { key, text_hash: `h${n}`, date, agent: 'ChatGPT', source: 'chatt', page_id: 'p1' }
});
const NOW = '2026-11-02T08:00:00Z';

test('lärdomströskeln: 3 rader på 14 dagar blir ett harness-jobb, 2 gör det inte', () => {
  assert.equal(groupObservations([lesson(1, '2026-10-30'), lesson(2, '2026-11-01')], { now: NOW }).length, 0);
  assert.equal(groupObservations([lesson(1, '2026-10-01'), lesson(2, '2026-10-05'), lesson(3, '2026-11-01')], { now: NOW }).length, 0);
  const [job] = groupObservations([lesson(1, '2026-10-25'), lesson(2, '2026-10-30'), lesson(3, '2026-11-01')], { now: NOW });
  assert.equal(job.key, 'lesson:notion-las-forst');
  assert.deepEqual({ ...job.harness }, { kind: 'lesson', mistake_ref: 'notion-las-forst', rows: 3, days: 14 });
  assert.equal(job.all_observation_ids.length, 3);
});

function harnessInventory() {
  const inv = inventory();
  inv.skills.push({ name: 'gk-arbetssatt', description: 'Gemensamma arbetsregler.', plugin: 'gk-karna', path: 'plugins/gk-karna/skills/gk-arbetssatt/SKILL.md' });
  return inv;
}

const DRAFT = {
  decision: 'CARD', decision_reason: 'samma misstag tre gånger', type: 'ANVAND', area: 'tools_hub',
  title: 'Förtydliga att Notion läses först', recommendation: 'Förtydliga regeln om att läsa nodens Aktuell bild först i gk-arbetssatt.',
  because: 'Lärdomen notion-las-forst har 3 rader på 14 dagar; gk-arbetssatt saknar ett exempel på att läsa Aktuell bild före svar om Smode.',
  anchors: [{ kind: 'skill', ref: 'gk-arbetssatt' }], target_kind: 'skill', target_ref: 'gk-arbetssatt', target_branch: null, replaces: null,
  action_on_ok: 'Utföraren förtydligar regeln i gk-arbetssatt.', effort_hours: 0, monthly_cost_sek: 0, risk: 'Låg', confidence: 0.7,
  rule_text: 'Läs nodens Aktuell bild innan svar om Golfkuponger.', measure_metric: null, measure_baseline: null, measure_days: null,
  urgency_trigger: null, urgency_reason: null, test_task: null
};
const SHA = 'a'.repeat(40);

test('harness-kort: ANVAND mot skill, mistake_ref från koden, blob-sha i dedupe-nyckeln, G8 räknar körningar', () => {
  const [job] = groupObservations([lesson(1, '2026-10-25'), lesson(2, '2026-10-30'), lesson(3, '2026-11-01')], { now: NOW });
  job.harness.blob_shas = { 'gk-arbetssatt': SHA };
  assert.match(buildJudgePrompt({ job, inventory: harnessInventory(), catalog: {} }), /HARNESS-JOBB[\s\S]*notion-las-forst/);
  const card = buildCard({ job, draft: DRAFT, skeptic: { verdict: 'PASS', reason: 'konkret' }, now: NOW });
  assert.equal(card.mistake_ref, 'notion-las-forst');
  assert.equal(card.dedupe_key, harnessDedupeKey('notion-las-forst', 'gk-arbetssatt', SHA));
  assert.equal(card.measure.check_after_days, 14);
  assert.ok(validateCard(card).valid, validateCard(card).errors.join('; '));
  const budget = (used) => ({ spent_sek: 0, cap_sek: 250, harness: { candidates_tonight: used, max_candidates_per_night: 2 } });
  const ok = evaluateCard(card, { inventory: harnessInventory(), budget: budget(1), now: NOW });
  assert.ok(ok.publishable, JSON.stringify(ok.gates.filter((g) => !g.pass)));
  const full = evaluateCard(card, { inventory: harnessInventory(), budget: budget(2), now: NOW });
  assert.equal(full.gates.find((g) => g.id === 'G8').pass, false);
  const noSha = evaluateCard({ ...card, dedupe_key: harnessDedupeKey('notion-las-forst', 'gk-arbetssatt', null) }, { inventory: harnessInventory(), budget: budget(0), now: NOW });
  assert.equal(noSha.gates.find((g) => g.id === 'G3').pass, false);
  assert.equal(buildCard({ job, draft: { ...DRAFT, type: 'NY' }, skeptic: { verdict: 'PASS', reason: 'x' }, now: NOW }), null);
});

test('mistake_ref: schemat avvisar prosa (T22)', () => {
  const [job] = groupObservations([lesson(1, '2026-10-25'), lesson(2, '2026-10-30'), lesson(3, '2026-11-01')], { now: NOW });
  const card = buildCard({ job, draft: DRAFT, skeptic: { verdict: 'PASS', reason: 'konkret' }, now: NOW });
  assert.equal(validateCard({ ...card, mistake_ref: 'Läs alltid Notion först' }).valid, false);
  assert.equal(validateCard({ ...card, mistake_ref: 'ab' }).valid, false);
  assert.ok(validateCard({ ...card, mistake_ref: 'notion-las-forst' }).valid);
});

test('kvotfel ger RETRY med cause; FAILED har alltid fail_reason (T14)', async () => {
  const [job] = groupObservations([lesson(1, '2026-10-25'), lesson(2, '2026-10-30'), lesson(3, '2026-11-01')], { now: NOW });
  const quota = await judgeJob({ job, inventory: harnessInventory(), catalog: {}, runModel: async () => { throw Object.assign(new Error('slut'), { cause: 'quota' }); } });
  assert.equal(quota.status, 'RETRY');
  assert.equal(quota.cause, 'quota');
  const failed = await judgeJob({ job, inventory: harnessInventory(), catalog: {}, runModel: async () => ({ fel: true }) });
  assert.equal(failed.status, 'FAILED');
  const sent = toQueueResult(failed, 'claude:sonnet');
  assert.ok(sent.fail_reason && sent.fail_reason.length <= 300);
  assert.match(sent.fail_reason, /följde inte schemat/);
  assert.equal(toQueueResult({ ...failed, reason: '' }).fail_reason, 'okänt fel');
  assert.equal(toQueueResult({ ...failed, status: 'DISMISSED' }).fail_reason, undefined);
});
