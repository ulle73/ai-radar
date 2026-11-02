#!/usr/bin/env node
// PreToolUse-hook för utföraren (harness-designen C4, V10). Tillåter bara Read och Edit på exakt kortets målfil.
// Allt annat nekas med exit 2, även krasch och ogiltig indata. Levereras med --settings och onFailure: block.
//
//   node guard-paths.mjs --target <absolut sökväg till målfilen>
//
// Nekas: andra verktyg, andra filer och nya filer, punktsegment (.git, .claude, .mcp.json) och "..",
// symlänkar och junctions (realpath måste vara exakt målfilen), korta 8.3-namn, skillnader i versaler och
// gemener, UNC- och \\?\-sökvägar, alternativa dataströmmar (NTFS, "fil:ström").

import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWED_TOOLS = Object.freeze(['Read', 'Edit']);

function deny(reason) {
  process.stderr.write(`guard-paths: nekat – ${reason}\n`);
  process.exit(2);
}

export function checkRequest(input, target) {
  if (!target || !path.isAbsolute(target)) return 'målfilen saknas eller är inte absolut';
  if (!input || typeof input !== 'object') return 'ogiltig indata';
  const tool = String(input.tool_name || '');
  if (!ALLOWED_TOOLS.includes(tool)) return `verktyget ${tool || '(okänt)'} är inte tillåtet`;
  const raw = input.tool_input?.file_path;
  if (typeof raw !== 'string' || !raw.trim()) return 'file_path saknas';
  if (/^[\\/]{2}/.test(raw) || raw.startsWith('\\\\?\\') || raw.startsWith('//?/')) return 'UNC- eller \\\\?\\-sökväg';
  const withoutDrive = raw.replace(/^[A-Za-z]:/, '');
  if (withoutDrive.includes(':')) return 'alternativ dataström eller kolon i sökvägen';
  if (/~\d/.test(raw)) return 'kort 8.3-namn';
  if (/[\u0000-\u001f<>"|?*]/.test(withoutDrive)) return 'otillåtna tecken';
  const segments = raw.split(/[\\/]+/).filter(Boolean);
  if (segments.some((segment) => segment.startsWith('.'))) return 'punktsegment eller ..';
  const cwd = typeof input.cwd === 'string' && path.isAbsolute(input.cwd) ? input.cwd : path.dirname(target);
  const resolved = path.resolve(cwd, raw);
  if (resolved !== path.resolve(target)) return 'annan fil än kortets målfil';
  let stat;
  try {
    stat = lstatSync(resolved);
  } catch {
    return 'filen finns inte (nya filer är inte tillåtna)';
  }
  if (stat.isSymbolicLink()) return 'symlänk';
  if (!stat.isFile()) return 'inte en vanlig fil';
  // realpath.native ger den riktiga stavningen och följer junctions i överordnade mappar.
  if (realpathSync.native(resolved) !== path.resolve(target)) return 'sökvägen går via en länk, ett kortnamn eller annan skiftläge';
  return null;
}

function main() {
  if (process.env.GK_GUARD_TEST_CRASH === '1') throw new Error('testkrasch');
  const index = process.argv.indexOf('--target');
  const target = index >= 0 ? process.argv[index + 1] : '';
  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    deny('ogiltig JSON');
  }
  const reason = checkRequest(input, target);
  if (reason) deny(reason);
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.on('uncaughtException', (error) => deny(`krasch: ${String(error?.message || error).slice(0, 120)}`));
  try {
    main();
  } catch (error) {
    deny(`krasch: ${String(error?.message || error).slice(0, 120)}`);
  }
}
