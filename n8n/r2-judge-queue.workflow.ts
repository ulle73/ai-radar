import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

const sampleCardItem = {
  route: 2,
  kind: 'card',
  card_id: 'R2-20261019-abcdef12',
  dedupe_key: 'card:release:anthropics/claude-code',
  area: 'tools_hub',
  type: 'ANVAND',
  title: 'Titel',
  status: 'SHADOW',
  publishable: true,
  unverified: false,
  rank_score: 70,
  gates_json: '[]',
  card_json: '{}',
  observation_ids_json: '[]',
  judge_model: 'gpt',
  judged_at: '2026-10-19T00:00:00.000Z',
  observation_id: 'OB-000000000000',
  obs_status: 'JUDGED',
  results: 1
};

const queueWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'R2 Judge Queue',
    parameters: {
      httpMethod: 'POST',
      path: 'r2-judge',
      authentication: 'none',
      responseMode: 'responseNode',
      options: { rawBody: true }
    },
    position: [0, 400]
  },
  output: [{ headers: { 'x-r2-timestamp': '1792400000', 'x-r2-signature': 'abc' }, body: {} }]
});

const extractRaw = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Extract Raw Body',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const item = $input.first();
let raw = '';
try {
  const buffer = await this.helpers.getBinaryDataBuffer(0, 'data');
  raw = buffer.toString('utf8');
} catch (error) {
  raw = '';
}
return [{ json: { raw, headers: item.json.headers || {} } }];`
    },
    position: [220, 400]
  },
  output: [{ raw: '{"action":"list_new"}', headers: {} }]
});

const loadConfig = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Load R2 Config',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: 'J89ZBtZWzMgPsOku', cachedResultName: 'GK_R2_CONFIG' },
      returnAll: true
    },
    position: [440, 400]
  },
  output: [{ config_key: 'signing_secret', config_value: 'x', config_number: null }]
});

const verifyRequest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Verify And Parse Request',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const crypto = require('crypto');
const request = $('Extract Raw Body').first().json;
let secret = '';
for (const row of $('Load R2 Config').all()) {
  if (row.json && row.json.config_key === 'signing_secret') secret = String(row.json.config_value || '');
}
const headers = request.headers || {};
const timestamp = String(headers['x-r2-timestamp'] || '');
const signature = String(headers['x-r2-signature'] || '').toLowerCase();
const reject = (reason) => [{ json: { route: 0, reason } }];
if (secret.length < 32) return reject('not_configured');
if (!/^[0-9]{10}$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return reject('stale_timestamp');
const expected = crypto.createHmac('sha256', secret).update(timestamp + '.' + request.raw).digest('hex');
if (!/^[0-9a-f]{64}$/.test(signature) || !crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) return reject('bad_signature');
let body;
try { body = JSON.parse(request.raw); } catch (error) { return reject('invalid_json'); }

if (body.action === 'list_new') {
  const limit = Math.max(1, Math.min(200, Number(body.limit) || 100));
  return [{ json: { route: 1, limit } }];
}
if (body.action !== 'complete') return reject('unknown_action');

const results = Array.isArray(body.results) ? body.results : null;
if (!results || results.length > 50) return reject('invalid_results');
const text = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '');
const items = [];
for (const result of results) {
  const r = result || {};
  if (!['JUDGED', 'DISMISSED', 'DIGEST', 'FAILED'].includes(r.status)) return reject('invalid_status');
  const ids = Array.isArray(r.observation_ids) ? r.observation_ids.filter((id) => /^OB-[0-9a-f]{12}$/.test(String(id))) : [];
  if (!ids.length) return reject('missing_observation_ids');
  for (const id of ids) items.push({ kind: 'obs', observation_id: id, obs_status: r.status });
  const c = r.card;
  if (c) {
    if (!/^R2-[A-Za-z0-9-]{4,}$/.test(String(c.card_id || ''))) return reject('invalid_card_id');
    items.push({
      kind: 'card',
      card_id: c.card_id,
      dedupe_key: text(c.dedupe_key, 300),
      area: text(c.area, 20),
      type: text(c.type, 10),
      title: text(c.title, 200),
      status: 'SHADOW',
      publishable: c.publishable === true,
      unverified: c.unverified === true,
      rank_score: Number(c.rank_score) || 0,
      gates_json: text(c.gates_json, 8000),
      card_json: text(c.card_json, 20000),
      observation_ids_json: JSON.stringify(ids),
      judge_model: text(c.judge_model, 80),
      judged_at: new Date().toISOString()
    });
  }
}
return items.map((item) => ({ json: { route: 2, results: results.length, ...item } }));`
    },
    position: [660, 400]
  },
  output: [sampleCardItem]
});

const routeRequest = switchCase({
  version: 3.4,
  config: {
    name: 'Route Request',
    parameters: { mode: 'expression', numberOutputs: 3, output: expr('{{ $json.route }}') },
    position: [880, 400]
  }
});

const rejectRequest = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Reject Request',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify({ ok: false, error: $json.reason }) }}'),
      options: { responseCode: expr('{{ ["bad_signature", "stale_timestamp", "not_configured"].includes($json.reason) ? 401 : 400 }}') }
    },
    position: [1100, 150]
  }
});

const getNew = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get New Observations',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: 'XIxpm5C3OmOaJTcM', cachedResultName: 'GK_R2_OBSERVATIONS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'status', condition: 'eq', keyValue: 'NEW' }] },
      returnAll: false,
      limit: expr('{{ $json.limit }}'),
      orderBy: true,
      orderByColumn: 'createdAt',
      orderByDirection: 'ASC'
    },
    position: [1100, 400]
  },
  output: [{ observation_id: 'OB-000000000000', dedupe_key: 'k', detector: 'releases', area: 'tools_hub', observed_at: '2026-10-19T00:00:00.000Z', source: 's', source_kind: 'primary', url: '', value: 'v', verified: true, anchors_json: '[]', alert_trigger: '', data_json: '{}', status: 'NEW' }]
});

const getDecided = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Decided Cards',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'decision', condition: 'isNotEmpty' }] },
      returnAll: true
    },
    position: [1320, 400]
  },
  output: [{ dedupe_key: 'card:x', decision: 'NEJ', decided_at: '2026-10-01T00:00:00.000Z' }]
});

const getCosts = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Month Costs',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: 'FymMtRPIcmlaHUDv', cachedResultName: 'GK_R2_COSTS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'month', condition: 'eq', keyValue: expr('{{ $now.setZone("Europe/Stockholm").toFormat("yyyy-MM") }}') }] },
      returnAll: true
    },
    position: [1540, 400]
  },
  output: [{ month: '2026-10', cost_sek: 0 }]
});

const buildQueue = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Queue Response',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const parse = (value, fallback) => { try { return JSON.parse(value); } catch (error) { return fallback; } };
const observations = $('Get New Observations').all()
  .map((item) => item.json)
  .filter((row) => row && row.observation_id)
  .map((row) => ({
    observation_id: row.observation_id,
    dedupe_key: row.dedupe_key,
    detector: row.detector,
    area: row.area,
    observed_at: row.observed_at,
    source: row.source,
    source_kind: row.source_kind,
    url: row.url || null,
    value: row.value,
    verified: row.verified === true,
    anchors: parse(row.anchors_json, []),
    alert_trigger: row.alert_trigger || null,
    data: parse(row.data_json, {})
  }));
const decisions = $('Get Decided Cards').all()
  .map((item) => item.json)
  .filter((row) => row && row.dedupe_key && row.decision)
  .map((row) => ({ dedupe_key: row.dedupe_key, outcome: row.decision, decided_at: row.decided_at || row.updatedAt }));
const spent = $('Get Month Costs').all()
  .map((item) => Number(item.json && item.json.cost_sek) || 0)
  .reduce((sum, value) => sum + value, 0);
let cap = 0;
for (const row of $('Load R2 Config').all()) {
  if (row.json && row.json.config_key === 'budget_cap_sek') cap = Number(row.json.config_number) || 0;
}
return [{ json: { ok: true, observations, decisions, budget: { spent_sek: Math.round(spent * 100) / 100, cap_sek: cap } } }];`
    },
    position: [1760, 400]
  },
  output: [{ ok: true, observations: [], decisions: [], budget: { spent_sek: 0, cap_sek: 250 } }]
});

const respondQueue = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond With Queue',
    parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json) }}'), options: { responseCode: 200 } },
    position: [1980, 400]
  }
});

const acceptResults = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Accept Results',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify({ ok: true, results: $json.results }) }}'),
      options: { responseCode: 202 }
    },
    position: [1100, 650]
  },
  output: [sampleCardItem]
});

const routeItem = switchCase({
  version: 3.4,
  config: {
    name: 'Route Result Item',
    parameters: { mode: 'expression', numberOutputs: 2, output: expr('{{ $json.kind === "card" ? 0 : 1 }}') },
    position: [1320, 650]
  }
});

const insertCard = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Insert Card',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          card_id: expr('{{ $json.card_id }}'),
          dedupe_key: expr('{{ $json.dedupe_key }}'),
          area: expr('{{ $json.area }}'),
          type: expr('{{ $json.type }}'),
          title: expr('{{ $json.title }}'),
          status: expr('{{ $json.status }}'),
          publishable: expr('{{ $json.publishable }}'),
          unverified: expr('{{ $json.unverified }}'),
          rank_score: expr('{{ $json.rank_score }}'),
          gates_json: expr('{{ $json.gates_json }}'),
          card_json: expr('{{ $json.card_json }}'),
          observation_ids_json: expr('{{ $json.observation_ids_json }}'),
          judge_model: expr('{{ $json.judge_model }}'),
          judged_at: expr('{{ $json.judged_at }}')
        },
        schema: [
          { id: 'card_id', displayName: 'card_id', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'dedupe_key', displayName: 'dedupe_key', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'area', displayName: 'area', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'type', displayName: 'type', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'title', displayName: 'title', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'publishable', displayName: 'publishable', required: false, defaultMatch: false, display: true, type: 'boolean', canBeUsedToMatch: true },
          { id: 'unverified', displayName: 'unverified', required: false, defaultMatch: false, display: true, type: 'boolean', canBeUsedToMatch: true },
          { id: 'rank_score', displayName: 'rank_score', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: true },
          { id: 'gates_json', displayName: 'gates_json', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'card_json', displayName: 'card_json', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'observation_ids_json', displayName: 'observation_ids_json', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'judge_model', displayName: 'judge_model', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'judged_at', displayName: 'judged_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true }
        ]
      }
    },
    position: [1540, 560]
  },
  output: [{ id: 1 }]
});

const updateObservation = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Update Observation Status',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: 'XIxpm5C3OmOaJTcM', cachedResultName: 'GK_R2_OBSERVATIONS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'observation_id', condition: 'eq', keyValue: expr('{{ $json.observation_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { status: expr('{{ $json.obs_status }}') },
        schema: [
          { id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    },
    position: [1540, 760]
  },
  output: [{ id: 1 }]
});

export default workflow('r2-judge-queue', 'R2 – Judge Queue')
  .add(queueWebhook)
  .to(extractRaw)
  .to(loadConfig)
  .to(verifyRequest)
  .to(routeRequest
    .onCase(0, rejectRequest)
    .onCase(1, getNew.to(getDecided.to(getCosts.to(buildQueue.to(respondQueue)))))
    .onCase(2, acceptResults.to(routeItem
      .onCase(0, insertCard)
      .onCase(1, updateObservation))));
