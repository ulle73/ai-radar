// Discord-kort för AI Radar v2 (docs/V2-SPEC.md avsnitt 7.2). Byggs här, i repot, och sparas som
// discord_json i GK_R2_CARDS; n8n postar bara färdiga meddelanden.
// Gränser (Discord, kontrollerat 2026-10-19): högst 5 knappar per rad, custom_id 1–100 tecken,
// knappetikett högst 80 tecken, embed-beskrivning högst 4096, rubrik högst 256.

const STYLE = Object.freeze({ primary: 1, secondary: 2, success: 3, danger: 4 });

const TYPE_LABEL = Object.freeze({
  NY: '🆕 NY',
  ERSATT: '🔁 ERSÄTT',
  PROJEKT: '🛠️ PROJEKT',
  ANVAND: '💡 ANVÄND',
  LARM: '🚨 LARM'
});

const AREA_LABEL = Object.freeze({
  tools_hub: 'Verktyg & hubb',
  social: 'Sociala & konkurrenter',
  sales: 'Försäljning & siffror',
  projects: 'Projekt & kod'
});

// Orsaker som går att välja med ett tryck (spec avsnitt 10).
const REASONS = Object.freeze([
  { code: 'known', label: 'Visste redan', style: STYLE.secondary },
  { code: 'generic', label: 'För generiskt', style: STYLE.secondary },
  { code: 'wrong', label: 'Fel fakta', style: STYLE.secondary },
  { code: 'build', label: 'Bygg detta!', style: STYLE.success }
]);

const DECISIONS = Object.freeze({ ok: 'OK', no: 'NEJ', later: 'INTE_NU' });

function cut(text, max) {
  const value = String(text ?? '').trim();
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

function button(label, customId, style) {
  if (customId.length > 100) throw new Error(`custom_id för långt (${customId.length}): ${customId}`);
  return { type: 2, style, label: cut(label, 80), custom_id: customId };
}

export function cardComponents(cardId) {
  const id = String(cardId);
  return [
    {
      type: 1,
      components: [
        button('OK', `r2:ok:${id}`, STYLE.success),
        button('Nej', `r2:no:${id}`, STYLE.danger),
        button('Inte nu', `r2:later:${id}`, STYLE.secondary),
        button('Mer info', `r2:more:${id}`, STYLE.primary)
      ]
    },
    { type: 1, components: [1, 2, 3, 4, 5].map((n) => button(String(n), `r2:rate:${n}:${id}`, STYLE.secondary)) },
    { type: 1, components: [6, 7, 8, 9, 10].map((n) => button(String(n), `r2:rate:${n}:${id}`, STYLE.secondary)) },
    { type: 1, components: REASONS.map((reason) => button(reason.label, `r2:why:${reason.code}:${id}`, reason.style)) }
  ];
}

// Formuleringarna följer Jonas mallar i specen ("denna skill bör ni använda för att …").
function lead(card) {
  const target = card.target?.ref ? `\`${card.target.ref}\`` : '';
  switch (card.type) {
    case 'NY': return `**Använd ${target}.** Ni har inget som gör just detta.`;
    case 'ERSATT': return `**${target} bör ersätta \`${card.replaces}\`.**`;
    case 'PROJEKT': return `**Gör detta i ${target}.**`;
    case 'ANVAND': return '**Det här bör ni använda.**';
    case 'LARM': return '**Tidskritiskt – titta på detta i dag.**';
    default: return '';
  }
}

export function formatCardMessage(card, evaluation = {}) {
  const lines = [lead(card), cut(card.recommendation, 400), '', `**För att:** ${cut(card.because, 700)}`];

  const evidence = (card.observations || []).slice(0, 3)
    .map((observation) => `• ${cut(observation.value, 220)}${observation.url ? ` ([källa](${observation.url}))` : ''}`);
  if (evidence.length) lines.push('', '**Bevis**', ...evidence);

  if (card.rule_text) lines.push('', '**Regel**', `> ${cut(card.rule_text, 400).replace(/\n/g, '\n> ')}`);
  if (card.measure) lines.push('', `**Mått:** ${cut(card.measure.metric, 160)} · baslinje ${cut(card.measure.baseline, 120)} · kontroll efter ${card.measure.check_after_days} dagar`);

  lines.push('', `**Vid OK:** ${cut(card.action_on_ok, 300)}`);
  const effort = card.effort_hours > 0 ? `~${card.effort_hours} h` : 'okänd';
  const cost = card.monthly_cost_sek > 0 ? `~${card.monthly_cost_sek} kr/mån` : '0 kr';
  lines.push(`**Insats:** ${effort} · **Kostnad:** ${cost} · **Säkerhet:** ${Math.round((card.confidence || 0) * 100)} %`);
  if (card.skeptic?.verdict === 'DOWNGRADE') lines.push(`*Skeptikern tvekar:* ${cut(card.skeptic.reason, 200)}`);

  const embed = {
    title: cut(card.title, 256),
    description: cut(lines.filter((line, index, all) => !(line === '' && all[index - 1] === '')).join('\n'), 4000),
    footer: { text: cut(`${card.card_id} · ${AREA_LABEL[card.area] || card.area} · rang ${evaluation.rank_score ?? '–'}`, 2048) }
  };
  const firstUrl = (card.observations || []).find((observation) => observation.url)?.url;
  if (firstUrl) embed.url = firstUrl;

  return {
    content: `${TYPE_LABEL[card.type] || card.type} · **${AREA_LABEL[card.area] || card.area}** · AI Radar v2`,
    embeds: [embed],
    components: cardComponents(card.card_id)
  };
}

// ---------------------------------------------------------------- förbättringsmotorn (harness, etapp 1a)
// Beslutspunkter använder r2:ok/r2:no; OK är bundet till diffens sha256 (r2:ok:<kort>:<sha256>).
// Nödbromsen (r2:brake:on|off) och godkännandet av skyddsräckespaketet (r2:policy:approve:<sha256>)
// godtas bara från Jonas Discord-ID; kontrollen görs i n8n (R2 – Card Feedback) och speglas här.

export const JONAS_DISCORD_ID = '388380559606546432';
const SHA256 = /^[0-9a-f]{64}$/;

export function isJonas(userId) {
  return String(userId || '') === JONAS_DISCORD_ID;
}

export function decisionComponents(cardId, diffSha256 = null) {
  const id = String(cardId);
  return [{
    type: 1,
    components: [
      button('OK', diffSha256 ? `r2:ok:${id}:${diffSha256}` : `r2:ok:${id}`, STYLE.success),
      button('Nej', `r2:no:${id}`, STYLE.danger),
      button('Mer info', `r2:more:${id}`, STYLE.primary),
      button('Nödbroms', 'r2:brake:on', STYLE.danger)
    ]
  }];
}

export function harnessControlComponents({ guardrailHash = null, brake = null } = {}) {
  const buttons = [];
  if (guardrailHash) buttons.push(button('Godkänn skyddsräckena', `r2:policy:approve:${guardrailHash}`, STYLE.success));
  buttons.push(brake === 'on' ? button('Släpp nödbromsen', 'r2:brake:off', STYLE.secondary) : button('Nödbroms', 'r2:brake:on', STYLE.danger));
  return [{ type: 1, components: buttons }];
}

// Beslutspunkt (CUJ 3): vad, varför, belägg, diffen och dess sha256, kostnad, hur det ångras, standardutfall.
export function formatDecisionMessage(card, { reason, diff = '', diffSha256 = null, validUntil = null } = {}) {
  const lines = [
    `**Kräver ditt OK:** ${cut(reason, 300)}`,
    `**Vad:** ${cut(card.recommendation || card.title, 300)}`,
    `**Varför:** ${cut(card.because, 400)}`,
    card.mistake_ref ? `**Belägg:** lärdomsnyckeln \`${card.mistake_ref}\`${card.measure ? ` (${cut(card.measure.baseline, 80)})` : ''}` : null,
    '**Kostnad:** 0 kr (lokala körningar på abonnemanget)',
    '**Ångra:** `hub.py rollback --card` publicerar en revert med högre version.',
    `**Standardutfall:** avvisas om inget svar på 30 dagar${validUntil ? ` (giltigt till ${String(validUntil).slice(0, 10)})` : ''}.`,
    diffSha256 ? `**Diffens sha256:** \`${diffSha256}\`` : '**Diff:** ännu ingen; ett OK låter utföraren ta fram den, och diffen kommer sedan som en egen beslutspunkt.'
  ].filter(Boolean);
  if (diff) lines.push('', '```diff', cut(diff, 2400).replace(/```/g, "'''"), '```');
  return {
    content: `🧭 **Beslutspunkt** · harness · ${card.card_id}`,
    embeds: [{ title: cut(card.title, 256), description: cut(lines.join('\n'), 4000), footer: { text: cut(`${card.card_id} · ${card.target?.ref || ''}`, 2048) } }],
    components: decisionComponents(card.card_id, diffSha256),
    allowed_mentions: { parse: [] }
  };
}

// Tolkar custom_id från knapparna ovan. Okända eller felaktiga id ger null.
export function parseCardCustomId(customId) {
  const parts = String(customId || '').split(':');
  if (parts[0] !== 'r2') return null;
  const cardPattern = /^R2-[A-Za-z0-9-]{4,}$/;
  const [, kind] = parts;
  if (kind === 'brake' && parts.length === 3 && ['on', 'off'].includes(parts[2])) return { kind: 'brake', value: parts[2] };
  if (kind === 'policy' && parts.length === 4 && parts[2] === 'approve' && SHA256.test(parts[3])) {
    return { kind: 'policy_approve', hash: parts[3] };
  }
  if (kind === 'ok' && parts.length === 4 && cardPattern.test(parts[2]) && SHA256.test(parts[3])) {
    return { kind: 'decision', decision: 'OK', card_id: parts[2], diff_sha256: parts[3] };
  }
  if (kind in DECISIONS && parts.length === 3 && cardPattern.test(parts[2])) {
    return { kind: 'decision', decision: DECISIONS[kind], card_id: parts[2] };
  }
  if (kind === 'more' && parts.length === 3 && cardPattern.test(parts[2])) return { kind: 'more', card_id: parts[2] };
  if (kind === 'rate' && parts.length === 4 && cardPattern.test(parts[3])) {
    const rating = Number(parts[2]);
    return Number.isInteger(rating) && rating >= 1 && rating <= 10 ? { kind: 'rate', rating, card_id: parts[3] } : null;
  }
  if (kind === 'why' && parts.length === 4 && cardPattern.test(parts[3]) && REASONS.some((reason) => reason.code === parts[2])) {
    return { kind: 'why', reason: parts[2], card_id: parts[3] };
  }
  return null;
}

export { AREA_LABEL, DECISIONS, REASONS, TYPE_LABEL };
