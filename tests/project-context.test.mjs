import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXPECTED_PROJECT_IDS,
  loadAnalysisContext,
  renderProjectCatalog,
  validateProjectCatalog
} from '../scripts/lib/project-context.mjs';

const repositoryRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

async function readCatalog(root = repositoryRoot) {
  const value = await readFile(path.join(root, 'projects/catalog.json'), 'utf8');
  return JSON.parse(value);
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('canonical catalog contains exactly the nine approved project profiles', async () => {
  const catalog = await readCatalog();
  const ids = [...catalog.projects].sort((a, b) => a.priority - b.priority).map((project) => project.id);

  assert.deepEqual(ids, EXPECTED_PROJECT_IDS);
  assert.deepEqual(validateProjectCatalog(catalog), []);
});

test('project profiles preserve the business decisions made for Golfkuponger, Apify Scraper and Sankdig', async () => {
  const catalog = await readCatalog();
  const byId = Object.fromEntries(catalog.projects.map((project) => [project.id, project]));

  assert.match(byId.golfkuponger.technical_stack.join(' '), /Shopify/i);
  assert.match(byId.golfkuponger.north_star, /intäkt/i);
  assert.ok(byId.golfkuponger.growth_levers.some((value) => /företag|B2B/i.test(value)));

  assert.equal(byId['apify-scraper'].business_model, 'Extern kundbetald SaaS med credits, usage-baserad prissättning och möjlig abonnemangsintäkt.');
  assert.ok(byId['apify-scraper'].exact_match_requirements.some((value) => /betalande/i.test(value)));

  assert.ok(byId.sankdig.high_value_matches.some((value) => /golfämnen/i.test(value)));
  assert.ok(byId.sankdig.high_value_matches.some((value) => /datakällor/i.test(value)));
});

test('rendered project context includes every display name and exact-match rules', async () => {
  const catalog = await readCatalog();
  const rendered = renderProjectCatalog(catalog);

  for (const project of catalog.projects) {
    assert.match(rendered, new RegExp(project.display_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(rendered, /gemensam teknik eller ämnesord räcker inte/i);
  assert.match(rendered, /namngivet problem|befintligt arbetsflöde|tillväxtmotor/i);
});

test('real production context fits the default budget and includes every project', async () => {
  const catalog = await readCatalog();
  const context = await loadAnalysisContext({ root: repositoryRoot, maxChars: 70000 });

  assert.ok(context.length <= 70000);
  for (const project of catalog.projects) {
    assert.match(context, new RegExp(project.display_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('analysis context keeps mandatory project context and truncates optional idea context first', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ai-radar-project-context-'));
  const catalog = await readCatalog();

  await writeFile(path.join(root, 'GOALS.md'), '# Goals\nMatcha endast mot den kanoniska projektkatalogen.\n', 'utf8');
  await writeJson(path.join(root, 'projects/catalog.json'), catalog);
  await mkdir(path.join(root, 'ideas'), { recursive: true });
  await writeFile(path.join(root, 'ideas/noise.md'), `# Optional noise\n${'x'.repeat(20000)}\n`, 'utf8');

  const renderedCatalog = renderProjectCatalog(catalog);
  const maxChars = renderedCatalog.length + 500;
  const context = await loadAnalysisContext({ root, maxChars });

  for (const project of catalog.projects) {
    assert.match(context, new RegExp(project.display_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.ok(context.length <= maxChars);
  assert.doesNotMatch(context, /x{1000}/);
});

test('invalid or incomplete catalogs fail clearly instead of silently dropping projects', async () => {
  const catalog = await readCatalog();
  const invalid = structuredClone(catalog);
  invalid.projects = invalid.projects.filter((project) => project.id !== 'golfkuponger');
  invalid.projects[1].id = invalid.projects[0].id;

  const errors = validateProjectCatalog(invalid);
  assert.ok(errors.some((error) => /golfkuponger/i.test(error)));
  assert.ok(errors.some((error) => /duplicate project id/i.test(error)));

  const root = await mkdtemp(path.join(os.tmpdir(), 'ai-radar-invalid-context-'));
  await writeFile(path.join(root, 'GOALS.md'), '# Goals\n', 'utf8');
  await writeJson(path.join(root, 'projects/catalog.json'), invalid);

  await assert.rejects(
    () => loadAnalysisContext({ root, maxChars: 100000 }),
    /Invalid projects\/catalog\.json/
  );
});
