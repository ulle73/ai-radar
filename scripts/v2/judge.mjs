// Lokal domare: hämtar nya observationer från n8n, bedömer högst N jobb och skickar tillbaka kort.
//
//   node scripts/v2/judge.mjs [--max 4] [--dry-run] [--ignore-window]
//
// Modellbackends provas i ordningen i config/v2/judge.json → backends (Claude med motorns setup-token,
// sedan Codex). En backend som inte är inloggad hoppas över; efter ett kvotfel vilar den quota_retry_hours.
// Domaren körs bara i nattfönstret (C0) och högst max_jobs_per_night jobb per natt. --ignore-window är
// för manuella prov. --dry-run bedömer men skickar inget till n8n och skriver korten till
// ~/.ai-radar/last-judge-run.json. Ett låsfil hindrar att två körningar överlappar.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHubInventory, mergeInventory } from '../lib/v2/inventory.mjs';
import { loadSecrets, postSigned } from '../lib/v2/n8n-client.mjs';
import { selectForBrief } from '../lib/v2/gates.mjs';
import { groupObservations, splitMeasurements } from '../lib/v2/judge/grouping.mjs';
import { isQuotaError, judgeJob, toQueueResult } from '../lib/v2/judge/judge.mjs';
import { assertChatGptLogin, defaultModel, resolveCodex, runCodexJson, runWithFallback } from '../lib/v2/judge/codex.mjs';
import { assertClaudeSubscription, enginePaths, engineEnv, readDpapiSecret, resolveClaude, runClaudeJson } from '../lib/v2/judge/claude.mjs';
import { availableBackends, clearQuota, inNightWindow, jobsAllowed, markQuota, nightKey, recordJobs } from '../lib/v2/judge/backends.mjs';

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--') ? process.argv[index + 1] : fallback;
}

const repoRoot = new URL('../../', import.meta.url);
const config = JSON.parse(await readFile(new URL('config/v2/judge.json', repoRoot), 'utf8'));
const dryRun = process.argv.includes('--dry-run');
const ignoreWindow = process.argv.includes('--ignore-window');
const maxJobs = Number(argument('max', config.max_jobs_per_run));
const stateDir = path.join(os.homedir(), '.ai-radar');
const lockFile = path.join(stateDir, 'judge.lock');
const stateFile = path.join(stateDir, 'judge-state.json');
const engine = enginePaths();
const hubDir = path.join(os.homedir(), '.agents');

const readJson = (file, fallback) => {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return fallback; }
};

if (!ignoreWindow && !inNightWindow(new Date(), config.night_window)) {
  console.log(`utanför nattfönstret ${config.night_window.start}–${config.night_window.end}; domaren körs inte`);
  process.exit(0);
}

await mkdir(stateDir, { recursive: true });
function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

if (existsSync(lockFile)) {
  const lock = JSON.parse(readFileSync(lockFile, 'utf8'));
  const ageMinutes = (Date.now() - lock.started) / 60000;
  // Ett lås från en körning som avbröts (processen finns inte längre) eller som är äldre än en timme räknas inte.
  if (ageMinutes < 60 && processAlive(lock.pid)) {
    console.log(`en domarkörning pågår redan (startad för ${Math.round(ageMinutes)} min sedan)`);
    process.exit(0);
  }
}
await writeFile(lockFile, JSON.stringify({ started: Date.now(), pid: process.pid }));

// Blob-sha för en fil på origin/main (motorns klon om den finns, annars hubben), skrivskyddat.
function blobSha(relPath) {
  const repo = existsSync(path.join(engine.clone, '.git')) ? engine.clone : hubDir;
  try {
    return execFileSync('git', ['-C', repo, 'rev-parse', `origin/main:${relPath}`], { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function harnessBudget() {
  const policy = readJson(path.join(engine.trusted, 'harness', 'policy.json'), null) || readJson(path.join(hubDir, 'harness', 'policy.json'), {});
  const night = readJson(path.join(engine.state, 'harness-night.json'), {});
  return {
    candidates_tonight: night.night === nightKey() ? Number(night.candidates) || 0 : 0,
    max_candidates_per_night: Number(policy.max_candidates_per_night) || 0
  };
}

// Bygger körare per backend. En backend som inte är inloggad hoppas över (C2).
async function prepareBackends(names) {
  const runners = [];
  for (const name of names) {
    try {
      if (name === 'claude') {
        const env = engineEnv({ token: readDpapiSecret(engine.oauthToken), configDir: engine.configDir });
        const claude = resolveClaude(config.claude_paths || []);
        await assertClaudeSubscription(claude, { env });
        runners.push({
          name,
          label: `claude:${config.claude_model || 'default'}`,
          run: (kind, prompt, schemaPath) => runClaudeJson({
            prompt, schemaPath, claude, env, model: config.claude_model, settingsFile: engine.runSettings, timeoutMs: config.timeout_seconds * 1000
          })
        });
      } else if (name === 'codex') {
        const codex = resolveCodex(config.codex_paths);
        if (config.require_chatgpt_login !== false) await assertChatGptLogin(codex);
        const models = [config.model || defaultModel(), ...(config.fallback_models || [])].filter(Boolean);
        runners.push({
          name,
          label: `codex:${models[0] || 'default'}`,
          run: async (kind, prompt, schemaPath) => (await runWithFallback(models, (candidate) => runCodexJson({
            prompt, schemaPath, codex, model: candidate,
            effort: kind === 'judge' ? config.judge_reasoning_effort : config.skeptic_reasoning_effort,
            timeoutMs: config.timeout_seconds * 1000
          }))).answer
        });
      } else {
        console.log(`okänd backend ${name} hoppas över`);
      }
    } catch (error) {
      console.log(`backend ${name} hoppas över: ${String(error?.message || error).slice(0, 200)}`);
    }
  }
  return runners;
}

// Historik för hälsodetektorn (C1.4): domarens lyckade körningar de senaste 24 timmarna. Sju dagar sparas.
const runRecord = { at: new Date().toISOString(), ok: false, jobs: 0, judged: 0, failed: 0 };

try {
  let state = readJson(stateFile, {});
  const budgetNight = jobsAllowed({ state, maxPerRun: maxJobs, maxPerNight: config.max_jobs_per_night });
  if (!budgetNight.allowed) {
    console.log(`nattens tak är nått (${budgetNight.used} av ${config.max_jobs_per_night} jobb)`);
    process.exitCode = 0;
  } else {
    const secrets = loadSecrets();
    const staticFile = new URL('config/v2/inventory.static.json', repoRoot);
    const staticPart = existsSync(staticFile) ? JSON.parse(await readFile(staticFile, 'utf8')) : {};
    const inventory = mergeInventory(await buildHubInventory(hubDir), staticPart);
    const catalog = JSON.parse(await readFile(new URL('projects/catalog.json', repoRoot), 'utf8'));

    const queue = await postSigned({ ...secrets, path: 'r2-judge', payload: { action: 'list_new', limit: config.queue_limit }, timeoutMs: 60000 });
    if (queue.status !== 200 || !queue.body?.ok) throw new Error(`kön svarade ${queue.status}: ${queue.body?.error || 'okänt fel'}`);
    const { observations, decisions, budget } = queue.body;

    // Mätdata (transkript, veckomått, kvitton) markeras DIGEST utan modellanrop; probsvar lämnas åt probes.mjs.
    const { measurements, judgeable } = splitMeasurements(observations);
    if (measurements.length && !dryRun) {
      const marked = await postSigned({
        ...secrets,
        path: 'r2-judge',
        payload: { action: 'complete', results: [{ observation_ids: measurements.map((item) => item.observation_id).slice(0, 500), status: 'DIGEST', reason: 'mätdata (harness C10), bedöms inte av domaren', card: null }] },
        timeoutMs: 60000
      });
      console.log(`mätdata: ${measurements.length} observationer markerade DIGEST (${marked.status})`);
    }
    const jobs = groupObservations(judgeable, { maxObservationsPerJob: config.max_observations_per_job }).slice(0, budgetNight.allowed);
    console.log(`kö: ${observations.length} nya observationer, ${jobs.length} jobb i denna körning (${budgetNight.used} tidigare i natt)`);
    const blobs = Object.fromEntries(inventory.skills.filter((skill) => skill.path).map((skill) => [skill.name, blobSha(skill.path)]));
    for (const job of jobs.filter((item) => item.harness)) job.harness.blob_shas = blobs;
    const fullBudget = { ...(budget || {}), harness: harnessBudget() };

    let runners = jobs.length ? await prepareBackends(availableBackends({ order: config.backends, state, quotaRetryHours: config.quota_retry_hours })) : [];
    if (jobs.length && !runners.length) throw Object.assign(new Error('ingen modellbackend är inloggad eller tillgänglig'), { cause: 'quota' });
    const usedModels = new Set();
    const schemaPath = (kind) => fileURLToPath(new URL(kind === 'judge' ? 'schemas/judge-output.v1.schema.json' : 'schemas/skeptic-output.v1.schema.json', repoRoot));
    const runModel = async (kind, prompt) => {
      let lastError;
      while (runners.length) {
        const runner = runners[0];
        try {
          const answer = await runner.run(kind, prompt, schemaPath(kind));
          usedModels.add(runner.label);
          state = clearQuota(state, runner.name);
          return answer;
        } catch (error) {
          lastError = error;
          if (!isQuotaError(error)) throw error;
          // Kvot- eller gränsfel: backenden vilar och nästa i ordningen tar över.
          console.log(`backend ${runner.name}: ${error.cause} – vilar ${config.quota_retry_hours} h`);
          state = markQuota(state, runner.name, new Date(), error.message);
          runners = runners.slice(1);
        }
      }
      throw lastError || Object.assign(new Error('ingen backend kvar'), { cause: 'quota' });
    };

    const results = [];
    for (const job of jobs) {
      const started = Date.now();
      const result = await judgeJob({ job, inventory, catalog, decisions, budget: fullBudget, runModel, maxObservationChars: config.max_observation_chars });
      results.push(result);
      const gates = result.evaluation ? (result.evaluation.publishable ? (result.evaluation.unverified ? 'publicerbart, overifierat' : 'publicerbart') : 'stoppat av grindarna') : '';
      console.log(`- ${result.status} ${job.detector} (${Math.round((Date.now() - started) / 1000)} s)${result.card ? ` ${result.card.type}: ${gates}` : ''}${result.status === 'FAILED' ? ` – ${result.reason}` : ''}`);
      if (result.cause && !runners.length) {
        console.log('alla backends har nått sin gräns; domaren stannar till nästa natt');
        break;
      }
    }

    runRecord.jobs = results.length;
    runRecord.judged = results.filter((result) => result.status === 'JUDGED').length;
    runRecord.failed = results.filter((result) => result.status === 'FAILED').length;
    state = recordJobs(state, { night: budgetNight.night, count: results.filter((result) => result.status !== 'RETRY').length });
    await writeFile(stateFile, JSON.stringify(state, null, 2));

    const evaluations = results.filter((result) => result.evaluation).map((result) => result.evaluation);
    const { brief, held } = selectForBrief(evaluations);
    console.log(`skuggläge: ${brief.length} kort skulle ha gått till morgonbrevet, ${held.length} hålls`);

    await writeFile(path.join(stateDir, 'last-judge-run.json'), JSON.stringify({ at: new Date().toISOString(), models: [...usedModels], results }, null, 2));
    const toSend = results.filter((result) => result.status !== 'RETRY');
    const retry = results.length - toSend.length;
    if (retry) console.log(`${retry} jobb fick tillfälligt fel eller kvotfel och provas igen nästa körning`);
    if (!dryRun && toSend.length) {
      const sent = await postSigned({
        ...secrets,
        path: 'r2-judge',
        payload: { action: 'complete', results: toSend.map((result) => toQueueResult(result, [...usedModels].join('+'))) },
        timeoutMs: 60000
      });
      if (sent.status >= 300 || !sent.body?.ok) throw new Error(`complete svarade ${sent.status}: ${sent.body?.error || 'okänt fel'}`);
      console.log(`skickat: ${sent.body.results} resultat`);
    } else if (dryRun) {
      console.log(`dry-run: inget skickat, se ${path.join(stateDir, 'last-judge-run.json')}`);
    }
  }
  runRecord.ok = true;
} finally {
  await rm(lockFile, { force: true });
  const historyFile = path.join(stateDir, 'judge-history.json');
  const cutoff = Date.now() - 7 * 86400000;
  const history = readJson(historyFile, []).filter((run) => Date.parse(run.at) >= cutoff);
  await writeFile(historyFile, JSON.stringify([...history, runRecord], null, 1)).catch(() => {});
}
