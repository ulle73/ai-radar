// Nattfasen "GK Harness nattfas" (harness-designen C0–C7, etapp 1a).
//
//   node scripts/v2/harness-night.mjs [--ignore-window] [--dry-run] [--card <id>] [--selftest]
//
// Ordning per kort: controller → C3a → implementer → C3b (+ skeptiker) → verifier → publisher → probe → monitor.
// Timeouts: implementer 15 min, verifier 40 min, publisher 10 min, probe 15 min, hela körningen 5 timmar.
// Ett steg som misslyckas avbryter kortet. Före varje steg läses tillståndet i n8n; broms, läsfel, brytare
// eller ett ogodkänt skyddsräckespaket stoppar motorn – utom återställning och larm, som alltid körs.
// --dry-run kör till och med verifieringen men publicerar inget. --selftest kör bara självtestet (V9, T31).

import { existsSync, readFileSync } from 'node:fs';
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSecrets, postSigned } from '../lib/v2/n8n-client.mjs';
import { inNightWindow, nightKey } from '../lib/v2/judge/backends.mjs';
import { judgeEnv } from '../lib/v2/judge/codex.mjs';
import {
  assertClaudeSubscription, claudeArgs, enginePaths, engineEnv, parseClaudeResult, readDpapiSecret, resolveClaude, runClaudeJson, runClaudeProcess
} from '../lib/v2/judge/claude.mjs';
import { formatDecisionMessage, harnessControlComponents } from '../lib/v2/discord.mjs';
import { gate, guardrailHash, idleMinutes, mayStart, pendingHarnessCards, stateClient, withTimeout } from '../lib/v2/harness/controller.mjs';
import { AUTO, AVVISAD, KRAVER_OK, autoPathFor, buildDiffSkepticPrompt, c3a, c3b } from '../lib/v2/harness/policy.mjs';
import { buildExcerpt, prepareWorkspace, readTemplate, removeWorkspace, runImplementer } from '../lib/v2/harness/implementer.mjs';
import { verifyCandidate } from '../lib/v2/harness/verifier.mjs';
import { checkWorkspaceIntact, commitCandidate, publishCard, rollbackCard, stagedDiff, syncLocal } from '../lib/v2/harness/publisher.mjs';
import { afterPublish, breakerTripped, parseFacitPatterns, PROBES, runLocalProbe } from '../lib/v2/harness/monitor.mjs';
import { git } from '../lib/v2/harness/git.mjs';

const MIN = 60000;
const TIMEOUTS = Object.freeze({ implementer: 15 * MIN, verifier: 40 * MIN, publisher: 10 * MIN, probe: 15 * MIN, total: 300 * MIN });
const HUB_REMOTE = 'https://github.com/ulle73/gk-agents.git';
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const engine = enginePaths();
const agentsDir = path.join(os.homedir(), '.agents');
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : null; };
const dryRun = flag('dry-run');
const started = Date.now();

await mkdir(engine.logs, { recursive: true });
const logFile = path.join(engine.logs, `night-${nightKey()}.log`);
const log = async (line) => {
  const text = `${new Date().toISOString()} ${line}`;
  console.log(text);
  await appendFile(logFile, `${text}\n`);
};
const readJson = (file, fallback) => { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return fallback; } };

// ---------------------------------------------------------------- tillstånd och livstecken

let client = null;
let lastState = null;
let stateError = null;
async function readState() {
  try {
    lastState = await client.read();
    stateError = null;
    await writeFile(path.join(engine.state, 'n8n-ok.json'), JSON.stringify({ at: new Date().toISOString() }));
  } catch (error) {
    lastState = null;
    stateError = String(error?.message || error);
  }
  return lastState;
}

async function liveness(note) {
  try {
    await client.write({ liveness_at: new Date().toISOString(), liveness_note: String(note).slice(0, 300) });
  } catch (error) {
    await log(`livstecken kunde inte skrivas: ${error.message}`);
    await fallbackAlert(`n8n nås inte: ${error.message}`);
  }
}

// Reservkanal: om n8n inte har nåtts på 6 timmar postar motorn direkt till en Discord-webhook (DPAPI).
async function fallbackAlert(text) {
  const ok = Date.parse(readJson(path.join(engine.state, 'n8n-ok.json'), {}).at || '') || 0;
  const webhookFile = path.join(engine.secrets, 'discord-webhook.dpapi');
  if (Date.now() - ok < 6 * 60 * MIN || !existsSync(webhookFile)) return;
  try {
    const url = readDpapiSecret(webhookFile);
    await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: `🚨 GK-motorn (reservkanal): ${text}`.slice(0, 1900), allowed_mentions: { parse: [] } }) });
  } catch (error) {
    await log(`reservkanalen misslyckades: ${error.message}`);
  }
}

async function alert(title, detail) {
  await log(`LARM ${title}: ${detail}`);
  try {
    await client.alert({ content: `🚨 **${title}** · AI Radar v2 (harness)`, embeds: [{ title: String(title).slice(0, 256), description: String(detail).slice(0, 3800) }], components: harnessControlComponents({ brake: lastState?.brake }) });
  } catch (error) {
    await fallbackAlert(`${title}: ${detail}`);
  }
}

async function step(name, work, timeoutMs, { guardrail } = {}) {
  await readState();
  const decision = gate({ step: name, state: lastState, readError: stateError, guardrail });
  if (!decision.go) {
    if (decision.alert) await alert('Skyddsräckespaketet är inte godkänt', `${decision.reason}. Godkänn med knappen om ändringen är avsedd.`);
    throw Object.assign(new Error(`stopp före ${name}: ${decision.reason}`), { stop: true });
  }
  if (Date.now() - started > TIMEOUTS.total) throw Object.assign(new Error('nattfasens tidsgräns (5 timmar) är nådd'), { stop: true });
  return withTimeout(work(), timeoutMs, name);
}

// ---------------------------------------------------------------- förberedelser

async function ensureCheckouts() {
  if (!existsSync(path.join(engine.clone, '.git'))) {
    await mkdir(engine.root, { recursive: true });
    await git({ cwd: engine.root }, ['clone', '--quiet', HUB_REMOTE, engine.clone]);
    await git({ gitDir: path.join(engine.clone, '.git') }, ['config', 'core.autocrlf', 'false']);
  }
  const repo = { gitDir: path.join(engine.clone, '.git') };
  await git(repo, ['fetch', '--quiet', 'origin']);
  if (!existsSync(path.join(engine.trusted, '.git'))) {
    await git(repo, ['worktree', 'add', '--quiet', '--detach', engine.trusted, 'origin/main']);
  } else {
    await git({ cwd: engine.trusted }, ['checkout', '--quiet', '--force', '--detach', 'origin/main']);
  }
}

// Självtest (V9, T31): setup-token på abonnemanget och en körning utan verktyg i en tom mapp.
async function selfTest(claude, env) {
  const method = await assertClaudeSubscription(claude, { env });
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'gk-selftest-'));
  try {
    const { code, stdout } = await runClaudeProcess(claude, claudeArgs({ settingsFile: engine.runSettings, model: 'haiku' }), 'Svara bara: motor-ok', { timeoutMs: 3 * MIN, env, cwd });
    const result = parseClaudeResult(stdout);
    if (code !== 0 || !/motor-ok/i.test(String(result?.result || ''))) throw new Error(`självtestet gav inte motor-ok (kod ${code})`);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
  return method;
}

// ---------------------------------------------------------------- ett kort

async function processCard({ row, card }, ctx) {
  const id = card.card_id;
  const update = (fields) => (dryRun ? Promise.resolve() : client.cardUpdate(id, fields));
  const policy = ctx.policy;
  const approved = /^[0-9a-f]{64}$/.test(String(row.approved_diff_sha256 || '')) ? row.approved_diff_sha256 : null;
  await log(`kort ${id}: ${card.target?.ref} (${card.mistake_ref})`);

  // C3a
  const a = c3a(card, policy, { approvedDiffSha: approved || (row.decision === 'OK' ? 'c3a-ok' : null) });
  if (a.outcome !== AUTO) {
    if (row.autonomy !== KRAVER_OK) {
      await update({ autonomy: KRAVER_OK, autonomy_reason: a.reason });
      if (!dryRun) await client.decision(id, formatDecisionMessage(card, { reason: a.reason, validUntil: new Date(Date.now() + 30 * 86400000).toISOString() }));
    }
    return { card: id, outcome: 'beslutspunkt (C3a)', reason: a.reason };
  }

  const targetRel = ctx.inventoryPath(card.target.ref) || autoPathFor(policy, card.target.ref);
  const excerpt = buildExcerpt(ctx.lessonLines(card), { workflowNames: ctx.workflowNames });
  if (!excerpt.ok) {
    await update({ autonomy: AVVISAD, autonomy_reason: 'injection_suspected', fail_reason: `innehållsspärren i utdraget: ${excerpt.findings.map((f) => f.id).join(', ')}` });
    return { card: id, outcome: 'avvisad', reason: 'injection_suspected (utdrag)' };
  }

  // C4
  const workspace = await step('implementer', () => prepareWorkspace({ clone: engine.clone, workRoot: engine.work, cardId: id }), TIMEOUTS.implementer);
  try {
    const implemented = await step('implementer', () => runImplementer({
      workspace, card, targetRel, excerpt: excerpt.text, template: readTemplate(engine.trusted), claude: ctx.claude, env: ctx.env,
      baseSettings: readJson(engine.runSettings, {}), tmpDir: engine.tmp
    }), TIMEOUTS.implementer, { guardrail: ctx.guardrail });

    const intact = await checkWorkspaceIntact({ dir: workspace.dir, before: implemented.before, targetFile: implemented.targetFile });
    if (!intact.ok) {
      await update({ autonomy: AVVISAD, autonomy_reason: 'arbetsytan ändrad', fail_reason: intact.reason });
      return { card: id, outcome: 'avvisad', reason: intact.reason };
    }

    // C3b på den faktiska diffen
    const diffText = await stagedDiff(workspace.location, workspace.base);
    const oldText = await git(workspace.location, ['show', `${workspace.base}:${targetRel}`]).catch(() => '');
    const newText = existsSync(implemented.targetFile) ? await readFile(implemented.targetFile, 'utf8') : '';
    const b = c3b({ diffText, card, policy, targetPath: targetRel, oldText, newText, approvedDiffSha: approved, workflowNames: ctx.workflowNames });
    await log(`kort ${id}: C3b ${b.outcome} – ${b.reason}`);
    await update({ change_class: b.change_class, autonomy: b.outcome, autonomy_reason: String(b.reason).slice(0, 300) });
    if (b.outcome === AVVISAD) return { card: id, outcome: 'avvisad', reason: b.reason };
    if (b.outcome === KRAVER_OK) {
      if (!dryRun) await client.decision(id, formatDecisionMessage(card, { reason: b.reason, diff: diffText, diffSha256: b.diff_sha256, validUntil: new Date(Date.now() + 30 * 86400000).toISOString() }));
      return { card: id, outcome: 'beslutspunkt (C3b)', reason: b.reason, diff_sha256: b.diff_sha256 };
    }

    // Skeptikern granskar diffen mot mistake_ref.
    const skeptic = await step('skeptic', () => runClaudeJson({
      prompt: buildDiffSkepticPrompt({ diffText, mistakeRef: card.mistake_ref }),
      schemaPath: path.join(repoRoot, 'schemas', 'skeptic-output.v1.schema.json'), claude: ctx.claude, env: ctx.env, settingsFile: engine.runSettings, model: 'sonnet'
    }), 10 * MIN, { guardrail: ctx.guardrail });
    if (skeptic.verdict === 'REJECT') {
      await update({ autonomy: AVVISAD, autonomy_reason: 'skeptikern underkände diffen', fail_reason: String(skeptic.reason).slice(0, 300) });
      return { card: id, outcome: 'avvisad', reason: `skeptiker: ${skeptic.reason}` };
    }

    const commit = await commitCandidate(workspace.location, card);

    // C5
    const verification = await step('verifier', () => verifyCandidate({
      workspaceDir: workspace.dir, trustedDir: engine.trusted, tmpRoot: engine.tmp, changedSkills: [card.target.ref],
      claude: ctx.claude, env: ctx.env, secretFile: engine.notionTestToken, logFile: path.join(engine.logs, 'notion-test.log')
    }), TIMEOUTS.verifier, { guardrail: ctx.guardrail });
    await log(`kort ${id}: verifiering ${verification.status} – ${verification.reason}`);
    if (verification.status === 'needs_eval') {
      await update({ autonomy: 'needs_eval', fail_reason: verification.reason });
      return { card: id, outcome: 'behöver eval-fall', reason: verification.reason };
    }
    if (verification.status !== 'verified') {
      await update({ fail_reason: verification.reason });
      return { card: id, outcome: 'underkänd i verifieringen', reason: verification.reason };
    }
    if (dryRun) return { card: id, outcome: 'verifierad (dry-run, inte publicerad)', commit };

    // C6
    const published = await step('publisher', () => publishCard({ clone: engine.clone, cardId: id, base: workspace.base, branch: workspace.branch, trustedDir: engine.trusted }), TIMEOUTS.publisher, { guardrail: ctx.guardrail });
    if (!published.ok) {
      await update({ fail_reason: published.reason });
      return { card: id, outcome: published.retry ? 'provas nästa natt' : 'publicering misslyckades', reason: published.reason };
    }
    ctx.night.candidates += 1;
    await update({ commit_sha: published.commit || commit, published_version: published.version, published_at: new Date().toISOString(), outcome_due: new Date(Date.now() + 14 * 86400000).toISOString(), fail_reason: '' });
    await syncLocal({ agentsDir, claude: ctx.claude, env: judgeEnv(process.env) });

    // C7 lokalt: P2 och P3 med probe-cc; underkänd probe ger återställning i samma nattfas.
    const facit = parseFacitPatterns(readFileSync(path.join(engine.trusted, 'evals', 'gk-karna', 'p3-facit.md'), 'utf8'));
    const monitored = await withTimeout(afterPublish({
      version: published.version,
      facitPatterns: facit,
      probe: (name) => runLocalProbe({ question: PROBES[name], claude: ctx.claude }),
      rollback: async () => {
        const undone = await rollbackCard({ clone: engine.clone, cardId: id, trustedDir: engine.trusted });
        if (undone.ok) await syncLocal({ agentsDir, claude: ctx.claude, env: judgeEnv(process.env) });
        return undone;
      }
    }), TIMEOUTS.probe, 'probe');
    if (monitored.verified) {
      await update({ verified_local_at: new Date().toISOString() });
      return { card: id, outcome: 'publicerad och lokalt verifierad', version: published.version };
    }
    await update({ rolled_back_at: monitored.rolled_back ? new Date().toISOString() : null, fail_reason: monitored.results.filter((r) => !r.pass).map((r) => `${r.probe}: ${r.reason}`).join('; ').slice(0, 300) });
    await alert('Återställning efter underkänd probe', `${id}: ${monitored.results.map((r) => `${r.probe} ${r.pass ? 'ok' : 'FEL'} (${r.reason})`).join(', ')}. Återställd: ${monitored.rolled_back ? 'ja' : 'NEJ – ' + (monitored.rollback?.reason || '')}`);
    if (monitored.rollback?.conflict) await client.write({ 'breaker:skill_text': 'on' }).catch(() => {});
    return { card: id, outcome: monitored.rolled_back ? 'återställd' : 'återställning misslyckades', reason: monitored.results };
  } finally {
    await removeWorkspace({ clone: engine.clone, dir: workspace.dir, branch: workspace.branch }).catch(() => {});
  }
}

// ---------------------------------------------------------------- huvudflödet

let exitCode = 0;
try {
  await mkdir(engine.state, { recursive: true });
  await mkdir(engine.tmp, { recursive: true });
  const secrets = loadSecrets();
  client = stateClient((payload) => postSigned({ ...secrets, path: 'r2-harness-state', payload, timeoutMs: 60000 }));

  const claude = resolveClaude(readJson(path.join(repoRoot, 'config', 'v2', 'judge.json'), {}).claude_paths || []);
  const env = engineEnv({ token: readDpapiSecret(engine.oauthToken), configDir: engine.configDir });
  await log(`självtest: ${await selfTest(claude, env)}`);
  if (flag('selftest')) {
    await liveness('självtest ok');
    process.exit(0);
  }

  if (!flag('ignore-window')) {
    const start = mayStart({ idle: await idleMinutes(), inWindow: (now) => inNightWindow(now, { start: '23:30', end: '05:00' }) });
    if (!start.go) {
      await liveness(`nattfasen hoppades över: ${start.reason}`);
      await log(`hoppar över: ${start.reason}`);
      process.exit(0);
    }
  }

  await ensureCheckouts();
  const guardrail = await guardrailHash(engine.clone);
  await readState();
  const opening = gate({ step: 'night', state: lastState, readError: stateError, guardrail });
  if (!opening.go) {
    if (opening.alert || !lastState?.approved_guardrail_hash) {
      await alert('Skyddsräckespaketet väntar på godkännande', `Hash på origin/main: ${guardrail}. ${opening.reason}`).catch(() => {});
      try {
        await client.alert({ content: `🔐 Godkänn skyddsräckespaketet \`${guardrail.slice(0, 12)}…\` för förbättringsmotorn?`, components: harnessControlComponents({ guardrailHash: guardrail, brake: lastState?.brake }) });
      } catch { /* larmet ovan räcker */ }
    }
    await liveness(`nattfasen stoppad: ${opening.reason}`);
    await log(`stopp: ${opening.reason}`);
    process.exit(0);
  }

  const policy = readJson(path.join(engine.trusted, 'harness', 'policy.json'), null);
  if (!policy) throw new Error('policy.json saknas i den betrodda utcheckningen');
  const staticInventory = readJson(path.join(repoRoot, 'config', 'v2', 'inventory.static.json'), {});
  const nightFile = path.join(engine.state, 'harness-night.json');
  const nightState = readJson(nightFile, {});
  const night = { night: nightKey(), candidates: nightState.night === nightKey() ? Number(nightState.candidates) || 0 : 0 };

  const rows = await client.cards();
  const lessonIndex = new Map();
  let candidates = pendingHarnessCards(rows);
  if (option('card')) candidates = candidates.filter(({ card }) => card.card_id === option('card'));
  const rolledBack = rows.filter((row) => row.rolled_back_at).map((row) => row.rolled_back_at);
  if (breakerTripped(rolledBack, policy.breaker)) {
    await client.write({ 'breaker:skill_text': 'on' }).catch(() => {});
    await alert('Brytaren skill_text aktiverad', `${policy.breaker.reverts} återställningar inom ${policy.breaker.days} dagar. AUTO stoppas tills Jonas återaktiverar klassen.`);
    process.exit(0);
  }
  const ctx = {
    policy, guardrail, claude, env, night,
    workflowNames: (staticInventory.workflows || []).map((w) => w.name).filter(Boolean),
    inventoryPath: (skill) => (existsSync(path.join(engine.trusted, 'plugins', 'gk-karna', 'skills', skill, 'SKILL.md')) ? `plugins/gk-karna/skills/${skill}/SKILL.md` : null),
    lessonLines: (card) => (card.observations || []).map((observation) => observation.value).concat(lessonIndex.get(card.mistake_ref) || [])
  };
  const results = [];
  const room = Math.max(0, (policy.max_candidates_per_night || 2) - night.candidates);
  await log(`${candidates.length} harness-kort i kö, plats för ${room} kandidat(er) i natt`);
  for (const candidate of candidates.slice(0, room)) {
    try {
      results.push(await processCard(candidate, ctx));
    } catch (error) {
      await log(`kort ${candidate.card.card_id}: ${error.message}`);
      results.push({ card: candidate.card.card_id, outcome: 'avbrutet', reason: error.message });
      if (!dryRun) await client.cardUpdate(candidate.card.card_id, { fail_reason: String(error.message).slice(0, 300) }).catch(() => {});
      if (error.stop || ['quota', 'limit_or_unknown'].includes(error.cause)) break;
    }
    await writeFile(nightFile, JSON.stringify(night));
  }
  await writeFile(path.join(engine.state, 'last-night.json'), JSON.stringify({ at: new Date().toISOString(), dryRun, results }, null, 2));
  await liveness(`nattfas klar: ${results.length} kort (${results.map((r) => r.outcome).join(', ') || 'inga'})`);
} catch (error) {
  exitCode = 1;
  await log(`FEL: ${error.stack || error.message}`);
  if (client) await liveness(`nattfasen avbröts: ${error.message}`);
}
process.exit(exitCode);
