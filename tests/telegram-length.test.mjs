import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTelegramMessage } from '../scripts/lib/telegram.mjs';

test('long Telegram messages use a complete compact fallback instead of cutting HTML', () => {
  const noisy = '<&>\"\''.repeat(3000);
  const message = formatTelegramMessage({
    repo: `acme/${noisy}`,
    url: `https://github.com/acme/tool?value=${noisy}`,
    score: 92,
    confidence: 0.91,
    summary_sv: noisy,
    project: noisy,
    fit_reason: noisy,
    concrete_use_case: noisy,
    differentiator: noisy,
    next_step: noisy,
    evidence: [noisy]
  });

  assert.ok(message.length <= 4000);
  assert.match(message, /Testa nu$/);
  assert.doesNotMatch(message, /&(?:a|am|amp|l|lt|g|gt|q|quo|quot|#|#3|#39)?$/);
});
