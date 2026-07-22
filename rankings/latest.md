# AI Radar Totalranking – 2026-07-22

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-22
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Missing ## Totalranking section; Missing ranking table header; Contains reasoning/prompt leakage; Expected 30 ranking rows, got 0; Missing repo from ranking: koala73/worldmonitor; Missing repo from ranking: tirth8205/code-review-graph; Missing repo from ranking: ayghri/i-have-adhd; Missing repo from ranking: earthtojake/text-to-cad

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — "Vibe-Trading: Your Personal Trading Agent" |
| 2 | 940 | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 100+ AI Agents, Agent Skills and RAG Apps - Free and Open Source. |
| 3 | 913.5 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 4 | 877.5 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Local-first code intelligence graph for MCP and CLI. Builds a persistent map of your codebase so AI coding tools read only what matters, with benchmarked context reductions on reviews and large-repo workflows. |
| 5 | 874.5 | [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — DeepTutor: Lifelong Personalized Tutoring. https://deeptutor.info/. |
| 6 | 827.7 | [tradesdontlie/tradingview-mcp](https://github.com/tradesdontlie/tradingview-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — AI-assisted TradingView chart analysis — connect Claude Code to your TradingView Desktop for personal workflow automation |
| 7 | 790.6 | [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 《深入理解 AI Agent：设计原理与工程实践》（李博杰 著）开源主仓库：全书正文、编译版 PDF 与按章配套代码 |
| 8 | 788.3 | [1jehuang/jcode](https://github.com/1jehuang/jcode) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The most intelligent agent harness for code |
| 9 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 10 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 11 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 12 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 13 | 704 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Skills for Real Engineers. Straight from my .agents directory. |
| 14 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 15 | 701.5 | [every-app/open-seo](https://github.com/every-app/open-seo) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Open source alternative to Semrush and Ahrefs |
| 16 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 17 | 644 | [AstrBotDevs/AstrBot](https://github.com/AstrBotDevs/AstrBot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — AI Agent Assistant & development framework that integrates lots of IM platforms, LLMs, plugins and AI feature, and can be your openclaw alternative. ✨ |
| 18 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 19 | 633.5 | [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A collection of agent skills for CAD, robotics and hardware design |
| 20 | 627.3 | [oblien/openship](https://github.com/oblien/openship) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Self-hosted deployment platform |
| 21 | 624.3 | [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Kimi Code CLI is your next CLI agent. |
| 22 | 618.8 | [kangarooking/cangjie-skill](https://github.com/kangarooking/cangjie-skill) | AI agent / workflow | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — 把书、长视频、播客等高价值内容蒸馏成可执行的 Agent Skills |
| 23 | 577.9 | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A skill for your coding agent to stop it from burying the answer. ADHD-friendly output. |
| 24 | 552.4 | [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — The open-source CapCut alternative |
| 25 | 505.4 | [Blaizzy/nativ](https://github.com/Blaizzy/nativ) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Local AI, native to your Mac. Chat, serve, monitor, and connect MLX models from one macOS app. |
| 26 | 500.5 | [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Anti-AI-slop design skill for Claude Code, Cursor, and Codex. |
| 27 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 28 | 429.4 | [lopopolo/harness-engineering](https://github.com/lopopolo/harness-engineering) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — 🐎 Ryan Lopopolo’s anthology, field guide, and agent context bundle for harness engineering |
| 29 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 30 | 410.8 | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Skills for Design Engineers |

## Toppkandidater att agera på

- [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) — 940: AI agent / workflow
- [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) — 940: AI agent / workflow
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 913.5: AI agent / workflow
- [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) — 877.5: AI agent / workflow
- [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) — 874.5: AI agent / workflow

## Bra att spara för senare

- [mattpocock/skills](https://github.com/mattpocock/skills) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [every-app/open-seo](https://github.com/every-app/open-seo) — 701.5: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [AstrBotDevs/AstrBot](https://github.com/AstrBotDevs/AstrBot) — 644: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) — 633.5: AI agent / workflow
- [oblien/openship](https://github.com/oblien/openship) — 627.3: AI agent / workflow
- [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) — 624.3: AI agent / workflow
- [kangarooking/cangjie-skill](https://github.com/kangarooking/cangjie-skill) — 618.8: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
