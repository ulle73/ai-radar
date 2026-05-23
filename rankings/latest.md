# AI Radar Totalranking – 2026-05-23

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-23
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Missing ## Totalranking section; Expected 30 ranking rows, got 0; Missing repo from ranking: lum1104/understand-anything; Missing repo from ranking: rohitg00/ai-engineering-from-scratch; Missing repo from ranking: ruvnet/ruview; Missing repo from ranking: chromedevtools/chrome-devtools-mcp; Missing repo from ranking: anthropics/claude-plugins-official; Missing repo from ranking: colbymchenry/codegraph

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Graphs that teach > graphs that impress. Turn any code into an interactive knowledge graph you can explore, search, and ask questions about. Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, and more. |
| 2 | 920 | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Academic Research Skills for Claude Code: research → write → review → revise → finalize |
| 3 | 899.3 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 4 | 887.7 | [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Lightning-Fast, On-Device, Multilingual TTS — running natively via ONNX. |
| 5 | 881.8 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 6 | 875.2 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Pre-indexed code knowledge graph for Claude Code, Codex, Cursor, OpenCode, and Hermes Agent — fewer tokens, fewer tool calls, 100% local |
| 7 | 874.6 | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Chrome DevTools for coding agents |
| 8 | 863.8 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 9 | 821.8 | [dotnet/skills](https://github.com/dotnet/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Repository for skills to assist AI coding agents with .NET and C# |
| 10 | 803.2 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Learn it. Build it. Ship it for others. |
| 11 | 793 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 12 | 760 | [nexu-io/open-design](https://github.com/nexu-io/open-design) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — 🎨 Local-first, open-source Claude Design alternative. ⚡ 19 Skills · ✨ 71 brand-grade Design Systems 🖼 Generate web · desktop · mobile prototypes · slides · images · videos · HyperFrames 📦 Sandboxed preview · HTML/PDF/PPTX/MP4 export 🤖 Runs on Claude Code / Codex / Cursor / Gemini / OpenCode / Qwen / Copilot / Hermes / Kimi CLI. |
| 13 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 14 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 15 | 760 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows |
| 16 | 752.7 | [humanlayer/12-factor-agents](https://github.com/humanlayer/12-factor-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — What are the principles we can use to build LLM-powered software that is actually good enough to put in the hands of production customers? |
| 17 | 743.5 | [oven-sh/bun](https://github.com/oven-sh/bun) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one |
| 18 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 19 | 669.6 | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Official, Anthropic-managed directory of high quality Claude Code Plugins. |
| 20 | 664 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 21 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 22 | 631.9 | [odoo/odoo](https://github.com/odoo/odoo) | Web / e-commerce / FAIV | Trading / finance / stock-signals | Spara för senare | TRUE_TRENDING_DAILY — Odoo. Open Source Apps To Grow Your Business. |
| 23 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 24 | 602 | [trimstray/the-book-of-secret-knowledge](https://github.com/trimstray/the-book-of-secret-knowledge) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_DAILY — A collection of inspiring lists, manuals, cheatsheets, blogs, hacks, one-liners, cli/web tools and more. |
| 25 | 551.6 | [HKUDS/ViMax](https://github.com/HKUDS/ViMax) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — "ViMax: Agentic Video Generation (Director, Screenwriter, Producer, and Video Generator All-in-One)" |
| 26 | 497.8 | [byJoey/cfnew](https://github.com/byJoey/cfnew) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Topics: - |
| 27 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 28 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 29 | 344.8 | [thananon/9arm-skills](https://github.com/thananon/9arm-skills) | AI agent / workflow | Content / Socials / marketing | Bevaka | EXTRA_SEARCH_API — Topics: - |
| 30 | 219.6 | [FoundZiGu/GuJumpgate](https://github.com/FoundZiGu/GuJumpgate) | Web / e-commerce / FAIV | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) — 940: AI agent / workflow
- [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) — 920: AI agent / workflow
- [ruvnet/RuView](https://github.com/ruvnet/RuView) — 899.3: AI agent / workflow
- [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) — 887.7: AI agent / workflow
- [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) — 881.8: AI agent / workflow

## Bra att spara för senare

- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) — 669.6: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 664: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [odoo/odoo](https://github.com/odoo/odoo) — 631.9: Web / e-commerce / FAIV
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [trimstray/the-book-of-secret-knowledge](https://github.com/trimstray/the-book-of-secret-knowledge) — 602: Web / e-commerce / FAIV
- [HKUDS/ViMax](https://github.com/HKUDS/ViMax) — 551.6: AI agent / workflow

## Brus / ignorera

- [FoundZiGu/GuJumpgate](https://github.com/FoundZiGu/GuJumpgate) — 219.6

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
