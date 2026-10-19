import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildHubInventory, mergeInventory, parseFrontmatter, validateInventory } from '../scripts/lib/v2/inventory.mjs';

test('frontmatter parser handles inline, quoted, folded and literal values', () => {
  const meta = parseFrontmatter([
    '---',
    'name: hyperframes',
    'display_name: "Hyper Frames"',
    'description: >',
    '  Mandatory entry point',
    '  for video.',
    'notes: |',
    '  rad ett',
    '  rad två',
    '---',
    '# Body'
  ].join('\r\n'));
  assert.equal(meta.name, 'hyperframes');
  assert.equal(meta.display_name, 'Hyper Frames');
  assert.equal(meta.description, 'Mandatory entry point for video.');
  assert.equal(meta.notes, 'rad ett\nrad två');
  assert.deepEqual(parseFrontmatter('# no frontmatter'), {});
});

test('hub inventory splits skills and tools, marks Codex-only skills and reads MCP and AGENTS.md', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ai-radar-hub-'));
  try {
    const skill = async (name, description, toolJson) => {
      await mkdir(path.join(dir, 'skills', name), { recursive: true });
      await writeFile(path.join(dir, 'skills', name, 'SKILL.md'), `---\nname: ${name}\ndescription: ${description}\n---\n`);
      if (toolJson) await writeFile(path.join(dir, 'skills', name, 'tool.json'), JSON.stringify(toolJson));
    };
    await skill('hyperframes', 'Video via HTML.');
    await skill('imagegen', 'Bilder.');
    await skill('tool-ffmpeg', 'FFmpeg.', { summary: 'Konvertera video', keywords: ['video'], kind: 'program' });
    await mkdir(path.join(dir, 'skills', 'not-a-skill'), { recursive: true });
    await mkdir(path.join(dir, 'hub'), { recursive: true });
    await writeFile(path.join(dir, 'hub', 'config.json'), JSON.stringify({ claude: { exclude_skills: ['imagegen'] } }));
    await mkdir(path.join(dir, 'mcp'), { recursive: true });
    await writeFile(path.join(dir, 'mcp', 'servers.json'), `﻿${JSON.stringify({ _comment: 'x', servers: { rea: { description: 'RE', clients: ['claude'] }, off: { enabled: false } } })}`);
    await writeFile(path.join(dir, 'AGENTS.md'), '# Regler');

    const hub = await buildHubInventory(dir);
    assert.deepEqual(hub.skills.map((item) => [item.name, item.clients]), [['hyperframes', ['claude', 'codex']], ['imagegen', ['codex']]]);
    assert.equal(hub.tools[0].name, 'tool-ffmpeg');
    assert.deepEqual(hub.tools[0].aliases, ['ffmpeg']);
    assert.equal(hub.tools[0].summary, 'Konvertera video');
    assert.deepEqual(hub.mcp.map((item) => [item.name, item.enabled]), [['rea', true], ['off', false]]);
    assert.equal(hub.agents_rules[0].id, 'AGENTS.md');
    assert.match(hub.agents_rules[0].sha256, /^[0-9a-f]{64}$/);

    const inventory = mergeInventory(hub, { repos: [{ name: 'ulle73/content-engine' }], _comment: 'ignoreras' }, '2026-10-19T08:00:00Z');
    assert.equal(inventory.repos.length, 1);
    assert.equal(inventory._comment, undefined);
    assert.equal(validateInventory(inventory).valid, true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('inventory validation rejects entries without an identifier', () => {
  const inventory = mergeInventory({}, { workflows: [{ description: 'saknar id' }] });
  const result = validateInventory(inventory);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('workflows[0] saknar id, name eller title'));
});
