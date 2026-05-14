# AI Radar Totalranking – 2026-05-14

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-14
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: obra/superpowers; Missing repo from ranking: cloakhq/cloakbrowser; Missing repo from ranking: millionco/react-doctor; Missing repo from ranking: k-dense-ai/scientific-agent-skills; Missing repo from ranking: rohitg00/agentmemory; Missing repo from ranking: tinyhumansai/openhuman; Missing repo from ranking: danielmiessler/personal_ai_infrastructure

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A set of ready to use Agent Skills for research, science, engineering, analysis, finance and writing. |
| 2 | 940 | [danielmiessler/Personal_AI_Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Agentic AI Infrastructure for magnifying HUMAN capabilities. |
| 3 | 940 | [anthropics/financial-services](https://github.com/anthropics/financial-services) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Topics: - |
| 4 | 940 | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Academic Research Skills for Claude Code: research → write → review → revise → finalize |
| 5 | 940 | [HKUDS/AI-Trader](https://github.com/HKUDS/AI-Trader) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — "AI-Trader: 100% Fully-Automated Agent-Native Trading" |
| 6 | 940 | [LearningCircuit/local-deep-research](https://github.com/LearningCircuit/local-deep-research) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — ~95% on SimpleQA (e.g. Qwen3.6-27B on a 3090). Supports all local and cloud LLMs (llama.cpp, Ollama, Google, ...). 10+ search engines - arXiv, PubMed, your private documents. Everything Local & Encrypted. |
| 7 | 917.9 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 8 | 913.6 | [millionco/react-doctor](https://github.com/millionco/react-doctor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your agent writes bad React. This catches it |
| 9 | 880.3 | [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Coding agent for DeepSeek models that runs in your terminal |
| 10 | 829 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 11 | 828.6 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 12 | 771.4 | [bytedance/UI-TARS-desktop](https://github.com/bytedance/UI-TARS-desktop) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The Open-Source Multimodal AI Agent Stack: Connecting Cutting-Edge AI Models and Agent Infra |
| 13 | 760 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 14 | 760 | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 15 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 16 | 744.6 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Production-grade engineering skills for AI coding agents. |
| 17 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 18 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 19 | 664 | [decolua/9router](https://github.com/decolua/9router) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Unlimited FREE AI coding. Connect Claude Code, Codex, Cursor, Cline, Copilot, Antigravity to FREE Claude/GPT/Gemini via 40+ providers. Auto-fallback, RTK -40% tokens, never hit limits. |
| 20 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 21 | 631.2 | [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Lightning-Fast, On-Device, Multilingual TTS — running natively via ONNX. |
| 22 | 623.7 | [yikart/AiToEarn](https://github.com/yikart/AiToEarn) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Let's use AI to Earn! |
| 23 | 538 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The open source coding agent. |
| 24 | 499.2 | [influxdata/telegraf](https://github.com/influxdata/telegraf) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Agent for collecting, processing, aggregating, and writing metrics, logs, and other arbitrary data. |
| 25 | 466.1 | [ywnd1144/Gopay_plus_automatic](https://github.com/ywnd1144/Gopay_plus_automatic) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Topics: - |
| 26 | 465.7 | [huangserva/3DCellForge](https://github.com/huangserva/3DCellForge) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — AI-powered interactive 3D model generation, inspection, and presentation studio. |
| 27 | 455.3 | [vercel-labs/zero-native](https://github.com/vercel-labs/zero-native) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Build desktop + mobile apps with Zig and web UI |
| 28 | 296.2 | [patchfighterway90/cs2-external-overlay](https://github.com/patchfighterway90/cs2-external-overlay) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — The cs2 external helper tool is a software utility designed for gamers and developers. It provides a set of features to enhance the gaming experience, including a customizable overlay. The tool is particularly useful for users who want to access additional information during gameplay. |
| 29 | 222.7 | [FULU-Foundation/OrcaSlicer-bambulab](https://github.com/FULU-Foundation/OrcaSlicer-bambulab) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — Topics: - |
| 30 | 56.5 | [Nightmare-Eclipse/YellowKey](https://github.com/Nightmare-Eclipse/YellowKey) | AI agent / workflow | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — YellowKey Bitlocker Bypass Vulnerability |

## Toppkandidater att agera på

- [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) — 940: AI agent / workflow
- [danielmiessler/Personal_AI_Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure) — 940: AI agent / workflow
- [anthropics/financial-services](https://github.com/anthropics/financial-services) — 940: AI agent / workflow
- [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) — 940: AI agent / workflow
- [HKUDS/AI-Trader](https://github.com/HKUDS/AI-Trader) — 940: AI agent / workflow

## Bra att spara för senare

- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [decolua/9router](https://github.com/decolua/9router) — 664: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) — 631.2: AI agent / workflow
- [yikart/AiToEarn](https://github.com/yikart/AiToEarn) — 623.7: AI agent / workflow
- [anomalyco/opencode](https://github.com/anomalyco/opencode) — 538: AI agent / workflow

## Brus / ignorera

- [patchfighterway90/cs2-external-overlay](https://github.com/patchfighterway90/cs2-external-overlay) — 296.2
- [FULU-Foundation/OrcaSlicer-bambulab](https://github.com/FULU-Foundation/OrcaSlicer-bambulab) — 222.7
- [Nightmare-Eclipse/YellowKey](https://github.com/Nightmare-Eclipse/YellowKey) — 56.5

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
