// Bygger inventeringen som grindarna jämför mot och skriver den utanför repot.
//
//   node scripts/v2/build-inventory.mjs [--agents ~/.agents] [--static config/v2/inventory.static.json] [--out ~/.ai-radar/inventory.json]
//
// Hubben läses skrivskyddat. Den statiska filen (repon, n8n-flöden, Notion-sidor, mått) är lokal
// och gitignorerad eftersom repot är publikt; se config/v2/inventory.static.example.json.

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildHubInventory, mergeInventory, validateInventory } from '../lib/v2/inventory.mjs';

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function expandHome(value) {
  return value.startsWith('~') ? path.join(os.homedir(), value.slice(1)) : value;
}

const agentsDir = expandHome(argument('agents', '~/.agents'));
const staticFile = expandHome(argument('static', 'config/v2/inventory.static.json'));
const outFile = expandHome(argument('out', '~/.ai-radar/inventory.json'));

if (!existsSync(agentsDir)) {
  console.error(`Hittar inte hubben: ${agentsDir}`);
  process.exit(1);
}

let staticPart = {};
if (existsSync(staticFile)) {
  staticPart = JSON.parse((await readFile(staticFile, 'utf8')).replace(/^﻿/, ''));
} else {
  console.warn(`Ingen statisk inventering (${staticFile}). Repon, n8n-flöden, Notion och mått blir tomma.`);
}

const inventory = mergeInventory(await buildHubInventory(agentsDir), staticPart);
const { valid, errors } = validateInventory(inventory);
if (!valid) {
  console.error(`Ogiltig inventering:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, `${JSON.stringify(inventory, null, 2)}\n`);

const counts = ['skills', 'tools', 'mcp', 'repos', 'workflows', 'notion', 'metrics', 'agents_rules']
  .map((key) => `${key}=${inventory[key].length}`)
  .join(' ');
console.log(`Inventering skriven till ${outFile}: ${counts}`);
