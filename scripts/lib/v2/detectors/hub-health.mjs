// Hubbens hälsa (harness-designen C1.4, mål 8, CUJ 7). Körs varje timme i den lokala cykeln.
// Kontroller: autosyncens senaste lyckade pull och push (hub/state.json: last_pull_ok, last_push_ok),
// origin/sync mot HEAD, Codex inloggning mot Notion, skillbudgeten (hub.py check CHK-DESC-TOTAL),
// domarens lyckade körningar senaste 24 timmarna, motorns setup-token (varning 30 dagar före utgång)
// och versionsglappet per yta från proberna.
//
// Bara underkända kontroller blir observationer, med alert_trigger hub_health_failure (direkt till Discord,
// utan domaren). dedupe per kontroll och dygn, så att ett kvarstående fel larmar en gång per dag.
// Alla källor injiceras (readState, git, codexMcp, hubCheck, judgeHistory, tokenInfo, probeVersions).

import { makeObservation } from '../observation.mjs';

const HOUR_MS = 3600000;
const DAY_MS = 86400000;

export const HEALTH_LIMITS = Object.freeze({
  sync_stale_hours: 3,
  judge_window_hours: 24,
  token_warn_days: 30,
  version_gap_hours: 26
});

const ageHours = (iso, nowMs) => {
  const at = Date.parse(iso || '');
  return Number.isFinite(at) ? (nowMs - at) / HOUR_MS : Infinity;
};

export function checkSync(state, nowMs, limits = HEALTH_LIMITS) {
  const results = [];
  for (const [check, field, label] of [['autosync_pull', 'last_pull_ok', 'pull'], ['autosync_push', 'last_push_ok', 'push']]) {
    const hours = ageHours(state?.[field], nowMs);
    const ok = hours <= limits.sync_stale_hours;
    results.push({ check, ok, detail: ok ? `${label} ok för ${Math.round(hours * 60)} min sedan`
      : (Number.isFinite(hours) ? `autosync har inte lyckats med ${label} på ${Math.round(hours)} timmar` : `autosync har inget lyckat ${label} registrerat (${field} saknas)`) });
  }
  return results;
}

export function checkOriginSync(git, state, nowMs, limits = HEALTH_LIMITS) {
  if (!git) return [];
  const { ahead, behind } = git;
  const pushStale = ageHours(state?.last_push_ok, nowMs) > limits.sync_stale_hours;
  const ok = !(ahead > 0 && pushStale);
  return [{ check: 'origin_sync', ok, detail: `HEAD ${ahead} före och ${behind} efter origin/sync${ok ? '' : ' och push har inte lyckats'}` }];
}

export function checkCodexNotion(servers) {
  if (!Array.isArray(servers)) return [];
  const notion = servers.find((server) => server?.name === 'notion');
  if (!notion) return [{ check: 'codex_notion', ok: false, detail: 'Codex saknar MCP-servern notion' }];
  if (notion.enabled === false) return [{ check: 'codex_notion', ok: false, detail: 'Codex MCP-server notion är avstängd' }];
  const status = String(notion.auth_status || 'unknown');
  const ok = !/not_logged_in|expired|unauthori[sz]ed|error/i.test(status);
  return [{ check: 'codex_notion', ok, detail: ok ? `Codex Notion: ${status}` : `Codex Notion: ${status} – kör codex mcp login notion` }];
}

export function checkSkillBudget(check) {
  if (!check) return [];
  const rule = (check.results || []).find((item) => item.rule === 'CHK-DESC-TOTAL');
  if (!rule) return [{ check: 'skill_budget', ok: false, detail: 'hub.py check saknar CHK-DESC-TOTAL' }];
  return [{ check: 'skill_budget', ok: Boolean(rule.ok), detail: rule.ok ? 'skillbudgeten håller' : String((rule.problems || [])[0] || 'över taket').slice(0, 200) }];
}

// Domaren: minst en lyckad körning de senaste 24 timmarna. En körning med jobb där alla blev FAILED räknas inte.
export function checkJudge(history, nowMs, limits = HEALTH_LIMITS) {
  if (!Array.isArray(history)) return [];
  const recent = history.filter((run) => ageHours(run.at, nowMs) <= limits.judge_window_hours);
  const good = recent.filter((run) => run.ok && !(run.jobs > 0 && run.judged === 0 && run.failed > 0));
  const ok = good.length > 0;
  const failed = recent.reduce((sum, run) => sum + (run.failed || 0), 0);
  return [{ check: 'judge', ok, detail: ok ? `${good.length} lyckade domarkörningar på 24 h` : `domaren har ingen lyckad körning på 24 h (${recent.length} körningar, ${failed} FAILED)` }];
}

export function checkToken(token, nowMs, limits = HEALTH_LIMITS) {
  if (!token) return [];
  if (!token.exists) return [{ check: 'engine_token', ok: false, detail: 'motorns setup-token saknas (claude-oauth.dpapi)' }];
  const expires = Date.parse(token.expires_at || '');
  if (!Number.isFinite(expires)) return [{ check: 'engine_token', ok: false, detail: 'motorns setup-token har okänt utgångsdatum' }];
  const days = Math.floor((expires - nowMs) / DAY_MS);
  if (days < 0) return [{ check: 'engine_token', ok: false, detail: `motorns setup-token gick ut ${token.expires_at.slice(0, 10)} – kör claude setup-token` }];
  const ok = days > limits.token_warn_days;
  return [{ check: 'engine_token', ok, detail: ok ? `setup-token giltig i ${days} dagar` : `motorns setup-token går ut om ${days} dagar (${token.expires_at.slice(0, 10)}) – förnya med claude setup-token` }];
}

// Proberna (C7): en yta som ligger mer än en version efter i mer än 26 timmar. probeVersions:
// { published, published_at, surfaces: { yta: { version, at } } }.
const versionParts = (value) => String(value || '').split('.').map((part) => Number(part) || 0);
function versionsBehind(current, published) {
  const [a, b, c] = versionParts(current);
  const [x, y, z] = versionParts(published);
  if (a !== x || b !== y) return a < x || (a === x && b < y) ? Infinity : 0;
  return Math.max(0, z - c);
}

export function checkVersionGap(probes, nowMs, limits = HEALTH_LIMITS) {
  if (!probes?.published) return [];
  const results = [];
  for (const [surface, seen] of Object.entries(probes.surfaces || {})) {
    const behind = versionsBehind(seen?.version, probes.published);
    const since = ageHours(probes.published_at, nowMs);
    const ok = !(behind > 1 && since > limits.version_gap_hours);
    results.push({ check: `version_gap:${surface}`, ok, detail: ok ? `${surface} svarar ${seen?.version || 'okänd'}` : `${surface} ligger ${behind === Infinity ? 'flera' : behind} versioner efter ${probes.published} sedan ${Math.round(since)} h – be ytan synka (ChatGPT: Sync now)` });
  }
  return results;
}

export function healthChecks(sources, now = new Date()) {
  const nowMs = new Date(now).getTime();
  const state = sources.state || null;
  return [
    ...(state ? checkSync(state, nowMs) : [{ check: 'autosync_state', ok: false, detail: 'hub/state.json kunde inte läsas' }]),
    ...checkOriginSync(sources.git, state, nowMs),
    ...checkCodexNotion(sources.codexMcp),
    ...checkSkillBudget(sources.hubCheck),
    ...checkJudge(sources.judgeHistory, nowMs),
    ...checkToken(sources.token, nowMs),
    ...checkVersionGap(sources.probes, nowMs)
  ];
}

export function detectHubHealth({ results, now = new Date() }) {
  const day = new Date(now).toISOString().slice(0, 10);
  return results.filter((result) => !result.ok).map((result) => makeObservation({
    detector: 'hub_health',
    area: 'tools_hub',
    dedupe_key: `hub_health:${result.check}:${day}`,
    observed_at: new Date(now).toISOString(),
    source: 'Hubbens hälsa (C1.4)',
    source_kind: 'hub_health',
    value: `Hubbens hälsa: ${result.detail}`.slice(0, 400),
    verified: true,
    alert_trigger: 'hub_health_failure',
    data: { check: result.check, ok: false, detail: String(result.detail).slice(0, 300) }
  }));
}

// Kör alla källor isolerat: en källa som kastar blir en underkänd kontroll i stället för att stoppa resten.
export async function gatherHealthSources(readers) {
  const sources = {};
  const errors = [];
  for (const [name, read] of Object.entries(readers)) {
    if (typeof read !== 'function') continue;
    try { sources[name] = await read(); } catch (error) { errors.push({ check: `source:${name}`, ok: false, detail: `${name} kunde inte läsas: ${String(error?.message || error).slice(0, 160)}` }); }
  }
  return { sources, errors };
}
