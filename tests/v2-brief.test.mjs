import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildDigest, selectCards } from '../scripts/lib/v2/brief.mjs';

const NOW = '2026-10-26T06:30:00.000Z'; // måndag 07:30 i Stockholm

let counter = 0;
function row(overrides = {}) {
  counter += 1;
  const cardId = overrides.card_id || `R2-20261025-${String(counter).padStart(8, '0')}`;
  return {
    card_id: cardId,
    dedupe_key: `card:test:${counter}`,
    area: 'tools_hub',
    type: 'ANVAND',
    title: `Kort ${counter}`,
    status: 'SHADOW',
    publishable: true,
    unverified: false,
    rank_score: 80,
    judged_at: '2026-10-25T10:00:00.000Z',
    card_json: JSON.stringify({ card_id: cardId, expires_at: '2026-11-08T10:00:00.000Z' }),
    discord_json: JSON.stringify({ content: '💡 ANVÄND · **Verktyg & hubb** · AI Radar v2', embeds: [{ title: `Kort ${counter}` }], components: [] }),
    decision: null,
    decided_at: null,
    rating: null,
    reason: null,
    discord_message_id: null,
    posted_at: null,
    ...overrides
  };
}

const ids = (picked) => picked.map((item) => item.card_id);

test('brief takes the three best cards, at most two per area, and adds the header to the first', () => {
  const rows = [
    row({ card_id: 'R2-a-tools-1', rank_score: 99 }),
    row({ card_id: 'R2-a-tools-2', rank_score: 98 }),
    row({ card_id: 'R2-a-tools-3', rank_score: 97 }),
    row({ card_id: 'R2-a-projects', area: 'projects', type: 'PROJEKT', rank_score: 60 }),
    row({ card_id: 'R2-a-sales', area: 'sales', rank_score: 50 })
  ];
  const picked = selectCards(rows, 'brief', NOW);
  assert.deepEqual(ids(picked), ['R2-a-tools-1', 'R2-a-tools-2', 'R2-a-projects']);
  assert.match(picked[0].message.content, /^☀️ \*\*Morgonbrev måndag 26 oktober\*\* · 3 kort\n💡 ANVÄND/);
  assert.equal(picked[1].message.content, '💡 ANVÄND · **Verktyg & hubb** · AI Radar v2');
});

test('only one card per dedupe_key, highest rank first and then the newest', () => {
  const rows = [
    row({ card_id: 'R2-b-old', dedupe_key: 'card:release:openai/codex', rank_score: 90, judged_at: '2026-10-19T17:06:02.777Z' }),
    row({ card_id: 'R2-b-new', dedupe_key: 'card:release:openai/codex', rank_score: 97, judged_at: '2026-10-23T09:49:21.788Z' }),
    row({ card_id: 'R2-b-tie-old', dedupe_key: 'card:tie', rank_score: 70, judged_at: '2026-10-20T00:00:00.000Z' }),
    row({ card_id: 'R2-b-tie-new', dedupe_key: 'card:tie', rank_score: 70, judged_at: '2026-10-24T00:00:00.000Z' })
  ];
  assert.deepEqual(ids(selectCards(rows, 'brief', NOW)), ['R2-b-new', 'R2-b-tie-new']);
});

test('unpublishable, unverified, expired, posted or decided cards never reach the brief', () => {
  const rows = [
    row({ card_id: 'R2-c-ok' }),
    row({ card_id: 'R2-c-unpublishable', publishable: false }),
    row({ card_id: 'R2-c-unverified', unverified: true }),
    row({ card_id: 'R2-c-unknown-verification', unverified: null }),
    row({ card_id: 'R2-c-expired', card_json: JSON.stringify({ expires_at: '2026-10-20T00:00:00.000Z' }) }),
    row({ card_id: 'R2-c-no-expiry', card_json: JSON.stringify({}) }),
    row({ card_id: 'R2-c-posted', discord_message_id: '123' }),
    row({ card_id: 'R2-c-published', status: 'PUBLISHED', decision: 'OK', decided_at: '2026-01-01T00:00:00.000Z' }),
    row({ card_id: 'R2-c-no-message', discord_json: null })
  ];
  assert.deepEqual(ids(selectCards(rows, 'brief', NOW)), ['R2-c-ok']);
});

test('a key waiting for a decision, or decided within 90 days, is not raised again', () => {
  const rows = [
    row({ card_id: 'R2-d-pending-old', dedupe_key: 'card:pending', status: 'PUBLISHED', discord_message_id: '1' }),
    row({ card_id: 'R2-d-pending-new', dedupe_key: 'card:pending', rank_score: 99 }),
    row({ card_id: 'R2-d-later-old', dedupe_key: 'card:later', status: 'PUBLISHED', decision: 'INTE_NU', decided_at: '2026-09-01T00:00:00.000Z' }),
    row({ card_id: 'R2-d-later-new', dedupe_key: 'card:later' }),
    row({ card_id: 'R2-d-cooled-old', dedupe_key: 'card:cooled', status: 'PUBLISHED', decision: 'NEJ', decided_at: '2026-06-01T00:00:00.000Z' }),
    row({ card_id: 'R2-d-cooled-new', dedupe_key: 'card:cooled' })
  ];
  assert.deepEqual(ids(selectCards(rows, 'brief', NOW)), ['R2-d-cooled-new']);
});

test('alarms are LARM only, are left out of the brief and ignore the area limit', () => {
  const rows = [
    row({ card_id: 'R2-e-alarm-1', type: 'LARM', area: 'sales', rank_score: 90 }),
    row({ card_id: 'R2-e-alarm-2', type: 'LARM', area: 'sales', rank_score: 80 }),
    row({ card_id: 'R2-e-alarm-3', type: 'LARM', area: 'sales', rank_score: 70 }),
    row({ card_id: 'R2-e-card', area: 'sales' })
  ];
  const alarms = selectCards(rows, 'alarm', NOW);
  assert.deepEqual(ids(alarms), ['R2-e-alarm-1', 'R2-e-alarm-2', 'R2-e-alarm-3']);
  assert.doesNotMatch(alarms[0].message.content, /Morgonbrev/);
  assert.deepEqual(ids(selectCards(rows, 'brief', NOW)), ['R2-e-card']);
});

test('nothing to send gives an empty brief, also for rows from an empty table', () => {
  assert.deepEqual(selectCards([], 'brief', NOW), []);
  assert.deepEqual(selectCards([{}], 'brief', NOW), []);
});

const FRIDAY = '2026-10-30T14:00:00.000Z'; // fredag 15:00 i Stockholm

test('the Friday digest counts the week, lists waiting cards and minor news', () => {
  const cards = [
    row({ title: 'Godkänt kort', status: 'PUBLISHED', judged_at: '2026-10-26T06:00:00.000Z', posted_at: '2026-10-26T06:30:00.000Z', decision: 'OK', decided_at: '2026-10-26T08:00:00.000Z', rating: 8, reason: 'build' }),
    row({ title: 'Generiskt kort', status: 'PUBLISHED', judged_at: '2026-10-27T06:00:00.000Z', posted_at: '2026-10-27T06:30:00.000Z', decision: 'NEJ', decided_at: '2026-10-27T08:00:00.000Z', rating: 5, reason: 'generic' }),
    row({ title: 'Väntande kort', status: 'PUBLISHED', judged_at: '2026-10-28T06:00:00.000Z', posted_at: '2026-10-28T06:30:00.000Z' }),
    row({ title: 'Gammalt kort', status: 'PUBLISHED', judged_at: '2026-10-01T06:00:00.000Z', posted_at: '2026-10-01T06:30:00.000Z', decision: 'OK', decided_at: '2026-10-02T08:00:00.000Z', rating: 2 })
  ];
  const observations = [
    { observation_id: 'OB-1', status: 'DIGEST', value: 'Notion Log: testet för friskvårdsmejl har stått stilla i 21 dagar', url: 'https://www.notion.so/x', observed_at: '2026-10-29T10:00:00.000Z' },
    { observation_id: 'OB-2', status: 'DIGESTED', value: 'Redan med förra veckan', observed_at: '2026-10-20T10:00:00.000Z' },
    {}
  ];
  const costs = [{ month: '2026-10', cost_sek: 1.5 }, { month: '2026-09', cost_sek: 99 }, {}];
  const { message, observation_ids } = buildDigest(cards, observations, costs, FRIDAY);
  const text = message.embeds[0].description;

  assert.equal(message.content, '📅 **Fredagssammanfattning v. 44** · AI Radar v2');
  assert.equal(message.embeds[0].title, 'Veckan 2026-10-24 – 2026-10-30');
  assert.match(text, /Kort bedömda: 3 · publicerade: 3 · beslut: OK 1, Nej 1, Inte nu 0/);
  assert.match(text, /Snittbetyg: 6,5 \(2 betyg\)/);
  assert.match(text, /Visste redan eller För generiskt: 1 av 3 publicerade \(33 %\)/);
  assert.match(text, /Kostnad oktober: 1,5 kr av 250 kr/);
  assert.match(text, /\*\*Fick OK\*\*\n• Godkänt kort\n/);
  assert.match(text, /\*\*Väntar på beslut\*\*\n• Väntande kort · 2026-10-28\n/);
  assert.match(text, /\*\*Mindre nyheter\*\*\n• Notion Log: testet för friskvårdsmejl har stått stilla i 21 dagar \(\[källa\]\(https:\/\/www\.notion\.so\/x\)\)/);
  assert.doesNotMatch(text, /Redan med förra veckan|Gammalt kort/);
  assert.deepEqual(observation_ids, ['OB-1']);
});

test('a quiet week still gives a short, honest digest and caps long lists', () => {
  const quiet = buildDigest([{}], [{}], [{}], FRIDAY);
  assert.match(quiet.message.embeds[0].description, /Snittbetyg: inga betyg den här veckan/);
  assert.match(quiet.message.embeds[0].description, /Inget väntar\./);
  assert.match(quiet.message.embeds[0].description, /Inga den här veckan\./);
  assert.deepEqual(quiet.observation_ids, []);

  const news = Array.from({ length: 20 }, (_, index) => ({
    observation_id: `OB-n${index}`, status: 'DIGEST', value: `Nyhet ${index}`, observed_at: new Date(Date.parse(FRIDAY) - index * 3600000).toISOString()
  }));
  const busy = buildDigest([], news, [], FRIDAY);
  assert.equal(busy.observation_ids.length, 15);
  assert.equal(busy.observation_ids[0], 'OB-n0');
  assert.match(busy.message.embeds[0].description, /… och 5 till nästa vecka/);
  assert.ok(busy.message.embeds[0].description.length <= 4000);
});

test('long news lines are only marked as digested when they fit in the message', () => {
  const url = `https://app.notion.com/p/${'Id-julklappsguiderna-pitcha-premiumkortet-till-redaktioner-i-oktober-'.repeat(2)}3e33774fb23281f8bcbcd260a61b8f11`;
  const news = Array.from({ length: 15 }, (_, index) => ({
    observation_id: `OB-long${index}`, status: 'DIGEST', url,
    value: `"Idé nummer ${index}: ${'en lång rubrik från Notion Log '.repeat(5)}" (Idé, 2026-09-22) har ingen uppföljning på 27 dagar`,
    observed_at: new Date(Date.parse(FRIDAY) - index * 3600000).toISOString()
  }));
  const { message, observation_ids } = buildDigest([], news, [], FRIDAY);
  const text = message.embeds[0].description;
  assert.ok(text.length <= 4096, `beskrivningen är ${text.length} tecken`);
  assert.ok(observation_ids.length > 0 && observation_ids.length < 15);
  for (const [index, id] of observation_ids.entries()) assert.equal(id, `OB-long${index}`);
  assert.equal(text.split(url).length - 1, observation_ids.length, 'varje markerad nyhet visas i sin helhet');
  assert.match(text, new RegExp(`… och ${15 - observation_ids.length} till nästa vecka$`));
});

test('the n8n publisher carries an identical copy of the shared block', () => {
  const source = readFileSync(new URL('../scripts/lib/v2/brief.mjs', import.meta.url), 'utf8');
  const block = source.slice(source.indexOf('// <r2-publisher-shared>'), source.indexOf('// </r2-publisher-shared>'));
  assert.ok(block.length > 1000);
  assert.ok(!/[`\\]|\$\{/.test(block), 'blocket får inte innehålla backticks, bakstreck eller ${');
  const workflowSource = readFileSync(new URL('../n8n/r2-discord-publisher.workflow.ts', import.meta.url), 'utf8');
  const copies = workflowSource.split(block).length - 1;
  assert.equal(copies, 2, 'blocket ska finnas i både Select Cards och Build Digest');
});
