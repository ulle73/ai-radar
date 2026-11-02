// Signerade testanrop mot R2:s webhooks efter utrullning av etapp 1a (harness-designen, utrullning steg 4).
// Skapar inga observationer eller kort: läsning, en tom batch, och anrop som ska avvisas av skrivreglerna.
//
//   node scripts/v2/harness-smoke.mjs
//
// Skriver bara status och felkoder, aldrig innehåll. Avslutas med kod 1 om något svar avviker.

import { loadSecrets, postSigned } from '../lib/v2/n8n-client.mjs';

const secrets = loadSecrets();
const call = (path, payload, timeoutMs = 60000) => postSigned({ ...secrets, path, payload, timeoutMs });

const checks = [
  ['harness-state read', () => call('r2-harness-state', { action: 'read' }), (r) => r.status === 200 && r.body?.ok && typeof r.body.state === 'object'],
  ['harness-state skriver liveness_at', () => call('r2-harness-state', { action: 'write', updates: { liveness_at: new Date().toISOString(), liveness_note: 'utrullning etapp 1a: testanrop' } }), (r) => r.status === 200 && r.body?.ok],
  ['harness-state nekar att släppa bromsen', () => call('r2-harness-state', { action: 'write', updates: { brake: 'off' } }), (r) => r.status === 403 && r.body?.error === 'write_not_allowed:brake'],
  ['harness-state nekar approved_guardrail_hash', () => call('r2-harness-state', { action: 'write', updates: { approved_guardrail_hash: 'a'.repeat(64) } }), (r) => r.status === 403],
  ['harness-state cards', () => call('r2-harness-state', { action: 'cards' }), (r) => r.status === 200 && Array.isArray(r.body?.cards)],
  ['harness-state card_update på okänt kort', () => call('r2-harness-state', { action: 'card_update', card_id: 'R2-00000000-smoketest', fields: { outcome: 'x' } }), (r) => r.status === 200 && r.body?.error === 'card_not_found'],
  ['harness-state nekar otillåtet kortfält', () => call('r2-harness-state', { action: 'card_update', card_id: 'R2-00000000-smoketest', fields: { approved_diff_sha256: 'x' } }), (r) => r.status === 403],
  ['observation ingest tom batch', () => call('r2-observations', { runner: 'smoke', observations: [] }), (r) => r.status === 200 && r.body?.ok && r.body.valid === 0],
  ['judge queue avvisar FAILED utan fail_reason', () => call('r2-judge', { action: 'complete', results: [{ status: 'FAILED', observation_ids: ['OB-000000000000'], card: null }] }), (r) => r.status === 400 && r.body?.error === 'missing_fail_reason'],
  ['data feed med lärdomar', () => call('r2-data-feed', { runner: 'smoke', want: ['sales', 'log', 'lessons'] }, 180000), (r) => r.status === 200 && r.body?.ok && Array.isArray(r.body.lesson_pages)]
];

let failed = 0;
for (const [name, run, ok] of checks) {
  try {
    const response = await run();
    const pass = ok(response);
    if (!pass) failed += 1;
    const extra = name.startsWith('data feed') ? ` (${response.body?.lesson_pages?.length ?? '–'} sidor)` : name === 'harness-state cards' ? ` (${response.body?.cards?.length ?? '–'} harness-kort)` : '';
    console.log(`${pass ? 'ok ' : 'FEL'} ${name}: ${response.status}${pass ? '' : ` ${response.body?.error || ''}`}${extra}`);
  } catch (error) {
    failed += 1;
    console.log(`FEL ${name}: ${String(error?.message || error).slice(0, 160)}`);
  }
}
process.exitCode = failed ? 1 : 0;
