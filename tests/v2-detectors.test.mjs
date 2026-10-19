import test from 'node:test';
import assert from 'node:assert/strict';
import { detectReleases, stableReleases } from '../scripts/lib/v2/detectors/releases.mjs';
import { detectRelevantVideos, extractGithubRepos, matchKeywords, parseYoutubeFeed, passesPrefilter } from '../scripts/lib/v2/detectors/youtube.mjs';
import { campaignCue, detectCompetitorCampaigns } from '../scripts/lib/v2/detectors/competitor-campaigns.mjs';
import { detectSalesTrend, isoWeek } from '../scripts/lib/v2/detectors/sales-trend.mjs';
import { detectRedCi, detectStalledLog } from '../scripts/lib/v2/detectors/project-health.mjs';
import { dedupeObservations, makeObservation, toCardObservation } from '../scripts/lib/v2/observation.mjs';
import { evaluateCard } from '../scripts/lib/v2/gates.mjs';
import { BUDGET, NOW, inventory, json, larmCard } from './helpers/v2-fixtures.mjs';

const CODEX = { name: 'Codex CLI', repo: 'openai/codex', anchors: [{ kind: 'skill', ref: 'agent-hub' }] };

function release(tag, published, extra = {}) {
  return {
    tag_name: tag,
    published_at: published,
    prerelease: false,
    draft: false,
    html_url: `https://github.com/openai/codex/releases/tag/${tag}`,
    body: 'Changes',
    ...extra
  };
}

test('releases: only stable, versioned tags count; moving tags and prereleases are ignored', () => {
  const stable = stableReleases([
    release('rust-v0.164.0-alpha.3', '2026-10-17T10:00:00Z', { prerelease: true }),
    release('stable', '2026-10-19T10:00:00Z'),
    release('rust-v0.163.0', '2026-10-15T10:00:00Z'),
    release('rust-v0.162.1', '2026-10-10T10:00:00Z'),
    release('rust-v0.170.0', '2026-10-18T10:00:00Z', { draft: true })
  ]);
  assert.deepEqual(stable.map((item) => item.tag_name), ['rust-v0.163.0', 'rust-v0.162.1']);
});

test('releases: new stable releases become primary-source observations, seen tags do not', () => {
  const observations = detectReleases({
    source: CODEX,
    releases: [release('rust-v0.163.0', '2026-10-15T10:00:00Z'), release('rust-v0.162.1', '2026-10-10T10:00:00Z')],
    seenTags: ['rust-v0.162.1'],
    now: NOW
  });
  assert.equal(observations.length, 1);
  assert.equal(observations[0].source_kind, 'primary');
  assert.equal(observations[0].url, 'https://github.com/openai/codex/releases/tag/rust-v0.163.0');
  assert.match(observations[0].value, /rust-v0\.163\.0/);
});

test('releases: only the latest major line is followed (n8n still ships 1.x patches)', () => {
  const n8n = { name: 'n8n', repo: 'n8n-io/n8n', anchors: [] };
  const observations = detectReleases({
    source: n8n,
    releases: [release('n8n@2.43.8', '2026-10-19T06:00:00Z'), release('n8n@1.123.85', '2026-10-14T06:00:00Z')],
    now: NOW
  });
  assert.deepEqual(observations.map((item) => item.data.tag), ['n8n@2.43.8']);
});

test('releases: an install that is several minor versions behind is reported', () => {
  const observations = detectReleases({
    source: CODEX,
    releases: [release('rust-v0.163.0', '2026-10-15T10:00:00Z')],
    seenTags: ['rust-v0.163.0'],
    installedVersion: 'codex-cli 0.146.0',
    now: NOW
  });
  assert.equal(observations.length, 1);
  assert.match(observations[0].value, /0\.146\.0 är 17 minor-versioner efter/);

  const current = detectReleases({
    source: CODEX,
    releases: [release('rust-v0.163.0', '2026-10-15T10:00:00Z')],
    seenTags: ['rust-v0.163.0'],
    installedVersion: '0.162.0',
    now: NOW
  });
  assert.deepEqual(current, []);
});

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <title>Testkanal</title>
 <entry>
  <yt:videoId>vid0000001</yt:videoId>
  <title>Claude Code skills that replaced my &amp; workflow</title>
  <published>2026-10-18T12:00:00+00:00</published>
  <media:group><media:description>Repo: https://github.com/example/skill-pack. Sponsor: https://github.com/sponsors/someone</media:description></media:group>
 </entry>
 <entry>
  <yt:videoId>vid0000002</yt:videoId>
  <title>My morning routine</title>
  <published>2026-10-18T09:00:00+00:00</published>
  <media:group><media:description>Coffee and a walk.</media:description></media:group>
 </entry>
 <entry>
  <yt:videoId>vid0000003</yt:videoId>
  <title>Old MCP tutorial</title>
  <published>2026-09-01T09:00:00+00:00</published>
  <media:group><media:description>MCP servers</media:description></media:group>
 </entry>
</feed>`;

test('youtube: feed parsing decodes entities and builds watch URLs', () => {
  const entries = parseYoutubeFeed(FEED);
  assert.equal(entries.length, 3);
  assert.equal(entries[0].title, 'Claude Code skills that replaced my & workflow');
  assert.equal(entries[0].url, 'https://www.youtube.com/watch?v=vid0000001');
});

const PREFILTER = { strong: ['claude code', 'skills', 'mcp', 'codex'], weak: ['agent', 'workflow', 'github'] };

test('youtube: only recent, unseen videos that hit the prefilter pass; repos are extracted', () => {
  const channel = { name: 'Testkanal', channel_id: 'UC0000000000000000000000', focus: 'tools_hub' };
  const observations = detectRelevantVideos({ channel, entries: parseYoutubeFeed(FEED), prefilter: PREFILTER, now: NOW });
  assert.equal(observations.length, 1);
  assert.equal(observations[0].source_kind, 'video');
  assert.deepEqual(observations[0].data.repos, ['example/skill-pack']);
  assert.deepEqual(observations[0].data.keywords, ['claude code', 'skills', 'workflow', 'github']);

  const again = detectRelevantVideos({ channel, entries: parseYoutubeFeed(FEED), prefilter: PREFILTER, seenVideoIds: ['vid0000001'], now: NOW });
  assert.deepEqual(again, []);
});

test('youtube: weak words alone never pass; a strong word in the description needs a weak one too', () => {
  const entry = (title, description) => ({ title, description });
  assert.equal(passesPrefilter(entry('AI is literally a scam', 'My agent workflow on github'), PREFILTER).pass, false);
  assert.equal(passesPrefilter(entry('My week', 'I tried codex.'), PREFILTER).pass, false);
  assert.equal(passesPrefilter(entry('My week', 'I tried codex in my agent setup.'), PREFILTER).pass, true);
  assert.equal(passesPrefilter(entry('New MCP servers', ''), PREFILTER).pass, true);
});

test('youtube: keyword matching respects word boundaries', () => {
  assert.deepEqual(matchKeywords('Mastering hooks in agents', ['hook', 'hooks', 'agent']), ['hooks']);
  assert.deepEqual(extractGithubRepos('see github.com/a/b.git and github.com/topics/x'), ['a/b']);
});

const POSTS = [
  { post_id: 'p1', platform: 'instagram', account: 'hagabadet', posted_at: '2026-10-18T18:00:00Z', caption: 'Har du friskvårdsbidrag kvar? Använd det innan årsskiftet!', url: 'https://instagram.com/p/p1', likes: 120, comments: 14 },
  { post_id: 'p2', platform: 'instagram', account: 'cloudgolf', posted_at: '2026-10-12T10:00:00Z', caption: 'TÄVLING! Vinn ett greenfee-paket', likes: 80 },
  { post_id: 'p3', platform: 'tiktok', account: 'standregolf', posted_at: '2026-10-17T10:00:00Z', caption: 'När frugan ger dig en deadline', views: 340000, outperformance: 4.2 },
  { post_id: 'p4', platform: 'instagram', account: 'someclub', posted_at: '2026-10-18T10:00:00Z', caption: 'Vinnarna av klubbmästerskapet', likes: 30 },
  { post_id: 'p5', platform: 'instagram', account: 'oldpost', posted_at: '2026-09-01T10:00:00Z', caption: 'Tävling', likes: 3 }
];

test('social: live campaigns get an alert trigger, older ones do not, and "vinnarna" is not a campaign', () => {
  const observations = detectCompetitorCampaigns({ posts: POSTS, now: NOW });
  const byKey = Object.fromEntries(observations.map((item) => [item.dedupe_key, item]));
  assert.equal(byKey['campaign:instagram:p1'].alert_trigger, 'competitor_campaign_live');
  assert.equal(byKey['campaign:instagram:p2'].alert_trigger, null);
  assert.ok(byKey['outperform:tiktok:p3']);
  assert.equal(byKey['campaign:instagram:p4'], undefined);
  assert.equal(byKey['campaign:instagram:p5'], undefined);
  assert.equal(campaignCue('Vinnarna av klubbmästerskapet'), null);
});

function salesRows(endDate, days, perDay) {
  const rows = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(Date.parse(`${endDate}T00:00:00Z`) - i * 86400000).toISOString().slice(0, 10);
    rows.push({ report_date: date, ...perDay(i) });
  }
  return rows;
}

test('sales: single wild days do not trigger anything', () => {
  // Riktigt mönster från 2026-10: dagsvärden från −60 % till +600 %, men stabilt över veckan.
  const rows = salesRows('2026-10-18', 8, (i) => ({ order_total: i % 2 ? 2000 : 9000, last_year_total: 5500 }));
  assert.deepEqual(detectSalesTrend({ rows, now: NOW }), []);
});

test('sales: a sustained 7-day drop becomes an alert observation', () => {
  const rows = salesRows('2026-10-18', 8, () => ({ order_total: 2000, last_year_total: 5000 }));
  const [observation] = detectSalesTrend({ rows, now: NOW });
  assert.equal(observation.alert_trigger, 'sales_deviation');
  assert.match(observation.value, /14000 kr mot 35000 kr förra året \(-60 %\)/);
});

test('sales: a strong rise is an observation but never an alert', () => {
  const rows = salesRows('2026-10-18', 8, () => ({ order_total: 26000, last_year_total: 11000 }));
  const [observation] = detectSalesTrend({ rows, now: NOW });
  assert.equal(observation.alert_trigger, null);
  assert.equal(observation.dedupe_key, `sales_trend:up:${isoWeek('2026-10-18')}`);
});

test('sales: low volume or gaps produce nothing', () => {
  const low = salesRows('2026-10-18', 8, () => ({ order_total: 100, last_year_total: 1000 }));
  assert.deepEqual(detectSalesTrend({ rows: low, now: NOW }), []);
  const gap = salesRows('2026-10-18', 8, () => ({ order_total: 2000, last_year_total: 5000 })).filter((row) => row.report_date !== '2026-10-15');
  assert.deepEqual(detectSalesTrend({ rows: gap, now: NOW }), []);
});

test('isoWeek follows ISO 8601', () => {
  assert.equal(isoWeek('2026-10-19'), '2026-W43');
  assert.equal(isoWeek('2027-01-01'), '2026-W53');
});

test('projects: a workflow red for more than 48 hours is reported once with the streak', () => {
  const runs = [
    { repo: 'ulle73/ai-radar', workflow: 'Daily GitHub Radar', conclusion: 'failure', created_at: '2026-10-19T06:14:00Z', failure_reason: 'billing' },
    { repo: 'ulle73/ai-radar', workflow: 'Daily GitHub Radar', conclusion: 'failure', created_at: '2026-10-18T05:56:00Z' },
    { repo: 'ulle73/ai-radar', workflow: 'Daily GitHub Radar', conclusion: 'failure', created_at: '2026-10-16T05:52:00Z' },
    { repo: 'ulle73/ai-radar', workflow: 'Daily GitHub Radar', conclusion: 'success', created_at: '2026-10-15T05:55:00Z' },
    { repo: 'ulle73/content-engine', workflow: 'Daily', conclusion: 'failure', created_at: '2026-10-19T06:00:00Z' },
    { repo: 'ulle73/content-engine', workflow: 'Daily', conclusion: 'success', created_at: '2026-10-18T06:00:00Z' }
  ];
  const observations = detectRedCi({ runs, now: NOW });
  assert.equal(observations.length, 1);
  assert.match(observations[0].value, /misslyckats 3 gånger i rad sedan 2026-10-16 \(billing\)/);
});

test('projects: open Notion Log items without follow-up for 14 days are stalled', () => {
  const entries = [
    { id: 'n1', title: 'Instagram-pilot', type: 'Ändrad bedömning', date: '2026-09-20', related: ['https://notion/x'] },
    { id: 'n2', title: 'SEO-test', type: 'Test startat', date: '2026-09-01', related: ['https://notion/seo'] },
    { id: 'n3', title: 'SEO-test resultat', type: 'Testresultat', date: '2026-09-15', related: ['https://notion/seo'] },
    { id: 'n4', title: 'Ny idé', type: 'Idé', date: '2026-10-15', related: [] },
    { id: 'n5', title: 'Lärdom', type: 'Lärdom', date: '2026-08-01', related: [] }
  ];
  const observations = detectStalledLog({ entries, now: NOW });
  assert.deepEqual(observations.map((item) => item.dedupe_key), ['stalled_log:n1']);
  assert.match(observations[0].value, /ingen uppföljning på 29 dagar/);
});

test('observations validate input and dedupe on key', () => {
  assert.throws(() => makeObservation({ detector: 'x', area: 'okänt', dedupe_key: 'k', observed_at: NOW, source: 's', source_kind: 'data', value: 'v' }), /okänt område/);
  assert.throws(() => makeObservation({ detector: 'x', area: 'sales', dedupe_key: 'k', observed_at: NOW, source: 's', source_kind: 'rykte', value: 'v' }), /source_kind/);
  const a = makeObservation({ detector: 'x', area: 'sales', dedupe_key: 'k1', observed_at: NOW, source: 's', source_kind: 'data', value: 'v' });
  const b = makeObservation({ detector: 'x', area: 'sales', dedupe_key: 'k2', observed_at: NOW, source: 's', source_kind: 'data', value: 'v' });
  assert.deepEqual(dedupeObservations([a, a, b], ['k2']).map((item) => item.dedupe_key), ['k1']);
});

test('a detector observation can carry a card through the gates end to end', () => {
  const rows = salesRows('2026-10-18', 8, () => ({ order_total: 2000, last_year_total: 5000 }));
  const [observation] = detectSalesTrend({ rows, now: NOW });
  const card = larmCard({
    observations: [toCardObservation(observation)],
    anchors: observation.anchors,
    target: observation.anchors[0],
    because: 'GK_DAILY_ORDER_REPORTS.order_total ligger 60 % under förra året två veckofönster i rad.',
    dedupe_key: observation.dedupe_key
  });
  const inv = inventory();
  inv.metrics.push({ id: 'GK_DAILY_ORDER_REPORTS.order_total' });
  const result = evaluateCard(json(card), { inventory: inv, budget: BUDGET, now: NOW });
  assert.deepEqual(result.gates.filter((gate) => !gate.pass), []);
  assert.equal(result.publishable, true);
});
