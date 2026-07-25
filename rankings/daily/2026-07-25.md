# AI Radar Totalranking – 2026-07-25

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-25
- Repos rankade: 30
- Fallback-orsak: OpenRouter returned no message content. finish_reason=length; hint=no error message; raw={"id":"gen-1784953777-V7apOEu6hdslnR0h1Kdz","object":"chat.completion","created":1784953777,"model":"openai/gpt-oss-20b:free","provider":"Darkbloom","system_fingerprint":null,"service_tier":null,"choices":[{"index":0,"logprobs":null,"finish_reason":"length","native_finish_reason":"length","message":{"role":"assistant","content":null,"refusal":null,"reasoning":"We need to produce a markdown ranking report. Must include 30 unique repos from Allowed repos. Must rank them with JonasFitScore 0-1000 with decimals. Must include columns: Rank, JonasFitScore, Repo, Primär match, Sekundär match, Action, Motivering. Must adhere to action limits: max 5 Testa nu, max 10 Spara för senare. Others can be Bevaka or Ignorera. Must ensure at least 7 of top 10 from TRUE_TRENDING_DAILY/TRUE_TRENDING_WEEKLY. We have 19 true trending repos (daily+weekly). We need 30 repos total. So 11 from EXTRA_SEARCH_API. Must ensure at least 7 of top 10 from true trending. We'll rank accordingly.\n\nWe need to compute sco

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows |
| 2 | 914.1 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 3 | 878.1 | [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The fastest browser for AI agents to run web automation, built for sharing your logged-in browser state with your AI agents, like Codex or Claude Code, without disturbing you. Zero cost, zero config. |
| 4 | 874.6 | [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — DeepTutor: Lifelong Personalized Tutoring. https://deeptutor.info/. |
| 5 | 864.5 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free MIT AI gateway: one endpoint, 290+ providers (90+ free), 500+ models — Kimi, Claude, GPT, OpenAI, Gemini, GLM, DeepSeek, MiniMax. Works with Claude Code, Codex, Cursor, OpenCode, Cline & Copilot. Quota-aware auto-fallback, RTK+Caveman compression saves 15-95% tokens, MCP/A2A, Desktop/PWA. Built by 500+ contributors |
| 6 | 837.9 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Local-first code intelligence graph for MCP and CLI. Builds a persistent map of your codebase so AI coding tools read only what matters, with benchmarked context reductions on reviews and large-repo workflows. |
| 7 | 830.2 | [block/buzz](https://github.com/block/buzz) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A hive mind communication platform |
| 8 | 817.1 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 9 | 794 | [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 《深入理解 AI Agent：设计原理与工程实践》（李博杰 著）开源主仓库：全书正文、编译版 PDF 与按章配套代码 |
| 10 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 11 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 12 | 748.7 | [1jehuang/jcode](https://github.com/1jehuang/jcode) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The most intelligent agent harness for code |
| 13 | 747.4 | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Kronos: A Foundation Model for the Language of Financial Markets |
| 14 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 704 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Skills for Real Engineers. Straight from my .agents directory. |
| 16 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 17 | 678.4 | [earendil-works/pi](https://github.com/earendil-works/pi) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI |
| 18 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 19 | 661.7 | [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Kimi Code CLI — The Starting Point for Next-Gen Agents |
| 20 | 657.9 | [agegr/pi-web](https://github.com/agegr/pi-web) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Web UI for the pi coding agent |
| 21 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 22 | 624.5 | [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Kimi Code CLI is your next CLI agent. |
| 23 | 623.6 | [Automattic/harper](https://github.com/Automattic/harper) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Offline, privacy-first grammar checker. Fast, open-source, Rust-powered |
| 24 | 601.7 | [andrewyng/openworker](https://github.com/andrewyng/openworker) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Topics: - |
| 25 | 491.9 | [likec4/likec4](https://github.com/likec4/likec4) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — Visualize, collaborate, and evolve the software architecture with always actual and live diagrams from your code |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 28 | 388.1 | [yorukot/superfile](https://github.com/yorukot/superfile) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Pretty fancy and modern terminal file manager |
| 29 | 293.6 | [Pumpkin-MC/Pumpkin](https://github.com/Pumpkin-MC/Pumpkin) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | TRUE_TRENDING_DAILY — Empowering everyone to host fast and efficient Minecraft servers. |
| 30 | 253.4 | [slvDev/esp32-ai](https://github.com/slvDev/esp32-ai) | AI agent / workflow | Data / scraping / företagslistor | Ignorera | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — 940: AI agent / workflow
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 914.1: AI agent / workflow
- [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) — 878.1: AI agent / workflow
- [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) — 874.6: AI agent / workflow
- [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) — 864.5: AI agent / workflow

## Bra att spara för senare

- [mattpocock/skills](https://github.com/mattpocock/skills) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [earendil-works/pi](https://github.com/earendil-works/pi) — 678.4: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) — 661.7: AI agent / workflow
- [agegr/pi-web](https://github.com/agegr/pi-web) — 657.9: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) — 624.5: AI agent / workflow
- [Automattic/harper](https://github.com/Automattic/harper) — 623.6: AI agent / workflow
- [andrewyng/openworker](https://github.com/andrewyng/openworker) — 601.7: AI agent / workflow

## Brus / ignorera

- [Pumpkin-MC/Pumpkin](https://github.com/Pumpkin-MC/Pumpkin) — 293.6
- [slvDev/esp32-ai](https://github.com/slvDev/esp32-ai) — 253.4

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
