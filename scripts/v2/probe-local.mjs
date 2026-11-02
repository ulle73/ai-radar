// probe-cc: kör proberna P2 och P3 i Claude Code med Jonas vanliga konfiguration och bedömer svaren lokalt
// (harness-designen C7, etapp 1a). Nattfasen anropar samma funktioner efter varje publicering.
//
//   node scripts/v2/probe-local.mjs [--version 1.0.4]
//
// Utan --version jämförs P2 med versionen i ~/gk-engine/trusted (origin/main). Skriver bara resultatet,
// aldrig något till n8n. Avslutas med kod 1 om någon probe underkänns.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { enginePaths, resolveClaude } from '../lib/v2/judge/claude.mjs';
import { judgeP2, judgeP3, parseFacitPatterns, PROBES, runLocalProbe } from '../lib/v2/harness/monitor.mjs';

const engine = enginePaths();
const index = process.argv.indexOf('--version');
const version = index >= 0 ? process.argv[index + 1]
  : JSON.parse(readFileSync(path.join(engine.trusted, 'plugins', 'gk-karna', '.claude-plugin', 'plugin.json'), 'utf8')).version;
const facit = parseFacitPatterns(readFileSync(path.join(engine.trusted, 'evals', 'gk-karna', 'p3-facit.md'), 'utf8'));
const claude = resolveClaude();

const results = [];
const p2 = await runLocalProbe({ question: PROBES.P2, claude });
results.push(p2.ok ? judgeP2(p2.answer, version) : { probe: 'P2', pass: false, reason: 'proben kunde inte köras' });
const p3 = await runLocalProbe({ question: PROBES.P3, claude });
results.push(p3.ok ? judgeP3(p3.answer, facit) : { probe: 'P3', pass: false, reason: 'proben kunde inte köras' });

for (const result of results) console.log(`${result.probe}: ${result.pass ? 'godkänd' : 'UNDERKÄND'} – ${result.reason}`);
process.exitCode = results.every((result) => result.pass) ? 0 : 1;
