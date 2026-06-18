# AI Radar Totalranking – 2026-06-18

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-18
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Row 1: invalid score: 4677.91; Row 2: invalid score: 1534.75; Row 11: invalid score: 2620.46; Row 12: invalid score: 1583.32; Row 13: invalid score: 1055.34; Row 20: invalid score: 26490.39; Row 21: invalid score: 9293.67; Row 22: invalid score: 7265.44

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — AI agent skill that researches any topic across Reddit, X, YouTube, HN, Polymarket, and the web - then synthesizes a grounded summary |
| 2 | 926 | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — PM Skills Marketplace: 100+ agentic skills, commands, and plugins — from discovery to strategy, execution, launch, and growth. |
| 3 | 900.6 | [meshery/meshery](https://github.com/meshery/meshery) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Meshery, the cloud native manager |
| 4 | 879.4 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees. |
| 5 | 840.7 | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — High-performance code intelligence MCP server. Indexes codebases into a persistent knowledge graph — average repo in milliseconds. 158 languages, sub-ms queries, 99% fewer tokens. Single static binary, zero dependencies. |
| 6 | 802 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 7 | 788.3 | [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Security scanner for AI agent skills. Detect vulnerabilities, malicious patterns, and security risks. |
| 8 | 770.9 | [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Extracted system prompts from Anthropic - Claude Fable 5, Opus 4.8, Claude Code, Claude Design. OpenAI - ChatGPT 5.5 Thinking, GPT 5.5 Instant, Codex. Google - Gemini 3.5 Flash, 3.1 Pro, Antigravity. xAI - Grok, Cursor, Copilot, VS Code, Perplexity, and more. Updated regularly. |
| 9 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 10 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 11 | 755.1 | [chopratejas/headroom](https://github.com/chopratejas/headroom) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Compress tool outputs, logs, files, and RAG chunks before they reach the LLM. 60-95% fewer tokens, same answers. Library, proxy, MCP server. |
| 12 | 747.1 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Production-grade engineering skills for AI coding agents. |
| 13 | 713.8 | [penpot/penpot](https://github.com/penpot/penpot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Penpot: The open-source design tool for design and code collaboration |
| 14 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 15 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 16 | 673.2 | [RocketChat/Rocket.Chat](https://github.com/RocketChat/Rocket.Chat) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — The Secure CommsOS™ for mission-critical operations |
| 17 | 664 | [iptv-org/iptv](https://github.com/iptv-org/iptv) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Collection of publicly available IPTV channels from all over the world |
| 18 | 622.4 | [lenucksi/aur-malware-check](https://github.com/lenucksi/aur-malware-check) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Detection tools for the June 2026 atomic-lockfile AUR supply-chain attack. Consolidated from community Gists. |
| 19 | 605.8 | [n0-computer/iroh](https://github.com/n0-computer/iroh) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — IP addresses break, dial keys instead. Modular networking stack in Rust. |
| 20 | 597.8 | [tamnd/kage](https://github.com/tamnd/kage) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Shadow any website for offline viewing, with the JavaScript stripped out |
| 21 | 594 | [krahets/hello-algo](https://github.com/krahets/hello-algo) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — 《Hello 算法》：动画图解、一键运行的数据结构与算法教程。支持简中、繁中、English、日本語，提供 Python, Java, C++, C, C#, JS, Go, Swift, Rust, Ruby, Kotlin, TS, Dart 等代码实现 |
| 22 | 584.8 | [google-research/timesfm](https://github.com/google-research/timesfm) | AI agent / workflow | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_DAILY — TimesFM (Time Series Foundation Model) is a pretrained time-series foundation model developed by Google Research for time-series forecasting. |
| 23 | 571.2 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote. |
| 24 | 506.2 | [apple/container](https://github.com/apple/container) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A tool for creating and running Linux containers using lightweight virtual machines on a Mac. It is written in Swift, and optimized for Apple silicon. |
| 25 | 467.3 | [vercel/eve](https://github.com/vercel/eve) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The Framework for Building Agents |
| 26 | 461.4 | [continuedev/continue](https://github.com/continuedev/continue) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — open-source coding agent |
| 27 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 28 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 29 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 30 | 280 | [music-assistant/server](https://github.com/music-assistant/server) | Documents / wedding planner | TRUE_TRENDING_WEEKLY | Ignorera | TRUE_TRENDING_WEEKLY — Music Assistant is a free, opensource Media library manager that connects to your streaming services and a wide range of connected speakers. The server is the beating heart, the core of Music Assistant and must run on an always-on device like a Raspberry Pi, a NAS or an Intel NUC or alike. |

## Toppkandidater att agera på

- [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) — 940: AI agent / workflow
- [phuryn/pm-skills](https://github.com/phuryn/pm-skills) — 926: AI agent / workflow
- [meshery/meshery](https://github.com/meshery/meshery) — 900.6: AI agent / workflow
- [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) — 879.4: AI agent / workflow
- [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) — 840.7: AI agent / workflow

## Bra att spara för senare

- [penpot/penpot](https://github.com/penpot/penpot) — 713.8: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [RocketChat/Rocket.Chat](https://github.com/RocketChat/Rocket.Chat) — 673.2: AI agent / workflow
- [iptv-org/iptv](https://github.com/iptv-org/iptv) — 664: AI agent / workflow
- [lenucksi/aur-malware-check](https://github.com/lenucksi/aur-malware-check) — 622.4: AI agent / workflow
- [n0-computer/iroh](https://github.com/n0-computer/iroh) — 605.8: AI agent / workflow
- [tamnd/kage](https://github.com/tamnd/kage) — 597.8: AI agent / workflow
- [krahets/hello-algo](https://github.com/krahets/hello-algo) — 594: AI agent / workflow
- [google-research/timesfm](https://github.com/google-research/timesfm) — 584.8: AI agent / workflow

## Brus / ignorera

- [music-assistant/server](https://github.com/music-assistant/server) — 280

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
