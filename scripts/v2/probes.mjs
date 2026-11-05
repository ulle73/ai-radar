// Bedömer probsvaren från alla fyra ytor (harness-designen C7, etapp 2). Körs varje timme i den lokala cykeln.
//
//   node scripts/v2/probes.mjs [--dry-run]
//
// 1. Hämtar obedömda svar från R2 – Probes (list_pending) och kanariekoden från R2 – Harness State.
// 2. Bedömer deterministiskt (detectors/probes.mjs): P1 mot kanariekoden som gällde när frågan ställdes, P2 mot
//    gk-karnas publicerade versioner på origin/main (motorklonen), P3 mot facit i den betrodda utcheckningen.
// 3. Skickar bedömningen (grade), sparar historiken lokalt och skickar underkännanden som observationer:
//    två i rad ger larmet probe_failed direkt till Discord.
// 4. Skriver versionsläget per yta (probe-versions.json, läses av hälsodetektorn), sätter web_verified_at när
//    P2 och P3 godkänts på båda webbytorna efter publiceringen, och skapar en beslutspunkt när P3 underkänns
//    två dagar i rad på en webbyta (T19b; ingen automatisk återställning från webbsvar).

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { enginePaths } from '../lib/v2/judge/claude.mjs';
import { loadSecrets, postSigned, sendObservations } from '../lib/v2/n8n-client.mjs';
import { stateClient } from '../lib/v2/harness/controller.mjs';
import { parseFacitPatterns } from '../lib/v2/harness/monitor.mjs';
import { formatDecisionMessage } from '../lib/v2/discord.mjs';
import { gradeAnswers, probeObservations, probeVersions, recordHistory, webRegression, webVerified } from '../lib/v2/detectors/probes.mjs';

const engine = enginePaths();
const dryRun = process.argv.includes('--dry-run');
const readJson = (file, fallback) => { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return fallback; } };
const PLUGIN = 'plugins/gk-karna/.claude-plugin/plugin.json';

// gk-karnas versioner på origin/main, äldst först (motorklonen; annars hubben).
function publishedVersions() {
  const repo = existsSync(path.join(engine.clone, '.git')) ? engine.clone : path.join(path.dirname(engine.root), '.agents');
  const git = (...argv) => execFileSync('git', ['-C', repo, ...argv], { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  try { git('fetch', '-q', 'origin', 'main'); } catch { /* läser det som finns */ }
  const commits = git('log', '-n', '30', '--format=%H %cI', 'origin/main', '--', PLUGIN).trim().split('\n').filter(Boolean);
  const versions = [];
  for (const line of commits.reverse()) {
    const [sha, at] = line.split(' ');
    try { versions.push({ version: JSON.parse(git('show', `${sha}:${PLUGIN}`)).version, at }); } catch { /* hoppa över */ }
  }
  return versions.filter((item, i) => item.version && item.version !== versions[i - 1]?.version);
}

const secrets = loadSecrets();
const client = stateClient((payload) => postSigned({ ...secrets, path: 'r2-harness-state', payload, timeoutMs: 60000 }));
const pending = await postSigned({ ...secrets, path: 'r2-probes', payload: { action: 'list_pending' }, timeoutMs: 60000 });
if (pending.status !== 200 || !pending.body?.ok) throw new Error(`list_pending svarade ${pending.status}: ${pending.body?.error || ''}`);
const rows = pending.body.answers || [];
if (!rows.length) {
  console.log('inga obedömda probsvar');
  process.exit(0);
}

const canary = await client.read();
const versions = publishedVersions();
const facitPatterns = parseFacitPatterns(readFileSync(path.join(engine.trusted, 'evals', 'gk-karna', 'p3-facit.md'), 'utf8'));
const graded = gradeAnswers(rows, { canary, versions, facitPatterns });
for (const item of graded) console.log(`${item.yta} ${item.probe} ${item.day}: ${item.status} – ${item.reason}`);

const historyFile = path.join(engine.state, 'probe-history.json');
const stored = readJson(historyFile, { verdicts: {}, answers: [], decided: [] });
const verdicts = recordHistory(stored.verdicts, graded);
const cutoff = Date.now() - 30 * 86400000;
const answers = [...(stored.answers || []), ...graded.filter((item) => item.verdict).map(({ yta, probe, day, asked_at: askedAt, verdict, version }) => ({ yta, probe, day, asked_at: askedAt, verdict, version }))]
  .filter((item) => Date.parse(item.asked_at) >= cutoff);
const observations = probeObservations(graded, verdicts);
const versionState = probeVersions(readJson(path.join(engine.state, 'probe-versions.json'), null), graded, versions);

if (dryRun) {
  console.log(`dry-run: ${graded.length} svar bedömda, ${observations.length} underkännanden, inget skickat`);
  process.exit(0);
}

for (let i = 0; i < graded.length; i += 100) {
  const results = graded.slice(i, i + 100).map((item) => ({ observation_id: item.observation_id, status: item.status, reason: item.reason }));
  const sent = await postSigned({ ...secrets, path: 'r2-probes', payload: { action: 'grade', results }, timeoutMs: 60000 });
  if (sent.status !== 200 || !sent.body?.ok) throw new Error(`grade svarade ${sent.status}: ${sent.body?.error || ''}`);
}
if (observations.length) {
  const result = await sendObservations({ observations, runner: 'local', secrets });
  console.log(`underkännanden: ${observations.length} observationer (${observations.filter((o) => o.alert_trigger).length} larm), ingest giltiga ${result.valid}`);
}
await mkdir(engine.state, { recursive: true });
await writeFile(path.join(engine.state, 'probe-versions.json'), JSON.stringify(versionState, null, 2));

// Webbverifiering och regression mot det senast publicerade, inte återställda kortet.
const decided = new Set(stored.decided || []);
const cards = await client.cards().catch(() => []);
const latest = cards.filter((row) => row.published_version && !row.rolled_back_at)
  .sort((a, b) => Date.parse(b.published_at || 0) - Date.parse(a.published_at || 0))[0];
if (latest && !latest.web_verified_at && webVerified(answers, latest.published_at, latest.published_version)) {
  await client.cardUpdate(latest.card_id, { web_verified_at: new Date().toISOString() });
  console.log(`${latest.card_id}: webbverifierad (P2 och P3 godkända på claude.ai och ChatGPT)`);
}
const regressed = webRegression(verdicts);
if (latest && regressed.length && !decided.has(latest.card_id)) {
  let card = {};
  try { card = JSON.parse(latest.card_json || '{}'); } catch { card = { card_id: latest.card_id }; }
  await client.decision(latest.card_id, formatDecisionMessage({ ...card, card_id: latest.card_id }, {
    reason: `P3 underkänd två dagar i rad på ${regressed.join(' och ')} efter publiceringen av ${latest.published_version}. Webbsvar återställs inte automatiskt (C7); OK återställer med hub.py rollback --card.`,
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString()
  }));
  decided.add(latest.card_id);
  console.log(`${latest.card_id}: beslutspunkt skapad (webbregression på ${regressed.join(', ')})`);
}
await writeFile(historyFile, JSON.stringify({ verdicts, answers, decided: [...decided] }, null, 1));
