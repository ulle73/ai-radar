import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

const feedWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'R2 Data Feed',
    parameters: {
      httpMethod: 'POST',
      path: 'r2-data-feed',
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
  output: [{ raw: '{"want":["sales","log"]}', headers: {} }]
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

const verifyRequest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Verify Request',
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
return [{ json: { route: 1, runner: String((body && body.runner) || 'unknown').slice(0, 40) } }];`
    },
    position: [660, 300]
  },
  output: [{ route: 1, runner: 'local' }]
});

const routeRequest = switchCase({
  version: 3.4,
  config: {
    name: 'Route Request',
    parameters: { mode: 'expression', numberOutputs: 2, output: expr('{{ $json.route }}') },
    position: [880, 300]
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

const getSales = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Daily Order Reports',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: '5Yk1Czof6H88fOZq', cachedResultName: 'GK_DAILY_ORDER_REPORTS' },
      returnAll: false,
      limit: 60,
      orderBy: true,
      orderByColumn: 'report_date',
      orderByDirection: 'DESC'
    },
    position: [1100, 400]
  },
  output: [{ report_date: '2026-10-18', order_count: 2, order_total: 8000, last_year_count: 1, last_year_total: 2000, development_pct: 300 }]
});

const getLog = node({
  type: 'n8n-nodes-base.notion',
  version: 3,
  config: {
    name: 'Get Notion Log',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'databasePage',
      operation: 'getAll',
      dataSourceId: { __rl: true, mode: 'id', value: 'dce052a0-62a7-48de-963d-7ae6c88184d8', cachedResultName: 'Golfkuponger – Log' },
      returnAll: true,
      filterType: 'none',
      simple: true,
      options: { sort: { sortValue: [{ timestamp: true, key: 'created_time', direction: 'descending' }] } }
    },
    credentials: { notionApi: { id: '40eV72ZWKVMH8Nn3', name: 'Notion account' } },
    position: [1320, 400]
  },
  output: [{ id: 'page-id', name: 'Händelse', url: 'https://www.notion.so/page', property_typ: 'Idé', property_datum: { start: '2026-10-16' } }]
});

const buildFeed = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Feed',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const norm = (value) => String(value).toLowerCase().replace(/[^a-z0-9åäö]/g, '');
const pick = (json, name) => {
  const target = norm('property_' + name);
  for (const key of Object.keys(json)) {
    if (norm(key) === target) return json[key];
  }
  return undefined;
};
const dateOf = (value) => (value && typeof value === 'object' ? String(value.start || '') : String(value || ''));
const listOf = (value) => (Array.isArray(value) ? value.map((entry) => String(entry && entry.id ? entry.id : entry)) : []);

const sales = $('Get Daily Order Reports').all()
  .map((item) => item.json)
  .filter((row) => row && row.report_date)
  .map((row) => ({
    report_date: String(row.report_date).slice(0, 10),
    order_count: Number(row.order_count) || 0,
    order_total: Number(row.order_total) || 0,
    last_year_count: Number(row.last_year_count) || 0,
    last_year_total: Number(row.last_year_total) || 0
  }));

const log = $('Get Notion Log').all()
  .map((item) => item.json)
  .filter((page) => page && page.id)
  .map((page) => ({
    id: String(page.id),
    notion_id: String(page.id),
    title: String(page.name || pick(page, 'händelse') || ''),
    type: String(pick(page, 'typ') || ''),
    date: dateOf(pick(page, 'datum')) || String(page.created_time || ''),
    related: listOf(pick(page, 'relaterad_möjlighet')),
    summary: String(pick(page, 'sammanfattning') || '').slice(0, 500),
    url: String(page.url || '')
  }))
  .filter((entry) => entry.title && entry.type && entry.date);

return [{ json: { ok: true, generated_at: new Date().toISOString(), sales_rows: sales, log_entries: log } }];`
    },
    position: [1540, 400]
  },
  output: [{ ok: true, generated_at: '2026-10-19T00:00:00.000Z', sales_rows: [], log_entries: [] }]
});

const respondFeed = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond With Feed',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify($json) }}'),
      options: { responseCode: 200 }
    },
    position: [1760, 400]
  }
});

export default workflow('r2-data-feed', 'R2 – Data Feed')
  .add(feedWebhook)
  .to(extractRaw)
  .to(loadConfig)
  .to(verifyRequest)
  .to(routeRequest
    .onCase(0, rejectRequest)
    .onCase(1, getSales.to(getLog.to(buildFeed.to(respondFeed)))));
