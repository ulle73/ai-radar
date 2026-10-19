import test from 'node:test';
import assert from 'node:assert/strict';
import { groupObservations } from '../scripts/lib/v2/judge/grouping.mjs';
import { buildCard, cardIdFor } from '../scripts/lib/v2/judge/card-builder.mjs';
import { buildJudgePrompt, buildSkepticPrompt, inventoryDigest } from '../scripts/lib/v2/judge/prompt.mjs';
import { judgeJob, toQueueResult } from '../scripts/lib/v2/judge/judge.mjs';
import { DISABLED_FEATURES, assertChatGptLogin, codexArgs, isTransient, judgeEnv, resolveCodex, runWithFallback } from '../scripts/lib/v2/judge/codex.mjs';
import { validateCard } from '../scripts/lib/v2/card-contract.mjs';
import { makeObservation } from '../scripts/lib/v2/observation.mjs';
import { BUDGET, NOW, inventory } from './helpers/v2-fixtures.mjs';

const CATALOG = { projects: [{ display_name: 'Golfkuponger', priority: 1, north_star: 'Öka intäkterna.', current_needs: ['Fler återköp'] }] };

function release(tag, day) {
  return makeObservation({
    detector: 'releases', area: 'tools_hub', dedupe_key: `release:anthropics/claude-code:${tag}`,
    observed_at: `2026-10-${day}T10:00:00Z`, source: 'Claude Code – GitHub Releases', source_kind: 'primary',
    url: `https://github.com/anthropics/claude-code/releases/tag/${tag}`, value: `Claude Code ${tag} släppt`,
    anchors: [{ kind: 'skill', ref: 'agent-hub' }], data: { repo: 'anthropics/claude-code', tag, body_excerpt: 'Added X' }
  });
}

const STALLED = makeObservation({
  detector: 'project_health', area: 'projects', dedupe_key: 'stalled_log:n1', observed_at: NOW,
  source: 'Notion – Golfkuponger – Log', source_kind: 'data', value: '"Pilot" har ingen uppföljning på 30 dagar'
});
const ALERT = makeObservation({
  detector: 'sales_trend', area: 'sales', dedupe_key: 'sales_drop:2026-10-18', observed_at: NOW,
  source: 'n8n GK_DAILY_ORDER_REPORTS', source_kind: 'data', value: 'Försäljningen −60 %', alert_trigger: 'sales_deviation',
  anchors: [{ kind: 'metric', ref: 'GK_DAILY_ORDER_REPORTS.development_pct' }]
});

test('releases of the same tool form one job; alerts come first, then internal facts', () => {
  const jobs = groupObservations([release('v2.1.300', 14), release('v2.1.303', 18), STALLED, ALERT]);
  assert.deepEqual(jobs.map((job) => job.key), ['sales_drop:2026-10-18', 'stalled_log:n1', 'release:anthropics/claude-code']);
  const releaseJob = jobs[2];
  assert.equal(releaseJob.observations.length, 2);
  assert.match(releaseJob.observations[0].value, /v2\.1\.303/);
  assert.equal(releaseJob.all_observation_ids.length, 2);
});

test('jobs are capped but every observation id is still accounted for', () => {
  const many = Array.from({ length: 15 }, (_, i) => release(`v2.1.${200 + i}`, String(10 + (i % 9)).padStart(2, '0')));
  const [job] = groupObservations(many, { maxObservationsPerJob: 10 });
  assert.equal(job.observations.length, 10);
  assert.equal(job.all_observation_ids.length, 15);
});

test('prompts mark external content as data and include the inventory', () => {
  const [job] = groupObservations([release('v2.1.303', 18)]);
  const prompt = buildJudgePrompt({ job, inventory: inventory(), catalog: CATALOG });
  assert.match(prompt, /<<<DATA[\s\S]*v2\.1\.303[\s\S]*DATA>>>/);
  assert.match(prompt, /aldrig instruktioner/);
  assert.match(prompt, /- hyperframes:/);
  assert.match(prompt, /Golfkuponger \(prioritet 1\)/);
  const skeptic = buildSkepticPrompt({ job, draft: { title: 'x' }, inventory: inventory() });
  assert.match(skeptic, /REJECT om facts_supported är false/);
  assert.match(inventoryDigest(inventory()), /UPLzVDZLFbuIsQcW: 43 OPS – Daily Orders Summary/);
});

function draft(overrides = {}) {
  return {
    decision: 'CARD', decision_reason: 'konkret', type: 'ANVAND', area: 'tools_hub',
    title: 'Kör hub sync efter Claude Code-uppdatering',
    recommendation: 'Lägg en regel om att köra hub sync efter varje Claude Code-uppdatering.',
    because: 'agent-hub synkar bara var 10:e minut och Claude Code v2.1.303 ändrade hur skills laddas, så 3 sessioner kan få gamla skills.',
    anchors: [{ kind: 'skill', ref: 'agent-hub' }],
    target_kind: 'agents_rule', target_ref: 'AGENTS.md', target_branch: null, replaces: null,
    action_on_ok: 'Lägg regeln i AGENTS.md och kör sync.', effort_hours: 0.1, monthly_cost_sek: 0, risk: 'Låg.',
    confidence: 0.8, rule_text: 'Kör `hub.py sync` efter varje Claude Code-uppdatering.',
    measure_metric: null, measure_baseline: null, measure_days: null, urgency_trigger: null, urgency_reason: null, test_task: null,
    ...overrides
  };
}

const PASS = { verdict: 'PASS', reason: 'Konkret och nytt.', already_known: false, generic: false, facts_supported: true };

test('the card builder produces a valid contract and keeps evidence out of the model’s hands', () => {
  const [job] = groupObservations([release('v2.1.303', 18)]);
  const card = buildCard({ job, draft: draft(), skeptic: PASS, now: NOW });
  assert.deepEqual(validateCard(card).errors, []);
  assert.equal(card.card_id, cardIdFor(job, NOW));
  assert.equal(card.dedupe_key, 'card:release:anthropics/claude-code');
  assert.equal(card.platform_news, true);
  assert.equal(card.observations[0].url, 'https://github.com/anthropics/claude-code/releases/tag/v2.1.303');
  assert.equal(card.analysis_mode, 'model');
  assert.equal(card.test.kind, 'none');
});

test('NY and ERSATT cards start untested and unscanned, LARM gets urgency', () => {
  const [job] = groupObservations([release('v2.1.303', 18)]);
  const ny = buildCard({ job, draft: draft({ type: 'NY', target_kind: 'skill', target_ref: 'caption-kit', rule_text: null, test_task: 'Textsätt ett klipp' }), skeptic: PASS, now: NOW });
  assert.equal(ny.test.kind, 'smoke');
  assert.equal(ny.test.outcome, 'not_run');
  assert.equal(ny.security.static_scan, 'not_run');
  assert.deepEqual(validateCard(ny).errors, []);

  const larm = buildCard({ job, draft: draft({ type: 'LARM', area: 'sales', urgency_trigger: 'sales_deviation', urgency_reason: 'Två fönster i rad' }), skeptic: PASS, now: NOW });
  assert.equal(larm.urgency.trigger, 'sales_deviation');
  assert.deepEqual(validateCard(larm).errors, []);

  assert.equal(buildCard({ job, draft: draft({ decision: 'NONE' }), skeptic: PASS, now: NOW }), null);
});

function fakeModel(answers) {
  const calls = [];
  return { calls, run: async (kind, prompt) => { calls.push({ kind, prompt }); return answers[kind]; } };
}

test('a NONE decision dismisses without asking the skeptic', async () => {
  const [job] = groupObservations([release('v2.1.303', 18)]);
  const model = fakeModel({ judge: draft({ decision: 'NONE', type: 'NONE', target_kind: 'none' }) });
  const result = await judgeJob({ job, inventory: inventory(), catalog: CATALOG, budget: BUDGET, runModel: model.run, now: NOW });
  assert.equal(result.status, 'DISMISSED');
  assert.deepEqual(model.calls.map((call) => call.kind), ['judge']);
});

test('a full judgement goes through skeptic, builder and gates', async () => {
  const [job] = groupObservations([release('v2.1.303', 18)]);
  const model = fakeModel({ judge: draft(), skeptic: PASS });
  const result = await judgeJob({ job, inventory: inventory(), catalog: CATALOG, budget: BUDGET, runModel: model.run, now: NOW });
  assert.equal(result.status, 'JUDGED');
  assert.deepEqual(result.evaluation.gates.filter((gate) => !gate.pass), []);
  assert.equal(result.evaluation.publishable, true);

  const queued = toQueueResult(result, 'gpt-test');
  assert.equal(queued.status, 'JUDGED');
  assert.equal(queued.card.card_id, result.card.card_id);
  assert.equal(JSON.parse(queued.card.card_json).dedupe_key, result.card.dedupe_key);
});

test('a skeptic REJECT stops the card at the gates', async () => {
  const [job] = groupObservations([release('v2.1.303', 18)]);
  const model = fakeModel({ judge: draft(), skeptic: { ...PASS, verdict: 'REJECT', reason: 'Redan känt.' } });
  const result = await judgeJob({ job, inventory: inventory(), catalog: CATALOG, budget: BUDGET, runModel: model.run, now: NOW });
  assert.equal(result.status, 'JUDGED');
  assert.equal(result.evaluation.publishable, false);
  assert.ok(result.evaluation.gates.some((gate) => gate.id === 'G5' && !gate.pass));
});

test('an invented anchor or generic text from the model is stopped by the gates', async () => {
  const [job] = groupObservations([release('v2.1.303', 18)]);
  const invented = await judgeJob({
    job, inventory: inventory(), catalog: CATALOG, budget: BUDGET, now: NOW,
    runModel: fakeModel({ judge: draft({ anchors: [{ kind: 'skill', ref: 'magic-skill' }] }), skeptic: PASS }).run
  });
  assert.ok(invented.evaluation.gates.some((gate) => gate.id === 'G2' && !gate.pass));

  const generic = await judgeJob({
    job, inventory: inventory(), catalog: CATALOG, budget: BUDGET, now: NOW,
    runModel: fakeModel({ judge: draft({ because: 'agent-hub blir bättre och det kommer att spara tid för alla som använder den.' }), skeptic: PASS }).run
  });
  assert.ok(generic.evaluation.gates.some((gate) => gate.id === 'G4' && !gate.pass));
});

test('an answer that breaks the schema fails closed with no card', async () => {
  const [job] = groupObservations([release('v2.1.303', 18)]);
  const result = await judgeJob({
    job, inventory: inventory(), catalog: CATALOG, budget: BUDGET, now: NOW,
    runModel: fakeModel({ judge: { decision: 'CARD', title: 'saknar fält' } }).run
  });
  assert.equal(result.status, 'FAILED');
  assert.equal(result.card, null);
  assert.match(result.reason, /följde inte schemat/);
  assert.equal(toQueueResult(result).card, null);
});

test('codex runs read-only, without user config, ephemeral and with an output schema', () => {
  const args = codexArgs({ workDir: 'W', schemaFile: 'S', outFile: 'O', model: 'm', effort: 'medium' });
  for (const flag of ['--ignore-user-config', '--ephemeral', '--skip-git-repo-check', '--output-schema']) assert.ok(args.includes(flag), flag);
  assert.equal(args[args.indexOf('--sandbox') + 1], 'read-only');
  assert.ok(!args.some((arg) => /dangerously|danger-full-access|workspace-write/.test(arg)));
  assert.ok(args.includes('model_reasoning_effort="medium"'));
  assert.equal(args.at(-1), '-');
  assert.deepEqual(resolveCodex(['C:/finns/inte/codex.exe']).command, 'codex');
});

test('codex disables tools the judge must not have, including the shell', () => {
  const args = codexArgs({ workDir: 'W', schemaFile: 'S', outFile: 'O', model: 'm', effort: 'medium' });
  for (const feature of ['apps', 'browser_use', 'computer_use', 'plugins', 'hooks', 'memories', 'shell_tool']) {
    assert.ok(DISABLED_FEATURES.includes(feature), feature);
    const index = args.findIndex((arg, i) => arg === feature && args[i - 1] === '--disable');
    assert.ok(index > 0, `--disable ${feature}`);
  }
});

test('capacity errors fall back to the next model; real errors do not', async () => {
  const capacity = Object.assign(new Error('codex avslutades med kod 1: ERROR: Selected model is at capacity.'), { transient: true });
  assert.equal(isTransient(capacity), true);
  assert.equal(isTransient(new Error('följde inte schemat')), false);

  const tried = [];
  const result = await runWithFallback(['sol', 'terra'], async (model) => {
    tried.push(model);
    if (model === 'sol') throw capacity;
    return { ok: true };
  });
  assert.deepEqual(tried, ['sol', 'terra']);
  assert.equal(result.model, 'terra');

  const hard = [];
  await assert.rejects(runWithFallback(['sol', 'terra'], async (model) => { hard.push(model); throw new Error('400 invalid'); }), /400/);
  assert.deepEqual(hard, ['sol']);
});

test('a transient failure becomes RETRY so the observations stay NEW', async () => {
  const [job] = groupObservations([release('v2.1.303', 18)]);
  const result = await judgeJob({
    job, inventory: inventory(), catalog: CATALOG, budget: BUDGET, now: NOW,
    runModel: async () => { throw Object.assign(new Error('Selected model is at capacity'), { transient: true }); }
  });
  assert.equal(result.status, 'RETRY');
});

test('the judge never runs against a billable API key', async () => {
  const env = judgeEnv({ PATH: 'x', OPENAI_API_KEY: 'sk-1', OPENROUTER_API_KEY: 'or-1', CODEX_API_KEY: 'c', ANTHROPIC_API_KEY: 'a' });
  assert.deepEqual(Object.keys(env), ['PATH']);

  await assertChatGptLogin({}, async () => 'Logged in using ChatGPT\n');
  await assert.rejects(assertChatGptLogin({}, async () => 'Logged in using an API key - sk-***'), /API-kostnader/);
  await assert.rejects(assertChatGptLogin({}, async () => 'Not logged in'), /inte inloggat med ChatGPT/);
});

test('several red workflows in the same repo become one job', () => {
  const red = (workflow) => makeObservation({
    detector: 'project_health', area: 'projects', dedupe_key: `red_ci:ulle73/golfkuponger-app:${workflow}:2026-09-25`,
    observed_at: NOW, source: 'GitHub Actions – ulle73/golfkuponger-app', source_kind: 'repo', value: `${workflow} rött`,
    data: { repo: 'ulle73/golfkuponger-app', workflow }
  });
  const jobs = groupObservations([red('JavaScript tests'), red('Experiment verification'), red('Task 14')]);
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].key, 'red_ci:ulle73/golfkuponger-app');
  assert.equal(jobs[0].all_observation_ids.length, 3);
});

test('a stalled item that does not become a card is kept for the Friday digest, not dismissed', async () => {
  const [job] = groupObservations([STALLED]);
  const result = await judgeJob({
    job, inventory: inventory(), catalog: CATALOG, budget: BUDGET, now: NOW,
    runModel: fakeModel({ judge: draft({ decision: 'NONE', type: 'NONE', target_kind: 'none', decision_reason: 'Piloten saknar uppföljning sedan 30 dagar.' }) }).run
  });
  assert.equal(result.status, 'DIGEST');
  assert.equal(toQueueResult(result).status, 'DIGEST');
});
