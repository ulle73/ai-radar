// Domare → skeptiker → kortbyggare → grindar, per jobb. Modellanropet injiceras (runModel),
// så att flödet kan testas utan Codex. Fail closed: ett ogiltigt modellsvar ger inget kort.

import { readFileSync } from 'node:fs';
import { validateAgainstSchema } from '../schema-validate.mjs';
import { evaluateCard } from '../gates.mjs';
import { buildCard } from './card-builder.mjs';
import { buildJudgePrompt, buildSkepticPrompt } from './prompt.mjs';
import { isTransient } from './codex.mjs';

const JUDGE_SCHEMA = JSON.parse(readFileSync(new URL('../../../../schemas/judge-output.v1.schema.json', import.meta.url), 'utf8'));
const SKEPTIC_SCHEMA = JSON.parse(readFileSync(new URL('../../../../schemas/skeptic-output.v1.schema.json', import.meta.url), 'utf8'));

function checked(answer, schema, label) {
  const { valid, errors } = validateAgainstSchema(answer, schema);
  if (!valid) throw new Error(`${label} följde inte schemat: ${errors.slice(0, 3).join('; ')}`);
  return answer;
}

export async function judgeJob({ job, inventory, catalog, decisions = [], budget, runModel, now = new Date(), maxObservationChars }) {
  const base = { key: job.key, observation_ids: job.all_observation_ids };
  try {
    const draft = checked(
      await runModel('judge', buildJudgePrompt({ job, inventory, catalog, maxObservationChars })),
      JUDGE_SCHEMA,
      'domarens svar'
    );
    if (draft.decision === 'NONE') {
      // Saker som stått stilla ska inte försvinna bara för att de inte blir ett eget kort:
      // de sparas till fredagssammanfattningen (DIGEST) med domarens sammanfattning.
      const status = job.key.startsWith('stalled_log:') ? 'DIGEST' : 'DISMISSED';
      return { ...base, status, reason: draft.decision_reason, card: null, evaluation: null };
    }

    const skeptic = checked(
      await runModel('skeptic', buildSkepticPrompt({ job, draft, inventory, maxObservationChars })),
      SKEPTIC_SCHEMA,
      'skeptikerns svar'
    );
    const card = buildCard({ job, draft, skeptic, now });
    if (!card) return { ...base, status: 'DISMISSED', reason: 'domaren gav inget fullständigt kort', card: null, evaluation: null };

    const evaluation = evaluateCard(card, { inventory, decisions, budget, now });
    return { ...base, status: 'JUDGED', reason: skeptic.reason, card, evaluation };
  } catch (error) {
    // Tillfälliga fel (kapacitet, timeout) skickas inte tillbaka: observationerna står kvar som NEW.
    const status = isTransient(error) ? 'RETRY' : 'FAILED';
    return { ...base, status, reason: String(error?.message || error).slice(0, 300), card: null, evaluation: null };
  }
}

// Formen som R2 – Judge Queue (action complete) tar emot.
export function toQueueResult(result, judgeModel) {
  const card = result.card && result.evaluation
    ? {
      card_id: result.card.card_id,
      dedupe_key: result.card.dedupe_key,
      area: result.card.area,
      type: result.card.type,
      title: result.card.title,
      publishable: result.evaluation.publishable,
      unverified: result.evaluation.unverified,
      rank_score: result.evaluation.rank_score,
      gates_json: JSON.stringify(result.evaluation.gates),
      card_json: JSON.stringify(result.card),
      judge_model: judgeModel || ''
    }
    : null;
  return { observation_ids: result.observation_ids, status: result.status, card };
}

export { JUDGE_SCHEMA, SKEPTIC_SCHEMA };
