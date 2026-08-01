const DIMENSION_LIMITS = {
  project_fit: 30,
  concrete_value: 20,
  testability: 15,
  technical_fit: 15,
  repo_quality: 10,
  timing: 10
};

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

export function scoreAssessment(assessment) {
  const dimensions = assessment?.dimensions || {};
  return Object.entries(DIMENSION_LIMITS).reduce((sum, [key, max]) => {
    return sum + clamp(dimensions[key], 0, max);
  }, 0);
}

export function actionForScore(score) {
  if (score >= 85) return 'Testa nu';
  if (score >= 70) return 'Spara för senare';
  if (score >= 55) return 'Bevaka';
  return 'Ignorera';
}

export function parseModelJson(text) {
  const raw = String(text || '').trim();
  if (!raw) throw new Error('Model returned empty content');
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidates = [raw, fenced].filter(Boolean);
  const firstArray = raw.indexOf('[');
  const lastArray = raw.lastIndexOf(']');
  if (firstArray !== -1 && lastArray > firstArray) candidates.push(raw.slice(firstArray, lastArray + 1));
  const firstObject = raw.indexOf('{');
  const lastObject = raw.lastIndexOf('}');
  if (firstObject !== -1 && lastObject > firstObject) candidates.push(raw.slice(firstObject, lastObject + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      return Array.isArray(parsed) ? parsed : Array.isArray(parsed?.assessments) ? parsed.assessments : [parsed];
    } catch {}
  }
  throw new Error('Could not parse JSON from model response');
}

export function validateAssessment(raw, expectedRepo) {
  const errors = [];
  if (!raw || typeof raw !== 'object') return ['assessment must be an object'];
  if (String(raw.repo || '').toLowerCase() !== String(expectedRepo || '').toLowerCase()) errors.push(`repo must equal ${expectedRepo}`);
  if (!String(raw.summary_sv || '').trim()) errors.push('summary_sv is required');
  if (!Array.isArray(raw.project_matches)) errors.push('project_matches must be an array');
  if (!raw.dimensions || typeof raw.dimensions !== 'object') errors.push('dimensions must be an object');
  else {
    for (const [key, max] of Object.entries(DIMENSION_LIMITS)) {
      const value = Number(raw.dimensions[key]);
      if (!Number.isFinite(value) || value < 0 || value > max) errors.push(`${key} must be between 0 and ${max}`);
    }
  }
  if (raw.risks != null && !Array.isArray(raw.risks)) errors.push('risks must be an array');
  const confidence = Number(raw.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) errors.push('confidence must be between 0 and 1');
  return errors;
}

export function normalizeAssessment(raw, repo, analysisMode = 'model') {
  const errors = validateAssessment(raw, repo.full_name);
  if (errors.length) throw new Error(`${repo.full_name}: ${errors.join('; ')}`);
  const dimensions = {};
  for (const [key, max] of Object.entries(DIMENSION_LIMITS)) dimensions[key] = clamp(raw.dimensions[key], 0, max);
  const base = {
    repo: repo.full_name,
    url: repo.html_url || `https://github.com/${repo.full_name}`,
    summary_sv: String(raw.summary_sv).trim(),
    project_matches: raw.project_matches.filter((match) => match && String(match.project || '').trim() && String(match.reason || '').trim()).slice(0, 3).map((match) => ({ project: String(match.project).trim(), reason: String(match.reason).trim() })),
    dimensions,
    risks: Array.isArray(raw.risks) ? raw.risks.map(String).slice(0, 3) : [],
    confidence: clamp(raw.confidence, 0, 1),
    analysis_mode: analysisMode,
    source_names: Array.isArray(repo.source_names) ? repo.source_names : [],
    stars: Number(repo.stargazers_count || 0),
    language: repo.language || null
  };
  base.score = scoreAssessment(base);
  base.action = actionForScore(base.score);
  return base;
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

export function fallbackAssessment(repo, reason = 'fallback') {
  const text = `${repo.full_name || ''} ${repo.description || ''} ${(repo.topics || []).join(' ')} ${repo.readme_excerpt || ''}`.toLowerCase();
  const matches = [];
  let projectFit = 2;
  let concreteValue = 2;
  if (includesAny(text, ['woocommerce', 'wordpress', 'ecommerce', 'e-commerce', 'product image', 'product video', 'video from image', 'marketing creative'])) {
    matches.push({ project: 'FAIV', reason: 'Kan stödja e-handel, produktinnehåll eller kampanjproduktion.' });
    projectFit = Math.max(projectFit, 20);
    concreteValue = Math.max(concreteValue, 11);
  }
  if (includesAny(text, ['agent', 'codex', 'claude', 'mcp', 'memory', 'workflow', 'developer productivity'])) {
    matches.push({ project: 'AI-agent/Codex-workflow', reason: 'Kan förbättra agent- eller utvecklarflöden.' });
    projectFit = Math.max(projectFit, 18);
    concreteValue = Math.max(concreteValue, 9);
  }
  if (includesAny(text, ['scraping', 'crawler', 'lead generation', 'data pipeline', 'etl', 'browser automation'])) {
    matches.push({ project: 'företagslistor/nyabolaget', reason: 'Kan stödja datainsamling eller automatisering.' });
    projectFit = Math.max(projectFit, 18);
    concreteValue = Math.max(concreteValue, 10);
  }
  if (includesAny(text, ['trading', 'market data', 'stock', 'equity', 'indicator'])) {
    matches.push({ project: 'stock-signals', reason: 'Kan vara researchinspiration, inte beslutsmotor.' });
    projectFit = Math.max(projectFit, 12);
    concreteValue = Math.max(concreteValue, 5);
  }
  const technicalFit = ['TypeScript', 'JavaScript'].includes(repo.language) ? 10 : repo.language === 'Python' ? 7 : 3;
  const testability = matches.length ? 8 : 3;
  const stars = Number(repo.stargazers_count || 0);
  const repoQuality = clamp(Math.log10(stars + 1) * 2, 0, 8);
  const sources = repo.source_names || [];
  const timing = sources.includes('GitHub Trending – daily') ? 7 : sources.includes('GitHub Trending – weekly') ? 5 : 2;
  const normalized = normalizeAssessment({
    repo: repo.full_name,
    summary_sv: repo.description || `Repo ${repo.full_name} saknar tydlig beskrivning.`,
    project_matches: matches.slice(0, 3),
    dimensions: { project_fit: projectFit, concrete_value: concreteValue, testability, technical_fit: technicalFit, repo_quality: repoQuality, timing },
    risks: [`Fallbackbedömning användes: ${reason}`],
    confidence: 0.35
  }, repo, 'fallback');
  if (normalized.score >= 82) {
    normalized.dimensions.project_fit = Math.max(0, normalized.dimensions.project_fit - (normalized.score - 81));
    normalized.score = scoreAssessment(normalized);
    normalized.action = actionForScore(normalized.score);
  }
  return normalized;
}

export { DIMENSION_LIMITS };
