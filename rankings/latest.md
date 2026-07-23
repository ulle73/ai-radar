# AI Radar Totalranking – 2026-07-23

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-23
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 9; Missing repo from ranking: koala73/worldmonitor; Missing repo from ranking: jamiepine/voicebox; Missing repo from ranking: ruvnet/ruview; Missing repo from ranking: ayghri/i-have-adhd; Missing repo from ranking: chrislgarry/apollo-11; Missing repo from ranking: schollz/croc; Missing repo from ranking: likec4/likec4

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows |
| 2 | 940 | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 100+ AI Agents, Agent Skills and RAG Apps - Free and Open Source. |
| 3 | 915.3 | [jamiepine/voicebox](https://github.com/jamiepine/voicebox) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The open-source AI voice studio. Clone, dictate, create. |
| 4 | 913.8 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 5 | 903.7 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Never stop coding. Free MIT AI gateway: one endpoint, 278+ providers (90+ free), 500+ models — Kimi, Claude, GPT, OpenAI, Gemini, GLM, DeepSeek, MiniMax. Works with Claude Code, Codex, Cursor, OpenCode, Cline & Copilot. Quota-aware auto-fallback, RTK+Caveman compression saves 15-95% tokens, MCP/A2A, Desktop/PWA. Built by 500+ contributors |
| 6 | 900.9 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 7 | 874.5 | [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — DeepTutor: Lifelong Personalized Tutoring. https://deeptutor.info/. |
| 8 | 837.7 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Local-first code intelligence graph for MCP and CLI. Builds a persistent map of your codebase so AI coding tools read only what matters, with benchmarked context reductions on reviews and large-repo workflows. |
| 9 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 10 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 11 | 748.5 | [1jehuang/jcode](https://github.com/1jehuang/jcode) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The most intelligent agent harness for code |
| 12 | 747.2 | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Kronos: A Foundation Model for the Language of Financial Markets |
| 13 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 14 | 704 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Skills for Real Engineers. Straight from my .agents directory. |
| 15 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 16 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 17 | 661.3 | [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Kimi Code CLI — The Starting Point for Next-Gen Agents |
| 18 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 19 | 624.4 | [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Kimi Code CLI is your next CLI agent. |
| 20 | 579 | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A skill for your coding agent to stop it from burying the answer. ADHD-friendly output. |
| 21 | 552.5 | [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — The open-source CapCut alternative |
| 22 | 504.1 | [schollz/croc](https://github.com/schollz/croc) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Easily and securely send things from one computer to another :crocodile: :package: |
| 23 | 500.8 | [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Anti-AI-slop design skill for Claude Code, Cursor, and Codex. |
| 24 | 491 | [likec4/likec4](https://github.com/likec4/likec4) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — Visualize, collaborate, and evolve the software architecture with always actual and live diagrams from your code |
| 25 | 486.5 | [apache/ossie](https://github.com/apache/ossie) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Apache Ossie, industry wide specification effort to standardize how we exchange semantic metadata across analytics, AI and BI platforms, providing a vendor neutral, single source of truth for semantic data |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 430.8 | [lopopolo/harness-engineering](https://github.com/lopopolo/harness-engineering) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — 🐎 Ryan Lopopolo’s anthology, field guide, and agent context bundle for harness engineering |
| 28 | 410.9 | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — Skills for Design Engineers |
| 29 | 381.5 | [Jakubantalik/thinking-orbs](https://github.com/Jakubantalik/thinking-orbs) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Dotted thought-orb loading indicators for AI & agent UIs — six tuned states, two sizes, auto dark/light |
| 30 | 353.9 | [chrislgarry/Apollo-11](https://github.com/chrislgarry/Apollo-11) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Original Apollo 11 Guidance Computer (AGC) source code for the command and lunar modules. |

## Toppkandidater att agera på

- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — 940: AI agent / workflow
- [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) — 940: AI agent / workflow
- [jamiepine/voicebox](https://github.com/jamiepine/voicebox) — 915.3: AI agent / workflow
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 913.8: AI agent / workflow
- [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) — 903.7: AI agent / workflow

## Bra att spara för senare

- [mattpocock/skills](https://github.com/mattpocock/skills) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) — 661.3: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) — 624.4: AI agent / workflow
- [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) — 579: AI agent / workflow
- [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) — 552.5: AI agent / workflow
- [schollz/croc](https://github.com/schollz/croc) — 504.1: AI agent / workflow
- [Nutlope/hallmark](https://github.com/Nutlope/hallmark) — 500.8: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
