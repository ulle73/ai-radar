import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkRequest } from '../scripts/v2/hooks/guard-paths.mjs';

const HOOK = fileURLToPath(new URL('../scripts/v2/hooks/guard-paths.mjs', import.meta.url));

function workspace() {
  const dir = realpathSync.native(mkdtempSync(path.join(os.tmpdir(), 'r2-guard-')));
  const skillDir = path.join(dir, 'plugins', 'gk-karna', 'skills', 'gk-arbetssatt');
  mkdirSync(skillDir, { recursive: true });
  const target = path.join(skillDir, 'SKILL.md');
  writeFileSync(target, '# regler\n');
  writeFileSync(path.join(skillDir, 'annan.md'), 'x');
  mkdirSync(path.join(dir, '.git'));
  writeFileSync(path.join(dir, '.git', 'config'), '[core]');
  return { dir, target, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

function runHook(target, stdin, env = {}) {
  const result = spawnSync(process.execPath, [HOOK, '--target', target], { input: stdin, encoding: 'utf8', env: { ...process.env, ...env } });
  return result.status;
}

const request = (tool, file, cwd) => JSON.stringify({ tool_name: tool, tool_input: { file_path: file }, cwd });

test('målfilen tillåts för Read och Edit (exit 0)', () => {
  const { dir, target, cleanup } = workspace();
  try {
    assert.equal(runHook(target, request('Read', target, dir)), 0);
    assert.equal(runHook(target, request('Edit', target, dir)), 0);
    assert.equal(runHook(target, request('Edit', 'plugins/gk-karna/skills/gk-arbetssatt/SKILL.md', dir)), 0);
  } finally {
    cleanup();
  }
});

test('nekas med exit 2: andra verktyg, annan fil, ny fil, punktsegment och ..', () => {
  const { dir, target, cleanup } = workspace();
  try {
    const skillDir = path.dirname(target);
    for (const [tool, file] of [
      ['Write', target],
      ['Bash', target],
      ['Read', path.join(skillDir, 'annan.md')],
      ['Edit', path.join(skillDir, 'ny.md')],
      ['Read', path.join(dir, '.git', 'config')],
      ['Read', path.join(dir, '.claude', 'settings.json')],
      ['Read', path.join(dir, '.mcp.json')],
      ['Read', `${skillDir}${path.sep}..${path.sep}gk-arbetssatt${path.sep}SKILL.md`],
      ['Read', `${skillDir}${path.sep}.${path.sep}SKILL.md`]
    ]) {
      assert.equal(runHook(target, request(tool, file, dir)), 2, `${tool} ${file}`);
    }
  } finally {
    cleanup();
  }
});

test('nekas: skiftläge, 8.3-namn, UNC, \\\\?\\ och alternativa dataströmmar', () => {
  const { dir, target, cleanup } = workspace();
  try {
    assert.equal(runHook(target, request('Read', target.replace('SKILL.md', 'skill.md'), dir)), 2);
    assert.equal(runHook(target, request('Read', target.replace('gk-karna', 'GK-KARNA'), dir)), 2);
    assert.equal(runHook(target, request('Read', 'C:\\PROGRA~1\\x\\SKILL.md', dir)), 2);
    assert.equal(runHook(target, request('Read', '\\\\server\\share\\SKILL.md', dir)), 2);
    assert.equal(runHook(target, request('Read', `\\\\?\\${target}`, dir)), 2);
    assert.equal(runHook(target, request('Edit', `${target}:dold`, dir)), 2);
    assert.equal(runHook(target, request('Edit', `${target}::$DATA`, dir)), 2);
  } finally {
    cleanup();
  }
});

test('nekas: symlänk eller junction till målfilen', (t) => {
  const { dir, target, cleanup } = workspace();
  try {
    const junction = path.join(dir, 'genvag');
    symlinkSync(path.dirname(target), junction, 'junction');
    assert.equal(runHook(target, request('Read', path.join(junction, 'SKILL.md'), dir)), 2);
    const fileLink = path.join(path.dirname(target), 'lank.md');
    try {
      symlinkSync(target, fileLink, 'file');
    } catch {
      t.diagnostic('fil-symlänkar kräver utvecklarläge; junction-fallet täcker länkar');
      return;
    }
    assert.equal(runHook(target, request('Read', fileLink, dir)), 2);
  } finally {
    cleanup();
  }
});

test('nekas: ogiltig JSON, tom indata, saknat mål och krasch', () => {
  const { dir, target, cleanup } = workspace();
  try {
    assert.equal(runHook(target, 'inte json'), 2);
    assert.equal(runHook(target, ''), 2);
    assert.equal(runHook('', request('Read', target, dir)), 2);
    assert.equal(runHook(target, JSON.stringify({ tool_name: 'Read', tool_input: {} })), 2);
    assert.equal(runHook(target, request('Read', target, dir), { GK_GUARD_TEST_CRASH: '1' }), 2);
    assert.equal(checkRequest(null, target), 'ogiltig indata');
  } finally {
    cleanup();
  }
});
