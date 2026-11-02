// Mått (harness-designen C10). Versionerad och deterministisk: samma sessioner ger alltid samma resultat.
// Indata är de maskade sessionerna från detectors/session-transcripts.mjs (inga texter eller sökvägar).
//
// - Huvudmått: självständigt verifierade sessioner per vecka = minst 1 verifieringshandling, 0 rättelser
//   och högst 1 användarinstruktion efter den första.
// - Minnesanvändning: andelen Golfkuponger-sessioner med minst 1 Notion-anrop.
// - Motvikt: andelen sessioner med minst 1 rättelse.
// - Upprepat misstag: en lärdomsnyckel med minst 2 rader på 30 dagar (från lärdomsraderna, inte transkripten).

import { createHash } from 'node:crypto';
import { makeObservation } from '../observation.mjs';

export const METRICS_VERSION = 1;
const DAY_MS = 86400000;

// ISO-vecka (måndag–söndag) för ett datum, t.ex. 2026-W44. Räknas i UTC för att vara deterministisk.
export function isoWeek(value) {
  const date = new Date(value);
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((day - yearStart) / DAY_MS + 1) / 7);
  return `${day.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Måndag 00:00 UTC för veckan som innehåller datumet.
export function weekStart(value) {
  const date = new Date(value);
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() || 7) - 1));
  return day;
}

export const isAutonomous = (session) => session.verified && session.corrections === 0 && session.instructions <= 1;

const round = (value, digits = 4) => (Number.isFinite(value) ? Number(value.toFixed(digits)) : null);
const share = (part, whole) => (whole ? round(part / whole) : null);

// Måtten för en mängd sessioner (en vecka eller ett glidande fönster).
export function summarize(sessions) {
  const gk = sessions.filter((session) => session.gk_session);
  const byClient = {};
  for (const session of sessions) {
    const entry = byClient[session.client] || (byClient[session.client] = { sessions: 0, autonomous: 0, gk_sessions: 0, gk_with_notion: 0 });
    entry.sessions += 1;
    if (isAutonomous(session)) entry.autonomous += 1;
    if (session.gk_session) {
      entry.gk_sessions += 1;
      if (session.notion_calls > 0) entry.gk_with_notion += 1;
    }
  }
  return {
    sessions: sessions.length,
    autonomous_verified: sessions.filter(isAutonomous).length,
    verified: sessions.filter((session) => session.verified).length,
    with_corrections: sessions.filter((session) => session.corrections > 0).length,
    correction_rate: share(sessions.filter((session) => session.corrections > 0).length, sessions.length),
    gk_sessions: gk.length,
    gk_with_notion: gk.filter((session) => session.notion_calls > 0).length,
    memory_usage: share(gk.filter((session) => session.notion_calls > 0).length, gk.length),
    by_client: Object.fromEntries(Object.entries(byClient).sort(([a], [b]) => a.localeCompare(b)))
  };
}

// Veckovisa mått för hela veckor i [from, to). Ofullständiga veckor i kanterna tas inte med.
export function weekly(sessions, { from, to }) {
  const fromMs = Date.parse(from);
  const toMs = Date.parse(to);
  const weeks = [];
  for (let start = weekStart(fromMs).getTime(); start + 7 * DAY_MS <= toMs; start += 7 * DAY_MS) {
    if (start < fromMs) continue;
    const end = start + 7 * DAY_MS;
    const inWeek = sessions.filter((session) => {
      const at = Date.parse(session.started_at);
      return at >= start && at < end;
    });
    weeks.push({ week: isoWeek(start), from: new Date(start).toISOString(), ...summarize(inWeek) });
  }
  return weeks;
}

const mean = (values) => {
  const list = values.filter((value) => Number.isFinite(value));
  return list.length ? round(list.reduce((sum, value) => sum + value, 0) / list.length) : null;
};

// Baslinjen: medelvärde över veckorna, och andelar över hela fönstret.
export function baselineOf(weeks, total) {
  return {
    autonomous_verified_per_week: mean(weeks.map((week) => week.autonomous_verified)),
    sessions_per_week: mean(weeks.map((week) => week.sessions)),
    correction_rate: total.correction_rate,
    memory_usage: total.memory_usage,
    // Lärdomsformatet infördes 2026-11-02; baslinjen för upprepade nycklar sätts av de första 4 veckornas ögonblicksbilder.
    repeated_lesson_keys: null
  };
}

export function digestOf(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

// freeze: ett fruset, deterministiskt resultat (T13). Ingen körtid i resultatet; digest täcker allt utom sig själv.
export function freezeResult({ source, from, to, sessions, stats }) {
  const total = summarize(sessions);
  const weeks = weekly(sessions, { from, to });
  const result = {
    metrics_version: METRICS_VERSION,
    patterns_version: 1,
    source,
    window: { from, to },
    files: stats.files,
    unreadable_files: stats.unreadable_files,
    bad_lines: stats.bad_lines,
    excluded: stats.excluded,
    total,
    weeks,
    baseline: baselineOf(weeks, total)
  };
  return { ...result, digest: digestOf(result) };
}

// Upprepade misstag: nycklar med minst 2 rader på 30 dagar (rader = { key, date }).
export function repeatedLessonKeys(lessons, now = new Date(), { rows = 2, days = 30 } = {}) {
  const nowMs = new Date(now).getTime();
  const counts = {};
  for (const lesson of lessons) {
    const at = Date.parse(`${lesson.date}T12:00:00Z`);
    if (!Number.isFinite(at) || nowMs - at > days * DAY_MS || at > nowMs + DAY_MS) continue;
    counts[lesson.key] = (counts[lesson.key] || 0) + 1;
  }
  return Object.keys(counts).filter((key) => counts[key] >= rows).sort();
}

// Ögonblicksbild som observationer med source_kind metric ({week, name, value, baseline}).
export function snapshotObservations({ week, summary, baseline, repeatedKeys = null, now = new Date() }) {
  const values = [
    ['autonomous_verified', summary.autonomous_verified, baseline?.autonomous_verified_per_week ?? null],
    ['sessions', summary.sessions, baseline?.sessions_per_week ?? null],
    ['correction_rate', summary.correction_rate, baseline?.correction_rate ?? null],
    ['memory_usage', summary.memory_usage, baseline?.memory_usage ?? null]
  ];
  if (repeatedKeys) values.push(['repeated_lesson_keys', repeatedKeys.length, baseline?.repeated_lesson_keys ?? null]);
  return values.filter(([, value]) => value !== null).map(([name, value, base]) => makeObservation({
    detector: 'metrics',
    area: 'tools_hub',
    dedupe_key: `metric:${week}:${name}`,
    observed_at: new Date(now).toISOString(),
    source: 'AI Radar – mått (C10)',
    source_kind: 'metric',
    value: `${name} vecka ${week}: ${value}${base === null ? '' : ` (baslinje ${base})`}`,
    verified: true,
    data: { week, name, value, baseline: base }
  }));
}

// Tröskel (b) i C2: minnesanvändningen de senaste 7 dagarna. Observationen skickas dagligen; grouping.mjs
// gör ett harness-jobb när värdet ligger minst 20 procentenheter under baslinjen.
export function memoryWindowObservation({ sessions, baseline, now = new Date(), windowDays = 7 }) {
  const nowMs = new Date(now).getTime();
  const recent = sessions.filter((session) => {
    const at = Date.parse(session.started_at);
    return at <= nowMs && nowMs - at <= windowDays * DAY_MS;
  });
  const summary = summarize(recent);
  if (summary.memory_usage === null || baseline?.memory_usage === null || baseline?.memory_usage === undefined) return null;
  const day = new Date(nowMs).toISOString().slice(0, 10);
  return makeObservation({
    detector: 'metrics',
    area: 'tools_hub',
    dedupe_key: `metric:memory_usage_7d:${day}`,
    observed_at: new Date(nowMs).toISOString(),
    source: 'AI Radar – mått (C10)',
    source_kind: 'metric',
    value: `Andel Golfkuponger-sessioner med Notion-anrop, 7 dagar: ${Math.round(summary.memory_usage * 100)} % (baslinje ${Math.round(baseline.memory_usage * 100)} %, ${summary.gk_sessions} sessioner)`,
    verified: true,
    data: { week: isoWeek(nowMs), name: 'memory_usage_7d', value: summary.memory_usage, baseline: baseline.memory_usage, gk_sessions: summary.gk_sessions, window_days: windowDays }
  });
}
