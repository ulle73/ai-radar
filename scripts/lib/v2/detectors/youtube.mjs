// Verktyg & hubb: nya videor från följda kanaler (officiellt RSS-flöde per kanal).
// Bara videor vars titel eller beskrivning träffar förfiltret går vidare; transkript hämtas först därefter.

import { makeObservation } from '../observation.mjs';

const DAY_MS = 86400000;

function decodeXml(text) {
  return String(text || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return match ? decodeXml(match[1]) : '';
}

export function parseYoutubeFeed(xml) {
  const entries = [];
  for (const match of String(xml || '').matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const block = match[1];
    const videoId = tag(block, 'yt:videoId');
    if (!videoId) continue;
    entries.push({
      video_id: videoId,
      title: tag(block, 'title'),
      published: tag(block, 'published'),
      description: tag(block, 'media:description'),
      url: `https://www.youtube.com/watch?v=${videoId}`
    });
  }
  return entries;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function matchKeywords(text, keywords) {
  const haystack = String(text || '').toLowerCase();
  return keywords.filter((keyword) =>
    new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(keyword.toLowerCase())}($|[^\\p{L}\\p{N}])`, 'u').test(haystack));
}

export function extractGithubRepos(text) {
  const repos = new Set();
  for (const match of String(text || '').matchAll(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/g)) {
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '').replace(/[.,)]+$/, '');
    if (!repo || ['sponsors', 'orgs', 'topics', 'features'].includes(owner.toLowerCase())) continue;
    repos.add(`${owner}/${repo}`);
  }
  return [...repos];
}

// Starka ord pekar direkt på vår stack; svaga ord räcker bara tillsammans med ett starkt.
export function passesPrefilter(entry, { strong, weak }) {
  const titleStrong = matchKeywords(entry.title, strong);
  const allStrong = matchKeywords(`${entry.title}\n${entry.description}`, strong);
  const allWeak = matchKeywords(`${entry.title}\n${entry.description}`, weak);
  const pass = titleStrong.length > 0 || (allStrong.length > 0 && allWeak.length > 0);
  return { pass, hits: [...new Set([...allStrong, ...allWeak])] };
}

export function detectRelevantVideos({ channel, entries, prefilter, seenVideoIds = [], now = new Date(), maxAgeDays = 7 }) {
  const nowMs = new Date(now).getTime();
  const seen = new Set(seenVideoIds);
  const observations = [];

  for (const entry of entries) {
    const publishedMs = Date.parse(entry.published);
    if (!Number.isFinite(publishedMs) || nowMs - publishedMs > maxAgeDays * DAY_MS) continue;
    if (seen.has(entry.video_id)) continue;
    const { pass, hits } = passesPrefilter(entry, prefilter);
    if (!pass) continue;
    const repos = extractGithubRepos(entry.description);
    observations.push(makeObservation({
      detector: 'youtube',
      area: channel.focus || 'tools_hub',
      dedupe_key: `youtube:${entry.video_id}`,
      observed_at: entry.published,
      source: `YouTube – ${channel.name}`,
      source_kind: 'video',
      url: entry.url,
      value: `${channel.name}: "${entry.title}" (${entry.published.slice(0, 10)}), träffar: ${hits.join(', ')}`
        + (repos.length ? `, repon: ${repos.join(', ')}` : ''),
      data: {
        channel_id: channel.channel_id,
        official: Boolean(channel.official),
        video_id: entry.video_id,
        keywords: hits,
        repos,
        needs_transcript: true
      }
    }));
  }

  return observations;
}
