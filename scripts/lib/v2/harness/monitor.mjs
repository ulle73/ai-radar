// C7 lokalt (etapp 1a): efter en publicering kör motorn P2 och P3 med probe-cc (Claude Code med Jonas vanliga
// konfiguration) i samma nattfas. Underkänns någon görs återställning direkt (hub.py rollback --card).
// All bedömning görs här, deterministiskt; ytan lämnar bara svaret. Brytaren: 2 återställningar på 14 dagar.

import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { judgeEnv } from '../judge/codex.mjs';
import { parseClaudeResult, runClaudeProcess } from '../judge/claude.mjs';
import { normalizeForGate } from './policy.mjs';

export const PROBE_MARKER = '[gk-probe-cc]';
export const PROBES = Object.freeze({
  P2: 'Vilken version har gk-probe? Svara bara med raden från skillen.',
  P3: 'Var och i vilket format ska lärdomen notion-las-forst sparas? Svara kort med plats och radformat.'
});

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function judgeP2(answer, version) {
  const ok = new RegExp(`gk-probe version: ${escapeRegex(version)}(?![0-9.])`).test(normalizeForGate(answer));
  return { probe: 'P2', pass: ok, reason: ok ? `version ${version}` : `väntade gk-probe version: ${version}` };
}

// Mönstren läses från p3-facit.md (avsnittet "Deterministisk bedömning"); flera `…` på samma rad är alternativ.
export function parseFacitPatterns(markdown) {
  const section = String(markdown || '').split(/^## /m).find((part) => part.startsWith('Deterministisk bedömning'));
  if (!section) return [];
  return section.split('\n')
    .filter((line) => /^\s*-\s+`/.test(line))
    .map((line) => [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]))
    .filter((alternatives) => alternatives.length)
    .map((alternatives) => new RegExp(alternatives.map((alt) => `(?:${alt})`).join('|'), 'iu'));
}

export function judgeP3(answer, patterns) {
  if (!patterns.length) return { probe: 'P3', pass: false, reason: 'facit saknar mönster' };
  const text = normalizeForGate(answer).toLowerCase();
  const missing = patterns.filter((re) => !re.test(text));
  return { probe: 'P3', pass: missing.length === 0, reason: missing.length ? `saknar ${missing.map((re) => re.source).join(', ')}` : 'alla delar i facit finns' };
}

// Kör en probe i Claude Code med Jonas konfiguration (Notion-anslutningen behövs för P1 i etapp 2).
// --no-session-persistence och markören [gk-probe-cc] håller proben utanför måtten (C10).
export async function runLocalProbe({ question, claude, env = judgeEnv(process.env), run = runClaudeProcess, timeoutMs = 5 * 60000 }) {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'gk-probe-cc-'));
  try {
    const args = ['-p', '--no-session-persistence', '--output-format', 'json', '--max-turns', '6'];
    const { code, stdout } = await run(claude, args, `${PROBE_MARKER} ${question}`, { timeoutMs, env, cwd });
    const result = parseClaudeResult(stdout);
    return { ok: code === 0 && result && !result.is_error, answer: String(result?.result || '').slice(0, 2000) };
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

// P2 och P3 efter publicering; underkänd probe ger återställning i samma nattfas (T19a).
export async function afterPublish({ version, facitPatterns, probe, rollback }) {
  const results = [];
  const p2 = await probe('P2');
  results.push(p2.ok ? judgeP2(p2.answer, version) : { probe: 'P2', pass: false, reason: 'proben kunde inte köras' });
  const p3 = await probe('P3');
  results.push(p3.ok ? judgeP3(p3.answer, facitPatterns) : { probe: 'P3', pass: false, reason: 'proben kunde inte köras' });
  if (results.every((result) => result.pass)) return { verified: true, results };
  const undone = await rollback();
  return { verified: false, results, rolled_back: Boolean(undone?.ok), rollback: undone };
}

// Två återställningar inom 14 dagar aktiverar brytaren för klassen (C3).
export function breakerTripped(rolledBackAt, breaker = { reverts: 2, days: 14 }, now = new Date()) {
  const nowMs = new Date(now).getTime();
  const recent = rolledBackAt.map((at) => Date.parse(at)).filter((at) => Number.isFinite(at) && nowMs - at <= breaker.days * 86400000);
  return recent.length >= breaker.reverts;
}
