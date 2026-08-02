import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ASSESSMENT_VERSION,
  fallbackAssessment,
  normalizeAssessment,
  parseModelJson,
  validateAssessment
} from './lib/assessment.mjs';
import {
  applyNotificationState,
  buildAllTimeRanking,
  buildNotifications,
  upsertCatalog
} from './lib/catalog.mjs';
import {
  buildQualityMetrics,
  classifyQuality,
  eligibleRankingEntries
} from './lib/quality.mjs';
import { loadAnalysisContext, loadProjectCatalog } from './lib/project-context.mjs';
import { renderAllTimeMarkdown, renderDailyMarkdown, renderNotificationsMarkdown } from './lib/render.mjs';

async function readText(root, relativePath, fallback = '') {
  try { return await readFile(path.join(root, relativePath), 'utf8'); } catch { return fallback; }
}

async function readJson(root, relativePath, fallback) {
  const value = await readText(root, relativePath, '');
  if (!value.trim()) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

async function writeJson(root, relativePath, value) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function writeText(root, relativePath, value) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, value, 'utf8');
}

async function loadHistoricalSeen(root, currentDate) {
  const seen = new Set();
  try {
    const dir = path.join(root, 'data', 'raw');
    const files = (await readdir(dir)).filter((name) => name.endsWith('.json') && name !== `${currentDate}.json`);
    for (const file of files) {
      const payload = await readJson(root, path.posix.join('data/raw', file), { repos: [] });
      for (const repo of payload.repos || []) if (repo?.full_name) seen.add(String(repo.full_name).toLowerCase());
    }
  } catch {}
  return seen;
}

function repoPromptShape(repo) {
  return {
    repo: repo.full_name,
    description: repo.description || '',
    language: repo.language || null,
    topics: repo.topics || [],
    stars: Number(repo.stargazers_count || 0),
    forks: Number(repo.forks_count || 0),
    source_names: repo.source_names || [],
    created_at: repo.created_at || null,
    pushed_at: repo.pushed_at || null,
    readme_excerpt: String(repo.readme_excerpt || '').slice(0, 1800)
  };
}

function buildPrompt(context, repos) {
  return `Du är Jonas extremt selektiva GitHub-radar. Bedöm ENDAST de bifogade repona mot Jonas namngivna mål och aktiva projekt.

Returnera ENDAST ett JSON-array med exakt ett objekt per repo och exakt samma repo-namn.

Schema per objekt:
{
  "repo": "owner/name",
  "summary_sv": "en konkret svensk mening om vad repot faktiskt gör",
  "project_matches": [{"project":"exakt display_name från projects/catalog.json","reason":"konkret orsak-verkan för projektet"}],
  "match_type": "exact | adjacent | generic",
  "category": "kort-stabil-kategori",
  "concrete_use_case": "exakt vad Jonas kan göra i det namngivna projektet",
  "next_step": "ett litet praktiskt test som kan genomföras",
  "differentiator": "vad repot tillför utöver vanliga alternativ eller befintlig stack",
  "evidence": ["1–3 korta fakta från README eller metadata som stöder bedömningen"],
  "dimensions": {
    "project_fit": 0-30,
    "concrete_value": 0-20,
    "testability": 0-15,
    "technical_fit": 0-15,
    "repo_quality": 0-10,
    "timing": 0-10
  },
  "risks": ["kort konkret risk"],
  "confidence": 0-1
}

MATCH_TYPE:
- exact: repot löser ett konkret problem, förbättrar ett befintligt arbetsflöde, möjliggör en definierad tillväxtmotor eller ersätter konkret utvecklingsarbete i ett NAMNGIVET aktivt projekt.
- adjacent: det är relevant för området men nyttan kräver flera antaganden, större ombyggnad eller saknar tydligt aktuellt behov.
- generic: generell AI/agent/devtool-nytta, inspiration eller hype utan unik direkt projektnytta.

HÅRDA REGLER:
- Var mycket skeptisk. De flesta repos ska vara adjacent eller generic.
- project_matches.project måste vara exakt ett display_name som finns i projects/catalog.json. Hitta inte på projektnamn och använd inte repoalias som projektnamn.
- Använd exact endast när concrete_use_case, next_step och differentiator är specifika, stöds av evidence och kan knytas till current_needs, core_workflows, growth_levers eller exact_match_requirements i projektprofilen.
- Gemensam teknik, stack, bransch eller ämnesord räcker aldrig för exact.
- För projekt med notification_tier=strict krävs direkt koppling till ett aktuellt produkt-, publik- eller intäktsmål; allmän framtida potential är adjacent.
- Ord som AI, agent, Codex, automation, memory eller MCP räcker aldrig för exact.
- Många stars påverkar repo_quality men får inte höja project_fit eller concrete_value.
- Om ett repo liknar verktyg Jonas redan använder måste differentiator beskriva en verklig fördel; annars adjacent/generic.
- Ett repo som endast kan vara "bra att känna till" är generic.
- Trading- och bettingverktyg får bara vara transparent och testbar researchinspiration, aldrig obevisad beslutsmotor.
- Max tre project_matches. Använd tom array när ingen konkret match finns.
- Hitta inte på funktioner som inte stöds av README/metadata.
- Inga markdownstaket och ingen förklaring utanför JSON.

JONAS KONTEXT:
${context || 'Ingen extra kontext hittades.'}

REPOS:
${JSON.stringify(repos.map(repoPromptShape), null, 2)}`;
}

async function callOpenRouter({ fetchImpl, apiKey, model, prompt, baseUrl, siteUrl, appName }) {
  const response = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': appName
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Return only valid JSON. Do not include chain of thought or markdown. Be conservative: shared technology is not an exact project match.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.05,
      top_p: 0.75,
      max_tokens: 6500
    })
  });
  const bodyText = await response.text();
  if (!response.ok) throw new Error(`OpenRouter ${response.status}: ${bodyText.slice(0, 500)}`);
  let payload;
  try { payload = JSON.parse(bodyText); } catch { throw new Error(`OpenRouter returned non-JSON envelope: ${bodyText.slice(0, 500)}`); }
  const choice = payload?.choices?.[0];
  const content = choice?.message?.content || choice?.text || payload?.output || '';
  if (!String(content).trim()) throw new Error(`OpenRouter returned no content (finish_reason=${choice?.finish_reason || 'unknown'})`);
  return String(content);
}

function chunk(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00Z`).getTime();
  const b = new Date(`${dateB}T00:00:00Z`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Infinity;
  return Math.floor(Math.abs(b - a) / 86400000);
}

export function shouldAnalyze(repo, previous, date, projectContextVersion = null) {
  if (!previous) return true;
  if (Number(previous.assessment_version) !== ASSESSMENT_VERSION) return true;
  if (Number.isInteger(projectContextVersion) && Number(previous.project_context_version) !== projectContextVersion) return true;
  if (!previous.last_analyzed || daysBetween(previous.last_analyzed, date) >= 14) return true;
  const previousStars = Number(previous.stars || 0);
  const currentStars = Number(repo.stargazers_count || 0);
  return currentStars - previousStars >= Math.max(100, Math.ceil(previousStars * 0.25));
}

async function analyzeRepos({ repos, context, env, fetchImpl, batchSize, allowedProjectNames }) {
  const apiKey = env.OPENROUTER_API_KEY || '';
  const model = env.OPENROUTER_MODEL || '';
  const reasons = [];
  const assessments = [];
  if (!apiKey || !model) {
    reasons.push('OPENROUTER_API_KEY eller OPENROUTER_MODEL saknas; fallback användes för alla nya analyser.');
    return { assessments: repos.map((repo) => fallbackAssessment(repo, 'OpenRouter configuration missing')), reasons, fallbackCount: repos.length, modelCount: 0 };
  }
  let fallbackCount = 0;
  let modelCount = 0;
  for (const batch of chunk(repos, batchSize)) {
    try {
      const content = await callOpenRouter({
        fetchImpl,
        apiKey,
        model,
        prompt: buildPrompt(context, batch),
        baseUrl: env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        siteUrl: env.OPENROUTER_SITE_URL || 'https://github.com/ulle73/ai-radar',
        appName: env.OPENROUTER_APP_NAME || 'Jonas AI Radar'
      });
      const parsed = parseModelJson(content);
      const byRepo = new Map(parsed.map((item) => [String(item?.repo || '').toLowerCase(), item]));
      for (const repo of batch) {
        const raw = byRepo.get(String(repo.full_name).toLowerCase());
        const errors = raw ? validateAssessment(raw, repo.full_name, 'model', allowedProjectNames) : ['missing assessment'];
        if (errors.length) {
          fallbackCount += 1;
          reasons.push(`${repo.full_name}: modellsvaret kunde inte valideras (${errors.join(', ')}).`);
          assessments.push(fallbackAssessment(repo, errors.join(', ')));
        } else {
          modelCount += 1;
          assessments.push(normalizeAssessment(raw, repo, 'model', allowedProjectNames));
        }
      }
    } catch (error) {
      fallbackCount += batch.length;
      reasons.push(`OpenRouter-batch misslyckades: ${error.message}`);
      assessments.push(...batch.map((repo) => fallbackAssessment(repo, error.message)));
    }
  }
  return { assessments, reasons, fallbackCount, modelCount };
}

function enrichQuality(assessment) {
  const quality = classifyQuality(assessment);
  return {
    ...assessment,
    quality_tier: quality.tier,
    failed_quality_gates: quality.failed_gates,
    action: quality.tier === 'exceptional'
      ? 'Testa nu'
      : quality.tier === 'strong'
        ? 'Spara för senare'
        : 'Arkiv'
  };
}

export async function runAnalyzer({ root = process.cwd(), env = process.env, fetchImpl = globalThis.fetch, now = new Date() } = {}) {
  const date = now.toISOString().slice(0, 10);
  const latest = await readJson(root, 'data/latest.json', null);
  if (!latest || !Array.isArray(latest.repos) || latest.repos.length === 0) throw new Error('data/latest.json saknas eller innehåller inga repos. Kör npm run radar först.');
  const currentRepos = latest.repos.filter((repo) => repo?.full_name);
  const previousCatalog = await readJson(root, 'state/repo-catalog.json', { version: 2, repos: {} });
  const feedback = await readJson(root, 'state/feedback.json', {});
  const existingPending = await readJson(root, 'notifications/pending.json', []);
  const historicalSeen = await loadHistoricalSeen(root, date);
  const configuredContextLimit = Number(env.PROJECT_CONTEXT_MAX_CHARS || 70000);
  const projectCatalog = await loadProjectCatalog(root);
  const allowedProjectNames = projectCatalog.projects.map((project) => project.display_name);
  const context = await loadAnalysisContext({
    root,
    maxChars: Number.isInteger(configuredContextLimit) ? configuredContextLimit : 70000,
    catalog: projectCatalog
  });
  const toAnalyze = [];
  const reused = [];
  for (const repo of currentRepos) {
    const previous = previousCatalog.repos?.[String(repo.full_name).toLowerCase()];
    if (shouldAnalyze(repo, previous, date, projectCatalog.version)) toAnalyze.push(repo);
    else reused.push({
      ...previous,
      source_names: repo.source_names || previous.source_names || [],
      stars: Number(repo.stargazers_count || previous.stars || 0),
      language: repo.language || previous.language || null
    });
  }
  const batchSize = Math.max(1, Math.min(10, Number(env.ANALYSIS_BATCH_SIZE || 5)));
  const analyzed = await analyzeRepos({
    repos: toAnalyze,
    context,
    env,
    fetchImpl,
    batchSize,
    allowedProjectNames
  });
  const analyzedWithProjectContext = analyzed.assessments.map((assessment) => ({
    ...assessment,
    project_context_version: projectCatalog.version
  }));
  const dailyAssessments = [...analyzedWithProjectContext, ...reused].map(enrichQuality);
  const notificationResult = buildNotifications({
    assessments: dailyAssessments,
    previousCatalog,
    historicalSeen,
    existingPending: Array.isArray(existingPending) ? existingPending : [],
    date
  });
  const catalog = upsertCatalog(previousCatalog, dailyAssessments, date);
  applyNotificationState(catalog, notificationResult.newNotifications, date);
  const dailyCatalog = {
    repos: Object.fromEntries(dailyAssessments.map((assessment) => [String(assessment.repo).toLowerCase(), assessment]))
  };
  const eligibleTodayBeforeCap = eligibleRankingEntries(dailyCatalog, date, feedback);
  const ranking = buildAllTimeRanking(catalog, date, feedback);
  const quality = buildQualityMetrics(dailyAssessments, eligibleTodayBeforeCap, ranking);
  const status = {
    date,
    generated_at: now.toISOString(),
    status: analyzed.fallbackCount > 0 ? 'degraded' : 'healthy',
    quality_status: quality.quality_status,
    reasons: analyzed.reasons,
    quality_warning_reasons: quality.warning_reasons,
    project_context_version: projectCatalog.version,
    candidates_today: currentRepos.length,
    analyzed_today: toAnalyze.length,
    reused_today: reused.length,
    model_assessments: analyzed.modelCount,
    fallback_assessments: analyzed.fallbackCount,
    exact_matches_today: quality.match_types.exact,
    eligible_before_diversity_cap: quality.eligible_before_diversity_cap,
    ranking_size: ranking.length,
    archive_size_today: dailyAssessments.filter((item) => item.quality_tier === 'archive').length,
    new_notifications: notificationResult.newNotifications.length,
    required_configuration: {
      github_token: 'provided automatically by GitHub Actions',
      openrouter_api_key: Boolean(env.OPENROUTER_API_KEY),
      openrouter_model: env.OPENROUTER_MODEL || null,
      telegram_ready: false
    }
  };
  await writeJson(root, 'state/repo-catalog.json', catalog);
  await writeJson(root, 'rankings/all-time.json', ranking);
  await writeJson(root, 'rankings/latest.json', ranking);
  await writeText(root, 'rankings/all-time.md', renderAllTimeMarkdown(ranking, date));
  await writeText(root, 'rankings/latest.md', renderAllTimeMarkdown(ranking, date));
  await writeJson(root, `rankings/daily/${date}.json`, dailyAssessments);
  await writeText(root, `rankings/daily/${date}.md`, renderDailyMarkdown(dailyAssessments, status));
  await writeJson(root, 'notifications/pending.json', notificationResult.pending);
  await writeText(root, 'notifications/latest.md', renderNotificationsMarkdown(notificationResult.newNotifications, date));
  await writeText(root, `notifications/daily/${date}.md`, renderNotificationsMarkdown(notificationResult.newNotifications, date));
  await writeJson(root, 'status/latest.json', status);
  await writeJson(root, 'status/quality.json', quality);
  return { status, quality, ranking, notifications: notificationResult.newNotifications, catalog };
}

const executedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) {
  runAnalyzer().then(({ status }) => {
    console.log(`AI Radar analysis complete: ${status.status}/${status.quality_status}; ${status.ranking_size} strict matches; ${status.new_notifications} new notifications.`);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
