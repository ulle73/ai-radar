// C6 Publicering (harness-designen). Koden – inte modellen – beräknar diffen, kontrollerar arbetsytan,
// committar med trailern Radar-Card och publicerar exakt den commiten via den betrodda hub.py.
//
//   1. Arbetsytan (.git-filen och alla andra filer än målfilen) är oförändrad efter utföraren.
//   2. C3b körs på diffen mot origin/main (anroparen, policy.mjs), även efter varje rebase.
//   3. Commit med "Radar-Card: <id>". Sha läses med git rev-parse HEAD.
//   4. Publicering: fetch; om origin/main har flyttats från kandidatens bas avbryts det och kortet provas
//      från början nästa natt. Annars hub.py publish --card <id> --root <motorklonen> (compare-and-swap).

import path from 'node:path';
import { BOT, git, runGit } from './git.mjs';
import { snapshot } from './implementer.mjs';
import { runProcess } from './verifier.mjs';

export async function checkWorkspaceIntact({ dir, before, targetFile }) {
  const after = await snapshot(dir, [targetFile]);
  return after === before ? { ok: true } : { ok: false, reason: 'arbetsytan har ändrats utanför målfilen (.git eller andra filer)' };
}

// Diffen som C3b bedömer: allt i arbetsytan mot kandidatens bas, inklusive nya filer.
export async function stagedDiff(location, base) {
  await git(location, ['add', '-A']);
  return runGit(location, ['diff', '--cached', '--no-ext-diff', '--no-color', '--full-index', '--binary', '--find-renames', base])
    .then((result) => {
      if (result.code !== 0) throw new Error(`git diff misslyckades: ${result.stderr.trim().slice(0, 200)}`);
      return result.stdout;
    });
}

export function commitMessage(card) {
  const title = String(card.title || 'förtydliga regel').replace(/\s+/g, ' ').slice(0, 72);
  return `harness: ${title}\n\nmistake_ref: ${card.mistake_ref || '-'}\n\nRadar-Card: ${card.card_id}`;
}

export async function commitCandidate(location, card) {
  await git(location, [...BOT, 'commit', '--quiet', '--no-verify', '-m', commitMessage(card)]);
  return git(location, ['rev-parse', 'HEAD']);
}

export async function cardOnMain(clone, cardId, key = 'Radar-Card') {
  const out = await git({ gitDir: path.join(clone, '.git') }, ['log', 'origin/main', '--format=%H', `--grep=^${key}: ${cardId}$`]);
  return out.split(/\s+/).filter(Boolean)[0] || null;
}

function lastJson(text) {
  const lines = String(text || '').trim().split(/\r?\n/).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    try { return JSON.parse(lines[i]); } catch { /* fortsätt */ }
  }
  return null;
}

export async function hubCommand({ python = 'python', trustedDir, args, run = runProcess, timeoutMs = 10 * 60000 }) {
  const { code, stdout, stderr } = await run(python, ['-I', path.join(trustedDir, 'hub', 'hub.py'), ...args], { timeoutMs });
  return { code, result: lastJson(stdout), stderr: String(stderr || '').trim().slice(-300) };
}

export async function publishCard({ clone, cardId, base, branch, trustedDir, python, run }) {
  const repo = { gitDir: path.join(clone, '.git'), workTree: clone };
  await git(repo, ['fetch', '--quiet', 'origin']);
  const already = await cardOnMain(clone, cardId);
  if (!already) {
    const main = await git(repo, ['rev-parse', 'origin/main']);
    if (main !== base) return { ok: false, retry: true, reason: 'origin/main har flyttats från kandidatens bas; provas från början nästa natt' };
    await git(repo, ['checkout', '--quiet', '--detach', branch]);
  }
  const { code, result, stderr } = await hubCommand({ python, trustedDir, args: ['publish', '--card', cardId, '--root', clone], run });
  if (code === 0 && result?.ok) {
    return { ok: true, version: result.versions?.['gk-karna'] || result.version || null, commit: result.commit, head: result.head, already: Boolean(result.already_published) };
  }
  return { ok: false, retry: code === 3, reason: String(result?.error || stderr || `hub.py publish avslutades med kod ${code}`).slice(0, 300) };
}

// Återställning körs även när bromsen är aktiv eller tillståndet inte kan läsas (C0, C6).
export async function rollbackCard({ clone, cardId, trustedDir, python, run }) {
  const { code, result, stderr } = await hubCommand({ python, trustedDir, args: ['rollback', '--card', cardId, '--root', clone], run });
  if (code === 0 && result?.ok) return { ok: true, version: result.versions?.['gk-karna'] || null, already: Boolean(result.already_reverted) };
  return { ok: false, conflict: code === 4 || Boolean(result?.conflict), reason: String(result?.error || stderr || `hub.py rollback avslutades med kod ${code}`).slice(0, 300) };
}

// Efter publicering: hub.py sync i ~/.agents (hubbens eget lås), sedan Claude Codes lokala plugin med Jonas konfiguration.
export async function syncLocal({ python = 'python', agentsDir, claude, env, run = runProcess }) {
  const steps = [];
  const sync = await run(python, [path.join(agentsDir, 'hub', 'hub.py'), 'sync', '--quiet'], { timeoutMs: 5 * 60000 });
  steps.push({ step: 'hub sync', ok: sync.code === 0 });
  if (claude) {
    const market = await run(claude.command, ['plugin', 'marketplace', 'update', 'golfkuponger-agents'], { env, timeoutMs: 5 * 60000 });
    steps.push({ step: 'marketplace update', ok: market.code === 0 });
    const update = await run(claude.command, ['plugin', 'update', 'gk-karna@golfkuponger-agents'], { env, timeoutMs: 5 * 60000 });
    steps.push({ step: 'plugin update', ok: update.code === 0 });
  }
  return { ok: steps.every((step) => step.ok), steps };
}
