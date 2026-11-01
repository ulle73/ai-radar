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
  return observation.dedupe_key;
}

const DAY_MS = 86400000;
const LESSON_THRESHOLD = Object.freeze({ rows: 3, days: 14 });

// Etapp 1a: en lärdomsnyckel med minst 3 rader på 14 dagar blir ett jobb (ett harness-kort).
// Färre rader: inget jobb, observationerna står kvar som NEW tills fler rader kommer.
export function lessonRowsInWindow(list, now = new Date(), threshold = LESSON_THRESHOLD) {
  const nowMs = new Date(now).getTime();
  return list.filter((item) => {
    const at = Date.parse(item.data?.date || item.observed_at);
    return Number.isFinite(at) && nowMs - at <= threshold.days * DAY_MS && at <= nowMs + DAY_MS;
  });
}

export function groupObservations(observations, { maxObservationsPerJob = 10, now = new Date(), lessonThreshold = LESSON_THRESHOLD } = {}) {
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
      job.harness = { mistake_ref: key.slice('lesson:'.length), rows: recent.length, days: lessonThreshold.days };
    }
    jobs.push(job);
  }

  return jobs.sort((a, b) =>
    Number(b.alert) - Number(a.alert)
    || (AREA_ORDER[a.area] ?? 9) - (AREA_ORDER[b.area] ?? 9)
    || a.oldest - b.oldest
    || a.key.localeCompare(b.key));
}
