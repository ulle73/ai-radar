import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

// R2 – Probes (harness-designen C7, etapp 2). Motorns signerade väg för proberna (HMAC, 5 minuter) och
// rotationen av kanariekoden. Webbytornas svar och kvitton tas emot av GK – Kvitto och probsvar (MCP).
//
//   answer        – probsvar från Claude Code eller Codex (samma regler som MCP-verktyget: högst 10 per yta och dag)
//   list_pending  – obedömda probsvar (source_kind probe, status NEW) för scripts/v2/probes.mjs
//   grade         – motorns bedömning: status GRADED_PASS, GRADED_FAIL eller GRADED_IGNORED och orsak i fail_reason
//   list_receipts – kvitton sedan ett datum (för T17 och fredagsbrevet)
//
// Kanariekoden byts måndagar kl. 00:05 Europe/Stockholm: kontrollen körs varje timme och roterar när
// valid_from är äldre än veckans måndag 00:05. Den nya koden skrivs i GK_R2_HARNESS_STATE (canary_code,
// canary_code_prev, valid_from) och i noden [TEST] Kanariefakta i Notion (raden "Veckans kanariekod").

const OBS_TABLE = { __rl: true, mode: 'id', value: 'XIxpm5C3OmOaJTcM', cachedResultName: 'GK_R2_OBSERVATIONS' };
const STATE_TABLE = { __rl: true, mode: 'id', value: '2Dd7EJkbBbpqGxNn', cachedResultName: 'GK_R2_HARNESS_STATE' };
const NOTION_CREDENTIALS = { notionApi: { id: '40eV72ZWKVMH8Nn3', name: 'Notion account' } };
const NOTION_HEADERS = { parameters: [{ name: 'Notion-Version', value: '2022-06-28' }] };
const OBS_SCHEMA = [
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
];

const probesWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'R2 Probes',
    parameters: { httpMethod: 'POST', path: 'r2-probes', authentication: 'none', responseMode: 'responseNode', options: { rawBody: true } },
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
  output: [{ raw: '{"action":"list_pending"}', headers: {} }]
});

const loadConfig = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Load R2 Config',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: { __rl: true, mode: 'id', value: 'J89ZBtZWzMgPsOku', cachedResultName: 'GK_R2_CONFIG' }, returnAll: true },
    position: [440, 300]
  },
  output: [{ config_key: 'signing_secret', config_value: 'x', config_number: null }]
});

const verifyRequest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Verify And Plan',
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
const action = String(body && body.action || '');
const now = new Date();
const day = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
const hash = (text) => crypto.createHash('sha256').update(String(text)).digest('hex');

if (action === 'answer') {
  const yta = String(body.yta || '');
  if (!['claude_code', 'codex'].includes(yta)) return reject('invalid_yta');
  const probe = String(body.probe || '').toUpperCase();
  if (!['P1', 'P2', 'P3'].includes(probe)) return reject('invalid_probe');
  const answer = String(body.answer || '').slice(0, 2000);
  if (!answer.trim()) return reject('missing_answer');
  const asked = Date.parse(body.asked_at || '');
  const askedAt = Number.isFinite(asked) && Math.abs(now.getTime() - asked) < 36 * 3600000 ? new Date(asked).toISOString() : now.toISOString();
  return [{ json: { route: 1, yta, probe, day, like: 'probe:' + yta + ':' + day + ':%',
    data: { yta, probe, asked_at: askedAt, answer_excerpt: answer.slice(0, 200), answer_hash: hash(answer).slice(0, 16), day } } }];
}
if (action === 'list_pending') return [{ json: { route: 2 } }];
if (action === 'grade') {
  const results = Array.isArray(body.results) ? body.results : null;
  if (!results || !results.length || results.length > 100) return reject('invalid_results');
  const items = [];
  for (const result of results) {
    const r = result || {};
    if (!/^OB-[0-9a-f]{12}$/.test(String(r.observation_id || ''))) return reject('invalid_observation_id');
    if (!['GRADED_PASS', 'GRADED_FAIL', 'GRADED_IGNORED'].includes(r.status)) return reject('invalid_status');
    items.push({ json: { route: 3, observation_id: r.observation_id, status: r.status, fail_reason: String(r.reason || '').slice(0, 300), graded: results.length } });
  }
  return items;
}
if (action === 'list_receipts') {
  const since = Date.parse(body.since || '');
  if (!Number.isFinite(since)) return reject('invalid_since');
  return [{ json: { route: 4, since: new Date(since).toISOString() } }];
}
return reject('unknown_action');`
    },
    position: [660, 300]
  },
  output: [{ route: 2 }]
});

const routeRequest = switchCase({
  version: 3.4,
  config: { name: 'Route Request', parameters: { mode: 'expression', numberOutputs: 5, output: expr('{{ $json.route }}') }, position: [880, 300] }
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
    position: [1100, 0]
  }
});

// ---------------------------------------------------------------- answer (Claude Code och Codex)

const getAnswerRows = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Day Answers',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: OBS_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'dedupe_key', condition: 'like', keyValue: expr("{{ $('Verify And Plan').first().json.like }}") }] },
      returnAll: true
    },
    position: [1100, 150]
  },
  output: [{ observation_id: 'OB-000000000000', dedupe_key: 'probe:claude_code:2026-11-02:P1:1' }]
});

const planAnswer = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan Answer Row',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const crypto = require('crypto');
const plan = $('Verify And Plan').first().json;
const rows = $input.all().map((item) => item.json).filter((row) => row && row.dedupe_key);
if (rows.length >= 10) return [{ json: { route: 0, response: { ok: false, error: 'högst 10 probsvar per yta och dag' } } }];
const n = rows.filter((row) => row.dedupe_key.startsWith('probe:' + plan.yta + ':' + plan.day + ':' + plan.probe + ':')).length + 1;
const dedupeKey = 'probe:' + plan.yta + ':' + plan.day + ':' + plan.probe + ':' + n;
const id = 'OB-' + crypto.createHash('sha1').update(dedupeKey).digest('hex').slice(0, 12);
const now = new Date().toISOString();
return [{ json: { route: 1,
  row: { observation_id: id, dedupe_key: dedupeKey, detector: 'probes', area: 'tools_hub', observed_at: now,
    source: (plan.yta === 'codex' ? 'Codex' : 'Claude Code') + ' – lokal probe', source_kind: 'probe', url: '', value: 'Probsvar ' + plan.probe + ' från ' + plan.yta,
    verified: false, anchors_json: '[]', alert_trigger: '', data_json: JSON.stringify(Object.assign({}, plan.data, { n })), status: 'NEW', runner: 'local', received_at: now },
  response: { ok: true, counted: n === 1, observation_id: id } } }];`
    },
    position: [1320, 150]
  },
  output: [{ route: 1, row: {}, response: { ok: true } }]
});

const routeAnswer = switchCase({
  version: 3.4,
  config: { name: 'Route Answer', parameters: { mode: 'expression', numberOutputs: 2, output: expr('{{ $json.route }}') }, position: [1540, 150] }
});

const respondAnswerLimit = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Answer Limit',
    parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json.response) }}'), options: { responseCode: 429 } },
    position: [1760, 50]
  }
});

const insertAnswer = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Insert Answer',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: OBS_TABLE,
      columns: {
        mappingMode: 'defineBelow',
        value: {
          observation_id: expr('{{ $json.row.observation_id }}'),
          dedupe_key: expr('{{ $json.row.dedupe_key }}'),
          detector: expr('{{ $json.row.detector }}'),
          area: expr('{{ $json.row.area }}'),
          observed_at: expr('{{ $json.row.observed_at }}'),
          source: expr('{{ $json.row.source }}'),
          source_kind: expr('{{ $json.row.source_kind }}'),
          url: expr('{{ $json.row.url }}'),
          value: expr('{{ $json.row.value }}'),
          verified: expr('{{ $json.row.verified }}'),
          anchors_json: expr('{{ $json.row.anchors_json }}'),
          alert_trigger: expr('{{ $json.row.alert_trigger }}'),
          data_json: expr('{{ $json.row.data_json }}'),
          status: expr('{{ $json.row.status }}'),
          runner: expr('{{ $json.row.runner }}'),
          received_at: expr('{{ $json.row.received_at }}')
        },
        schema: OBS_SCHEMA
      }
    },
    position: [1760, 250]
  },
  output: [{ id: 1 }]
});

const respondAnswer = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Answer',
    parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify($('Plan Answer Row').first().json.response) }}"), options: { responseCode: 200 } },
    position: [1980, 250]
  }
});

// ---------------------------------------------------------------- list_pending

const getPending = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Pending Probes',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: OBS_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'source_kind', condition: 'eq', keyValue: 'probe' }, { keyName: 'status', condition: 'eq', keyValue: 'NEW' }] },
      returnAll: true
    },
    position: [1100, 400]
  },
  output: [{ observation_id: 'OB-000000000000', data_json: '{}', status: 'NEW' }]
});

const buildPending = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Pending',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const parse = (value) => { try { return JSON.parse(value); } catch (error) { return null; } };
const answers = $input.all().map((item) => item.json)
  .filter((row) => row && row.observation_id && row.data_json)
  .map((row) => ({ observation_id: row.observation_id, observed_at: row.observed_at, runner: row.runner || '', data: parse(row.data_json) }))
  .filter((row) => row.data);
return [{ json: { ok: true, answers } }];`
    },
    position: [1320, 400]
  },
  output: [{ ok: true, answers: [] }]
});

const respondPending = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Pending',
    parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json) }}'), options: { responseCode: 200 } },
    position: [1540, 400]
  }
});

// ---------------------------------------------------------------- grade

const updateGrade = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Update Grade',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: OBS_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'observation_id', condition: 'eq', keyValue: expr('{{ $json.observation_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { status: expr('{{ $json.status }}'), fail_reason: expr('{{ $json.fail_reason }}') },
        schema: [
          { id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'fail_reason', displayName: 'fail_reason', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    },
    position: [1100, 550]
  },
  output: [{ id: 1 }]
});

const respondGraded = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Graded',
    executeOnce: true,
    parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify({ ok: true, graded: $('Verify And Plan').first().json.graded }) }}"), options: { responseCode: 200 } },
    position: [1320, 550]
  }
});

// ---------------------------------------------------------------- list_receipts

const getReceipts = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Receipts',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: OBS_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'source_kind', condition: 'eq', keyValue: 'receipt' }, { keyName: 'observed_at', condition: 'gte', keyValue: expr("{{ $('Verify And Plan').first().json.since }}") }] },
      returnAll: true
    },
    position: [1100, 700]
  },
  output: [{ observation_id: 'OB-000000000000', data_json: '{}', observed_at: '2026-11-02T06:30:00.000Z' }]
});

const buildReceipts = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Receipts',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const parse = (value) => { try { return JSON.parse(value); } catch (error) { return null; } };
const receipts = $input.all().map((item) => item.json)
  .filter((row) => row && row.observation_id && row.data_json)
  .map((row) => ({ observed_at: row.observed_at, data: parse(row.data_json) }))
  .filter((row) => row.data);
return [{ json: { ok: true, receipts } }];`
    },
    position: [1320, 700]
  },
  output: [{ ok: true, receipts: [] }]
});

const respondReceipts = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Receipts',
    parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json) }}'), options: { responseCode: 200 } },
    position: [1540, 700]
  }
});

// ---------------------------------------------------------------- kanarierotation

const rotationCheck = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: { name: 'Canary Rotation Check', parameters: { rule: { interval: [{ field: 'hours', hoursInterval: 1 }] } }, position: [0, 1000] },
  output: [{}]
});

const loadStateForRotation = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Load State For Rotation',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: STATE_TABLE, returnAll: true },
    position: [220, 1000]
  },
  output: [{ state_key: 'canary_code', state_value: 'GK-ABC234', updated_at: '2026-11-02T00:00:00.000Z' }]
});

const planRotation = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan Rotation',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const crypto = require('crypto');
const state = {};
for (const item of $input.all()) if (item.json && item.json.state_key) state[item.json.state_key] = String(item.json.state_value || '');
const now = new Date();
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' })
  .formatToParts(now).map((part) => [part.type, part.value]));
const localAsUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
const offset = localAsUtc - Math.floor(now.getTime() / 60000) * 60000;
const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday);
const mondayLocal = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) - weekday, 0, 5);
const rotateAt = mondayLocal - offset;
const validFrom = Date.parse(state.valid_from || '');
if (now.getTime() < rotateAt || (Number.isFinite(validFrom) && validFrom >= rotateAt)) return [];
const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ';
const digits = '23456789';
let code = 'GK-';
for (let i = 0; i < 3; i += 1) code += letters[crypto.randomInt(letters.length)];
for (let i = 0; i < 3; i += 1) code += digits[crypto.randomInt(digits.length)];
const stamp = now.toISOString();
const day = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
return [
  { json: { state_key: 'canary_code_prev', state_value: state.canary_code || '', updated_at: stamp, code, day } },
  { json: { state_key: 'canary_code', state_value: code, updated_at: stamp, code, day } },
  { json: { state_key: 'valid_from', state_value: stamp, updated_at: stamp, code, day } }
];`
    },
    position: [440, 1000]
  },
  output: [{ state_key: 'canary_code', state_value: 'GK-ABC234', updated_at: '2026-11-09T00:05:00.000Z', code: 'GK-ABC234', day: '2026-11-09' }]
});

const upsertCanary = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Upsert Canary',
    parameters: {
      resource: 'row',
      operation: 'upsert',
      dataTableId: STATE_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'state_key', condition: 'eq', keyValue: expr('{{ $json.state_key }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: { state_key: expr('{{ $json.state_key }}'), state_value: expr('{{ $json.state_value }}'), updated_at: expr('{{ $json.updated_at }}') },
        schema: [{ id: 'state_key', displayName: 'state_key', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'state_value', displayName: 'state_value', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'updated_at', displayName: 'updated_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true }]
      }
    },
    position: [660, 1000]
  },
  output: [{ id: 1 }]
});

const getCanaryBlocks = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Get Canary Page Blocks',
    executeOnce: true,
    parameters: {
      method: 'GET',
      url: 'https://api.notion.com/v1/blocks/40c3774f-b232-81b7-a762-ec4881c8169c/children?page_size=100',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [880, 1000]
  },
  output: [{ object: 'list', results: [] }]
});

const planCanaryBlock = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan Canary Block',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const plain = (block) => {
  const data = block && block[block.type];
  return ((data && data.rich_text) || []).map((part) => part.plain_text || '').join('');
};
const rotation = $('Plan Rotation').first().json;
const text = 'Veckans kanariekod: ' + rotation.code + ' (gäller från ' + rotation.day + ')';
const richText = [{ type: 'text', text: { content: text } }];
const blocks = $input.first().json.results || [];
const existing = blocks.find((block) => block.type === 'bulleted_list_item' && plain(block).startsWith('Veckans kanariekod'));
if (existing) return [{ json: { url: 'https://api.notion.com/v1/blocks/' + existing.id, body: { bulleted_list_item: { rich_text: richText } } } }];
const heading = blocks.find((block) => /^heading_[123]$/.test(block.type) && plain(block).trim() === 'Aktuell bild');
const children = [{ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText } }];
return [{ json: { url: 'https://api.notion.com/v1/blocks/40c3774f-b232-81b7-a762-ec4881c8169c/children', body: heading ? { children, after: heading.id } : { children } } }];`
    },
    position: [1100, 1000]
  },
  output: [{ url: 'https://api.notion.com/v1/blocks/x', body: {} }]
});

const writeCanaryBlock = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Write Canary Block',
    executeOnce: true,
    parameters: {
      method: 'PATCH',
      url: expr('{{ $json.url }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.body) }}'),
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1320, 1000]
  },
  output: [{ object: 'block', id: 'block-id' }]
});

export default workflow('r2-probes', 'R2 – Probes')
  .add(probesWebhook)
  .to(extractRaw)
  .to(loadConfig)
  .to(verifyRequest)
  .to(routeRequest
    .onCase(0, rejectRequest)
    .onCase(1, getAnswerRows.to(planAnswer.to(routeAnswer
      .onCase(0, respondAnswerLimit)
      .onCase(1, insertAnswer.to(respondAnswer)))))
    .onCase(2, getPending.to(buildPending.to(respondPending)))
    .onCase(3, updateGrade.to(respondGraded))
    .onCase(4, getReceipts.to(buildReceipts.to(respondReceipts))))
  .add(rotationCheck)
  .to(loadStateForRotation.to(planRotation.to(upsertCanary.to(getCanaryBlocks.to(planCanaryBlock.to(writeCanaryBlock))))));
