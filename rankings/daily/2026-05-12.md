# AI Radar Totalranking – 2026-05-12

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-12
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Contains reasoning/prompt leakage; Expected 30 ranking rows, got 0; Missing repo from ranking: automatic1111/stable-diffusion-webui; Missing repo from ranking: millionco/react-doctor; Missing repo from ranking: cloakhq/cloakbrowser; Missing repo from ranking: datawhalechina/easy-vibe; Missing repo from ranking: bytedance/ui-tars-desktop; Missing repo from ranking: decolua/9router

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [datawhalechina/easy-vibe](https://github.com/datawhalechina/easy-vibe) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 💻 vibe coding 2026 \| Your first modern Coding course for beginners to master step by step. |
| 2 | 940 | [anthropics/financial-services](https://github.com/anthropics/financial-services) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Topics: - |
| 3 | 940 | [ruvnet/ruflo](https://github.com/ruvnet/ruflo) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 🌊 The leading agent orchestration platform for Claude. Deploy intelligent multi-agent swarms, coordinate autonomous workflows, and build conversational AI systems. Features enterprise-grade architecture, self-learning swarm intelligence, RAG integration, and native Claude Code / Codex Integration |
| 4 | 940 | [LearningCircuit/local-deep-research](https://github.com/LearningCircuit/local-deep-research) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — ~95% on SimpleQA (e.g. Qwen3.6-27B on a 3090). Supports all local and cloud LLMs (llama.cpp, Ollama, Google, ...). 10+ search engines - arXiv, PubMed, your private documents. Everything Local & Encrypted. |
| 5 | 915.4 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 6 | 912.8 | [millionco/react-doctor](https://github.com/millionco/react-doctor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your agent writes bad React. This catches it |
| 7 | 879.7 | [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Coding agent for DeepSeek models that runs in your terminal |
| 8 | 821.1 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 9 | 811.3 | [bytedance/UI-TARS-desktop](https://github.com/bytedance/UI-TARS-desktop) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The Open-Source Multimodal AI Agent Stack: Connecting Cutting-Edge AI Models and Agent Infra |
| 10 | 760 | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 11 | 754.2 | [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — TradingAgents: Multi-Agents LLM Financial Trading Framework |
| 12 | 722.1 | [strukto-ai/mirage](https://github.com/strukto-ai/mirage) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A Unified Virtual Filesystem For AI Agents |
| 13 | 715 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 14 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 16 | 703 | [decolua/9router](https://github.com/decolua/9router) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Unlimited FREE AI coding. Connect Claude Code, Codex, Cursor, Cline, Copilot, Antigravity to FREE Claude/GPT/Gemini via 40+ providers. Auto-fallback, RTK -40% tokens, never hit limits. |
| 17 | 697 | [docusealco/docuseal](https://github.com/docusealco/docuseal) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Open source DocuSign alternative. Create, fill, and sign digital documents ✍️ |
| 18 | 678 | [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Stable Diffusion web UI |
| 19 | 677.7 | [virattt/dexter](https://github.com/virattt/dexter) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — An autonomous agent for deep financial research |
| 20 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 21 | 622.6 | [yikart/AiToEarn](https://github.com/yikart/AiToEarn) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Let's use AI to Earn! |
| 22 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 23 | 564.3 | [antirez/ds4](https://github.com/antirez/ds4) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — DeepSeek 4 Flash local inference engine for Metal |
| 24 | 538 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The open source coding agent. |
| 25 | 462 | [Lordog/dive-into-llms](https://github.com/Lordog/dive-into-llms) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — 《动手学大模型Dive into LLMs》系列编程实践教程 |
| 26 | 454.1 | [vercel-labs/zero-native](https://github.com/vercel-labs/zero-native) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Build desktop + mobile apps with Zig and web UI |
| 27 | 424.2 | [playcanvas/supersplat](https://github.com/playcanvas/supersplat) | Web / e-commerce / FAIV | Content / Socials / marketing | Bevaka | TRUE_TRENDING_DAILY — 3D Gaussian Splat Editor |
| 28 | 385 | [bwya77/vscode-dark-islands](https://github.com/bwya77/vscode-dark-islands) | Web / e-commerce / FAIV | Trading / finance / stock-signals | Bevaka | TRUE_TRENDING_WEEKLY — VSCode theme based off the easemate IDE and Jetbrains islands theme |
| 29 | 380.5 | [huangserva/3DCellForge](https://github.com/huangserva/3DCellForge) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — AI-powered interactive 3D cell generation and exploration studio. |
| 30 | 190.7 | [V4bel/dirtyfrag](https://github.com/V4bel/dirtyfrag) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [datawhalechina/easy-vibe](https://github.com/datawhalechina/easy-vibe) — 940: AI agent / workflow
- [anthropics/financial-services](https://github.com/anthropics/financial-services) — 940: AI agent / workflow
- [ruvnet/ruflo](https://github.com/ruvnet/ruflo) — 940: AI agent / workflow
- [LearningCircuit/local-deep-research](https://github.com/LearningCircuit/local-deep-research) — 940: AI agent / workflow
- [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) — 915.4: AI agent / workflow

## Bra att spara för senare

- [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) — 715: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [decolua/9router](https://github.com/decolua/9router) — 703: AI agent / workflow
- [docusealco/docuseal](https://github.com/docusealco/docuseal) — 697: AI agent / workflow
- [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) — 678: AI agent / workflow
- [virattt/dexter](https://github.com/virattt/dexter) — 677.7: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [yikart/AiToEarn](https://github.com/yikart/AiToEarn) — 622.6: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow

## Brus / ignorera

- [V4bel/dirtyfrag](https://github.com/V4bel/dirtyfrag) — 190.7

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
