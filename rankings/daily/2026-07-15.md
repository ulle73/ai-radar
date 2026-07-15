# AI Radar Totalranking – 2026-07-15

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-15
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 2; Row 1: repo not allowed: voltagent/awesome-design-md; Row 2: repo not allowed: voltagent/awesome-design-md; Missing repo from ranking: mattpocock/skills; Missing repo from ranking: hkuds/vibe-trading; Missing repo from ranking: opencut-app/opencut; Missing repo from ranking: shubhamsaboo/awesome-llm-apps; Missing repo from ranking: hasaneyldrm/exercises-dataset

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — "Vibe-Trading: Your Personal Trading Agent" |
| 2 | 940 | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 100+ AI Agent & RAG apps you can actually run — clone, customize, ship. |
| 3 | 940 | [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The job search that runs on your machine. AI job application framework built on Claude Code: evaluate postings, tailor CVs, write cover letters, prep interviews. Fork it and own it. |
| 4 | 935.2 | [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — OfficeCLI is the first and best Office suite purpose-built for AI agents to read, edit, and automate Word, Excel, and PowerPoint files. Free, open-source, single binary, no Office installation required. |
| 5 | 902.1 | [TencentCloud/CubeSandbox](https://github.com/TencentCloud/CubeSandbox) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Instant, Concurrent, Secure & Lightweight Sandbox for AI Agents. |
| 6 | 878 | [stablyai/orca](https://github.com/stablyai/orca) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Orca is the ADE for working with a fleet of parallel agents. Run any coding agent with your own subscription. Available on desktop and mobile. |
| 7 | 844 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Skills for Real Engineers. Straight from my .claude directory. |
| 8 | 793.4 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free AI gateway: one endpoint, 231+ providers (50+ free), connect Claude Code, Codex, Cursor, Cline & Copilot to FREE Claude/GPT/Gemini. RTK+Caveman stacked compression saves 15-95% tokens, smart auto-fallback, MCP/A2A, multimodal APIs, Desktop/PWA. |
| 9 | 788.8 | [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — This is MCP server for Claude that gives it terminal control, file system search and diff file editing capabilities |
| 10 | 776 | [AIEraDev/Clypra](https://github.com/AIEraDev/Clypra) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A modern video editor built with Tauri, React, and TypeScript. Focus on building free capabilities of premium capcut functionalities |
| 11 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 12 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 13 | 760 | [mereyabdenbekuly-ctrl/clodex-ide](https://github.com/mereyabdenbekuly-ctrl/clodex-ide) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Local-first, zero-trust agentic IDE for verifiable autonomous software development. |
| 14 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 723.1 | [virattt/ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An AI Hedge Fund Team |
| 16 | 714.5 | [penpot/penpot](https://github.com/penpot/penpot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Penpot: The open-source design platform for Product teams that need scalable collaboration. |
| 17 | 707.9 | [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — 1,324-exercise fitness dataset — animation GIFs, 180×180 thumbnails, muscle-group & equipment data, and step-by-step instructions in 6 languages. The exercise data layer behind the LogPress app. |
| 18 | 705 | [bradautomates/claude-video](https://github.com/bradautomates/claude-video) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Give Claude the ability to watch any video. /watch downloads, extracts frames, transcribes, hands it all to Claude. |
| 19 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 20 | 672.4 | [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Use Codex from Claude Code to review code or delegate tasks. |
| 21 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 22 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 23 | 625.1 | [ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — agent multiplexer that lives in your terminal. |
| 24 | 591.8 | [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — The open-source CapCut alternative |
| 25 | 590 | [Raphire/Win11Debloat](https://github.com/Raphire/Win11Debloat) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A simple, lightweight PowerShell script that allows you to remove pre-installed apps, disable telemetry, as well as perform various other changes to declutter and customize your Windows experience. Win11Debloat works for both Windows 10 and Windows 11. |
| 26 | 535.2 | [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Anti-AI-slop design skill for Claude Code, Cursor, and Codex. |
| 27 | 459.6 | [abseil/abseil-cpp](https://github.com/abseil/abseil-cpp) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Abseil Common Libraries (C++) |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 447.5 | [littledivy/mimic](https://github.com/littledivy/mimic) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Intercept any app, then call it from Python like a library |
| 30 | 213.6 | [x4gKing/Marzban-Panel](https://github.com/x4gKing/Marzban-Panel) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Ignorera | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) — 940: AI agent / workflow
- [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) — 940: AI agent / workflow
- [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) — 940: AI agent / workflow
- [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) — 935.2: AI agent / workflow
- [TencentCloud/CubeSandbox](https://github.com/TencentCloud/CubeSandbox) — 902.1: AI agent / workflow

## Bra att spara för senare

- [penpot/penpot](https://github.com/penpot/penpot) — 714.5: AI agent / workflow
- [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) — 707.9: AI agent / workflow
- [bradautomates/claude-video](https://github.com/bradautomates/claude-video) — 705: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) — 672.4: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) — 625.1: AI agent / workflow
- [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) — 591.8: AI agent / workflow
- [Raphire/Win11Debloat](https://github.com/Raphire/Win11Debloat) — 590: AI agent / workflow

## Brus / ignorera

- [x4gKing/Marzban-Panel](https://github.com/x4gKing/Marzban-Panel) — 213.6

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
