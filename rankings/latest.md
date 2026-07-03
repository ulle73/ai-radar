# AI Radar Totalranking – 2026-07-03

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-03
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: affaan-m/ecc; Missing repo from ranking: obra/superpowers; Missing repo from ranking: juliusbrussee/caveman; Missing repo from ranking: santifer/career-ops; Missing repo from ranking: msitarzewski/agency-agents; Missing repo from ranking: browser-use/video-use; Missing repo from ranking: chromedevtools/chrome-devtools-mcp

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 2 | 940 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 3 | 940 | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — World's first open-source, agentic video production system. 12 pipelines, 52 tools, 500+ agent skills. Turn your AI coding assistant into a full video production studio. |
| 4 | 940 | [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Clone any website with one command using AI coding agents |
| 5 | 940 | [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — A list of SaaS, PaaS and IaaS offerings that have free tiers of interest to devops and infradev |
| 6 | 924.7 | [santifer/career-ops](https://github.com/santifer/career-ops) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — AI-powered job search system built on Claude Code. 14 skill modes, Go dashboard, PDF generation, batch processing. |
| 7 | 875.2 | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Chrome DevTools for coding agents |
| 8 | 809.5 | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — High-performance code intelligence MCP server. Indexes codebases into a persistent knowledge graph — average repo in milliseconds. 158 languages, sub-ms queries, 99% fewer tokens. Single static binary, zero dependencies. |
| 9 | 802 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 10 | 790 | [browser-use/video-use](https://github.com/browser-use/video-use) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Edit videos with coding agents |
| 11 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 12 | 758.8 | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 🪨 why use many token when few token do trick — Claude Code skill that cuts 65% of tokens by talking like caveman |
| 13 | 758.3 | [TianhangZhuzth/Fundamental-Ava](https://github.com/TianhangZhuzth/Fundamental-Ava) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Build digital human beings — autonomous, collaborative, and socially intelligent agents. FNzgGxU31RWiDgLr3GvxxSa42nRntvZNSG6aBMQ1pump |
| 14 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 739.2 | [xbtlin/ai-berkshire](https://github.com/xbtlin/ai-berkshire) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — AI 时代的伯克希尔：基于 Claude Code / Codex 的价值投资研究框架。巴菲特·芒格·段永平·李录四大师方法论 + 多Agent并行研究。\| AI-era Berkshire: a value investing research framework built for Claude Code / Codex. 4 masters' methodologies + multi-agent adversarial analysis. |
| 16 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 17 | 677.2 | [usestrix/strix](https://github.com/usestrix/strix) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Open-source AI penetration testing tool to find and fix your app’s vulnerabilities. |
| 18 | 675.1 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Persistent Context Across Sessions for Every Agent – Captures everything your agent does during sessions, compresses it with AI, and injects relevant context back into future sessions. Works with Claude Code, OpenClaw, Codex, Gemini, Hermes, Copilot, OpenCode + More |
| 19 | 663.6 | [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A comprehensive dataset of 433 fitness exercises. Each entry includes name, category, target muscle group, equipment, instructions, thumbnail image, and animation video. |
| 20 | 663.6 | [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A feed-forward 3D foundation model for reconstructing scenes from streaming data |
| 21 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 22 | 611.5 | [simplex-chat/simplex-chat](https://github.com/simplex-chat/simplex-chat) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — SimpleX - the first messaging network operating without user identifiers of any kind - 100% private by design! iOS, Android and desktop apps 📱! |
| 23 | 591.7 | [kunchenguid/no-mistakes](https://github.com/kunchenguid/no-mistakes) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — git push no-mistakes |
| 24 | 494.8 | [actions/checkout](https://github.com/actions/checkout) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Action for checking out a repo |
| 25 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 26 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 27 | 350.3 | [Krishnagangwal/CS-Fundamentals](https://github.com/Krishnagangwal/CS-Fundamentals) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Curated CS fundamentals for placement prep: DSA,Computer Networks, DBMS & SQL, OOPs, Operating Systems, System Design & Software Engineering |
| 28 | 343.4 | [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — A format specification for describing a visual identity to coding agents. DESIGN.md gives agents a persistent, structured understanding of a design system. |
| 29 | 140.7 | [yynxxxxx/Codex-5.5-codex-instruct-5.5](https://github.com/yynxxxxx/Codex-5.5-codex-instruct-5.5) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — Topics: - |
| 30 | 20 | [mekos2772/ios-location-spoofer](https://github.com/mekos2772/ios-location-spoofer) | Web / e-commerce / FAIV | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — Standalone iOS app to spoof GPS location without jailbreak. Includes Shadowrocket/Surge/Loon/QX/Stash module. |

## Toppkandidater att agera på

- [affaan-m/ECC](https://github.com/affaan-m/ECC) — 940: AI agent / workflow
- [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) — 940: AI agent / workflow
- [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) — 940: AI agent / workflow
- [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) — 940: AI agent / workflow
- [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev) — 940: AI agent / workflow

## Bra att spara för senare

- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [usestrix/strix](https://github.com/usestrix/strix) — 677.2: AI agent / workflow
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) — 675.1: AI agent / workflow
- [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) — 663.6: AI agent / workflow
- [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) — 663.6: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [simplex-chat/simplex-chat](https://github.com/simplex-chat/simplex-chat) — 611.5: AI agent / workflow
- [kunchenguid/no-mistakes](https://github.com/kunchenguid/no-mistakes) — 591.7: AI agent / workflow

## Brus / ignorera

- [yynxxxxx/Codex-5.5-codex-instruct-5.5](https://github.com/yynxxxxx/Codex-5.5-codex-instruct-5.5) — 140.7
- [mekos2772/ios-location-spoofer](https://github.com/mekos2772/ios-location-spoofer) — 20

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
