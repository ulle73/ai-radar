# AI Radar Totalranking – 2026-06-17

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-17
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: freecodecamp/freecodecamp; Missing repo from ranking: openbmb/voxcpm; Missing repo from ranking: iptv-org/iptv; Missing repo from ranking: puppeteer/puppeteer; Missing repo from ranking: cypress-io/cypress; Missing repo from ranking: swc-project/swc; Missing repo from ranking: universal-debloater-alliance/universal-android-debloater-next-generation

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — AI agent skill that researches any topic across Reddit, X, YouTube, HN, Polymarket, and the web - then synthesizes a grounded summary |
| 2 | 925.9 | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — PM Skills Marketplace: 100+ agentic skills, commands, and plugins — from discovery to strategy, execution, launch, and growth. |
| 3 | 900.5 | [meshery/meshery](https://github.com/meshery/meshery) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Meshery, the cloud native manager |
| 4 | 839.1 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees. |
| 5 | 787.9 | [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Security scanner for AI agent skills. Detect vulnerabilities, malicious patterns, and security risks. |
| 6 | 770.9 | [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Extracted system prompts from Anthropic - Claude Fable 5, Opus 4.8, Claude Code, Claude Design. OpenAI - ChatGPT 5.5 Thinking, GPT 5.5 Instant, Codex. Google - Gemini 3.5 Flash, 3.1 Pro, Antigravity. xAI - Grok, Cursor, Copilot, VS Code, Perplexity, and more. Updated regularly. |
| 7 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 8 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 9 | 754.7 | [chopratejas/headroom](https://github.com/chopratejas/headroom) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Compress tool outputs, logs, files, and RAG chunks before they reach the LLM. 60-95% fewer tokens, same answers. Library, proxy, MCP server. |
| 10 | 747 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Production-grade engineering skills for AI coding agents. |
| 11 | 704 | [iptv-org/iptv](https://github.com/iptv-org/iptv) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Collection of publicly available IPTV channels from all over the world |
| 12 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 13 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 14 | 699.7 | [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — JavaScript API for Chrome and Firefox |
| 15 | 684.7 | [omnigent-ai/omnigent](https://github.com/omnigent-ai/omnigent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A meta-harness for all your AI agents. Omnigent provides a common layer over Claude Code, Codex, Pi, and the agents you write yourself: swap or combine harnesses without rewriting, keep them in check with policies and sandboxing, and collaborate in real time on the same live session, from any device. |
| 16 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 17 | 628.7 | [OpenBMB/VoxCPM](https://github.com/OpenBMB/VoxCPM) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_DAILY — VoxCPM2: Tokenizer-Free TTS for Multilingual Speech Generation, Creative Voice Design, and True-to-Life Cloning |
| 18 | 621.9 | [lenucksi/aur-malware-check](https://github.com/lenucksi/aur-malware-check) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Detection tools for the June 2026 atomic-lockfile AUR supply-chain attack. Consolidated from community Gists. |
| 19 | 621 | [teslamate-org/teslamate](https://github.com/teslamate-org/teslamate) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A self-hosted data logger for your Tesla 🚘 [main maintainer=@JakobLichterfeld] |
| 20 | 597.5 | [tamnd/kage](https://github.com/tamnd/kage) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Shadow any website for offline viewing, with the JavaScript stripped out |
| 21 | 589.8 | [cypress-io/cypress](https://github.com/cypress-io/cypress) | Web / e-commerce / FAIV | Content / Socials / marketing | Spara för senare | TRUE_TRENDING_DAILY — Fast, easy and reliable testing for anything that runs in a browser. |
| 22 | 570 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote. |
| 23 | 506.1 | [apple/container](https://github.com/apple/container) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A tool for creating and running Linux containers using lightweight virtual machines on a Mac. It is written in Swift, and optimized for Apple silicon. |
| 24 | 503.4 | [swc-project/swc](https://github.com/swc-project/swc) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Rust-based platform for the Web |
| 25 | 494.2 | [Universal-Debloater-Alliance/universal-android-debloater-next-generation](https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Cross-platform GUI written in Rust using ADB to debloat non-rooted Android devices. Improve your privacy, the security and battery life of your device. |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 434 | [freeCodeCamp/freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — freeCodeCamp.org's open-source codebase and curriculum. Learn math, programming, and computer science for free. |
| 28 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 29 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 30 | 319.8 | [music-assistant/server](https://github.com/music-assistant/server) | Documents / wedding planner | TRUE_TRENDING_DAILY | Bevaka | TRUE_TRENDING_DAILY — Music Assistant is a free, opensource Media library manager that connects to your streaming services and a wide range of connected speakers. The server is the beating heart, the core of Music Assistant and must run on an always-on device like a Raspberry Pi, a NAS or an Intel NUC or alike. |

## Toppkandidater att agera på

- [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) — 940: AI agent / workflow
- [phuryn/pm-skills](https://github.com/phuryn/pm-skills) — 925.9: AI agent / workflow
- [meshery/meshery](https://github.com/meshery/meshery) — 900.5: AI agent / workflow
- [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) — 839.1: AI agent / workflow
- [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) — 787.9: AI agent / workflow

## Bra att spara för senare

- [iptv-org/iptv](https://github.com/iptv-org/iptv) — 704: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) — 699.7: AI agent / workflow
- [omnigent-ai/omnigent](https://github.com/omnigent-ai/omnigent) — 684.7: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [OpenBMB/VoxCPM](https://github.com/OpenBMB/VoxCPM) — 628.7: Web / e-commerce / FAIV
- [lenucksi/aur-malware-check](https://github.com/lenucksi/aur-malware-check) — 621.9: AI agent / workflow
- [teslamate-org/teslamate](https://github.com/teslamate-org/teslamate) — 621: AI agent / workflow
- [tamnd/kage](https://github.com/tamnd/kage) — 597.5: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
