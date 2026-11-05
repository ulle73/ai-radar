// Mått (harness-designen C10).
//
//   node scripts/v2/metrics.mjs freeze --source ~/gk-baseline/2026-11-01 [--out fil] [--to 2026-11-02]
//   node scripts/v2/metrics.mjs snapshot [--week 2026-W45] [--send] [--learner] [--if-missing]
//
// freeze läser baslinjekopian (claude-projects/ och codex-sessions/) och skriver ett fruset, deterministiskt
// resultat till ~/gk-engine/state/metrics-baseline.json (T13: två körningar ger samma digest och
// unreadable_files = 0). snapshot räknar en hel vecka ur de levande transkripten (~/.claude/projects och
// ~/.codex/sessions), skriver ~/gk-engine/state/metrics/<vecka>.json och skickar med --send måtten som
// observationer (source_kind metric). Bara antal skrivs ut, aldrig innehåll.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildOptions, scanTranscripts } from '../lib/v2/detectors/session-transcripts.mjs';
import { enginePaths } from '../lib/v2/judge/claude.mjs';
import { freezeResult, isoWeek, snapshotObservations, summarize, weekStart } from '../lib/v2/harness/metrics.mjs';
import { loadSecrets, postSigned, sendObservations } from '../lib/v2/n8n-client.mjs';
import { learnerClient, weeklySummary } from '../lib/v2/harness/learner.mjs';

const DAY_MS = 86400000;
const argument = (name, fallback = null) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--') ? process.argv[index + 1] : fallback;
};
const expandHome = (value) => String(value).replace(/^~(?=$|[\\/])/, os.homedir());
const readConfig = async (name) => JSON.parse(await readFile(new URL(`../../config/v2/${name}`, import.meta.url), 'utf8'));

const metricsConfig = await readConfig('metrics.json');
const options = buildOptions({ corrections: await readConfig('correction-patterns.v1.json'), metrics: metricsConfig });
const engine = enginePaths();
const command = process.argv[2];

if (command === 'freeze') {
  const source = path.resolve(expandHome(argument('source', '~/gk-baseline/2026-11-01')));
  // Kopian togs 2026-11-01; fönstret slutar vid nästa midnatt och går baseline_days bakåt (4 hela veckor).
  const stamp = path.basename(source).match(/^\d{4}-\d{2}-\d{2}$/) ? Date.parse(`${path.basename(source)}T00:00:00Z`) + DAY_MS : null;
  const to = new Date(argument('to') ? Date.parse(argument('to')) : stamp ?? weekStart(Date.now()).getTime()).toISOString();
  const from = new Date(Date.parse(to) - metricsConfig.baseline_days * DAY_MS).toISOString();
  const { sessions, stats, unreadable } = await scanTranscripts({
    claudeRoot: path.join(source, 'claude-projects'),
    codexRoot: path.join(source, 'codex-sessions'),
    since: from,
    until: to,
    options
  });
  const result = freezeResult({ source: path.basename(source), from, to, sessions, stats });
  const out = path.resolve(expandHome(argument('out', path.join(engine.state, 'metrics-baseline.json'))));
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`freeze ${result.source}: ${result.window.from.slice(0, 10)}–${result.window.to.slice(0, 10)}, ${stats.files} filer, ${result.total.sessions} sessioner, unreadable_files ${stats.unreadable_files}, bad_lines ${stats.bad_lines}`);
  console.log(`baslinje: ${JSON.stringify(result.baseline)}`);
  console.log(`digest ${result.digest} → ${out}`);
  for (const item of unreadable) console.log(`  oläslig: ${item.file} – ${item.error}`);
  process.exitCode = stats.unreadable_files ? 1 : 0;
} else if (command === 'snapshot') {
  const requested = argument('week');
  let start;
  if (requested) {
    const [year, week] = requested.split('-W').map(Number);
    const jan4 = Date.UTC(year, 0, 4);
    start = weekStart(jan4).getTime() + (week - 1) * 7 * DAY_MS;
  } else {
    start = weekStart(Date.now()).getTime() - 7 * DAY_MS;
  }
  const from = new Date(start).toISOString();
  const to = new Date(start + 7 * DAY_MS).toISOString();
  const week = isoWeek(start);
  const dir = path.join(engine.state, 'metrics');
  // --if-missing: den lokala cykeln anropar snapshot dagligen; veckan räknas och skickas bara en gång.
  if (process.argv.includes('--if-missing')) {
    try { await readFile(path.join(dir, `${week}.json`)); console.log(`snapshot ${week} finns redan`); process.exit(0); } catch { /* räkna */ }
  }
  const { sessions, stats } = await scanTranscripts({
    claudeRoot: path.join(os.homedir(), '.claude', 'projects'),
    codexRoot: path.join(os.homedir(), '.codex', 'sessions'),
    since: from,
    until: to,
    options,
    minMtime: start
  });
  let baseline = null;
  try { baseline = JSON.parse(await readFile(path.join(engine.state, 'metrics-baseline.json'), 'utf8')).baseline; } catch { baseline = null; }
  const summary = summarize(sessions);
  if (process.argv.includes('--send')) {
    const observations = snapshotObservations({ week, summary, baseline });
    const result = await sendObservations({ observations, runner: 'local', secrets: loadSecrets() });
    console.log(`ingest: mottagna ${result.received}, giltiga ${result.valid}, ogiltiga ${result.invalid}`);
  }
  // --learner: veckans rad i Growth Log och nodens aktuella bild (C9), via R2 – Learner med läsning tillbaka.
  if (process.argv.includes('--learner')) {
    const secrets = loadSecrets();
    const cards = await postSigned({ ...secrets, path: 'r2-harness-state', payload: { action: 'cards' }, timeoutMs: 60000 });
    const rows = cards.status === 200 && cards.body?.ok ? cards.body.cards || [] : [];
    const learner = learnerClient((payload) => postSigned({ ...secrets, path: 'r2-learner', payload, timeoutMs: 120000 }));
    const written = await learner.weekly(weeklySummary({ week, summary, baseline, cards: rows, from, to }));
    console.log(`learner: veckan ${week} skriven och läst tillbaka (Growth Log ${written.row ? 'ok' : '–'}, aktuell bild ${written.current ? 'ok' : '–'})`);
  }
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${week}.json`), `${JSON.stringify({ week, from, to, stats, summary, baseline }, null, 2)}\n`);
  console.log(`snapshot ${week}: ${summary.sessions} sessioner, ${summary.autonomous_verified} självständigt verifierade, minne ${summary.memory_usage}, rättelser ${summary.correction_rate}, unreadable_files ${stats.unreadable_files}`);
} else {
  console.log('användning: metrics.mjs freeze --source <mapp> | snapshot [--week ÅÅÅÅ-Wnn] [--send]');
  process.exitCode = 2;
}
