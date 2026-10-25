// Renderar om Discord-meddelanden för kort i n8n (GK_R2_CARDS) med scripts/lib/v2/discord.mjs.
//
//   node scripts/v2/render-discord.mjs            # bara kort som saknar meddelande
//   node scripts/v2/render-discord.mjs --all      # alla kort, t.ex. efter att kortformatet ändrats
//
// Läser via R2 – Judge Queue (list_cards) och skriver tillbaka med set_discord. Inget postas till Discord.

import { loadSecrets, postSigned } from '../lib/v2/n8n-client.mjs';
import { formatCardMessage } from '../lib/v2/discord.mjs';

const all = process.argv.includes('--all');
const secrets = loadSecrets();

const listed = await postSigned({ ...secrets, path: 'r2-judge', payload: { action: 'list_cards' }, timeoutMs: 60000 });
if (listed.status !== 200 || !listed.body?.ok) throw new Error(`list_cards svarade ${listed.status}: ${listed.body?.error || 'okänt fel'}`);

const items = [];
let skipped = 0;
for (const row of listed.body.cards) {
  if (!all && row.has_discord) continue;
  try {
    const card = JSON.parse(row.card_json);
    items.push({ card_id: row.card_id, discord_json: JSON.stringify(formatCardMessage(card, { rank_score: row.rank_score })) });
  } catch {
    skipped += 1;
  }
}

if (items.length) {
  const sent = await postSigned({ ...secrets, path: 'r2-judge', payload: { action: 'set_discord', items }, timeoutMs: 60000 });
  if (sent.status >= 300 || !sent.body?.ok) throw new Error(`set_discord svarade ${sent.status}: ${sent.body?.error || 'okänt fel'}`);
}
console.log(`kort: ${listed.body.cards.length}, renderade: ${items.length}, kunde inte läsas: ${skipped}`);
