function keyOf(repo) {
  return String(repo || '').toLowerCase();
}

export function upsertCatalog(existingCatalog, assessments, date) {
  const catalog = existingCatalog && typeof existingCatalog === 'object'
    ? structuredClone(existingCatalog)
    : { version: 1, updated_at: date, repos: {} };
  catalog.version = 1;
  catalog.updated_at = date;
  catalog.repos ||= {};
  for (const assessment of assessments) {
    const key = keyOf(assessment.repo);
    const previous = catalog.repos[key] || {};
    catalog.repos[key] = {
      ...previous,
      ...assessment,
      repo: assessment.repo,
      first_seen: previous.first_seen || date,
      last_seen: date,
      first_recommended: previous.first_recommended || (assessment.score >= 55 ? date : null),
      last_analyzed: date,
      notified_at: previous.notified_at || null,
      notified_score: previous.notified_score ?? null
    };
  }
  return catalog;
}

export function capRankingActions(entries, limits = { testaNu: 5, spara: 10 }) {
  let testaNu = 0;
  let spara = 0;
  return [...entries].sort((a, b) => b.score - a.score || a.repo.localeCompare(b.repo)).map((entry) => {
    let action = entry.action;
    if (action === 'Testa nu') {
      if (testaNu < limits.testaNu) testaNu += 1;
      else if (spara < limits.spara) {
        action = 'Spara för senare';
        spara += 1;
      } else action = 'Bevaka';
    } else if (action === 'Spara för senare') {
      if (spara < limits.spara) spara += 1;
      else action = 'Bevaka';
    }
    return { ...entry, action };
  });
}

export function buildAllTimeRanking(catalog) {
  const entries = Object.values(catalog?.repos || {}).filter((entry) => Number(entry.score) >= 55 && entry.status !== 'rejected');
  return capRankingActions(entries);
}

function makeNotification(assessment, date, kind) {
  const primary = assessment.project_matches?.[0];
  return {
    repo: assessment.repo,
    url: assessment.url,
    score: assessment.score,
    action: assessment.action,
    summary_sv: assessment.summary_sv,
    project: primary?.project || 'Okänd match',
    fit_reason: primary?.reason || '',
    created_at: date,
    kind
  };
}

export function buildNotifications({ assessments, previousCatalog, historicalSeen, existingPending = [], date, minScore = 82 }) {
  const pendingByRepo = new Map(existingPending.map((item) => [keyOf(item.repo), item]));
  const newNotifications = [];
  for (const assessment of assessments) {
    const key = keyOf(assessment.repo);
    const previous = previousCatalog?.repos?.[key];
    const hasProjectMatch = Array.isArray(assessment.project_matches) && assessment.project_matches.length > 0;
    const strongAction = assessment.action === 'Testa nu' || assessment.action === 'Spara för senare';
    const newToHistory = !historicalSeen.has(key);
    const improvedEnough = previous?.notified_score != null && assessment.score >= previous.notified_score + 10;
    const eligible = assessment.analysis_mode === 'model' && assessment.score >= minScore && strongAction && hasProjectMatch && (newToHistory || improvedEnough);
    if (!eligible || pendingByRepo.has(key)) continue;
    const notification = makeNotification(assessment, date, improvedEnough ? 'score_increase' : 'new_repo');
    pendingByRepo.set(key, notification);
    newNotifications.push(notification);
  }
  return { pending: [...pendingByRepo.values()].sort((a, b) => b.score - a.score), newNotifications };
}
