// Minimal MCP-server (stdio, JSON-RPC per rad) för evals (harness-designen C5, V2). Läser bara de Notion-sidor
// som integrationen "GK motor – test" är delad med ([TEST]-sidor). Token kommer från NOTION_TEST_TOKEN, som
// startskriptet (verifier.mjs launcherScript) dekrypterar med DPAPI. Bara läsverktyg; ingen nedladdning.
import readline from 'node:readline';

const TOKEN = process.env.NOTION_TEST_TOKEN;
const API = 'https://api.notion.com/v1';
const HEADERS = { Authorization: `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };

const TOOLS = [
  { name: 'notion_test_search', description: 'Sök bland Notion-testsidorna. Returnerar titel och id.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    annotations: { readOnlyHint: true } },
  { name: 'notion_test_read', description: 'Läs en Notion-testsida (egenskaper och textblock) via id.',
    inputSchema: { type: 'object', properties: { page_id: { type: 'string' } }, required: ['page_id'] },
    annotations: { readOnlyHint: true } }
];

const plain = (rich = []) => rich.map((t) => t.plain_text || '').join('');

async function notion(path, init = {}) {
  const res = await fetch(API + path, { ...init, headers: HEADERS });
  if (!res.ok) throw new Error(`Notion ${res.status}`);
  return res.json();
}

async function search(query) {
  const r = await notion('/search', { method: 'POST', body: JSON.stringify({ query, page_size: 10 }) });
  return r.results.map((p) => {
    const title = Object.values(p.properties || {}).find((v) => v.type === 'title');
    return `${p.id} | ${title ? plain(title.title) : ''}`;
  }).join('\n') || 'Inga träffar.';
}

async function read(pageId) {
  const page = await notion(`/pages/${pageId}`);
  const props = Object.entries(page.properties || {}).map(([k, v]) => {
    const val = v.type === 'title' ? plain(v.title) : v.type === 'rich_text' ? plain(v.rich_text) : '';
    return val ? `${k}: ${val}` : null;
  }).filter(Boolean);
  const blocks = await notion(`/blocks/${pageId}/children?page_size=100`);
  const text = blocks.results.map((b) => plain(b[b.type]?.rich_text)).filter(Boolean);
  return [...props, '', ...text].join('\n');
}

const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', async (line) => {
  let req; try { req = JSON.parse(line); } catch { return; }
  const { id, method, params } = req;
  if (id === undefined) return; // notifieringar
  try {
    if (method === 'initialize') {
      send({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion || '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'notion-test', version: '0.1.0' } } });
    } else if (method === 'tools/list') {
      send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
    } else if (method === 'tools/call') {
      const a = params?.arguments || {};
      const text = params?.name === 'notion_test_search' ? await search(String(a.query || ''))
        : params?.name === 'notion_test_read' ? await read(String(a.page_id || ''))
        : (() => { throw new Error('okänt verktyg'); })();
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } });
    } else if (method === 'ping') {
      send({ jsonrpc: '2.0', id, result: {} });
    } else {
      send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'okänd metod' } });
    }
  } catch (e) {
    send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Fel: ${e.message}` }], isError: true } });
  }
});
