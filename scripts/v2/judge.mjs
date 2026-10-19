// Lokal domare: hämtar nya observationer från n8n, bedömer högst N jobb med Codex och skickar tillbaka kort.
//
//   node scripts/v2/judge.mjs [--max 4] [--dry-run]
//
// --dry-run bedömer men skickar inget till n8n, och skriver korten till ~/.ai-radar/last-judge-run.json.
// Ett låsfil hindrar att två körningar överlappar.

import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHubInventory, mergeInventory } from '../lib/v2/inventory.mjs';
import { loadSecrets, postSigned } from '../lib/v2/n8n-client.mjs';
import { selectForBrief } from '../lib/v2/gates.mjs';
import { groupObservations } from '../lib/v2/judge/grouping.mjs';
import { judgeJob, toQueueResult } from '../lib/v2/judge/judge.mjs';
import { assertChatGptLogin, defaultModel, resolveCodex, runCodexJson, runWithFallback } from '../lib/v2/judge/codex.mjs';

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--') ? process.argv[index + 1] : fallback;
}

const repoRoot = new URL('../../', import.meta.url);
const config = JSON.parse(await readFile(new URL('config/v2/judge.json', repoRoot), 'utf8'));
const dryRun = process.argv.includes('--dry-run');
const maxJobs = Number(argument('max', config.max_jobs_per_run));
const stateDir = path.join(os.homedir(), '.ai-radar');
const lockFile = path.join(stateDir, 'judge.lock');

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

try {
  const secrets = loadSecrets();
  const staticFile = new URL('config/v2/inventory.static.json', repoRoot);
  const staticPart = existsSync(staticFile) ? JSON.parse(await readFile(staticFile, 'utf8')) : {};
  const inventory = mergeInventory(await buildHubInventory(path.join(os.homedir(), '.agents')), staticPart);
  const catalog = JSON.parse(await readFile(new URL('projects/catalog.json', repoRoot), 'utf8'));

  const queue = await postSigned({ ...secrets, path: 'r2-judge', payload: { action: 'list_new', limit: config.queue_limit }, timeoutMs: 60000 });
  if (queue.status !== 200 || !queue.body?.ok) throw new Error(`kön svarade ${queue.status}: ${queue.body?.error || 'okänt fel'}`);
  const { observations, decisions, budget } = queue.body;

  const jobs = groupObservations(observations, { maxObservationsPerJob: config.max_observations_per_job }).slice(0, maxJobs);
  console.log(`kö: ${observations.length} nya observationer, ${jobs.length} jobb i denna körning`);

  const codex = resolveCodex(config.codex_paths);
  if (config.require_chatgpt_login !== false) await assertChatGptLogin(codex);
  const model = config.model || defaultModel();
  const models = [model, ...(config.fallback_models || [])].filter(Boolean);
  const usedModels = new Set();
  const runModel = async (kind, prompt) => {
    const { model: used, answer } = await runWithFallback(models, (candidate) => runCodexJson({
      prompt,
      schemaPath: fileURLToPath(new URL(kind === 'judge' ? 'schemas/judge-output.v1.schema.json' : 'schemas/skeptic-output.v1.schema.json', repoRoot)),
      codex,
      model: candidate,
      effort: kind === 'judge' ? config.judge_reasoning_effort : config.skeptic_reasoning_effort,
      timeoutMs: config.timeout_seconds * 1000
    }));
    usedModels.add(used);
    return answer;
  };

  const results = [];
  for (const job of jobs) {
    const started = Date.now();
    const result = await judgeJob({ job, inventory, catalog, decisions, budget, runModel, maxObservationChars: config.max_observation_chars });
    results.push(result);
    const gates = result.evaluation ? (result.evaluation.publishable ? (result.evaluation.unverified ? 'publicerbart, overifierat' : 'publicerbart') : 'stoppat av grindarna') : '';
    console.log(`- ${result.status} ${job.detector} (${Math.round((Date.now() - started) / 1000)} s)${result.card ? ` ${result.card.type}: ${gates}` : ''}`);
  }

  const evaluations = results.filter((result) => result.evaluation).map((result) => result.evaluation);
  const { brief, held } = selectForBrief(evaluations);
  console.log(`skuggläge: ${brief.length} kort skulle ha gått till morgonbrevet, ${held.length} hålls`);

  await writeFile(path.join(stateDir, 'last-judge-run.json'), JSON.stringify({ at: new Date().toISOString(), models: [...usedModels], results }, null, 2));
  const toSend = results.filter((result) => result.status !== 'RETRY');
  const retry = results.length - toSend.length;
  if (retry) console.log(`${retry} jobb fick tillfälligt fel och provas igen nästa körning`);
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
} finally {
  await rm(lockFile, { force: true });
}
