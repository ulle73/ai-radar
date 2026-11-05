// Lokala källor för hälsodetektorn och transkripten (harness C1.1, C1.4). Bara läsning: inget här skriver
// i ~/.agents eller i någon annan konfiguration. Varje funktion kastar vid fel; anroparen isolerar.

import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const DAY_MS = 86400000;
const TOKEN_DAYS = 365;

export const hubDir = (home = os.homedir()) => path.join(home, '.agents');

export async function readJsonFile(file, fallback) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return fallback; }
}

export async function readHubState(home = os.homedir()) {
  return JSON.parse(await readFile(path.join(hubDir(home), 'hub', 'state.json'), 'utf8'));
}

export async function gitAheadBehind(home = os.homedir()) {
  const { stdout } = await run('git', ['-C', hubDir(home), 'rev-list', '--left-right', '--count', 'HEAD...origin/sync'], { windowsHide: true, timeout: 20000 });
  const [ahead, behind] = stdout.trim().split(/\s+/).map(Number);
  return { ahead: ahead || 0, behind: behind || 0 };
}

// codex mcp list tar 15–20 s och kan misslyckas tillfälligt (2026-11-05: ett enstaka fel gav ett falskt larm).
// Två försök med paus innan källan räknas som oläslig; felet får stderr:s första rad i stället för hela kommandot.
export async function codexMcpList(codex, { attempts = 2, pauseMs = 10000, exec = run } = {}) {
  if (!codex) throw new Error('Codex CLI hittades inte');
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const { stdout } = await exec(codex, ['mcp', 'list', '--json'], { windowsHide: true, timeout: 90000, maxBuffer: 8 * 1024 * 1024 });
      return JSON.parse(stdout);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
  }
  const detail = String(lastError?.stderr || '').trim().split(/\r?\n/)[0] || (lastError?.killed ? 'tidsgränsen nåddes' : `kod ${lastError?.code ?? 'okänd'}`);
  throw new Error(`codex mcp list misslyckades två gånger: ${detail}`.slice(0, 200));
}

export function findCodex(env = process.env) {
  const candidates = [path.join(env.LOCALAPPDATA || '', 'Programs', 'OpenAI', 'Codex', 'bin', 'codex.exe')];
  for (const dir of String(env.PATH || '').split(path.delimiter)) {
    candidates.push(path.join(dir, 'codex.exe'), path.join(dir, 'codex.cmd'));
  }
  return candidates.find((file) => file && existsSync(file)) || null;
}

// hub.py check --json (nivå 1) från den betrodda utcheckningen om den finns, annars hubben. Utgångskod 1 är regelfel.
export async function hubCheckJson({ trusted, home = os.homedir(), python = 'python' }) {
  const script = existsSync(path.join(trusted, 'hub', 'hub.py')) ? path.join(trusted, 'hub', 'hub.py') : path.join(hubDir(home), 'hub', 'hub.py');
  try {
    const { stdout } = await run(python, ['-I', script, 'check', '--root', hubDir(home), '--json', '--skip-cli-validate'], { windowsHide: true, timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
    return JSON.parse(stdout);
  } catch (error) {
    if (error?.code === 1 && error.stdout) return JSON.parse(error.stdout);
    throw error;
  }
}

// Motorns setup-token (claude setup-token) gäller ett år. Utgången läses ur claude-oauth.meta.json om den finns,
// annars räknas den från när den krypterade filen skrevs.
export async function engineTokenInfo(engine) {
  if (!existsSync(engine.oauthToken)) return { exists: false };
  const meta = await readJsonFile(path.join(engine.secrets, 'claude-oauth.meta.json'), null);
  if (meta?.expires_at) return { exists: true, expires_at: new Date(meta.expires_at).toISOString(), source: 'meta' };
  const written = (await stat(engine.oauthToken)).mtimeMs;
  return { exists: true, expires_at: new Date(written + TOKEN_DAYS * DAY_MS).toISOString(), source: 'mtime' };
}
