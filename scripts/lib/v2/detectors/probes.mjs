// Prober (harness-designen C7, etapp 2). Svaren kommer från alla fyra ytor via n8n-flödet
// R2 – Probes och kvitton (webbytorna via n8n-verktyget, Claude Code och Codex via motorns signerade anrop).
// All bedömning görs här, deterministiskt: ytan skickar bara {yta, probe, asked_at, answer}, aldrig ett omdöme.
//
// - P1 bedöms mot kanariekoden som gällde när frågan ställdes (canary_code från valid_from, annars canary_code_prev).
// - P2 bedöms mot den publicerade versionen. En version publicerad mindre än 26 timmar före frågan godtas
//   tillsammans med den föregående (ytornas synkfönster, C7 Värsta exponeringstid).
// - P3 bedöms mot det frysta facit (p3-facit.md) med samma mönster som probe-cc.
// - Bara det första svaret per yta, probe och dag räknas; övriga markeras ignorerade.
// - Ett underkännande ger en observation; två i rad (två dagar) ger larmet probe_failed.

import { makeObservation } from '../observation.mjs';
import { judgeP2, judgeP3 } from '../harness/monitor.mjs';
import { normalizeForGate } from '../harness/policy.mjs';

export const SURFACES = Object.freeze(['claude_code', 'codex', 'claude_ai', 'chatgpt']);
export const WEB_SURFACES = Object.freeze(['claude_ai', 'chatgpt']);
const HOUR_MS = 3600000;
const SYNC_WINDOW_HOURS = 26;

export const stockholmDay = (value) => new Date(value).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });

// Probsvaren i n8n-tabellen: data enligt Datakontrakt + räknaren n (1 = dagens första svar).
export function parseProbeRow(row) {
  let data = row?.data;
  if (!data && typeof row?.data_json === 'string') {
    try { data = JSON.parse(row.data_json); } catch { data = null; }
  }
  if (!data || !SURFACES.includes(data.yta) || !['P1', 'P2', 'P3'].includes(data.probe)) return null;
  return {
    observation_id: row.observation_id,
    yta: data.yta,
    probe: data.probe,
    asked_at: data.asked_at,
    answer: String(data.answer_excerpt || ''),
    n: Number(data.n) || 1,
    day: data.day || stockholmDay(data.asked_at)
  };
}

export function gradeP1(answer, canary, askedAt) {
  const asked = Date.parse(askedAt);
  const validFrom = Date.parse(canary?.valid_from || '');
  const expected = Number.isFinite(validFrom) && asked < validFrom ? canary?.canary_code_prev : canary?.canary_code;
  if (!expected) return { probe: 'P1', pass: false, reason: 'kanariekoden saknas i tillståndet' };
  const ok = normalizeForGate(answer).toUpperCase().includes(String(expected).toUpperCase());
  return { probe: 'P1', pass: ok, reason: ok ? 'rätt kanariekod' : `väntade koden som gällde ${stockholmDay(askedAt)}` };
}

// versions: [{ version, at }] i publiceringsordning (äldst först), från origin/main.
export function acceptableVersions(versions, askedAt, windowHours = SYNC_WINDOW_HOURS) {
  const asked = Date.parse(askedAt);
  const published = versions.filter((item) => Date.parse(item.at) <= asked);
  if (!published.length) return [];
  const current = published[published.length - 1];
  const accepted = [current.version];
  if (asked - Date.parse(current.at) < windowHours * HOUR_MS && published.length > 1) accepted.push(published[published.length - 2].version);
  return accepted;
}

export function gradeP2(answer, versions, askedAt) {
  const accepted = acceptableVersions(versions, askedAt);
  if (!accepted.length) return { probe: 'P2', pass: false, reason: 'ingen publicerad version före frågan' };
  for (const version of accepted) {
    const result = judgeP2(answer, version);
    if (result.pass) return { ...result, version };
  }
  return { probe: 'P2', pass: false, reason: `väntade gk-probe version: ${accepted.join(' eller ')}` };
}

export const answeredVersion = (answer) => (normalizeForGate(answer).match(/gk-probe version:\s*(\d+\.\d+\.\d+)/) || [])[1] || null;

// Bedömer dagens svar. Returnerar resultat per svar: { observation_id, status, verdict?, reason }.
export function gradeAnswers(rows, { canary, versions, facitPatterns }) {
  const parsed = rows.map(parseProbeRow).filter(Boolean)
    .sort((a, b) => a.day.localeCompare(b.day) || a.yta.localeCompare(b.yta) || a.probe.localeCompare(b.probe) || a.n - b.n);
  const seen = new Set();
  return parsed.map((answer) => {
    const key = `${answer.day}|${answer.yta}|${answer.probe}`;
    if (seen.has(key) || answer.n > 1) return { ...answer, status: 'GRADED_IGNORED', reason: 'inte dagens första svar' };
    seen.add(key);
    const result = answer.probe === 'P1' ? gradeP1(answer.answer, canary, answer.asked_at)
      : answer.probe === 'P2' ? gradeP2(answer.answer, versions, answer.asked_at)
        : judgeP3(answer.answer, facitPatterns);
    return { ...answer, status: result.pass ? 'GRADED_PASS' : 'GRADED_FAIL', verdict: result.pass ? 'pass' : 'fail', reason: String(result.reason).slice(0, 300), version: answer.probe === 'P2' ? answeredVersion(answer.answer) : undefined };
  });
}

// Historik per yta och probe: { "<yta>|<probe>": [{ day, verdict }] }, högst 30 dagar.
export function recordHistory(history, graded, keep = 30) {
  const next = { ...(history || {}) };
  for (const item of graded) {
    if (!item.verdict) continue;
    const key = `${item.yta}|${item.probe}`;
    const list = (next[key] || []).filter((entry) => entry.day !== item.day);
    list.push({ day: item.day, verdict: item.verdict });
    next[key] = list.sort((a, b) => a.day.localeCompare(b.day)).slice(-keep);
  }
  return next;
}

// Två underkännanden i rad: de två senaste dagarna med svar är båda fail och ligger högst 2 dygn isär.
export function consecutiveFailures(history, yta, probe) {
  const list = history?.[`${yta}|${probe}`] || [];
  const [previous, last] = list.slice(-2);
  if (!previous || !last || last.verdict !== 'fail' || previous.verdict !== 'fail') return false;
  return (Date.parse(`${last.day}T12:00:00Z`) - Date.parse(`${previous.day}T12:00:00Z`)) <= 2 * 24 * HOUR_MS;
}

// Observationer: ett underkännande ger en observation, två i rad ger larmet probe_failed (direkt till Discord).
export function probeObservations(graded, history, now = new Date()) {
  const observations = [];
  for (const item of graded.filter((entry) => entry.verdict === 'fail')) {
    const twice = consecutiveFailures(history, item.yta, item.probe);
    observations.push(makeObservation({
      detector: 'probes',
      area: 'tools_hub',
      dedupe_key: `probe_verdict:${item.yta}:${item.probe}:${item.day}`,
      observed_at: new Date(now).toISOString(),
      source: `Probe ${item.probe} – ${item.yta}`,
      source_kind: 'probe',
      value: `${item.probe} underkänd på ${item.yta} ${item.day}${twice ? ' (andra dagen i rad)' : ''}: ${item.reason}`.slice(0, 400),
      verified: true,
      alert_trigger: twice ? 'probe_failed' : null,
      data: { yta: item.yta, probe: item.probe, asked_at: item.asked_at, verdict: 'fail', consecutive: twice }
    }));
  }
  return observations;
}

// Versionsläget per yta för hälsodetektorn (C1.4: en yta mer än en version efter i mer än 26 timmar).
export function probeVersions(previous, graded, versions) {
  const current = versions[versions.length - 1] || null;
  const surfaces = { ...(previous?.surfaces || {}) };
  for (const item of graded) {
    if (item.probe !== 'P2' || !item.version) continue;
    const old = surfaces[item.yta];
    if (!old || Date.parse(item.asked_at) >= Date.parse(old.at || 0)) surfaces[item.yta] = { version: item.version, at: item.asked_at };
  }
  return { published: current?.version || null, published_at: current?.at || null, surfaces };
}

// Webbverifierad (C7): P2 och P3 godkända på båda webbytorna efter publiceringen.
export function webVerified(graded, publishedAt, version) {
  const after = graded.filter((item) => WEB_SURFACES.includes(item.yta) && Date.parse(item.asked_at) > Date.parse(publishedAt));
  return WEB_SURFACES.every((yta) => ['P2', 'P3'].every((probe) => after.some((item) => item.yta === yta && item.probe === probe && item.verdict === 'pass'
    && (probe !== 'P2' || item.version === version))));
}

// T19b: P3 underkänd två dagar i rad på en webbyta efter en publicering ger larm och en beslutspunkt
// (ingen automatisk återställning, eftersom det inte går att verifiera vem som skickat webbsvaren).
export function webRegression(history) {
  return WEB_SURFACES.filter((yta) => consecutiveFailures(history, yta, 'P3'));
}
