import test from 'node:test';
import assert from 'node:assert/strict';
import { cardComponents, formatCardMessage, parseCardCustomId } from '../scripts/lib/v2/discord.mjs';
import { anvandCard, ersattCard, json, larmCard, nyCard, projektCard } from './helpers/v2-fixtures.mjs';

test('every card type renders within Discord limits', () => {
  for (const card of [nyCard(), ersattCard(), projektCard(), anvandCard(), larmCard()].map(json)) {
    const message = formatCardMessage(card, { rank_score: 82 });
    assert.ok(message.content.length <= 2000);
    assert.equal(message.embeds.length, 1);
    assert.ok(message.embeds[0].title.length <= 256);
    assert.ok(message.embeds[0].description.length <= 4096);
    assert.ok(message.components.length <= 5);
    for (const row of message.components) {
      assert.equal(row.type, 1);
      assert.ok(row.components.length <= 5);
      for (const button of row.components) {
        assert.ok(button.custom_id.length >= 1 && button.custom_id.length <= 100);
        assert.ok(button.label.length <= 80);
        assert.ok([1, 2, 3, 4].includes(button.style));
      }
    }
  }
});

test('messages follow Jonas phrasing and show because, evidence and action', () => {
  const ny = formatCardMessage(json(nyCard()));
  assert.match(ny.embeds[0].description, /^\*\*Använd `caption-kit`\.\*\* Ni har inget som gör just detta\./);
  assert.match(ny.embeds[0].description, /\*\*För att:\*\* hyperframes saknar/);
  assert.match(ny.embeds[0].description, /\*\*Bevis\*\*\n• \+420 stjärnor/);
  assert.match(ny.embeds[0].description, /\*\*Vid OK:\*\* Installera via hub\.py/);
  assert.equal(ny.embeds[0].url, 'https://github.com/example/caption-kit');

  assert.match(formatCardMessage(json(ersattCard())).embeds[0].description, /`motion-kit` bör ersätta `remotion`/);
  assert.match(formatCardMessage(json(anvandCard())).embeds[0].description, /\*\*Regel\*\*\n> Kör `hub\.py sync`/);
  assert.match(formatCardMessage(json(projektCard())).embeds[0].description, /\*\*Mått:\*\* antal bevakade direkta konkurrenter · baslinje 0/);
  assert.match(formatCardMessage(json(larmCard())).content, /^🚨 LARM/);
});

test('long texts are cut instead of breaking the message', () => {
  const card = json(nyCard({ title: 'T'.repeat(400), because: `hyperframes ${'x'.repeat(5000)}` }));
  const message = formatCardMessage(card);
  assert.ok(message.embeds[0].title.length <= 256);
  assert.ok(message.embeds[0].description.length <= 4000);
  assert.match(message.embeds[0].title, /…$/);
});

test('button ids round-trip through the parser', () => {
  const ids = cardComponents('R2-20261019-948277ff').flatMap((row) => row.components.map((button) => button.custom_id));
  assert.equal(ids.length, 4 + 5 + 5 + 4);
  for (const id of ids) assert.ok(parseCardCustomId(id), id);
  assert.deepEqual(parseCardCustomId('r2:ok:R2-20261019-948277ff'), { kind: 'decision', decision: 'OK', card_id: 'R2-20261019-948277ff' });
  assert.deepEqual(parseCardCustomId('r2:later:R2-20261019-948277ff'), { kind: 'decision', decision: 'INTE_NU', card_id: 'R2-20261019-948277ff' });
  assert.deepEqual(parseCardCustomId('r2:rate:7:R2-20261019-948277ff'), { kind: 'rate', rating: 7, card_id: 'R2-20261019-948277ff' });
  assert.deepEqual(parseCardCustomId('r2:why:generic:R2-20261019-948277ff'), { kind: 'why', reason: 'generic', card_id: 'R2-20261019-948277ff' });
});

test('malformed or foreign button ids are rejected', () => {
  for (const id of ['rate:7:AR-1', 'r2:rate:11:R2-20261019-aaaa', 'r2:rate:0:R2-20261019-aaaa', 'r2:why:evil:R2-20261019-aaaa',
    'r2:ok:AR-123', 'r2:delete:R2-20261019-aaaa', 'r2:ok:R2-20261019-aaaa:extra', '']) {
    assert.equal(parseCardCustomId(id), null, id);
  }
});

// ---------------------------------------------------------------- förbättringsmotorn (harness, etapp 1a)
import { readFileSync } from 'node:fs';
import { JONAS_DISCORD_ID, decisionComponents, formatDecisionMessage, harnessControlComponents, isJonas } from '../scripts/lib/v2/discord.mjs';

const SHA = 'ab'.repeat(32);

test('nya knappar: nödbroms, godkänt skyddsräckespaket och OK bundet till diffens sha256', () => {
  assert.deepEqual(parseCardCustomId('r2:brake:on'), { kind: 'brake', value: 'on' });
  assert.deepEqual(parseCardCustomId('r2:brake:off'), { kind: 'brake', value: 'off' });
  assert.equal(parseCardCustomId('r2:brake:maybe'), null);
  assert.deepEqual(parseCardCustomId(`r2:policy:approve:${SHA}`), { kind: 'policy_approve', hash: SHA });
  assert.equal(parseCardCustomId('r2:policy:approve:kort'), null);
  assert.deepEqual(parseCardCustomId(`r2:ok:R2-20261102-abcd1234:${SHA}`), { kind: 'decision', decision: 'OK', card_id: 'R2-20261102-abcd1234', diff_sha256: SHA });
  assert.equal(parseCardCustomId(`r2:no:R2-20261102-abcd1234:${SHA}`), null);
  assert.deepEqual(parseCardCustomId('r2:ok:R2-20261102-abcd1234'), { kind: 'decision', decision: 'OK', card_id: 'R2-20261102-abcd1234' });
});

test('knapparnas custom_id håller sig inom 100 tecken och tolkas tillbaka', () => {
  const ids = [
    ...decisionComponents('R2-20261102-abcd1234', SHA)[0].components.map((b) => b.custom_id),
    ...harnessControlComponents({ guardrailHash: SHA })[0].components.map((b) => b.custom_id),
    ...harnessControlComponents({ brake: 'on' })[0].components.map((b) => b.custom_id)
  ];
  for (const id of ids) {
    assert.ok(id.length <= 100, id);
    assert.ok(parseCardCustomId(id), id);
  }
});

test('bara Jonas Discord-ID godtas, och n8n-tolken speglar de nya knapparna', () => {
  assert.ok(isJonas(JONAS_DISCORD_ID));
  assert.ok(!isJonas('123'));
  const flow = readFileSync(new URL('../n8n/r2-card-feedback.workflow.ts', import.meta.url), 'utf8');
  assert.match(flow, new RegExp(`JONAS_ID = '${JONAS_DISCORD_ID}'`));
  assert.match(flow, /kind === 'brake'/);
  assert.match(flow, /kind === 'policy'/);
  assert.match(flow, /numberOutputs: 6/);
  assert.match(flow, /\.onCase\(5, saveHarnessState/);
});

test('beslutspunkten visar diffen, sha256, standardutfall och knapparna OK/Nej', () => {
  const card = { card_id: 'R2-20261102-abcd1234', title: 'Ändring i golfkuponger-outlook-drafts', recommendation: 'Förtydliga signaturen.', because: 'Tre lärdomar.', mistake_ref: 'signatur', target: { ref: 'golfkuponger-outlook-drafts' } };
  const message = formatDecisionMessage(card, { reason: 'skill med hög konsekvens', diff: '+ny rad', diffSha256: SHA });
  assert.match(message.embeds[0].description, /avvisas om inget svar på 30 dagar/);
  assert.match(message.embeds[0].description, new RegExp(SHA));
  assert.match(message.embeds[0].description, /```diff/);
  const ids = message.components[0].components.map((b) => b.custom_id);
  assert.ok(ids.includes(`r2:ok:R2-20261102-abcd1234:${SHA}`));
  assert.ok(ids.includes('r2:no:R2-20261102-abcd1234'));
  assert.ok(message.embeds[0].description.length <= 4096);
});
