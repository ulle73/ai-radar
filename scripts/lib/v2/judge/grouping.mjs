// Grupperar observationer till domarjobb. Flera releaser av samma verktyg bedöms tillsammans
// (en bedömning per verktyg i stället för en per patch), allt annat bedöms var för sig.
// Ordning: larm först, sedan interna fakta (projekt, försäljning), sedan videor och releaser.

const AREA_ORDER = Object.freeze({ projects: 0, sales: 1, social: 2, tools_hub: 3 });

function groupKey(observation) {
  if (observation.detector === 'releases' && observation.data?.repo && observation.dedupe_key.startsWith('release:')) {
    return `release:${observation.data.repo}`;
  }
  // Flera röda flöden i samma repo är ett problem att ta ställning till, inte flera.
  if (observation.dedupe_key.startsWith('red_ci:') && observation.data?.repo) {
    return `red_ci:${observation.data.repo}`;
  }
  // Lärdomsrader med samma nyckel är ett mönster (harness-designen C2): ett jobb per nyckel.
  if (observation.source_kind === 'notion_lesson' && observation.data?.key) {
    return `lesson:${observation.data.key}`;
  }
  if (isMemoryWindow(observation)) return 'memory:usage';
  return observation.dedupe_key;
}

const isMemoryWindow = (observation) => observation.source_kind === 'metric' && observation.data?.name === 'memory_usage_7d';

// Mätdata (C10) och kvitton bedöms aldrig av domaren: de markeras DIGEST utan modellanrop. Probsvar lämnas
// helt åt probes.mjs, som bedömer dem lokalt (C7). Minnesmåttet för tröskel (b) blir ett jobb (se nedan).
export function splitMeasurements(observations) {
  const measurements = [];
  const judgeable = [];
  for (const observation of observations) {
    if (observation.source_kind === 'probe') continue;
    if (['session_transcript', 'receipt'].includes(observation.source_kind)
      || (observation.source_kind === 'metric' && !isMemoryWindow(observation))) measurements.push(observation);
    else judgeable.push(observation);
  }
  return { measurements, judgeable };
}

const DAY_MS = 86400000;
const LESSON_THRESHOLD = Object.freeze({ rows: 3, days: 14 });
// Etapp 1b, tröskel (b): andelen Golfkuponger-sessioner med Notion-anrop de senaste 7 dagarna ligger minst
// 20 procentenheter under baslinjen, med minst 5 sessioner i fönstret (config/v2/metrics.json memory_threshold).
const MEMORY_THRESHOLD = Object.freeze({ drop: 0.2, window_days: 7, min_sessions: 5, mistake_ref: 'notion-anvands-inte' });

export function memoryBreach(observation, threshold = MEMORY_THRESHOLD) {
  const data = observation?.data || {};
  const value = Number(data.value);
  const baseline = Number(data.baseline);
  if (!Number.isFinite(value) || !Number.isFinite(baseline)) return false;
  return Number(data.gk_sessions) >= threshold.min_sessions && baseline - value >= threshold.drop - 1e-9;
}

// Etapp 1a: en lärdomsnyckel med minst 3 rader på 14 dagar blir ett jobb (ett harness-kort).
// Färre rader: inget jobb, observationerna står kvar som NEW tills fler rader kommer.
export function lessonRowsInWindow(list, now = new Date(), threshold = LESSON_THRESHOLD) {
  const nowMs = new Date(now).getTime();
  return list.filter((item) => {
    const at = Date.parse(item.data?.date || item.observed_at);
    return Number.isFinite(at) && nowMs - at <= threshold.days * DAY_MS && at <= nowMs + DAY_MS;
  });
}

export { MEMORY_THRESHOLD };

export function groupObservations(observations, { maxObservationsPerJob = 10, now = new Date(), lessonThreshold = LESSON_THRESHOLD, memoryThreshold = MEMORY_THRESHOLD } = {}) {
  const groups = new Map();
  for (const observation of observations) {
    const key = groupKey(observation);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(observation);
  }

  const jobs = [];
  for (const [key, list] of groups.entries()) {
    const sorted = [...list].sort((a, b) => Date.parse(b.observed_at) - Date.parse(a.observed_at));
    const job = {
      key,
      detector: sorted[0].detector,
      area: sorted[0].area,
      alert: sorted.some((item) => item.alert_trigger),
      observations: sorted.slice(0, maxObservationsPerJob),
      // Observationer som inte får plats i jobbet markeras ändå som bedömda tillsammans med det.
      all_observation_ids: sorted.map((item) => item.observation_id),
      oldest: Math.min(...sorted.map((item) => Date.parse(item.observed_at)))
    };
    if (key.startsWith('lesson:')) {
      const recent = lessonRowsInWindow(sorted, now, lessonThreshold);
      if (recent.length < lessonThreshold.rows) continue;
      job.harness = { kind: 'lesson', mistake_ref: key.slice('lesson:'.length), rows: recent.length, days: lessonThreshold.days };
    }
    if (key === 'memory:usage') {
      // Bara det senaste dygnets mått räknas; äldre följer med som belägg och markeras bedömda.
      const latest = sorted[0];
      if (!memoryBreach(latest, memoryThreshold)) continue;
      job.harness = {
        kind: 'memory',
        mistake_ref: memoryThreshold.mistake_ref,
        value: Number(latest.data.value),
        baseline: Number(latest.data.baseline),
        rows: Number(latest.data.gk_sessions),
        days: memoryThreshold.window_days
      };
    }
    jobs.push(job);
  }

  return jobs.sort((a, b) =>
    Number(b.alert) - Number(a.alert)
    || (AREA_ORDER[a.area] ?? 9) - (AREA_ORDER[b.area] ?? 9)
    || a.oldest - b.oldest
    || a.key.localeCompare(b.key));
}
