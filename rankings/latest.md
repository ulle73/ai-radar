# AI Radar Totalranking – 2026-07-10

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-10
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: voltagent/awesome-design-md; Missing repo from ranking: addyosmani/agent-skills; Missing repo from ranking: madslorentzen/ai-job-search; Missing repo from ranking: iofficeai/officecli; Missing repo from ranking: unclecode/crawl4ai; Missing repo from ranking: anthropics/claude-cookbooks; Missing repo from ranking: vxcontrol/pentagi

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A collection of DESIGN.md files analysis by popular brand design systems. Drop one into your project and let coding agents generate a matching UI. |
| 2 | 940 | [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — AI-powered job application framework built on Claude Code. Fork it, fill in your profile, and let Claude evaluate jobs, tailor CVs, write cover letters, and prepare you for interviews. |
| 3 | 940 | [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — OfficeCLI is the first and best Office suite purpose-built for AI agents to read, edit, and automate Word, Excel, and PowerPoint files. Free, open-source, single binary, no Office installation required. |
| 4 | 940 | [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 🚀🤖 Crawl4AI: Open-source LLM Friendly Web Crawler & Scraper. Don't be shy, join here: https://discord.gg/jP8KfhDhyN |
| 5 | 912.1 | [vxcontrol/pentagi](https://github.com/vxcontrol/pentagi) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Fully autonomous AI Agents system capable of performing complex penetration testing tasks |
| 6 | 827.5 | [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — This is MCP server for Claude that gives it terminal control, file system search and diff file editing capabilities |
| 7 | 792.2 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free AI gateway: one endpoint, 231+ providers (50+ free), connect Claude Code, Codex, Cursor, Cline & Copilot to FREE Claude/GPT/Gemini. RTK+Caveman stacked compression saves 15-95% tokens, smart auto-fallback, MCP/A2A, multimodal APIs, Desktop/PWA. |
| 8 | 788.3 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Production-grade engineering skills for AI coding agents. |
| 9 | 786.9 | [Zackriya-Solutions/meetily](https://github.com/Zackriya-Solutions/meetily) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Privacy first, AI meeting assistant with 4x faster Parakeet/Whisper live transcription, speaker diarization, and Ollama summarization built on Rust. 100% local processing. no cloud required. Meetily (Meetly Ai - https://meetily.ai) is the #1 Self-hosted, Open-source Ai meeting note taker for macOS & Windows. |
| 10 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 11 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 12 | 755.7 | [alibaba/page-agent](https://github.com/alibaba/page-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — JavaScript in-page GUI agent. Control web interfaces with natural language. |
| 13 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 14 | 730.4 | [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Extracted system prompts from Anthropic - Claude Fable 5, Opus 4.8, Claude Code, Claude Design. OpenAI - ChatGPT 5.5 Thinking, GPT 5.5 Instant, Codex. Google - Gemini 3.5 Flash, 3.1 Pro, Antigravity. xAI - Grok, Cursor, Copilot, VS Code, Perplexity, and more. Updated regularly. |
| 15 | 715.4 | [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A collection of notebooks/recipes showcasing some fun and effective ways of using Claude. |
| 16 | 712.5 | [imthenachoman/How-To-Secure-A-Linux-Server](https://github.com/imthenachoman/How-To-Secure-A-Linux-Server) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — An evolving how-to guide for securing a Linux server. |
| 17 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 18 | 703.7 | [bradautomates/claude-video](https://github.com/bradautomates/claude-video) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Give Claude the ability to watch any video. /watch downloads, extracts frames, transcribes, hands it all to Claude. |
| 19 | 672.1 | [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Use Codex from Claude Code to review code or delegate tasks. |
| 20 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 21 | 638.8 | [Shpigford/knockoff](https://github.com/Shpigford/knockoff) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Chrome extension that filters pseudo-brand junk out of Amazon. Buy from real, established brands. |
| 22 | 638.4 | [usestrix/strix](https://github.com/usestrix/strix) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Open-source AI penetration testing tool to find and fix your app’s vulnerabilities. |
| 23 | 624.4 | [ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — agent multiplexer that lives in your terminal. |
| 24 | 622.3 | [facebook/astryx](https://github.com/facebook/astryx) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — An open source design system that's fully customizable and agent ready |
| 25 | 465.1 | [Robbyant/lingbot-world-v2](https://github.com/Robbyant/lingbot-world-v2) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Infinite Worlds with Versatile Interactions |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 384.7 | [withmarbleapp/os-taxonomy](https://github.com/withmarbleapp/os-taxonomy) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Topics: - |
| 28 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 29 | 360.6 | [SmartlyDressedGames/U3-SDK](https://github.com/SmartlyDressedGames/U3-SDK) | Web / e-commerce / FAIV | Documents / wedding planner | Bevaka | TRUE_TRENDING_DAILY — Source code for Unturned, a free open-world zombie survival sandbox game. |
| 30 | 307.5 | [x4gKing/X4G](https://github.com/x4gKing/X4G) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — 940: AI agent / workflow
- [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) — 940: AI agent / workflow
- [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) — 940: AI agent / workflow
- [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) — 940: AI agent / workflow
- [vxcontrol/pentagi](https://github.com/vxcontrol/pentagi) — 912.1: AI agent / workflow

## Bra att spara för senare

- [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) — 715.4: AI agent / workflow
- [imthenachoman/How-To-Secure-A-Linux-Server](https://github.com/imthenachoman/How-To-Secure-A-Linux-Server) — 712.5: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [bradautomates/claude-video](https://github.com/bradautomates/claude-video) — 703.7: AI agent / workflow
- [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) — 672.1: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [Shpigford/knockoff](https://github.com/Shpigford/knockoff) — 638.8: AI agent / workflow
- [usestrix/strix](https://github.com/usestrix/strix) — 638.4: AI agent / workflow
- [ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) — 624.4: AI agent / workflow
- [facebook/astryx](https://github.com/facebook/astryx) — 622.3: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
