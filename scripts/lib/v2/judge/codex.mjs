// Kör Codex headless som domare eller skeptiker.
// - --ignore-user-config: domaren får inte Jonas MCP-servrar eller andra verktyg (prompt injection-skydd).
// - --sandbox read-only, -C <tom arbetsmapp>, --ephemeral: ingen skrivning, inget nätverk, inga sparade sessioner.
// - --output-schema: svaret måste följa schemat; det valideras igen här.

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

function expandEnv(value) {
  return value.replace(/%([^%]+)%/g, (_, name) => process.env[name] || '');
}

export { DISABLED_FEATURES };

export function resolveCodex(paths = []) {
  for (const candidate of paths.map(expandEnv)) {
    if (candidate && existsSync(candidate)) return { command: candidate, shell: false };
  }
  return { command: 'codex', shell: process.platform === 'win32' };
}

// Modellen läses från Jonas Codex-konfiguration, eftersom --ignore-user-config annars tappar den.
export function defaultModel(configFile = path.join(os.homedir(), '.codex', 'config.toml')) {
  if (!existsSync(configFile)) return null;
  const match = readFileSync(configFile, 'utf8').match(/^model\s*=\s*"([^"]+)"/m);
  return match ? match[1] : null;
}

// Funktioner som är påslagna även med --ignore-user-config men som domaren inte behöver.
// Flera (apps, browser_use, computer_use) körs inte genom sandlådan. Utan shell_tool kan domaren
// bara läsa prompten och svara. Verifierat mot codex-cli 0.146.1 (codex features list) 2026-10-19.
const DISABLED_FEATURES = Object.freeze([
  'apps', 'browser_use', 'browser_use_external', 'browser_use_full_cdp_access', 'computer_use',
  'image_generation', 'in_app_browser', 'hooks', 'memories', 'multi_agent', 'plugins', 'remote_plugin',
  'plugin_sharing', 'skill_mcp_dependency_install', 'skill_search', 'tool_suggest', 'goals',
  'code_mode_host', 'shell_tool', 'shell_snapshot', 'workspace_dependencies', 'tool_call_mcp_elicitation'
]);

const TRANSIENT = /at capacity|rate limit|429|502|503|504|overloaded|temporarily|ECONNRESET|ETIMEDOUT|tog längre tid/i;

export function isTransient(error) {
  return Boolean(error?.transient) || TRANSIENT.test(String(error?.message || error));
}

export function codexArgs({ workDir, schemaFile, outFile, model, effort }) {
  const args = [
    'exec',
    '--ignore-user-config',
    ...DISABLED_FEATURES.flatMap((feature) => ['--disable', feature]),
    '--skip-git-repo-check',
    '--ephemeral',
    '--sandbox', 'read-only',
    '--color', 'never',
    '-C', workDir,
    '--output-schema', schemaFile,
    '-o', outFile,
    '-c', 'windows.sandbox="elevated"',
    '-c', 'approval_policy="never"'
  ];
  if (model) args.push('-m', model);
  if (effort) args.push('-c', `model_reasoning_effort="${effort}"`);
  args.push('-');
  return args;
}

// Domaren får aldrig fakturera per anrop: API-nycklar tas bort ur miljön, så att Codex bara kan
// använda inloggningen med ChatGPT-kontot (planens kvot). Se också assertChatGptLogin.
const BILLABLE_KEYS = Object.freeze(['OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENROUTER_API_KEY', 'AZURE_OPENAI_API_KEY', 'ANTHROPIC_API_KEY']);

export function judgeEnv(env = process.env) {
  const clean = { ...env };
  for (const key of BILLABLE_KEYS) delete clean[key];
  return clean;
}

export function runProcess({ command, shell }, args, input, timeoutMs, env = judgeEnv()) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], env });
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(Object.assign(new Error(`codex tog längre tid än ${Math.round(timeoutMs / 1000)} s`), { transient: true }));
    }, timeoutMs);
    child.stdout.on('data', () => {});
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-4000); });
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) return resolve();
      const errorLines = stderr.split('\n').filter((row) => /^ERROR/.test(row));
      const summary = (errorLines.length ? errorLines : stderr.split('\n').filter(Boolean)).slice(-2).join(' | ');
      reject(Object.assign(new Error(`codex avslutades med kod ${code}: ${summary.slice(0, 400)}`), { transient: TRANSIENT.test(stderr) }));
    });
    child.stdin.end(input);
  });
}

// Avbryter om Codex inte är inloggat med ChatGPT-kontot (då skulle anropen kunna faktureras via API).
export async function assertChatGptLogin(codex, run = runStatus) {
  const output = await run(codex);
  if (!/ChatGPT/i.test(output) || /API key/i.test(output)) {
    throw new Error(`Codex är inte inloggat med ChatGPT-kontot ("${output.trim().slice(0, 80)}"); domaren körs inte för att undvika API-kostnader`);
  }
}

function runStatus({ command, shell }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, ['login', 'status'], { shell, windowsHide: true, env: judgeEnv() });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.on('error', reject);
    child.on('close', () => resolve(output));
  });
}

// Provar modellerna i ordning; går bara vidare till nästa vid tillfälliga fel (t.ex. "at capacity").
export async function runWithFallback(models, attempt) {
  let lastError;
  for (const model of models) {
    try {
      return { model, answer: await attempt(model) };
    } catch (error) {
      lastError = error;
      if (!isTransient(error)) throw error;
    }
  }
  throw lastError;
}

export async function runCodexJson({ prompt, schemaPath, codex, model, effort, timeoutMs = 420000, contextFiles = {} }) {
  const workDir = await mkdtemp(path.join(os.tmpdir(), 'ai-radar-judge-'));
  try {
    for (const [name, content] of Object.entries(contextFiles)) {
      await writeFile(path.join(workDir, name), content);
    }
    const outFile = path.join(workDir, 'answer.json');
    await runProcess(codex, codexArgs({ workDir, schemaFile: schemaPath, outFile, model, effort }), prompt, timeoutMs);
    const raw = await readFile(outFile, 'utf8');
    return JSON.parse(raw);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
