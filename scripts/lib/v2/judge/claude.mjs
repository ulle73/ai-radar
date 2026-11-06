// Kör Claude Code headless (`claude -p`) för motorn: domare och skeptiker (inga verktyg), utförare
// (bara Read/Edit) och självtest. Samma kontrakt som runCodexJson. Designen "Självförbättrande hubb",
// princip 5 och C2/C4; verifierat i V1, V9, V10, V13 och V17 (2026-11-01).
//
// - Egen konfiguration: CLAUDE_CONFIG_DIR=~/gk-engine/config/claude, inloggning med CLAUDE_CODE_OAUTH_TOKEN
//   (setup-token, krypterad med DPAPI). Inga hooks, plugins, anslutningar eller CLAUDE.md från Jonas.
// - --restricted --strict-mcp-config --disallowedTools "mcp__*"; inställningar (hook, deny-regler,
//   disableClaudeAiConnectors, disableSkillShellExecution) levereras som fil med --settings
//   (PowerShell tar bort citattecken i JSON-argument, V9).
// - Alla flaggor byggs av claudeArgs(), som även självtestet använder.

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { judgeEnv } from './codex.mjs';

export function enginePaths(home = os.homedir()) {
  const root = path.join(home, 'gk-engine');
  return {
    root,
    configDir: path.join(root, 'config', 'claude'),
    runSettings: path.join(root, 'config', 'run-settings.json'),
    secrets: path.join(root, 'secrets'),
    oauthToken: path.join(root, 'secrets', 'claude-oauth.dpapi'),
    notionTestToken: path.join(root, 'secrets', 'notion-test.dpapi'),
    clone: path.join(root, 'gk-agents'),
    trusted: path.join(root, 'trusted'),
    work: path.join(root, 'work'),
    state: path.join(root, 'state'),
    logs: path.join(root, 'logs'),
    tmp: path.join(root, 'tmp')
  };
}

function expandEnv(value, env = process.env) {
  return value.replace(/%([^%]+)%/g, (_, name) => env[name] || '');
}

// claude.cmd i PATH är ett skalskript; den riktiga binären ligger i node_modules. Utan skal undviker vi
// citatproblemen i cmd.exe för JSON-argument.
export function resolveClaude(paths = [], env = process.env) {
  for (const candidate of paths.map((value) => expandEnv(value, env))) {
    if (candidate && existsSync(candidate)) return { command: candidate, shell: false };
  }
  for (const dir of String(env.PATH || env.Path || '').split(path.delimiter).filter(Boolean)) {
    for (const candidate of [
      path.join(dir, 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe'),
      path.join(dir, 'claude.exe')
    ]) {
      if (existsSync(candidate)) return { command: candidate, shell: false };
    }
  }
  return { command: 'claude', shell: process.platform === 'win32' };
}

// Den enda platsen där motorns Claude-flaggor byggs (princip 5). tools '' = inga verktyg.
export function claudeArgs({ settingsFile, tools = '', schema = null, model = null, maxTurns = null, outputFormat = 'json' } = {}) {
  if (!settingsFile) throw new Error('claudeArgs: settingsFile krävs');
  const args = [
    '-p',
    '--restricted',
    '--strict-mcp-config',
    '--tools', tools,
    '--disallowedTools', 'mcp__*',
    '--settings', settingsFile,
    '--output-format', outputFormat,
    '--no-session-persistence'
  ];
  if (schema) args.push('--json-schema', typeof schema === 'string' ? schema : JSON.stringify(schema));
  if (model) args.push('--model', model);
  if (maxTurns) args.push('--max-turns', String(maxTurns));
  return args;
}

// Läser en hemlighet som är krypterad med Windows DPAPI (ConvertFrom-SecureString). Bara i minnet.
export function readDpapiSecret(file, run = execFileSync) {
  if (!existsSync(file)) throw new Error(`hemlighet saknas: ${path.basename(file)}`);
  const script = "$ErrorActionPreference='Stop'; $s = Get-Content -LiteralPath $env:GK_SECRET_FILE | ConvertTo-SecureString; "
    + '[Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))';
  const out = run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    env: { ...process.env, GK_SECRET_FILE: file }, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
  });
  const secret = String(out).trim();
  if (!secret) throw new Error(`hemligheten ${path.basename(file)} gick inte att läsa`);
  return secret;
}

// Miljön för motorns Claude-körningar: inga debiteringsvariabler (V13), egen konfiguration, setup-token.
export function engineEnv({ token, configDir = enginePaths().configDir, env = process.env } = {}) {
  const clean = judgeEnv(env);
  delete clean.CLAUDE_CODE_OAUTH_TOKEN;
  clean.CLAUDE_CONFIG_DIR = configDir;
  if (token) clean.CLAUDE_CODE_OAUTH_TOKEN = token;
  return clean;
}

// V1: observerad text "You've hit your session limit · resets 9:40pm (Europe/Stockholm)" (HTTP 429).
const LIMIT = /hit your (?:session |usage |weekly |daily |)?limit|usage limit|rate[_ ]?limit|\b429\b|resets \d{1,2}(?::\d{2})?\s?(?:am|pm)/i;

export function parseClaudeResult(stdout) {
  const text = String(stdout || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const last = text.split(/\r?\n/).filter(Boolean).pop();
    try { return JSON.parse(last); } catch { return null; }
  }
}

// Klassar ett misslyckat anrop. cause 'quota' eller 'limit_or_unknown' stoppar nattfasen till nästa natt.
export function classifyClaudeFailure({ code, stdout = '', stderr = '' }) {
  const result = parseClaudeResult(stdout);
  const message = String(result?.result || result?.error || '') + ' ' + String(stderr || '');
  if (LIMIT.test(message) || result?.api_error_status === 429) {
    return { cause: 'quota', message: `claude: användningsgräns (${message.trim().slice(0, 160)})` };
  }
  if (!result) {
    return { cause: 'limit_or_unknown', message: `claude avslutades med kod ${code} utan tolkbart svar: ${message.trim().slice(0, 200)}` };
  }
  return { cause: null, message: `claude svarade med fel: ${message.trim().slice(0, 240)}` };
}

export function runClaudeProcess({ command, shell, prefixArgs = [] }, args, input, { timeoutMs = 420000, env, cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...prefixArgs, ...args], { shell, cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], env });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(Object.assign(new Error(`claude tog längre tid än ${Math.round(timeoutMs / 1000)} s`), { transient: true }));
    }, timeoutMs);
    child.stdout.on('data', (chunk) => { stdout = (stdout + chunk).slice(-2_000_000); });
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-4000); });
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
    child.stdin.end(input ?? '');
  });
}

// Avbryter om motorns Claude inte är inloggad med setup-token på abonnemanget (då kunde anropen faktureras via API).
export async function assertClaudeSubscription(claude, { env, run = runClaudeProcess } = {}) {
  const { stdout, stderr } = await run(claude, ['auth', 'status'], '', { timeoutMs: 60000, env });
  const output = `${stdout}\n${stderr}`;
  const method = output.match(/"?authMethod"?\s*[:=]\s*"?([A-Za-z_]+)/)?.[1] || '';
  if (/api[_ ]?key/i.test(method) || !/oauth_token|claude\.ai|subscription/i.test(method || output)) {
    throw new Error(`motorns Claude är inte inloggad med setup-token på abonnemanget (authMethod "${method || 'okänt'}"); körs inte för att undvika API-kostnader`);
  }
  return method;
}

export async function runClaudeJson({ prompt, schemaPath, claude, model, settingsFile, env, timeoutMs = 420000, run = runClaudeProcess }) {
  const workDir = await mkdtemp(path.join(os.tmpdir(), 'ai-radar-claude-'));
  try {
    const schema = readFileSync(schemaPath, 'utf8');
    const args = claudeArgs({ settingsFile, tools: '', schema: JSON.stringify(JSON.parse(schema)), model });
    const { code, stdout, stderr } = await run(claude, args, prompt, { timeoutMs, env, cwd: workDir });
    const result = parseClaudeResult(stdout);
    if (code !== 0 || !result || result.is_error) {
      const failure = classifyClaudeFailure({ code, stdout, stderr });
      throw Object.assign(new Error(failure.message), failure.cause ? { cause: failure.cause } : {});
    }
    if (result.structured_output && typeof result.structured_output === 'object') return result.structured_output;
    const text = String(result.result || '').trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('claude gav inget JSON-svar enligt schemat');
    }
  } finally {
    await rm(workDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 }).catch(() => {});
  }
}
