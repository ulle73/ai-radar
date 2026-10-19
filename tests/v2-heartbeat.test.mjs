import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chunk, fetchDataFeed, loadSecrets, postSigned, sendObservations, signBody } from '../scripts/lib/v2/n8n-client.mjs';
import { collectObservations } from '../scripts/lib/v2/heartbeat.mjs';
import { makeObservation } from '../scripts/lib/v2/observation.mjs';

const SECRET = 'a'.repeat(64);

// Samma kontroll som Code-noden "Verify And Normalize Batch" i n8n gör.
function n8nAccepts(headers, raw, secret = SECRET, nowSeconds = Math.floor(Date.now() / 1000)) {
  const timestamp = String(headers['x-r2-timestamp'] || '');
  const signature = String(headers['x-r2-signature'] || '').toLowerCase();
  if (!/^[0-9]{10}$/.test(timestamp) || Math.abs(nowSeconds - Number(timestamp)) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex');
  return /^[0-9a-f]{64}$/.test(signature) && timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}

function fakeFetch(handler) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    const { status, body } = await handler(url, init, calls.length);
    return { status, text: async () => JSON.stringify(body) };
  };
  return { impl, calls };
}

test('signatures verify exactly like the n8n Code node, and tampering is rejected', () => {
  const raw = JSON.stringify({ observations: [] });
  const { timestamp, signature } = signBody(SECRET, raw);
  const headers = { 'x-r2-timestamp': timestamp, 'x-r2-signature': signature };
  assert.equal(n8nAccepts(headers, raw), true);
  assert.equal(n8nAccepts(headers, `${raw} `), false);
  assert.equal(n8nAccepts(headers, raw, 'b'.repeat(64)), false);
  assert.equal(n8nAccepts(headers, raw, SECRET, Number(timestamp) + 301), false);
  assert.throws(() => signBody('kort', raw), /hemlighet/);
});

test('postSigned sends the exact body that was signed', async () => {
  const { impl, calls } = fakeFetch(() => ({ status: 202, body: { ok: true } }));
  const result = await postSigned({ baseUrl: 'https://n8n.example', path: 'r2-observations', secret: SECRET, payload: { a: 1 }, fetchImpl: impl });
  assert.equal(result.status, 202);
  assert.equal(calls[0].url, 'https://n8n.example/webhook/r2-observations');
  assert.equal(n8nAccepts(calls[0].init.headers, calls[0].init.body), true);
});

test('observations are sent in batches of at most 200 and failures surface', async () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  const observations = Array.from({ length: 450 }, (_, i) => makeObservation({
    detector: 'test', area: 'tools_hub', dedupe_key: `k${i}`, observed_at: '2026-10-19T08:00:00Z',
    source: 's', source_kind: 'repo', value: 'v'
  }));
  const { impl, calls } = fakeFetch((url, init) => {
    const count = JSON.parse(init.body).observations.length;
    return { status: 202, body: { ok: true, received: count, valid: count, invalid: 0 } };
  });
  const totals = await sendObservations({ observations, runner: 'test', secrets: { baseUrl: 'https://n8n.example', secret: SECRET }, fetchImpl: impl });
  assert.equal(calls.length, 3);
  assert.deepEqual(totals, { received: 450, valid: 450, invalid: 0 });

  const failing = fakeFetch(() => ({ status: 401, body: { ok: false, error: 'bad_signature' } }));
  await assert.rejects(
    sendObservations({ observations: observations.slice(0, 1), runner: 'test', secrets: { baseUrl: 'https://n8n.example', secret: SECRET }, fetchImpl: failing.impl }),
    /bad_signature/
  );
  await assert.rejects(
    fetchDataFeed({ runner: 'test', secrets: { baseUrl: 'https://n8n.example', secret: SECRET }, fetchImpl: failing.impl }),
    /401/
  );
});

test('secrets come from the environment first, then the local file', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ai-radar-secrets-'));
  try {
    const file = path.join(dir, 'secrets.json');
    await writeFile(file, JSON.stringify({ R2_SIGNING_SECRET: 'f'.repeat(64), R2_N8N_BASE: 'https://local.example/' }));
    assert.deepEqual(loadSecrets({ env: {}, file }), { secret: 'f'.repeat(64), baseUrl: 'https://local.example' });
    assert.equal(loadSecrets({ env: { R2_SIGNING_SECRET: 'e'.repeat(64) }, file }).secret, 'e'.repeat(64));
    assert.throws(() => loadSecrets({ env: {}, file: path.join(dir, 'saknas.json') }), /R2_SIGNING_SECRET/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

const SOURCES = {
  youtube: {
    feed_url_template: 'https://yt.example/{channel_id}',
    channels: [{ name: 'Kanal', handle: 'kanal', channel_id: 'UC1', focus: 'tools_hub' }],
    prefilter: { strong: ['codex'], weak: ['agent'] }
  },
  releases: { github: [{ name: 'Codex CLI', repo: 'openai/codex', anchors: [] }] },
  installed: { tools: [{ repo: 'openai/codex', command: 'codex --version' }] },
  ci: { repos: [{ repo: 'ulle73/ai-radar', public: true }, { repo: 'ulle73/privat', public: false }] }
};

const NOW = new Date('2026-10-19T08:00:00Z');
const RELEASES = [{ tag_name: 'rust-v0.163.0', published_at: '2026-10-15T10:00:00Z', prerelease: false, draft: false, html_url: 'https://github.com/openai/codex/releases/tag/rust-v0.163.0' }];
const FEED = '<feed><entry><yt:videoId>v1</yt:videoId><title>New Codex tricks</title><published>2026-10-18T10:00:00+00:00</published></entry></feed>';
const RED_RUNS = { workflow_runs: [
  { name: 'Tests', conclusion: 'failure', created_at: '2026-10-19T06:00:00Z' },
  { name: 'Tests', conclusion: 'failure', created_at: '2026-10-15T06:00:00Z' }
] };

function fetchers(log) {
  return {
    fetchJson: async (url) => {
      log.push(url);
      if (url.includes('/releases')) return RELEASES;
      if (url.includes('/actions/runs')) return RED_RUNS;
      throw new Error(`oväntad url ${url}`);
    },
    fetchText: async (url) => {
      log.push(url);
      return FEED;
    }
  };
}

test('public mode only touches public sources and never the data feed or local tools', async () => {
  const log = [];
  let feedCalls = 0;
  const { observations, stats } = await collectObservations({
    mode: 'public',
    sources: SOURCES,
    ...fetchers(log),
    dataFeed: async () => { feedCalls += 1; return {}; },
    readInstalled: async () => 'codex-cli 0.146.0',
    now: NOW
  });
  assert.equal(feedCalls, 0);
  assert.ok(!log.some((url) => url.includes('ulle73/privat')));
  assert.deepEqual(observations.map((item) => item.detector).sort(), ['project_health', 'releases', 'youtube']);
  assert.ok(stats.every((item) => item.ok));
});

test('private mode covers the data feed, local installs and private CI, not public sources', async () => {
  const log = [];
  const rows = Array.from({ length: 8 }, (_, i) => ({
    report_date: new Date(Date.parse('2026-10-18T00:00:00Z') - i * 86400000).toISOString().slice(0, 10),
    order_total: 2000,
    last_year_total: 5000
  }));
  const { observations } = await collectObservations({
    mode: 'private',
    sources: SOURCES,
    ...fetchers(log),
    dataFeed: async () => ({ sales_rows: rows, log_entries: [{ id: 'n1', title: 'Pilot', type: 'Idé', date: '2026-09-01', related: [] }] }),
    readInstalled: async () => 'codex-cli 0.146.0',
    now: NOW
  });
  assert.ok(!log.some((url) => url.startsWith('https://yt.example')));
  assert.ok(!log.some((url) => url.includes('ulle73/ai-radar')));
  const keys = observations.map((item) => item.dedupe_key);
  assert.ok(keys.some((key) => key.startsWith('outdated:openai/codex:0.146.0')));
  assert.ok(keys.some((key) => key.startsWith('sales_drop:')));
  assert.ok(keys.includes('stalled_log:n1'));
  assert.ok(keys.some((key) => key.startsWith('red_ci:ulle73/privat')));
  assert.ok(!keys.some((key) => key.startsWith('release:')), 'releaser rapporteras bara i public-läget');
});

test('one failing source does not stop the others', async () => {
  const { observations, stats } = await collectObservations({
    mode: 'public',
    sources: SOURCES,
    fetchJson: async (url) => { if (url.includes('/releases')) throw new Error('HTTP 503'); return RED_RUNS; },
    fetchText: async () => FEED,
    now: NOW
  });
  const failed = stats.filter((item) => !item.ok);
  assert.deepEqual(failed.map((item) => item.source), ['releases:openai/codex']);
  assert.match(failed[0].error, /503/);
  assert.ok(observations.length >= 2);
});

test('a failing data feed is reported but does not crash private mode', async () => {
  const { stats } = await collectObservations({
    mode: 'private',
    sources: SOURCES,
    ...fetchers([]),
    dataFeed: async () => { throw new Error('data feed svarade 401'); },
    readInstalled: async () => 'codex-cli 0.163.0',
    now: NOW
  });
  assert.equal(stats.find((item) => item.source === 'data_feed').ok, false);
});
