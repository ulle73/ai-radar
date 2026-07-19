# AI Radar Totalranking – 2026-07-19

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-19
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Row 22: medium/high score cannot be Ignorera; Row 30: medium/high score cannot be Ignorera; Too many Spara för senare actions: 21

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [PostHog/posthog](https://github.com/PostHog/posthog) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — :hedgehog: PostHog is the leading platform for building self-driving products. Our developer tools – AI observability, analytics, session replay, flags, experiments, error tracking, logs, and more – capture all the context agents need to diagnose problems, uncover opportunities, and ship fixes. Steer it all from Slack, web, desktop, or the MCP. |
| 2 | 940 | [KnockOutEZ/wigolo](https://github.com/KnockOutEZ/wigolo) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The go-to web for your AI coding agent — local-first search, fetch, crawl & research over MCP. No API keys, no cloud, $0/query. Public beta. |
| 3 | 940 | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — "Vibe-Trading: Your Personal Trading Agent" |
| 4 | 940 | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 100+ AI Agent & RAG apps you can actually run — clone, customize, ship. |
| 5 | 934 | [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — OfficeCLI is the first and best Office suite purpose-built for AI agents to read, edit, and automate Word, Excel, and PowerPoint files. Free, open-source, single binary, no Office installation required. |
| 6 | 876.3 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Local-first code intelligence graph for MCP and CLI. Builds a persistent map of your codebase so AI coding tools read only what matters, with benchmarked context reductions on reviews and large-repo workflows. |
| 7 | 874.2 | [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — DeepTutor: Lifelong Personalized Tutoring. https://deeptutor.info/. |
| 8 | 810.3 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Learn it. Build it. Ship it for others. |
| 9 | 804 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .agents directory. |
| 10 | 789 | [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — This is MCP server for Claude that gives it terminal control, file system search and diff file editing capabilities |
| 11 | 777.7 | [elder-plinius/G0DM0D3](https://github.com/elder-plinius/G0DM0D3) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — LIBERATED AI CHAT |
| 12 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 13 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 14 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 728 | [codecrafters-io/build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Master programming by recreating your favorite technologies from scratch. |
| 16 | 705.6 | [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A feed-forward 3D foundation model for reconstructing scenes from streaming data |
| 17 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 18 | 683.2 | [lyogavin/airllm](https://github.com/lyogavin/airllm) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — AirLLM 70B inference with single 4GB GPU |
| 19 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 20 | 653.9 | [xai-org/grok-build](https://github.com/xai-org/grok-build) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — SpaceXAI's coding agent harness and TUI. Fullscreen, mouse interactive, extensible. |
| 21 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 22 | 617.9 | [kangarooking/cangjie-skill](https://github.com/kangarooking/cangjie-skill) | AI agent / workflow | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — 把书、长视频、播客等高价值内容蒸馏成可执行的 Agent Skills |
| 23 | 552.3 | [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — The open-source CapCut alternative |
| 24 | 525.6 | [apache/ossie](https://github.com/apache/ossie) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Apache Ossie, industry wide specification effort to standardize how we exchange semantic metadata across analytics, AI and BI platforms, providing a vendor neutral, single source of truth for semantic data |
| 25 | 499.6 | [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Anti-AI-slop design skill for Claude Code, Cursor, and Codex. |
| 26 | 470 | [openai/codex](https://github.com/openai/codex) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Lightweight coding agent that runs in your terminal |
| 27 | 468.4 | [tandpfun/wardrobe](https://github.com/tandpfun/wardrobe) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Your clothes, extracted and organized with gpt-image. |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 449.9 | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Skills for Design Engineers |
| 30 | 313.9 | [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Codex Dream Skin |

## Toppkandidater att agera på

- [PostHog/posthog](https://github.com/PostHog/posthog) — 940: AI agent / workflow
- [KnockOutEZ/wigolo](https://github.com/KnockOutEZ/wigolo) — 940: AI agent / workflow
- [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) — 940: AI agent / workflow
- [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) — 940: AI agent / workflow
- [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) — 934: AI agent / workflow

## Bra att spara för senare

- [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) — 705.6: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [lyogavin/airllm](https://github.com/lyogavin/airllm) — 683.2: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [xai-org/grok-build](https://github.com/xai-org/grok-build) — 653.9: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [kangarooking/cangjie-skill](https://github.com/kangarooking/cangjie-skill) — 617.9: AI agent / workflow
- [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) — 552.3: AI agent / workflow
- [apache/ossie](https://github.com/apache/ossie) — 525.6: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
