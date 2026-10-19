// Försäljning & siffror: rullande 7 dagar mot samma dagar förra året (GK_DAILY_ORDER_REPORTS).
// Daglig volym är för liten för dagsjämförelser (2–20 order/dag svänger −60 % till +600 %), därför fönster.
// Bara nedgång kan bli larm; en stor uppgång blir en vanlig observation ("vad driver detta?").

import { makeObservation } from '../observation.mjs';

const DAY_MS = 86400000;

const DEFAULTS = Object.freeze({
  windowDays: 7,
  minLastYearWindowSek: 20000,
  alertDropPct: -30,
  notablePct: 50,
  consecutiveWindows: 2
});

function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function isoWeek(dateKey) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - yearStart) / DAY_MS + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function windowStats(byDate, endDate, windowDays) {
  let current = 0;
  let lastYear = 0;
  for (let i = 0; i < windowDays; i += 1) {
    const key = dayKey(Date.parse(`${endDate}T00:00:00Z`) - i * DAY_MS);
    const row = byDate.get(key);
    if (!row) return null;
    current += Number(row.order_total) || 0;
    lastYear += Number(row.last_year_total) || 0;
  }
  return { endDate, current, lastYear, pct: lastYear > 0 ? ((current - lastYear) / lastYear) * 100 : null };
}

export function detectSalesTrend({ rows, now = new Date(), options = {} }) {
  const settings = { ...DEFAULTS, ...options };
  const byDate = new Map(rows.map((row) => [row.report_date, row]));
  const dates = [...byDate.keys()].sort();
  if (!dates.length) return [];

  const windows = [];
  for (let i = 0; i < settings.consecutiveWindows; i += 1) {
    const endDate = dayKey(Date.parse(`${dates.at(-1)}T00:00:00Z`) - i * DAY_MS);
    const stats = windowStats(byDate, endDate, settings.windowDays);
    if (!stats || stats.pct === null || stats.lastYear < settings.minLastYearWindowSek) return [];
    windows.push(stats);
  }

  const latest = windows[0];
  const describe = (stats) =>
    `${settings.windowDays} dagar t.o.m. ${stats.endDate}: ${Math.round(stats.current)} kr mot ${Math.round(stats.lastYear)} kr förra året (${stats.pct >= 0 ? '+' : ''}${stats.pct.toFixed(0)} %)`;
  const anchors = [{ kind: 'metric', ref: 'GK_DAILY_ORDER_REPORTS.order_total' }];
  const base = {
    detector: 'sales_trend',
    area: 'sales',
    observed_at: now,
    source: 'n8n GK_DAILY_ORDER_REPORTS',
    source_kind: 'data',
    anchors,
    data: { windows }
  };

  if (windows.every((stats) => stats.pct <= settings.alertDropPct)) {
    return [makeObservation({
      ...base,
      dedupe_key: `sales_drop:${latest.endDate}`,
      value: `Försäljningen ligger under förra året ${settings.consecutiveWindows} fönster i rad. ${describe(latest)}`,
      alert_trigger: 'sales_deviation'
    })];
  }

  if (windows.every((stats) => Math.abs(stats.pct) >= settings.notablePct && Math.sign(stats.pct) === Math.sign(latest.pct))) {
    return [makeObservation({
      ...base,
      dedupe_key: `sales_trend:${latest.pct > 0 ? 'up' : 'down'}:${isoWeek(latest.endDate)}`,
      value: `Tydlig avvikelse mot förra året. ${describe(latest)}`
    })];
  }

  return [];
}
