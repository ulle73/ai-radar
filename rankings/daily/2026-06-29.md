# AI Radar Totalranking – 2026-06-29

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-29
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Row 11: invalid score: 1580.3; Row 12: invalid score: 1563.01; Row 13: invalid score: 1502.96; Row 14: invalid score: 1126.45; Row 19: invalid score: 10892.55; Row 20: invalid score: 8863.63; Row 21: invalid score: 6955.29; Row 22: invalid score: 4664.69

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — "Vibe-Trading: Your Personal Trading Agent" |
| 2 | 940 | [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A list of SaaS, PaaS and IaaS offerings that have free tiers of interest to devops and infradev |
| 3 | 940 | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — World's first open-source, agentic video production system. 12 pipelines, 52 tools, 500+ agent skills. Turn your AI coding assistant into a full video production studio. |
| 4 | 940 | [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Clone any website with one command using AI coding agents |
| 5 | 877.9 | [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — LLM 驱动的多市场股票智能分析系统：多源行情、实时新闻、决策看板与自动推送，支持零成本定时运行。 LLM-powered multi-market stock analysis system with multi-source market data, real-time news, decision dashboard, automated notifications, and cost-free scheduled runs. |
| 6 | 856 | [opendatalab/MinerU](https://github.com/opendatalab/MinerU) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Transforms complex documents like PDFs and Office docs into LLM-ready markdown/JSON for your Agentic workflows. |
| 7 | 848.3 | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — High-performance code intelligence MCP server. Indexes codebases into a persistent knowledge graph — average repo in milliseconds. 158 languages, sub-ms queries, 99% fewer tokens. Single static binary, zero dependencies. |
| 8 | 831.2 | [stablyai/orca](https://github.com/stablyai/orca) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Orca is the ADE for working with a fleet of parallel agents. Run any coding agent with your own subscription. Available on desktop and mobile. |
| 9 | 776.6 | [xbtlin/ai-berkshire](https://github.com/xbtlin/ai-berkshire) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — AI 时代的伯克希尔：基于 Claude Code / Codex 的价值投资研究框架。巴菲特·芒格·段永平·李录四大师方法论 + 多Agent并行研究。\| AI-era Berkshire: a value investing research framework built for Claude Code / Codex. 4 masters' methodologies + multi-agent adversarial analysis. |
| 10 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 11 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 12 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 13 | 744.9 | [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A feed-forward 3D foundation model for reconstructing scenes from streaming data |
| 14 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 15 | 675.1 | [commaai/openpilot](https://github.com/commaai/openpilot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — openpilot is an operating system for robotics. Currently, it upgrades the driver assistance system on 300+ supported cars. |
| 16 | 675 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Persistent Context Across Sessions for Every Agent – Captures everything your agent does during sessions, compresses it with AI, and injects relevant context back into future sessions. Works with Claude Code, OpenClaw, Codex, Gemini, Hermes, Copilot, OpenCode + More |
| 17 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 18 | 650.6 | [simplex-chat/simplex-chat](https://github.com/simplex-chat/simplex-chat) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — SimpleX - the first messaging network operating without user identifiers of any kind - 100% private by design! iOS, Android and desktop apps 📱! |
| 19 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 20 | 639.1 | [bozhouDev/codex-orange-book](https://github.com/bozhouDev/codex-orange-book) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Codex 橙皮书：从安装到实战案例的全链路 Codex 使用指南（非官方开源，含可下载 PDF） |
| 21 | 622.9 | [cupy/cupy](https://github.com/cupy/cupy) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — NumPy & SciPy for GPU |
| 22 | 617.2 | [interviewstreet/hiring-agent](https://github.com/interviewstreet/hiring-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — AI agent to evaluate and score resumes. |
| 23 | 590.6 | [kunchenguid/no-mistakes](https://github.com/kunchenguid/no-mistakes) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — git push no-mistakes |
| 24 | 579.6 | [palmier-io/palmier-pro](https://github.com/palmier-io/palmier-pro) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — macOS video editor built for AI |
| 25 | 530.3 | [altic-dev/FluidVoice](https://github.com/altic-dev/FluidVoice) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — FluidVoice - Fastest macOS Offline Dictation app - Voice to Text fully Local. One ⭐ takes us a long way :)) |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 389.6 | [deepseek-ai/DeepSpec](https://github.com/deepseek-ai/DeepSpec) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — DeepSpec: a full-stack codebase for training and evaluating speculative decoding algorithms |
| 28 | 343.1 | [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — A format specification for describing a visual identity to coding agents. DESIGN.md gives agents a persistent, structured understanding of a design system. |
| 29 | 334 | [ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — An agent-managed museum exhibit, built in Rust with Gajae-Code / LazyCodex — developed and maintained with no human intervention. |
| 30 | 285.8 | [bikini/exploitarium](https://github.com/bikini/exploitarium) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — A single archive of public exploit PoCs and vulnerability research writeups. At the time I post these, none have been reported. Feel free to report them yourself and take credit for the CVE if handed out lulz. Please do not abuse these. I do this so to allure people into the field, and I've always found this is the most efficient way. |

## Toppkandidater att agera på

- [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) — 940: AI agent / workflow
- [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev) — 940: AI agent / workflow
- [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) — 940: AI agent / workflow
- [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) — 940: AI agent / workflow
- [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) — 877.9: AI agent / workflow

## Bra att spara för senare

- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [commaai/openpilot](https://github.com/commaai/openpilot) — 675.1: AI agent / workflow
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) — 675: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [simplex-chat/simplex-chat](https://github.com/simplex-chat/simplex-chat) — 650.6: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [bozhouDev/codex-orange-book](https://github.com/bozhouDev/codex-orange-book) — 639.1: AI agent / workflow
- [cupy/cupy](https://github.com/cupy/cupy) — 622.9: AI agent / workflow
- [interviewstreet/hiring-agent](https://github.com/interviewstreet/hiring-agent) — 617.2: AI agent / workflow
- [kunchenguid/no-mistakes](https://github.com/kunchenguid/no-mistakes) — 590.6: AI agent / workflow

## Brus / ignorera

- [bikini/exploitarium](https://github.com/bikini/exploitarium) — 285.8

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
