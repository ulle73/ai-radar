# AI Radar Totalranking – 2026-07-06

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-06
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: leonxlnx/taste-skill; Missing repo from ranking: openai/codex-plugin-cc; Missing repo from ranking: ogulcancelik/herdr; Missing repo from ranking: asgeirtj/system_prompts_leaks; Missing repo from ranking: usestrix/strix; Missing repo from ranking: alibaba/page-agent; Missing repo from ranking: alirezarezvani/claude-skills

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 337 Claude Code skills & agent skills & plugins (30+ Agents, 70+ custom commands, 330+ skills, customizable references, scripts)for Claude Code, Codex, Gemini CLI, Cursor, and 8 more coding agents — engineering, marketing, product, compliance, C-level advisory, research, business operations, commercial & finance, and your daily productivity skills. |
| 2 | 825.4 | [Zackriya-Solutions/meetily](https://github.com/Zackriya-Solutions/meetily) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Privacy first, AI meeting assistant with 4x faster Parakeet/Whisper live transcription, speaker diarization, and Ollama summarization built on Rust. 100% local processing. no cloud required. Meetily (Meetly Ai - https://meetily.ai) is the #1 Self-hosted, Open-source Ai meeting note taker for macOS & Windows. |
| 3 | 811.8 | [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Extracted system prompts from Anthropic - Claude Fable 5, Opus 4.8, Claude Code, Claude Design. OpenAI - ChatGPT 5.5 Thinking, GPT 5.5 Instant, Codex. Google - Gemini 3.5 Flash, 3.1 Pro, Antigravity. xAI - Grok, Cursor, Copilot, VS Code, Perplexity, and more. Updated regularly. |
| 4 | 798.7 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Taste-Skill - gives your AI good taste. stops the AI from generating boring, generic slop |
| 5 | 795.4 | [alibaba/page-agent](https://github.com/alibaba/page-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — JavaScript in-page GUI agent. Control web interfaces with natural language. |
| 6 | 791.1 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free AI gateway: one endpoint, 231+ providers (50+ free), connect Claude Code, Codex, Cursor, Cline & Copilot to FREE Claude/GPT/Gemini. RTK+Caveman stacked compression saves 15-95% tokens, smart auto-fallback, MCP/A2A, multimodal APIs, Desktop/PWA. |
| 7 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 8 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 9 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 10 | 750.5 | [browser-use/video-use](https://github.com/browser-use/video-use) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Edit videos with coding agents |
| 11 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 12 | 740.3 | [xbtlin/ai-berkshire](https://github.com/xbtlin/ai-berkshire) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — AI 时代的伯克希尔：基于 Claude Code / Codex 的价值投资研究框架。巴菲特·芒格·段永平·李录四大师方法论 + 多Agent并行研究。\| AI-era Berkshire: a value investing research framework built for Claude Code / Codex. 4 masters' methodologies + multi-agent adversarial analysis. |
| 13 | 711.7 | [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Use Codex from Claude Code to review code or delegate tasks. |
| 14 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 15 | 678 | [usestrix/strix](https://github.com/usestrix/strix) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Open-source AI penetration testing tool to find and fix your app’s vulnerabilities. |
| 16 | 675.1 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Persistent Context Across Sessions for Every Agent – Captures everything your agent does during sessions, compresses it with AI, and injects relevant context back into future sessions. Works with Claude Code, OpenClaw, Codex, Gemini, Hermes, Copilot, OpenCode + More |
| 17 | 664 | [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A feed-forward 3D foundation model for reconstructing scenes from streaming data |
| 18 | 663.2 | [ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — agent multiplexer that lives in your terminal. |
| 19 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 20 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 21 | 628 | [harvard-edge/cs249r_book](https://github.com/harvard-edge/cs249r_book) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Machine Learning Systems |
| 22 | 611.6 | [simplex-chat/simplex-chat](https://github.com/simplex-chat/simplex-chat) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — SimpleX - the first messaging network operating without user identifiers of any kind - 100% private by design! iOS, Android and desktop apps 📱! |
| 23 | 603.8 | [elder-plinius/T3MP3ST](https://github.com/elder-plinius/T3MP3ST) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — autonomous red teaming platform; multi-agent offensive-security meta-harness |
| 24 | 580.4 | [rommapp/romm](https://github.com/rommapp/romm) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_DAILY — A beautiful, powerful, self-hosted rom manager and player. |
| 25 | 514 | [logto-io/logto](https://github.com/logto-io/logto) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — 🧑‍🚀 Authentication and authorization infrastructure for SaaS and AI apps, built on OIDC and OAuth 2.1 with multi-tenancy, SSO, and RBAC. |
| 26 | 467.6 | [jamesob/local-llm](https://github.com/jamesob/local-llm) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Everything I know about running LLMs locally |
| 27 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 28 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 29 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 30 | 355.1 | [ammaarreshi/Generals-Mac-iOS-iPad](https://github.com/ammaarreshi/Generals-Mac-iOS-iPad) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Command & Conquer Generals: Zero Hour running natively on macOS, iPhone & iPad — real engine (EA GPL v3 source, via GeneralsX), DXVK/MoltenVK renderer, RTS touch controls. No game assets included. |

## Toppkandidater att agera på

- [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) — 940: AI agent / workflow
- [Zackriya-Solutions/meetily](https://github.com/Zackriya-Solutions/meetily) — 825.4: AI agent / workflow
- [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) — 811.8: AI agent / workflow
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) — 798.7: AI agent / workflow
- [alibaba/page-agent](https://github.com/alibaba/page-agent) — 795.4: AI agent / workflow

## Bra att spara för senare

- [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) — 711.7: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [usestrix/strix](https://github.com/usestrix/strix) — 678: AI agent / workflow
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) — 675.1: AI agent / workflow
- [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) — 664: AI agent / workflow
- [ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) — 663.2: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [harvard-edge/cs249r_book](https://github.com/harvard-edge/cs249r_book) — 628: AI agent / workflow
- [simplex-chat/simplex-chat](https://github.com/simplex-chat/simplex-chat) — 611.6: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
