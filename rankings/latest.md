# AI Radar Totalranking – 2026-05-19

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-19
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: hkuds/cli-anything; Missing repo from ranking: tinyhumansai/openhuman; Missing repo from ranking: cloakhq/cloakbrowser; Missing repo from ranking: ruvnet/ruview; Missing repo from ranking: imbad0202/academic-research-skills; Missing repo from ranking: k-dense-ai/scientific-agent-skills; Missing repo from ranking: bigbodycobain/shadowbroker

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Academic Research Skills for Claude Code: research → write → review → revise → finalize |
| 2 | 940 | [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A set of ready to use Agent Skills for research, science, engineering, analysis, finance and writing. |
| 3 | 940 | [BigBodyCobain/Shadowbroker](https://github.com/BigBodyCobain/Shadowbroker) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open-source intelligence for the global theater. Track everything from the corporate/private jets of the wealthy, and spy satellites, to seismic events in one unified interface. Hook an AI agent up to have it parse through data and find previously unseen correlations. The knowledge is available to all but rarely aggregated in the open, until now. |
| 4 | 940 | [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — LLM inference in C/C++ |
| 5 | 940 | [anthropics/financial-services](https://github.com/anthropics/financial-services) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Topics: - |
| 6 | 940 | [millionco/react-doctor](https://github.com/millionco/react-doctor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Your agent writes bad React. This catches it |
| 7 | 920.7 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 8 | 875.6 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 9 | 845 | [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Lightning-Fast, On-Device, Multilingual TTS — running natively via ONNX. |
| 10 | 817.9 | [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — "CLI-Anything: Making ALL Software Agent-Native" -- CLI-Hub: https://clianything.cc/ |
| 11 | 760 | [nexu-io/open-design](https://github.com/nexu-io/open-design) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — 🎨 Local-first, open-source alternative to Anthropic's Claude Design. ⚡ 19 Skills · ✨ 71 brand-grade Design Systems 🖼 Generate web · desktop · mobile prototypes · slides · images · videos · HyperFrames 📦 Sandboxed preview · HTML/PDF/PPTX/MP4 export 🤖 Runs on Claude Code / Codex / Cursor / Gemini / OpenCode / Qwen / Copilot / Hermes / Kimi CLI. |
| 12 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 13 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 14 | 749.7 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 15 | 743.5 | [oven-sh/bun](https://github.com/oven-sh/bun) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one |
| 16 | 726.6 | [tech-leads-club/agent-skills](https://github.com/tech-leads-club/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The secure, validated skill registry for professional AI coding agents. Extend Antigravity, Claude Code, Cursor, Copilot and more with absolute confidence. |
| 17 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 18 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 19 | 702 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Pre-indexed code knowledge graph for Claude Code, Codex, Cursor, and OpenCode — fewer tokens, fewer tool calls, 100% local |
| 20 | 680.9 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 21 | 677.5 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .claude directory. |
| 22 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 23 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 24 | 584.6 | [yikart/AiToEarn](https://github.com/yikart/AiToEarn) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Let's use AI to Earn! |
| 25 | 469.7 | [yetone/native-feel-skill](https://github.com/yetone/native-feel-skill) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — An Agent Skill for designing cross-platform desktop apps that feel native — distilled from Raycast's 2.0 deep-dive and reverse engineering of Raycast Beta.app. Eight architectural tenets, four-layer architecture, WebKit/WebView2 survival guide, 75-item ship audit. |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 431.2 | [vercel-labs/zero](https://github.com/vercel-labs/zero) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The programming language for agents |
| 28 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 29 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 30 | 172.5 | [DuskMosquito/Lossless-Scaling-Desktop-2026](https://github.com/DuskMosquito/Lossless-Scaling-Desktop-2026) | Web / e-commerce / FAIV | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — ⭐️ Lossless Scaling Desktop 2026 \| Setup Installer v1.0 \| Patch Activator Keygen \| License Key Pre-Activated \| Full Version Latest Build Pro \| Optimize Resolution Scaling \| Enhance Performance Graphics \| Get Desktop App Windows 10/11 PC \| Direct Genuine Original x64 \| Download Install Loader Mod ⭐️ |

## Toppkandidater att agera på

- [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) — 940: AI agent / workflow
- [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) — 940: AI agent / workflow
- [BigBodyCobain/Shadowbroker](https://github.com/BigBodyCobain/Shadowbroker) — 940: AI agent / workflow
- [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) — 940: AI agent / workflow
- [anthropics/financial-services](https://github.com/anthropics/financial-services) — 940: AI agent / workflow

## Bra att spara för senare

- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) — 702: AI agent / workflow
- [ruvnet/RuView](https://github.com/ruvnet/RuView) — 680.9: AI agent / workflow
- [mattpocock/skills](https://github.com/mattpocock/skills) — 677.5: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [yikart/AiToEarn](https://github.com/yikart/AiToEarn) — 584.6: AI agent / workflow

## Brus / ignorera

- [DuskMosquito/Lossless-Scaling-Desktop-2026](https://github.com/DuskMosquito/Lossless-Scaling-Desktop-2026) — 172.5

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
