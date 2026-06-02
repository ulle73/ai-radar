# AI Radar Totalranking – 2026-06-02

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-02
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: microsoft/markitdown; Missing repo from ranking: nesquena/hermes-webui; Missing repo from ranking: pbakaus/impeccable; Missing repo from ranking: tauricresearch/tradingagents; Missing repo from ranking: d4vinci/scrapling; Missing repo from ranking: harry0703/moneyprinterturbo; Missing repo from ranking: p-e-w/heretic

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [nesquena/hermes-webui](https://github.com/nesquena/hermes-webui) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Hermes WebUI: The best way to use Hermes Agent from the web or from your phone! |
| 2 | 940 | [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 🕷️ An adaptive Web Scraping framework that handles everything from a single request to a full-scale crawl! |
| 3 | 940 | [revfactory/harness](https://github.com/revfactory/harness) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A meta-skill that designs domain-specific agent teams, defines specialized agents, and generates the skills they use. |
| 4 | 940 | [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Memory engine and app that is extremely fast, scalable. The Memory API for the AI era. |
| 5 | 940 | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Graphs that teach > graphs that impress. Turn any code into an interactive knowledge graph you can explore, search, and ask questions about. Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, and more. |
| 6 | 940 | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Open source repository of plugins primarily intended for knowledge workers to use in Claude Cowork |
| 7 | 904.8 | [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — TradingAgents: Multi-Agents LLM Financial Trading Framework |
| 8 | 882 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Pre-indexed code knowledge graph for Claude Code, Codex, Gemini, Cursor, OpenCode, AntiGravity, Kiro, and Hermes Agent — fewer tokens, fewer tool calls, 100% local |
| 9 | 881.3 | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The design language that makes your AI harness better at design. |
| 10 | 834 | [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Official Compound Engineering plugin for Claude Code, Codex, Cursor, and more |
| 11 | 768 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Learn it. Build it. Ship it for others. |
| 12 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 13 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 14 | 757.8 | [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 754 structured cybersecurity skills for AI agents · Mapped to 5 frameworks: MITRE ATT&CK, NIST CSF 2.0, MITRE ATLAS, D3FEND & NIST AI RMF · agentskills.io standard · Works with Claude Code, GitHub Copilot, Codex CLI, Cursor, Gemini CLI & 20+ platforms · 26 security domains · Apache 2.0 |
| 15 | 754.9 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Taste-Skill - gives your AI good taste. stops the AI from generating boring, generic slop |
| 16 | 746 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent that grows with you |
| 17 | 695.5 | [op7418/guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — 🪧 Claude Code / Codex skill — generate Xiaohongshu carousels & WeChat 21:9+1:1 cover pairs. Editorial × Swiss visual systems, 28 layouts, 10 themes, single-file HTML → PNG. 小红书图文 + 公众号封面对 |
| 18 | 674.7 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Persistent Context Across Sessions for Every Agent – Captures everything your agent does during sessions, compresses it with AI, and injects relevant context back into future sessions. Works with Claude Code, OpenClaw, Codex, Gemini, Hermes, Copilot, OpenCode + More |
| 19 | 664 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 20 | 661 | [pewdiepie-archdaemon/odysseus](https://github.com/pewdiepie-archdaemon/odysseus) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Self-hosted AI workspace. |
| 21 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 22 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 23 | 594 | [microsoft/markitdown](https://github.com/microsoft/markitdown) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_DAILY — Python tool for converting files and office documents to Markdown. |
| 24 | 560.6 | [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Read-only developer endpoint scanner for on-disk package, extension, and developer-tool metadata, built to check exposure to known software supply-chain compromises. |
| 25 | 553.1 | [helloianneo/ian-xiaohei-illustrations](https://github.com/helloianneo/ian-xiaohei-illustrations) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — 中文小黑怪诞正文配图生成 Skill \| 16:9 白底手绘 \| 少量红橙蓝批注 \| Codex Skill |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 445.8 | [asz798838958/aBaiAutoplus](https://github.com/asz798838958/aBaiAutoplus) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — 多平台 AI 账号自动注册与管理 · 协议化付款一键开通 ChatGPT Plus |
| 28 | 370.7 | [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — A skill file for removing AI tells from prose |
| 29 | 362.4 | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — 利用AI大模型，一键生成高清短视频 Generate short videos with one click using AI LLM. |
| 30 | 341.1 | [p-e-w/heretic](https://github.com/p-e-w/heretic) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — Fully automatic censorship removal for language models |

## Toppkandidater att agera på

- [nesquena/hermes-webui](https://github.com/nesquena/hermes-webui) — 940: AI agent / workflow
- [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) — 940: AI agent / workflow
- [revfactory/harness](https://github.com/revfactory/harness) — 940: AI agent / workflow
- [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) — 940: AI agent / workflow
- [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) — 940: AI agent / workflow

## Bra att spara för senare

- [op7418/guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) — 695.5: AI agent / workflow
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) — 674.7: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 664: AI agent / workflow
- [pewdiepie-archdaemon/odysseus](https://github.com/pewdiepie-archdaemon/odysseus) — 661: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [microsoft/markitdown](https://github.com/microsoft/markitdown) — 594: Web / e-commerce / FAIV
- [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) — 560.6: AI agent / workflow
- [helloianneo/ian-xiaohei-illustrations](https://github.com/helloianneo/ian-xiaohei-illustrations) — 553.1: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
