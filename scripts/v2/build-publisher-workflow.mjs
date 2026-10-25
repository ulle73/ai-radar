// Genererar n8n/r2-discord-publisher.workflow.ts med det delade blocket från scripts/lib/v2/brief.mjs.
//
//   node scripts/v2/build-publisher-workflow.mjs
//
// Kör efter varje ändring i blocket. tests/v2-brief.test.mjs fallerar om kopian och källan skiljer sig.
import { readFileSync, writeFileSync } from 'node:fs';

const repo = new URL('../..', import.meta.url);
const path = (relative) => new URL(relative, repo);
const source = readFileSync(path('scripts/lib/v2/brief.mjs'), 'utf8');
const block = source.slice(source.indexOf('// <r2-publisher-shared>'), source.indexOf('// </r2-publisher-shared>'));
if (/[`\\]|\$\{/.test(block)) throw new Error('blocket innehåller tecken som inte får finnas i en mallsträng');

const CARDS = "{ __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' }";
const OBS = "{ __rl: true, mode: 'id', value: 'XIxpm5C3OmOaJTcM', cachedResultName: 'GK_R2_OBSERVATIONS' }";
const COSTS = "{ __rl: true, mode: 'id', value: 'FymMtRPIcmlaHUDv', cachedResultName: 'GK_R2_COSTS' }";
const col = (id, type) => `{ id: '${id}', displayName: '${id}', required: false, defaultMatch: false, display: true, type: '${type}', canBeUsedToMatch: true }`;

const ts = `import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

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
    parameters: { resource: 'row', operation: 'get', dataTableId: ${CARDS}, returnAll: true },
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
      jsCode: \`${block}
const mode = $('Alarm Check 15 min').isExecuted ? 'alarm' : 'brief';
return selectCards($input.all().map((item) => item.json), mode, new Date().toISOString()).map((json) => ({ json }));\`
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
      jsCode: \`// Svaren kommer i samma ordning som korten. Misslyckade kort står kvar som SHADOW och provas igen.
const picked = $('Select Cards').all();
const posted = [];
const errors = [];
$input.all().forEach((item, index) => {
  const cardId = picked[index] ? picked[index].json.card_id : null;
  if (cardId && item.json && item.json.id) posted.push({ card_id: cardId, message_id: String(item.json.id) });
  else errors.push((cardId || 'okänt kort') + ': ' + JSON.stringify(item.json && item.json.error ? item.json.error : item.json).slice(0, 200));
});
if (!posted.length && errors.length) throw new Error('Inget kort kunde postas till Discord. ' + errors.join(' | '));
return posted.map((json, index) => ({ json: Object.assign({}, json, index === 0 ? { failed_count: errors.length, errors: errors.join(' | ') } : {}) }));\`
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
      dataTableId: ${CARDS},
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'card_id', condition: 'eq', keyValue: expr('{{ $json.card_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { status: 'PUBLISHED', discord_message_id: expr('{{ $json.message_id }}'), posted_at: expr('{{ $now.toISO() }}') },
        schema: [
          ${col('status', 'string')},
          ${col('discord_message_id', 'string')},
          ${col('posted_at', 'dateTime')}
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
      jsCode: \`// De kort som postades är nu markerade. Fel för resten går till felflödet.
const first = $('Keep Posted').first().json;
if (first.failed_count) throw new Error(first.failed_count + ' kort kunde inte postas till Discord: ' + first.errors);
return [];\`
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
      dataTableId: ${OBS},
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
    parameters: { resource: 'row', operation: 'get', dataTableId: ${COSTS}, returnAll: true },
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
      jsCode: \`${block}
const cards = $('Get Cards').all().map((item) => item.json);
const observations = $('Get Digest Observations').all().map((item) => item.json);
const costs = $input.all().map((item) => item.json);
return [{ json: buildDigest(cards, observations, costs, new Date().toISOString()) }];\`
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
      jsCode: \`return ($('Build Digest').first().json.observation_ids || []).map((observation_id) => ({ json: { observation_id } }));\`
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
      dataTableId: ${OBS},
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'observation_id', condition: 'eq', keyValue: expr('{{ $json.observation_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { status: 'DIGESTED' },
        schema: [${col('status', 'string')}]
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
`;

writeFileSync(path('n8n/r2-discord-publisher.workflow.ts'), ts);
console.log(`n8n/r2-discord-publisher.workflow.ts: ${ts.length} tecken`);
