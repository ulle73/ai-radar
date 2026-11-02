// C5 Verifiering (harness-designen). Körs bara efter en godkänd C3b.
//
// Nivå 1: python -I ~/gk-engine/trusted/hub/hub.py check --root <arbetsyta> --json (betrodd utcheckning).
// Nivå 2: kandidatens plugins/gk-karna kopieras till en ny tom temporär mapp; fallen läggs dit från den
// betrodda utcheckningen; nästa version skrivs i kopians plugin.json och i gk-probes markör; .mcp.json med
// servern notion-test (bara läsverktyg, test-integrationen) läggs till. Sedan körs claude plugin eval per fall
// med motorns konfiguration. Binära fall: alla 3 körningar godkända. Poängfall: medel >= baslinje - tolerans.
// En skill utan täckande eval ger "behöver eval-fall" och publiceras inte.

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const NOTION_TOOLS = Object.freeze([
  'mcp__plugin_gk-karna_notion-test__notion_test_search',
  'mcp__plugin_gk-karna_notion-test__notion_test_read'
]);
export const NOTION_SERVER = fileURLToPath(new URL('../../../v2/notion-test-mcp.mjs', import.meta.url));
const PROBE_MARKER = /^(Svara exakt: gk-probe version: )[^\r\n]*/m;

const readJson = (file, fallback) => {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return fallback; }
};

export function casesFor(coverage, skills) {
  const always = coverage['*'] || [];
  const missing = skills.filter((skill) => !Array.isArray(coverage[skill]) || !coverage[skill].length);
  const cases = [...new Set([...always, ...skills.flatMap((skill) => coverage[skill] || [])])];
  return { cases, missing };
}

export function nextVersion(version) {
  const [major, minor, patch] = [...String(version || '1.0.0').match(/\d+/g) || [], 0, 0, 0].slice(0, 3).map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

export const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function launcherScript({ nodePath, serverScript, secretFile, logFile }) {
  const q = (value) => `'${String(value).replace(/'/g, "''")}'`;
  return [
    '# Genererad av ai-radar verifier.mjs: startar notion-test-mcp med token dekrypterad i minnet (DPAPI).',
    '# Absoluta sökvägar, eftersom eval-miljön sätter USERPROFILE till en temporär hemkatalog (V2).',
    `$log = ${q(logFile)}`,
    'try {',
    `  $sec = Get-Content -LiteralPath ${q(secretFile)} | ConvertTo-SecureString`,
    '  $env:NOTION_TEST_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))',
    '  Add-Content $log ("{0} start ok" -f (Get-Date -Format s))',
    '} catch {',
    '  Add-Content $log ("{0} fel: {1}" -f (Get-Date -Format s), $_.Exception.Message)',
    '}',
    `& ${q(nodePath)} ${q(serverScript)}`,
    ''
  ].join('\r\n');
}

// Bygger den temporära pluginkopian med fallen. Returnerar sökvägen; anroparen tar bort den.
export async function prepareEvalCopy({ workspaceDir, trustedDir, tmpRoot, version, cases, secretFile, logFile, nodePath = process.execPath }) {
  const dir = await mkdtemp(path.join(tmpRoot, 'eval-'));
  await cp(path.join(workspaceDir, 'plugins', 'gk-karna'), dir, { recursive: true });
  const manifest = path.join(dir, '.claude-plugin', 'plugin.json');
  const data = JSON.parse(await readFile(manifest, 'utf8'));
  data.version = version;
  await writeFile(manifest, `${JSON.stringify(data, null, 2)}\n`);
  const probe = path.join(dir, 'skills', 'gk-probe', 'SKILL.md');
  if (existsSync(probe)) await writeFile(probe, (await readFile(probe, 'utf8')).replace(PROBE_MARKER, `$1${version}`));
  for (const name of cases) {
    const source = path.join(trustedDir, 'evals', 'gk-karna', name);
    if (!existsSync(source)) throw new Error(`eval-fallet ${name} saknas i den betrodda utcheckningen`);
    const target = path.join(dir, 'evals', name);
    await cp(source, target, { recursive: true });
    for (const file of await readdir(path.join(target, 'graders')).catch(() => [])) {
      const graderFile = path.join(target, 'graders', file);
      const text = await readFile(graderFile, 'utf8');
      if (text.includes('{{EXPECTED_VERSION}}')) await writeFile(graderFile, text.replaceAll('{{EXPECTED_VERSION}}', escapeRegex(version).replace(/\\/g, '\\\\')));
    }
  }
  const launcher = path.join(dir, 'notion-test-launch.ps1');
  await writeFile(launcher, launcherScript({ nodePath, serverScript: NOTION_SERVER, secretFile, logFile }));
  await writeFile(path.join(dir, '.mcp.json'), `${JSON.stringify({
    mcpServers: { 'notion-test': { command: 'powershell.exe', args: ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', launcher] } }
  }, null, 2)}\n`);
  return dir;
}

export function evalArgs(dir, caseName, runs = 3) {
  return ['plugin', 'eval', dir, '--case', caseName, '--runs', String(runs), '--ablation', 'none', '--no-publish', '--json',
    '--mocks', 'off', '--trust-plugin', '--allow-tools', ...NOTION_TOOLS];
}

export function level1Args(trustedDir, workspaceDir) {
  return ['-I', path.join(trustedDir, 'hub', 'hub.py'), 'check', '--root', workspaceDir, '--json'];
}

// Bedömer ett fall mot baslinjen. Poängen per fall är medel över körningarna (claude plugin eval, --json).
export function judgeCase(report, caseName, baseline = {}) {
  const item = (report?.cases || []).find((entry) => entry.name === caseName) || (report?.cases || [])[0];
  if (!item) return { pass: false, score: null, reason: `inget resultat för ${caseName}` };
  const runs = item.arms?.with || [];
  const errored = runs.find((run) => run?.error || run?.aborted);
  if (errored) return { pass: false, score: null, reason: `körningsfel: ${String(errored.error || errored.aborted?.reason || 'avbruten').slice(0, 120)}` };
  const score = Number(item.aggregates?.score);
  if (!Number.isFinite(score)) return { pass: false, score: null, reason: 'poäng saknas' };
  if ((baseline.type || 'binary') === 'binary') {
    return { pass: score >= 1, score, reason: score >= 1 ? 'alla körningar godkända' : `poäng ${score} < 1 (binärt fall)` };
  }
  const tolerance = Math.max(0.05, 2 * (Number(baseline.sd) || 0));
  const floor = (Number(baseline.mean) || 0) - tolerance;
  return { pass: score >= floor, score, reason: `poäng ${score.toFixed(2)} mot golv ${floor.toFixed(2)}` };
}

export function runProcess(command, args, { env, cwd, timeoutMs = 40 * 60000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error(`${path.basename(command)} tog längre tid än ${Math.round(timeoutMs / 60000)} min`)); }, timeoutMs);
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-8000); });
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
  });
}

function parseJsonOutput(text) {
  const raw = String(text || '').trim();
  try { return JSON.parse(raw); } catch { /* sök sista JSON-objektet */ }
  const start = raw.indexOf('{');
  try { return start >= 0 ? JSON.parse(raw.slice(start)) : null; } catch { return null; }
}

export async function runLevel1({ python = 'python', trustedDir, workspaceDir, run = runProcess }) {
  const { code, stdout } = await run(python, level1Args(trustedDir, workspaceDir), { timeoutMs: 10 * 60000 });
  const report = parseJsonOutput(stdout);
  if (code === 2 || !report) return { ok: false, tool_error: true, reason: `nivå 1 kunde inte köras (kod ${code})`, report };
  const failed = (report.results || []).filter((rule) => !rule.ok).map((rule) => `${rule.rule}: ${(rule.problems || [])[0] || ''}`);
  return { ok: code === 0 && report.ok === true, reason: failed.join('; ').slice(0, 300) || 'nivå 1 godkänd', report };
}

// Hela C5. Returnerar { status: 'verified' | 'needs_eval' | 'failed', reason, level1, evals }.
export async function verifyCandidate({
  workspaceDir, trustedDir, tmpRoot, changedSkills, claude, env, secretFile, logFile, python = 'python', run = runProcess
}) {
  const coverage = readJson(path.join(trustedDir, 'evals', 'gk-karna', 'coverage.json'), null);
  const baselines = readJson(path.join(trustedDir, 'evals', 'gk-karna', 'baselines.json'), {});
  if (!coverage) return { status: 'failed', reason: 'täckningskartan saknas i den betrodda utcheckningen' };
  const { cases, missing } = casesFor(coverage, changedSkills);
  if (missing.length) return { status: 'needs_eval', reason: `behöver eval-fall: ${missing.join(', ')}` };

  const level1 = await runLevel1({ python, trustedDir, workspaceDir, run });
  if (!level1.ok) return { status: 'failed', reason: `nivå 1: ${level1.reason}`, level1 };

  const published = readJson(path.join(trustedDir, 'plugins', 'gk-karna', '.claude-plugin', 'plugin.json'), {}).version;
  const version = nextVersion(published);
  const dir = await prepareEvalCopy({ workspaceDir, trustedDir, tmpRoot, version, cases, secretFile, logFile });
  const evals = [];
  try {
    for (const caseName of cases) {
      const { stdout, stderr } = await run(claude.command, evalArgs(dir, caseName), { env, cwd: dir, timeoutMs: 20 * 60000 });
      const report = parseJsonOutput(stdout);
      if (!report) {
        evals.push({ case: caseName, pass: false, reason: `ingen JSON från claude plugin eval: ${String(stderr).trim().slice(-160)}` });
        break;
      }
      const verdict = judgeCase(report, caseName, baselines[caseName]);
      evals.push({ case: caseName, ...verdict, cost_usd: report.costUsd ?? null });
      if (!verdict.pass) break;
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  const failed = evals.find((entry) => !entry.pass);
  if (failed) return { status: 'failed', reason: `eval ${failed.case}: ${failed.reason}`, level1, evals, version };
  return { status: 'verified', reason: `nivå 1 och ${evals.length} eval-fall gröna`, level1, evals, version };
}
