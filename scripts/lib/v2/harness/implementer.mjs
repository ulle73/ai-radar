// C4 Utförare (harness-designen). En arbetsyta per kort: git worktree i ~/gk-engine/work/<kort> på grenen
// radar/<kort> från origin/main i motorklonen. Utföraren är `claude -p` med motorns konfiguration, bara
// Read och Edit, hooken guard-paths (onFailure: block) och deny-regler, högst 30 turer och 15 minuter.
// Utföraren får bara strukturerade fält och ett utdrag som har passerat innehållsspärren.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { git, runGit } from './git.mjs';
import { contentGate } from './policy.mjs';
import { claudeArgs, runClaudeProcess, parseClaudeResult, classifyClaudeFailure } from '../judge/claude.mjs';

export const GUARD_SCRIPT = fileURLToPath(new URL('../../../v2/hooks/guard-paths.mjs', import.meta.url));
export const MAX_EXCERPT = 600;
export const DENY_PATHS = Object.freeze([
  '~/.ai-radar/**', '~/gk-engine/config/**', '~/gk-engine/secrets/**', '~/.ssh/**', '~/.claude/**', '~/.codex/**'
]);

// Utdraget ur lärdomsraderna: högst 600 tecken, och bara om innehållsspärren inte slår till (CUJ 6).
export function buildExcerpt(lines, { workflowNames = [] } = {}) {
  const text = lines.map((line) => `- ${String(line).replace(/\s+/g, ' ').trim()}`).join('\n').slice(0, MAX_EXCERPT);
  const findings = contentGate(text, { workflowNames });
  return { text, findings, ok: findings.length === 0 };
}

export function fillPrompt(template, fields) {
  const body = String(template).split(/^---\s*$/m).slice(-1)[0].trim();
  return body.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in fields ? String(fields[key]) : match));
}

// Inställningarna för utförarens körning: hook (exit 2, onFailure: block), deny-regler och motorns grundinställningar.
export function implementerSettings({ baseSettings = {}, targetFile, nodePath = process.execPath, guardScript = GUARD_SCRIPT }) {
  const hookCommand = `"${nodePath}" "${guardScript}" --target "${targetFile}"`;
  return {
    ...baseSettings,
    disableClaudeAiConnectors: true,
    disableSkillShellExecution: true,
    permissions: {
      allow: [`Read(${toRule(targetFile)})`, `Edit(${toRule(targetFile)})`],
      deny: DENY_PATHS.flatMap((p) => [`Read(${p})`, `Edit(${p})`, `Write(${p})`]),
      defaultMode: 'dontAsk'
    },
    hooks: {
      PreToolUse: [{ matcher: '*', hooks: [{ type: 'command', command: hookCommand, timeout: 20, onFailure: 'block' }] }]
    }
  };
}

function toRule(file) {
  // Absoluta sökvägar i behörighetsregler skrivs //c/... (Claude Code, permissions).
  const posix = path.resolve(file).replace(/\\/g, '/');
  return posix.replace(/^([A-Za-z]):/, (_, drive) => `//${drive.toLowerCase()}`);
}

// Ögonblicksbild av arbetsytan (alla filer utom målfilen, inklusive .git-filen) före och efter utföraren.
export async function snapshot(dir, exclude = []) {
  const skip = new Set(exclude.map((file) => path.resolve(file)));
  const hash = createHash('sha256');
  async function walk(current) {
    const entries = (await readdir(current, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (skip.has(path.resolve(full))) continue;
      hash.update(`${path.relative(dir, full)}|${entry.isDirectory() ? 'd' : entry.isSymbolicLink() ? 'l' : 'f'}\n`);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) hash.update(await readFile(full));
    }
  }
  await walk(dir);
  return hash.digest('hex');
}

// Skapar arbetsytan från origin/main. Om grenen redan finns tas den bort och skapas på nytt.
export async function prepareWorkspace({ clone, workRoot, cardId, runGitImpl = runGit }) {
  const dir = path.join(workRoot, cardId);
  const branch = `radar/${cardId}`;
  const repo = { gitDir: path.join(clone, '.git') };
  await git(repo, ['fetch', '--quiet', 'origin']);
  await runGitImpl(repo, ['worktree', 'remove', '--force', dir]);
  if (existsSync(dir)) await rm(dir, { recursive: true, force: true });
  await runGitImpl(repo, ['worktree', 'prune']);
  await runGitImpl(repo, ['branch', '-D', branch]);
  await mkdir(workRoot, { recursive: true });
  await git(repo, ['worktree', 'add', '--quiet', '-B', branch, dir, 'origin/main']);
  const base = await git(repo, ['rev-parse', 'origin/main']);
  const gitDir = path.join(clone, '.git', 'worktrees', cardId);
  return { dir, branch, base, gitDir, location: { gitDir, workTree: dir } };
}

export async function removeWorkspace({ clone, dir, branch }) {
  const repo = { gitDir: path.join(clone, '.git') };
  await runGit(repo, ['worktree', 'remove', '--force', dir]);
  if (existsSync(dir)) await rm(dir, { recursive: true, force: true });
  await runGit(repo, ['worktree', 'prune']);
  if (branch) await runGit(repo, ['branch', '-D', branch]);
}

// Kör utföraren. Returnerar { ok, summary, before } eller kastar med cause vid gränsfel.
export async function runImplementer({
  workspace, card, targetRel, excerpt, template, claude, env, baseSettings, tmpDir,
  maxTurns = 30, timeoutMs = 15 * 60000, run = runClaudeProcess
}) {
  const targetFile = realpathSync.native(path.join(workspace.dir, ...targetRel.split('/')));
  const before = await snapshot(workspace.dir, [targetFile]);
  const prompt = fillPrompt(template, {
    target_file: targetRel, target: card.target.ref, mistake_ref: card.mistake_ref, card_id: card.card_id, excerpt
  });
  await mkdir(tmpDir, { recursive: true });
  const settingsFile = path.join(tmpDir, `implementer-${card.card_id}.settings.json`);
  await writeFile(settingsFile, JSON.stringify(implementerSettings({ baseSettings, targetFile }), null, 2));
  try {
    const args = claudeArgs({ settingsFile, tools: 'Read,Edit', maxTurns });
    const { code, stdout, stderr } = await run(claude, args, prompt, { timeoutMs, env, cwd: workspace.dir });
    const result = parseClaudeResult(stdout);
    if (code !== 0 || !result || result.is_error) {
      const failure = classifyClaudeFailure({ code, stdout, stderr });
      throw Object.assign(new Error(`utföraren: ${failure.message}`), failure.cause ? { cause: failure.cause } : {});
    }
    return { ok: true, summary: String(result.result || '').slice(0, 300), before, targetFile };
  } finally {
    await rm(settingsFile, { force: true });
  }
}

export function readTemplate(trustedDir) {
  return readFileSync(path.join(trustedDir, 'harness', 'implementer-prompt.md'), 'utf8');
}
