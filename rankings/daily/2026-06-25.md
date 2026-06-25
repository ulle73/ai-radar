# AI Radar Totalranking – 2026-06-25

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-25
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 1; Row 1: repo not allowed: voltagent/awesome-design-md; Missing repo from ranking: zhulinsen/daily_stock_analysis; Missing repo from ranking: google-labs-code/design.md; Missing repo from ranking: calesthio/openmontage; Missing repo from ranking: jcodesmore/ai-website-cloner-template; Missing repo from ranking: apple/container; Missing repo from ranking: revfactory/harness

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — World's first open-source, agentic video production system. 12 pipelines, 52 tools, 500+ agent skills. Turn your AI coding assistant into a full video production studio. |
| 2 | 940 | [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Clone any website with one command using AI coding agents |
| 3 | 940 | [revfactory/harness](https://github.com/revfactory/harness) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A meta-skill that designs domain-specific agent teams, defines specialized agents, and generates the skills they use. |
| 4 | 917.6 | [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — LLM 驱动的多市场股票智能分析系统：多源行情、实时新闻、决策看板与自动推送，支持零成本定时运行。 LLM-powered multi-market stock analysis system with multi-source market data, real-time news, decision dashboard, automated notifications, and cost-free scheduled runs. |
| 5 | 873.4 | [jamiepine/voicebox](https://github.com/jamiepine/voicebox) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The open-source AI voice studio. Clone, dictate, create. |
| 6 | 869.8 | [stablyai/orca](https://github.com/stablyai/orca) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Orca is the ADE for working with a fleet of parallel agents. Run any coding agent with your own subscription. Available on desktop and mobile. |
| 7 | 840.4 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees. |
| 8 | 806.2 | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — High-performance code intelligence MCP server. Indexes codebases into a persistent knowledge graph — average repo in milliseconds. 158 languages, sub-ms queries, 99% fewer tokens. Single static binary, zero dependencies. |
| 9 | 771.3 | [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Extracted system prompts from Anthropic - Claude Fable 5, Opus 4.8, Claude Code, Claude Design. OpenAI - ChatGPT 5.5 Thinking, GPT 5.5 Instant, Codex. Google - Gemini 3.5 Flash, 3.1 Pro, Antigravity. xAI - Grok, Cursor, Copilot, VS Code, Perplexity, and more. Updated regularly. |
| 10 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 11 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 12 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 13 | 704.9 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 14 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 16 | 675 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Persistent Context Across Sessions for Every Agent – Captures everything your agent does during sessions, compresses it with AI, and injects relevant context back into future sessions. Works with Claude Code, OpenClaw, Codex, Gemini, Hermes, Copilot, OpenCode + More |
| 17 | 674.2 | [penpot/penpot](https://github.com/penpot/penpot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Penpot: The open-source design tool for design and code collaboration |
| 18 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 19 | 655.3 | [interviewstreet/hiring-agent](https://github.com/interviewstreet/hiring-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — AI agent to evaluate and score resumes. |
| 20 | 636.7 | [bozhouDev/codex-orange-book](https://github.com/bozhouDev/codex-orange-book) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Codex 橙皮书：从安装到实战案例的全链路 Codex 使用指南（非官方开源，含可下载 PDF） |
| 21 | 594 | [flutter/flutter](https://github.com/flutter/flutter) | Web / e-commerce / FAIV | Trading / finance / stock-signals | Spara för senare | TRUE_TRENDING_DAILY — Flutter makes it easy and fast to build beautiful apps for mobile and beyond |
| 22 | 577.5 | [withastro/flue](https://github.com/withastro/flue) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — The sandbox agent framework. |
| 23 | 570 | [farion1231/cc-switch](https://github.com/farion1231/cc-switch) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A cross-platform desktop All-in-One assistant for Claude Code, Codex, OpenCode, OpenClaw, Gemini CLI & Hermes Agent. Only official website: ccswitch.io |
| 24 | 566.4 | [n0-computer/iroh](https://github.com/n0-computer/iroh) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — IP addresses break, dial keys instead. Modular networking stack in Rust. |
| 25 | 546.8 | [apple/container](https://github.com/apple/container) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A tool for creating and running Linux containers using lightweight virtual machines on a Mac. It is written in Swift, and optimized for Apple silicon. |
| 26 | 545.7 | [google-research/timesfm](https://github.com/google-research/timesfm) | AI agent / workflow | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — TimesFM (Time Series Foundation Model) is a pretrained time-series foundation model developed by Google Research for time-series forecasting. |
| 27 | 464.3 | [andreknieriem/headunit-revived](https://github.com/andreknieriem/headunit-revived) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Headunit App for displaying Android Auto |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 30 | 381.4 | [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — A format specification for describing a visual identity to coding agents. DESIGN.md gives agents a persistent, structured understanding of a design system. |

## Toppkandidater att agera på

- [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) — 940: AI agent / workflow
- [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) — 940: AI agent / workflow
- [revfactory/harness](https://github.com/revfactory/harness) — 940: AI agent / workflow
- [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) — 917.6: AI agent / workflow
- [jamiepine/voicebox](https://github.com/jamiepine/voicebox) — 873.4: AI agent / workflow

## Bra att spara för senare

- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 704.9: Web / e-commerce / FAIV
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) — 675: AI agent / workflow
- [penpot/penpot](https://github.com/penpot/penpot) — 674.2: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [interviewstreet/hiring-agent](https://github.com/interviewstreet/hiring-agent) — 655.3: AI agent / workflow
- [bozhouDev/codex-orange-book](https://github.com/bozhouDev/codex-orange-book) — 636.7: AI agent / workflow
- [flutter/flutter](https://github.com/flutter/flutter) — 594: Web / e-commerce / FAIV
- [withastro/flue](https://github.com/withastro/flue) — 577.5: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
