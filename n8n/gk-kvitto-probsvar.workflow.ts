import { workflow, node, trigger, switchCase, expr } from '@n8n/workflow-sdk';

// GK – Kvitto och probsvar (MCP) (harness-designen C7, etapp 2). Verktyget som claude.ai och ChatGPT anropar
// via n8n-anslutningen (V4 väg a): execute_workflow med executionMode "manual", triggerNodeName "Kvitto eller probsvar"
// och inputs.webhookData.body. Flödet publiceras inte: utan aktivering finns ingen öppen webhook, och det körs
// bara manuellt via MCP. Skillen n8n-verktyg i gk-karna beskriver anropen (gk_kvitto och probsvar).
//
//   kvitto:   { kind: "kvitto", yta: "claude_ai"|"chatgpt", skill, uppgiftstyp, session }
//   probsvar: { kind: "probsvar", yta, probe: "P1"|"P2"|"P3", asked_at, answer }
//
// Flödet bedömer ingenting: det sparar svaret som en observation (source_kind receipt eller probe) i
// GK_R2_OBSERVATIONS. Motorn bedömer probsvaren lokalt (scripts/lib/v2/detectors/probes.mjs i ulle73/ai-radar).
// Hastighetsgräns: högst 60 kvitton per timme och yta, högst 10 probsvar per yta och dag. Kvitton dedupliceras
// per session, skill och dag. Samma regler finns i R2 – Probes (action answer) för Claude Code och Codex.

const OBS_TABLE = { __rl: true, mode: 'id', value: 'XIxpm5C3OmOaJTcM', cachedResultName: 'GK_R2_OBSERVATIONS' };

const toolTrigger = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Kvitto eller probsvar',
    parameters: { httpMethod: 'POST', path: 'gk-kvitto-probsvar-mcp', authentication: 'none', responseMode: 'lastNode', options: {} },
    position: [0, 300]
  },
  output: [{ body: { kind: 'kvitto', yta: 'claude_ai', skill: 'gk-arbetssatt', uppgiftstyp: 'notion', session: 'abc' } }]
});

const planInput = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan Input',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const crypto = require('crypto');
const body = ($input.first().json && $input.first().json.body) || {};
const now = new Date();
const day = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
const fail = (error) => [{ json: { ok: false, error } }];
const hash = (text) => crypto.createHash('sha256').update(String(text)).digest('hex');
const yta = String(body.yta || '');
if (!['claude_ai', 'chatgpt'].includes(yta)) return fail('yta ska vara claude_ai eller chatgpt');
if (body.kind === 'kvitto') {
  const skill = String(body.skill || '').toLowerCase();
  const uppgiftstyp = String(body.uppgiftstyp || '').toLowerCase().replace(/[^a-z0-9åäö -]/g, '').trim().slice(0, 40);
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(skill)) return fail('skill ska vara skillens namn, till exempel gk-arbetssatt');
  const session = hash(yta + ':' + String(body.session || 'okand')).slice(0, 16);
  return [{ json: { ok: true, kind: 'receipt', yta, day, like: 'receipt:' + yta + ':' + day + ':%', dedupe_key: 'receipt:' + yta + ':' + day + ':' + session + ':' + skill,
    data: { yta, skill, uppgiftstyp, session_hash: session, day },
    value: 'Kvitto från ' + yta + ': ' + skill + (uppgiftstyp ? ' (' + uppgiftstyp + ')' : '') } }];
}
if (body.kind === 'probsvar') {
  const probe = String(body.probe || '').toUpperCase();
  if (!['P1', 'P2', 'P3'].includes(probe)) return fail('probe ska vara P1, P2 eller P3');
  const answer = String(body.answer || '').slice(0, 2000);
  if (!answer.trim()) return fail('answer saknas');
  const asked = Date.parse(body.asked_at || '');
  const askedAt = Number.isFinite(asked) && Math.abs(now.getTime() - asked) < 36 * 3600000 ? new Date(asked).toISOString() : now.toISOString();
  return [{ json: { ok: true, kind: 'probe', yta, day, probe, like: 'probe:' + yta + ':' + day + ':%',
    data: { yta, probe, asked_at: askedAt, answer_excerpt: answer.slice(0, 200), answer_hash: hash(answer).slice(0, 16), day },
    value: 'Probsvar ' + probe + ' från ' + yta } }];
}
return fail('kind ska vara kvitto eller probsvar');`
    },
    position: [220, 300]
  },
  output: [{ ok: true, kind: 'receipt', yta: 'claude_ai', day: '2026-11-02', like: 'receipt:claude_ai:2026-11-02:%', dedupe_key: 'receipt:claude_ai:2026-11-02:abc:gk-arbetssatt', data: {}, value: 'Kvitto' }]
});

const getDayRows = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Day Rows',
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: OBS_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'dedupe_key', condition: 'like', keyValue: expr("{{ $('Plan Input').first().json.like || 'ingen' }}") }] },
      returnAll: true
    },
    position: [440, 300]
  },
  output: [{ observation_id: 'OB-000000000000', dedupe_key: 'receipt:claude_ai:2026-11-02:abc:gk-arbetssatt', observed_at: '2026-11-02T06:30:00.000Z' }]
});

const decide = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Decide',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const crypto = require('crypto');
const plan = $('Plan Input').first().json;
if (!plan.ok) return [{ json: { route: 0, response: { ok: false, error: plan.error } } }];
const rows = $input.all().map((item) => item.json).filter((row) => row && row.dedupe_key);
const now = new Date();
let dedupeKey = plan.dedupe_key;
let data = plan.data;
if (plan.kind === 'receipt') {
  if (rows.some((row) => row.dedupe_key === dedupeKey)) return [{ json: { route: 0, response: { ok: true, counted: false, reason: 'kvittot finns redan för sessionen i dag' } } }];
  const lastHour = rows.filter((row) => now.getTime() - Date.parse(row.observed_at || 0) < 3600000).length;
  if (lastHour >= 60) return [{ json: { route: 0, response: { ok: false, counted: false, reason: 'högst 60 kvitton per timme och yta' } } }];
} else {
  if (rows.length >= 10) return [{ json: { route: 0, response: { ok: false, counted: false, reason: 'högst 10 probsvar per yta och dag' } } }];
  const n = rows.filter((row) => row.dedupe_key.startsWith('probe:' + plan.yta + ':' + plan.day + ':' + plan.probe + ':')).length + 1;
  dedupeKey = 'probe:' + plan.yta + ':' + plan.day + ':' + plan.probe + ':' + n;
  data = Object.assign({}, plan.data, { n });
}
const id = 'OB-' + crypto.createHash('sha1').update(dedupeKey).digest('hex').slice(0, 12);
return [{ json: { route: 1,
  row: { observation_id: id, dedupe_key: dedupeKey, detector: plan.kind === 'receipt' ? 'receipts' : 'probes', area: 'tools_hub', observed_at: now.toISOString(),
    source: (plan.yta === 'chatgpt' ? 'ChatGPT' : 'claude.ai') + (plan.kind === 'receipt' ? ' – kvitto' : ' – probuppgift'), source_kind: plan.kind, url: '', value: plan.value,
    verified: false, anchors_json: '[]', alert_trigger: '', data_json: JSON.stringify(data), status: 'NEW', runner: 'n8n-mcp', received_at: now.toISOString() },
  response: { ok: true, counted: plan.kind === 'receipt' || data.n === 1, observation_id: id, reason: plan.kind === 'receipt' ? 'kvittot är sparat' : (data.n === 1 ? 'dagens första svar är sparat' : 'sparat, men bara dagens första svar räknas') } } }];`
    },
    position: [660, 300]
  },
  output: [{ route: 1, row: {}, response: { ok: true } }]
});

const routeDecision = switchCase({
  version: 3.4,
  config: { name: 'Route Decision', parameters: { mode: 'expression', numberOutputs: 2, output: expr('{{ $json.route }}') }, position: [880, 300] }
});

const answerOnly = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Svar',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `return [{ json: $('Decide').first().json.response }];` },
    position: [1100, 200]
  },
  output: [{ ok: true, counted: false }]
});

const insertObservation = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Insert Observation',
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
    position: [1100, 400]
  },
  output: [{ id: 1 }]
});

const answerSaved = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Svar efter sparande',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `return [{ json: $('Decide').first().json.response }];` },
    position: [1320, 400]
  },
  output: [{ ok: true, counted: true }]
});

export default workflow('gk-kvitto-probsvar', 'GK – Kvitto och probsvar (MCP)')
  .add(toolTrigger)
  .to(planInput)
  .to(getDayRows)
  .to(decide)
  .to(routeDecision
    .onCase(0, answerOnly)
    .onCase(1, insertObservation.to(answerSaved)));
