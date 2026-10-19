// Projekt & kod: röd CI som blivit liggande och planer i Notion Log som aldrig följts upp.

import { makeObservation } from '../observation.mjs';

const HOUR_MS = 3600000;
const DAY_MS = 86400000;

// Typer i Notion Log (Golfkuponger – Log) som förväntar sig en uppföljning.
const OPEN_LOG_TYPES = Object.freeze(['Test startat', 'Beslut', 'Idé', 'Ändrad bedömning', 'Återaktiverad']);

export function detectRedCi({ runs, now = new Date(), minRedHours = 48 }) {
  const nowMs = new Date(now).getTime();
  const groups = new Map();
  for (const run of runs) {
    const key = `${run.repo}::${run.workflow}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(run);
  }

  const observations = [];
  for (const group of groups.values()) {
    const sorted = group
      .filter((run) => ['success', 'failure'].includes(run.conclusion))
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    const streak = [];
    for (const run of sorted) {
      if (run.conclusion !== 'failure') break;
      streak.push(run);
    }
    if (streak.length < 2) continue;
    const firstRed = streak.at(-1);
    const redHours = (nowMs - Date.parse(firstRed.created_at)) / HOUR_MS;
    if (redHours < minRedHours) continue;

    const latest = streak[0];
    observations.push(makeObservation({
      detector: 'project_health',
      area: 'projects',
      dedupe_key: `red_ci:${latest.repo}:${latest.workflow}:${firstRed.created_at.slice(0, 10)}`,
      observed_at: now,
      source: `GitHub Actions – ${latest.repo}`,
      source_kind: 'repo',
      url: latest.url || null,
      value: `${latest.workflow} i ${latest.repo} har misslyckats ${streak.length} gånger i rad sedan ${firstRed.created_at.slice(0, 10)}`
        + (latest.failure_reason ? ` (${latest.failure_reason})` : ''),
      anchors: [{ kind: 'repo', ref: latest.repo }],
      data: { repo: latest.repo, workflow: latest.workflow, failures: streak.length, first_failure_at: firstRed.created_at }
    }));
  }
  return observations;
}

function followUpKeys(entry) {
  return [...(entry.related || []), entry.title].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
}

export function detectStalledLog({ entries, now = new Date(), staleDays = 14 }) {
  const nowMs = new Date(now).getTime();
  const observations = [];

  for (const entry of entries) {
    if (!OPEN_LOG_TYPES.includes(entry.type)) continue;
    const entryMs = Date.parse(entry.date);
    if (!Number.isFinite(entryMs) || nowMs - entryMs < staleDays * DAY_MS) continue;

    const keys = followUpKeys(entry);
    const followedUp = entries.some((other) =>
      other !== entry
      && Date.parse(other.date) > entryMs
      && followUpKeys(other).some((key) => keys.includes(key)));
    if (followedUp) continue;

    const days = Math.floor((nowMs - entryMs) / DAY_MS);
    observations.push(makeObservation({
      detector: 'project_health',
      area: 'projects',
      dedupe_key: `stalled_log:${entry.id}`,
      observed_at: now,
      source: 'Notion – Golfkuponger – Log',
      source_kind: 'data',
      url: entry.url || null,
      value: `"${entry.title}" (${entry.type}, ${entry.date.slice(0, 10)}) har ingen uppföljning på ${days} dagar`,
      anchors: entry.notion_id ? [{ kind: 'notion', ref: entry.notion_id }] : [],
      data: { type: entry.type, summary: String(entry.summary || '').slice(0, 500) }
    }));
  }
  return observations;
}

export { OPEN_LOG_TYPES };
