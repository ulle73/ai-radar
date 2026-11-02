import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { zstdCompressSync } from 'node:zlib';
import { buildOptions, detectSessionTranscripts, readJsonl, scanTranscripts, sessionHash } from '../scripts/lib/v2/detectors/session-transcripts.mjs';

const read = async (name) => JSON.parse(await readFile(new URL(`../config/v2/${name}`, import.meta.url), 'utf8'));
const options = buildOptions({ corrections: await read('correction-patterns.v1.json'), metrics: await read('metrics.json') });
const jsonl = (records) => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`;

const user = (text, at, extra = {}) => ({ type: 'user', timestamp: at, cwd: 'C:\\dev\\golfkuponger-app', sessionId: 's1', origin: { kind: 'human' }, message: { role: 'user', content: text }, ...extra });
const tool = (name, input, at) => ({ type: 'assistant', timestamp: at, message: { role: 'assistant', content: [{ type: 'tool_use', id: 'x', name, input }] } });

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'r2-transcripts-'));
  const claude = path.join(root, 'claude', 'C--dev-golfkuponger-app');
  const codex = path.join(root, 'codex', '2026', '10', '20');
  await mkdir(path.join(claude, 's1', 'subagents'), { recursive: true });
  await mkdir(codex, { recursive: true });

  // Claude-session: 3 mänskliga meddelanden (1 rättelse), Notion-skrivning och läsning tillbaka, en skill.
  await writeFile(path.join(claude, 's1.jsonl'), jsonl([
    user('Uppdatera Smode-noden i Notion', '2026-10-20T08:00:00Z'),
    tool('mcp__abc__notion-update-page', { page_id: 'p' }, '2026-10-20T08:01:00Z'),
    tool('mcp__abc__notion-fetch', { id: 'p' }, '2026-10-20T08:02:00Z'),
    { type: 'user', timestamp: '2026-10-20T08:02:30Z', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'x', content: 'ok' }] } },
    tool('Skill', { skill: 'gk-karna:notion-dokumentation' }, '2026-10-20T08:03:00Z'),
    user('nej, fel nod – det var Plattform och backend', '2026-10-20T08:04:00Z'),
    user('The app was quit while you were working. Please continue from where you left off.', '2026-10-20T08:05:00Z', { origin: undefined }),
    user('bra, klart', '2026-10-20T08:06:00Z')
  ]) + 'inte json {\n');
  // Subagentfil: räknas till s1 (Notion-sökning och ett testkommando), men dess "user"-rader är inte Jonas.
  await writeFile(path.join(claude, 's1', 'subagents', 'agent-a1.jsonl'), jsonl([
    { type: 'user', timestamp: '2026-10-20T08:03:10Z', isSidechain: true, message: { role: 'user', content: 'nej gör om' } },
    tool('mcp__abc__notion-search', { query: 'x' }, '2026-10-20T08:03:20Z'),
    tool('Bash', { command: 'npm test' }, '2026-10-20T08:03:30Z')
  ]));
  // Probsession från probe-cc ska filtreras bort.
  await writeFile(path.join(claude, 'probe.jsonl'), jsonl([user('[gk-probe-cc] Vilken version har gk-probe?', '2026-10-21T02:00:00Z', { sessionId: 'probe' })]));
  // Subagentmapp utan huvudfil räknas som föräldralös.
  await mkdir(path.join(claude, 'saknas', 'subagents'), { recursive: true });
  await writeFile(path.join(claude, 'saknas', 'subagents', 'agent-b.jsonl'), jsonl([tool('Read', { file_path: 'x' }, '2026-10-20T09:00:00Z')]));

  // Codex-session (zstd) med en subagent i en egen fil och en exec-körning som inte räknas.
  const codexMain = [
    { type: 'session_meta', timestamp: '2026-10-20T10:00:00Z', payload: { id: 'c1', timestamp: '2026-10-20T10:00:00Z', cwd: 'C:\\Users\\rydqv\\Documents\\Codex', source: 'vscode' } },
    { type: 'response_item', timestamp: '2026-10-20T10:00:01Z', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: '<environment_context>\n</environment_context>' }] } },
    { type: 'response_item', timestamp: '2026-10-20T10:00:02Z', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Kolla GK-kampanjen i Notion' }] } },
    { type: 'response_item', timestamp: '2026-10-20T10:00:03Z', payload: { type: 'custom_tool_call', name: 'exec', input: 'const r = await tools.mcp__codex_apps__notion_fetch({id:"x"}); await tools.exec_command({cmd:"Get-Content C:\\\\x\\\\skills\\\\gk-arbetssatt\\\\SKILL.md"})' } },
    { type: 'response_item', timestamp: '2026-10-20T10:00:04Z', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'du missade budgeten' }] } }
  ];
  await writeFile(path.join(codex, 'rollout-c1.jsonl.zst'), zstdCompressSync(Buffer.from(jsonl(codexMain))));
  await writeFile(path.join(codex, 'rollout-c2.jsonl'), jsonl([
    { type: 'session_meta', timestamp: '2026-10-20T10:01:00Z', payload: { id: 'c2', cwd: 'C:\\x', source: { subagent: { thread_spawn: { parent_thread_id: 'c1', depth: 1 } } } } },
    { type: 'response_item', timestamp: '2026-10-20T10:01:01Z', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'uppdrag till subagenten' }] } },
    { type: 'response_item', timestamp: '2026-10-20T10:01:02Z', payload: { type: 'function_call', name: 'shell_command', arguments: '{"command":"python -m unittest discover"}' } }
  ]));
  await writeFile(path.join(codex, 'rollout-c3.jsonl'), jsonl([
    { type: 'session_meta', timestamp: '2026-10-20T11:00:00Z', payload: { id: 'c3', cwd: 'C:\\x', source: 'exec' } },
    { type: 'response_item', timestamp: '2026-10-20T11:00:01Z', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'domarjobb' }] } }
  ]));
  return { root, claudeRoot: path.join(root, 'claude'), codexRoot: path.join(root, 'codex') };
}

test('transkript: Claude-session med subagentfil, rättelse, Notion och skill', async () => {
  const fx = await fixture();
  try {
    const { sessions, stats } = await scanTranscripts({ claudeRoot: fx.claudeRoot, codexRoot: fx.codexRoot, options });
    const claude = sessions.find((session) => session.client === 'claude_code');
    assert.equal(claude.session_hash, sessionHash('claude_code', 's1'));
    assert.equal(claude.instructions, 2, 'första prompten räknas inte, appens omstartsmeddelande räknas inte');
    assert.equal(claude.corrections, 1);
    assert.equal(claude.notion_writes, 1);
    assert.equal(claude.notion_reads, 2, 'subagentens Notion-sökning räknas till sessionen');
    assert.deepEqual(claude.skills_used, { 'notion-dokumentation': 1 });
    assert.ok(claude.verified);
    assert.deepEqual(claude.verify_kinds, ['command', 'notion_readback']);
    assert.ok(claude.gk_session);
    assert.equal(stats.bad_lines, 1);
    assert.equal(stats.unreadable_files, 0);
    assert.equal(stats.excluded.orphan_subagent, 1);
  } finally {
    await rm(fx.root, { recursive: true, force: true });
  }
});

test('transkript: markören från probe-cc filtreras bort', async () => {
  const fx = await fixture();
  try {
    const { sessions, stats } = await scanTranscripts({ claudeRoot: fx.claudeRoot, options });
    assert.equal(sessions.length, 1);
    assert.equal(stats.excluded.probe, 1);
  } finally {
    await rm(fx.root, { recursive: true, force: true });
  }
});

test('transkript: Codex .zst läses, subagent slås ihop, exec-körningar räknas inte', async () => {
  const fx = await fixture();
  try {
    const { sessions, stats } = await scanTranscripts({ codexRoot: fx.codexRoot, options });
    assert.equal(sessions.length, 1);
    const codex = sessions[0];
    assert.equal(codex.client, 'codex');
    assert.equal(codex.instructions, 1, 'miljökontext och subagentens uppdrag är inte Jonas instruktioner');
    assert.equal(codex.corrections, 1);
    assert.equal(codex.notion_reads, 1);
    assert.deepEqual(codex.skills_used, { 'gk-arbetssatt': 1 });
    assert.ok(codex.verified, 'subagentens unittest räknas som verifieringshandling');
    assert.ok(codex.gk_session, 'första prompten nämner GK');
    assert.equal(stats.excluded.exec, 1);
  } finally {
    await rm(fx.root, { recursive: true, force: true });
  }
});

test('transkript: trasig zstd-fil räknas i unreadable_files och stoppar inte resten', async () => {
  const fx = await fixture();
  try {
    await writeFile(path.join(fx.codexRoot, '2026', '10', '20', 'rollout-trasig.jsonl.zst'), Buffer.from('inte zstd'));
    const { sessions, stats, unreadable } = await scanTranscripts({ claudeRoot: fx.claudeRoot, codexRoot: fx.codexRoot, options });
    assert.equal(stats.unreadable_files, 1);
    assert.equal(unreadable[0].file, 'rollout-trasig.jsonl.zst');
    assert.equal(sessions.length, 2);
  } finally {
    await rm(fx.root, { recursive: true, force: true });
  }
});

test('transkript: fönster och minMtime', async () => {
  const fx = await fixture();
  try {
    const none = await scanTranscripts({ claudeRoot: fx.claudeRoot, codexRoot: fx.codexRoot, since: '2026-10-21T00:00:00Z', options });
    assert.equal(none.sessions.length, 0);
    const future = await scanTranscripts({ claudeRoot: fx.claudeRoot, options, minMtime: Date.now() + 86400000 });
    assert.equal(future.stats.files, 0);
    assert.ok(future.stats.skipped_files > 0);
  } finally {
    await rm(fx.root, { recursive: true, force: true });
  }
});

test('transkript: observationer innehåller bara antal och fingeravtryck', async () => {
  const fx = await fixture();
  try {
    const { sessions } = await scanTranscripts({ claudeRoot: fx.claudeRoot, codexRoot: fx.codexRoot, options });
    const observations = detectSessionTranscripts({ sessions, now: '2026-10-21T00:00:00Z' });
    assert.equal(observations.length, 2);
    for (const observation of observations) {
      assert.equal(observation.source_kind, 'session_transcript');
      assert.deepEqual(Object.keys(observation.data).sort(), ['client', 'corrections', 'gk_session', 'instructions', 'notion_calls', 'session_hash', 'skills_used', 'verified']);
      const text = JSON.stringify(observation);
      for (const secret of ['Smode', 'golfkuponger-app', 'budgeten', 'rydqv']) assert.ok(!text.includes(secret), secret);
    }
  } finally {
    await rm(fx.root, { recursive: true, force: true });
  }
});

test('readJsonl: rader räknas, tomma rader hoppas över', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'r2-jsonl-'));
  try {
    const file = path.join(dir, 'a.jsonl');
    await writeFile(file, '{"a":1}\n\n{"a":2}\n{trasig\n');
    const seen = [];
    const result = await readJsonl(file, (record) => seen.push(record.a));
    assert.deepEqual(seen, [1, 2]);
    assert.deepEqual(result, { records: 2, badLines: 1 });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
