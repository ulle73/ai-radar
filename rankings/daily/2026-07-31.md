# AI Radar Totalranking – 2026-07-31

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-31
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 20; Missing repo from ranking: dotnet/aspnetcore; Missing repo from ranking: whiskeysockets/baileys; Missing repo from ranking: paperswithbacktest/awesome-systematic-trading; Missing repo from ranking: ayghri/i-have-adhd; Missing repo from ranking: block/buzz; Missing repo from ranking: bojieli/ai-agent-book; Missing repo from ranking: 1jehuang/jcode

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — AI agent skill that researches any topic across Reddit, X, YouTube, HN, Polymarket, and the web - then synthesizes a grounded summary |
| 2 | 874.4 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 3 | 865.7 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free MIT AI gateway: one endpoint, 290+ providers (90+ free), 500+ models — Kimi, Claude, GPT, OpenAI, Gemini, GLM, DeepSeek, MiniMax. Works with Claude Code, Codex, Cursor, OpenCode, Cline & Copilot. Quota-aware auto-fallback, RTK+Caveman compression saves 15-95% tokens, MCP/A2A, Desktop/PWA. Built by 500+ contributors |
| 4 | 843.5 | [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The fastest browser for AI agents to run browser automation, built for sharing your logged-in browser state with your AI agents, like Codex or Claude Code, without disturbing you. Zero cost, zero config. |
| 5 | 835.1 | [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Open-source & free — Battle-tested at Alibaba's scale. Hybrid architecture code review tool: deterministic pipelines + LLM Agent, precise line-level comments, built-in fine-tuned ruleset (NPE, thread-safety, XSS, SQL injection), OpenAI & Anthropic compatible. |
| 6 | 804 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .agents directory. |
| 7 | 793.8 | [block/buzz](https://github.com/block/buzz) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — A hive mind communication platform |
| 8 | 766.7 | [paperswithbacktest/awesome-systematic-trading](https://github.com/paperswithbacktest/awesome-systematic-trading) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A curated list of awesome libraries, packages, strategies, books, blogs, tutorials for systematic trading. |
| 9 | 760 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 10 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 11 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 12 | 750.2 | [1jehuang/jcode](https://github.com/1jehuang/jcode) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The most RAM efficient harness |
| 13 | 747.5 | [huggingface/speech-to-speech](https://github.com/huggingface/speech-to-speech) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Build local voice agents with open-source models |
| 14 | 726.2 | [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 《深入理解 AI Agent：设计原理与工程实践》（李博杰 著）开源主仓库：全书正文、编译版 PDF 与按章配套代码 |
| 15 | 707.6 | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Kronos: A Foundation Model for the Language of Financial Markets |
| 16 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 17 | 679.9 | [different-ai/openwork](https://github.com/different-ai/openwork) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — The open-source alternative to Claude Cowork (powered by opencode) |
| 18 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 19 | 659.8 | [ansible/ansible](https://github.com/ansible/ansible) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Ansible is a radically simple IT automation platform that makes your applications and systems easier to deploy and maintain. Automate everything from code deployment to network configuration to cloud management, in a language that approaches plain English, using SSH, with no agents to install on remote systems. https://docs.ansible.com. |
| 20 | 606.3 | [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Socket-based TS/JavaScript API for WhatsApp Web |
| 21 | 604.3 | [microsoft/AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — 12 Weeks, 24 Lessons, AI for All! |
| 22 | 599.4 | [mshumer/Claude-of-Duty](https://github.com/mshumer/Claude-of-Duty) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A Call of Duty-quality FPS in Three.js, built from a single prompt. |
| 23 | 556.3 | [pascalorg/editor](https://github.com/pascalorg/editor) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Create and share 3D architectural projects. |
| 24 | 542.2 | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A skill to stop your coding agent from burying the answer. ADHD-friendly output. |
| 25 | 480.3 | [MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Open Frontier Intelligence |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 426 | [microsoft/PowerToys](https://github.com/microsoft/PowerToys) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — Microsoft PowerToys is a collection of utilities that supercharge productivity and customization on Windows |
| 28 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 29 | 344.2 | [dotnet/aspnetcore](https://github.com/dotnet/aspnetcore) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — ASP.NET Core is a cross-platform .NET framework for building modern cloud-based web applications on Windows, Mac, or Linux. |
| 30 | 339.4 | [WilonityXYZ/Wilonity](https://github.com/WilonityXYZ/Wilonity) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Wilonity Loader – cheat lib w/ spoofer, driver bypass, undetected injector for 20+ games (RUST, CS2, Valorant, Tarkov, Warzone, R6S, ArcRiders, Apex, Roblox, Meccha Chameleon). Kernel spoof, HWID cleaner, AC bypass (EAC/BE/VG). ESP, aimbot, WH, wallhack, triggerbot, radar, no recoil, silent aim, chams, skin changer, unlock all, no spread |

## Toppkandidater att agera på

- [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) — 940: AI agent / workflow
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 874.4: AI agent / workflow
- [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) — 865.7: AI agent / workflow
- [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) — 843.5: AI agent / workflow
- [alibaba/open-code-review](https://github.com/alibaba/open-code-review) — 835.1: AI agent / workflow

## Bra att spara för senare

- [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) — 707.6: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [different-ai/openwork](https://github.com/different-ai/openwork) — 679.9: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [ansible/ansible](https://github.com/ansible/ansible) — 659.8: AI agent / workflow
- [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) — 606.3: AI agent / workflow
- [microsoft/AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners) — 604.3: AI agent / workflow
- [mshumer/Claude-of-Duty](https://github.com/mshumer/Claude-of-Duty) — 599.4: AI agent / workflow
- [pascalorg/editor](https://github.com/pascalorg/editor) — 556.3: AI agent / workflow
- [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) — 542.2: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
