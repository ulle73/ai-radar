import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { codexJsFromCmd, resolveCodex } from '../scripts/lib/v2/judge/codex.mjs';

const CMD = 'C:\\Users\\x\\AppData\\Local\\pnpm\\bin\\codex.cmd';
const CMD_TEXT = '@SETLOCAL\r\n  node  "%~dp0\\..\\global\\v11\\abc\\node_modules\\@openai\\codex\\bin\\codex.js" %*\r\n)';

test('codexJsFromCmd hittar codex.js i en pnpm-.cmd', () => {
  const js = codexJsFromCmd(CMD, () => CMD_TEXT);
  assert.equal(js, path.resolve(path.dirname(CMD), '..\\global\\v11\\abc\\node_modules\\@openai\\codex\\bin\\codex.js'));
  assert.equal(codexJsFromCmd(CMD, () => 'echo inget här'), null);
  assert.equal(codexJsFromCmd(CMD, () => { throw new Error('saknas'); }), null);
});

test('resolveCodex kör en .cmd via node utan skal och hoppar över saknade sökvägar', () => {
  const missing = resolveCodex(['C:\\finns-inte\\codex.exe'], () => false);
  assert.equal(missing.command, 'codex');
  const exe = resolveCodex(['C:\\app\\codex.exe'], () => true);
  assert.deepEqual(exe, { command: 'C:\\app\\codex.exe', shell: false });
  // En .cmd vars codex.js inte kan läsas hoppas över till nästa kandidat.
  const fallback = resolveCodex(['C:\\x\\codex.cmd', 'C:\\app\\codex.exe'], (p) => !p.endsWith('codex.js'));
  assert.equal(fallback.command, 'C:\\app\\codex.exe');
});
