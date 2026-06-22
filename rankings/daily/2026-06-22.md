# AI Radar Totalranking – 2026-06-22

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-22
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: koala73/worldmonitor; Missing repo from ranking: zhulinsen/daily_stock_analysis; Missing repo from ranking: chopratejas/headroom; Missing repo from ranking: bytedance/deer-flow; Missing repo from ranking: mukul975/anthropic-cybersecurity-skills; Missing repo from ranking: calesthio/openmontage; Missing repo from ranking: deusdata/codebase-memory-mcp

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [bytedance/deer-flow](https://github.com/bytedance/deer-flow) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An open-source long-horizon SuperAgent harness that researches, codes, and creates. With the help of sandboxes, memories, tools, skill, subagents and message gateway, it handles different levels of tasks that could take minutes to hours. |
| 2 | 940 | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — World's first open-source, agentic video production system. 12 pipelines, 52 tools, 500+ agent skills. Turn your AI coding assistant into a full video production studio. |
| 3 | 917.1 | [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — LLM 驱动的多市场股票智能分析系统：多源行情、实时新闻、决策看板与自动推送，支持零成本定时运行。 LLM-powered multi-market stock analysis system with multi-source market data, real-time news, decision dashboard, automated notifications, and cost-free scheduled runs. |
| 4 | 883.6 | [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 754 structured cybersecurity skills for AI agents · Mapped to 5 frameworks: MITRE ATT&CK, NIST CSF 2.0, MITRE ATLAS, D3FEND & NIST AI RMF · agentskills.io standard · Works with Claude Code, GitHub Copilot, Codex CLI, Cursor, Gemini CLI & 20+ platforms · 26 security domains · Apache 2.0 |
| 5 | 844.4 | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — High-performance code intelligence MCP server. Indexes codebases into a persistent knowledge graph — average repo in milliseconds. 158 languages, sub-ms queries, 99% fewer tokens. Single static binary, zero dependencies. |
| 6 | 840 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees. |
| 7 | 836.5 | [tursodatabase/turso](https://github.com/tursodatabase/turso) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Turso is an in-process SQL database, compatible with SQLite. |
| 8 | 797.2 | [chopratejas/headroom](https://github.com/chopratejas/headroom) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Compress tool outputs, logs, files, and RAG chunks before they reach the LLM. 60-95% fewer tokens, same answers. Library, proxy, MCP server. |
| 9 | 789.5 | [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Security scanner for AI agent skills. Detect vulnerabilities, malicious patterns, and security risks. |
| 10 | 771.1 | [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Extracted system prompts from Anthropic - Claude Fable 5, Opus 4.8, Claude Code, Claude Design. OpenAI - ChatGPT 5.5 Thinking, GPT 5.5 Instant, Codex. Google - Gemini 3.5 Flash, 3.1 Pro, Antigravity. xAI - Grok, Cursor, Copilot, VS Code, Perplexity, and more. Updated regularly. |
| 11 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 12 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 13 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 14 | 744.7 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Testa nu | TRUE_TRENDING_DAILY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 15 | 714.1 | [penpot/penpot](https://github.com/penpot/penpot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Penpot: The open-source design tool for design and code collaboration |
| 16 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 17 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 18 | 674.9 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Persistent Context Across Sessions for Every Agent – Captures everything your agent does during sessions, compresses it with AI, and injects relevant context back into future sessions. Works with Claude Code, OpenClaw, Codex, Gemini, Hermes, Copilot, OpenCode + More |
| 19 | 664 | [iptv-org/iptv](https://github.com/iptv-org/iptv) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Collection of publicly available IPTV channels from all over the world |
| 20 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 21 | 616.8 | [palmier-io/palmier-pro](https://github.com/palmier-io/palmier-pro) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — macOS video editor built for AI |
| 22 | 577.2 | [withastro/flue](https://github.com/withastro/flue) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — The sandbox agent framework. |
| 23 | 570 | [farion1231/cc-switch](https://github.com/farion1231/cc-switch) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A cross-platform desktop All-in-One assistant for Claude Code, Codex, OpenCode, OpenClaw, Gemini CLI & Hermes Agent. Only official website: ccswitch.io |
| 24 | 566.3 | [n0-computer/iroh](https://github.com/n0-computer/iroh) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — IP addresses break, dial keys instead. Modular networking stack in Rust. |
| 25 | 547.1 | [Forsy-AI/agent-apprenticeship](https://github.com/Forsy-AI/agent-apprenticeship) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The living ecosystem where AI agents learn from real-world work through iterative workflow loops, reusable experience, and collective training signal exchange. |
| 26 | 545.6 | [google-research/timesfm](https://github.com/google-research/timesfm) | AI agent / workflow | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — TimesFM (Time Series Foundation Model) is a pretrained time-series foundation model developed by Google Research for time-series forecasting. |
| 27 | 472.6 | [vercel/eve](https://github.com/vercel/eve) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The Framework for Building Agents |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 30 | 386.6 | [zhongerxin/Cowart](https://github.com/zhongerxin/Cowart) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [bytedance/deer-flow](https://github.com/bytedance/deer-flow) — 940: AI agent / workflow
- [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) — 940: AI agent / workflow
- [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) — 917.1: AI agent / workflow
- [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) — 883.6: AI agent / workflow
- [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) — 844.4: AI agent / workflow

## Bra att spara för senare

- [penpot/penpot](https://github.com/penpot/penpot) — 714.1: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) — 674.9: AI agent / workflow
- [iptv-org/iptv](https://github.com/iptv-org/iptv) — 664: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [palmier-io/palmier-pro](https://github.com/palmier-io/palmier-pro) — 616.8: AI agent / workflow
- [withastro/flue](https://github.com/withastro/flue) — 577.2: AI agent / workflow
- [farion1231/cc-switch](https://github.com/farion1231/cc-switch) — 570: AI agent / workflow
- [n0-computer/iroh](https://github.com/n0-computer/iroh) — 566.3: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
