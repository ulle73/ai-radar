import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

const sampleRow = {
  route: 1,
  received: 1,
  valid: 1,
  invalid: 0,
  observation_id: 'OB-000000000000',
  dedupe_key: 'release:anthropics/claude-code:v2.1.303',
  detector: 'releases',
  area: 'tools_hub',
  observed_at: '2026-10-19T00:00:00.000Z',
  source: 'Claude Code – GitHub Releases',
  source_kind: 'primary',
  url: 'https://github.com/anthropics/claude-code/releases',
  value: 'Claude Code v2.1.303 släppt 2026-10-18',
  verified: true,
  anchors_json: '[]',
  alert_trigger: '',
  data_json: '{}',
  status: 'NEW',
  runner: 'actions',
  received_at: '2026-10-19T00:00:00.000Z'
};

const ingestWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'R2 Observation Ingest',
    parameters: {
      httpMethod: 'POST',
      path: 'r2-observations',
      authentication: 'none',
      responseMode: 'responseNode',
      options: { rawBody: true }
    },
    position: [0, 300]
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
    position: [220, 300]
  },
  output: [{ raw: '{"observations":[]}', headers: {} }]
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
    position: [440, 300]
  },
  output: [{ config_key: 'signing_secret', config_value: 'x', config_number: null }]
});

const verifyBatch = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Verify And Normalize Batch',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const crypto = require('crypto');
const request = $('Extract Raw Body').first().json;
const config = {};
for (const row of $('Load R2 Config').all()) {
  if (row.json && row.json.config_key) config[row.json.config_key] = row.json;
}
const secret = String((config.signing_secret || {}).config_value || '');
const maxObservations = Number((config.max_observations_per_request || {}).config_number || 200);
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
const list = Array.isArray(body && body.observations) ? body.observations : null;
if (!list) return reject('missing_observations');
if (list.length > maxObservations) return reject('too_many_observations');

const AREAS = ['tools_hub', 'social', 'sales', 'projects'];
const KINDS = ['primary', 'aggregator', 'data', 'social', 'repo', 'video', 'transcript'];
const TRIGGERS = ['competitor_campaign_live', 'sales_deviation', 'platform_breaking_change', 'security_advisory'];
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const runner = text(body.runner, 40) || 'unknown';
const receivedAt = new Date().toISOString();
const seen = {};
const rows = [];
let invalid = 0;

for (const observation of list) {
  const o = observation || {};
  const dedupeKey = text(o.dedupe_key, 300);
  const observedAt = Date.parse(o.observed_at);
  const valid = dedupeKey && /^OB-[0-9a-f]{12}$/.test(String(o.observation_id || ''))
    && text(o.detector, 60) && AREAS.includes(o.area) && KINDS.includes(o.source_kind)
    && Number.isFinite(observedAt) && text(o.source, 300) && text(o.value, 2000)
    && (o.alert_trigger === null || o.alert_trigger === undefined || TRIGGERS.includes(o.alert_trigger));
  if (!valid) { invalid += 1; continue; }
  if (seen[dedupeKey]) continue;
  seen[dedupeKey] = true;
  rows.push({
    observation_id: o.observation_id,
    dedupe_key: dedupeKey,
    detector: text(o.detector, 60),
    area: o.area,
    observed_at: new Date(observedAt).toISOString(),
    source: text(o.source, 300),
    source_kind: o.source_kind,
    url: text(o.url, 1000),
    value: text(o.value, 2000),
    verified: o.verified === true,
    anchors_json: JSON.stringify(Array.isArray(o.anchors) ? o.anchors.slice(0, 10) : []).slice(0, 2000),
    alert_trigger: o.alert_trigger || '',
    data_json: JSON.stringify(o.data && typeof o.data === 'object' ? o.data : {}).slice(0, 8000),
    status: 'NEW',
    runner,
    received_at: receivedAt
  });
}

const summary = { received: list.length, valid: rows.length, invalid };
if (!rows.length) return [{ json: { route: 2, ...summary } }];
return rows.map((row) => ({ json: { route: 1, ...summary, ...row } }));`
    },
    position: [660, 300]
  },
  output: [sampleRow]
});

const routeBatch = switchCase({
  version: 3.4,
  config: {
    name: 'Route Batch',
    parameters: { mode: 'expression', numberOutputs: 3, output: expr('{{ $json.route }}') },
    position: [880, 300]
  }
});

const rejectBatch = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Reject Batch',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify({ ok: false, error: $json.reason }) }}'),
      options: { responseCode: expr('{{ ["bad_signature", "stale_timestamp", "not_configured"].includes($json.reason) ? 401 : 400 }}') }
    },
    position: [1100, 100]
  }
});

const acceptBatch = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Accept Batch',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify({ ok: true, received: $json.received, valid: $json.valid, invalid: $json.invalid }) }}'),
      options: { responseCode: 202 }
    },
    position: [1100, 300]
  },
  output: [sampleRow]
});

const acceptEmpty = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Accept Empty Batch',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify({ ok: true, received: $json.received, valid: 0, invalid: $json.invalid }) }}'),
      options: { responseCode: 200 }
    },
    position: [1100, 500]
  }
});

const onlyNew = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Keep Only New Observations',
    parameters: {
      resource: 'row',
      operation: 'rowNotExists',
      dataTableId: { __rl: true, mode: 'id', value: 'XIxpm5C3OmOaJTcM', cachedResultName: 'GK_R2_OBSERVATIONS' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'dedupe_key', condition: 'eq', keyValue: expr('{{ $json.dedupe_key }}') }] }
    },
    position: [1320, 300]
  },
  output: [sampleRow]
});

const insertObservation = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Insert Observation',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: 'XIxpm5C3OmOaJTcM', cachedResultName: 'GK_R2_OBSERVATIONS' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          observation_id: expr('{{ $json.observation_id }}'),
          dedupe_key: expr('{{ $json.dedupe_key }}'),
          detector: expr('{{ $json.detector }}'),
          area: expr('{{ $json.area }}'),
          observed_at: expr('{{ $json.observed_at }}'),
          source: expr('{{ $json.source }}'),
          source_kind: expr('{{ $json.source_kind }}'),
          url: expr('{{ $json.url }}'),
          value: expr('{{ $json.value }}'),
          verified: expr('{{ $json.verified }}'),
          anchors_json: expr('{{ $json.anchors_json }}'),
          alert_trigger: expr('{{ $json.alert_trigger }}'),
          data_json: expr('{{ $json.data_json }}'),
          status: expr('{{ $json.status }}'),
          runner: expr('{{ $json.runner }}'),
          received_at: expr('{{ $json.received_at }}')
        },
        schema: [
          { id: 'observation_id', displayName: 'observation_id', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'dedupe_key', displayName: 'dedupe_key', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'detector', displayName: 'detector', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'area', displayName: 'area', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'observed_at', displayName: 'observed_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true },
          { id: 'source', displayName: 'source', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'source_kind', displayName: 'source_kind', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'url', displayName: 'url', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'value', displayName: 'value', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'verified', displayName: 'verified', required: false, defaultMatch: false, display: true, type: 'boolean', canBeUsedToMatch: true },
          { id: 'anchors_json', displayName: 'anchors_json', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'alert_trigger', displayName: 'alert_trigger', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'data_json', displayName: 'data_json', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'runner', displayName: 'runner', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'received_at', displayName: 'received_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true }
        ]
      }
    },
    position: [1540, 300]
  },
  output: [{ id: 1 }]
});

export default workflow('r2-observation-ingest', 'R2 – Observation Ingest')
  .add(ingestWebhook)
  .to(extractRaw)
  .to(loadConfig)
  .to(verifyBatch)
  .to(routeBatch
    .onCase(0, rejectBatch)
    .onCase(1, acceptBatch.to(onlyNew.to(insertObservation)))
    .onCase(2, acceptEmpty));
