// Heartbeat: kör alla detektorer mot sina källor och returnerar observationer.
// Ingen AI och ingen skrivning här; den som anropar skickar resultatet till R2 – Observation Ingest.
// Källåtkomsten injiceras (fetchJson, fetchText, dataFeed, readInstalled) så att allt kan testas utan nätverk.
//
// public  = bara publika källor (releaser, YouTube, CI för publika repon). Körs i GitHub Actions.
// private = data som bara finns hos oss (försäljning och Notion Log via data feed, lokala installationer,
//           CI för privata repon). Körs på Jonas dator.

import { dedupeObservations } from './observation.mjs';
import { detectReleases } from './detectors/releases.mjs';
import { detectRelevantVideos, parseYoutubeFeed } from './detectors/youtube.mjs';
import { detectSalesTrend } from './detectors/sales-trend.mjs';
import { detectRedCi, detectStalledLog } from './detectors/project-health.mjs';
import { detectLessons } from './detectors/lessons.mjs';
import { detectHubHealth } from './detectors/hub-health.mjs';
import { detectSessionTranscripts } from './detectors/session-transcripts.mjs';
import { memoryWindowObservation } from './harness/metrics.mjs';

const MODES = Object.freeze(['public', 'private', 'all']);

async function guarded(stats, name, work) {
  try {
    const observations = await work();
    stats.push({ source: name, ok: true, observations: observations.length });
    return observations;
  } catch (error) {
    stats.push({ source: name, ok: false, observations: 0, error: String(error?.message || error).slice(0, 200) });
    return [];
  }
}

function ciRuns(repo, payload) {
  return (payload?.workflow_runs || []).map((run) => ({
    repo,
    workflow: run.name,
    conclusion: run.conclusion,
    created_at: run.created_at,
    url: run.html_url
  }));
}

export async function collectObservations({
  mode,
  sources,
  fetchJson,
  fetchText,
  dataFeed = null,
  readInstalled = null,
  hubHealth = null,
  transcripts = null,
  now = new Date()
}) {
  if (!MODES.includes(mode)) throw new Error(`okänt läge: ${mode}`);
  const includePublic = mode !== 'private';
  const includePrivate = mode !== 'public';
  const stats = [];
  const observations = [];

  if (includePublic) {
    for (const source of sources.releases.github) {
      observations.push(...await guarded(stats, `releases:${source.repo}`, async () =>
        detectReleases({ source, releases: await fetchJson(`https://api.github.com/repos/${source.repo}/releases?per_page=30`), now })));
    }

    for (const channel of sources.youtube.channels) {
      observations.push(...await guarded(stats, `youtube:${channel.handle}`, async () => {
        const xml = await fetchText(sources.youtube.feed_url_template.replace('{channel_id}', channel.channel_id));
        return detectRelevantVideos({ channel, entries: parseYoutubeFeed(xml), prefilter: sources.youtube.prefilter, now });
      }));
    }
  }

  const ciRepos = (sources.ci?.repos || []).filter((entry) => (entry.public ? includePublic : includePrivate));
  for (const entry of ciRepos) {
    observations.push(...await guarded(stats, `ci:${entry.repo}`, async () =>
      detectRedCi({ runs: ciRuns(entry.repo, await fetchJson(`https://api.github.com/repos/${entry.repo}/actions/runs?per_page=20`)), now })));
  }

  if (includePrivate) {
    for (const tool of sources.installed?.tools || []) {
      observations.push(...await guarded(stats, `installed:${tool.repo}`, async () => {
        if (!readInstalled) return [];
        const source = sources.releases.github.find((item) => item.repo === tool.repo);
        if (!source) throw new Error(`ingen releasekälla för ${tool.repo}`);
        const installedVersion = await readInstalled(tool);
        const releases = await fetchJson(`https://api.github.com/repos/${tool.repo}/releases?per_page=30`);
        // Bara jämförelsen med installerad version; själva releaserna rapporteras redan i public-läget.
        return detectReleases({ source, releases, installedVersion, seenTags: releases.map((release) => release.tag_name), now });
      }));
    }

    if (dataFeed) {
      let payload = null;
      try {
        payload = await dataFeed();
        stats.push({ source: 'data_feed', ok: true, observations: 0, rows: (payload.sales_rows || []).length, entries: (payload.log_entries || []).length });
      } catch (error) {
        stats.push({ source: 'data_feed', ok: false, observations: 0, error: String(error?.message || error).slice(0, 200) });
      }
      if (payload) {
        observations.push(...await guarded(stats, 'sales_trend', async () => detectSalesTrend({ rows: payload.sales_rows || [], now })));
        observations.push(...await guarded(stats, 'stalled_log', async () => detectStalledLog({ entries: payload.log_entries || [], now })));
        // Lärdomsrader finns bara när datafeeden ombetts läsa dem (en gång per dygn, harness C1.2).
        if (Array.isArray(payload.lesson_pages)) {
          observations.push(...await guarded(stats, 'lessons', async () => detectLessons({ pages: payload.lesson_pages, now })));
        }
      }
    }
  }

  if (includePrivate) {
    // Hubbens hälsa (C1.4), varje körning: hubHealth() ger kontrollresultaten, bara underkända blir observationer.
    if (hubHealth) {
      observations.push(...await guarded(stats, 'hub_health', async () => detectHubHealth({ results: await hubHealth(), now })));
    }
    // Sessionstranskript (C1.1), en gång per dygn: transcripts() ger maskade sessioner och baslinjen.
    // Minnesanvändningen de senaste 7 dagarna följer med som mått för tröskel (b) i C2.
    if (transcripts) {
      observations.push(...await guarded(stats, 'session_transcripts', async () => {
        const { sessions, baseline } = await transcripts();
        const memory = memoryWindowObservation({ sessions, baseline, now });
        return [...detectSessionTranscripts({ sessions: sessions.filter((session) => Date.parse(session.ended_at || session.started_at) >= new Date(now).getTime() - 2 * 86400000), now }), ...(memory ? [memory] : [])];
      }));
    }
  }

  return { observations: dedupeObservations(observations), stats };
}

export { MODES };
