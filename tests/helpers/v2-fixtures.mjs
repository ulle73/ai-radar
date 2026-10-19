export const NOW = '2026-10-19T08:00:00Z';

export const BUDGET = Object.freeze({ spent_sek: 40, cap_sek: 250 });

export function inventory() {
  return {
    inventory_version: 1,
    generated_at: '2026-10-19T07:00:00Z',
    skills: [
      { name: 'hyperframes', description: 'Video via HTML-kompositioner.' },
      { name: 'remotion', description: 'Video i React.' },
      { name: 'agent-hub', description: 'Delad miljö för Claude Code och Codex.' }
    ],
    tools: [{ name: 'tool-ffmpeg', aliases: ['ffmpeg'] }],
    mcp: [{ name: 'chrome-devtools' }],
    repos: [
      { name: 'ulle73/content-engine', aliases: ['content-engine'], default_branch: 'main' },
      { name: 'ulle73/golfkuponger-app', aliases: ['golfkuponger-app'], default_branch: 'main', protected_refs: ['redesign/app-v2'] }
    ],
    workflows: [{ id: 'UPLzVDZLFbuIsQcW', name: '43 OPS – Daily Orders Summary' }],
    notion: [{ id: '3fb3774f-b232-81b0-878c-eaa31e91dc00', title: 'Instagram låg organisk respons' }],
    metrics: [{ id: 'GK_DAILY_ORDER_REPORTS.development_pct', aliases: ['friskvårdsförsäljning'] }],
    agents_rules: [{ id: 'AGENTS.md', aliases: ['~/.agents/AGENTS.md'] }],
    shopify_themes: []
  };
}

function base(overrides) {
  return {
    contract_version: 1,
    card_id: 'R2-test-0001',
    area: 'tools_hub',
    type: 'NY',
    title: 'Ny skill för undertexter',
    recommendation: 'Lägg till skillen caption-kit i den delade hubben.',
    because: 'hyperframes saknar ett steg för ordsynkade undertexter, så varje video i content-engine kräver 20 minuters manuellt arbete.',
    analysis_mode: 'model',
    platform_news: false,
    observations: [{
      source: 'github.com/example/caption-kit',
      source_kind: 'repo',
      url: 'https://github.com/example/caption-kit',
      observed_at: '2026-10-18T10:00:00Z',
      value: '+420 stjärnor på 7 dagar, nämnd av IndyDevDan 2026-10-17',
      verified: true
    }],
    anchors: [{ kind: 'skill', ref: 'hyperframes' }, { kind: 'repo', ref: 'ulle73/content-engine' }],
    target: { kind: 'skill', ref: 'caption-kit' },
    replaces: null,
    test: {
      kind: 'smoke',
      task: 'Textsätt en 30 s klipp från content-engine.',
      outcome: 'pass',
      verified: true,
      result: 'Ordsynkade undertexter på 40 s.',
      artifacts: ['karantan/caption-kit/run-1.log']
    },
    security: { static_scan: 'clean', license: 'MIT', clients: ['claude', 'codex'] },
    skeptic: { verdict: 'PASS', reason: 'Ingen befintlig skill gör ordsynk.' },
    rule_text: null,
    action_on_ok: 'Installera via hub.py och kör sync.',
    effort_hours: 0.2,
    monthly_cost_sek: 0,
    risk: 'Låg – textbaserad skill utan skript.',
    measure: null,
    confidence: 0.82,
    dedupe_key: 'skill:caption-kit',
    expires_at: '2026-11-19T08:00:00Z',
    ...overrides
  };
}

export function nyCard(overrides = {}) {
  return base(overrides);
}

export function ersattCard(overrides = {}) {
  return base({
    card_id: 'R2-test-0002',
    type: 'ERSATT',
    title: 'Ersätt remotion med motion-kit',
    recommendation: 'Byt ut remotion mot motion-kit för korta klipp.',
    because: 'motion-kit renderar samma 15 s klipp som remotion på 9 s i stället för 41 s, vilket kortar content-engine-körningen.',
    target: { kind: 'skill', ref: 'motion-kit' },
    replaces: 'remotion',
    anchors: [{ kind: 'skill', ref: 'remotion' }],
    test: {
      kind: 'ab',
      task: 'Rendera samma 15 s klipp.',
      outcome: 'pass',
      verified: true,
      result: 'Ny snabbare, lika bild.',
      artifacts: ['karantan/ab/old.mp4', 'karantan/ab/new.mp4'],
      ab: {
        old_result: '41 s renderingstid',
        new_result: '9 s renderingstid',
        criteria: [{ name: 'tid', winner: 'new' }, { name: 'bildkvalitet', winner: 'tie' }]
      }
    },
    dedupe_key: 'replace:remotion:motion-kit',
    ...overrides
  });
}

export function projektCard(overrides = {}) {
  return base({
    card_id: 'R2-test-0003',
    area: 'social',
    type: 'PROJEKT',
    title: 'Lägg till direkta konkurrenter i följlistan',
    recommendation: 'Lägg till Sweetspot, Cloud Golf, GolfNext och OnTee i content-engines följlista.',
    because: 'content-engine bevakar 0 av 4 verifierade direkta konkurrenter, så kampanjer från Cloud Golf syns aldrig i signalerna.',
    observations: [{
      source: 'Notion Company Knowledge 2026-09-16',
      source_kind: 'data',
      observed_at: '2026-10-19T07:00:00Z',
      value: 'follow-list saknar Sweetspot, Cloud Golf, GolfNext, OnTee',
      verified: true
    }],
    anchors: [{ kind: 'repo', ref: 'content-engine' }],
    target: { kind: 'repo', ref: 'ulle73/content-engine', branch: 'radar/R2-test-0003' },
    test: { kind: 'none', outcome: 'not_run', verified: false },
    security: undefined,
    action_on_ok: 'Branch radar/R2-test-0003 och PR mot content-engine.',
    measure: { metric: 'antal bevakade direkta konkurrenter', baseline: '0', check_after_days: 7 },
    dedupe_key: 'followlist:direct-competitors',
    ...overrides
  });
}

export function anvandCard(overrides = {}) {
  return base({
    card_id: 'R2-test-0004',
    area: 'tools_hub',
    type: 'ANVAND',
    title: 'Kör sync efter varje skill-ändring',
    recommendation: 'Lägg en regel i AGENTS.md om att alltid köra hub sync direkt.',
    because: 'agent-hub synkar bara var 10:e minut, och 3 sessioner senaste veckan använde en gammal skill-version.',
    platform_news: false,
    anchors: [{ kind: 'skill', ref: 'agent-hub' }],
    target: { kind: 'agents_rule', ref: 'AGENTS.md' },
    test: { kind: 'none', outcome: 'not_run', verified: false },
    security: undefined,
    rule_text: 'Kör `hub.py sync` direkt efter varje ändring i ~/.agents/skills.',
    dedupe_key: 'rule:sync-after-skill-edit',
    ...overrides
  });
}

export function larmCard(overrides = {}) {
  return base({
    card_id: 'R2-test-0005',
    area: 'sales',
    type: 'LARM',
    title: 'Friskvårdsförsäljningen ligger 45 % under fjolåret',
    recommendation: 'Granska kanalerna Benifex och Epassi i dag.',
    because: 'GK_DAILY_ORDER_REPORTS.development_pct har legat på −45 % två dagar i rad, mot normalt ±10 %.',
    observations: [{
      source: 'n8n GK_DAILY_ORDER_REPORTS',
      source_kind: 'data',
      observed_at: '2026-10-19T06:00:00Z',
      value: 'development_pct −45 (2026-10-17), −47 (2026-10-18)',
      verified: true
    }],
    anchors: [{ kind: 'metric', ref: 'GK_DAILY_ORDER_REPORTS.development_pct' }],
    target: { kind: 'metric', ref: 'GK_DAILY_ORDER_REPORTS.development_pct' },
    test: { kind: 'none', outcome: 'not_run', verified: false },
    security: undefined,
    urgency: { trigger: 'sales_deviation', reason: 'Två dagar i rad under tröskeln.', expires_at: '2026-10-20T08:00:00Z' },
    dedupe_key: 'alert:sales:2026-10-18',
    ...overrides
  });
}

// Tar bort fält som satts till undefined, så att korten liknar riktig JSON.
export function json(card) {
  return JSON.parse(JSON.stringify(card));
}
