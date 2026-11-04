// Lokala prober (harness-designen C7).
//
//   node scripts/v2/probe-local.mjs [--version 1.0.4]                    # etapp 1a: P2 och P3 i Claude Code, bedöms här
//   node scripts/v2/probe-local.mjs --daily [--send] [--once-per-day]     # etapp 2: P1–P3 i Claude Code och Codex
//
// Utan --daily jämförs P2 med versionen i ~/gk-engine/trusted (origin/main) och resultatet skrivs bara ut.
// Med --daily ställs alla tre frågorna i Claude Code (probe-cc, Jonas konfiguration) och i Codex (codex exec
// --ephemeral). --send skickar svaren till R2 – Probes (action answer); bedömningen görs sedan av
// scripts/v2/probes.mjs, som för webbytorna. --once-per-day hoppar över om dagens körning redan är gjord.

import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { enginePaths, resolveClaude } from '../lib/v2/judge/claude.mjs';
import { resolveCodex } from '../lib/v2/judge/codex.mjs';
import { judgeP2, judgeP3, parseFacitPatterns, PROBES, runCodexProbe, runLocalProbe } from '../lib/v2/harness/monitor.mjs';
import { stockholmDay } from '../lib/v2/detectors/probes.mjs';
import { loadSecrets, postSigned } from '../lib/v2/n8n-client.mjs';

const engine = enginePaths();
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : null; };
const config = (() => { try { return JSON.parse(readFileSync(new URL('../../config/v2/judge.json', import.meta.url), 'utf8')); } catch { return {}; } })();
const claude = resolveClaude(config.claude_paths || []);

if (args.includes('--daily')) {
  const stamp = path.join(engine.state, 'probes-daily.json');
  const today = stockholmDay(new Date());
  if (args.includes('--once-per-day')) {
    let last = null;
    try { last = JSON.parse(readFileSync(stamp, 'utf8')).day; } catch { last = null; }
    if (last === today) {
      console.log(`dagens prober är redan körda (${today})`);
      process.exit(0);
    }
  }
  const codex = resolveCodex(config.codex_paths || []);
  const surfaces = [
    { yta: 'claude_code', ask: (question) => runLocalProbe({ question, claude }) },
    { yta: 'codex', ask: (question) => runCodexProbe({ question, codex }) }
  ];
  const secrets = args.includes('--send') ? loadSecrets() : null;
  let failures = 0;
  for (const surface of surfaces) {
    for (const probe of ['P1', 'P2', 'P3']) {
      const askedAt = new Date().toISOString();
      let result;
      try { result = await surface.ask(PROBES[probe]); } catch (error) { result = { ok: false, answer: '', error: error.message }; }
      if (!result.ok) {
        failures += 1;
        console.log(`${surface.yta} ${probe}: proben kunde inte köras${result.error ? ` – ${String(result.error).slice(0, 120)}` : ''}`);
        continue;
      }
      if (!secrets) {
        console.log(`${surface.yta} ${probe}: svar mottaget (${result.answer.length} tecken), skickas inte utan --send`);
        continue;
      }
      const sent = await postSigned({ ...secrets, path: 'r2-probes', payload: { action: 'answer', yta: surface.yta, probe, asked_at: askedAt, answer: result.answer }, timeoutMs: 60000 });
      console.log(`${surface.yta} ${probe}: skickat (${sent.status}${sent.body?.counted === false ? ', räknas inte' : ''})`);
      if (sent.status !== 200) failures += 1;
    }
  }
  if (secrets) {
    await mkdir(engine.state, { recursive: true });
    await writeFile(stamp, JSON.stringify({ day: today, at: new Date().toISOString(), failures }));
  }
  process.exitCode = failures ? 1 : 0;
} else {
  const version = option('version')
    || JSON.parse(readFileSync(path.join(engine.trusted, 'plugins', 'gk-karna', '.claude-plugin', 'plugin.json'), 'utf8')).version;
  const facit = parseFacitPatterns(readFileSync(path.join(engine.trusted, 'evals', 'gk-karna', 'p3-facit.md'), 'utf8'));
  const results = [];
  const p2 = await runLocalProbe({ question: PROBES.P2, claude });
  results.push(p2.ok ? judgeP2(p2.answer, version) : { probe: 'P2', pass: false, reason: 'proben kunde inte köras' });
  const p3 = await runLocalProbe({ question: PROBES.P3, claude });
  results.push(p3.ok ? judgeP3(p3.answer, facit) : { probe: 'P3', pass: false, reason: 'proben kunde inte köras' });
  for (const result of results) console.log(`${result.probe}: ${result.pass ? 'godkänd' : 'UNDERKÄND'} – ${result.reason}`);
  process.exitCode = results.every((result) => result.pass) ? 0 : 1;
}
