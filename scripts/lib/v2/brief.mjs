// Urval till morgonbrev och direktlarm samt fredagssammanfattningen (docs/V2-SPEC.md avsnitt 3,
// 6.1 G7 och 6.3). Raderna är GK_R2_CARDS, GK_R2_OBSERVATIONS och GK_R2_COSTS som n8n läser.
//
// Blocket mellan markeringarna kopieras ordagrant in i n8n-flödet R2 – Discord Publisher
// (n8n/r2-discord-publisher.workflow.ts); tests/v2-brief.test.mjs kontrollerar att kopian är identisk.
// Därför: inga imports, inga backticks, inga bakstreck och inga mallsträngar i blocket.

// <r2-publisher-shared>
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
// </r2-publisher-shared>

export { buildDigest, R2_RULES, selectCards };
