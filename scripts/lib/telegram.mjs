function text(value, maxLength = 600) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeError(error, token) {
  const message = String(error?.message || error || 'Unknown Telegram error');
  return token ? message.replaceAll(token, '***') : message;
}

export function notificationId(item) {
  if (String(item?.notification_id || '').trim()) return String(item.notification_id).trim();
  return [
    String(item?.repo || '').trim().toLowerCase(),
    String(item?.kind || 'new_repo').trim().toLowerCase(),
    String(item?.created_at || '').trim(),
    Number(item?.score || 0)
  ].join(':');
}

export function formatTelegramMessage(item) {
  const repo = escapeHtml(text(item?.repo, 120));
  const url = escapeHtml(text(item?.url, 500));
  const summary = escapeHtml(text(item?.summary_sv, 500));
  const project = escapeHtml(text(item?.project, 160));
  const reason = escapeHtml(text(item?.fit_reason, 500));
  const useCase = escapeHtml(text(item?.concrete_use_case, 600));
  const differentiator = escapeHtml(text(item?.differentiator, 450));
  const nextStep = escapeHtml(text(item?.next_step, 550));
  const evidence = escapeHtml(text(Array.isArray(item?.evidence) ? item.evidence[0] : '', 450));
  const score = Number(item?.score || 0);
  const confidence = Math.round(Number(item?.confidence || 0) * 100);

  const lines = [
    '🚨 <b>Nytt repo upptäckt</b>',
    '',
    url ? `<b>Repo:</b> <a href="${url}">${repo}</a>` : `<b>Repo:</b> ${repo}`,
    summary ? `<b>Vad det gör:</b> ${summary}` : '',
    project ? `<b>Passar:</b> ${project}` : '',
    reason ? `<b>Varför:</b> ${reason}` : '',
    useCase ? `<b>Konkret användning:</b> ${useCase}` : '',
    differentiator ? `<b>Unik fördel:</b> ${differentiator}` : '',
    nextStep ? `<b>Nästa steg:</b> ${nextStep}` : '',
    evidence ? `<b>Evidens:</b> ${evidence}` : '',
    `<b>Bedömning:</b> ${score}/100 · ${confidence}% säkerhet · Testa nu`
  ];

  return lines.filter(Boolean).join('\n').slice(0, 4000);
}

async function sendMessage({ token, chatId, message, fetchImpl }) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const raw = await response.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
    if (!response.ok || payload?.ok !== true) {
      const description = payload?.description || `Telegram API returned HTTP ${response.status}`;
      throw new Error(description);
    }
    return Number(payload?.result?.message_id || 0);
  } catch (error) {
    throw new Error(sanitizeError(error, token));
  }
}

export async function deliverPendingNotifications({
  pending = [],
  sentHistory = [],
  token = '',
  chatId = '',
  fetchImpl = globalThis.fetch,
  now = new Date()
} = {}) {
  const queue = Array.isArray(pending) ? pending : [];
  const history = Array.isArray(sentHistory) ? [...sentHistory] : [];
  const configured = Boolean(String(token).trim() && String(chatId).trim());
  const status = {
    generated_at: now.toISOString(),
    status: 'idle',
    configured,
    pending_before: queue.length,
    attempted: 0,
    sent: 0,
    failed: 0,
    deduplicated: 0,
    pending_after: queue.length
  };

  if (!queue.length) {
    return { pending: [], sentHistory: history, status, failures: [] };
  }

  if (!configured) {
    status.status = 'failed';
    status.failed = queue.length;
    return {
      pending: queue,
      sentHistory: history,
      status,
      failures: [{ error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing' }]
    };
  }

  const sentIds = new Set(history.map((entry) => String(entry?.notification_id || '')).filter(Boolean));
  const remaining = [];
  const failures = [];

  for (const item of queue) {
    const id = notificationId(item);
    if (sentIds.has(id)) {
      status.deduplicated += 1;
      continue;
    }

    status.attempted += 1;
    try {
      const telegramMessageId = await sendMessage({
        token,
        chatId,
        message: formatTelegramMessage(item),
        fetchImpl
      });
      history.push({
        notification_id: id,
        repo: item.repo,
        score: Number(item.score || 0),
        sent_at: now.toISOString(),
        telegram_message_id: telegramMessageId
      });
      sentIds.add(id);
      status.sent += 1;
    } catch (error) {
      remaining.push(item);
      status.failed += 1;
      failures.push({
        notification_id: id,
        repo: item.repo,
        error: sanitizeError(error, token)
      });
    }
  }

  status.pending_after = remaining.length;
  status.status = status.failed
    ? status.sent > 0 || status.deduplicated > 0
      ? 'degraded'
      : 'failed'
    : 'healthy';

  return { pending: remaining, sentHistory: history, status, failures };
}

export async function sendSmokeTest({
  token = '',
  chatId = '',
  fetchImpl = globalThis.fetch,
  now = new Date()
} = {}) {
  if (!String(token).trim() || !String(chatId).trim()) {
    return { status: 'failed', generated_at: now.toISOString(), error: 'Telegram configuration is missing' };
  }
  try {
    const telegramMessageId = await sendMessage({
      token,
      chatId,
      fetchImpl,
      message: '✅ <b>AI Radar Telegram är ansluten</b>\n\nBot-token och chat-ID fungerar. Framtida exceptionella repo-fynd kan nu skickas hit.'
    });
    return { status: 'healthy', generated_at: now.toISOString(), telegram_message_id: telegramMessageId };
  } catch (error) {
    return { status: 'failed', generated_at: now.toISOString(), error: sanitizeError(error, token) };
  }
}
