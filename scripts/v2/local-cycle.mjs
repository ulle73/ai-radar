// En lokal cykel: heartbeat --mode private, sedan domaren. Körs av den schemalagda aktiviteten
// "AI Radar v2 – lokal cykel" (scripts/v2/install-local-schedule.ps1) varje timme (harness-designen C0: livstecknet larmar efter 3 timmar).
// Loggar till ~/.ai-radar/logs/cycle-YYYY-MM-DD.log och tar bort loggar äldre än 14 dagar.

import { spawn } from 'node:child_process';
import { appendFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSecrets, postSigned } from '../lib/v2/n8n-client.mjs';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const logDir = path.join(os.homedir(), '.ai-radar', 'logs');
const KEEP_DAYS = 14;

await mkdir(logDir, { recursive: true });
const logFile = path.join(logDir, `cycle-${new Date().toISOString().slice(0, 10)}.log`);
const log = (line) => appendFile(logFile, `${new Date().toISOString()} ${line}\n`);

function runStep(name, script, args) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.execPath, [path.join(repoRoot, script), ...args], { cwd: repoRoot, windowsHide: true });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.on('close', async (code) => {
      const lines = output.split(/\r?\n/).filter((line) => line && !/DEP0190|trace-deprecation/.test(line));
      for (const line of lines) await log(`[${name}] ${line}`);
      await log(`[${name}] klar med kod ${code} på ${Math.round((Date.now() - started) / 1000)} s`);
      resolve(code);
    });
  });
}

async function pruneLogs() {
  const cutoff = Date.now() - KEEP_DAYS * 86400000;
  for (const name of await readdir(logDir)) {
    const file = path.join(logDir, name);
    if (name.startsWith('cycle-') && (await stat(file)).mtimeMs < cutoff) await rm(file, { force: true });
  }
}

await log('cykel startar');
const heartbeat = await runStep('heartbeat', 'scripts/v2/heartbeat.mjs', ['--mode', 'private', '--runner', 'local-schedule']);
// Domaren körs även om heartbeat misslyckades: kön kan ha observationer från Actions-körningen.
const judge = await runStep('judge', 'scripts/v2/judge.mjs', []);
// Måtten (C10): förra veckans ögonblicksbild skickas en gång, första cykeln efter måndag 00:00 UTC.
await runStep('metrics', 'scripts/v2/metrics.mjs', ['snapshot', '--send', '--learner', '--if-missing']);
await pruneLogs();
// Livstecken för förbättringsmotorn (harness C0): n8n larmar om liveness_at är äldre än 3 timmar.
try {
  const response = await postSigned({ ...loadSecrets(), path: 'r2-harness-state', payload: { action: 'write', updates: { liveness_at: new Date().toISOString() } }, timeoutMs: 30000 });
  if (!response.body?.ok) await log(`[liveness] svarade ${response.status}: ${response.body?.error || ''}`);
} catch (error) {
  await log(`[liveness] ${String(error?.message || error).slice(0, 200)}`);
}
await log(`cykel klar (heartbeat ${heartbeat}, judge ${judge})`);
process.exitCode = heartbeat || judge ? 1 : 0;
