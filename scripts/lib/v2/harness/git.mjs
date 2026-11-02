// git för motorn (harness-designen C4). Alla anrop görs med explicit --git-dir/--work-tree, utan fsmonitor
// och utan hookar, så att planterade filer i en arbetsyta (.git, hooks, fsmonitor) aldrig körs.

import { execFile } from 'node:child_process';
import os from 'node:os';

const NULL_HOOKS = process.platform === 'win32' ? 'NUL' : '/dev/null';
const BOT = Object.freeze(['-c', 'user.name=gk-motor', '-c', 'user.email=gk-motor@golfkuponger.se']);

export function gitArgs({ gitDir = null, workTree = null, cwd = null } = {}, args = []) {
  const base = ['-c', 'core.fsmonitor=false', '-c', `core.hooksPath=${NULL_HOOKS}`, '-c', 'core.autocrlf=false'];
  if (gitDir) base.push('--git-dir', gitDir);
  if (workTree) base.push('--work-tree', workTree);
  if (!gitDir && cwd) base.push('-C', cwd);
  return [...base, ...args];
}

export function runGit(location, args, { timeoutMs = 120000, run = execFile } = {}) {
  return new Promise((resolve) => {
    run('git', gitArgs(location, args), { encoding: 'utf8', windowsHide: true, timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } },
      (error, stdout, stderr) => resolve({ code: error ? (typeof error.code === 'number' ? error.code : 1) : 0, stdout: String(stdout || ''), stderr: String(stderr || '') }));
  });
}

export async function git(location, args, options) {
  const result = await runGit(location, args, options);
  if (result.code !== 0) throw new Error(`git ${args[0]} misslyckades: ${(result.stderr || result.stdout).trim().split('\n')[0].slice(0, 200)}`);
  return result.stdout.trim();
}

export { BOT };
export const HOME = os.homedir();
