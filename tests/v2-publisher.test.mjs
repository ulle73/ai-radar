import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { git } from '../scripts/lib/v2/harness/git.mjs';
import { cardOnMain, commitCandidate, commitMessage, publishCard, rollbackCard } from '../scripts/lib/v2/harness/publisher.mjs';
import { write } from './helpers/harness-repo.mjs';

const CARD = { card_id: 'R2-20261102-abcd1234', title: 'Förtydliga Notion först', mistake_ref: 'notion-las-forst' };
const BOT = ['-c', 'user.name=t', '-c', 'user.email=t@example.invalid'];

// Motorklon med en bar fjärr, en arbetsyta (worktree) på radar/<kort> och en kandidatcommit.
async function engine() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'r2-pub-'));
  const remote = path.join(root, 'remote.git');
  const clone = path.join(root, 'clone');
  await git({ cwd: root }, ['init', '--quiet', '--bare', '-b', 'main', remote]);
  await git({ cwd: root }, ['clone', '--quiet', remote, clone]);
  await git({ cwd: clone }, ['checkout', '--quiet', '-b', 'main']);
  write(clone, 'plugins/gk-karna/skills/gk-arbetssatt/SKILL.md', 'regler\n');
  await git({ cwd: clone }, ['add', '-A']);
  await git({ cwd: clone }, [...BOT, 'commit', '--quiet', '-m', 'bas']);
  await git({ cwd: clone }, ['push', '--quiet', 'origin', 'main']);
  await git({ cwd: clone }, ['fetch', '--quiet', 'origin']);
  const base = await git({ cwd: clone }, ['rev-parse', 'origin/main']);
  const dir = path.join(root, 'work', CARD.card_id);
  await git({ cwd: clone }, ['worktree', 'add', '--quiet', '-B', `radar/${CARD.card_id}`, dir, 'origin/main']);
  write(dir, 'plugins/gk-karna/skills/gk-arbetssatt/SKILL.md', 'regler\nny regel\n');
  const location = { gitDir: path.join(clone, '.git', 'worktrees', CARD.card_id), workTree: dir };
  await git(location, ['add', '-A']);
  return { root, remote, clone, dir, base, location, branch: `radar/${CARD.card_id}`, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test('kandidaten committas med trailern Radar-Card via explicita git-flaggor', async () => {
  const e = await engine();
  try {
    const sha = await commitCandidate(e.location, CARD);
    assert.match(sha, /^[0-9a-f]{40}$/);
    assert.match(await git(e.location, ['log', '-1', '--format=%B']), /Radar-Card: R2-20261102-abcd1234/);
    assert.match(commitMessage(CARD), /^harness: Förtydliga Notion först\n\nmistake_ref: notion-las-forst\n\nRadar-Card: /);
  } finally {
    e.cleanup();
  }
});

test('compare-and-swap: om origin/main har flyttats anropas inte hub.py och kortet provas nästa natt', async () => {
  const e = await engine();
  try {
    await commitCandidate(e.location, CARD);
    const other = path.join(e.root, 'other');
    await git({ cwd: e.root }, ['clone', '--quiet', e.remote, other]);
    write(other, 'README.md', 'annan');
    await git({ cwd: other }, ['add', '-A']);
    await git({ cwd: other }, [...BOT, 'commit', '--quiet', '-m', 'annan']);
    await git({ cwd: other }, ['push', '--quiet', 'origin', 'HEAD:main']);
    let called = false;
    const result = await publishCard({ clone: e.clone, cardId: CARD.card_id, base: e.base, branch: e.branch, trustedDir: 'T', run: async () => { called = true; return { code: 0, stdout: '{}' }; } });
    assert.equal(result.ok, false);
    assert.equal(result.retry, true);
    assert.equal(called, false);
  } finally {
    e.cleanup();
  }
});

test('publicering: klonen pekar på kandidaten och hub.py publish --card anropas från betrodd utcheckning', async () => {
  const e = await engine();
  try {
    const sha = await commitCandidate(e.location, CARD);
    const calls = [];
    const result = await publishCard({
      clone: e.clone, cardId: CARD.card_id, base: e.base, branch: e.branch, trustedDir: 'C:\\trusted', python: 'py',
      run: async (command, args) => {
        calls.push({ command, args, head: await git({ cwd: e.clone }, ['rev-parse', 'HEAD']) });
        return { code: 0, stdout: `${JSON.stringify({ ok: true, commit: sha, head: 'h', versions: { 'gk-karna': '1.0.4' } })}\n`, stderr: '' };
      }
    });
    assert.deepEqual(result, { ok: true, version: '1.0.4', commit: sha, head: 'h', already: false });
    assert.equal(calls[0].command, 'py');
    assert.deepEqual(calls[0].args, ['-I', path.join('C:\\trusted', 'hub', 'hub.py'), 'publish', '--card', CARD.card_id, '--root', e.clone]);
    assert.equal(calls[0].head, sha, 'klonens HEAD är exakt kandidatens commit');
  } finally {
    e.cleanup();
  }
});

test('idempotens: en commit med trailern på main hittas, och hub.py svarar already_published utan ny commit', async () => {
  const e = await engine();
  try {
    await commitCandidate(e.location, CARD);
    await git({ cwd: e.clone }, ['push', '--quiet', 'origin', `${e.branch}:main`]);
    await git({ cwd: e.clone }, ['fetch', '--quiet', 'origin']);
    assert.match(await cardOnMain(e.clone, CARD.card_id), /^[0-9a-f]{40}$/);
    assert.equal(await cardOnMain(e.clone, 'R2-20261102-ffffffff'), null);
    // main har flyttats (kortets commit ligger där), men eftersom kortet redan är publicerat går anropet vidare.
    const result = await publishCard({
      clone: e.clone, cardId: CARD.card_id, base: e.base, branch: e.branch, trustedDir: 'T',
      run: async () => ({ code: 0, stdout: JSON.stringify({ ok: true, already_published: true, commit: 'c', version: '1.0.4' }) })
    });
    assert.equal(result.ok, true);
    assert.equal(result.already, true);
  } finally {
    e.cleanup();
  }
});

test('push som avvisas ger retry; återställning skiljer konflikt från andra fel', async () => {
  const e = await engine();
  try {
    await commitCandidate(e.location, CARD);
    const rejected = await publishCard({ clone: e.clone, cardId: CARD.card_id, base: e.base, branch: e.branch, trustedDir: 'T', run: async () => ({ code: 3, stdout: JSON.stringify({ ok: false, error: 'push avvisades', retry: true }) }) });
    assert.deepEqual([rejected.ok, rejected.retry], [false, true]);
    const conflict = await rollbackCard({ clone: e.clone, cardId: CARD.card_id, trustedDir: 'T', run: async () => ({ code: 4, stdout: JSON.stringify({ ok: false, conflict: true, error: 'revert gav konflikt' }) }) });
    assert.deepEqual([conflict.ok, conflict.conflict], [false, true]);
    const ok = await rollbackCard({ clone: e.clone, cardId: CARD.card_id, trustedDir: 'T', run: async () => ({ code: 0, stdout: JSON.stringify({ ok: true, versions: { 'gk-karna': '1.0.5' } }) }) });
    assert.deepEqual(ok, { ok: true, version: '1.0.5', already: false });
  } finally {
    e.cleanup();
  }
});
