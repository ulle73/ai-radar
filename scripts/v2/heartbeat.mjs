// Kör detektorerna och skickar observationerna till n8n (R2 – Observation Ingest).
//
//   node scripts/v2/heartbeat.mjs --mode public  [--dry-run]   # GitHub Actions
//   node scripts/v2/heartbeat.mjs --mode private [--dry-run]   # Jonas dator
//
// Repot är publikt och Actions-loggar syns för alla. Därför skrivs bara antal och källstatus ut,
// aldrig observationernas innehåll.

import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { collectObservations } from '../lib/v2/heartbeat.mjs';
import { fetchDataFeed, loadSecrets, sendObservations } from '../lib/v2/n8n-client.mjs';

// Fasta kommandon från config/v2/sources.json och gh; inga argument kommer utifrån.
const run = promisify(exec);

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--') ? process.argv[index + 1] : fallback;
}

const mode = argument('mode', 'public');
const dryRun = process.argv.includes('--dry-run');
const runner = argument('runner', process.env.GITHUB_ACTIONS ? 'actions' : 'local');
const sources = JSON.parse(await readFile(new URL('../../config/v2/sources.json', import.meta.url), 'utf8'));
async function localGhToken() {
  try {
    const { stdout } = await run('gh auth token', { timeout: 10000 });
    return stdout.trim();
  } catch {
    return '';
  }
}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || (mode === 'public' ? '' : await localGhToken());

async function fetchJson(url) {
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'ai-radar-v2' };
  if (token && url.startsWith('https://api.github.com/')) headers.authorization = `Bearer ${token}`;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'ai-radar-v2' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function readInstalled(tool) {
  const { stdout } = await run(tool.command, { timeout: 20000 });
  return stdout.trim();
}

const secrets = dryRun && mode === 'public' ? null : loadSecrets();
const { observations, stats } = await collectObservations({
  mode,
  sources,
  fetchJson,
  fetchText,
  dataFeed: mode === 'public' ? null : () => fetchDataFeed({ runner, secrets }),
  readInstalled: mode === 'public' ? null : readInstalled,
  now: new Date()
});

const failed = stats.filter((item) => !item.ok);
const byDetector = {};
for (const observation of observations) byDetector[observation.detector] = (byDetector[observation.detector] || 0) + 1;
console.log(`heartbeat ${mode}: ${stats.length - failed.length}/${stats.length} källor ok, ${observations.length} observationer ${JSON.stringify(byDetector)}`);
for (const item of failed) console.log(`  källa misslyckades: ${item.source} – ${item.error}`);

if (dryRun) {
  console.log('dry-run: inget skickat');
} else if (observations.length) {
  const result = await sendObservations({ observations, runner, secrets });
  console.log(`ingest: mottagna ${result.received}, giltiga ${result.valid}, ogiltiga ${result.invalid}`);
  if (result.invalid > 0) process.exitCode = 1;
} else {
  console.log('inga observationer att skicka');
}

if (stats.length && failed.length === stats.length) process.exitCode = 1;
