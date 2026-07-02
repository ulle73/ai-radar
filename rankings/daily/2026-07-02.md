# AI Radar Totalranking – 2026-07-02

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-02
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Missing ## Totalranking section; Missing ranking table header; Contains reasoning/prompt leakage; Expected 30 ranking rows, got 0; Missing repo from ranking: msitarzewski/agency-agents; Missing repo from ranking: hkuds/vibe-trading; Missing repo from ranking: usestrix/strix; Missing repo from ranking: hasaneyldrm/exercises-dataset

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 2 | 940 | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — "Vibe-Trading: Your Personal Trading Agent" |
| 3 | 940 | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — World's first open-source, agentic video production system. 12 pipelines, 52 tools, 500+ agent skills. Turn your AI coding assistant into a full video production studio. |
| 4 | 940 | [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Clone any website with one command using AI coding agents |
| 5 | 940 | [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — A list of SaaS, PaaS and IaaS offerings that have free tiers of interest to devops and infradev |
| 6 | 874.3 | [stablyai/orca](https://github.com/stablyai/orca) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Orca is the ADE for working with a fleet of parallel agents. Run any coding agent with your own subscription. Available on desktop and mobile. |
| 7 | 855.8 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Never stop coding. Free AI gateway: one endpoint, 231+ providers (50+ free), connect Claude Code, Codex, Cursor, Cline & Copilot to FREE Claude/GPT/Gemini. RTK+Caveman stacked compression saves 15-95% tokens, smart auto-fallback, MCP/A2A, multimodal APIs, Desktop/PWA. |
| 8 | 809.3 | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — High-performance code intelligence MCP server. Indexes codebases into a persistent knowledge graph — average repo in milliseconds. 158 languages, sub-ms queries, 99% fewer tokens. Single static binary, zero dependencies. |
| 9 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 10 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 11 | 738.9 | [xbtlin/ai-berkshire](https://github.com/xbtlin/ai-berkshire) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — AI 时代的伯克希尔：基于 Claude Code / Codex 的价值投资研究框架。巴菲特·芒格·段永平·李录四大师方法论 + 多Agent并行研究。\| AI-era Berkshire: a value investing research framework built for Claude Code / Codex. 4 masters' methodologies + multi-agent adversarial analysis. |
| 12 | 705.5 | [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A feed-forward 3D foundation model for reconstructing scenes from streaming data |
| 13 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 14 | 676.7 | [usestrix/strix](https://github.com/usestrix/strix) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Open-source AI penetration testing tool to find and fix your app’s vulnerabilities. |
| 15 | 673.7 | [allenai/olmocr](https://github.com/allenai/olmocr) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Toolkit for linearizing PDFs for LLM datasets/training |
| 16 | 663.1 | [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A comprehensive dataset of 433 fitness exercises. Each entry includes name, category, target muscle group, equipment, instructions, thumbnail image, and animation video. |
| 17 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 18 | 656.3 | [facebook/astryx](https://github.com/facebook/astryx) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — An open source design system that's fully customizable and agent ready |
| 19 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 20 | 611.4 | [simplex-chat/simplex-chat](https://github.com/simplex-chat/simplex-chat) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — SimpleX - the first messaging network operating without user identifiers of any kind - 100% private by design! iOS, Android and desktop apps 📱! |
| 21 | 591.5 | [kunchenguid/no-mistakes](https://github.com/kunchenguid/no-mistakes) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — git push no-mistakes |
| 22 | 553.8 | [logto-io/logto](https://github.com/logto-io/logto) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — 🧑‍🚀 Authentication and authorization infrastructure for SaaS and AI apps, built on OIDC and OAuth 2.1 with multi-tenancy, SSO, and RBAC. |
| 23 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 24 | 394.7 | [deepseek-ai/DeepSpec](https://github.com/deepseek-ai/DeepSpec) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — DeepSpec: a full-stack codebase for training and evaluating speculative decoding algorithms |
| 25 | 352.9 | [togatoga/karukan](https://github.com/togatoga/karukan) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — Japanese Input Method System for Linux, macOS, Neural Kana-Kanji Conversion Engine |
| 26 | 349.8 | [Krishnagangwal/CS-Fundamentals](https://github.com/Krishnagangwal/CS-Fundamentals) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Curated CS fundamentals for placement prep: DSA,Computer Networks, DBMS & SQL, OOPs, Operating Systems, System Design & Software Engineering |
| 27 | 347.2 | [Mebus/cupp](https://github.com/Mebus/cupp) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Common User Passwords Profiler (CUPP) |
| 28 | 343.4 | [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — A format specification for describing a visual identity to coding agents. DESIGN.md gives agents a persistent, structured understanding of a design system. |
| 29 | 334 | [ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — An agent-managed museum exhibit, built in Rust with Gajae-Code / LazyCodex — developed and maintained with no human intervention. |
| 30 | 20 | [mekos2772/ios-location-spoofer](https://github.com/mekos2772/ios-location-spoofer) | Web / e-commerce / FAIV | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — Standalone iOS app to spoof GPS location without jailbreak. Includes Shadowrocket/Surge/Loon/QX/Stash module. |

## Toppkandidater att agera på

- [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) — 940: AI agent / workflow
- [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) — 940: AI agent / workflow
- [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) — 940: AI agent / workflow
- [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) — 940: AI agent / workflow
- [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev) — 940: AI agent / workflow

## Bra att spara för senare

- [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) — 705.5: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [usestrix/strix](https://github.com/usestrix/strix) — 676.7: AI agent / workflow
- [allenai/olmocr](https://github.com/allenai/olmocr) — 673.7: AI agent / workflow
- [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) — 663.1: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [facebook/astryx](https://github.com/facebook/astryx) — 656.3: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [simplex-chat/simplex-chat](https://github.com/simplex-chat/simplex-chat) — 611.4: AI agent / workflow
- [kunchenguid/no-mistakes](https://github.com/kunchenguid/no-mistakes) — 591.5: AI agent / workflow

## Brus / ignorera

- [mekos2772/ios-location-spoofer](https://github.com/mekos2772/ios-location-spoofer) — 20

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
