import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

// R2 – Discord Publisher: morgonbrev vardagar 07:30, direktlarm var 15:e minut och fredagssammanfattning 15:00
// (docs/V2-SPEC.md avsnitt 3 och 6.3). Urvalet och sammanfattningen är en ordagrann kopia av blocket i
// scripts/lib/v2/brief.mjs (testat i tests/v2-brief.test.mjs). Ändra där och generera om kopian här.

const sampleCard = {
  card_id: 'R2-20261019-948277ff', dedupe_key: 'card:red_ci:ulle73/golfkuponger-app', area: 'projects', type: 'PROJEKT',
  title: 'Åtgärda återkommande CI-fel i golfkuponger-app', status: 'SHADOW', publishable: true, unverified: false, rank_score: 99,
  judged_at: '2026-10-19T12:32:43.776Z', card_json: '{}', discord_json: '{}', decision: null, decided_at: null, rating: null,
  reason: null, discord_message_id: null, posted_at: null
};

const morningBrief = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: { name: 'Morning Brief 07:30', parameters: { rule: { interval: [{ field: 'cronExpression', expression: '30 7 * * 1-5' }] } }, position: [0, 200] },
  output: [{}]
});

const alarmCheck = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: { name: 'Alarm Check 15 min', parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 15 }] } }, position: [0, 400] },
  output: [{}]
});

const fridayDigest = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: { name: 'Friday Digest 15:00', parameters: { rule: { interval: [{ field: 'cronExpression', expression: '0 15 * * 5' }] } }, position: [0, 600] },
  output: [{}]
});

const getCards = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Cards',
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: { __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' }, returnAll: true },
    position: [240, 400]
  },
  output: [sampleCard]
});

const routeRun = switchCase({
  version: 3.4,
  config: {
    name: 'Route Run',
    parameters: { mode: 'expression', numberOutputs: 2, output: expr("{{ $('Friday Digest 15:00').isExecuted ? 1 : 0 }}") },
    position: [480, 400]
  }
});

const selectCards = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Select Cards',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `// <r2-publisher-shared>
const R2_RULES = { maxCards: 3, maxPerArea: 2, maxAlarms: 5, decisionCooldownDays: 90, newsLines: 15, waitingLines: 10, budgetSek: 250, descriptionBudget: 4000 };
const R2_DAY_MS = 24 * 60 * 60 * 1000;
const R2_NL = String.fromCharCode(10);
const R2_TZ = { timeZone: 'Europe/Stockholm' };

function r2Time(value) {
  const ms = Date.parse(value || '');
  return Number.isFinite(ms) ? ms : null;
}

function r2Parse(value, fallback) {
  try { return JSON.parse(value); } catch (error) { return fallback; }
}

function r2Cut(text, max) {
  const value = String(text == null ? '' : text).trim();
  return value.length <= max ? value : value.slice(0, max - 1).trimEnd() + '…';
}

function r2Key(row) {
  return row.dedupe_key || row.card_id;
}

function r2Date(ms, options) {
  return new Date(ms).toLocaleDateString('sv-SE', Object.assign({}, R2_TZ, options || {}));
}

function r2Week(ms) {
  const date = new Date(ms);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((date - firstThursday) / R2_DAY_MS - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

// Samma sak lyfts inte igen medan ett publicerat kort väntar på beslut, eller inom 90 dagar efter ett beslut.
function r2BlockedKeys(rows, nowMs) {
  const blocked = new Set();
  for (const row of rows) {
    const decidedMs = r2Time(row.decided_at);
    const pending = row.status === 'PUBLISHED' && !row.decision;
    const recent = Boolean(row.decision) && decidedMs !== null && nowMs - decidedMs <= R2_RULES.decisionCooldownDays * R2_DAY_MS;
    if (pending || recent) blocked.add(r2Key(row));
  }
  return blocked;
}

// Fail closed: bara färdiga, godkända och verifierade kort som inte gått ut och aldrig postats.
function r2Eligible(row, nowMs) {
  if (row.status !== 'SHADOW' || row.publishable !== true || row.unverified !== false) return false;
  if (row.decision || row.discord_message_id || !row.discord_json) return false;
  const card = r2Parse(row.card_json, null);
  const expiresMs = card ? r2Time(card.expires_at) : null;
  return expiresMs !== null && expiresMs > nowMs;
}

function r2ByRank(a, b) {
  return (Number(b.rank_score) || 0) - (Number(a.rank_score) || 0) || (r2Time(b.judged_at) || 0) - (r2Time(a.judged_at) || 0);
}

// mode 'brief': högst 3 kort och högst 2 per område, inga LARM. mode 'alarm': bara LARM.
// Ett kort per dedupe_key (högst rang, sedan nyast).
function selectCards(rows, mode, now) {
  const nowMs = r2Time(now);
  const alarm = mode === 'alarm';
  const valid = rows.filter((row) => row && row.card_id);
  const blocked = r2BlockedKeys(valid, nowMs);
  const candidates = valid
    .filter((row) => (row.type === 'LARM') === alarm && r2Eligible(row, nowMs) && !blocked.has(r2Key(row)))
    .sort(r2ByRank);
  const picked = [];
  const keys = new Set();
  const perArea = {};
  for (const row of candidates) {
    if (picked.length >= (alarm ? R2_RULES.maxAlarms : R2_RULES.maxCards)) break;
    if (keys.has(r2Key(row))) continue;
    if (!alarm && (perArea[row.area] || 0) >= R2_RULES.maxPerArea) continue;
    keys.add(r2Key(row));
    perArea[row.area] = (perArea[row.area] || 0) + 1;
    picked.push(row);
  }
  return picked.map((row, index) => {
    const message = r2Parse(row.discord_json, {});
    if (!alarm && index === 0) {
      const header = '☀️ **Morgonbrev ' + r2Date(nowMs, { weekday: 'long', day: 'numeric', month: 'long' }) + '** · ' + picked.length + ' kort';
      message.content = r2Cut(header + R2_NL + (message.content || ''), 2000);
    }
    return { card_id: row.card_id, message };
  });
}

function r2Percent(part, whole) {
  return whole ? Math.round((part / whole) * 100) + ' %' : '–';
}

// Fredagssammanfattningen. Returnerar meddelandet och de DIGEST-observationer som togs med,
// så att n8n kan markera just dem som DIGESTED (resten väntar till nästa vecka).
function buildDigest(cardRows, observationRows, costRows, now) {
  const nowMs = r2Time(now);
  const weekAgoMs = nowMs - 7 * R2_DAY_MS;
  const inWeek = (value) => { const ms = r2Time(value); return ms !== null && ms > weekAgoMs && ms <= nowMs; };
  const cards = cardRows.filter((row) => row && row.card_id);
  const judged = cards.filter((row) => inWeek(row.judged_at));
  const posted = cards.filter((row) => inWeek(row.posted_at));
  const decided = cards.filter((row) => row.decision && inWeek(row.decided_at));
  const decisionCount = (value) => decided.filter((row) => row.decision === value).length;
  const rated = posted.filter((row) => Number(row.rating) >= 1);
  const weak = posted.filter((row) => row.reason === 'known' || row.reason === 'generic').length;
  const monthKey = r2Date(nowMs, { year: 'numeric', month: '2-digit' });
  const spent = costRows.filter((row) => row && row.month === monthKey).reduce((sum, row) => sum + (Number(row.cost_sek) || 0), 0);

  const lines = ['**Veckan i siffror**'];
  lines.push('Kort bedömda: ' + judged.length + ' · publicerade: ' + posted.length + ' · beslut: OK ' + decisionCount('OK') + ', Nej ' + decisionCount('NEJ') + ', Inte nu ' + decisionCount('INTE_NU'));
  if (rated.length) {
    const average = rated.reduce((sum, row) => sum + Number(row.rating), 0) / rated.length;
    lines.push('Snittbetyg: ' + average.toLocaleString('sv-SE', { maximumFractionDigits: 1 }) + ' (' + rated.length + ' betyg) · mål minst 7');
  } else {
    lines.push('Snittbetyg: inga betyg den här veckan · mål minst 7');
  }
  lines.push('Visste redan eller För generiskt: ' + weak + ' av ' + posted.length + ' publicerade (' + r2Percent(weak, posted.length) + ') · mål högst 20 %');
  lines.push('Kostnad ' + r2Date(nowMs, { month: 'long' }) + ': ' + spent.toLocaleString('sv-SE', { maximumFractionDigits: 2 }) + ' kr av ' + R2_RULES.budgetSek + ' kr');

  lines.push('', '**Fick OK**');
  const approved = decided.filter((row) => row.decision === 'OK');
  if (approved.length) for (const row of approved) lines.push('• ' + r2Cut(row.title, 150));
  else lines.push('Inga kort fick OK den här veckan.');
  lines.push('Utförande och effektmätning kopplas på i fas 3.');

  lines.push('', '**Väntar på beslut**');
  const waiting = cards.filter((row) => row.status === 'PUBLISHED' && !row.decision).sort((a, b) => (r2Time(a.posted_at) || 0) - (r2Time(b.posted_at) || 0));
  for (const row of waiting.slice(0, R2_RULES.waitingLines)) {
    const postedMs = r2Time(row.posted_at);
    lines.push('• ' + r2Cut(row.title, 150) + (postedMs ? ' · ' + r2Date(postedMs) : ''));
  }
  if (waiting.length > R2_RULES.waitingLines) lines.push('… och ' + (waiting.length - R2_RULES.waitingLines) + ' till');
  if (!waiting.length) lines.push('Inget väntar.');

  // Nyheterna tas med så länge de ryms. Bara de som faktiskt visas markeras, så att inget klipps bort i tysthet.
  lines.push('', '**Mindre nyheter**');
  const news = observationRows.filter((row) => row && row.observation_id && row.status === 'DIGEST')
    .sort((a, b) => (r2Time(b.observed_at) || 0) - (r2Time(a.observed_at) || 0));
  const included = [];
  let used = lines.join(R2_NL).length;
  for (const row of news) {
    if (included.length >= R2_RULES.newsLines) break;
    const line = '• ' + r2Cut(row.value, 160) + (row.url ? ' ([källa](' + row.url + '))' : '');
    if (used + line.length + 1 > R2_RULES.descriptionBudget) break;
    lines.push(line);
    used += line.length + 1;
    included.push(row);
  }
  if (news.length > included.length) lines.push('… och ' + (news.length - included.length) + ' till nästa vecka');
  if (!news.length) lines.push('Inga den här veckan.');

  const message = {
    content: '📅 **Fredagssammanfattning v. ' + r2Week(nowMs) + '** · AI Radar v2',
    embeds: [{
      title: 'Veckan ' + r2Date(weekAgoMs + R2_DAY_MS) + ' – ' + r2Date(nowMs),
      description: r2Cut(lines.join(R2_NL), 4096)
    }]
  };
  return { message, observation_ids: included.map((row) => row.observation_id) };
}

const mode = $('Alarm Check 15 min').isExecuted ? 'alarm' : 'brief';
return selectCards($input.all().map((item) => item.json), mode, new Date().toISOString()).map((json) => ({ json }));`
    },
    position: [720, 300]
  },
  output: [{ card_id: 'R2-20261019-948277ff', message: { content: 'x', embeds: [], components: [] } }]
});

const postCard = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Post Card to #ai-radar',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: 'https://discord.com/api/v10/channels/1550641582208712806/messages',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'discordBotApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.message) }}'),
      options: { timeout: 10000, batching: { batch: { batchSize: 1, batchInterval: 1500 } } }
    },
    credentials: { discordBotApi: { id: '2Pwo6eNhWtKkqI7C', name: 'AI Radar Discord Bot' } },
    position: [960, 300]
  },
  output: [{ id: '1430000000000000000', channel_id: '1550641582208712806' }]
});

const keepPosted = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Keep Posted',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `// Svaren kommer i samma ordning som korten. Misslyckade kort står kvar som SHADOW och provas igen.
const picked = $('Select Cards').all();
const posted = [];
const errors = [];
$input.all().forEach((item, index) => {
  const cardId = picked[index] ? picked[index].json.card_id : null;
  if (cardId && item.json && item.json.id) posted.push({ card_id: cardId, message_id: String(item.json.id) });
  else errors.push((cardId || 'okänt kort') + ': ' + JSON.stringify(item.json && item.json.error ? item.json.error : item.json).slice(0, 200));
});
if (!posted.length && errors.length) throw new Error('Inget kort kunde postas till Discord. ' + errors.join(' | '));
return posted.map((json, index) => ({ json: Object.assign({}, json, index === 0 ? { failed_count: errors.length, errors: errors.join(' | ') } : {}) }));`
    },
    position: [1200, 300]
  },
  output: [{ card_id: 'R2-20261019-948277ff', message_id: '1430000000000000000', failed_count: 0, errors: '' }]
});

const markPublished = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Mark Published',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'card_id', condition: 'eq', keyValue: expr('{{ $json.card_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { status: 'PUBLISHED', discord_message_id: expr('{{ $json.message_id }}'), posted_at: expr('{{ $now.toISO() }}') },
        schema: [
          { id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'discord_message_id', displayName: 'discord_message_id', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'posted_at', displayName: 'posted_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true }
        ]
      }
    },
    position: [1440, 300]
  },
  output: [{ id: 1 }]
});

const reportFailures = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Report Failures',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `// De kort som postades är nu markerade. Fel för resten går till felflödet.
const first = $('Keep Posted').first().json;
if (first.failed_count) throw new Error(first.failed_count + ' kort kunde inte postas till Discord: ' + first.errors);
return [];`
    },
    position: [1680, 300]
  }
});

const getDigestObservations = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Digest Observations',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: 'XIxpm5C3OmOaJTcM', cachedResultName: 'GK_R2_OBSERVATIONS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'status', condition: 'eq', keyValue: 'DIGEST' }] },
      returnAll: true
    },
    position: [720, 560]
  },
  output: [{ observation_id: 'OB-000000000000', status: 'DIGEST', value: 'v', url: '', observed_at: '2026-10-19T00:00:00.000Z' }]
});

const getCosts = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Costs',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: { __rl: true, mode: 'id', value: 'FymMtRPIcmlaHUDv', cachedResultName: 'GK_R2_COSTS' }, returnAll: true },
    position: [960, 560]
  },
  output: [{ month: '2026-10', component: 'judge', model: 'x', cost_sek: 0 }]
});

const buildDigest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Digest',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `// <r2-publisher-shared>
const R2_RULES = { maxCards: 3, maxPerArea: 2, maxAlarms: 5, decisionCooldownDays: 90, newsLines: 15, waitingLines: 10, budgetSek: 250, descriptionBudget: 4000 };
const R2_DAY_MS = 24 * 60 * 60 * 1000;
const R2_NL = String.fromCharCode(10);
const R2_TZ = { timeZone: 'Europe/Stockholm' };

function r2Time(value) {
  const ms = Date.parse(value || '');
  return Number.isFinite(ms) ? ms : null;
}

function r2Parse(value, fallback) {
  try { return JSON.parse(value); } catch (error) { return fallback; }
}

function r2Cut(text, max) {
  const value = String(text == null ? '' : text).trim();
  return value.length <= max ? value : value.slice(0, max - 1).trimEnd() + '…';
}

function r2Key(row) {
  return row.dedupe_key || row.card_id;
}

function r2Date(ms, options) {
  return new Date(ms).toLocaleDateString('sv-SE', Object.assign({}, R2_TZ, options || {}));
}

function r2Week(ms) {
  const date = new Date(ms);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((date - firstThursday) / R2_DAY_MS - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

// Samma sak lyfts inte igen medan ett publicerat kort väntar på beslut, eller inom 90 dagar efter ett beslut.
function r2BlockedKeys(rows, nowMs) {
  const blocked = new Set();
  for (const row of rows) {
    const decidedMs = r2Time(row.decided_at);
    const pending = row.status === 'PUBLISHED' && !row.decision;
    const recent = Boolean(row.decision) && decidedMs !== null && nowMs - decidedMs <= R2_RULES.decisionCooldownDays * R2_DAY_MS;
    if (pending || recent) blocked.add(r2Key(row));
  }
  return blocked;
}

// Fail closed: bara färdiga, godkända och verifierade kort som inte gått ut och aldrig postats.
function r2Eligible(row, nowMs) {
  if (row.status !== 'SHADOW' || row.publishable !== true || row.unverified !== false) return false;
  if (row.decision || row.discord_message_id || !row.discord_json) return false;
  const card = r2Parse(row.card_json, null);
  const expiresMs = card ? r2Time(card.expires_at) : null;
  return expiresMs !== null && expiresMs > nowMs;
}

function r2ByRank(a, b) {
  return (Number(b.rank_score) || 0) - (Number(a.rank_score) || 0) || (r2Time(b.judged_at) || 0) - (r2Time(a.judged_at) || 0);
}

// mode 'brief': högst 3 kort och högst 2 per område, inga LARM. mode 'alarm': bara LARM.
// Ett kort per dedupe_key (högst rang, sedan nyast).
function selectCards(rows, mode, now) {
  const nowMs = r2Time(now);
  const alarm = mode === 'alarm';
  const valid = rows.filter((row) => row && row.card_id);
  const blocked = r2BlockedKeys(valid, nowMs);
  const candidates = valid
    .filter((row) => (row.type === 'LARM') === alarm && r2Eligible(row, nowMs) && !blocked.has(r2Key(row)))
    .sort(r2ByRank);
  const picked = [];
  const keys = new Set();
  const perArea = {};
  for (const row of candidates) {
    if (picked.length >= (alarm ? R2_RULES.maxAlarms : R2_RULES.maxCards)) break;
    if (keys.has(r2Key(row))) continue;
    if (!alarm && (perArea[row.area] || 0) >= R2_RULES.maxPerArea) continue;
    keys.add(r2Key(row));
    perArea[row.area] = (perArea[row.area] || 0) + 1;
    picked.push(row);
  }
  return picked.map((row, index) => {
    const message = r2Parse(row.discord_json, {});
    if (!alarm && index === 0) {
      const header = '☀️ **Morgonbrev ' + r2Date(nowMs, { weekday: 'long', day: 'numeric', month: 'long' }) + '** · ' + picked.length + ' kort';
      message.content = r2Cut(header + R2_NL + (message.content || ''), 2000);
    }
    return { card_id: row.card_id, message };
  });
}

function r2Percent(part, whole) {
  return whole ? Math.round((part / whole) * 100) + ' %' : '–';
}

// Fredagssammanfattningen. Returnerar meddelandet och de DIGEST-observationer som togs med,
// så att n8n kan markera just dem som DIGESTED (resten väntar till nästa vecka).
function buildDigest(cardRows, observationRows, costRows, now) {
  const nowMs = r2Time(now);
  const weekAgoMs = nowMs - 7 * R2_DAY_MS;
  const inWeek = (value) => { const ms = r2Time(value); return ms !== null && ms > weekAgoMs && ms <= nowMs; };
  const cards = cardRows.filter((row) => row && row.card_id);
  const judged = cards.filter((row) => inWeek(row.judged_at));
  const posted = cards.filter((row) => inWeek(row.posted_at));
  const decided = cards.filter((row) => row.decision && inWeek(row.decided_at));
  const decisionCount = (value) => decided.filter((row) => row.decision === value).length;
  const rated = posted.filter((row) => Number(row.rating) >= 1);
  const weak = posted.filter((row) => row.reason === 'known' || row.reason === 'generic').length;
  const monthKey = r2Date(nowMs, { year: 'numeric', month: '2-digit' });
  const spent = costRows.filter((row) => row && row.month === monthKey).reduce((sum, row) => sum + (Number(row.cost_sek) || 0), 0);

  const lines = ['**Veckan i siffror**'];
  lines.push('Kort bedömda: ' + judged.length + ' · publicerade: ' + posted.length + ' · beslut: OK ' + decisionCount('OK') + ', Nej ' + decisionCount('NEJ') + ', Inte nu ' + decisionCount('INTE_NU'));
  if (rated.length) {
    const average = rated.reduce((sum, row) => sum + Number(row.rating), 0) / rated.length;
    lines.push('Snittbetyg: ' + average.toLocaleString('sv-SE', { maximumFractionDigits: 1 }) + ' (' + rated.length + ' betyg) · mål minst 7');
  } else {
    lines.push('Snittbetyg: inga betyg den här veckan · mål minst 7');
  }
  lines.push('Visste redan eller För generiskt: ' + weak + ' av ' + posted.length + ' publicerade (' + r2Percent(weak, posted.length) + ') · mål högst 20 %');
  lines.push('Kostnad ' + r2Date(nowMs, { month: 'long' }) + ': ' + spent.toLocaleString('sv-SE', { maximumFractionDigits: 2 }) + ' kr av ' + R2_RULES.budgetSek + ' kr');

  lines.push('', '**Fick OK**');
  const approved = decided.filter((row) => row.decision === 'OK');
  if (approved.length) for (const row of approved) lines.push('• ' + r2Cut(row.title, 150));
  else lines.push('Inga kort fick OK den här veckan.');
  lines.push('Utförande och effektmätning kopplas på i fas 3.');

  lines.push('', '**Väntar på beslut**');
  const waiting = cards.filter((row) => row.status === 'PUBLISHED' && !row.decision).sort((a, b) => (r2Time(a.posted_at) || 0) - (r2Time(b.posted_at) || 0));
  for (const row of waiting.slice(0, R2_RULES.waitingLines)) {
    const postedMs = r2Time(row.posted_at);
    lines.push('• ' + r2Cut(row.title, 150) + (postedMs ? ' · ' + r2Date(postedMs) : ''));
  }
  if (waiting.length > R2_RULES.waitingLines) lines.push('… och ' + (waiting.length - R2_RULES.waitingLines) + ' till');
  if (!waiting.length) lines.push('Inget väntar.');

  // Nyheterna tas med så länge de ryms. Bara de som faktiskt visas markeras, så att inget klipps bort i tysthet.
  lines.push('', '**Mindre nyheter**');
  const news = observationRows.filter((row) => row && row.observation_id && row.status === 'DIGEST')
    .sort((a, b) => (r2Time(b.observed_at) || 0) - (r2Time(a.observed_at) || 0));
  const included = [];
  let used = lines.join(R2_NL).length;
  for (const row of news) {
    if (included.length >= R2_RULES.newsLines) break;
    const line = '• ' + r2Cut(row.value, 160) + (row.url ? ' ([källa](' + row.url + '))' : '');
    if (used + line.length + 1 > R2_RULES.descriptionBudget) break;
    lines.push(line);
    used += line.length + 1;
    included.push(row);
  }
  if (news.length > included.length) lines.push('… och ' + (news.length - included.length) + ' till nästa vecka');
  if (!news.length) lines.push('Inga den här veckan.');

  const message = {
    content: '📅 **Fredagssammanfattning v. ' + r2Week(nowMs) + '** · AI Radar v2',
    embeds: [{
      title: 'Veckan ' + r2Date(weekAgoMs + R2_DAY_MS) + ' – ' + r2Date(nowMs),
      description: r2Cut(lines.join(R2_NL), 4096)
    }]
  };
  return { message, observation_ids: included.map((row) => row.observation_id) };
}

const cards = $('Get Cards').all().map((item) => item.json);
const observations = $('Get Digest Observations').all().map((item) => item.json);
const costs = $input.all().map((item) => item.json);
return [{ json: buildDigest(cards, observations, costs, new Date().toISOString()) }];`
    },
    position: [1200, 560]
  },
  output: [{ message: { content: 'x', embeds: [] }, observation_ids: ['OB-000000000000'] }]
});

const postDigest = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Post Digest to #ai-radar',
    parameters: {
      method: 'POST',
      url: 'https://discord.com/api/v10/channels/1550641582208712806/messages',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'discordBotApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.message) }}'),
      options: { timeout: 10000 }
    },
    credentials: { discordBotApi: { id: '2Pwo6eNhWtKkqI7C', name: 'AI Radar Discord Bot' } },
    position: [1440, 560]
  },
  output: [{ id: '1430000000000000001' }]
});

const splitDigested = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Split Digested',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `return ($('Build Digest').first().json.observation_ids || []).map((observation_id) => ({ json: { observation_id } }));`
    },
    position: [1680, 560]
  },
  output: [{ observation_id: 'OB-000000000000' }]
});

const markDigested = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Mark Digested',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: 'XIxpm5C3OmOaJTcM', cachedResultName: 'GK_R2_OBSERVATIONS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'observation_id', condition: 'eq', keyValue: expr('{{ $json.observation_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { status: 'DIGESTED' },
        schema: [{ id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }]
      }
    },
    position: [1920, 560]
  },
  output: [{ id: 1 }]
});

export default workflow('r2-discord-publisher', 'R2 – Discord Publisher')
  .add(morningBrief)
  .to(getCards)
  .add(alarmCheck)
  .to(getCards)
  .add(fridayDigest)
  .to(getCards)
  .to(routeRun
    .onCase(0, selectCards.to(postCard).to(keepPosted).to(markPublished).to(reportFailures))
    .onCase(1, getDigestObservations.to(getCosts).to(buildDigest).to(postDigest).to(splitDigested).to(markDigested)));
