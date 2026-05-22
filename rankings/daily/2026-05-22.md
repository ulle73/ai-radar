# AI Radar Totalranking – 2026-05-22

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-22
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: multica-ai/andrej-karpathy-skills; Missing repo from ranking: obra/superpowers; Missing repo from ranking: hkuds/cli-anything; Missing repo from ranking: rohitg00/ai-engineering-from-scratch; Missing repo from ranking: chromedevtools/chrome-devtools-mcp; Missing repo from ranking: anthropics/claude-plugins-official; Missing repo from ranking: colbymchenry/codegraph

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [teng-lin/notebooklm-py](https://github.com/teng-lin/notebooklm-py) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Unofficial Python API and agentic skill for Google NotebookLM. Full programmatic access to NotebookLM's features—including capabilities the web UI doesn't expose—via Python, CLI, and AI agents like Claude Code, Codex, and OpenClaw. |
| 2 | 940 | [datawhalechina/easy-vibe](https://github.com/datawhalechina/easy-vibe) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 💻 vibe coding 2026 \| Your first modern Coding course for beginners to master step by step. |
| 3 | 919.7 | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Academic Research Skills for Claude Code: research → write → review → revise → finalize |
| 4 | 887.5 | [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Lightning-Fast, On-Device, Multilingual TTS — running natively via ONNX. |
| 5 | 886.3 | [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — "CLI-Anything: Making ALL Software Agent-Native" -- CLI-Hub: https://clianything.cc/ |
| 6 | 881.7 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 7 | 874.5 | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Chrome DevTools for coding agents |
| 8 | 874.2 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Pre-indexed code knowledge graph for Claude Code, Codex, Cursor, and OpenCode — fewer tokens, fewer tool calls, 100% local |
| 9 | 859.2 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 10 | 837.6 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 11 | 821 | [dotnet/skills](https://github.com/dotnet/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Repository for skills to assist AI coding agents with .NET and C# |
| 12 | 802.6 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Learn it. Build it. Ship it for others. |
| 13 | 792.9 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 14 | 760 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 15 | 760 | [nexu-io/open-design](https://github.com/nexu-io/open-design) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — 🎨 Local-first, open-source Claude Design alternative. ⚡ 19 Skills · ✨ 71 brand-grade Design Systems 🖼 Generate web · desktop · mobile prototypes · slides · images · videos · HyperFrames 📦 Sandboxed preview · HTML/PDF/PPTX/MP4 export 🤖 Runs on Claude Code / Codex / Cursor / Gemini / OpenCode / Qwen / Copilot / Hermes / Kimi CLI. |
| 16 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 17 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 18 | 760 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows |
| 19 | 752.7 | [humanlayer/12-factor-agents](https://github.com/humanlayer/12-factor-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — What are the principles we can use to build LLM-powered software that is actually good enough to put in the hands of production customers? |
| 20 | 744.4 | [rmyndharis/OpenWA](https://github.com/rmyndharis/OpenWA) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Free, Open Source, Self-Hosted WhatsApp API Gateway |
| 21 | 743.5 | [oven-sh/bun](https://github.com/oven-sh/bun) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one |
| 22 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 23 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 24 | 669 | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Official, Anthropic-managed directory of high quality Claude Code Plugins. |
| 25 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 26 | 636 | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A single CLAUDE.md file to improve Claude Code behavior, derived from Andrej Karpathy's observations on LLM coding pitfalls. |
| 27 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 28 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 29 | 343.1 | [thananon/9arm-skills](https://github.com/thananon/9arm-skills) | AI agent / workflow | Content / Socials / marketing | Bevaka | EXTRA_SEARCH_API — Topics: - |
| 30 | 218.5 | [FoundZiGu/GuJumpgate](https://github.com/FoundZiGu/GuJumpgate) | Web / e-commerce / FAIV | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [teng-lin/notebooklm-py](https://github.com/teng-lin/notebooklm-py) — 940: AI agent / workflow
- [datawhalechina/easy-vibe](https://github.com/datawhalechina/easy-vibe) — 940: AI agent / workflow
- [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) — 919.7: AI agent / workflow
- [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) — 887.5: AI agent / workflow
- [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) — 886.3: AI agent / workflow

## Bra att spara för senare

- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) — 669: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) — 636: AI agent / workflow

## Brus / ignorera

- [FoundZiGu/GuJumpgate](https://github.com/FoundZiGu/GuJumpgate) — 218.5

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
