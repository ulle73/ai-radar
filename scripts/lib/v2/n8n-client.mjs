// Signerade anrop till R2-webhooks i n8n (R2 – Observation Ingest, R2 – Data Feed).
// Signatur: hex(HMAC-SHA256(hemlighet, "<unix-sekunder>.<rå body>")) i x-r2-signature,
// tidsstämpeln i x-r2-timestamp. n8n avvisar anrop äldre än 5 minuter.

import { createHmac } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const MAX_BATCH = 200;
const DEFAULT_BASE = 'https://n8n-production-91e6.up.railway.app';

export function signBody(secret, rawBody, timestamp = Math.floor(Date.now() / 1000)) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('signeringshemlighet saknas eller är för kort');
  const ts = String(timestamp);
  return { timestamp: ts, signature: createHmac('sha256', secret).update(`${ts}.${rawBody}`).digest('hex') };
}

// Miljövariabler går före den lokala filen (~/.ai-radar/secrets.json), så att Actions och lokalt fungerar likadant.
export function loadSecrets({ env = process.env, file = path.join(os.homedir(), '.ai-radar', 'secrets.json') } = {}) {
  let local = {};
  if (existsSync(file)) local = JSON.parse(readFileSync(file, 'utf8'));
  const secret = env.R2_SIGNING_SECRET || local.R2_SIGNING_SECRET || '';
  const baseUrl = (env.R2_N8N_BASE || local.R2_N8N_BASE || DEFAULT_BASE).replace(/\/+$/, '');
  if (secret.length < 32) throw new Error('R2_SIGNING_SECRET saknas (miljövariabel eller ~/.ai-radar/secrets.json)');
  return { secret, baseUrl };
}

export async function postSigned({ baseUrl, path: webhookPath, secret, payload, fetchImpl = fetch, timeoutMs = 30000 }) {
  const raw = JSON.stringify(payload);
  const { timestamp, signature } = signBody(secret, raw);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${baseUrl}/webhook/${webhookPath}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-r2-timestamp': timestamp, 'x-r2-signature': signature },
      body: raw,
      signal: controller.signal
    });
    const text = await response.text();
    let body = null;
    try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 200) }; }
    return { status: response.status, body };
  } finally {
    clearTimeout(timer);
  }
}

export function chunk(list, size = MAX_BATCH) {
  const batches = [];
  for (let i = 0; i < list.length; i += size) batches.push(list.slice(i, i + size));
  return batches;
}

export async function sendObservations({ observations, runner, secrets, fetchImpl = fetch }) {
  const results = [];
  for (const batch of chunk(observations)) {
    const result = await postSigned({ ...secrets, path: 'r2-observations', payload: { runner, observations: batch }, fetchImpl });
    if (result.status >= 300 || !result.body?.ok) {
      throw new Error(`ingest avvisade batch (${result.status}): ${result.body?.error || 'okänt fel'}`);
    }
    results.push(result.body);
  }
  return results.reduce((sum, body) => ({
    received: sum.received + (body.received || 0),
    valid: sum.valid + (body.valid || 0),
    invalid: sum.invalid + (body.invalid || 0)
  }), { received: 0, valid: 0, invalid: 0 });
}

export async function fetchDataFeed({ runner, secrets, fetchImpl = fetch }) {
  const result = await postSigned({ ...secrets, path: 'r2-data-feed', payload: { runner, want: ['sales', 'log'] }, fetchImpl, timeoutMs: 60000 });
  if (result.status !== 200 || !result.body?.ok) {
    throw new Error(`data feed svarade ${result.status}: ${result.body?.error || 'okänt fel'}`);
  }
  return result.body;
}

export { MAX_BATCH };
