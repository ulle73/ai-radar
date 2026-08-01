import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deliverPendingNotifications,
  formatTelegramMessage,
  notificationId,
  sendSmokeTest
} from '../scripts/lib/telegram.mjs';

function item(overrides = {}) {
  return {
    repo: 'acme/product-video',
    url: 'https://github.com/acme/product-video',
    score: 92,
    confidence: 0.91,
    action: 'Testa nu',
    quality_tier: 'exceptional',
    summary_sv: 'Skapar produktvideor från bilder.',
    project: 'FAIV',
    fit_reason: 'Kan automatisera kampanjmaterial.',
    concrete_use_case: 'Generera fem kampanjvideor från befintliga produktbilder.',
    next_step: 'Testa fem bilder och jämför kvalitet samt tidsåtgång.',
    differentiator: 'Kör lokalt och har ett färdigt bild-till-video-flöde.',
    evidence: ['README visar ett komplett bild-till-video-exempel.'],
    created_at: '2026-08-02',
    kind: 'new_repo',
    ...overrides
  };
}

function telegramResponse({ ok = true, status = 200, messageId = 123, description = 'error' } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(ok
        ? { ok: true, result: { message_id: messageId } }
        : { ok: false, description });
    }
  };
}

test('notification IDs are deterministic and distinguish score-change events', () => {
  assert.equal(notificationId(item()), 'acme/product-video:new_repo:2026-08-02:92');
  assert.notEqual(notificationId(item()), notificationId(item({ kind: 'score_increase' })));
});

test('Telegram message escapes dynamic HTML and contains the practical decision fields', () => {
  const message = formatTelegramMessage(item({
    project: 'FAIV <kampanj>',
    summary_sv: 'Använd <script> & bilder.'
  }));
  assert.match(message, /FAIV &lt;kampanj&gt;/);
  assert.match(message, /Använd &lt;script&gt; &amp; bilder/);
  assert.doesNotMatch(message, /<script>/);
  assert.match(message, /Nästa steg/);
  assert.match(message, /92\/100/);
});

test('successful deliveries leave pending and enter sent history once', async () => {
  const calls = [];
  const result = await deliverPendingNotifications({
    pending: [item()],
    sentHistory: [],
    token: 'secret-token',
    chatId: '1437275871',
    now: new Date('2026-08-02T00:00:00Z'),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return telegramResponse({ messageId: 777 });
    }
  });

  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /^https:\/\/api\.telegram\.org\/botsecret-token\/sendMessage$/);
  assert.equal(result.status.status, 'healthy');
  assert.deepEqual(result.pending, []);
  assert.equal(result.sentHistory.length, 1);
  assert.equal(result.sentHistory[0].telegram_message_id, 777);
  assert.equal(result.sentHistory[0].notification_id, notificationId(item()));
});

test('already sent notification IDs are removed from pending without another API call', async () => {
  let calls = 0;
  const notification = item();
  const result = await deliverPendingNotifications({
    pending: [notification],
    sentHistory: [{ notification_id: notificationId(notification), sent_at: '2026-08-01T00:00:00Z' }],
    token: 'secret-token',
    chatId: '1437275871',
    fetchImpl: async () => {
      calls += 1;
      return telegramResponse();
    }
  });

  assert.equal(calls, 0);
  assert.deepEqual(result.pending, []);
  assert.equal(result.status.deduplicated, 1);
});

test('failed deliveries remain pending while successful deliveries are archived', async () => {
  const first = item({ repo: 'acme/first', url: 'https://github.com/acme/first' });
  const second = item({ repo: 'acme/second', url: 'https://github.com/acme/second' });
  let calls = 0;
  const result = await deliverPendingNotifications({
    pending: [first, second],
    sentHistory: [],
    token: 'secret-token',
    chatId: '1437275871',
    now: new Date('2026-08-02T00:00:00Z'),
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? telegramResponse({ messageId: 101 })
        : telegramResponse({ ok: false, status: 429, description: 'Too Many Requests' });
    }
  });

  assert.equal(result.status.status, 'degraded');
  assert.equal(result.status.sent, 1);
  assert.equal(result.status.failed, 1);
  assert.deepEqual(result.pending.map((entry) => entry.repo), ['acme/second']);
  assert.equal(result.sentHistory.length, 1);
  assert.match(result.failures[0].error, /Too Many Requests/);
  assert.doesNotMatch(result.failures[0].error, /secret-token/);
});

test('missing configuration preserves queue and reports failure without API calls', async () => {
  let calls = 0;
  const result = await deliverPendingNotifications({
    pending: [item()],
    sentHistory: [],
    token: '',
    chatId: '',
    fetchImpl: async () => {
      calls += 1;
      return telegramResponse();
    }
  });

  assert.equal(calls, 0);
  assert.equal(result.status.status, 'failed');
  assert.equal(result.status.configured, false);
  assert.equal(result.pending.length, 1);
});

test('empty queues are idle and do not require Telegram configuration', async () => {
  const result = await deliverPendingNotifications({ pending: [], sentHistory: [], token: '', chatId: '' });
  assert.equal(result.status.status, 'idle');
  assert.equal(result.status.pending_before, 0);
});

test('smoke test sends a standalone connection message', async () => {
  let request;
  const result = await sendSmokeTest({
    token: 'secret-token',
    chatId: '1437275871',
    now: new Date('2026-08-02T00:00:00Z'),
    fetchImpl: async (url, options) => {
      request = { url, options };
      return telegramResponse({ messageId: 999 });
    }
  });

  const body = JSON.parse(request.options.body);
  assert.match(body.text, /AI Radar Telegram är ansluten/);
  assert.equal(result.status, 'healthy');
  assert.equal(result.telegram_message_id, 999);
});
