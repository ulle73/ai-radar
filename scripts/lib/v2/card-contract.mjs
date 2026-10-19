import { readFileSync } from 'node:fs';
import { validateAgainstSchema } from './schema-validate.mjs';

const CONTRACT_VERSION = 1;

const CARD_SCHEMA = Object.freeze(JSON.parse(
  readFileSync(new URL('../../../schemas/card.v1.schema.json', import.meta.url), 'utf8')
));

export function validateCard(card) {
  return validateAgainstSchema(card, CARD_SCHEMA);
}

export { CARD_SCHEMA, CONTRACT_VERSION };
