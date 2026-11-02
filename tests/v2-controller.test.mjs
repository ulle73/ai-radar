import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { git } from '../scripts/lib/v2/harness/git.mjs';
import { engineMayWrite, gate, guardrailHash, mayStart, pendingHarnessCards, stateClient, withTimeout } from '../scripts/lib/v2/harness/controller.mjs';
import { write } from './helpers/harness-repo.mjs';

const OK_STATE = { brake: 'off', approved_guardrail_hash: 'h1', 'breaker:skill_text': 'off' };

test('läsfel betyder stopp, men återställning och larm körs ändå (T20, CUJ 4)', () => {
  assert.equal(gate({ step: 'implementer', state: null, readError: 'ECONNREFUSED' }).go, false);
  assert.equal(gate({ step: 'rollback', state: null, readError: 'ECONNREFUSED' }).go, true);
  assert.equal(gate({ step: 'alert', state: null, readError: 'x' }).go, true);
});

test('aktiv broms och aktiv brytare stoppar nästa steg; återställning tillåts (T20)', () => {
  assert.match(gate({ step: 'publisher', state: { ...OK_STATE, brake: 'on' }, guardrail: 'h1' }).reason, /nödbromsen/);
  assert.equal(gate({ step: 'rollback', state: { ...OK_STATE, brake: 'on' } }).go, true);
  assert.match(gate({ step: 'verifier', state: { ...OK_STATE, 'breaker:skill_text': 'on' }, guardrail: 'h1' }).reason, /brytaren/);
  assert.equal(gate({ step: 'verifier', state: OK_STATE, guardrail: 'h1' }).go, true);
});

test('skyddsräckespaket med annan hash än den godkända stoppar och larmar', () => {
  const result = gate({ step: 'implementer', state: OK_STATE, guardrail: 'h2' });
  assert.equal(result.go, false);
  assert.equal(result.alert, true);
  assert.equal(gate({ step: 'implementer', state: { ...OK_STATE, approved_guardrail_hash: '' }, guardrail: 'h1' }).go, false);
});

test('skrivregler: motorn får bara skriva liveness_*, canary_* och aktivera broms eller brytare', () => {
  for (const key of ['liveness_at', 'liveness_note', 'canary_code', 'canary_code_prev', 'valid_from']) assert.ok(engineMayWrite(key, 'x'), key);
  assert.ok(engineMayWrite('brake', 'on'));
  assert.ok(engineMayWrite('breaker:skill_text', 'on'));
  assert.ok(!engineMayWrite('brake', 'off'), 'släppa bromsen bara via Discord');
  assert.ok(!engineMayWrite('breaker:skill_text', 'off'));
  assert.ok(!engineMayWrite('approved_guardrail_hash', 'a'.repeat(64)));
  assert.ok(!engineMayWrite('signing_secret', 'x'));
});

test('n8n-flödet speglar samma skrivregler', () => {
  const flow = readFileSync(new URL('../n8n/r2-harness-state.workflow.ts', import.meta.url), 'utf8');
  const source = flow.match(/const engineMayWrite = \(key, value\) => \{([\s\S]*?)\n\};/)[1];
  // eslint-disable-next-line no-new-func
  const mirror = new Function('key', 'value', source);
  for (const [key, value] of [['liveness_at', 'x'], ['brake', 'on'], ['brake', 'off'], ['approved_guardrail_hash', 'h'], ['breaker:skill_text', 'off'], ['canary_code', 'K']]) {
    assert.equal(mirror(key, value), engineMayWrite(key, value), `${key}=${value}`);
  }
});

test('klienten vägrar förbjudna skrivningar innan något skickas, och läsfel kastar', async () => {
  const sent = [];
  const client = stateClient(async (payload) => { sent.push(payload); return { status: 200, body: { ok: true, state: { brake: 'off' } } }; });
  await assert.rejects(client.write({ brake: 'off' }), /får inte skriva brake/);
  assert.equal(sent.length, 0);
  await client.write({ liveness_at: '2026-11-02T00:00:00Z' });
  assert.deepEqual(await client.read(), { brake: 'off' });
  const failing = stateClient(async () => ({ status: 500, body: { ok: false, error: 'nere' } }));
  await assert.rejects(failing.read(), /500/);
});

test('nattfasen startar inte om datorn har använts de senaste 30 minuterna (T23)', () => {
  const inWindow = () => true;
  assert.equal(mayStart({ idle: 5, inWindow }).go, false);
  assert.equal(mayStart({ idle: 45, inWindow }).go, true);
  assert.equal(mayStart({ idle: 45, inWindow: () => false }).go, false);
  assert.equal(mayStart({ idle: Number.NaN, inWindow }).go, false);
});

test('hash över skyddsräckespaketet ändras bara när harness/, hub/ eller evals/ ändras', async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'r2-guard-hash-'));
  const remote = path.join(root, 'r.git');
  const clone = path.join(root, 'c');
  const BOT = ['-c', 'user.name=t', '-c', 'user.email=t@example.invalid'];
  try {
    await git({ cwd: root }, ['init', '--quiet', '--bare', '-b', 'main', remote]);
    await git({ cwd: root }, ['clone', '--quiet', remote, clone]);
    await git({ cwd: clone }, ['checkout', '--quiet', '-b', 'main']);
    write(clone, 'harness/policy.json', '{}');
    write(clone, 'plugins/gk-karna/skills/gk-arbetssatt/SKILL.md', 'a');
    const commitPush = async (message) => {
      await git({ cwd: clone }, ['add', '-A']);
      await git({ cwd: clone }, [...BOT, 'commit', '--quiet', '-m', message]);
      await git({ cwd: clone }, ['push', '--quiet', 'origin', 'main']);
      await git({ cwd: clone }, ['fetch', '--quiet', 'origin']);
    };
    await commitPush('bas');
    const first = await guardrailHash(clone);
    write(clone, 'plugins/gk-karna/skills/gk-arbetssatt/SKILL.md', 'b');
    await commitPush('skill');
    assert.equal(await guardrailHash(clone), first, 'vanliga skillpubliceringar kräver inget nytt godkännande');
    write(clone, 'harness/policy.json', '{"version":2}');
    await commitPush('policy');
    assert.notEqual(await guardrailHash(clone), first);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('kö: bara harness-kort som klarade grindarna och inte är klara; KRÄVER_OK kräver OK', () => {
  const card = (id, extra = {}) => ({ card_id: id, publishable: true, card_json: JSON.stringify({ card_id: id, mistake_ref: 'notion-las-forst' }), ...extra });
  const rows = [
    card('R2-a-0001'),
    card('R2-a-0002', { published_version: '1.0.4' }),
    card('R2-a-0003', { autonomy: 'KRAVER_OK' }),
    card('R2-a-0004', { autonomy: 'KRAVER_OK', decision: 'OK', approved_diff_sha256: 'a'.repeat(64) }),
    card('R2-a-0005', { decision: 'NEJ' }),
    card('R2-a-0006', { autonomy: 'AVVISAD' }),
    { card_id: 'R2-a-0007', publishable: true, card_json: '{"card_id":"R2-a-0007"}' },
    card('R2-a-0008', { publishable: false }),
    card('R2-a-0009', { autonomy: 'KRAVER_OK', decision: 'OK', approved_diff_sha256: '' }),
    card('R2-a-0010', { publishable: 'true' })
  ];
  // 0008: stoppad av grindarna (t.ex. skeptikern, G5). 0009: OK vid C3a utan sha får ta fram diffen.
  assert.deepEqual(pendingHarnessCards(rows).map(({ card: c }) => c.card_id), ['R2-a-0001', 'R2-a-0004', 'R2-a-0009', 'R2-a-0010']);
});

test('withTimeout avbryter ett steg som tar för lång tid', async () => {
  await assert.rejects(withTimeout(new Promise(() => {}), 20, 'verifier'), /verifier tog längre tid/);
  assert.equal(await withTimeout(Promise.resolve(7), 1000, 'x'), 7);
});
