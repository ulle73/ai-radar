import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

// R2 – Harness State (harness-designen C0). Förbättringsmotorns tillstånd i GK_R2_HARNESS_STATE och dess
// skrivregler, harness-kolumnerna i GK_R2_CARDS, beslutspunkter och larm till #ai-radar, samt larm när
// motorns livstecken är äldre än 3 timmar. Signerade anrop som R2:s övriga webhooks (HMAC, 5 minuter).
//
// Skrivregler: läsning returnerar bara de designade nycklarna. Motorns signerade anrop får bara skriva
// liveness_*, canary_*/valid_from och aktivera brytaren eller bromsen. Att släppa bromsen, sätta
// approved_guardrail_hash och återaktivera en klass görs bara via Discord (R2 – Card Feedback, Jonas ID).

const STATE_TABLE = { __rl: true, mode: 'id', value: '2Dd7EJkbBbpqGxNn', cachedResultName: 'GK_R2_HARNESS_STATE' };
const CARDS_TABLE = { __rl: true, mode: 'id', value: '3ryY9Vp6VumxOHPP', cachedResultName: 'GK_R2_CARDS' };
const CHANNEL_URL = 'https://discord.com/api/v10/channels/1550641582208712806/messages';
const DISCORD_CREDENTIALS = { discordBotApi: { id: '2Pwo6eNhWtKkqI7C', name: 'AI Radar Discord Bot' } };


const stateWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'R2 Harness State',
    parameters: { httpMethod: 'POST', path: 'r2-harness-state', authentication: 'none', responseMode: 'responseNode', options: { rawBody: true } },
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
  output: [{ raw: '{"action":"read"}', headers: {} }]
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

const loadState = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Load Harness State',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: STATE_TABLE, returnAll: true },
    position: [660, 300]
  },
  output: [{ state_key: 'brake', state_value: 'off', updated_at: '2026-11-02T00:00:00.000Z' }]
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

// Spegel av engineMayWrite i ulle73/ai-radar scripts/lib/v2/harness/controller.mjs (testad där).
const KEYS = ['brake', 'approved_guardrail_hash', 'breaker:skill_text', 'canary_code', 'canary_code_prev', 'valid_from', 'liveness_at', 'liveness_note'];
const engineMayWrite = (key, value) => {
  if (/^liveness_(at|note)$/.test(key) || /^canary_code(_prev)?$/.test(key) || key === 'valid_from') return true;
  if (key === 'breaker:skill_text' || key === 'brake') return value === 'on';
  return false;
};
const CARD_FIELDS = ['change_class', 'autonomy', 'autonomy_reason', 'commit_sha', 'published_version', 'published_at', 'verified_local_at', 'web_verified_at', 'rolled_back_at', 'outcome_due', 'outcome', 'fail_reason'];
const now = new Date().toISOString();
const action = String(body && body.action || '');

if (action === 'read') {
  const state = {};
  for (const row of $('Load Harness State').all()) {
    const r = row.json || {};
    if (KEYS.includes(r.state_key)) state[r.state_key] = String(r.state_value ?? '');
  }
  return [{ json: { route: 1, response: { ok: true, state } } }];
}
if (action === 'write') {
  const updates = body.updates && typeof body.updates === 'object' ? body.updates : null;
  if (!updates || !Object.keys(updates).length) return reject('missing_updates');
  const items = [];
  for (const [key, value] of Object.entries(updates)) {
    const text = String(value ?? '').slice(0, 500);
    if (!KEYS.includes(key) || !engineMayWrite(key, text)) return reject('write_not_allowed:' + key);
    items.push({ json: { route: 2, state_key: key, state_value: text, updated_at: now, response: { ok: true, written: Object.keys(updates) } } });
  }
  return items;
}
if (action === 'cards') return [{ json: { route: 3 } }];
if (action === 'card_update') {
  if (!/^R2-[A-Za-z0-9-]{4,}$/.test(String(body.card_id || ''))) return reject('invalid_card_id');
  const fields = {};
  for (const [key, value] of Object.entries(body.fields || {})) {
    if (!CARD_FIELDS.includes(key)) return reject('field_not_allowed:' + key);
    fields[key] = value === null ? null : String(value).slice(0, key === 'fail_reason' || key === 'autonomy_reason' ? 300 : 120);
  }
  return [{ json: { route: 4, card_id: body.card_id, fields } }];
}
if (action === 'decision' || action === 'alert') {
  const message = body.message && typeof body.message === 'object' ? body.message : null;
  if (!message || (!message.content && !message.embeds)) return reject('missing_message');
  const safe = { content: String(message.content || '').slice(0, 1900), embeds: Array.isArray(message.embeds) ? message.embeds.slice(0, 2) : [],
    components: Array.isArray(message.components) ? message.components.slice(0, 5) : [], allowed_mentions: { parse: [] } };
  return [{ json: { route: 5, message: safe, response: { ok: true, posted: action } } }];
}
return reject('unknown_action');`
    },
    position: [880, 300]
  },
  output: [{ route: 1, response: { ok: true, state: {} } }]
});

const routeRequest = switchCase({
  version: 3.4,
  config: { name: 'Route Request', parameters: { mode: 'expression', numberOutputs: 6, output: expr('{{ $json.route }}') }, position: [1100, 300] }
});

const rejectRequest = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Reject Request',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify({ ok: false, error: $json.reason }) }}'),
      options: { responseCode: expr('{{ ["bad_signature", "stale_timestamp", "not_configured"].includes($json.reason) ? 401 : ($json.reason.startsWith("write_not_allowed") || $json.reason.startsWith("field_not_allowed") ? 403 : 400) }}') }
    },
    position: [1320, 0]
  }
});

const respondResponse = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond State',
    parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json.response) }}'), options: { responseCode: 200 } },
    position: [1320, 150]
  }
});

const upsertState = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Upsert Engine State',
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
    position: [1320, 300]
  },
  output: [{ id: 1 }]
});

const respondWritten = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Written',
    executeOnce: true,
    parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify($('Verify And Plan').first().json.response) }}"), options: { responseCode: 200 } },
    position: [1540, 300]
  }
});

const getCards = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Cards',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: CARDS_TABLE, returnAll: true },
    position: [1320, 450]
  },
  output: [{ card_id: 'R2-20261102-abcd1234', card_json: '{"mistake_ref":"notion-las-forst"}', decision: null }]
});

const harnessCards = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Harness Cards',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const FIELDS = ['card_id', 'status', 'card_json', 'decision', 'decided_at', 'change_class', 'autonomy', 'autonomy_reason', 'approved_diff_sha256', 'approved_by', 'approved_at',
  'commit_sha', 'published_version', 'published_at', 'verified_local_at', 'web_verified_at', 'rolled_back_at', 'outcome_due', 'outcome', 'fail_reason', 'judged_at', 'publishable'];
const cards = $input.all().map((item) => item.json || {})
  .filter((row) => row.card_id && String(row.card_json || '').includes('"mistake_ref":"'))
  .map((row) => Object.fromEntries(FIELDS.map((key) => [key, row[key] ?? null])));
return [{ json: { ok: true, cards: cards.slice(-200) } }];`
    },
    position: [1540, 450]
  },
  output: [{ ok: true, cards: [] }]
});

const respondCards = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Cards',
    parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json) }}'), options: { responseCode: 200 } },
    position: [1760, 450]
  }
});

const getCardRow = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Card Row',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: CARDS_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'card_id', condition: 'eq', keyValue: expr('{{ $json.card_id }}') }] },
      returnAll: false,
      limit: 1
    },
    position: [1320, 600]
  },
  output: [{ card_id: 'R2-20261102-abcd1234' }]
});

const mergeFields = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Merge Card Fields',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const plan = $('Verify And Plan').first().json;
const row = $input.first().json || {};
if (!row.card_id) return [{ json: { missing: true, card_id: plan.card_id } }];
const KEYS = ['change_class', 'autonomy', 'autonomy_reason', 'commit_sha', 'published_version', 'published_at', 'verified_local_at', 'web_verified_at', 'rolled_back_at', 'outcome_due', 'outcome', 'fail_reason'];
const merged = { card_id: row.card_id };
for (const key of KEYS) merged[key] = key in plan.fields ? plan.fields[key] : (row[key] ?? null);
return [{ json: merged }];`
    },
    position: [1540, 600]
  },
  output: [{ card_id: 'R2-20261102-abcd1234', change_class: 'skill_text', autonomy: 'AUTO', autonomy_reason: '', commit_sha: '', published_version: '', published_at: null, verified_local_at: null, web_verified_at: null, rolled_back_at: null, outcome_due: null, outcome: '', fail_reason: '' }]
});

const updateCard = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Update Card Harness Fields',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: CARDS_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'card_id', condition: 'eq', keyValue: expr('{{ $json.card_id }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          change_class: expr('{{ $json.change_class }}'),
          autonomy: expr('{{ $json.autonomy }}'),
          autonomy_reason: expr('{{ $json.autonomy_reason }}'),
          commit_sha: expr('{{ $json.commit_sha }}'),
          published_version: expr('{{ $json.published_version }}'),
          published_at: expr('{{ $json.published_at }}'),
          verified_local_at: expr('{{ $json.verified_local_at }}'),
          web_verified_at: expr('{{ $json.web_verified_at }}'),
          rolled_back_at: expr('{{ $json.rolled_back_at }}'),
          outcome_due: expr('{{ $json.outcome_due }}'),
          outcome: expr('{{ $json.outcome }}'),
          fail_reason: expr('{{ $json.fail_reason }}')
        },
        schema: [
          { id: 'change_class', displayName: 'change_class', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'autonomy', displayName: 'autonomy', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'autonomy_reason', displayName: 'autonomy_reason', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'commit_sha', displayName: 'commit_sha', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'published_version', displayName: 'published_version', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'published_at', displayName: 'published_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true }, { id: 'verified_local_at', displayName: 'verified_local_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true }, { id: 'web_verified_at', displayName: 'web_verified_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true },
          { id: 'rolled_back_at', displayName: 'rolled_back_at', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true }, { id: 'outcome_due', displayName: 'outcome_due', required: false, defaultMatch: false, display: true, type: 'dateTime', canBeUsedToMatch: true }, { id: 'outcome', displayName: 'outcome', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'fail_reason', displayName: 'fail_reason', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    },
    position: [1760, 600]
  },
  output: [{ id: 1 }]
});

const respondUpdated = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Updated',
    parameters: {
      respondWith: 'json',
      responseBody: expr("{{ JSON.stringify($('Merge Card Fields').first().json.missing ? { ok: false, error: 'card_not_found' } : { ok: true }) }}"),
      options: { responseCode: 200 }
    },
    position: [1980, 600]
  }
});

const postMessage = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Post To #ai-radar',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: CHANNEL_URL,
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'discordBotApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.message) }}'),
      options: { timeout: 10000 }
    },
    credentials: DISCORD_CREDENTIALS,
    position: [1320, 750]
  },
  output: [{ id: '1430000000000000000' }]
});

const respondPosted = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Posted',
    parameters: {
      respondWith: 'json',
      responseBody: expr("{{ JSON.stringify($json.id ? { ok: true, message_id: $json.id } : { ok: false, error: 'discord_failed' }) }}"),
      options: { responseCode: 200 }
    },
    position: [1540, 750]
  }
});

// Livstecken: larm om motorns liveness_at är äldre än 3 timmar (en gång per halvtimmesfönster, och efter ett dygn).
const livenessCheck = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: { name: 'Liveness Check 30 min', parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 30 }] } }, position: [0, 1000] },
  output: [{}]
});

const loadStateForLiveness = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Load State For Liveness',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: { resource: 'row', operation: 'get', dataTableId: STATE_TABLE, returnAll: true },
    position: [220, 1000]
  },
  output: [{ state_key: 'liveness_at', state_value: '2026-11-02T00:00:00.000Z' }]
});

const checkLiveness = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Check Liveness',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const state = {};
for (const item of $input.all()) if (item.json && item.json.state_key) state[item.json.state_key] = item.json.state_value;
const at = Date.parse(state.liveness_at || '');
if (!Number.isFinite(at)) return [];
const hours = (Date.now() - at) / 3600000;
const inWindow = (h) => hours >= h && hours < h + 0.5;
if (!inWindow(3) && !inWindow(24)) return [];
const note = state.liveness_note ? ' Senaste anteckning: ' + String(state.liveness_note).slice(0, 200) : '';
return [{ json: { message: {
  content: '🚨 **Motorns livstecken saknas** · AI Radar v2 (harness) · liveness_lost',
  embeds: [{ title: 'Inget livstecken på ' + Math.floor(hours) + ' timmar', description: 'liveness_at = ' + state.liveness_at + '.' + note + '\\nKontrollera den lokala cykeln och nattfasen på den stationära datorn.' }],
  components: [{ type: 1, components: [{ type: 2, style: 4, label: 'Nödbroms', custom_id: 'r2:brake:on' }] }],
  allowed_mentions: { parse: [] }
} } }];`
    },
    position: [440, 1000]
  },
  output: [{ message: { content: '🚨' } }]
});

const postLiveness = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Post Liveness Alert',
    parameters: {
      method: 'POST',
      url: CHANNEL_URL,
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'discordBotApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.message) }}'),
      options: { timeout: 10000 }
    },
    credentials: DISCORD_CREDENTIALS,
    position: [660, 1000]
  },
  output: [{ id: '1430000000000000000' }]
});

export default workflow('r2-harness-state', 'R2 – Harness State')
  .add(stateWebhook)
  .to(extractRaw)
  .to(loadConfig)
  .to(loadState)
  .to(verifyRequest)
  .to(routeRequest
    .onCase(0, rejectRequest)
    .onCase(1, respondResponse)
    .onCase(2, upsertState.to(respondWritten))
    .onCase(3, getCards.to(harnessCards.to(respondCards)))
    .onCase(4, getCardRow.to(mergeFields.to(updateCard.to(respondUpdated))))
    .onCase(5, postMessage.to(respondPosted)))
  .add(livenessCheck)
  .to(loadStateForLiveness.to(checkLiveness.to(postLiveness)));
