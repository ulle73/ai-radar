// Små git-repon för harness-testerna (policy, implementer, publisher). Inget nätverk.
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { git } from '../../scripts/lib/v2/harness/git.mjs';

export const TARGET = 'plugins/gk-karna/skills/gk-arbetssatt/SKILL.md';

export const SKILL = [
  '---',
  'name: gk-arbetssatt',
  'description: "Gemensamma arbetsregler."',
  '---',
  '',
  '# Golfkupongers arbetssätt',
  '',
  '## 1. Läs först',
  '',
  '- Sök i Notion innan du svarar.',
  '- Gissa aldrig fakta som går att kontrollera.',
  '',
  '<!-- skyddat:start lardomsformat -->',
  '`- Lärdom [<nyckel>]: <text> (<YYYY-MM-DD>, <agent>, <källa>)`',
  '<!-- skyddat:end -->',
  '',
  '## 2. Spara',
  '',
  '- Spara nya fakta direkt.',
  ''
].join('\n');

export const POLICY = Object.freeze({
  version: 1,
  auto_skills: ['gk-arbetssatt', 'notion-dokumentation'],
  auto_paths: ['plugins/gk-karna/skills/{auto_skill}/SKILL.md'],
  high_consequence_skills: ['golfkuponger-outlook-drafts', 'gk-probe'],
  protected_paths: ['AGENTS.md', 'harness/**', 'hub/**', 'evals/**', '.github/**', '.claude-plugin/**', 'plugins/*/.claude-plugin/**'],
  max_changed_lines: 60,
  max_candidates_per_night: 2,
  removed_prohibition_words: ['aldrig', 'inte', 'måste', 'never', 'must', 'do not'],
  frontmatter_auto_keys: ['description'],
  breaker: { reverts: 2, days: 14 }
});

export function write(root, rel, text) {
  const file = path.join(root, ...rel.split('/'));
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
  return file;
}

export async function makeRepo(files = { [TARGET]: SKILL }) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'r2-harness-'));
  const loc = { cwd: dir };
  await git(loc, ['init', '--quiet', '-b', 'main']);
  for (const [rel, text] of Object.entries(files)) write(dir, rel, text);
  await git(loc, ['add', '-A']);
  await git(loc, ['-c', 'user.name=t', '-c', 'user.email=t@example.invalid', 'commit', '--quiet', '-m', 'bas']);
  const base = await git(loc, ['rev-parse', 'HEAD']);
  return { dir, loc, base, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

// Diffen som C3b ser: arbetsytan mot basen (samma flaggor som publisher.stagedDiff).
export async function diffAfter(repo, changes) {
  for (const [rel, text] of Object.entries(changes)) {
    if (text === null) rmSync(path.join(repo.dir, ...rel.split('/')), { force: true });
    else write(repo.dir, rel, text);
  }
  await git(repo.loc, ['add', '-A']);
  return git(repo.loc, ['diff', '--cached', '--no-ext-diff', '--no-color', '--full-index', '--binary', '--find-renames', repo.base]);
}
