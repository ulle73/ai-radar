// C0 Körstyrning (harness-designen). Tillståndet ligger i n8n-tabellen GK_R2_HARNESS_STATE och nås via
// flödet r2-harness-state (signerade anrop). Före varje steg läses tillståndet. Motorn stannar om bromsen är
// aktiv, läsningen misslyckas, brytaren är aktiv eller skyddsräckespaketet på origin/main har en annan hash
// än approved_guardrail_hash. Undantag: återställning och larm körs alltid.

import { createHash } from 'node:crypto';
import { execFile, spawn } from 'node:child_process';
import path from 'node:path';
import { git } from './git.mjs';

export const STATE_KEYS = Object.freeze([
  'brake', 'approved_guardrail_hash', 'breaker:skill_text', 'canary_code', 'canary_code_prev', 'valid_from',
  'liveness_at', 'liveness_note'
]);
export const ALWAYS_ALLOWED = Object.freeze(['rollback', 'alert']);
export const GUARDRAIL_PATHS = Object.freeze(['harness', 'hub', 'evals']);

// Skrivregler (speglar n8n/r2-harness-state.workflow.ts; testas i tests/v2-controller.test.mjs).
// Motorns signerade anrop får bara skriva liveness_*, canary_* och valid_from, och aktivera brytaren eller bromsen.
export function engineMayWrite(key, value) {
  if (/^liveness_(at|note)$/.test(key) || /^canary_code(_prev)?$/.test(key) || key === 'valid_from') return true;
  if (key === 'breaker:skill_text' || key === 'brake') return value === 'on';
  return false;
}

// Hash över skyddsräckespaketet (harness/**, hub/**, evals/**) på origin/main: sökväg och blob-sha per fil.
export async function guardrailHash(clone, ref = 'origin/main') {
  const listing = await git({ gitDir: path.join(clone, '.git') }, ['ls-tree', '-r', '--full-tree', ref, '--', ...GUARDRAIL_PATHS]);
  const lines = listing.split('\n').filter(Boolean).map((line) => {
    const [meta, file] = line.split('\t');
    const [, , sha] = meta.split(' ');
    return `${file} ${sha}`;
  }).sort();
  return createHash('sha256').update(lines.join('\n')).digest('hex');
}

// Avgör om ett steg får köras. state = svaret från read, eller null om läsningen misslyckades.
export function gate({ step, state, readError = null, guardrail = null }) {
  if (ALWAYS_ALLOWED.includes(step)) return { go: true, reason: 'återställning och larm körs alltid' };
  if (readError || !state) return { go: false, reason: `tillståndet kunde inte läsas: ${String(readError || 'tomt svar').slice(0, 120)}` };
  if (state.brake === 'on') return { go: false, reason: 'nödbromsen är aktiv' };
  if (state['breaker:skill_text'] === 'on') return { go: false, reason: 'brytaren för skill_text är aktiv' };
  if (!state.approved_guardrail_hash) return { go: false, reason: 'skyddsräckespaketet är inte godkänt (r2:policy:approve)' };
  if (guardrail && guardrail !== state.approved_guardrail_hash) {
    return { go: false, alert: true, reason: `skyddsräckespaketet på origin/main (${guardrail.slice(0, 12)}) är inte godkänt` };
  }
  return { go: true, reason: 'ok' };
}

// Klient mot r2-harness-state. post = (payload) => postSigned({... path: 'r2-harness-state', payload }).
export function stateClient(post) {
  const call = async (payload) => {
    const response = await post(payload);
    if (response.status >= 300 || !response.body?.ok) throw new Error(`r2-harness-state ${payload.action}: ${response.status} ${response.body?.error || ''}`.trim());
    return response.body;
  };
  return {
    read: async () => (await call({ action: 'read' })).state || {},
    write: async (updates) => {
      const bad = Object.entries(updates).filter(([key, value]) => !engineMayWrite(key, value));
      if (bad.length) throw new Error(`motorn får inte skriva ${bad.map(([key]) => key).join(', ')}`);
      return call({ action: 'write', updates });
    },
    cards: async () => (await call({ action: 'cards' })).cards || [],
    cardUpdate: (cardId, fields) => call({ action: 'card_update', card_id: cardId, fields }),
    decision: (cardId, message) => call({ action: 'decision', card_id: cardId, message }),
    alert: (message) => call({ action: 'alert', message })
  };
}

export function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error(`${label} tog längre tid än ${Math.round(ms / 60000)} min`), { timeout: true })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Minuter sedan senaste inmatning (GetLastInputInfo). V18: Task Schedulers ledighetsvillkor är föråldrat.
const IDLE_SCRIPT = [
  'Add-Type @"',
  'using System; using System.Runtime.InteropServices;',
  'public static class GkIdle { [StructLayout(LayoutKind.Sequential)] struct L { public uint cbSize; public uint dwTime; }',
  '[DllImport("user32.dll")] static extern bool GetLastInputInfo(ref L l);',
  'public static uint Ms() { L l = new L(); l.cbSize = (uint)Marshal.SizeOf(l); GetLastInputInfo(ref l); return ((uint)Environment.TickCount - l.dwTime); } }',
  '"@',
  '[GkIdle]::Ms()'
].join('\n');

export function idleMinutes(run = execFile) {
  return new Promise((resolve, reject) => {
    run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', IDLE_SCRIPT], { encoding: 'utf8', windowsHide: true, timeout: 60000 }, (error, stdout) => {
      if (error) return reject(error);
      const ms = Number(String(stdout).trim().split(/\s+/).pop());
      return Number.isFinite(ms) ? resolve(ms / 60000) : reject(new Error('kunde inte läsa ledighet'));
    });
  });
}

// Motorn får starta när ingen inmatning skett på minst 30 minuter (T23), och antingen inom nattfönstret eller
// som reserv när ingen lyckad körning skett på fallbackHours timmar. Datorn går i Modern Standby när den
// lämnas och väckningstimers är avstängda, så nattfönstret räcker inte ensamt (felsökning 2026-11-06).
export function mayStart({ now = new Date(), idle, inWindow, minIdleMinutes = 30, lastRunAt = null, fallbackHours = 20 }) {
  if (!(idle >= minIdleMinutes)) return { go: false, reason: `datorn har använts de senaste ${minIdleMinutes} minuterna` };
  if (inWindow(now)) return { go: true, reason: 'nattfönstret' };
  const last = Date.parse(lastRunAt);
  if (!Number.isFinite(last) || new Date(now) - last >= fallbackHours * 3600000) {
    return { go: true, reason: `reserv: ingen lyckad körning på ${fallbackHours} timmar` };
  }
  return { go: false, reason: `utanför nattfönstret, senaste lyckade körning för mindre än ${fallbackHours} timmar sedan` };
}

// Håller datorn vaken medan en körning pågår: en dold hjälpprocess anropar SetThreadExecutionState
// (ES_CONTINUOUS | ES_SYSTEM_REQUIRED) och väntar tills den anropande processen har avslutats.
const AWAKE_SCRIPT = (pid) => [
  'Add-Type @"',
  'using System; using System.Runtime.InteropServices;',
  'public static class GkAwake { [DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f); }',
  '"@',
  '[void][GkAwake]::SetThreadExecutionState(0x80000001)',
  `Wait-Process -Id ${Number(pid)} -ErrorAction SilentlyContinue`
].join('\n');

export function keepAwake(spawnImpl = spawn, pid = process.pid) {
  const child = spawnImpl('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', AWAKE_SCRIPT(pid)], { windowsHide: true, stdio: 'ignore' });
  child.on?.('error', () => {});
  return () => { try { child.kill(); } catch { /* redan avslutad */ } };
}

// Ett harness-kort i kö: mistake_ref, klarade grindarna G1–G8 (publishable), ej utfört och ej avvisat.
// KRÄVER_OK körs igen först efter Jonas OK: vid C3a utan sha (OK att ta fram diffen), vid C3b bundet till
// approved_diff_sha256 (C3b jämför shan).
export function pendingHarnessCards(rows) {
  return rows.map((row) => {
    let card = null;
    try { card = JSON.parse(row.card_json || 'null'); } catch { card = null; }
    return { row, card };
  }).filter(({ row, card }) => card?.mistake_ref
    && (row.publishable === true || row.publishable === 'true')
    && !row.published_version && !row.rolled_back_at && row.decision !== 'NEJ'
    && !['AVVISAD', 'needs_eval', 'injection_suspected'].includes(row.autonomy)
    && (row.autonomy !== 'KRAVER_OK' || row.decision === 'OK'));
}

// C3/C7: en publicerad, inte återställd ändring utan web_verified_at blockerar nästa kandidat när
// webbverifieringen krävs (från spärr 2). Efter max 7 dagar släpper spärren, så att en yta som inte svarar
// inte stoppar motorn för alltid; larmet för saknade prober kommer från hälsodetektorn.
export function awaitingWebVerification(rows, { required = false, now = new Date(), maxDays = 7 } = {}) {
  if (!required) return null;
  const nowMs = new Date(now).getTime();
  return rows.find((row) => row.published_version && !row.rolled_back_at && !row.web_verified_at
    && nowMs - Date.parse(row.published_at || 0) <= maxDays * 86400000) || null;
}
