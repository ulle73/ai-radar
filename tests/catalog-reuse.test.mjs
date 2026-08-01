import test from 'node:test';
import assert from 'node:assert/strict';
import { upsertCatalog } from '../scripts/lib/catalog.mjs';

test('reused assessments keep their original last_analyzed date', () => {
  const existing = {
    version: 1,
    repos: {
      'acme/tool': {
        repo: 'acme/tool',
        score: 80,
        action: 'Spara för senare',
        first_seen: '2026-07-01',
        last_seen: '2026-07-31',
        last_analyzed: '2026-07-20'
      }
    }
  };

  const reused = {
    ...existing.repos['acme/tool'],
    stars: 1200
  };

  const updated = upsertCatalog(existing, [reused], '2026-08-01');
  assert.equal(updated.repos['acme/tool'].last_analyzed, '2026-07-20');
  assert.equal(updated.repos['acme/tool'].last_seen, '2026-08-01');
});
