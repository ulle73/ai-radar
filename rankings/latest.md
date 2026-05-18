# AI Radar Totalranking – 2026-05-18

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-18
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Missing ## Totalranking section; Missing ranking table header; Expected 30 ranking rows, got 0; Missing repo from ranking: hkuds/cli-anything; Missing repo from ranking: tinyhumansai/openhuman; Missing repo from ranking: k-dense-ai/scientific-agent-skills; Missing repo from ranking: bigbodycobain/shadowbroker; Missing repo from ranking: nirdiamant/agents-towards-production

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A set of ready to use Agent Skills for research, science, engineering, analysis, finance and writing. |
| 2 | 940 | [BigBodyCobain/Shadowbroker](https://github.com/BigBodyCobain/Shadowbroker) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open-source intelligence for the global theater. Track everything from the corporate/private jets of the wealthy, and spy satellites, to seismic events in one unified interface. Hook an AI agent up to have it parse through data and find previously unseen correlations. The knowledge is available to all but rarely aggregated in the open, until now. |
| 3 | 940 | [NirDiamant/agents-towards-production](https://github.com/NirDiamant/agents-towards-production) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — End-to-end, code-first tutorials for building production-grade GenAI agents. From prototype to enterprise deployment. |
| 4 | 940 | [anthropics/financial-services](https://github.com/anthropics/financial-services) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Topics: - |
| 5 | 940 | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Academic Research Skills for Claude Code: research → write → review → revise → finalize |
| 6 | 900.6 | [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open-source alternative to AI video platforms — Free AI image & video generation studio with 200+ models (Flux, Midjourney, Kling, Sora, Veo). No content filters. Self-hosted, MIT licensed. |
| 7 | 880.1 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 8 | 874.1 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 9 | 846.9 | [calcom/cal.diy](https://github.com/calcom/cal.diy) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Scheduling infrastructure for absolutely everyone. |
| 10 | 817.8 | [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — "CLI-Anything: Making ALL Software Agent-Native" -- CLI-Hub: https://clianything.cc/ |
| 11 | 805.7 | [dograh-hq/dograh](https://github.com/dograh-hq/dograh) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open Source Voice Agent Platform |
| 12 | 783.5 | [oven-sh/bun](https://github.com/oven-sh/bun) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one |
| 13 | 771.5 | [bytedance/UI-TARS-desktop](https://github.com/bytedance/UI-TARS-desktop) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The Open-Source Multimodal AI Agent Stack: Connecting Cutting-Edge AI Models and Agent Infra |
| 14 | 760 | [nexu-io/open-design](https://github.com/nexu-io/open-design) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — 🎨 Local-first, open-source alternative to Anthropic's Claude Design. ⚡ 19 Skills · ✨ 71 brand-grade Design Systems 🖼 Generate web · desktop · mobile prototypes · slides · images · videos · HyperFrames 📦 Sandboxed preview · HTML/PDF/PPTX/MP4 export 🤖 Runs on Claude Code / Codex / Cursor / Gemini / OpenCode / Qwen / Copilot / Hermes / Kimi CLI. |
| 15 | 760 | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 16 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 17 | 748.9 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 18 | 725.9 | [tech-leads-club/agent-skills](https://github.com/tech-leads-club/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The secure, validated skill registry for professional AI coding agents. Extend Antigravity, Claude Code, Cursor, Copilot and more with absolute confidence. |
| 19 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 20 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 21 | 677.3 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .claude directory. |
| 22 | 640.8 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 23 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 24 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 25 | 584.4 | [yikart/AiToEarn](https://github.com/yikart/AiToEarn) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Let's use AI to Earn! |
| 26 | 469.5 | [yetone/native-feel-skill](https://github.com/yetone/native-feel-skill) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — An Agent Skill for designing cross-platform desktop apps that feel native — distilled from Raycast's 2.0 deep-dive and reverse engineering of Raycast Beta.app. Eight architectural tenets, four-layer architecture, WebKit/WebView2 survival guide, 75-item ship audit. |
| 27 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 28 | 429.6 | [vercel-labs/zero](https://github.com/vercel-labs/zero) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The programming language for agents |
| 29 | 174.5 | [apernet/hysteria](https://github.com/apernet/hysteria) | Web / e-commerce / FAIV | Documents / wedding planner | Ignorera | TRUE_TRENDING_WEEKLY — Hysteria is a powerful, lightning fast and censorship resistant proxy. |
| 30 | 63.1 | [Nightmare-Eclipse/YellowKey](https://github.com/Nightmare-Eclipse/YellowKey) | AI agent / workflow | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — YellowKey Bitlocker Bypass Vulnerability |

## Toppkandidater att agera på

- [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) — 940: AI agent / workflow
- [BigBodyCobain/Shadowbroker](https://github.com/BigBodyCobain/Shadowbroker) — 940: AI agent / workflow
- [NirDiamant/agents-towards-production](https://github.com/NirDiamant/agents-towards-production) — 940: AI agent / workflow
- [anthropics/financial-services](https://github.com/anthropics/financial-services) — 940: AI agent / workflow
- [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) — 940: AI agent / workflow

## Bra att spara för senare

- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [mattpocock/skills](https://github.com/mattpocock/skills) — 677.3: AI agent / workflow
- [ruvnet/RuView](https://github.com/ruvnet/RuView) — 640.8: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [yikart/AiToEarn](https://github.com/yikart/AiToEarn) — 584.4: AI agent / workflow

## Brus / ignorera

- [apernet/hysteria](https://github.com/apernet/hysteria) — 174.5
- [Nightmare-Eclipse/YellowKey](https://github.com/Nightmare-Eclipse/YellowKey) — 63.1

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
