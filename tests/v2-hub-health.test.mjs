import test from 'node:test';
import assert from 'node:assert/strict';
import { checkCodexNotion, checkJudge, checkSkillBudget, checkSync, checkToken, checkVersionGap, detectHubHealth, gatherHealthSources, healthChecks } from '../scripts/lib/v2/detectors/hub-health.mjs';
import { collectObservations } from '../scripts/lib/v2/heartbeat.mjs';

const NOW = '2026-11-02T12:00:00Z';
const nowMs = Date.parse(NOW);
const hoursAgo = (hours) => new Date(nowMs - hours * 3600000).toISOString();
const daysAhead = (days) => new Date(nowMs + days * 86400000).toISOString();

const healthy = {
  state: { last_pull_ok: hoursAgo(0.5), last_push_ok: hoursAgo(0.5) },
  git: { ahead: 0, behind: 0 },
  codexMcp: [{ name: 'notion', enabled: true, auth_status: 'o_auth' }],
  hubCheck: { ok: true, results: [{ rule: 'CHK-DESC-TOTAL', ok: true, problems: [] }] },
  judgeHistory: [{ at: hoursAgo(10), ok: true, jobs: 3, judged: 3, failed: 0 }],
  token: { exists: true, expires_at: daysAhead(200) },
  probes: { published: '1.0.5', published_at: hoursAgo(30), surfaces: { claude_code: { version: '1.0.5' }, chatgpt: { version: '1.0.4' } } }
};

test('frisk hubb ger inga observationer', () => {
  const results = healthChecks(healthy, NOW);
  assert.ok(results.every((result) => result.ok), JSON.stringify(results.filter((result) => !result.ok)));
  assert.equal(detectHubHealth({ results, now: NOW }).length, 0);
});

test('T26: autosync som inte kan pusha ger hälsolarm', () => {
  const state = { last_pull_ok: hoursAgo(0.5), last_push_ok: hoursAgo(4) };
  const results = healthChecks({ ...healthy, state, git: { ahead: 2, behind: 0 } }, NOW);
  const failed = results.filter((result) => !result.ok).map((result) => result.check);
  assert.deepEqual(failed.sort(), ['autosync_push', 'origin_sync']);
  const observations = detectHubHealth({ results, now: NOW });
  assert.equal(observations.length, 2);
  for (const observation of observations) {
    assert.equal(observation.alert_trigger, 'hub_health_failure');
    assert.equal(observation.source_kind, 'hub_health');
    assert.equal(observation.data.ok, false);
  }
  assert.match(observations.find((o) => o.data.check === 'autosync_push').value, /push på 4 timmar/);
  assert.deepEqual(checkSync({}, nowMs).map((result) => result.ok), [false, false]);
});

test('T26: simulerad utgången token ger hälsolarm, och varning 30 dagar före', () => {
  const expired = checkToken({ exists: true, expires_at: daysAhead(-1) }, nowMs)[0];
  assert.equal(expired.ok, false);
  assert.match(expired.detail, /gick ut/);
  const soon = checkToken({ exists: true, expires_at: daysAhead(20) }, nowMs)[0];
  assert.equal(soon.ok, false);
  assert.match(soon.detail, /går ut om 19 dagar|går ut om 20 dagar/);
  assert.equal(checkToken({ exists: true, expires_at: daysAhead(31) }, nowMs)[0].ok, true);
  assert.equal(checkToken({ exists: false }, nowMs)[0].ok, false);

  const codex = checkCodexNotion([{ name: 'notion', enabled: true, auth_status: 'not_logged_in' }])[0];
  assert.equal(codex.ok, false);
  assert.match(codex.detail, /codex mcp login notion/);
  const observations = detectHubHealth({ results: healthChecks({ ...healthy, token: { exists: true, expires_at: daysAhead(-1) } }, NOW), now: NOW });
  assert.deepEqual(observations.map((o) => [o.data.check, o.alert_trigger]), [['engine_token', 'hub_health_failure']]);
});

test('larmet dedupliceras per kontroll och dygn', () => {
  const results = [{ check: 'autosync_push', ok: false, detail: 'x' }];
  const a = detectHubHealth({ results, now: '2026-11-02T01:00:00Z' })[0];
  const b = detectHubHealth({ results, now: '2026-11-02T23:00:00Z' })[0];
  const c = detectHubHealth({ results, now: '2026-11-03T01:00:00Z' })[0];
  assert.equal(a.dedupe_key, b.dedupe_key);
  assert.notEqual(a.dedupe_key, c.dedupe_key);
});

test('domaren: ingen lyckad körning på 24 timmar larmar; historik saknas hoppas över', () => {
  assert.equal(checkJudge([{ at: hoursAgo(30), ok: true, jobs: 0, judged: 0, failed: 0 }], nowMs)[0].ok, false);
  assert.equal(checkJudge([{ at: hoursAgo(3), ok: true, jobs: 4, judged: 0, failed: 4 }], nowMs)[0].ok, false);
  assert.equal(checkJudge([{ at: hoursAgo(3), ok: true, jobs: 0, judged: 0, failed: 0 }], nowMs)[0].ok, true);
  assert.equal(checkJudge([{ at: hoursAgo(3), ok: false, jobs: 0, judged: 0, failed: 0 }], nowMs)[0].ok, false);
  assert.deepEqual(checkJudge(null, nowMs), []);
});

test('skillbudget och versionsglapp', () => {
  assert.equal(checkSkillBudget({ results: [{ rule: 'CHK-DESC-TOTAL', ok: false, problems: ['105 skills > 100'] }] })[0].detail, '105 skills > 100');
  const gap = checkVersionGap({ published: '1.0.6', published_at: hoursAgo(27), surfaces: { chatgpt: { version: '1.0.4' }, claude_ai: { version: '1.0.5' } } }, nowMs);
  assert.deepEqual(gap.map((result) => [result.check, result.ok]), [['version_gap:chatgpt', false], ['version_gap:claude_ai', true]]);
  const fresh = checkVersionGap({ published: '1.0.6', published_at: hoursAgo(2), surfaces: { chatgpt: { version: '1.0.4' } } }, nowMs);
  assert.ok(fresh[0].ok, 'inom 26 timmar efter publicering');
});

test('källor som kastar blir underkända kontroller, resten körs', async () => {
  const { sources, errors } = await gatherHealthSources({ state: async () => healthy.state, git: async () => { throw new Error('git saknas'); } });
  assert.deepEqual(sources, { state: healthy.state });
  assert.equal(errors[0].check, 'source:git');
  assert.equal(errors[0].ok, false);
});

test('heartbeat: hälsodetektorn och transkripten körs i privat läge', async () => {
  const sources = { releases: { github: [] }, youtube: { channels: [] }, ci: { repos: [] } };
  const { observations, stats } = await collectObservations({
    mode: 'private',
    sources,
    fetchJson: async () => [],
    fetchText: async () => '',
    hubHealth: async () => [{ check: 'autosync_push', ok: false, detail: 'push misslyckas' }],
    transcripts: async () => ({ sessions: [{ client: 'codex', session_hash: 'abc', started_at: NOW, ended_at: NOW, instructions: 0, corrections: 0, notion_calls: 0, skills_used: {}, verified: false, gk_session: true }], baseline: { memory_usage: 0.2 } }),
    now: NOW
  });
  assert.deepEqual(stats.map((item) => [item.source, item.ok]), [['hub_health', true], ['session_transcripts', true]]);
  assert.deepEqual(observations.map((item) => item.source_kind).sort(), ['hub_health', 'metric', 'session_transcript']);
  const publicRun = await collectObservations({ mode: 'public', sources, fetchJson: async () => [], fetchText: async () => '', hubHealth: async () => [{ check: 'x', ok: false, detail: 'x' }], now: NOW });
  assert.equal(publicRun.observations.length, 0);
});

test('codex mcp list: ett tillfälligt fel ger ett nytt försök, två fel ger en kort orsak', async () => {
  const { codexMcpList } = await import('../scripts/lib/v2/local-sources.mjs');
  let calls = 0;
  const flaky = async () => { calls += 1; if (calls === 1) throw Object.assign(new Error('Command failed'), { code: 1, stderr: '' }); return { stdout: '[{"name":"notion","auth_status":"o_auth"}]' }; };
  assert.deepEqual(await codexMcpList('codex.exe', { exec: flaky, pauseMs: 0 }), [{ name: 'notion', auth_status: 'o_auth' }]);
  assert.equal(calls, 2);
  const broken = async () => { throw Object.assign(new Error('Command failed: C:\lång\sökväg\codex.exe mcp list --json'), { code: 1, stderr: 'Error: config\nmer' }); };
  await assert.rejects(codexMcpList('codex.exe', { exec: broken, pauseMs: 0 }), /misslyckades två gånger: Error: config$/);
});
