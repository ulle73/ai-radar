# AI Radar Totalranking – 2026-06-14

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-14
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 1; Row 1: repo not allowed: voltagent/awesome-design-md; Missing repo from ranking: obra/superpowers; Missing repo from ranking: addyosmani/agent-skills; Missing repo from ranking: apple/container; Missing repo from ranking: microsoft/powertoys; Missing repo from ranking: iptv-org/iptv; Missing repo from ranking: andrewyng/aisuite

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — AI agent skill that researches any topic across Reddit, X, YouTube, HN, Polymarket, and the web - then synthesizes a grounded summary |
| 2 | 925.5 | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — PM Skills Marketplace: 100+ agentic skills, commands, and plugins — from discovery to strategy, execution, launch, and growth. |
| 3 | 865.4 | [kenn-io/agentsview](https://github.com/kenn-io/agentsview) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Local-first session intelligence and analytics for coding agents, supporting Claude Code, Codex, and more than 20 other agents. Also: 100x faster replacement for ccusage! |
| 4 | 838.2 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees. |
| 5 | 786.8 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Production-grade engineering skills for AI coding agents. |
| 6 | 785.3 | [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Security scanner for AI agent skills. Detect vulnerabilities, malicious patterns, and security risks. |
| 7 | 760 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 8 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 9 | 756.9 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Taste-Skill - gives your AI good taste. stops the AI from generating boring, generic slop |
| 10 | 753.9 | [chopratejas/headroom](https://github.com/chopratejas/headroom) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Compress tool outputs, logs, files, and RAG chunks before they reach the LLM. 60-95% fewer tokens, same answers. Library, proxy, MCP server. |
| 11 | 750.1 | [andrewyng/aisuite](https://github.com/andrewyng/aisuite) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Simple, unified interface to multiple Generative AI providers |
| 12 | 740.6 | [openai/plugins](https://github.com/openai/plugins) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — OpenAI Plugins |
| 13 | 704 | [iptv-org/iptv](https://github.com/iptv-org/iptv) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Collection of publicly available IPTV channels from all over the world |
| 14 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 16 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 17 | 617.3 | [lenucksi/aur-malware-check](https://github.com/lenucksi/aur-malware-check) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Detection tools for the June 2026 atomic-lockfile AUR supply-chain attack. Consolidated from community Gists. |
| 18 | 579.3 | [LMCache/LMCache](https://github.com/LMCache/LMCache) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — LMCache: Supercharge Your LLM with the Fastest KV Cache Layer |
| 19 | 554 | [microsoft/markitdown](https://github.com/microsoft/markitdown) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — Python tool for converting files and office documents to Markdown. |
| 20 | 553.3 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote. |
| 21 | 552.9 | [chatwoot/chatwoot](https://github.com/chatwoot/chatwoot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Open-source live-chat, email support, omni-channel desk. An alternative to Intercom, Zendesk, Salesforce Service Cloud etc. 🔥💬 |
| 22 | 545.9 | [apple/container](https://github.com/apple/container) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A tool for creating and running Linux containers using lightweight virtual machines on a Mac. It is written in Swift, and optimized for Apple silicon. |
| 23 | 520.7 | [XiaomiMiMo/MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Topics: - |
| 24 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 25 | 433.8 | [shadcn/improve](https://github.com/shadcn/improve) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Use your most capable model to audit your codebase and write plans for cheaper models to execute. |
| 26 | 426 | [microsoft/PowerToys](https://github.com/microsoft/PowerToys) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — Microsoft PowerToys is a collection of utilities that supercharge productivity and customization on Windows |
| 27 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 28 | 334 | [ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — An agent-managed museum exhibit, built in Rust with Gajae-Code / LazyCodex — developed and maintained with no human intervention. |
| 29 | 318.3 | [music-assistant/server](https://github.com/music-assistant/server) | Documents / wedding planner | TRUE_TRENDING_DAILY | Bevaka | TRUE_TRENDING_DAILY — Music Assistant is a free, opensource Media library manager that connects to your streaming services and a wide range of connected speakers. The server is the beating heart, the core of Music Assistant and must run on an always-on device like a Raspberry Pi, a NAS or an Intel NUC or alike. |
| 30 | 258.4 | [SkyBlue997/enableMacosAI](https://github.com/SkyBlue997/enableMacosAI) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Ignorera | EXTRA_SEARCH_API — 国行 Mac 一键开启完整 Apple 智能(端侧 + Private Cloud Compute 云端)· macOS 27 / Apple Silicon |

## Toppkandidater att agera på

- [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) — 940: AI agent / workflow
- [phuryn/pm-skills](https://github.com/phuryn/pm-skills) — 925.5: AI agent / workflow
- [kenn-io/agentsview](https://github.com/kenn-io/agentsview) — 865.4: AI agent / workflow
- [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) — 838.2: AI agent / workflow
- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — 786.8: AI agent / workflow

## Bra att spara för senare

- [iptv-org/iptv](https://github.com/iptv-org/iptv) — 704: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [lenucksi/aur-malware-check](https://github.com/lenucksi/aur-malware-check) — 617.3: AI agent / workflow
- [LMCache/LMCache](https://github.com/LMCache/LMCache) — 579.3: AI agent / workflow
- [microsoft/markitdown](https://github.com/microsoft/markitdown) — 554: Web / e-commerce / FAIV
- [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) — 553.3: AI agent / workflow
- [chatwoot/chatwoot](https://github.com/chatwoot/chatwoot) — 552.9: AI agent / workflow
- [apple/container](https://github.com/apple/container) — 545.9: AI agent / workflow

## Brus / ignorera

- [SkyBlue997/enableMacosAI](https://github.com/SkyBlue997/enableMacosAI) — 258.4

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
