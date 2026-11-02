import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  NOTION_TOOLS, casesFor, evalArgs, judgeCase, level1Args, nextVersion, prepareEvalCopy, verifyCandidate
} from '../scripts/lib/v2/harness/verifier.mjs';
import { write } from './helpers/harness-repo.mjs';

const COVERAGE = { '*': ['t5-skillversion', 'lardomsformat'], 'gk-arbetssatt': ['t1-notion-fakta', 'lardomsformat'], 'notion-dokumentation': ['t1-notion-fakta'] };

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'r2-verify-'));
  const workspace = path.join(root, 'work');
  const trusted = path.join(root, 'trusted');
  for (const base of [workspace, trusted]) {
    write(base, 'plugins/gk-karna/.claude-plugin/plugin.json', JSON.stringify({ name: 'gk-karna', version: '1.0.3' }));
    write(base, 'plugins/gk-karna/skills/gk-probe/SKILL.md', '---\nname: gk-probe\n---\n\nSvara exakt: gk-probe version: 1.0.3\n');
    write(base, 'plugins/gk-karna/skills/gk-arbetssatt/SKILL.md', '---\nname: gk-arbetssatt\n---\nregler\n');
  }
  write(trusted, 'evals/gk-karna/coverage.json', JSON.stringify(COVERAGE));
  write(trusted, 'evals/gk-karna/baselines.json', JSON.stringify({ 't1-notion-fakta': { type: 'score', mean: 0.9, sd: 0.05 } }));
  for (const name of ['t5-skillversion', 'lardomsformat', 't1-notion-fakta']) {
    write(trusted, `evals/gk-karna/${name}/prompt.md`, '---\nmax_turns: 4\n---\nfråga\n');
    write(trusted, `evals/gk-karna/${name}/graders/g.md`, name === 't5-skillversion' ? '---\ntype: regex\npattern: "gk-probe version: {{EXPECTED_VERSION}}(?![0-9])"\n---\n' : '---\ntype: llm\n---\nPASS\n');
  }
  const tmp = path.join(root, 'tmp');
  write(tmp, '.keep', '');
  return { root, workspace, trusted, tmp, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test('fall som alltid körs plus skillens fall; skill utan täckning ger behöver eval-fall (T24)', () => {
  assert.deepEqual(casesFor(COVERAGE, ['gk-arbetssatt']), { cases: ['t5-skillversion', 'lardomsformat', 't1-notion-fakta'], missing: [] });
  assert.deepEqual(casesFor(COVERAGE, ['grill-me']).missing, ['grill-me']);
  assert.equal(nextVersion('1.0.9'), '1.0.10');
});

test('temporär kopia: nästa version i plugin.json och gk-probe, fall från betrodd utcheckning, notion-test som enda MCP', async () => {
  const f = fixture();
  try {
    const dir = await prepareEvalCopy({ workspaceDir: f.workspace, trustedDir: f.trusted, tmpRoot: f.tmp, version: '1.0.4', cases: ['t5-skillversion', 'lardomsformat'], secretFile: 'C:\\s.dpapi', logFile: 'C:\\l.log' });
    assert.equal(JSON.parse(readFileSync(path.join(dir, '.claude-plugin', 'plugin.json'), 'utf8')).version, '1.0.4');
    assert.match(readFileSync(path.join(dir, 'skills', 'gk-probe', 'SKILL.md'), 'utf8'), /gk-probe version: 1\.0\.4/);
    assert.match(readFileSync(path.join(dir, 'evals', 't5-skillversion', 'graders', 'g.md'), 'utf8'), /gk-probe version: 1\\\\\.0\\\\\.4\(\?!\[0-9\]\)/);
    assert.ok(existsSync(path.join(dir, 'evals', 'lardomsformat', 'prompt.md')));
    assert.ok(!existsSync(path.join(dir, 'evals', 't1-notion-fakta')));
    const mcp = JSON.parse(readFileSync(path.join(dir, '.mcp.json'), 'utf8'));
    assert.deepEqual(Object.keys(mcp.mcpServers), ['notion-test']);
    const launcher = readFileSync(mcp.mcpServers['notion-test'].args.at(-1), 'utf8');
    assert.match(launcher, /C:\\s\.dpapi/);
    assert.ok(path.isAbsolute(mcp.mcpServers['notion-test'].args.at(-1)));
    // Arbetsytans egen version är orörd.
    assert.equal(JSON.parse(readFileSync(path.join(f.workspace, 'plugins', 'gk-karna', '.claude-plugin', 'plugin.json'), 'utf8')).version, '1.0.3');
  } finally {
    f.cleanup();
  }
});

test('flaggor: nivå 1 från betrodd hub.py, evals med --ablation none, --no-publish och exakta verktygsnamn', () => {
  assert.deepEqual(level1Args('C:\\t', 'C:\\w'), ['-I', path.join('C:\\t', 'hub', 'hub.py'), 'check', '--root', 'C:\\w', '--json']);
  const args = evalArgs('C:\\tmp\\eval-1', 'lardomsformat');
  for (const flag of ['--ablation', '--no-publish', '--json', '--mocks', '--trust-plugin', '--allow-tools']) assert.ok(args.includes(flag), flag);
  assert.equal(args[args.indexOf('--runs') + 1], '3');
  assert.deepEqual(args.slice(-2), NOTION_TOOLS);
  assert.ok(!args.some((arg) => arg.includes('*')));
});

test('bedömning: binära fall kräver poäng 1, poängfall jämförs med baslinjen minus tolerans', () => {
  const report = (score) => ({ cases: [{ name: 'c', aggregates: { score }, arms: { with: [{ error: null }, { error: null }, { error: null }] } }] });
  assert.equal(judgeCase(report(1), 'c', { type: 'binary' }).pass, true);
  assert.equal(judgeCase(report(0.67), 'c', { type: 'binary' }).pass, false);
  assert.equal(judgeCase(report(0.85), 'c', { type: 'score', mean: 0.9, sd: 0.01 }).pass, true);
  assert.equal(judgeCase(report(0.7), 'c', { type: 'score', mean: 0.9, sd: 0.05 }).pass, false);
  assert.equal(judgeCase({ cases: [{ name: 'c', aggregates: { score: 1 }, arms: { with: [{ error: 'boom' }] } }] }, 'c').pass, false);
});

test('verifyCandidate: nivå 1 rött stoppar före evals; grönt kör alla fall', async () => {
  const f = fixture();
  try {
    const calls = [];
    const fakeRun = (level1Code) => async (command, args) => {
      calls.push(args);
      if (args[0] === '-I') return { code: level1Code, stdout: JSON.stringify({ ok: level1Code === 0, results: [{ rule: 'CHK-SECRETS', ok: level1Code === 0, problems: level1Code ? ['liknar en hemlighet'] : [] }] }), stderr: '' };
      return { code: 0, stdout: JSON.stringify({ cases: [{ name: args[args.indexOf('--case') + 1], aggregates: { score: 1 }, arms: { with: [{ error: null }] } }], costUsd: 0.1 }), stderr: '' };
    };
    const base = { workspaceDir: f.workspace, trustedDir: f.trusted, tmpRoot: f.tmp, changedSkills: ['gk-arbetssatt'], claude: { command: 'claude' }, env: {}, secretFile: 's', logFile: 'l' };
    const red = await verifyCandidate({ ...base, run: fakeRun(1) });
    assert.equal(red.status, 'failed');
    assert.match(red.reason, /CHK-SECRETS/);
    assert.equal(calls.length, 1);
    calls.length = 0;
    const green = await verifyCandidate({ ...base, run: fakeRun(0) });
    assert.equal(green.status, 'verified', green.reason);
    assert.equal(green.version, '1.0.4');
    assert.deepEqual(calls.slice(1).map((args) => args[args.indexOf('--case') + 1]), ['t5-skillversion', 'lardomsformat', 't1-notion-fakta']);
    const missing = await verifyCandidate({ ...base, changedSkills: ['grill-me'], run: fakeRun(0) });
    assert.equal(missing.status, 'needs_eval');
  } finally {
    f.cleanup();
  }
});
