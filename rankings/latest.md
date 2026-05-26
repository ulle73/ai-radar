# AI Radar Totalranking – 2026-05-26

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-26
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: affaan-m/ecc; Missing repo from ranking: multica-ai/andrej-karpathy-skills; Missing repo from ranking: lum1104/understand-anything; Missing repo from ranking: rohitg00/ai-engineering-from-scratch; Missing repo from ranking: colbymchenry/codegraph; Missing repo from ranking: manaflow-ai/cmux; Missing repo from ranking: anthropics/knowledge-work-plugins

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 2 | 940 | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Graphs that teach > graphs that impress. Turn any code into an interactive knowledge graph you can explore, search, and ask questions about. Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, and more. |
| 3 | 940 | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open source repository of plugins primarily intended for knowledge workers to use in Claude Cowork |
| 4 | 940 | [Fincept-Corporation/FinceptTerminal](https://github.com/Fincept-Corporation/FinceptTerminal) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — FinceptTerminal is a modern finance application offering advanced market analytics, investment research, and economic data tools, designed for interactive exploration and data-driven decision-making in a user-friendly environment. |
| 5 | 940 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 6 | 920.7 | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Academic Research Skills for Claude Code: research → write → review → revise → finalize |
| 7 | 919.8 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Pre-indexed code knowledge graph for Claude Code, Codex, Cursor, OpenCode, and Hermes Agent — fewer tokens, fewer tool calls, 100% local |
| 8 | 906.2 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 9 | 888.3 | [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Lightning-Fast, On-Device, Multilingual TTS — running natively via ONNX. |
| 10 | 882.5 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 11 | 857.5 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 12 | 805.9 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Learn it. Build it. Ship it for others. |
| 13 | 795.6 | [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 754 structured cybersecurity skills for AI agents · Mapped to 5 frameworks: MITRE ATT&CK, NIST CSF 2.0, MITRE ATLAS, D3FEND & NIST AI RMF · agentskills.io standard · Works with Claude Code, GitHub Copilot, Codex CLI, Cursor, Gemini CLI & 20+ platforms · 26 security domains · Apache 2.0 |
| 14 | 792.1 | [manaflow-ai/cmux](https://github.com/manaflow-ai/cmux) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Ghostty-based macOS terminal with vertical tabs and notifications for AI coding agents |
| 15 | 760 | [nexu-io/open-design](https://github.com/nexu-io/open-design) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — 🎨 Local-first, open-source Claude Design alternative. ⚡ 19 Skills · ✨ 71 brand-grade Design Systems 🖼 Generate web · desktop · mobile prototypes · slides · images · videos · HyperFrames 📦 Sandboxed preview · HTML/PDF/PPTX/MP4 export 🤖 Runs on Claude Code / Codex / Cursor / Gemini / OpenCode / Qwen / Copilot / Hermes / Kimi CLI. |
| 16 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 17 | 760 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows |
| 18 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 19 | 746 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent that grows with you |
| 20 | 712.1 | [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — ⌥ AI Coding agent for the terminal — hash-anchored edits, optimized tool harness, LSP, Python, browser, subagents, and more |
| 21 | 672.6 | [paperless-ngx/paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A community-supported supercharged document management system: scan, index and archive all your documents |
| 22 | 664 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 23 | 636 | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A single CLAUDE.md file to improve Claude Code behavior, derived from Andrej Karpathy's observations on LLM coding pitfalls. |
| 24 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 25 | 557.9 | [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Read-only developer endpoint scanner for on-disk package, extension, and developer-tool metadata, built to check exposure to known software supply-chain compromises. |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 423.2 | [joeseesun/wechat-radar](https://github.com/joeseesun/wechat-radar) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — 微信聊天情报看板：聚合群聊信号、话题、链接和趋势 |
| 28 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 29 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 30 | 346.9 | [thananon/9arm-skills](https://github.com/thananon/9arm-skills) | AI agent / workflow | Content / Socials / marketing | Bevaka | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [affaan-m/ECC](https://github.com/affaan-m/ECC) — 940: AI agent / workflow
- [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) — 940: AI agent / workflow
- [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) — 940: AI agent / workflow
- [Fincept-Corporation/FinceptTerminal](https://github.com/Fincept-Corporation/FinceptTerminal) — 940: AI agent / workflow
- [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) — 940: AI agent / workflow

## Bra att spara för senare

- [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) — 712.1: AI agent / workflow
- [paperless-ngx/paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) — 672.6: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 664: AI agent / workflow
- [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) — 636: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) — 557.9: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
