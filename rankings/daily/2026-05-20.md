# AI Radar Totalranking – 2026-05-20

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-20
- Repos rankade: 30
- Fallback-orsak: OpenRouter returned no message content. finish_reason=length; hint=no error message; raw={"id":"gen-1779254189-leXNyq2WjIwPSktKfwIQ","object":"chat.completion","created":1779254189,"model":"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning-20260428:free","provider":"Nvidia","system_fingerprint":null,"choices":[{"index":0,"logprobs":null,"finish_reason":"length","native_finish_reason":"length","message":{"role":"assistant","content":null,"refusal":null,"reasoning":"We need to produce a markdown ranking report with exactly 30 repos, each appears once, sorted by JonasFitScore descending. Must include columns: Rank, JonasFitScore, Repo, Primär match, Sekundär match, Action, Motivation.\n\nWe must use only repos from Allowed repos list (the 30 items). Must not add any other repos. Must rank exactly those 30.\n\nWe need to compute JonasFitScore 0-1000 with decimal. Must be granular, avoid many same scores. Must prioritize practical utility, match with goals, etc.\n\nWe have 30 repos listed. Need to assign scores and actions.\n\nWe need to ensure max 5 repos with Action = Testa nu, m

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 2 | 940 | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Academic Research Skills for Claude Code: research → write → review → revise → finalize |
| 3 | 921.2 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 4 | 876.8 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 5 | 859 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 6 | 818.1 | [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — "CLI-Anything: Making ALL Software Agent-Native" -- CLI-Hub: https://clianything.cc/ |
| 7 | 797.9 | [rtk-ai/rtk](https://github.com/rtk-ai/rtk) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — CLI proxy that reduces LLM token consumption by 60-90% on common dev commands. Single Rust binary, zero dependencies |
| 8 | 790.2 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 9 | 760 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 10 | 760 | [nexu-io/open-design](https://github.com/nexu-io/open-design) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — 🎨 Local-first, open-source alternative to Anthropic's Claude Design. ⚡ 19 Skills · ✨ 71 brand-grade Design Systems 🖼 Generate web · desktop · mobile prototypes · slides · images · videos · HyperFrames 📦 Sandboxed preview · HTML/PDF/PPTX/MP4 export 🤖 Runs on Claude Code / Codex / Cursor / Gemini / OpenCode / Qwen / Copilot / Hermes / Kimi CLI. |
| 11 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 12 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 13 | 760 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows |
| 14 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 15 | 743.8 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Pre-indexed code knowledge graph for Claude Code, Codex, Cursor, and OpenCode — fewer tokens, fewer tool calls, 100% local |
| 16 | 743.5 | [oven-sh/bun](https://github.com/oven-sh/bun) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one |
| 17 | 718.2 | [Doorman11991/smallcode](https://github.com/Doorman11991/smallcode) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — AI coding agent optimized for small LLMs. 87% benchmark with 4B-active model. |
| 18 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 19 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 20 | 677.7 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .claude directory. |
| 21 | 668.3 | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Official, Anthropic-managed directory of high quality Claude Code Plugins. |
| 22 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 23 | 584.7 | [yikart/AiToEarn](https://github.com/yikart/AiToEarn) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Let's use AI to Earn! |
| 24 | 469.8 | [yetone/native-feel-skill](https://github.com/yetone/native-feel-skill) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — An Agent Skill for designing cross-platform desktop apps that feel native — distilled from Raycast's 2.0 deep-dive and reverse engineering of Raycast Beta.app. Eight architectural tenets, four-layer architecture, WebKit/WebView2 survival guide, 75-item ship audit. |
| 25 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 26 | 453.2 | [facebook/pyrefly](https://github.com/facebook/pyrefly) | Web / e-commerce / FAIV | Trading / finance / stock-signals | Bevaka | TRUE_TRENDING_WEEKLY — A fast type checker and language server for Python |
| 27 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 28 | 391.6 | [vercel-labs/zerolang](https://github.com/vercel-labs/zerolang) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The programming language for agents |
| 29 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 30 | 172.5 | [DuskMosquito/Lossless-Scaling-Desktop-2026](https://github.com/DuskMosquito/Lossless-Scaling-Desktop-2026) | Web / e-commerce / FAIV | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — ⭐️ Lossless Scaling Desktop 2026 \| Setup Installer v1.0 \| Patch Activator Keygen \| License Key Pre-Activated \| Full Version Latest Build Pro \| Optimize Resolution Scaling \| Enhance Performance Graphics \| Get Desktop App Windows 10/11 PC \| Direct Genuine Original x64 \| Download Install Loader Mod ⭐️ |

## Toppkandidater att agera på

- [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) — 940: AI agent / workflow
- [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) — 940: AI agent / workflow
- [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) — 921.2: AI agent / workflow
- [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) — 876.8: AI agent / workflow
- [ruvnet/RuView](https://github.com/ruvnet/RuView) — 859: AI agent / workflow

## Bra att spara för senare

- [Doorman11991/smallcode](https://github.com/Doorman11991/smallcode) — 718.2: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [mattpocock/skills](https://github.com/mattpocock/skills) — 677.7: AI agent / workflow
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) — 668.3: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [yikart/AiToEarn](https://github.com/yikart/AiToEarn) — 584.7: AI agent / workflow

## Brus / ignorera

- [DuskMosquito/Lossless-Scaling-Desktop-2026](https://github.com/DuskMosquito/Lossless-Scaling-Desktop-2026) — 172.5

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
