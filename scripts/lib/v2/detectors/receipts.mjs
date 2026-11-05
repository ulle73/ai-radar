// Kvitton (harness-designen C7, etapp 2). Kärnskills ber agenten på claude.ai och ChatGPT att anropa
// n8n-verktyget gk_kvitto(yta, skill, uppgiftstyp). Kvittona är ett mått på efterlevnad, inte belägg för
// misstag 2: saknas de är det ett problem med instrumentet (C7). Flödet R2 – Probes och kvitton dedupliceras
// per session och dygn och tar emot högst 60 per timme och yta; här räknas de per yta och dag.

import { WEB_SURFACES } from './probes.mjs';

export function parseReceiptRow(row) {
  let data = row?.data;
  if (!data && typeof row?.data_json === 'string') {
    try { data = JSON.parse(row.data_json); } catch { data = null; }
  }
  if (!data || !WEB_SURFACES.includes(data.yta) || !data.skill) return null;
  return { yta: data.yta, skill: data.skill, uppgiftstyp: data.uppgiftstyp || '', session_hash: data.session_hash || '', day: data.day || String(row.observed_at || '').slice(0, 10) };
}

// Antal kvitton per yta och dag, en gång per session och skill och dag (samma regel som flödet).
export function summarizeReceipts(rows) {
  const seen = new Set();
  const days = {};
  for (const receipt of rows.map(parseReceiptRow).filter(Boolean)) {
    const key = `${receipt.day}|${receipt.yta}|${receipt.session_hash}|${receipt.skill}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const day = days[receipt.day] || (days[receipt.day] = {});
    const entry = day[receipt.yta] || (day[receipt.yta] = { receipts: 0, skills: {} });
    entry.receipts += 1;
    entry.skills[receipt.skill] = (entry.skills[receipt.skill] || 0) + 1;
  }
  return days;
}

// T17: minst 1 kvitto per dag i 3 dagar från claude.ai och ChatGPT. Returnerar dagar som saknar kvitton per yta.
export function receiptCoverage(summary, dayList) {
  const missing = {};
  for (const yta of WEB_SURFACES) {
    missing[yta] = dayList.filter((day) => !(summary[day]?.[yta]?.receipts > 0));
  }
  return { ok: WEB_SURFACES.every((yta) => missing[yta].length === 0), missing };
}
