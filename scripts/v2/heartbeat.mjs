// Kör detektorerna och skickar observationerna till n8n (R2 – Observation Ingest).
//
//   node scripts/v2/heartbeat.mjs --mode public  [--dry-run]   # GitHub Actions
//   node scripts/v2/heartbeat.mjs --mode private [--dry-run]   # Jonas dator
//
// Repot är publikt och Actions-loggar syns för alla. Därför skrivs bara antal och källstatus ut,
// aldrig observationernas innehåll.

import { exec } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { collectObservations } from '../lib/v2/heartbeat.mjs';
import { fetchDataFeed, loadSecrets, sendObservations } from '../lib/v2/n8n-client.mjs';
import { healthChecks, gatherHealthSources } from '../lib/v2/detectors/hub-health.mjs';
import { buildOptions, scanTranscripts } from '../lib/v2/detectors/session-transcripts.mjs';
import { enginePaths } from '../lib/v2/judge/claude.mjs';
import { codexMcpList, engineTokenInfo, findCodex, gitAheadBehind, hubCheckJson, readHubState, readJsonFile } from '../lib/v2/local-sources.mjs';

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
// Utan token svarar GitHub 404 för privata repon, så två försök och en tydlig varning om det ändå saknas.
async function localGhToken() {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const { stdout } = await run('gh auth token', { timeout: 20000, windowsHide: true });
      if (stdout.trim()) return stdout.trim();
    } catch {
      // nytt försök
    }
  }
  return '';
}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || (mode === 'public' ? '' : await localGhToken());
if (!token && mode !== 'public') console.log('varning: ingen GitHub-token (gh auth token misslyckades); privata repon kan inte kontrolleras');

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
  const { stdout } = await run(tool.command, { timeout: 20000, windowsHide: true });
  return stdout.trim();
}

const secrets = dryRun && mode === 'public' ? null : loadSecrets();

// Lärdomsrader läses en gång per dygn (harness C1.2): första privata körningen efter 20 timmar.
const lessonsStamp = path.join(os.homedir(), '.ai-radar', 'lessons-last.json');
let lastLessons = 0;
try { lastLessons = Date.parse(JSON.parse(readFileSync(lessonsStamp, 'utf8')).at) || 0; } catch { lastLessons = 0; }
const wantLessons = mode !== 'public' && (process.argv.includes('--lessons') || Date.now() - lastLessons > 20 * 3600000);
// Hubbens hälsa (C1.4) varje privat körning; sessionstranskript (C1.1) en gång per dygn.
const engine = enginePaths();
async function hubHealth() {
  const { sources, errors } = await gatherHealthSources({
    state: () => readHubState(),
    git: () => gitAheadBehind(),
    codexMcp: () => codexMcpList(findCodex()),
    hubCheck: () => hubCheckJson({ trusted: engine.trusted }),
    // Historiken finns först efter domarens första körning med 1b; utan fil hoppas kontrollen över.
    judgeHistory: () => readJsonFile(path.join(os.homedir(), '.ai-radar', 'judge-history.json'), null),
    token: () => engineTokenInfo(engine),
    probes: () => readJsonFile(path.join(engine.state, 'probe-versions.json'), null)
  });
  return [...healthChecks(sources), ...errors];
}

const transcriptsStamp = path.join(os.homedir(), '.ai-radar', 'transcripts-last.json');
let lastTranscripts = 0;
try { lastTranscripts = Date.parse(JSON.parse(readFileSync(transcriptsStamp, 'utf8')).at) || 0; } catch { lastTranscripts = 0; }
const wantTranscripts = mode !== 'public' && (process.argv.includes('--transcripts') || Date.now() - lastTranscripts > 20 * 3600000);
async function transcripts() {
  const readConfig = async (name) => JSON.parse(await readFile(new URL(`../../config/v2/${name}`, import.meta.url), 'utf8'));
  const options = buildOptions({ corrections: await readConfig('correction-patterns.v1.json'), metrics: await readConfig('metrics.json') });
  const since = new Date(Date.now() - 8 * 86400000);
  const { sessions } = await scanTranscripts({
    claudeRoot: path.join(os.homedir(), '.claude', 'projects'),
    codexRoot: path.join(os.homedir(), '.codex', 'sessions'),
    since: since.toISOString(),
    options,
    minMtime: since.getTime()
  });
  const baseline = (await readJsonFile(path.join(engine.state, 'metrics-baseline.json'), null))?.baseline || null;
  return { sessions, baseline };
}

const { observations, stats } = await collectObservations({
  mode,
  sources,
  fetchJson,
  fetchText,
  dataFeed: mode === 'public' ? null : () => fetchDataFeed({ runner, secrets, lessons: wantLessons }),
  readInstalled: mode === 'public' ? null : readInstalled,
  hubHealth: mode === 'public' || process.argv.includes('--no-health') ? null : hubHealth,
  transcripts: wantTranscripts ? transcripts : null,
  now: new Date()
});

if (wantTranscripts && !dryRun && stats.some((item) => item.source === 'session_transcripts' && item.ok)) {
  await mkdir(path.dirname(transcriptsStamp), { recursive: true });
  await writeFile(transcriptsStamp, JSON.stringify({ at: new Date().toISOString() }));
}

if (wantLessons && !dryRun && stats.some((item) => item.source === 'lessons' && item.ok)) {
  await mkdir(path.dirname(lessonsStamp), { recursive: true });
  await writeFile(lessonsStamp, JSON.stringify({ at: new Date().toISOString() }));
}

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
