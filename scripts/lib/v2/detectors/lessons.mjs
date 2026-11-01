// Lärdomsrader i Notion (harness-designen C1.2). Läser markdown från sidor i Company Knowledge och Growth Log
// som R2 – Data Feed hämtat med want: ['lessons'], och gör en observation per lärdomsrad. Ingen AI.
//
// Format (gk-arbetssatt, skyddad sektion): - Lärdom [<nyckel>]: <text> (<YYYY-MM-DD>, <agent>, <källa>)
// Notions markdown kan escapa hakparenteser (\[ \]) och skriva datum som <date start="…" />; båda hanteras.
// Rader där agenten är R2 (motorn själv) filtreras bort, så att motorn inte läser sina egna rader.

import { createHash } from 'node:crypto';
import { makeObservation } from '../observation.mjs';

const LESSON = /^\s*(?:[-*•]|\d+\.)\s+Lärdom\s*\\?\[([a-z0-9]+(?:-[a-z0-9]+)*)\\?\]\s*:\s*(.+?)\s*\((\d{4}-\d{2}-\d{2})\s*,\s*([^,()]+?)\s*,\s*([^()]+?)\)\s*$/u;
const SELF_AGENTS = Object.freeze(['r2', 'ai radar', 'ai-radar', 'motorn', 'gk-motor']);
const MAX_TEXT = 400;

function normalizeLine(line) {
  return String(line)
    .normalize('NFKC')
    .replace(/<date\s+start="(\d{4}-\d{2}-\d{2})[^"]*"[^>]*\/?>/g, '$1')
    .replace(/<\/?(?:b|i|u|code|strong|em)>/g, '')
    .replace(/\*\*/g, '');
}

export function parseLessonLine(line) {
  const match = normalizeLine(line).match(LESSON);
  if (!match) return null;
  const [, key, text, date, agent, source] = match;
  if (key.length < 3 || key.length > 48) return null;
  if (!Number.isFinite(Date.parse(`${date}T00:00:00Z`))) return null;
  return { key, text: text.trim(), date, agent: agent.trim(), source: source.trim() };
}

export function isSelfAgent(agent) {
  return SELF_AGENTS.includes(String(agent || '').trim().toLowerCase());
}

export function textHash(pageId, lesson) {
  return createHash('sha1').update(`${pageId}|${lesson.key}|${lesson.date}|${lesson.text}`).digest('hex').slice(0, 12);
}

export function extractLessons(page) {
  const lessons = [];
  for (const line of String(page?.markdown || '').split(/\r?\n/)) {
    const lesson = parseLessonLine(line);
    if (lesson && !isSelfAgent(lesson.agent)) lessons.push(lesson);
  }
  return lessons;
}

export function detectLessons({ pages = [], now = new Date(), maxAgeDays = 30 }) {
  const nowMs = new Date(now).getTime();
  const observations = [];
  for (const page of pages) {
    const pageId = String(page?.page_id || '');
    if (!pageId) continue;
    for (const lesson of extractLessons(page)) {
      const at = Date.parse(`${lesson.date}T12:00:00Z`);
      if (nowMs - at > maxAgeDays * 86400000 || at > nowMs + 86400000) continue;
      const hash = textHash(pageId, lesson);
      observations.push(makeObservation({
        detector: 'lessons',
        area: 'tools_hub',
        dedupe_key: `lesson:${lesson.key}:${hash}`,
        observed_at: new Date(Math.min(at, nowMs)).toISOString(),
        source: page.source === 'growth_log' ? 'Notion – Growth Log' : 'Notion – Company Knowledge',
        source_kind: 'notion_lesson',
        value: `Lärdom [${lesson.key}]: ${lesson.text}`.slice(0, MAX_TEXT),
        verified: true,
        anchors: [],
        data: { key: lesson.key, text_hash: hash, date: lesson.date, agent: lesson.agent.slice(0, 40), source: lesson.source.slice(0, 80), page_id: pageId }
      }));
    }
  }
  return observations;
}
