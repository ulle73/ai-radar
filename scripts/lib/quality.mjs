const QUALITY_THRESHOLDS = Object.freeze({
  ranking: {
    score: 78,
    confidence: 0.72,
    projectFit: 23,
    concreteValue: 13,
    testability: 7
  },
  exceptional: {
    score: 86,
    confidence: 0.82
  },
  notification: {
    score: 88,
    confidence: 0.85,
    projectFit: 25,
    concreteValue: 15
  }
});

function keyOf(value) {
  return String(value || '').trim().toLowerCase();
}

function validText(value) {
  return Boolean(String(value || '').trim());
}

function round(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00Z`).getTime();
  const b = new Date(`${dateB}T00:00:00Z`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Infinity;
  return Math.max(0, Math.floor((b - a) / 86400000));
}

function feedbackFor(feedback, repo) {
  return feedback?.[keyOf(repo)] || feedback?.[repo] || null;
}

export function classifyQuality(entry) {
  const failedGates = [];
  const dimensions = entry?.dimensions || {};
  const matches = Array.isArray(entry?.project_matches)
    ? entry.project_matches.filter((match) => validText(match?.project) && validText(match?.reason))
    : [];

  if (entry?.analysis_mode !== 'model') failedGates.push('model_analysis');
  if (Number(entry?.assessment_version) !== 2) failedGates.push('assessment_version');
  if (entry?.match_type !== 'exact') failedGates.push('exact_match');
  if (!matches.length) failedGates.push('project_match');
  if (Number(entry?.confidence) < QUALITY_THRESHOLDS.ranking.confidence) failedGates.push('confidence');
  if (Number(entry?.score) < QUALITY_THRESHOLDS.ranking.score) failedGates.push('score');
  if (Number(dimensions.project_fit) < QUALITY_THRESHOLDS.ranking.projectFit) failedGates.push('project_fit');
  if (Number(dimensions.concrete_value) < QUALITY_THRESHOLDS.ranking.concreteValue) failedGates.push('concrete_value');
  if (Number(dimensions.testability) < QUALITY_THRESHOLDS.ranking.testability) failedGates.push('testability');
  if (!validText(entry?.concrete_use_case)) failedGates.push('concrete_use_case');
  if (!validText(entry?.next_step)) failedGates.push('next_step');
  if (!validText(entry?.differentiator)) failedGates.push('differentiator');
  if (!Array.isArray(entry?.evidence) || !entry.evidence.some(validText)) failedGates.push('evidence');

  if (failedGates.length) return { tier: 'archive', failed_gates: failedGates };
  const exceptional = Number(entry.score) >= QUALITY_THRESHOLDS.exceptional.score
    && Number(entry.confidence) >= QUALITY_THRESHOLDS.exceptional.confidence;
  return { tier: exceptional ? 'exceptional' : 'strong', failed_gates: [] };
}

export function rankingScore(entry, date, feedbackEntry = null) {
  if (feedbackEntry?.status === 'rejected') return null;
  const classification = classifyQuality(entry);
  if (classification.tier === 'archive') return null;

  const protectedStatuses = new Set(['saved', 'testing', 'adopted']);
  let freshnessPenalty = 0;
  if (!protectedStatuses.has(feedbackEntry?.status)) {
    const age = daysBetween(entry?.last_seen || entry?.last_analyzed || entry?.first_seen, date);
    if (age > 90) return null;
    if (age > 60) freshnessPenalty = 7;
    else if (age > 30) freshnessPenalty = 3;
  }

  const confidence = Number(entry?.confidence || 0);
  const confidencePenalty = confidence >= 0.85
    ? 0
    : Math.min(3, Math.max(0, Math.ceil((0.85 - confidence) * 10)));
  const feedbackBonus = feedbackEntry?.status === 'adopted'
    ? 4
    : feedbackEntry?.status === 'testing'
      ? 2
      : feedbackEntry?.status === 'saved'
        ? 1
        : 0;

  return Math.round(Number(entry.score || 0) - freshnessPenalty - confidencePenalty + feedbackBonus);
}

export function eligibleRankingEntries(catalog, date, feedback = {}) {
  const results = [];
  for (const entry of Object.values(catalog?.repos || {})) {
    const feedbackEntry = feedbackFor(feedback, entry.repo);
    const score = rankingScore(entry, date, feedbackEntry);
    if (score == null) continue;
    const quality = classifyQuality(entry);
    results.push({
      ...entry,
      quality_tier: quality.tier,
      ranking_score: score,
      feedback_status: feedbackEntry?.status || 'unreviewed',
      action: quality.tier === 'exceptional' ? 'Testa nu' : 'Spara för senare'
    });
  }
  return results.sort((a, b) => b.ranking_score - a.ranking_score || b.score - a.score || a.repo.localeCompare(b.repo));
}

export function buildStrictRanking(catalog, date, feedback = {}, limits = {}) {
  const categoryLimit = Math.max(1, Number(limits.categoryLimit || 2));
  const totalLimit = Math.max(1, Number(limits.totalLimit || 15));
  const categoryCounts = new Map();
  const ranking = [];

  for (const entry of eligibleRankingEntries(catalog, date, feedback)) {
    const category = keyOf(entry.category) || 'uncategorized';
    const count = categoryCounts.get(category) || 0;
    if (count >= categoryLimit) continue;
    categoryCounts.set(category, count + 1);
    ranking.push(entry);
    if (ranking.length >= totalLimit) break;
  }
  return ranking;
}

export function notificationEligible(entry) {
  const classification = classifyQuality(entry);
  const dimensions = entry?.dimensions || {};
  return classification.tier === 'exceptional'
    && Number(entry?.score) >= QUALITY_THRESHOLDS.notification.score
    && Number(entry?.confidence) >= QUALITY_THRESHOLDS.notification.confidence
    && Number(dimensions.project_fit) >= QUALITY_THRESHOLDS.notification.projectFit
    && Number(dimensions.concrete_value) >= QUALITY_THRESHOLDS.notification.concreteValue;
}

export function buildQualityMetrics(assessments, eligibleBeforeCap, finalRanking) {
  const all = Array.isArray(assessments) ? assessments : [];
  const eligible = Array.isArray(eligibleBeforeCap) ? eligibleBeforeCap : [];
  const final = Array.isArray(finalRanking) ? finalRanking : [];
  const matchTypes = { exact: 0, adjacent: 0, generic: 0, unknown: 0 };
  const excludedByGate = {};

  for (const assessment of all) {
    const matchType = ['exact', 'adjacent', 'generic'].includes(assessment?.match_type)
      ? assessment.match_type
      : 'unknown';
    matchTypes[matchType] += 1;
    for (const gate of classifyQuality(assessment).failed_gates) {
      excludedByGate[gate] = (excludedByGate[gate] || 0) + 1;
    }
  }

  const recommendationRate = all.length ? round(eligible.length / all.length) : 0;
  const categories = new Map();
  for (const entry of eligible) {
    const category = keyOf(entry.category) || 'uncategorized';
    categories.set(category, (categories.get(category) || 0) + 1);
  }
  const largestCategory = eligible.length ? Math.max(...categories.values()) : 0;
  const categoryConcentration = eligible.length ? round(largestCategory / eligible.length) : 0;
  const averageConfidence = all.length
    ? round(all.reduce((sum, item) => sum + Number(item?.confidence || 0), 0) / all.length, 2)
    : 0;
  const rankedAverageConfidence = final.length
    ? round(final.reduce((sum, item) => sum + Number(item?.confidence || 0), 0) / final.length, 2)
    : null;

  const warningReasons = [];
  if (recommendationRate > 0.2) warningReasons.push('recommendation_rate_above_20_percent');
  if (categoryConcentration > 0.5) warningReasons.push('category_concentration_above_50_percent');
  if (rankedAverageConfidence != null && rankedAverageConfidence < 0.78) warningReasons.push('ranked_confidence_below_0_78');

  return {
    quality_status: warningReasons.length ? 'warning' : 'healthy',
    warning_reasons: warningReasons,
    candidates: all.length,
    eligible_before_diversity_cap: eligible.length,
    final_ranking_size: final.length,
    recommendation_rate: recommendationRate,
    category_concentration: categoryConcentration,
    average_confidence: averageConfidence,
    ranked_average_confidence: rankedAverageConfidence,
    match_types: matchTypes,
    excluded_by_gate: excludedByGate
  };
}

export { QUALITY_THRESHOLDS };
