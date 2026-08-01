import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deliverPendingNotifications, sendSmokeTest } from './lib/telegram.mjs';

async function readJson(root, relativePath, fallback) {
  try {
    const value = await readFile(path.join(root, relativePath), 'utf8');
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function writeJson(root, relativePath, value) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function enabled(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

export async function runTelegramDelivery({
  root = process.cwd(),
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = new Date()
} = {}) {
  const token = env.TELEGRAM_BOT_TOKEN || '';
  const chatId = env.TELEGRAM_CHAT_ID || '';
  const pending = await readJson(root, 'notifications/pending.json', []);
  const sentHistory = await readJson(root, 'notifications/sent.json', []);

  const smokeTest = enabled(env.TELEGRAM_SMOKE_TEST)
    ? await sendSmokeTest({ token, chatId, fetchImpl, now })
    : null;

  const delivery = await deliverPendingNotifications({
    pending,
    sentHistory,
    token,
    chatId,
    fetchImpl,
    now
  });

  const smokeFailed = smokeTest?.status === 'failed';
  const deliveryFailed = ['failed', 'degraded'].includes(delivery.status.status);
  const overallStatus = smokeFailed || deliveryFailed
    ? delivery.status.sent > 0 || smokeTest?.status === 'healthy'
      ? 'degraded'
      : 'failed'
    : smokeTest?.status === 'healthy' || delivery.status.status === 'healthy'
      ? 'healthy'
      : 'idle';

  const status = {
    generated_at: now.toISOString(),
    status: overallStatus,
    configured: Boolean(String(token).trim() && String(chatId).trim()),
    smoke_test: smokeTest,
    delivery: delivery.status,
    failures: delivery.failures
  };

  await writeJson(root, 'notifications/pending.json', delivery.pending);
  await writeJson(root, 'notifications/sent.json', delivery.sentHistory.slice(-1000));
  await writeJson(root, 'status/telegram.json', status);

  return { status, pending: delivery.pending, sentHistory: delivery.sentHistory };
}

const executedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) {
  runTelegramDelivery().then(({ status }) => {
    console.log(`Telegram delivery: ${status.status}; sent=${status.delivery.sent}; failed=${status.delivery.failed}; pending=${status.delivery.pending_after}.`);
    if (['failed', 'degraded'].includes(status.status)) process.exitCode = 1;
  }).catch((error) => {
    console.error(`Telegram delivery failed: ${error.message}`);
    process.exitCode = 1;
  });
}
