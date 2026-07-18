# AI Radar Totalranking – 2026-07-18

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-18
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: codecrafters-io/build-your-own-x; Missing repo from ranking: nutlope/hallmark; Missing repo from ranking: tirth8205/code-review-graph; Missing repo from ranking: openinterpreter/openinterpreter; Missing repo from ranking: henryndubuaku/maths-cs-ai-compendium; Missing repo from ranking: anthropics/cwc-workshops; Missing repo from ranking: protocolbuffers/protobuf

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [PostHog/posthog](https://github.com/PostHog/posthog) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — :hedgehog: PostHog is the leading platform for building self-driving products. Our developer tools – AI observability, analytics, session replay, flags, experiments, error tracking, logs, and more – capture all the context agents need to diagnose problems, uncover opportunities, and ship fixes. Steer it all from Slack, web, desktop, or the MCP. |
| 2 | 940 | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 100+ AI Agent & RAG apps you can actually run — clone, customize, ship. |
| 3 | 933.9 | [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — OfficeCLI is the first and best Office suite purpose-built for AI agents to read, edit, and automate Word, Excel, and PowerPoint files. Free, open-source, single binary, no Office installation required. |
| 4 | 927.5 | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — "Vibe-Trading: Your Personal Trading Agent" |
| 5 | 878.6 | [stablyai/orca](https://github.com/stablyai/orca) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Orca is the ADE for working with a fleet of parallel agents. Run any coding agent with your own subscription. Available on desktop and mobile. |
| 6 | 876.2 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Local-first code intelligence graph for MCP and CLI. Builds a persistent map of your codebase so AI coding tools read only what matters, with benchmarked context reductions on reviews and large-repo workflows. |
| 7 | 821.4 | [PrismML-Eng/Bonsai-demo](https://github.com/PrismML-Eng/Bonsai-demo) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Bonsai Demo |
| 8 | 789 | [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — This is MCP server for Claude that gives it terminal control, file system search and diff file editing capabilities |
| 9 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 10 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 11 | 757.5 | [openinterpreter/openinterpreter](https://github.com/openinterpreter/openinterpreter) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A coding agent for open models like Kimi K3 |
| 12 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 13 | 743.7 | [oven-sh/bun](https://github.com/oven-sh/bun) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one |
| 14 | 737.5 | [docusealco/docuseal](https://github.com/docusealco/docuseal) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open source DocuSign alternative. Create, fill, and sign digital documents ✍️ |
| 15 | 728 | [codecrafters-io/build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Master programming by recreating your favorite technologies from scratch. |
| 16 | 715.6 | [HenryNdubuaku/maths-cs-ai-compendium](https://github.com/HenryNdubuaku/maths-cs-ai-compendium) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Become a cracked AI/ML Research Engineer |
| 17 | 712.4 | [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A library of Agent Skills designed to work with the Stitch MCP server. Each skill follows the Agent Skills open standard, for compatibility with coding agents such as Antigravity, Gemini CLI, Claude Code, Cursor. |
| 18 | 704 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Skills for Real Engineers. Straight from my .agents directory. |
| 19 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 20 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 21 | 653.2 | [xai-org/grok-build](https://github.com/xai-org/grok-build) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — SpaceXAI's coding agent harness and TUI. Fullscreen, mouse interactive, extensible. |
| 22 | 650.9 | [anthropics/cwc-workshops](https://github.com/anthropics/cwc-workshops) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Topics: - |
| 23 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 24 | 552.2 | [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — The open-source CapCut alternative |
| 25 | 539.2 | [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Anti-AI-slop design skill for Claude Code, Cursor, and Codex. |
| 26 | 467.4 | [tandpfun/wardrobe](https://github.com/tandpfun/wardrobe) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Your clothes, extracted and organized with gpt-image. |
| 27 | 459.6 | [abseil/abseil-cpp](https://github.com/abseil/abseil-cpp) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Abseil Common Libraries (C++) |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 424 | [protocolbuffers/protobuf](https://github.com/protocolbuffers/protobuf) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — Protocol Buffers - Google's data interchange format |
| 30 | 313.3 | [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Codex Dream Skin |

## Toppkandidater att agera på

- [PostHog/posthog](https://github.com/PostHog/posthog) — 940: AI agent / workflow
- [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) — 940: AI agent / workflow
- [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) — 933.9: AI agent / workflow
- [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) — 927.5: AI agent / workflow
- [stablyai/orca](https://github.com/stablyai/orca) — 878.6: AI agent / workflow

## Bra att spara för senare

- [HenryNdubuaku/maths-cs-ai-compendium](https://github.com/HenryNdubuaku/maths-cs-ai-compendium) — 715.6: AI agent / workflow
- [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) — 712.4: AI agent / workflow
- [mattpocock/skills](https://github.com/mattpocock/skills) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [xai-org/grok-build](https://github.com/xai-org/grok-build) — 653.2: AI agent / workflow
- [anthropics/cwc-workshops](https://github.com/anthropics/cwc-workshops) — 650.9: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) — 552.2: AI agent / workflow
- [Nutlope/hallmark](https://github.com/Nutlope/hallmark) — 539.2: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
