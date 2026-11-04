// Sessionstranskript (harness-designen C1.1 och C10). Läser Claude Codes ~/.claude/projects/**/*.jsonl, där
// subagentfiler (<session>/subagents/*.jsonl) räknas till sessionen de hör till, och Codex
// ~/.codex/sessions/**/*.jsonl[.zst] (zstd, V14). Räknar per session utan språkmodell: rättelser från Jonas
// (config/v2/correction-patterns.v1.json), Notion-anrop, skill-anrop och verifieringshandlingar.
//
// Maskning sker här: bara antal och ett fingeravtryck (session_hash) lämnar datorn, aldrig text, sökvägar
// eller arbetsmappar. Filer strömmas rad för rad (en Codex-fil kan vara större än en sträng i V8 tillåter).
// Probsessioner (markörerna [gk-probe-cc] och [gk-probe-codex]) och Codex exec-körningar räknas inte.

import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import zlib from 'node:zlib';
import { makeObservation } from '../observation.mjs';

const INJECTED = [
  '<local-command', '<system-reminder', '<command-stdout', '<task-notification', '<side-sessions-event', '<ci-monitor-event',
  'Caveat:', '[Request interrupted', 'The app was quit', 'This session is being continued'
];
const CODEX_INJECTED = ['<', '# AGENTS.md', '# Files mentioned by the user'];
const NOTION_WRITE = /(create|update|move|delete|append|duplicate|insert|comment|upload|restore|archive)/i;
// Codex skriver sökvägar i JS-källkod, så avgränsarna kan vara dubbla (C:\\x\\skills\\namn\\SKILL.md).
const SKILL_FILE = /[\\/]+skills[\\/]+([a-z0-9][a-z0-9._-]*)[\\/]+SKILL\.md\b/gi;
const DAY_MS = 86400000;

export function compilePatterns(list) {
  return (list || []).map((source) => new RegExp(source, 'iu'));
}

const norm = (text) => String(text || '').normalize('NFKC');
const lowerPath = (value) => String(value || '').replace(/\\/g, '/').toLowerCase();
export const sessionHash = (client, id) => createHash('sha256').update(`${client}:${id}`).digest('hex').slice(0, 16);

// Strömmar en jsonl-fil (ev. zstd) och anropar onRecord per tolkad rad. Rader som inte är JSON räknas i
// badLines (en avbruten sista rad är vanlig); fel vid läsning eller dekomprimering kastas (unreadable_files).
export async function readJsonl(file, onRecord) {
  let input = createReadStream(file);
  if (file.endsWith('.zst')) {
    // zstd finns i Node 22.15+/23.8+ (V14). Hämtas vid körning, så att modulen laddas även i äldre Node
    // (den publika heartbeaten i GitHub Actions läser aldrig transkript).
    if (typeof zlib.createZstdDecompress !== 'function') throw new Error('zstd saknas i denna Node-version');
    const source = input;
    input = source.pipe(zlib.createZstdDecompress());
    source.on('error', (error) => input.destroy(error));
  }
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  let badLines = 0;
  let records = 0;
  for await (const line of lines) {
    if (!line.trim()) continue;
    let record;
    try { record = JSON.parse(line); } catch { badLines += 1; continue; }
    records += 1;
    onRecord(record);
  }
  return { records, badLines };
}

function emptySummary(client) {
  return {
    client, id: null, started_at: null, ended_at: null, cwd: '', first_prompt: null, human: [],
    notion_reads: 0, notion_writes: 0, skills_used: {}, verify_kinds: new Set(),
    written: new Set(), notion_written: false, excluded: null, parent_id: null
  };
}

function track(summary, timestamp) {
  const at = Date.parse(timestamp || '');
  if (!Number.isFinite(at)) return;
  if (summary.started_at === null || at < summary.started_at) summary.started_at = at;
  if (summary.ended_at === null || at > summary.ended_at) summary.ended_at = at;
}

function addSkill(summary, name) {
  const key = String(name || '').split(':').pop().trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{0,63}$/.test(key)) return;
  summary.skills_used[key] = (summary.skills_used[key] || 0) + 1;
}

function notionCall(summary, name) {
  if (NOTION_WRITE.test(name)) {
    summary.notion_writes += 1;
    summary.notion_written = true;
  } else {
    summary.notion_reads += 1;
    if (summary.notion_written) summary.verify_kinds.add('notion_readback');
  }
}

function skillReads(summary, text) {
  for (const match of String(text || '').matchAll(SKILL_FILE)) addSkill(summary, match[1]);
}

function command(summary, text, options) {
  if (options.verifyPattern.test(String(text || ''))) summary.verify_kinds.add('command');
}

function claudeText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return null;
  if (content.some((part) => part?.type === 'tool_result')) return null;
  const text = content.filter((part) => part?.type === 'text').map((part) => part.text || '').join('\n');
  return text || null;
}

// En rad i en Claude Code-fil. isSubagent: raden kommer från en subagentfil (bara verktyg räknas).
export function claudeRecord(summary, record, options, { isSubagent = false } = {}) {
  if (!record || typeof record !== 'object') return;
  if (record.sessionId && !summary.id && !isSubagent) summary.id = record.sessionId;
  if (record.type === 'user' || record.type === 'assistant') track(summary, record.timestamp);
  if (record.cwd && !summary.cwd) summary.cwd = record.cwd;

  if (record.type === 'user' && !isSubagent && !record.isSidechain && !record.isMeta) {
    const text = claudeText(record.message?.content);
    if (text === null) return;
    const human = record.origin ? record.origin.kind === 'human' : !INJECTED.some((prefix) => text.trimStart().startsWith(prefix));
    if (!human) return;
    if (summary.first_prompt === null) summary.first_prompt = text.slice(0, 2000);
    summary.human.push(text.slice(0, 2000));
    const slash = text.match(/<command-message>[^<]*<\/command-message>\s*<command-name>\/([^<\s]+)<\/command-name>/);
    if (slash) addSkill(summary, slash[1]);
    return;
  }

  if (record.type !== 'assistant') return;
  for (const part of record.message?.content || []) {
    if (part?.type !== 'tool_use') continue;
    const name = String(part.name || '');
    const input = part.input || {};
    if (name === 'Skill') addSkill(summary, input.skill || input.command || input.name);
    else if (name.startsWith('mcp__') && /notion/i.test(name)) notionCall(summary, name.split('__').pop());
    else if (name === 'Bash' || name === 'PowerShell') { command(summary, input.command, options); skillReads(summary, input.command); }
    else if (name === 'Write' || name === 'Edit' || name === 'NotebookEdit' || name === 'MultiEdit') {
      if (input.file_path) summary.written.add(lowerPath(input.file_path));
    } else if (name === 'Read') {
      const file = lowerPath(input.file_path);
      if (summary.written.has(file)) summary.verify_kinds.add('readback');
      skillReads(summary, input.file_path);
    }
  }
}

function codexText(content) {
  return (Array.isArray(content) ? content : []).map((part) => part?.text || '').join('\n');
}

function codexToolText(summary, text, options) {
  const body = String(text || '');
  for (const match of body.matchAll(/tools\.([A-Za-z0-9_]+)/g)) {
    if (/notion/i.test(match[1])) notionCall(summary, match[1]);
  }
  for (const match of body.matchAll(/\*\*\* (?:Update|Add) File: ([^\r\n]+)/g)) summary.written.add(lowerPath(match[1].trim()));
  for (const match of body.matchAll(/\b(?:cmd|command)\s*["']?\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
    const cmd = match[1].replace(/\\\\/g, '\\');
    command(summary, cmd, options);
    if (/\b(get-content|cat|type|sed -n|head|tail|rg|grep|select-string)\b/i.test(cmd)) {
      const lower = lowerPath(cmd);
      for (const file of summary.written) {
        if (file && lower.includes(file.split('/').pop())) { summary.verify_kinds.add('readback'); break; }
      }
    }
  }
  skillReads(summary, body);
}

export function codexRecord(summary, record, options) {
  if (!record || typeof record !== 'object') return;
  const payload = record.payload || {};
  if (record.type === 'session_meta') {
    summary.id = summary.id || payload.id || payload.session_id || null;
    summary.cwd = summary.cwd || payload.cwd || '';
    const source = payload.source;
    if (source === 'exec') summary.excluded = 'exec';
    if (source && typeof source === 'object' && source.subagent) {
      const parent = source.subagent.thread_spawn?.parent_thread_id || payload.parent_thread_id || null;
      if (parent) summary.parent_id = parent;
      else summary.excluded = 'subagent_without_parent';
    }
    track(summary, payload.timestamp || record.timestamp);
    return;
  }
  if (record.type !== 'response_item') return;
  track(summary, record.timestamp);
  if (payload.type === 'message' && payload.role === 'user') {
    if (summary.parent_id) return;
    const text = codexText(payload.content);
    if (!text.trim() || CODEX_INJECTED.some((prefix) => text.trimStart().startsWith(prefix))) return;
    if (summary.first_prompt === null) summary.first_prompt = text.slice(0, 2000);
    summary.human.push(text.slice(0, 2000));
    return;
  }
  if (payload.type === 'function_call') {
    const name = String(payload.name || '');
    if (/notion/i.test(name)) notionCall(summary, name);
    codexToolText(summary, payload.arguments, options);
  } else if (payload.type === 'custom_tool_call') {
    codexToolText(summary, payload.input, options);
  }
}

function isProbe(summary, options) {
  const first = String(summary.first_prompt || '').trimStart();
  return options.probeMarkers.some((marker) => first.startsWith(marker));
}

// Slår ihop subagentens verktygsräkning med huvudsessionen.
export function mergeInto(parent, child) {
  parent.notion_reads += child.notion_reads;
  parent.notion_writes += child.notion_writes;
  for (const [name, count] of Object.entries(child.skills_used)) parent.skills_used[name] = (parent.skills_used[name] || 0) + count;
  for (const kind of child.verify_kinds) parent.verify_kinds.add(kind);
  if (child.ended_at !== null && (parent.ended_at === null || child.ended_at > parent.ended_at)) parent.ended_at = child.ended_at;
}

// Den maskade sammanfattningen per session (C10). Inga texter eller sökvägar följer med.
export function finalizeSession(summary, options) {
  const corrections = summary.human.slice(1).filter((text) => options.corrections.some((re) => re.test(norm(text)))).length;
  const verify = [...summary.verify_kinds].sort();
  const gk = options.gkCwd.some((re) => re.test(summary.cwd || '')) || options.gkPrompt.test(norm(summary.first_prompt || ''));
  return {
    client: summary.client,
    session_hash: sessionHash(summary.client, summary.id || 'okand'),
    started_at: summary.started_at === null ? null : new Date(summary.started_at).toISOString(),
    ended_at: summary.ended_at === null ? null : new Date(summary.ended_at).toISOString(),
    instructions: Math.max(0, summary.human.length - 1),
    corrections,
    notion_calls: summary.notion_reads + summary.notion_writes,
    notion_reads: summary.notion_reads,
    notion_writes: summary.notion_writes,
    skills_used: Object.fromEntries(Object.entries(summary.skills_used).sort(([a], [b]) => a.localeCompare(b))),
    verified: verify.length > 0,
    verify_kinds: verify,
    gk_session: gk
  };
}

export function buildOptions({ corrections, metrics }) {
  return {
    corrections: compilePatterns(corrections.patterns),
    gkCwd: compilePatterns(metrics.gk_cwd_patterns),
    gkPrompt: new RegExp(metrics.gk_prompt_pattern, 'iu'),
    verifyPattern: new RegExp(metrics.verify_command_pattern, 'i'),
    probeMarkers: metrics.probe_markers || []
  };
}

async function listFiles(dir, accept) {
  const out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(full, accept));
    else if (accept(entry.name)) out.push(full);
  }
  return out.sort();
}

// Läser alla transkript och returnerar maskade sessioner som startade i [since, until).
// minMtime hoppar över filer som inte ändrats sedan dess (den dagliga detektorn); freeze läser allt.
export async function scanTranscripts({ claudeRoot, codexRoot, since, until, options, minMtime = null }) {
  const sinceMs = since ? Date.parse(since) : -Infinity;
  const untilMs = until ? Date.parse(until) : Infinity;
  const stats = { files: 0, unreadable_files: 0, bad_lines: 0, skipped_files: 0, excluded: { probe: 0, exec: 0, subagent_without_parent: 0, orphan_subagent: 0, empty: 0 } };
  const unreadable = [];

  const readSummary = async (file, summary, apply) => {
    if (minMtime !== null) {
      try { if ((await stat(file)).mtimeMs < minMtime) { stats.skipped_files += 1; return false; } } catch { /* läses nedan */ }
    }
    stats.files += 1;
    try {
      const result = await readJsonl(file, (record) => apply(summary, record));
      stats.bad_lines += result.badLines;
      return true;
    } catch (error) {
      stats.unreadable_files += 1;
      unreadable.push({ file: path.basename(file), error: String(error?.message || error).slice(0, 120) });
      return false;
    }
  };

  const sessions = new Map();
  if (claudeRoot) {
    const files = await listFiles(claudeRoot, (name) => name.endsWith('.jsonl'));
    const mains = files.filter((file) => !/[\\/]subagents[\\/]/.test(file));
    const subs = files.filter((file) => /[\\/]subagents[\\/]/.test(file));
    for (const file of mains) {
      const summary = emptySummary('claude_code');
      summary.id = path.basename(file, '.jsonl');
      if (await readSummary(file, summary, (s, r) => claudeRecord(s, r, options))) sessions.set(`claude_code:${summary.id}`, summary);
    }
    for (const file of subs) {
      const parentId = path.basename(path.dirname(path.dirname(file)));
      const parent = sessions.get(`claude_code:${parentId}`);
      if (!parent) { stats.excluded.orphan_subagent += 1; continue; }
      const child = emptySummary('claude_code');
      if (await readSummary(file, child, (s, r) => claudeRecord(s, r, options, { isSubagent: true }))) mergeInto(parent, child);
    }
  }

  if (codexRoot) {
    const files = await listFiles(codexRoot, (name) => name.endsWith('.jsonl') || name.endsWith('.jsonl.zst'));
    const children = [];
    for (const file of files) {
      const summary = emptySummary('codex');
      if (!(await readSummary(file, summary, (s, r) => codexRecord(s, r, options)))) continue;
      summary.id = summary.id || path.basename(file).replace(/\.jsonl(\.zst)?$/, '');
      if (summary.excluded) { stats.excluded[summary.excluded] += 1; continue; }
      if (summary.parent_id) children.push(summary);
      else sessions.set(`codex:${summary.id}`, summary);
    }
    for (const child of children) {
      const parent = sessions.get(`codex:${child.parent_id}`);
      if (parent) mergeInto(parent, child);
      else stats.excluded.orphan_subagent += 1;
    }
  }

  const result = [];
  for (const summary of sessions.values()) {
    if (summary.started_at === null || !summary.human.length) { stats.excluded.empty += 1; continue; }
    if (isProbe(summary, options)) { stats.excluded.probe += 1; continue; }
    if (summary.started_at < sinceMs || summary.started_at >= untilMs) continue;
    result.push(finalizeSession(summary, options));
  }
  result.sort((a, b) => a.started_at.localeCompare(b.started_at) || a.session_hash.localeCompare(b.session_hash));
  return { sessions: result, stats, unreadable };
}

// En observation per session (data enligt Datakontrakt). dedupe per session och dag, så att en session som
// pågår över midnatt ger en ny ögonblicksbild; måtten (metrics.mjs) läser filerna direkt och dubbelräknar inte.
export function detectSessionTranscripts({ sessions = [], now = new Date() }) {
  const day = new Date(now).toISOString().slice(0, 10);
  return sessions.map((session) => makeObservation({
    detector: 'session_transcripts',
    area: 'tools_hub',
    dedupe_key: `session:${session.client}:${session.session_hash}:${day}`,
    observed_at: session.ended_at || session.started_at,
    source: session.client === 'codex' ? 'Codex – sessionstranskript' : 'Claude Code – sessionstranskript',
    source_kind: 'session_transcript',
    value: `Session ${session.client}: ${session.instructions + 1} instruktioner, ${session.corrections} rättelser, ${session.notion_calls} Notion-anrop${session.verified ? ', verifierad' : ''}`,
    verified: true,
    data: {
      client: session.client,
      session_hash: session.session_hash,
      corrections: session.corrections,
      instructions: session.instructions,
      notion_calls: session.notion_calls,
      skills_used: session.skills_used,
      verified: session.verified,
      gk_session: session.gk_session
    }
  }));
}

export { DAY_MS };
