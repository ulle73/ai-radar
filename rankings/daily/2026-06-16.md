# AI Radar Totalranking – 2026-06-16

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-16
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: rohitg00/ai-engineering-from-scratch; Missing repo from ranking: panniantong/agent-reach; Missing repo from ranking: freecodecamp/freecodecamp; Missing repo from ranking: jwasham/coding-interview-university; Missing repo from ranking: krahets/hello-algo; Missing repo from ranking: iptv-org/iptv; Missing repo from ranking: trycua/cua

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — AI agent skill that researches any topic across Reddit, X, YouTube, HN, Polymarket, and the web - then synthesizes a grounded summary |
| 2 | 925.8 | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — PM Skills Marketplace: 100+ agentic skills, commands, and plugins — from discovery to strategy, execution, launch, and growth. |
| 3 | 900.4 | [meshery/meshery](https://github.com/meshery/meshery) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Meshery, the cloud native manager |
| 4 | 878.9 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees. |
| 5 | 809.3 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Learn it. Build it. Ship it for others. |
| 6 | 793 | [refactoringhq/tolaria](https://github.com/refactoringhq/tolaria) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Desktop app to manage markdown knowledge bases |
| 7 | 791.7 | [trycua/cua](https://github.com/trycua/cua) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open-source infrastructure for Computer-Use Agents. Sandboxes, SDKs, and benchmarks to train and evaluate AI agents that can control full desktops (macOS, Linux, Windows). |
| 8 | 787.5 | [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Security scanner for AI agent skills. Detect vulnerabilities, malicious patterns, and security risks. |
| 9 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 10 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 11 | 754.5 | [chopratejas/headroom](https://github.com/chopratejas/headroom) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Compress tool outputs, logs, files, and RAG chunks before they reach the LLM. 60-95% fewer tokens, same answers. Library, proxy, MCP server. |
| 12 | 746.9 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Production-grade engineering skills for AI coding agents. |
| 13 | 704 | [iptv-org/iptv](https://github.com/iptv-org/iptv) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Collection of publicly available IPTV channels from all over the world |
| 14 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 16 | 682.4 | [omnigent-ai/omnigent](https://github.com/omnigent-ai/omnigent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A meta-harness for all your AI agents. Omnigent provides a common layer over Claude Code, Codex, Pi, and the agents you write yourself: swap or combine harnesses without rewriting, keep them in check with policies and sandboxing, and collaborate in real time on the same live session, from any device. |
| 17 | 620.9 | [teslamate-org/teslamate](https://github.com/teslamate-org/teslamate) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A self-hosted data logger for your Tesla 🚘 [main maintainer=@JakobLichterfeld] |
| 18 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 19 | 596.9 | [tamnd/kage](https://github.com/tamnd/kage) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Shadow any website for offline viewing, with the JavaScript stripped out |
| 20 | 594 | [jwasham/coding-interview-university](https://github.com/jwasham/coding-interview-university) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A complete computer science study plan to become a software engineer. |
| 21 | 594 | [krahets/hello-algo](https://github.com/krahets/hello-algo) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — 《Hello 算法》：动画图解、一键运行的数据结构与算法教程。支持简中、繁中、English、日本語，提供 Python, Java, C++, C, C#, JS, Go, Swift, Rust, Ruby, Kotlin, TS, Dart 等代码实现 |
| 22 | 567.6 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote. |
| 23 | 553 | [chatwoot/chatwoot](https://github.com/chatwoot/chatwoot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Open-source live-chat, email support, omni-channel desk. An alternative to Intercom, Zendesk, Salesforce Service Cloud etc. 🔥💬 |
| 24 | 521.4 | [XiaomiMiMo/MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Topics: - |
| 25 | 512.9 | [RyanCodrai/turbovec](https://github.com/RyanCodrai/turbovec) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A vector index built on TurboQuant, written in Rust with Python bindings |
| 26 | 506 | [apple/container](https://github.com/apple/container) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A tool for creating and running Linux containers using lightweight virtual machines on a Mac. It is written in Swift, and optimized for Apple silicon. |
| 27 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 28 | 435.7 | [shadcn/improve](https://github.com/shadcn/improve) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Use your most capable model to audit your codebase and write plans for cheaper models to execute. |
| 29 | 434 | [freeCodeCamp/freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — freeCodeCamp.org's open-source codebase and curriculum. Learn math, programming, and computer science for free. |
| 30 | 279.4 | [music-assistant/server](https://github.com/music-assistant/server) | Documents / wedding planner | TRUE_TRENDING_WEEKLY | Ignorera | TRUE_TRENDING_WEEKLY — Music Assistant is a free, opensource Media library manager that connects to your streaming services and a wide range of connected speakers. The server is the beating heart, the core of Music Assistant and must run on an always-on device like a Raspberry Pi, a NAS or an Intel NUC or alike. |

## Toppkandidater att agera på

- [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) — 940: AI agent / workflow
- [phuryn/pm-skills](https://github.com/phuryn/pm-skills) — 925.8: AI agent / workflow
- [meshery/meshery](https://github.com/meshery/meshery) — 900.4: AI agent / workflow
- [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) — 878.9: AI agent / workflow
- [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) — 809.3: AI agent / workflow

## Bra att spara för senare

- [iptv-org/iptv](https://github.com/iptv-org/iptv) — 704: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [omnigent-ai/omnigent](https://github.com/omnigent-ai/omnigent) — 682.4: AI agent / workflow
- [teslamate-org/teslamate](https://github.com/teslamate-org/teslamate) — 620.9: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [tamnd/kage](https://github.com/tamnd/kage) — 596.9: AI agent / workflow
- [jwasham/coding-interview-university](https://github.com/jwasham/coding-interview-university) — 594: AI agent / workflow
- [krahets/hello-algo](https://github.com/krahets/hello-algo) — 594: AI agent / workflow
- [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) — 567.6: AI agent / workflow

## Brus / ignorera

- [music-assistant/server](https://github.com/music-assistant/server) — 279.4

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
