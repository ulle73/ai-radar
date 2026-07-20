# AI Radar Totalranking – 2026-07-20

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-20
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Contains reasoning/prompt leakage; Expected 30 ranking rows, got 0; Missing repo from ranking: rohitg00/ai-engineering-from-scratch; Missing repo from ranking: jamiepine/voicebox; Missing repo from ranking: tirth8205/code-review-graph; Missing repo from ranking: microsoft/terminal; Missing repo from ranking: astrbotdevs/astrbot; Missing repo from ranking: kvcache-ai/ktransformers

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 《深入理解 AI Agent：设计原理与工程实践》（李博杰 著）开源主仓库：全书正文、编译版 PDF 与按章配套代码 |
| 2 | 940 | [KnockOutEZ/wigolo](https://github.com/KnockOutEZ/wigolo) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The go-to web for your AI coding agent — local-first search, fetch, crawl & research over MCP. No API keys, no cloud, $0/query. Public beta. |
| 3 | 940 | [PostHog/posthog](https://github.com/PostHog/posthog) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — :hedgehog: PostHog is the leading platform for building self-driving products. Our developer tools – AI observability, analytics, session replay, flags, experiments, error tracking, logs, and more – capture all the context agents need to diagnose problems, uncover opportunities, and ship fixes. Steer it all from Slack, web, desktop, or the MCP. |
| 4 | 940 | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — "Vibe-Trading: Your Personal Trading Agent" |
| 5 | 940 | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 100+ AI Agent & RAG apps you can actually run — clone, customize, ship. |
| 6 | 934.1 | [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — OfficeCLI is the first and best Office suite purpose-built for AI agents to read, edit, and automate Word, Excel, and PowerPoint files. Free, open-source, single binary, no Office installation required. |
| 7 | 914.9 | [jamiepine/voicebox](https://github.com/jamiepine/voicebox) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The open-source AI voice studio. Clone, dictate, create. |
| 8 | 876.7 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Local-first code intelligence graph for MCP and CLI. Builds a persistent map of your codebase so AI coding tools read only what matters, with benchmarked context reductions on reviews and large-repo workflows. |
| 9 | 874.3 | [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — DeepTutor: Lifelong Personalized Tutoring. https://deeptutor.info/. |
| 10 | 810.4 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Learn it. Build it. Ship it for others. |
| 11 | 804 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .agents directory. |
| 12 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 13 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 14 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 16 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 17 | 654.3 | [xai-org/grok-build](https://github.com/xai-org/grok-build) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — SpaceXAI's coding agent harness and TUI. Fullscreen, mouse interactive, extensible. |
| 18 | 643.9 | [AstrBotDevs/AstrBot](https://github.com/AstrBotDevs/AstrBot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — AI Agent Assistant & development framework that integrates lots of IM platforms, LLMs, plugins and AI feature, and can be your openclaw alternative. ✨ |
| 19 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 20 | 618.3 | [kangarooking/cangjie-skill](https://github.com/kangarooking/cangjie-skill) | AI agent / workflow | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — 把书、长视频、播客等高价值内容蒸馏成可执行的 Agent Skills |
| 21 | 552.3 | [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — The open-source CapCut alternative |
| 22 | 513.7 | [kvcache-ai/ktransformers](https://github.com/kvcache-ai/ktransformers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A Flexible Framework for Experiencing Heterogeneous LLM Inference/Fine-tune Optimizations |
| 23 | 508 | [microsoft/terminal](https://github.com/microsoft/terminal) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — The new Windows Terminal and the original Windows console host, all in the same place! |
| 24 | 499.8 | [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Anti-AI-slop design skill for Claude Code, Cursor, and Codex. |
| 25 | 470 | [openai/codex](https://github.com/openai/codex) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Lightweight coding agent that runs in your terminal |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 422.8 | [lopopolo/harness-engineering](https://github.com/lopopolo/harness-engineering) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — 🐎 Ryan Lopopolo’s anthology, field guide, and agent context bundle for harness engineering |
| 28 | 410.3 | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Skills for Design Engineers |
| 29 | 357.7 | [andrewrabert/jellium-desktop](https://github.com/andrewrabert/jellium-desktop) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — An unofficial desktop client for Jellyfin |
| 30 | 314.3 | [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Codex Dream Skin |

## Toppkandidater att agera på

- [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) — 940: AI agent / workflow
- [KnockOutEZ/wigolo](https://github.com/KnockOutEZ/wigolo) — 940: AI agent / workflow
- [PostHog/posthog](https://github.com/PostHog/posthog) — 940: AI agent / workflow
- [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) — 940: AI agent / workflow
- [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) — 940: AI agent / workflow

## Bra att spara för senare

- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [xai-org/grok-build](https://github.com/xai-org/grok-build) — 654.3: AI agent / workflow
- [AstrBotDevs/AstrBot](https://github.com/AstrBotDevs/AstrBot) — 643.9: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [kangarooking/cangjie-skill](https://github.com/kangarooking/cangjie-skill) — 618.3: AI agent / workflow
- [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) — 552.3: AI agent / workflow
- [kvcache-ai/ktransformers](https://github.com/kvcache-ai/ktransformers) — 513.7: AI agent / workflow
- [microsoft/terminal](https://github.com/microsoft/terminal) — 508: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
