import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

// R2 – Learner (harness-designen C9, etapp 1b). Skriver förbättringsmotorns lärande i Notion och läser
// tillbaka varje skrivning. Signerade anrop som R2:s övriga webhooks (HMAC, 5 minuter).
//
//   log     – en daterad loggrad överst under "## Logg" i noden "Gemensamt AI-system" (9.04/ai-system)
//   weekly  – en rad i Growth Log för veckan och nodens rad "Förbättringsmotorns mått" i Aktuell bild
//   growth  – en rad i Growth Log för ett beslut eller en regression
//
// Bara tillägg: inget skrivs över utom raden "Förbättringsmotorns mått". Samma text två gånger ger ingen
// dubblett (loggraden och Growth Log-raden kontrolleras före skrivning). Sidan och databasen är fasta i flödet;
// anroparen kan inte välja var det skrivs. Texterna byggs i ulle73/ai-radar scripts/lib/v2/harness/learner.mjs.

const NOTION_CREDENTIALS = { notionApi: { id: '40eV72ZWKVMH8Nn3', name: 'Notion account' } };
const NOTION_HEADERS = { parameters: [{ name: 'Notion-Version', value: '2022-06-28' }] };

const learnerWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'R2 Learner',
    parameters: { httpMethod: 'POST', path: 'r2-learner', authentication: 'none', responseMode: 'responseNode', options: { rawBody: true } },
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
  output: [{ raw: '{"action":"log"}', headers: {} }]
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

// Motorn skriver bara egen, kort text: inga länkar, e-postadresser eller kodblock.
const unsafe = (text) => /https?:\\/\\/|www\\.|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,}|\`\`\`/i.test(String(text || ''));
const clean = (text, max) => String(text || '').replace(/\\s+/g, ' ').trim().slice(0, max);
const isDate = (value) => /^\\d{4}-\\d{2}-\\d{2}$/.test(String(value || ''));
const rich = (text) => [{ type: 'text', text: { content: text } }];
const TYPES = ['Testresultat', 'Beslut', 'Ändrad bedömning'];
const rowPlan = (row) => {
  if (!row || typeof row !== 'object') return null;
  const title = clean(row.title, 200);
  if (!title || !TYPES.includes(row.type) || !isDate(row.date)) return null;
  if ([row.title, row.summary, row.why, row.source].some(unsafe)) return null;
  return {
    title,
    query: { filter: { property: 'Händelse', title: { equals: title } }, page_size: 1 },
    properties: {
      'Händelse': { title: rich(title) },
      'Typ': { select: { name: row.type } },
      'Datum': { date: { start: row.date } },
      'Sammanfattning': { rich_text: rich(clean(row.summary, 1900)) },
      'Varför det spelar roll': { rich_text: rich(clean(row.why, 1900)) },
      'Källa / underlag': { rich_text: rich(clean(row.source, 300)) }
    }
  };
};

const action = String(body && body.action || '');
if (action === 'log') {
  const entry = body.entry || {};
  const text = clean(entry.text, 600);
  if (!text || !isDate(entry.date) || unsafe(text)) return reject('invalid_entry');
  return [{ json: { route: 1, date: entry.date, text } }];
}
if (action === 'weekly') {
  const current = clean(body.current, 1900);
  const row = rowPlan(body.row);
  if (!current.startsWith('Förbättringsmotorns mått') || unsafe(current) || !row) return reject('invalid_weekly');
  return [{ json: { route: 2, current, row } }];
}
if (action === 'growth') {
  const row = rowPlan(body.row);
  if (!row) return reject('invalid_row');
  return [{ json: { route: 3, row } }];
}
return reject('unknown_action');`
    },
    position: [660, 300]
  },
  output: [{ route: 1, date: '2026-11-02', text: 'Förbättringsmotorn publicerade gk-karna 1.0.5 (R2)' }]
});

const routeRequest = switchCase({
  version: 3.4,
  config: { name: 'Route Request', parameters: { mode: 'expression', numberOutputs: 4, output: expr('{{ $json.route }}') }, position: [880, 300] }
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

// Sidan (noden 9.04/ai-system) och Growth Log är fasta i URL:erna nedan. I Code-noderna blir
// datumnämnanden ÅÅÅÅ-MM-DD i plain(), som i loggen.

// ---------------------------------------------------------------- log

const getLogBlocks = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Get Node Blocks (log)',
    executeOnce: true,
    parameters: {
      method: 'GET',
      url: 'https://api.notion.com/v1/blocks/40a3774f-b232-8197-aecc-c229d1b68c6b/children?page_size=100',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1100, 200]
  },
  output: [{ object: 'list', results: [] }]
});

const planLog = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan Log Line',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const plain = (block) => {
  const data = block && block[block.type];
  const parts = (data && data.rich_text) || [];
  return parts.map((part) => (part.type === 'mention' && part.mention && part.mention.date ? part.mention.date.start : part.plain_text || '')).join('');
};
const request = $('Verify And Plan').first().json;
const blocks = $input.first().json.results || [];
const heading = blocks.find((block) => /^heading_[123]$/.test(block.type) && plain(block).trim() === 'Logg');
if (!heading) return [{ json: { ok: false, error: 'rubriken Logg saknas', skip: true } }];
const exists = blocks.some((block) => block.type === 'bulleted_list_item' && plain(block).includes(request.text));
const bullet = { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [
  { type: 'mention', mention: { type: 'date', date: { start: request.date } } },
  { type: 'text', text: { content: ' – ' + request.text } }
] } };
return [{ json: { ok: true, skip: exists, body: { children: [bullet], after: heading.id } } }];`
    },
    position: [1320, 200]
  },
  output: [{ ok: true, skip: false, body: {} }]
});

// Finns raden redan (omkörning) hämtas bara sidan igen i stället för att skriva en dubblett.
const appendLog = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Append Log Line',
    executeOnce: true,
    parameters: {
      method: expr('{{ $json.skip ? "GET" : "PATCH" }}'),
      url: expr('{{ $json.skip ? "https://api.notion.com/v1/blocks/40a3774f-b232-8197-aecc-c229d1b68c6b/children?page_size=100" : "https://api.notion.com/v1/blocks/40a3774f-b232-8197-aecc-c229d1b68c6b/children" }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ $json.skip ? "{}" : JSON.stringify($json.body) }}'),
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1540, 200]
  },
  output: [{ object: 'list', results: [] }]
});

const readLog = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Read Back (log)',
    executeOnce: true,
    parameters: {
      method: 'GET',
      url: 'https://api.notion.com/v1/blocks/40a3774f-b232-8197-aecc-c229d1b68c6b/children?page_size=100',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1760, 200]
  },
  output: [{ object: 'list', results: [] }]
});

const checkLog = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Check Log Read Back',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const plain = (block) => {
  const data = block && block[block.type];
  const parts = (data && data.rich_text) || [];
  return parts.map((part) => (part.type === 'mention' && part.mention && part.mention.date ? part.mention.date.start : part.plain_text || '')).join('');
};
const request = $('Verify And Plan').first().json;
const plan = $('Plan Log Line').first().json;
if (!plan.ok) return [{ json: { ok: false, error: plan.error, readback: false } }];
const blocks = $input.first().json.results || [];
const found = blocks.some((block) => block.type === 'bulleted_list_item' && plain(block).includes(request.text));
return [{ json: { ok: found, readback: found, duplicate_skipped: plan.skip === true, ...(found ? {} : { error: 'raden hittades inte vid läsning tillbaka' }) } }];`
    },
    position: [1980, 200]
  },
  output: [{ ok: true, readback: true }]
});

const respondLog = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Log',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify($json) }}'),
      options: { responseCode: expr('{{ $json.ok ? 200 : 502 }}') }
    },
    position: [2200, 200]
  }
});

// ---------------------------------------------------------------- weekly

const weeklyQuery = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Find Growth Row (weekly)',
    executeOnce: true,
    parameters: {
      method: 'POST',
      url: 'https://api.notion.com/v1/databases/f3fdd542-83a2-4dc9-9ee7-cac981cf289a/query',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr("{{ JSON.stringify($('Verify And Plan').first().json.row.query) }}"),
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1100, 400]
  },
  output: [{ object: 'list', results: [] }]
});

const weeklyCreate = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Create Growth Row (weekly)',
    executeOnce: true,
    parameters: {
      method: expr('{{ ($json.results || []).length ? "GET" : "POST" }}'),
      url: expr('{{ ($json.results || []).length ? "https://api.notion.com/v1/pages/" + $json.results[0].id : "https://api.notion.com/v1/pages" }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr("{{ ($json.results || []).length ? '{}' : JSON.stringify({ parent: { database_id: 'f3fdd542-83a2-4dc9-9ee7-cac981cf289a' }, properties: $('Verify And Plan').first().json.row.properties }) }}"),
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1320, 400]
  },
  output: [{ object: 'page', id: 'page-id' }]
});

const weeklyRead = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Read Back Growth Row (weekly)',
    executeOnce: true,
    parameters: {
      method: 'GET',
      url: expr('{{ "https://api.notion.com/v1/pages/" + $json.id }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1540, 400]
  },
  output: [{ object: 'list', results: [] }]
});

const getWeeklyBlocks = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Get Node Blocks (weekly)',
    executeOnce: true,
    parameters: {
      method: 'GET',
      url: 'https://api.notion.com/v1/blocks/40a3774f-b232-8197-aecc-c229d1b68c6b/children?page_size=100',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1760, 400]
  },
  output: [{ object: 'list', results: [] }]
});

const planCurrent = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan Current Picture',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const plain = (block) => {
  const data = block && block[block.type];
  const parts = (data && data.rich_text) || [];
  return parts.map((part) => (part.type === 'mention' && part.mention && part.mention.date ? part.mention.date.start : part.plain_text || '')).join('');
};
const request = $('Verify And Plan').first().json;
const page = $('Read Back Growth Row (weekly)').first().json || {};
const title = ((page.properties && page.properties['Händelse'] && page.properties['Händelse'].title) || []).map((part) => part.plain_text || '').join('');
const rowOk = Boolean(page.id) && title === request.row.title && !page.archived;
const blocks = $input.first().json.results || [];
const start = blocks.findIndex((block) => /^heading_[123]$/.test(block.type) && plain(block).trim() === 'Aktuell bild');
if (start < 0) return [{ json: { ok: false, error: 'rubriken Aktuell bild saknas', row_ok: rowOk, method: 'GET', url: 'https://api.notion.com/v1/blocks/40a3774f-b232-8197-aecc-c229d1b68c6b/children?page_size=100' } }];
let end = blocks.length;
for (let i = start + 1; i < blocks.length; i += 1) if (/^heading_[123]$/.test(blocks[i].type)) { end = i; break; }
const section = blocks.slice(start + 1, end);
const existing = section.find((block) => block.type === 'bulleted_list_item' && plain(block).startsWith('Förbättringsmotorns mått'));
const richText = [{ type: 'text', text: { content: request.current } }];
if (existing) return [{ json: { ok: true, row_ok: rowOk, method: 'PATCH', url: 'https://api.notion.com/v1/blocks/' + existing.id, body: { bulleted_list_item: { rich_text: richText } } } }];
const after = section.length ? section[section.length - 1].id : blocks[start].id;
return [{ json: { ok: true, row_ok: rowOk, method: 'PATCH', url: 'https://api.notion.com/v1/blocks/40a3774f-b232-8197-aecc-c229d1b68c6b/children', body: { children: [{ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText } }], after } } }];`
    },
    position: [1980, 400]
  },
  output: [{ ok: true, row_ok: true, method: 'PATCH', url: 'https://api.notion.com/v1/blocks/x', body: {} }]
});

const writeCurrent = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Write Current Picture',
    executeOnce: true,
    parameters: {
      method: expr('{{ $json.method }}'),
      url: expr('{{ $json.url }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.body || {}) }}'),
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [2200, 400]
  },
  output: [{ object: 'list', results: [] }]
});

const readCurrent = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Read Back (weekly)',
    executeOnce: true,
    parameters: {
      method: 'GET',
      url: 'https://api.notion.com/v1/blocks/40a3774f-b232-8197-aecc-c229d1b68c6b/children?page_size=100',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [2420, 400]
  },
  output: [{ object: 'list', results: [] }]
});

const checkWeekly = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Check Weekly Read Back',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const plain = (block) => {
  const data = block && block[block.type];
  const parts = (data && data.rich_text) || [];
  return parts.map((part) => (part.type === 'mention' && part.mention && part.mention.date ? part.mention.date.start : part.plain_text || '')).join('');
};
const request = $('Verify And Plan').first().json;
const plan = $('Plan Current Picture').first().json;
const blocks = $input.first().json.results || [];
const currentOk = plan.ok && blocks.some((block) => block.type === 'bulleted_list_item' && plain(block) === request.current);
const ok = Boolean(plan.row_ok && currentOk);
return [{ json: { ok, readback: ok, row: plan.row_ok, current: currentOk, ...(ok ? {} : { error: plan.error || 'skrivningen kunde inte läsas tillbaka' }) } }];`
    },
    position: [2640, 400]
  },
  output: [{ ok: true, readback: true }]
});

const respondWeekly = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Weekly',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify($json) }}'),
      options: { responseCode: expr('{{ $json.ok ? 200 : 502 }}') }
    },
    position: [2860, 400]
  }
});

// ---------------------------------------------------------------- growth

const growthQuery = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Find Growth Row (growth)',
    executeOnce: true,
    parameters: {
      method: 'POST',
      url: 'https://api.notion.com/v1/databases/f3fdd542-83a2-4dc9-9ee7-cac981cf289a/query',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr("{{ JSON.stringify($('Verify And Plan').first().json.row.query) }}"),
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1100, 600]
  },
  output: [{ object: 'list', results: [] }]
});

const growthCreate = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Create Growth Row (growth)',
    executeOnce: true,
    parameters: {
      method: expr('{{ ($json.results || []).length ? "GET" : "POST" }}'),
      url: expr('{{ ($json.results || []).length ? "https://api.notion.com/v1/pages/" + $json.results[0].id : "https://api.notion.com/v1/pages" }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr("{{ ($json.results || []).length ? '{}' : JSON.stringify({ parent: { database_id: 'f3fdd542-83a2-4dc9-9ee7-cac981cf289a' }, properties: $('Verify And Plan').first().json.row.properties }) }}"),
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1320, 600]
  },
  output: [{ object: 'page', id: 'page-id' }]
});

const growthRead = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Read Back Growth Row (growth)',
    executeOnce: true,
    parameters: {
      method: 'GET',
      url: expr('{{ "https://api.notion.com/v1/pages/" + $json.id }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'notionApi',
      sendHeaders: true,
      headerParameters: NOTION_HEADERS,
      options: { timeout: 30000 }
    },
    credentials: NOTION_CREDENTIALS,
    position: [1540, 600]
  },
  output: [{ object: 'list', results: [] }]
});

const checkGrowth = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Check Growth Read Back',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const request = $('Verify And Plan').first().json;
const page = $input.first().json || {};
const title = ((page.properties && page.properties['Händelse'] && page.properties['Händelse'].title) || []).map((part) => part.plain_text || '').join('');
const rowOk = Boolean(page.id) && title === request.row.title && !page.archived;
return [{ json: { ok: rowOk, readback: rowOk, ...(rowOk ? { page_id: page.id } : { error: 'raden kunde inte läsas tillbaka' }) } }];`
    },
    position: [1760, 600]
  },
  output: [{ ok: true, readback: true }]
});

const respondGrowth = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Growth',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify($json) }}'),
      options: { responseCode: expr('{{ $json.ok ? 200 : 502 }}') }
    },
    position: [1980, 600]
  }
});

export default workflow('r2-learner', 'R2 – Learner')
  .add(learnerWebhook)
  .to(extractRaw)
  .to(loadConfig)
  .to(verifyRequest)
  .to(routeRequest
    .onCase(0, rejectRequest)
    .onCase(1, getLogBlocks.to(planLog.to(appendLog.to(readLog.to(checkLog.to(respondLog))))))
    .onCase(2, weeklyQuery.to(weeklyCreate.to(weeklyRead.to(getWeeklyBlocks.to(planCurrent.to(writeCurrent.to(readCurrent.to(checkWeekly.to(respondWeekly)))))))))
    .onCase(3, growthQuery.to(growthCreate.to(growthRead.to(checkGrowth.to(respondGrowth))))));
