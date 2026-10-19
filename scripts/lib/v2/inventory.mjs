// Inventeringen är det grindarna (G2, G3, G4) jämför mot: vad som redan finns i vår stack.
// Hubbdelen läses skrivskyddat från ~/.agents; repon, n8n-flöden, Notion-sidor och mått
// kommer från en lokal statisk fil (repot är publikt, så den riktiga filen committas inte).

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const INVENTORY_VERSION = 1;
const LIST_KEYS = Object.freeze([
  'skills', 'tools', 'mcp', 'repos', 'workflows', 'notion', 'metrics', 'agents_rules', 'shopify_themes'
]);

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

// Läser de enkla nyckel–värde-par som SKILL.md använder, inklusive > och | för flerradiga värden.
export function parseFrontmatter(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  if (lines[0].trim() !== '---') return {};
  const end = lines.indexOf('---', 1);
  if (end < 0) return {};

  const result = {};
  for (let i = 1; i < end; i += 1) {
    const match = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.trim();
    if (/^[>|][+-]?$/.test(value)) {
      const block = [];
      while (i + 1 < end && (/^\s+\S/.test(lines[i + 1]) || lines[i + 1].trim() === '')) {
        i += 1;
        block.push(lines[i].trim());
      }
      result[key] = value.startsWith('>') ? block.filter(Boolean).join(' ') : block.join('\n').trim();
    } else {
      result[key] = unquote(value);
    }
  }
  return result;
}

async function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  return JSON.parse((await readFile(file, 'utf8')).replace(/^﻿/, ''));
}

export async function buildHubInventory(agentsDir) {
  const skillsDir = path.join(agentsDir, 'skills');
  const config = await readJson(path.join(agentsDir, 'hub', 'config.json'), {});
  const claudeExcluded = new Set(config?.claude?.exclude_skills || []);
  const skills = [];
  const tools = [];

  const folders = existsSync(skillsDir) ? await readdir(skillsDir, { withFileTypes: true }) : [];
  for (const folder of folders.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const skillFile = path.join(skillsDir, folder.name, 'SKILL.md');
    if (!existsSync(skillFile)) continue;
    const meta = parseFrontmatter(await readFile(skillFile, 'utf8'));
    const name = meta.name || folder.name;
    const clients = claudeExcluded.has(name) ? ['codex'] : ['claude', 'codex'];
    const entry = { name, description: String(meta.description || '').slice(0, 600), clients };

    if (folder.name.startsWith('tool-')) {
      const toolJson = await readJson(path.join(skillsDir, folder.name, 'tool.json'), {});
      tools.push({
        ...entry,
        aliases: [name.replace(/^tool-/, '')],
        summary: toolJson.summary || '',
        keywords: toolJson.keywords || [],
        kind: toolJson.kind || null
      });
    } else {
      skills.push(entry);
    }
  }

  const servers = (await readJson(path.join(agentsDir, 'mcp', 'servers.json'), {}))?.servers || {};
  const mcp = Object.entries(servers)
    .filter(([name]) => !name.startsWith('_'))
    .map(([name, server]) => ({
      name,
      description: server.description || '',
      clients: server.clients || ['claude', 'codex'],
      enabled: server.enabled !== false
    }));

  const agentsFile = path.join(agentsDir, 'AGENTS.md');
  const agentsRules = existsSync(agentsFile)
    ? [{
      id: 'AGENTS.md',
      aliases: ['~/.agents/AGENTS.md'],
      sha256: createHash('sha256').update(await readFile(agentsFile)).digest('hex')
    }]
    : [];

  return { skills, tools, mcp, agents_rules: agentsRules };
}

export function mergeInventory(hub, staticPart = {}, generatedAt = new Date()) {
  const inventory = { inventory_version: INVENTORY_VERSION, generated_at: new Date(generatedAt).toISOString() };
  for (const key of LIST_KEYS) {
    inventory[key] = [...(hub?.[key] || []), ...(staticPart?.[key] || [])];
  }
  return inventory;
}

export function validateInventory(inventory) {
  const errors = [];
  if (inventory?.inventory_version !== INVENTORY_VERSION) errors.push('inventory_version måste vara 1');
  for (const key of LIST_KEYS) {
    if (!Array.isArray(inventory?.[key])) {
      errors.push(`${key} måste vara en lista`);
      continue;
    }
    inventory[key].forEach((entry, index) => {
      if (![entry?.id, entry?.name, entry?.title].some((value) => typeof value === 'string' && value.trim())) {
        errors.push(`${key}[${index}] saknar id, name eller title`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}

export { INVENTORY_VERSION, LIST_KEYS };
