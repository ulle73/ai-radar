# AI Radar Totalranking – 2026-05-25

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-25
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: multica-ai/andrej-karpathy-skills; Missing repo from ranking: lum1104/understand-anything; Missing repo from ranking: alishahryar1/free-claude-code; Missing repo from ranking: multica-ai/multica; Missing repo from ranking: rohitg00/ai-engineering-from-scratch; Missing repo from ranking: earendil-works/pi; Missing repo from ranking: colbymchenry/codegraph

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Graphs that teach > graphs that impress. Turn any code into an interactive knowledge graph you can explore, search, and ask questions about. Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, and more. |
| 2 | 940 | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open source repository of plugins primarily intended for knowledge workers to use in Claude Cowork |
| 3 | 920.5 | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Academic Research Skills for Claude Code: research → write → review → revise → finalize |
| 4 | 919.1 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Pre-indexed code knowledge graph for Claude Code, Codex, Cursor, OpenCode, and Hermes Agent — fewer tokens, fewer tool calls, 100% local |
| 5 | 888.2 | [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Lightning-Fast, On-Device, Multilingual TTS — running natively via ONNX. |
| 6 | 882.4 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 7 | 864.1 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 8 | 857.4 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 9 | 837.2 | [multica-ai/multica](https://github.com/multica-ai/multica) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The open-source managed agents platform. Turn coding agents into real teammates — assign tasks, track progress, compound skills. |
| 10 | 805.1 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Learn it. Build it. Ship it for others. |
| 11 | 793.4 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 12 | 760 | [nexu-io/open-design](https://github.com/nexu-io/open-design) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — 🎨 Local-first, open-source Claude Design alternative. ⚡ 19 Skills · ✨ 71 brand-grade Design Systems 🖼 Generate web · desktop · mobile prototypes · slides · images · videos · HyperFrames 📦 Sandboxed preview · HTML/PDF/PPTX/MP4 export 🤖 Runs on Claude Code / Codex / Cursor / Gemini / OpenCode / Qwen / Copilot / Hermes / Kimi CLI. |
| 13 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 14 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 15 | 760 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows |
| 16 | 746 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent that grows with you |
| 17 | 745.8 | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Kronos: A Foundation Model for the Language of Financial Markets |
| 18 | 716.3 | [earendil-works/pi](https://github.com/earendil-works/pi) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — AI agent toolkit: coding agent CLI, unified LLM API, TUI & web UI libraries, Slack bot, vLLM pods |
| 19 | 711.9 | [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — ⌥ AI Coding agent for the terminal — hash-anchored edits, optimized tool harness, LSP, Python, browser, subagents, and more |
| 20 | 670.5 | [Alishahryar1/free-claude-code](https://github.com/Alishahryar1/free-claude-code) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Use claude-code for free in the terminal, VSCode extension or discord like OpenClaw (voice supported) |
| 21 | 670.1 | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Official, Anthropic-managed directory of high quality Claude Code Plugins. |
| 22 | 664 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 23 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 24 | 636 | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A single CLAUDE.md file to improve Claude Code behavior, derived from Andrej Karpathy's observations on LLM coding pitfalls. |
| 25 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 26 | 556.9 | [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Read-only developer endpoint scanner for on-disk package, extension, and developer-tool metadata, built to check exposure to known software supply-chain compromises. |
| 27 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 28 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 29 | 346.3 | [thananon/9arm-skills](https://github.com/thananon/9arm-skills) | AI agent / workflow | Content / Socials / marketing | Bevaka | EXTRA_SEARCH_API — Topics: - |
| 30 | 221.3 | [FoundZiGu/GuJumpgate](https://github.com/FoundZiGu/GuJumpgate) | Web / e-commerce / FAIV | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) — 940: AI agent / workflow
- [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) — 940: AI agent / workflow
- [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) — 920.5: AI agent / workflow
- [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) — 919.1: AI agent / workflow
- [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) — 888.2: AI agent / workflow

## Bra att spara för senare

- [earendil-works/pi](https://github.com/earendil-works/pi) — 716.3: AI agent / workflow
- [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) — 711.9: AI agent / workflow
- [Alishahryar1/free-claude-code](https://github.com/Alishahryar1/free-claude-code) — 670.5: AI agent / workflow
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) — 670.1: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 664: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) — 636: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) — 556.9: AI agent / workflow

## Brus / ignorera

- [FoundZiGu/GuJumpgate](https://github.com/FoundZiGu/GuJumpgate) — 221.3

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
