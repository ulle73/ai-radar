# AI Radar Totalranking – 2026-07-27

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-27
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: pbakaus/impeccable; Missing repo from ranking: block/buzz; Missing repo from ranking: pingdotgg/t3code; Missing repo from ranking: shiyu-coder/kronos; Missing repo from ranking: permissionlesstech/bitchat; Missing repo from ranking: corebunch/instatic; Missing repo from ranking: citrolabs/ego-lite

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [CoreBunch/Instatic](https://github.com/CoreBunch/Instatic) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The open-source alternative to Webflow, Framer and WordPress. Agentic self-hosted visual CMS outputting clean static pages. Users, roles, plugins, content, database, it's all there. |
| 2 | 925.9 | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The design language that makes your AI harness better at design. |
| 3 | 881.6 | [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The fastest browser for AI agents to run web automation, built for sharing your logged-in browser state with your AI agents, like Codex or Claude Code, without disturbing you. Zero cost, zero config. |
| 4 | 874.2 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 5 | 864.9 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free MIT AI gateway: one endpoint, 290+ providers (90+ free), 500+ models — Kimi, Claude, GPT, OpenAI, Gemini, GLM, DeepSeek, MiniMax. Works with Claude Code, Codex, Cursor, OpenCode, Cline & Copilot. Quota-aware auto-fallback, RTK+Caveman compression saves 15-95% tokens, MCP/A2A, Desktop/PWA. Built by 500+ contributors |
| 6 | 855 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Learn it. Build it. Ship it for others. |
| 7 | 838 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Local-first code intelligence graph for MCP and CLI. Builds a persistent map of your codebase so AI coding tools read only what matters, with benchmarked context reductions on reviews and large-repo workflows. |
| 8 | 831.9 | [block/buzz](https://github.com/block/buzz) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A hive mind communication platform |
| 9 | 804 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .agents directory. |
| 10 | 794.6 | [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 《深入理解 AI Agent：设计原理与工程实践》（李博杰 著）开源主仓库：全书正文、编译版 PDF 与按章配套代码 |
| 11 | 777.1 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 12 | 760 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 13 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 14 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 15 | 749 | [1jehuang/jcode](https://github.com/1jehuang/jcode) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The most RAM effiecent harness |
| 16 | 747.5 | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Kronos: A Foundation Model for the Language of Financial Markets |
| 17 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 18 | 678.5 | [earendil-works/pi](https://github.com/earendil-works/pi) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI |
| 19 | 677.1 | [mikiarlo3/ai-copywriter](https://github.com/mikiarlo3/ai-copywriter) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An AI copywriter that uses real copywriting skills + real marketing knowledge with human tone. |
| 20 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 21 | 658.5 | [agegr/pi-web](https://github.com/agegr/pi-web) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Web UI for the pi coding agent |
| 22 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 23 | 620.1 | [OtterMind/Chat2DB](https://github.com/OtterMind/Chat2DB) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — 🔥🔥🔥 AI-driven database tool and SQL client, The hottest GUI client, supporting MySQL, Oracle, PostgreSQL, DB2, SQL Server, DB2, SQLite, H2, ClickHouse, and more. |
| 24 | 594 | [nodejs/node](https://github.com/nodejs/node) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Node.js JavaScript runtime ✨🐢🚀✨ |
| 25 | 592.1 | [mshumer/Claude-of-Duty](https://github.com/mshumer/Claude-of-Duty) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A Call of Duty-quality FPS in Three.js, built from a single prompt. |
| 26 | 582.5 | [pingdotgg/t3code](https://github.com/pingdotgg/t3code) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Topics: - |
| 27 | 460.8 | [permissionlesstech/bitchat](https://github.com/permissionlesstech/bitchat) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — bluetooth mesh chat, IRC vibes |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 388.3 | [yorukot/superfile](https://github.com/yorukot/superfile) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Pretty fancy and modern terminal file manager |
| 30 | 260.2 | [slvDev/esp32-ai](https://github.com/slvDev/esp32-ai) | AI agent / workflow | Data / scraping / företagslistor | Ignorera | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [CoreBunch/Instatic](https://github.com/CoreBunch/Instatic) — 940: AI agent / workflow
- [pbakaus/impeccable](https://github.com/pbakaus/impeccable) — 925.9: AI agent / workflow
- [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) — 881.6: AI agent / workflow
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 874.2: AI agent / workflow
- [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) — 864.9: AI agent / workflow

## Bra att spara för senare

- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [earendil-works/pi](https://github.com/earendil-works/pi) — 678.5: AI agent / workflow
- [mikiarlo3/ai-copywriter](https://github.com/mikiarlo3/ai-copywriter) — 677.1: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [agegr/pi-web](https://github.com/agegr/pi-web) — 658.5: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [OtterMind/Chat2DB](https://github.com/OtterMind/Chat2DB) — 620.1: AI agent / workflow
- [nodejs/node](https://github.com/nodejs/node) — 594: AI agent / workflow
- [mshumer/Claude-of-Duty](https://github.com/mshumer/Claude-of-Duty) — 592.1: AI agent / workflow
- [pingdotgg/t3code](https://github.com/pingdotgg/t3code) — 582.5: AI agent / workflow

## Brus / ignorera

- [slvDev/esp32-ai](https://github.com/slvDev/esp32-ai) — 260.2

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
