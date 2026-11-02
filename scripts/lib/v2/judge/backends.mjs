// Val av modellbackend, nattfönster och tak per natt för domaren (harness-designen C0 och C2).
// Ren logik utan I/O, så att den kan testas; scripts/v2/judge.mjs sköter filer och processer.

const HOUR_MS = 3600000;

function minutesOf(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  if (!Number.isInteger(h) || !Number.isInteger(m)) throw new Error(`ogiltig tid: ${hhmm}`);
  return h * 60 + m;
}

// Fönstret kan gå över midnatt (23:30–05:00). Lokal tid (datorns tidszon, Europe/Stockholm).
export function inNightWindow(now = new Date(), window = { start: '23:30', end: '05:00' }) {
  const date = new Date(now);
  const minute = date.getHours() * 60 + date.getMinutes();
  const start = minutesOf(window.start);
  const end = minutesOf(window.end);
  return start <= end ? minute >= start && minute < end : minute >= start || minute < end;
}

// Nattens nyckel är datumet då natten började (före kl. 12 räknas till föregående dag).
export function nightKey(now = new Date()) {
  const date = new Date(now);
  if (date.getHours() < 12) date.setDate(date.getDate() - 1);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Hur många jobb som får köras i denna körning, givet taket per natt.
export function jobsAllowed({ state = {}, now = new Date(), maxPerRun, maxPerNight }) {
  const key = nightKey(now);
  const used = state.night === key ? Number(state.jobs) || 0 : 0;
  return { night: key, used, allowed: Math.max(0, Math.min(maxPerRun, maxPerNight - used)) };
}

export function recordJobs(state = {}, { night, count }) {
  const used = state.night === night ? Number(state.jobs) || 0 : 0;
  return { ...state, night, jobs: used + count };
}

// En backend som fått kvotfel vilar quotaRetryHours (Codex utan krediter provas igen en gång per dygn).
export function availableBackends({ order, state = {}, now = new Date(), quotaRetryHours = 24 }) {
  const nowMs = new Date(now).getTime();
  return order.filter((name) => {
    const at = Date.parse(state.backends?.[name]?.quota_at || '');
    return !Number.isFinite(at) || nowMs - at >= quotaRetryHours * HOUR_MS;
  });
}

export function markQuota(state = {}, backend, now = new Date(), reason = '') {
  return {
    ...state,
    backends: { ...(state.backends || {}), [backend]: { quota_at: new Date(now).toISOString(), reason: String(reason).slice(0, 200) } }
  };
}

export function clearQuota(state = {}, backend) {
  if (!state.backends?.[backend]) return state;
  const backends = { ...state.backends };
  delete backends[backend];
  return { ...state, backends };
}
