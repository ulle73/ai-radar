import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

const sampleParsed = {
  route: 2,
  kind: 'decision',
  decision: 'OK',
  rating: 7,
  reason: 'generic',
  card_id: 'R2-20261019-948277ff',
  user_id: '388380559606546432',
  message_id: '1',
  interaction_id: '1',
  at: '2026-10-25T08:00:00.000Z'
};

const feedbackTrigger = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.2,
  config: { name: 'From Discord Interactions', parameters: { inputSource: 'passthrough' }, position: [0, 400] },
  output: [{ custom_id: 'r2:ok:R2-20261019-948277ff', user_id: '388380559606546432', message_id: '1', interaction_id: '1' }]
});

const parseButton = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Card Button',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `// Spegel av parseCardCustomId i ulle73/ai-radar scripts/lib/v2/discord.mjs (testad där).
const JONAS_ID = '388380559606546432';
const input = $input.first().json || {};
const reply = (content) => [{ json: { route: 0, reply: content } }];
if (String(input.user_id || '') !== JONAS_ID) return reply('Endast Jonas kan besluta om och betygsätta AI Radar-kort.');

const parts = String(input.custom_id || '').split(':');
const cardPattern = /^R2-[A-Za-z0-9-]{4,}$/;
const decisions = { ok: 'OK', no: 'NEJ', later: 'INTE_NU' };
const reasons = ['known', 'generic', 'wrong', 'build'];
let parsed = null;
if (parts[0] === 'r2') {
  const kind = parts[1];
  if (decisions[kind] && parts.length === 3 && cardPattern.test(parts[2])) parsed = { kind: 'decision', decision: decisions[kind], card_id: parts[2] };
  else if (kind === 'more' && parts.length === 3 && cardPattern.test(parts[2])) parsed = { kind: 'more', card_id: parts[2] };
  else if (kind === 'rate' && parts.length === 4 && cardPattern.test(parts[3])) {
    const rating = Number(parts[2]);
    if (Number.isInteger(rating) && rating >= 1 && rating <= 10) parsed = { kind: 'rate', rating, card_id: parts[3] };
  } else if (kind === 'why' && parts.length === 4 && cardPattern.test(parts[3]) && reasons.includes(parts[2])) {
    parsed = { kind: 'why', reason: parts[2], card_id: parts[3] };
  }
}
if (!parsed) return reply('Knappen kunde inte hanteras.');
const routes = { more: 1, decision: 2, rate: 3, why: 4 };
return [{ json: {
  route: routes[parsed.kind],
  ...parsed,
  user_id: String(input.user_id),
  message_id: String(input.message_id || ''),
  interaction_id: String(input.interaction_id || ''),
  at: new Date().toISOString()
} }];`
    },
    position: [220, 400]
  },
  output: [sampleParsed]
});

const routeButton = switchCase({
  version: 3.4,
  config: {
    name: 'Route Card Button',
    parameters: { mode: 'expression', numberOutputs: 5, output: expr('{{ $json.route }}') },
    position: [440, 400]
  }
});

const replyOnly = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Reply Rejected',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `return [{ json: { type: 4, data: { flags: 64, content: String($input.first().json.reply || 'Knappen kunde inte hanteras.') } } }];`
    },
    position: [660, 100]
  }
});

const getCard = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Card',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'card_id', condition: 'eq', keyValue: expr('{{ $json.card_id }}') }] },
      returnAll: false,
      limit: 1
    },
    position: [660, 250]
  },
  output: [{ card_id: 'R2-20261019-948277ff', card_json: '{}', gates_json: '[]', rank_score: 99, decision: null, rating: null }]
});

const formatMore = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Format More Info',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const row = $input.first().json || {};
if (!row.card_id) return [{ json: { type: 4, data: { flags: 64, content: 'Kortet hittades inte.' } } }];
const parse = (value, fallback) => { try { return JSON.parse(value); } catch (error) { return fallback; } };
const card = parse(row.card_json, {});
const gates = parse(row.gates_json, []);
const cut = (text, max) => { const t = String(text || ''); return t.length <= max ? t : t.slice(0, max - 1) + '…'; };
const lines = [];
lines.push('**Grindar:** ' + gates.map((gate) => (gate.pass ? '✅ ' : '❌ ') + gate.id).join(' · '));
if (card.skeptic) lines.push('**Skeptiker (' + card.skeptic.verdict + '):** ' + cut(card.skeptic.reason, 500));
lines.push('', '**All evidens**');
for (const observation of (card.observations || []).slice(0, 10)) {
  lines.push('• ' + cut(observation.value, 200) + (observation.url ? ' ([källa](' + observation.url + '))' : '') + ' · ' + String(observation.observed_at || '').slice(0, 10));
}
if (card.test && card.test.task) lines.push('', '**Test som återstår:** ' + cut(card.test.task, 300));
if (card.risk) lines.push('**Risk:** ' + cut(card.risk, 300));
if (card.anchors && card.anchors.length) lines.push('**Bygger på:** ' + card.anchors.map((anchor) => anchor.kind + ':' + anchor.ref).join(', '));
lines.push('', 'Beslut: ' + (row.decision || '–') + ' · Betyg: ' + (row.rating || '–') + ' · Rang: ' + (row.rank_score ?? '–') + ' · ' + row.card_id);
return [{ json: { type: 4, data: { flags: 64, content: '**Mer info**', embeds: [{ title: cut(card.title || row.card_id, 256), description: cut(lines.join('\\n'), 4000) }] } } }];`
    },
    position: [880, 250]
  }
});

const saveDecision = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Save Decision',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'card_id', condition: 'eq', keyValue: expr('{{ $json.card_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { decision: expr('{{ $json.decision }}'), decided_at: expr('{{ $json.at }}') },
        schema: [
          { id: 'decision', displayName: 'decision', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'decided_at', displayName: 'decided_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true }
        ]
      }
    },
    position: [660, 400]
  },
  output: [{ id: 1 }]
});

const saveRating = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Save Rating',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'card_id', condition: 'eq', keyValue: expr('{{ $json.card_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { rating: expr('{{ $json.rating }}') },
        schema: [
          { id: 'rating', displayName: 'rating', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: true }
        ]
      }
    },
    position: [660, 550]
  },
  output: [{ id: 1 }]
});

const saveReason = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Save Reason',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'card_id', condition: 'eq', keyValue: expr('{{ $json.card_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { reason: expr('{{ $json.reason }}') },
        schema: [
          { id: 'reason', displayName: 'reason', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    },
    position: [660, 700]
  },
  output: [{ id: 1 }]
});

const replySaved = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Reply Saved',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const p = $('Parse Card Button').first().json;
// Uppdateringen ger ingen rad om kortet saknas (alwaysOutputData ger då ett tomt objekt).
if (!Object.keys($input.first().json || {}).length) return [{ json: { type: 4, data: { flags: 64, content: 'Kortet hittades inte. Inget sparades.' } } }];
const decisionText = {
  OK: '**OK** sparat. Utförandet (hubb, PR eller regel) automatiseras i fas 3; tills dess gör vi det tillsammans.',
  NEJ: '**Nej** sparat. Samma sak lyfts inte igen utan ny evidens.',
  INTE_NU: '**Inte nu** sparat. Vi tar upp det igen tidigast om 90 dagar.'
};
const reasonText = { known: 'Visste redan', generic: 'För generiskt', wrong: 'Fel fakta', build: 'Bygg detta!' };
let content = 'Sparat.';
if (p.kind === 'decision') content = decisionText[p.decision] || 'Beslut sparat.';
if (p.kind === 'rate') content = 'Betyg **' + p.rating + '/10** sparat.';
if (p.kind === 'why') content = 'Orsak sparad: **' + (reasonText[p.reason] || p.reason) + '**.';
return [{ json: { type: 4, data: { flags: 64, content } } }];`
    },
    position: [880, 550]
  }
});

export default workflow('r2-card-feedback', 'R2 – Card Feedback')
  .add(feedbackTrigger)
  .to(parseButton)
  .to(routeButton
    .onCase(0, replyOnly)
    .onCase(1, getCard.to(formatMore))
    .onCase(2, saveDecision.to(replySaved))
    .onCase(3, saveRating.to(replySaved))
    .onCase(4, saveReason.to(replySaved)));
