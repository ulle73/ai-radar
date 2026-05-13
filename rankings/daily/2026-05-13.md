# AI Radar Totalranking – 2026-05-13

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-13
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: mattpocock/skills; Missing repo from ranking: datawhalechina/hello-agents; Missing repo from ranking: cloakhq/cloakbrowser; Missing repo from ranking: millionco/react-doctor; Missing repo from ranking: rasbt/llms-from-scratch; Missing repo from ranking: rohitg00/agentmemory; Missing repo from ranking: tinyhumansai/openhuman

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [anthropics/financial-services](https://github.com/anthropics/financial-services) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Topics: - |
| 2 | 940 | [ruvnet/ruflo](https://github.com/ruvnet/ruflo) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 🌊 The leading agent orchestration platform for Claude. Deploy intelligent multi-agent swarms, coordinate autonomous workflows, and build conversational AI systems. Features enterprise-grade architecture, self-learning swarm intelligence, RAG integration, and native Claude Code / Codex Integration |
| 3 | 940 | [LearningCircuit/local-deep-research](https://github.com/LearningCircuit/local-deep-research) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — ~95% on SimpleQA (e.g. Qwen3.6-27B on a 3090). Supports all local and cloud LLMs (llama.cpp, Ollama, Google, ...). 10+ search engines - arXiv, PubMed, your private documents. Everything Local & Encrypted. |
| 4 | 922.9 | [VectifyAI/PageIndex](https://github.com/VectifyAI/PageIndex) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 📑 PageIndex: Document Index for Vectorless, Reasoning-based RAG |
| 5 | 916.8 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 6 | 913.3 | [millionco/react-doctor](https://github.com/millionco/react-doctor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your agent writes bad React. This catches it |
| 7 | 838 | [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Coding agent for DeepSeek models that runs in your terminal |
| 8 | 827.1 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 9 | 824.8 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 10 | 771.4 | [bytedance/UI-TARS-desktop](https://github.com/bytedance/UI-TARS-desktop) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The Open-Source Multimodal AI Agent Stack: Connecting Cutting-Edge AI Models and Agent Infra |
| 11 | 760 | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 12 | 755.6 | [datawhalechina/hello-agents](https://github.com/datawhalechina/hello-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 📚 《从零开始构建智能体》——从零开始的智能体原理与实践教程 |
| 13 | 745.6 | [rasbt/LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Implement a ChatGPT-like LLM in PyTorch from scratch, step by step |
| 14 | 744.5 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Production-grade engineering skills for AI coding agents. |
| 15 | 716.4 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Skills for Real Engineers. Straight from my .claude directory. |
| 16 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 17 | 697 | [docusealco/docuseal](https://github.com/docusealco/docuseal) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Open source DocuSign alternative. Create, fill, and sign digital documents ✍️ |
| 18 | 663.7 | [decolua/9router](https://github.com/decolua/9router) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Unlimited FREE AI coding. Connect Claude Code, Codex, Cursor, Cline, Copilot, Antigravity to FREE Claude/GPT/Gemini via 40+ providers. Auto-fallback, RTK -40% tokens, never hit limits. |
| 19 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 20 | 623.1 | [yikart/AiToEarn](https://github.com/yikart/AiToEarn) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Let's use AI to Earn! |
| 21 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 22 | 577 | [anonfaded/FadCam](https://github.com/anonfaded/FadCam) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Open-source, ad-free Android multimedia recorder with background video recording, screen recording, live streaming, and remote camera control |
| 23 | 464.8 | [ywnd1144/Gopay_plus_automatic](https://github.com/ywnd1144/Gopay_plus_automatic) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Topics: - |
| 24 | 454.7 | [vercel-labs/zero-native](https://github.com/vercel-labs/zero-native) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Build desktop + mobile apps with Zig and web UI |
| 25 | 381.3 | [huangserva/3DCellForge](https://github.com/huangserva/3DCellForge) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — AI-powered interactive 3D cell generation and exploration studio. |
| 26 | 268 | [RadianceToadAmend/Fortnite-Cheats-2026](https://github.com/RadianceToadAmend/Fortnite-Cheats-2026) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — ⭐️ Fortnite Cheats 2026 \| Aimbot ESP WH \| Triggerbot NoRecoil Glow \| Skin Changer \| AntiAFK Auto Farm Heal \| Mod Menu Loader Injector \| Full Version Latest Build Pro \| PC Epic Windows 10/11 ⭐️ |
| 27 | 218.3 | [FULU-Foundation/OrcaSlicer-bambulab](https://github.com/FULU-Foundation/OrcaSlicer-bambulab) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — Topics: - |
| 28 | 214.3 | [apernet/hysteria](https://github.com/apernet/hysteria) | Web / e-commerce / FAIV | Documents / wedding planner | Ignorera | TRUE_TRENDING_DAILY — Hysteria is a powerful, lightning fast and censorship resistant proxy. |
| 29 | 190.9 | [V4bel/dirtyfrag](https://github.com/V4bel/dirtyfrag) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — Topics: - |
| 30 | 184 | [RadianceToadAmend/ARC-Raiders-External-Tool](https://github.com/RadianceToadAmend/ARC-Raiders-External-Tool) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — External overlay tool for ARC Raiders. UE5 memory reader, entity , radar, performance monitor. D3D11 render, no injection. For offline training purposes only. |

## Toppkandidater att agera på

- [anthropics/financial-services](https://github.com/anthropics/financial-services) — 940: AI agent / workflow
- [ruvnet/ruflo](https://github.com/ruvnet/ruflo) — 940: AI agent / workflow
- [LearningCircuit/local-deep-research](https://github.com/LearningCircuit/local-deep-research) — 940: AI agent / workflow
- [VectifyAI/PageIndex](https://github.com/VectifyAI/PageIndex) — 922.9: AI agent / workflow
- [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) — 916.8: AI agent / workflow

## Bra att spara för senare

- [mattpocock/skills](https://github.com/mattpocock/skills) — 716.4: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [docusealco/docuseal](https://github.com/docusealco/docuseal) — 697: AI agent / workflow
- [decolua/9router](https://github.com/decolua/9router) — 663.7: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [yikart/AiToEarn](https://github.com/yikart/AiToEarn) — 623.1: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [anonfaded/FadCam](https://github.com/anonfaded/FadCam) — 577: AI agent / workflow

## Brus / ignorera

- [RadianceToadAmend/Fortnite-Cheats-2026](https://github.com/RadianceToadAmend/Fortnite-Cheats-2026) — 268
- [FULU-Foundation/OrcaSlicer-bambulab](https://github.com/FULU-Foundation/OrcaSlicer-bambulab) — 218.3
- [apernet/hysteria](https://github.com/apernet/hysteria) — 214.3
- [V4bel/dirtyfrag](https://github.com/V4bel/dirtyfrag) — 190.9
- [RadianceToadAmend/ARC-Raiders-External-Tool](https://github.com/RadianceToadAmend/ARC-Raiders-External-Tool) — 184

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
