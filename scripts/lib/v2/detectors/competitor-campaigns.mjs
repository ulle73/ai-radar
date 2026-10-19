// Sociala medier & konkurrenter: tävlingar, kampanjer och inlägg som presterar klart över kontots baslinje.
// Indata är poster från content-engines Competitor Intelligence (skrivskyddat); Radar samlar inte in själv.

import { makeObservation } from '../observation.mjs';

const HOUR_MS = 3600000;

const CAMPAIGN_PATTERN = /(^|[^\p{L}])(tävling|tävla|tävlingen|vinn|vinner|vinna|utlottning|lottar ut|giveaway|kampanjkod|rabattkod|friskvårdsbidrag kvar|innan årsskiftet)($|[^\p{L}])/iu;

const DEFAULTS = Object.freeze({
  liveWindowHours: 48,
  maxAgeHours: 14 * 24,
  outperformanceRatio: 3
});

export function campaignCue(caption) {
  const match = String(caption || '').match(CAMPAIGN_PATTERN);
  return match ? match[2].toLowerCase() : null;
}

function postValue(post, detail) {
  const metrics = [
    post.likes != null ? `${post.likes} likes` : null,
    post.comments != null ? `${post.comments} kommentarer` : null,
    post.views != null ? `${post.views} visningar` : null
  ].filter(Boolean).join(', ');
  return `${post.account} (${post.platform}) ${post.posted_at.slice(0, 10)}: ${detail}${metrics ? ` – ${metrics}` : ''}`;
}

export function detectCompetitorCampaigns({ posts, now = new Date(), options = {} }) {
  const settings = { ...DEFAULTS, ...options };
  const nowMs = new Date(now).getTime();
  const observations = [];

  for (const post of posts) {
    const postedMs = Date.parse(post.posted_at);
    if (!Number.isFinite(postedMs)) continue;
    const ageMs = nowMs - postedMs;
    if (ageMs < 0 || ageMs > settings.maxAgeHours * HOUR_MS) continue;

    const anchors = [{ kind: 'repo', ref: 'ulle73/content-engine' }];
    const cue = campaignCue(post.caption);
    if (cue) {
      const live = ageMs <= settings.liveWindowHours * HOUR_MS;
      observations.push(makeObservation({
        detector: 'competitor_campaigns',
        area: 'social',
        dedupe_key: `campaign:${post.platform}:${post.post_id}`,
        observed_at: post.posted_at,
        source: `content-engine Competitor Intelligence – ${post.account}`,
        source_kind: 'social',
        url: post.url || null,
        value: postValue(post, `kampanjsignal "${cue}"`),
        anchors,
        alert_trigger: live ? 'competitor_campaign_live' : null,
        data: { account: post.account, platform: post.platform, cue, caption_excerpt: String(post.caption).slice(0, 500) }
      }));
    }

    if (Number(post.outperformance) >= settings.outperformanceRatio) {
      observations.push(makeObservation({
        detector: 'competitor_campaigns',
        area: 'social',
        dedupe_key: `outperform:${post.platform}:${post.post_id}`,
        observed_at: post.posted_at,
        source: `content-engine Competitor Intelligence – ${post.account}`,
        source_kind: 'social',
        url: post.url || null,
        value: postValue(post, `${Number(post.outperformance).toFixed(1)}× kontots baslinje vid samma postålder`),
        anchors,
        data: { account: post.account, platform: post.platform, outperformance: Number(post.outperformance) }
      }));
    }
  }

  return observations;
}
