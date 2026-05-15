# AI Radar Totalranking – 2026-05-15

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-15
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: obra/superpowers; Missing repo from ranking: ruvnet/ruview; Missing repo from ranking: rohitg00/agentmemory; Missing repo from ranking: k-dense-ai/scientific-agent-skills; Missing repo from ranking: tinyhumansai/openhuman; Missing repo from ranking: shiyu-coder/kronos; Missing repo from ranking: genymobile/scrcpy

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A set of ready to use Agent Skills for research, science, engineering, analysis, finance and writing. |
| 2 | 940 | [anthropics/financial-services](https://github.com/anthropics/financial-services) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Topics: - |
| 3 | 940 | [HKUDS/AI-Trader](https://github.com/HKUDS/AI-Trader) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — "AI-Trader: 100% Fully-Automated Agent-Native Trading" |
| 4 | 880.5 | [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Coding agent for DeepSeek models that runs in your terminal |
| 5 | 878.6 | [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Stealth Chromium that passes every bot detection test. Drop-in Playwright replacement with source-level fingerprint patches. 30/30 tests passed. |
| 6 | 830.6 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Your Personal AI super intelligence. Private, Simple and extremely powerful. |
| 7 | 829.5 | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — #1 Persistent memory for AI coding agents based on real-world benchmarks |
| 8 | 771.4 | [bytedance/UI-TARS-desktop](https://github.com/bytedance/UI-TARS-desktop) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The Open-Source Multimodal AI Agent Stack: Connecting Cutting-Edge AI Models and Agent Infra |
| 9 | 760 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 10 | 760 | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 11 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 12 | 760 | [nexu-io/html-anything](https://github.com/nexu-io/html-anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — ✨ The agentic HTML editor — your local AI agent writes the HTML, you ship it. 🚀 75 Skills × 9 Surfaces (magazine · deck · poster · XHS / tweet · prototype · data report · Hyperframes) 🛡️ Sandboxed preview · 📤 1-click to WeChat / X / Zhihu / HTML / PNG 🔑 Zero API key — Claude Code / Cursor / Codex / Gemini / Copilot / OpenCode / Qwen / Aider. |
| 13 | 745.5 | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Kronos: A Foundation Model for the Language of Financial Markets |
| 14 | 744.7 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Production-grade engineering skills for AI coding agents. |
| 15 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 16 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 17 | 680.5 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 18 | 664.2 | [decolua/9router](https://github.com/decolua/9router) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Unlimited FREE AI coding. Connect Claude Code, Codex, Cursor, Cline, Copilot, Antigravity to FREE Claude/GPT/Gemini via 40+ providers. Auto-fallback, RTK -40% tokens, never hit limits. |
| 19 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 20 | 632.3 | [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Lightning-Fast, On-Device, Multilingual TTS — running natively via ONNX. |
| 21 | 614.3 | [roboflow/supervision](https://github.com/roboflow/supervision) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_DAILY — We write your reusable computer vision tools. 💜 |
| 22 | 594 | [Genymobile/scrcpy](https://github.com/Genymobile/scrcpy) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_DAILY — Display and control your Android device |
| 23 | 584 | [yikart/AiToEarn](https://github.com/yikart/AiToEarn) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Let's use AI to Earn! |
| 24 | 538 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The open source coding agent. |
| 25 | 499.3 | [influxdata/telegraf](https://github.com/influxdata/telegraf) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Agent for collecting, processing, aggregating, and writing metrics, logs, and other arbitrary data. |
| 26 | 466.3 | [huangserva/3DCellForge](https://github.com/huangserva/3DCellForge) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — AI-powered interactive 3D model generation, inspection, and presentation studio. |
| 27 | 465.2 | [yetone/native-feel-skill](https://github.com/yetone/native-feel-skill) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — An Agent Skill for designing cross-platform desktop apps that feel native — distilled from Raycast's 2.0 deep-dive and reverse engineering of Raycast Beta.app. Eight architectural tenets, four-layer architecture, WebKit/WebView2 survival guide, 75-item ship audit. |
| 28 | 384.6 | [playcanvas/supersplat](https://github.com/playcanvas/supersplat) | Web / e-commerce / FAIV | Content / Socials / marketing | Bevaka | TRUE_TRENDING_WEEKLY — 3D Gaussian Splat Editor |
| 29 | 224.7 | [FULU-Foundation/OrcaSlicer-bambulab](https://github.com/FULU-Foundation/OrcaSlicer-bambulab) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — Topics: - |
| 30 | 59.6 | [Nightmare-Eclipse/YellowKey](https://github.com/Nightmare-Eclipse/YellowKey) | AI agent / workflow | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — YellowKey Bitlocker Bypass Vulnerability |

## Toppkandidater att agera på

- [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) — 940: AI agent / workflow
- [anthropics/financial-services](https://github.com/anthropics/financial-services) — 940: AI agent / workflow
- [HKUDS/AI-Trader](https://github.com/HKUDS/AI-Trader) — 940: AI agent / workflow
- [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI) — 880.5: AI agent / workflow
- [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) — 878.6: AI agent / workflow

## Bra att spara för senare

- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [ruvnet/RuView](https://github.com/ruvnet/RuView) — 680.5: AI agent / workflow
- [decolua/9router](https://github.com/decolua/9router) — 664.2: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic) — 632.3: AI agent / workflow
- [roboflow/supervision](https://github.com/roboflow/supervision) — 614.3: Web / e-commerce / FAIV
- [Genymobile/scrcpy](https://github.com/Genymobile/scrcpy) — 594: Web / e-commerce / FAIV
- [yikart/AiToEarn](https://github.com/yikart/AiToEarn) — 584: AI agent / workflow
- [anomalyco/opencode](https://github.com/anomalyco/opencode) — 538: AI agent / workflow

## Brus / ignorera

- [FULU-Foundation/OrcaSlicer-bambulab](https://github.com/FULU-Foundation/OrcaSlicer-bambulab) — 224.7
- [Nightmare-Eclipse/YellowKey](https://github.com/Nightmare-Eclipse/YellowKey) — 59.6

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
