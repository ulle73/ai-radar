// Verktyg & hubb: nya stabila releaser i primärkällor (GitHub Releases).
// Förhandsversioner (prerelease, alpha, nightly) och rörliga taggar (stable, beta) räknas inte.

import { makeObservation } from '../observation.mjs';

const DAY_MS = 86400000;
const VERSION = /(\d+)\.(\d+)\.(\d+)/;

export function parseVersion(tag) {
  const match = String(tag || '').match(VERSION);
  return match ? match.slice(1).map(Number) : null;
}

export function compareVersions(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

export function stableReleases(releases) {
  return (releases || [])
    .filter((release) => !release.draft && !release.prerelease && parseVersion(release.tag_name))
    .sort((a, b) => compareVersions(parseVersion(b.tag_name), parseVersion(a.tag_name)));
}

function minorDistance(newer, older) {
  if (newer[0] !== older[0]) return Infinity;
  return newer[1] - older[1];
}

export function detectReleases({
  source,
  releases,
  seenTags = [],
  installedVersion = null,
  now = new Date(),
  maxAgeDays = 30,
  outdatedMinorThreshold = 3
}) {
  const nowMs = new Date(now).getTime();
  const seen = new Set(seenTags);
  const stable = stableReleases(releases);
  const observations = [];
  // Bara den senaste major-grenen; t.ex. n8n släpper fortfarande 1.x-patchar parallellt med 2.x.
  const latestMajor = stable.length ? parseVersion(stable[0].tag_name)[0] : null;

  for (const release of stable.filter((item) => parseVersion(item.tag_name)[0] === latestMajor)) {
    const publishedMs = Date.parse(release.published_at);
    if (!Number.isFinite(publishedMs) || nowMs - publishedMs > maxAgeDays * DAY_MS) continue;
    if (seen.has(release.tag_name)) continue;
    observations.push(makeObservation({
      detector: 'releases',
      area: 'tools_hub',
      dedupe_key: `release:${source.repo}:${release.tag_name}`,
      observed_at: release.published_at,
      source: `${source.name} – GitHub Releases`,
      source_kind: 'primary',
      url: release.html_url,
      value: `${source.name} ${release.tag_name} släppt ${release.published_at.slice(0, 10)}`,
      anchors: source.anchors || [],
      data: { repo: source.repo, tag: release.tag_name, body_excerpt: String(release.body || '').slice(0, 2000) }
    }));
  }

  const installed = parseVersion(installedVersion);
  const latest = stable[0];
  if (installed && latest) {
    const latestVersion = parseVersion(latest.tag_name);
    const distance = minorDistance(latestVersion, installed);
    if (compareVersions(latestVersion, installed) > 0 && distance >= outdatedMinorThreshold) {
      const behind = Number.isFinite(distance) ? `${distance} minor-versioner efter` : 'en major-version efter';
      observations.push(makeObservation({
        detector: 'releases',
        area: 'tools_hub',
        dedupe_key: `outdated:${source.repo}:${installed.join('.')}:${latest.tag_name}`,
        observed_at: now,
        source: `${source.name} – installerad version jämfört med GitHub Releases`,
        source_kind: 'primary',
        url: latest.html_url,
        value: `Installerad ${source.name} ${installed.join('.')} är ${behind} senaste stabila ${latest.tag_name}`,
        anchors: source.anchors || [],
        data: { repo: source.repo, installed: installed.join('.'), latest: latest.tag_name }
      }));
    }
  }

  return observations;
}
