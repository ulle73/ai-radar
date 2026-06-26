# AI Radar Totalranking – 2026-06-26

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-26
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Missing ranking table header; Contains reasoning/prompt leakage; Expected 30 ranking rows, got 0; Missing repo from ranking: garrytan/gstack; Missing repo from ranking: google-labs-code/design.md; Missing repo from ranking: calesthio/openmontage; Missing repo from ranking: jcodesmore/ai-website-cloner-template; Missing repo from ranking: mukul975/anthropic-cybersecurity-skills

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [garrytan/gstack](https://github.com/garrytan/gstack) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Use Garry Tan's exact Claude Code setup: 23 opinionated tools that serve as CEO, Designer, Eng Manager, Release Manager, Doc Engineer, and QA |
| 2 | 940 | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — World's first open-source, agentic video production system. 12 pipelines, 52 tools, 500+ agent skills. Turn your AI coding assistant into a full video production studio. |
| 3 | 940 | [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Clone any website with one command using AI coding agents |
| 4 | 884.6 | [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 817 structured cybersecurity skills for AI agents · Mapped to 6 frameworks: MITRE ATT&CK, NIST CSF 2.0, MITRE ATLAS, D3FEND, NIST AI RMF & MITRE F3 (Fight Fraud) · agentskills.io standard · Works with Claude Code, GitHub Copilot, Codex CLI, Cursor, Gemini CLI & 20+ platforms · 29 security domains · Apache 2.0 |
| 5 | 877.7 | [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — LLM 驱动的多市场股票智能分析系统：多源行情、实时新闻、决策看板与自动推送，支持零成本定时运行。 LLM-powered multi-market stock analysis system with multi-source market data, real-time news, decision dashboard, automated notifications, and cost-free scheduled runs. |
| 6 | 873.5 | [jamiepine/voicebox](https://github.com/jamiepine/voicebox) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The open-source AI voice studio. Clone, dictate, create. |
| 7 | 840.7 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees. |
| 8 | 821.9 | [every-app/open-seo](https://github.com/every-app/open-seo) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open source alternative to Semrush and Ahrefs |
| 9 | 806.4 | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — High-performance code intelligence MCP server. Indexes codebases into a persistent knowledge graph — average repo in milliseconds. 158 languages, sub-ms queries, 99% fewer tokens. Single static binary, zero dependencies. |
| 10 | 775 | [aws/agent-toolkit-for-aws](https://github.com/aws/agent-toolkit-for-aws) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Official, AWS-supported MCP servers, skills, and plugins to help AI agents build on AWS |
| 11 | 771.3 | [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Extracted system prompts from Anthropic - Claude Fable 5, Opus 4.8, Claude Code, Claude Design. OpenAI - ChatGPT 5.5 Thinking, GPT 5.5 Instant, Codex. Google - Gemini 3.5 Flash, 3.1 Pro, Antigravity. xAI - Grok, Cursor, Copilot, VS Code, Perplexity, and more. Updated regularly. |
| 12 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 13 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 14 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 15 | 731 | [xbtlin/ai-berkshire](https://github.com/xbtlin/ai-berkshire) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — AI 时代的伯克希尔：基于 Claude Code 的价值投资研究框架。巴菲特·芒格·段永平·李录四大师方法论 + 多Agent并行研究。\| AI-era Berkshire: a value investing research framework built on Claude Code. 4 masters' methodologies + multi-agent adversarial analysis. |
| 16 | 704.9 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 17 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 18 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 19 | 675 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Persistent Context Across Sessions for Every Agent – Captures everything your agent does during sessions, compresses it with AI, and injects relevant context back into future sessions. Works with Claude Code, OpenClaw, Codex, Gemini, Hermes, Copilot, OpenCode + More |
| 20 | 674.2 | [penpot/penpot](https://github.com/penpot/penpot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Penpot: The open-source design tool for design and code collaboration |
| 21 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 22 | 639.8 | [mauriceboe/TREK](https://github.com/mauriceboe/TREK) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A self-hosted travel/trip planner with real-time collaboration, interactive maps, PWA support, SSO, budgets, packing lists, and more. |
| 23 | 638.3 | [bozhouDev/codex-orange-book](https://github.com/bozhouDev/codex-orange-book) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Codex 橙皮书：从安装到实战案例的全链路 Codex 使用指南（非官方开源，含可下载 PDF） |
| 24 | 570 | [farion1231/cc-switch](https://github.com/farion1231/cc-switch) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A cross-platform desktop All-in-One assistant for Claude Code, Codex, OpenCode, OpenClaw, Gemini CLI & Hermes Agent. Only official website: ccswitch.io |
| 25 | 550.9 | [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — The open-source CapCut alternative |
| 26 | 546.9 | [apple/container](https://github.com/apple/container) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A tool for creating and running Linux containers using lightweight virtual machines on a Mac. It is written in Swift, and optimized for Apple silicon. |
| 27 | 545.7 | [google-research/timesfm](https://github.com/google-research/timesfm) | AI agent / workflow | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — TimesFM (Time Series Foundation Model) is a pretrained time-series foundation model developed by Google Research for time-series forecasting. |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 30 | 382.1 | [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — A format specification for describing a visual identity to coding agents. DESIGN.md gives agents a persistent, structured understanding of a design system. |

## Toppkandidater att agera på

- [garrytan/gstack](https://github.com/garrytan/gstack) — 940: AI agent / workflow
- [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) — 940: AI agent / workflow
- [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) — 940: AI agent / workflow
- [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) — 884.6: AI agent / workflow
- [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) — 877.7: AI agent / workflow

## Bra att spara för senare

- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 704.9: Web / e-commerce / FAIV
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) — 675: AI agent / workflow
- [penpot/penpot](https://github.com/penpot/penpot) — 674.2: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [mauriceboe/TREK](https://github.com/mauriceboe/TREK) — 639.8: AI agent / workflow
- [bozhouDev/codex-orange-book](https://github.com/bozhouDev/codex-orange-book) — 638.3: AI agent / workflow
- [farion1231/cc-switch](https://github.com/farion1231/cc-switch) — 570: AI agent / workflow
- [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) — 550.9: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
