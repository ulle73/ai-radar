// C9 Lärande (harness-designen, etapp 1b). Koden här bestämmer vad som ska skrivas; n8n-flödet
// R2 – Learner (n8n/r2-learner.workflow.ts) skriver det i Notion och läser tillbaka.
//
// - En daterad loggrad per publicerad eller återställd ändring i noden "Gemensamt AI-system" (9.04/ai-system).
// - En rad i Growth Log per vecka, plus en rad per beslut och regression.
// - En uppdatering av nodens aktuella bild varje vecka.
// - Uppföljning enligt measure.check_after_days: när måttet inte nåtts öppnas kortet igen första gången
//   (domaren gör ett nytt kort när mönstret återkommer, eftersom blob-sha i dedupe-nyckeln har ändrats),
//   andra gången blir det en beslutspunkt.
//
// Motorn gör bara tillägg i Notion och skriver aldrig över (Notion-historiken kan vara kort, F1); enda
// undantaget är nodens egen rad "Förbättringsmotorns mått" i Aktuell bild, som byts varje vecka.

const DAY_MS = 86400000;
const MAX_LINE = 600;

export const OUTCOME = Object.freeze({ REACHED: 'nått', REOPENED: 'ej nått: öppnas igen', DECISION: 'ej nått: beslutspunkt' });
export const AGENT = 'R2';

const clean = (text, max = MAX_LINE) => String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const day = (value) => new Date(value).toISOString().slice(0, 10);
const pct = (value) => (value === null || value === undefined || !Number.isFinite(Number(value)) ? '–' : `${Math.round(Number(value) * 100)} %`);

// Loggraden i noden: "<datum> – <text> (R2)". kind: published | rolled_back | outcome | decision.
export function changeEntry({ card, kind, version = null, detail = '', now = new Date() }) {
  const target = card?.target?.ref || 'okänd skill';
  const ref = card?.mistake_ref ? ` [${card.mistake_ref}]` : '';
  const texts = {
    published: `Förbättringsmotorn publicerade gk-karna ${version || ''} med en förtydligad regel i ${target}${ref} (kort ${card.card_id}). ${detail}`,
    rolled_back: `Förbättringsmotorn återställde kort ${card.card_id} i ${target}${ref} efter underkänd probe. ${detail}`,
    outcome: `Uppföljning efter ${card?.measure?.check_after_days || 14} dagar för kort ${card.card_id} (${target}${ref}): ${detail}`,
    decision: `Beslutspunkt för kort ${card.card_id} (${target}${ref}): ${detail}`
  };
  if (!texts[kind]) throw new Error(`okänd loggtyp ${kind}`);
  return { date: day(now), text: clean(`${texts[kind].trim()} (${AGENT})`), marker: `${card.card_id}:${kind}` };
}

// Growth Log-rad (en per vecka, beslut och regression). Typ måste finnas i databasens val.
export function growthLogRow({ kind, title, summary, why = '', now = new Date() }) {
  const types = { weekly: 'Testresultat', decision: 'Beslut', regression: 'Ändrad bedömning' };
  if (!types[kind]) throw new Error(`okänd Growth Log-typ ${kind}`);
  return {
    title: clean(title, 200),
    type: types[kind],
    date: day(now),
    summary: clean(summary, 1900),
    why: clean(why, 1900),
    source: `AI Radar v2 (förbättringsmotorn, ${AGENT}), automatisk rad`
  };
}

// Veckans sammanfattning: måtten mot baslinjen och motorns kort under veckan.
export function weeklySummary({ week, summary, baseline, cards = [], from, to }) {
  const inWeek = (value) => {
    const at = Date.parse(value || '');
    return Number.isFinite(at) && at >= Date.parse(from) && at < Date.parse(to);
  };
  const published = cards.filter((row) => inWeek(row.published_at));
  const rolledBack = cards.filter((row) => inWeek(row.rolled_back_at));
  const decisions = cards.filter((row) => /beslutspunkt/.test(String(row.outcome || '')) && inWeek(row.outcome_at || row.updated_at));
  const metricsLine = `huvudmåttet ${summary.autonomous_verified} självständigt verifierade sessioner (baslinje ${baseline?.autonomous_verified_per_week ?? '–'} per vecka), minnesanvändning ${pct(summary.memory_usage)} (baslinje ${pct(baseline?.memory_usage)}), rättelser ${pct(summary.correction_rate)} (baslinje ${pct(baseline?.correction_rate)}), ${summary.sessions} sessioner`;
  const cardsLine = `${published.length} publicerade, ${rolledBack.length} återställda och ${decisions.length} beslutspunkter`;
  return {
    current: clean(`Förbättringsmotorns mått vecka ${week}: ${metricsLine}. Kort: ${cardsLine}. (${AGENT}, ${day(to)})`, 1900),
    row: growthLogRow({
      kind: 'weekly',
      title: `Förbättringsmotorn vecka ${week}: ${cardsLine}`,
      summary: `Mått (C10): ${metricsLine}. Kort: ${cardsLine}.`,
      why: 'Veckouppföljning av den självförbättrande hubben (mål 5: huvudmåttet +30 %, upprepade lärdomsnycklar −30 %, rättelser inte högre än baslinjen).',
      now: to
    })
  };
}

// Kort som är publicerade, inte återställda, utan utfall och vars uppföljningsdag har passerat.
export function dueForOutcome(rows, now = new Date()) {
  const nowMs = new Date(now).getTime();
  return rows.filter((row) => row.published_version && !row.rolled_back_at && !row.outcome
    && Number.isFinite(Date.parse(row.outcome_due || '')) && Date.parse(row.outcome_due) <= nowMs);
}

const firstNumber = (text) => {
  const match = String(text || '').match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(',', '.')) : null;
};

// Har måttet nåtts? lesson: färre rader med nyckeln under uppföljningsfönstret än i kortets baslinje.
// memory: andelen de senaste 7 dagarna är minst 10 procentenheter högre än när kortet skapades.
export function measureReached({ card, publishedAt, lessons = [], memory = null, now = new Date() }) {
  const days = Number(card?.measure?.check_after_days) || 14;
  if (card?.mistake_ref === 'notion-anvands-inte' || /Notion-anrop/.test(card?.measure?.metric || '')) {
    const before = firstNumber(card?.measure?.baseline);
    if (before === null) return { known: false, reason: 'kortets baslinje saknar ett tal' };
    if (!memory || !(new Date(now).getTime() - Date.parse(memory.at || '') <= 2 * DAY_MS)) {
      return { known: false, reason: 'minnesmåttet för 7 dagar saknas eller är äldre än 2 dygn' };
    }
    const after = Math.round(Number(memory.value) * 100);
    return { known: true, reached: after >= before + 10, detail: `andel Golfkuponger-sessioner med Notion-anrop ${after} % mot ${before} % när kortet skapades` };
  }
  const before = firstNumber(card?.measure?.baseline);
  if (before === null) return { known: false, reason: 'kortets baslinje saknar ett tal' };
  const start = Date.parse(publishedAt);
  const end = start + days * DAY_MS;
  const after = lessons.filter((row) => {
    if (row.key !== card.mistake_ref) return false;
    const at = Date.parse(`${row.date}T12:00:00Z`);
    return at > start && at <= end;
  }).length;
  return { known: true, reached: after < before, detail: `lärdomsnyckeln ${card.mistake_ref}: ${after} rader på ${days} dagar efter publiceringen mot ${before} före` };
}

// Första gången måttet inte nås öppnas kortet igen; andra gången (ett tidigare kort med samma
// mistake_ref har redan utfallet "ej nått") blir det en beslutspunkt.
export function outcomeFor({ result, card, rows }) {
  if (!result.known) return null;
  if (result.reached) return OUTCOME.REACHED;
  const earlierMiss = rows.some((row) => {
    if (!String(row.outcome || '').startsWith('ej nått') || row.card_id === card.card_id) return false;
    try { return JSON.parse(row.card_json || '{}').mistake_ref === card.mistake_ref; } catch { return false; }
  });
  return earlierMiss ? OUTCOME.DECISION : OUTCOME.REOPENED;
}

// Liten lokal reskontra över lärdomsrader (heartbeat skriver, uppföljningen läser). Dedupliceras på text_hash.
export function mergeLessonLedger(ledger, observations, now = new Date(), keepDays = 120) {
  const cutoff = new Date(now).getTime() - keepDays * DAY_MS;
  const rows = new Map((ledger?.rows || []).map((row) => [row.text_hash, row]));
  for (const observation of observations) {
    if (observation.source_kind !== 'notion_lesson') continue;
    const { key, date, text_hash: hash } = observation.data || {};
    if (key && date && hash) rows.set(hash, { key, date, text_hash: hash });
  }
  return { rows: [...rows.values()].filter((row) => Date.parse(`${row.date}T12:00:00Z`) >= cutoff).sort((a, b) => a.date.localeCompare(b.date) || a.text_hash.localeCompare(b.text_hash)) };
}

// Signerat anrop till R2 – Learner. Svaret innehåller readback: true när texten lästs tillbaka ur Notion.
export function learnerClient(post) {
  const call = async (payload) => {
    const response = await post(payload);
    if (response.status !== 200 || !response.body?.ok) throw new Error(`learner svarade ${response.status}: ${response.body?.error || 'okänt fel'}`);
    if (response.body.readback !== true) throw new Error('learner: skrivningen kunde inte läsas tillbaka');
    return response.body;
  };
  return {
    log: (entry) => call({ action: 'log', entry }),
    weekly: ({ current, row }) => call({ action: 'weekly', current, row }),
    growth: (row) => call({ action: 'growth', row })
  };
}
