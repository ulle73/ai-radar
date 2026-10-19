// Deterministiska grindar för AI Radar v2 (docs/V2-SPEC.md, avsnitt 6).
// Modellen beskriver; den här koden avgör om ett kort får publiceras.
// Allt är fail closed: saknad eller tvetydig information ger underkänt.

import { validateCard } from './card-contract.mjs';

const DAY_MS = 86400000;

const GATE_THRESHOLDS = Object.freeze({
  maxObservationAgeDays: 90,
  maxPlatformNewsAgeDays: 30,
  maxAlertObservationAgeHours: 48,
  decisionCooldownDays: 90,
  minBecauseLength: 40,
  maxRuleLines: 3,
  maxRuleChars: 400,
  skepticDowngradePenalty: 15,
  futureToleranceMs: 5 * 60 * 1000
});

const BRIEF_LIMITS = Object.freeze({ maxTotal: 3, maxPerArea: 2 });

const INVENTORY_KEYS = Object.freeze({
  skill: 'skills',
  tool: 'tools',
  mcp: 'mcp',
  repo: 'repos',
  workflow: 'workflows',
  notion: 'notion',
  metric: 'metrics',
  agents_rule: 'agents_rules',
  shopify_theme: 'shopify_themes'
});

const HUB_KINDS = Object.freeze(['skill', 'tool', 'mcp']);

// NY och ERSÄTT pekar på något som ännu inte finns i hubben; där bär ankarna (och replaces) kopplingen.
const NEW_TARGET_TYPES = Object.freeze(['NY', 'ERSATT']);

const ALLOWED_LICENSES = Object.freeze([
  'mit', 'apache-2.0', 'bsd-2-clause', 'bsd-3-clause', 'isc', 'mpl-2.0',
  'unlicense', 'cc0-1.0', '0bsd', 'cc-by-4.0'
]);

// Primärkällor för plattformsnyheter. Aggregatorer (t.ex. agentnative.inc) får aldrig bära ett kort.
const PRIMARY_HOSTS = Object.freeze([
  'anthropic.com', 'claude.com', 'claude.ai',
  'openai.com',
  'ai.google.dev', 'developers.googleblog.com', 'blog.google', 'cloud.google.com',
  'n8n.io',
  'shopify.dev', 'changelog.shopify.com'
]);
const PRIMARY_GITHUB_OWNERS = Object.freeze([
  'anthropics', 'openai', 'google-gemini', 'google', 'n8n-io', 'shopify'
]);

// Fraser som ensamma inte säger något om vår stack. Utan en siffra underkänns texten.
const GENERIC_PHRASES = Object.freeze([
  'öka engagemang', 'ökat engagemang', 'förbättra effektivitet', 'förbättrad effektivitet',
  'effektivisera', 'spara tid', 'sparar tid', 'öka produktivitet', 'ökad produktivitet',
  'bättre kvalitet', 'förbättra kvaliteten', 'förbättra arbetsflöden', 'förbättra arbetsflödet',
  'öka försäljningen', 'ökad försäljning', 'nå fler kunder', 'ligga i framkant',
  'improve efficiency', 'boost engagement', 'save time', 'increase productivity',
  'streamline', 'stay ahead'
]);

const PROTECTED_BRANCHES = Object.freeze(['main', 'master']);

function norm(value) {
  return String(value ?? '').trim().toLowerCase();
}

function toTime(value) {
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(time) ? time : NaN;
}

function gate(id, name, pass, reason) {
  return { id, name, pass, reason };
}

function identifiers(entry) {
  return [entry?.id, entry?.name, entry?.title, ...(entry?.aliases || [])]
    .filter((value) => typeof value === 'string' && value.trim())
    .map(norm);
}

function stripToolPrefix(name) {
  return norm(name).replace(/^tool-/, '');
}

export function findEntity(inventory, kind, ref) {
  const key = INVENTORY_KEYS[kind];
  const entries = Array.isArray(inventory?.[key]) ? inventory[key] : [];
  const wanted = norm(ref);
  if (!wanted) return null;
  return entries.find((entry) => identifiers(entry).includes(wanted)) || null;
}

function findHubEntity(inventory, ref) {
  const wanted = stripToolPrefix(ref);
  for (const kind of HUB_KINDS) {
    const entries = Array.isArray(inventory?.[INVENTORY_KEYS[kind]]) ? inventory[INVENTORY_KEYS[kind]] : [];
    const hit = entries.find((entry) => identifiers(entry).map(stripToolPrefix).includes(wanted));
    if (hit) return { kind, entry: hit };
  }
  return null;
}

function isPrimaryUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  const host = parsed.hostname.toLowerCase();
  if (host === 'github.com') {
    const owner = norm(parsed.pathname.split('/')[1]);
    return PRIMARY_GITHUB_OWNERS.includes(owner);
  }
  return PRIMARY_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

function observationAgeOk(observation, nowMs, maxAgeMs) {
  const observedMs = toTime(observation.observed_at);
  if (!Number.isFinite(observedMs)) return false;
  if (observedMs > nowMs + GATE_THRESHOLDS.futureToleranceMs) return false;
  return nowMs - observedMs <= maxAgeMs;
}

function checkObservation(card, nowMs) {
  const maxDays = card.platform_news
    ? GATE_THRESHOLDS.maxPlatformNewsAgeDays
    : GATE_THRESHOLDS.maxObservationAgeDays;
  const usable = card.observations.filter((observation) =>
    observation.verified
    && observation.source_kind !== 'aggregator'
    && observationAgeOk(observation, nowMs, maxDays * DAY_MS));

  const primaryWithoutUrl = card.observations.find((observation) =>
    observation.source_kind === 'primary' && !isPrimaryUrl(observation.url));
  if (primaryWithoutUrl) {
    return gate('G1', 'Observation', false, `primärkälla utan godkänd https-URL: ${primaryWithoutUrl.source}`);
  }
  if (!usable.length) {
    return gate('G1', 'Observation', false,
      `ingen verifierad observation från annan källa än aggregator inom ${maxDays} dagar`);
  }
  if (card.platform_news && !usable.some((observation) => observation.source_kind === 'primary')) {
    return gate('G1', 'Observation', false, 'plattformsnyhet saknar verifierad primärkälla (rykten och aggregatorer räcker inte)');
  }
  return gate('G1', 'Observation', true, `${usable.length} verifierad(e) observation(er)`);
}

function checkTarget(card, inventory) {
  const unknownAnchors = card.anchors.filter((anchor) => !findEntity(inventory, anchor.kind, anchor.ref));
  if (unknownAnchors.length) {
    return gate('G2', 'Konkret mål', false,
      `okända ankare: ${unknownAnchors.map((anchor) => `${anchor.kind}:${anchor.ref}`).join(', ')}`);
  }
  if (!NEW_TARGET_TYPES.includes(card.type) && !findEntity(inventory, card.target.kind, card.target.ref)) {
    return gate('G2', 'Konkret mål', false, `målet finns inte i inventeringen: ${card.target.kind}:${card.target.ref}`);
  }
  return gate('G2', 'Konkret mål', true, 'ankare och mål finns i inventeringen');
}

function checkNovelty(card, inventory, decisions, nowMs) {
  if (card.type === 'NY') {
    const existing = findHubEntity(inventory, card.target.ref);
    if (existing) {
      return gate('G3', 'Nytt för oss', false, `finns redan i hubben som ${existing.kind}: ${card.target.ref}`);
    }
  }

  const previous = decisions
    .filter((decision) => norm(decision.dedupe_key) === norm(card.dedupe_key))
    .sort((a, b) => toTime(b.decided_at) - toTime(a.decided_at))[0];
  if (!previous) return gate('G3', 'Nytt för oss', true, 'inget tidigare beslut');

  const decidedMs = toTime(previous.decided_at);
  if (!Number.isFinite(decidedMs)) {
    return gate('G3', 'Nytt för oss', false, 'tidigare beslut har ogiltigt datum');
  }
  if (nowMs - decidedMs <= GATE_THRESHOLDS.decisionCooldownDays * DAY_MS) {
    return gate('G3', 'Nytt för oss', false,
      `beslutat ${previous.decided_at.slice(0, 10)} (${previous.outcome}) inom ${GATE_THRESHOLDS.decisionCooldownDays} dagar`);
  }
  if (previous.outcome === 'NEJ') {
    const hasNewEvidence = card.observations.some((observation) =>
      observation.verified && toTime(observation.observed_at) > decidedMs);
    if (!hasNewEvidence) {
      return gate('G3', 'Nytt för oss', false, 'tidigare avvisat och ingen ny evidens efter beslutet');
    }
  }
  return gate('G3', 'Nytt för oss', true, 'tidigare beslut är äldre och ny evidens finns');
}

function becauseEntities(card, inventory) {
  const names = new Set();
  const add = (kind, ref) => {
    names.add(norm(ref));
    const entry = findEntity(inventory, kind, ref);
    for (const id of identifiers(entry)) names.add(id);
  };
  for (const anchor of card.anchors) add(anchor.kind, anchor.ref);
  if (!NEW_TARGET_TYPES.includes(card.type)) add(card.target.kind, card.target.ref);
  if (card.replaces) {
    const hub = findHubEntity(inventory, card.replaces);
    add(hub?.kind || 'skill', card.replaces);
  }
  return [...names].filter((name) => name.length >= 3);
}

function checkBecause(card, inventory) {
  const text = norm(card.because);
  if (text.length < GATE_THRESHOLDS.minBecauseLength) {
    return gate('G4', 'För att', false, `motiveringen är kortare än ${GATE_THRESHOLDS.minBecauseLength} tecken`);
  }
  const mentioned = becauseEntities(card, inventory).filter((name) => text.includes(name));
  if (!mentioned.length) {
    return gate('G4', 'För att', false, 'motiveringen nämner ingen namngiven entitet från vår stack');
  }
  const generic = GENERIC_PHRASES.find((phrase) => text.includes(phrase));
  if (generic && !/\d/.test(text)) {
    return gate('G4', 'För att', false, `generisk formulering utan siffra: "${generic}"`);
  }
  return gate('G4', 'För att', true, `nämner ${mentioned.join(', ')}`);
}

function checkSkeptic(card) {
  const { verdict, reason } = card.skeptic;
  if (verdict === 'REJECT') return gate('G5', 'Skeptiker', false, `skeptikern avvisade: ${reason}`);
  if (verdict === 'DOWNGRADE') return gate('G5', 'Skeptiker', true, `nedgraderad: ${reason}`);
  return gate('G5', 'Skeptiker', true, 'godkänd av skeptikern');
}

function checkContract(card, nowMs) {
  const { valid, errors } = validateCard(card);
  if (!valid) return gate('G6', 'Giltigt kontrakt', false, errors.slice(0, 5).join('; '));
  if (card.analysis_mode !== 'model') {
    return gate('G6', 'Giltigt kontrakt', false, 'reservbedömning – förbjuden i v2');
  }
  if (toTime(card.expires_at) <= nowMs) return gate('G6', 'Giltigt kontrakt', false, 'kortet har gått ut');
  return gate('G6', 'Giltigt kontrakt', true, 'kontrakt v1 giltigt');
}

function checkBudget(budget) {
  const spent = Number(budget?.spent_sek);
  const cap = Number(budget?.cap_sek);
  if (!Number.isFinite(spent) || !Number.isFinite(cap) || cap <= 0) {
    return gate('G8', 'Budget', false, 'budgetstatus saknas');
  }
  if (spent >= cap) return gate('G8', 'Budget', false, `budgeten är slut (${spent} av ${cap} kr)`);
  return gate('G8', 'Budget', true, `${spent} av ${cap} kr använt`);
}

function checkSecurity(card) {
  const security = card.security;
  if (!security) return 'säkerhetsuppgifter saknas';
  if (security.static_scan !== 'clean') return `statisk skanning: ${security.static_scan}`;
  if (!ALLOWED_LICENSES.includes(norm(security.license))) return `licensen är inte godkänd: ${security.license ?? 'okänd'}`;
  const bothClients = ['claude', 'codex'].every((client) => security.clients.includes(client));
  if (!bothClients && !String(security.client_note || '').trim()) {
    return 'fungerar inte i båda klienterna och saknar förklaring';
  }
  return null;
}

function testStatus(card) {
  if (card.test.outcome === 'fail') return { failed: 'testet misslyckades' };
  return { unverified: card.test.outcome !== 'pass' || !card.test.verified };
}

function checkType(card, inventory, nowMs) {
  const fail = (reason) => ({ gate: gate('TYP', `Typgrind ${card.type}`, false, reason), unverified: false });
  const pass = (reason, unverified = false) => ({
    gate: gate('TYP', `Typgrind ${card.type}`, true, unverified ? `${reason} (overifierad)` : reason),
    unverified
  });

  if (card.type === 'NY' || card.type === 'ERSATT') {
    if (!HUB_KINDS.includes(card.target.kind)) return fail(`fel måltyp för ${card.type}: ${card.target.kind}`);
    const securityProblem = checkSecurity(card);
    if (securityProblem) return fail(securityProblem);

    if (card.type === 'NY') {
      if (card.test.kind !== 'smoke') return fail('NY kräver smoke-test');
      const status = testStatus(card);
      if (status.failed) return fail(status.failed);
      return pass('smoke-test, skanning och licens godkända', status.unverified);
    }

    if (!card.replaces) return fail('ERSÄTT anger inte vad som ersätts');
    if (!findHubEntity(inventory, card.replaces)) return fail(`det som ersätts finns inte i hubben: ${card.replaces}`);
    if (card.test.kind !== 'ab' || !card.test.ab) return fail('ERSÄTT kräver A/B-test med båda utdata');
    const winners = card.test.ab.criteria.map((criterion) => criterion.winner);
    if (winners.includes('old')) return fail('den gamla vinner på minst ett kriterium');
    if (!winners.includes('new')) return fail('den nya vinner inte på något kriterium');
    const status = testStatus(card);
    if (status.failed) return fail(status.failed);
    return pass('A/B visar att den nya vinner utan att förlora', status.unverified);
  }

  if (card.type === 'PROJEKT') {
    if (!['repo', 'workflow'].includes(card.target.kind)) return fail(`fel måltyp för PROJEKT: ${card.target.kind}`);
    const fabricText = [card.title, card.recommendation, card.action_on_ok, card.target.ref, card.target.branch]
      .map((value) => String(value || ''))
      .join(' ');
    if (/\bfabric\b/i.test(fabricText)) return fail('rör Shopify-temat Fabric – förbjudet');
    if (card.target.kind === 'repo') {
      const branch = norm(card.target.branch);
      const repo = findEntity(inventory, 'repo', card.target.ref);
      const protectedRefs = [...PROTECTED_BRANCHES, norm(repo?.default_branch), ...(repo?.protected_refs || []).map(norm)];
      if (!branch) return fail('PROJEKT mot repo kräver en branch');
      if (protectedRefs.includes(branch)) return fail(`branchen är skyddad: ${card.target.branch}`);
      if (!branch.startsWith('radar/')) return fail('branchen måste börja med radar/');
    }
    if (!card.measure) return fail('PROJEKT kräver mått och baslinje');
    return pass('mål, branch och mått godkända');
  }

  if (card.type === 'ANVAND') {
    const rule = String(card.rule_text || '').trim();
    if (!rule) return fail('ANVÄND kräver en regeltext');
    if (rule.split(/\r?\n/).length > GATE_THRESHOLDS.maxRuleLines) {
      return fail(`regeln är längre än ${GATE_THRESHOLDS.maxRuleLines} rader`);
    }
    if (rule.length > GATE_THRESHOLDS.maxRuleChars) return fail(`regeln är längre än ${GATE_THRESHOLDS.maxRuleChars} tecken`);
    return pass('kort regel med källa');
  }

  if (card.type === 'LARM') {
    if (!card.urgency) return fail('LARM kräver urgency');
    if (toTime(card.urgency.expires_at) <= nowMs) return fail('larmet är inte längre aktuellt');
    const maxAgeMs = GATE_THRESHOLDS.maxAlertObservationAgeHours * 3600000;
    const fresh = card.observations.some((observation) =>
      observation.verified && observation.source_kind !== 'aggregator' && observationAgeOk(observation, nowMs, maxAgeMs));
    if (!fresh) return fail(`ingen verifierad observation de senaste ${GATE_THRESHOLDS.maxAlertObservationAgeHours} timmarna`);
    return pass(`tidskritiskt: ${card.urgency.trigger}`);
  }

  return fail(`okänd korttyp: ${card.type}`);
}

export function evaluateCard(card, { inventory, decisions = [], budget = null, now = new Date() } = {}) {
  const nowMs = toTime(now);
  if (!Number.isFinite(nowMs)) throw new Error('evaluateCard: ogiltigt now');

  const contractGate = checkContract(card, nowMs);
  const base = {
    card_id: card?.card_id ?? null,
    area: card?.area ?? null,
    type: card?.type ?? null
  };

  if (!contractGate.pass) {
    return {
      ...base,
      publishable: false,
      unverified: false,
      rank_score: 0,
      gates: [contractGate, checkBudget(budget)]
    };
  }

  const typeResult = checkType(card, inventory, nowMs);
  const gates = [
    checkObservation(card, nowMs),
    checkTarget(card, inventory),
    checkNovelty(card, inventory, decisions, nowMs),
    checkBecause(card, inventory),
    checkSkeptic(card),
    contractGate,
    checkBudget(budget),
    typeResult.gate
  ];
  const publishable = gates.every((result) => result.pass);
  const penalty = card.skeptic.verdict === 'DOWNGRADE' ? GATE_THRESHOLDS.skepticDowngradePenalty : 0;

  return {
    ...base,
    publishable,
    unverified: typeResult.unverified,
    rank_score: publishable ? Math.max(0, Math.round(card.confidence * 100) - penalty) : 0,
    gates
  };
}

// G7: tak och spridning. Larm går direkt och räknas inte mot morgonbrevet.
// Overifierade kort hamnar aldrig i brevet.
export function selectForBrief(evaluations, limits = BRIEF_LIMITS) {
  const alerts = [];
  const held = [];
  const candidates = [];

  for (const evaluation of evaluations) {
    if (!evaluation.publishable) {
      held.push({ card_id: evaluation.card_id, reason: 'klarade inte grindarna' });
    } else if (evaluation.type === 'LARM') {
      alerts.push(evaluation);
    } else if (evaluation.unverified) {
      held.push({ card_id: evaluation.card_id, reason: 'overifierad – visas bara i fredagssammanfattningen' });
    } else {
      candidates.push(evaluation);
    }
  }

  candidates.sort((a, b) => b.rank_score - a.rank_score || String(a.card_id).localeCompare(String(b.card_id)));

  const brief = [];
  const perArea = new Map();
  for (const evaluation of candidates) {
    const areaCount = perArea.get(evaluation.area) || 0;
    if (brief.length >= limits.maxTotal) {
      held.push({ card_id: evaluation.card_id, reason: `G7: brevet är fullt (${limits.maxTotal})` });
    } else if (areaCount >= limits.maxPerArea) {
      held.push({ card_id: evaluation.card_id, reason: `G7: max ${limits.maxPerArea} per område` });
    } else {
      brief.push(evaluation);
      perArea.set(evaluation.area, areaCount + 1);
    }
  }

  return { brief, alerts, held };
}

export {
  ALLOWED_LICENSES,
  BRIEF_LIMITS,
  GATE_THRESHOLDS,
  GENERIC_PHRASES,
  PRIMARY_GITHUB_OWNERS,
  PRIMARY_HOSTS
};
