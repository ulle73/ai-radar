import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const EXPECTED_PROJECT_IDS = Object.freeze([
  'golfkuponger',
  'stock-signals',
  'ullebets',
  'nyabolaget-ekosystemet',
  'faiv',
  'ai-radar',
  'sankdig',
  'res-kungen',
  'apify-scraper'
]);

const REQUIRED_TEXT_FIELDS = Object.freeze([
  'id',
  'display_name',
  'notification_tier',
  'status',
  'description',
  'north_star',
  'business_model',
  'telegram_focus'
]);

const REQUIRED_ARRAY_FIELDS = Object.freeze([
  'main_repos',
  'support_repos',
  'aliases',
  'target_users',
  'current_capabilities',
  'core_workflows',
  'current_needs',
  'growth_levers',
  'technical_stack',
  'high_value_matches',
  'discovery_keywords',
  'negative_matches',
  'exact_match_requirements'
]);

function text(value) {
  return String(value ?? '').trim();
}

async function readText(root, relativePath, fallback = '') {
  try {
    return await readFile(path.join(root, relativePath), 'utf8');
  } catch {
    return fallback;
  }
}

async function readRequiredJson(root, relativePath) {
  let raw;
  try {
    raw = await readFile(path.join(root, relativePath), 'utf8');
  } catch (error) {
    throw new Error(`Missing required ${relativePath}: ${error.message}`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${relativePath}: ${error.message}`);
  }
}

async function readMarkdownFiles(root, relativeDir) {
  try {
    const absoluteDir = path.join(root, relativeDir);
    const entries = await readdir(absoluteDir, { withFileTypes: true });
    const chunks = [];
    for (const entry of entries
      .filter((item) => item.isFile() && item.name.endsWith('.md'))
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const relativePath = path.posix.join(relativeDir.replaceAll('\\', '/'), entry.name);
      const content = await readText(root, relativePath);
      if (content.trim()) chunks.push(`--- ${relativePath} ---\n${content.trim()}`);
    }
    return chunks;
  } catch {
    return [];
  }
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

export function validateProjectCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) {
    return ['catalog must be an object'];
  }

  if (!Number.isInteger(catalog.version) || catalog.version < 1) {
    errors.push('version must be a positive integer');
  }
  if (!catalog.matching_policy || typeof catalog.matching_policy !== 'object') {
    errors.push('matching_policy must be an object');
  }
  if (!Array.isArray(catalog.projects) || catalog.projects.length === 0) {
    errors.push('projects must be a non-empty array');
    return errors;
  }

  const ids = [];
  const names = [];
  const priorities = [];

  for (const [index, project] of catalog.projects.entries()) {
    const label = `projects[${index}]`;
    if (!project || typeof project !== 'object' || Array.isArray(project)) {
      errors.push(`${label} must be an object`);
      continue;
    }

    for (const field of REQUIRED_TEXT_FIELDS) {
      if (!text(project[field])) errors.push(`${label}.${field} is required`);
    }
    for (const field of REQUIRED_ARRAY_FIELDS) {
      if (!Array.isArray(project[field])) {
        errors.push(`${label}.${field} must be an array`);
      } else if (field !== 'main_repos' && field !== 'support_repos' && project[field].length === 0) {
        errors.push(`${label}.${field} must not be empty`);
      }
    }

    if (!Number.isInteger(project.priority) || project.priority < 1) {
      errors.push(`${label}.priority must be a positive integer`);
    }
    if (!['primary', 'strict'].includes(project.notification_tier)) {
      errors.push(`${label}.notification_tier must be primary or strict`);
    }

    ids.push(text(project.id));
    names.push(text(project.display_name).toLowerCase());
    priorities.push(project.priority);
  }

  for (const duplicate of duplicateValues(ids)) errors.push(`duplicate project id: ${duplicate}`);
  for (const duplicate of duplicateValues(names)) errors.push(`duplicate display_name: ${duplicate}`);
  for (const duplicate of duplicateValues(priorities)) errors.push(`duplicate priority: ${duplicate}`);

  const idSet = new Set(ids);
  for (const expectedId of EXPECTED_PROJECT_IDS) {
    if (!idSet.has(expectedId)) errors.push(`missing required project id: ${expectedId}`);
  }
  for (const actualId of idSet) {
    if (!EXPECTED_PROJECT_IDS.includes(actualId)) errors.push(`unexpected project id: ${actualId}`);
  }
  if (catalog.projects.length !== EXPECTED_PROJECT_IDS.length) {
    errors.push(`projects must contain exactly ${EXPECTED_PROJECT_IDS.length} profiles`);
  }

  return errors;
}

export async function loadProjectCatalog(root = process.cwd()) {
  const catalog = await readRequiredJson(root, 'projects/catalog.json');
  const errors = validateProjectCatalog(catalog);
  if (errors.length) throw new Error(`Invalid projects/catalog.json: ${errors.join('; ')}`);
  return catalog;
}

export function renderProjectCatalog(catalog) {
  const errors = validateProjectCatalog(catalog);
  if (errors.length) throw new Error(`Invalid projects/catalog.json: ${errors.join('; ')}`);

  const projects = [...catalog.projects].sort((a, b) => a.priority - b.priority);
  const rendered = {
    instructions: {
      purpose: catalog.matching_policy.purpose,
      exact_match_rule: catalog.matching_policy.exact_match_rule,
      avoid_rule: catalog.matching_policy.avoid_rule,
      project_name_rule: catalog.matching_policy.project_name_rule,
      notification_rule: catalog.matching_policy.notification_rule,
      reminder: 'Gemensam teknik eller ämnesord räcker inte. Knyt varje exact-match till ett namngivet problem, befintligt arbetsflöde, definierad tillväxtmotor eller konkret utvecklingsarbete.'
    },
    projects
  };

  return JSON.stringify(rendered, null, 2);
}

function appendWithinBudget(base, chunks, maxChars) {
  let result = base;
  for (const chunk of chunks) {
    const separator = result ? '\n\n' : '';
    const remaining = maxChars - result.length - separator.length;
    if (remaining <= 0) break;
    if (chunk.length <= remaining) {
      result += `${separator}${chunk}`;
      continue;
    }
    const marker = '\n[OPTIONAL CONTEXT TRUNCATED]';
    if (remaining > marker.length + 20) {
      result += `${separator}${chunk.slice(0, remaining - marker.length)}${marker}`;
    }
    break;
  }
  return result;
}

export async function loadAnalysisContext({ root = process.cwd(), maxChars = 70000, catalog = null } = {}) {
  if (!Number.isInteger(maxChars) || maxChars < 1000) {
    throw new Error('maxChars must be an integer of at least 1000');
  }

  const goals = (await readText(root, 'GOALS.md')).trim();
  if (!goals) throw new Error('Missing required GOALS.md');

  const projectCatalog = catalog || await loadProjectCatalog(root);
  const renderedCatalog = renderProjectCatalog(projectCatalog);
  const mandatory = [
    '--- GOALS.md ---',
    goals,
    '--- projects/catalog.json (CANONICAL PROJECT CONTEXT) ---',
    renderedCatalog
  ].join('\n');

  if (mandatory.length > maxChars) {
    throw new Error(`Mandatory project context is ${mandatory.length} characters and exceeds maxChars=${maxChars}`);
  }

  const optionalChunks = [
    ...(await readMarkdownFiles(root, 'ideas')),
    ...(await readMarkdownFiles(root, 'chatgpt-genererade-ideer/candidates'))
  ];

  return appendWithinBudget(mandatory, optionalChunks, maxChars);
}

export { EXPECTED_PROJECT_IDS };
