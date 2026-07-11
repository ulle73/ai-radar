# AI Radar Totalranking – 2026-07-11

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-11
- Repos rankade: 30
- Fallback-orsak: OpenRouter returned no message content. finish_reason=length; hint=no error message; raw={"id":"gen-1783744212-wqAsOY0bEFZVg2J99nro","object":"chat.completion","created":1783744212,"model":"cohere/north-mini-code-20260617:free","provider":"Cohere","system_fingerprint":null,"service_tier":null,"choices":[{"index":0,"logprobs":null,"finish_reason":"length","native_finish_reason":"max_tokens","message":{"role":"assistant","content":null,"refusal":null,"reasoning":"We need to produce a markdown ranking report per the instructions. Must rank exactly the 30 repos in Allowed repos, each once. Use the ranking model described. Need to compute a JonasFitScore 0-1000 for each repo, based on the model components: project match (0-300), idea match (0-200), practical implementation (0-200), business/revenue benefit (0-150), timing/news value and source priority (0-100), strategic edge (0-50). Sum to total.\n\nWe need to produce a total ranking sorted by score descending. Also need to assign Action based on score ranges: 720-1000 Test now, 500-719 Save for later, 300-499 Watch, 0-299 Ign

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 901.8 | [TencentCloud/CubeSandbox](https://github.com/TencentCloud/CubeSandbox) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Instant, Concurrent, Secure & Lightweight Sandbox for AI Agents. |
| 2 | 828.2 | [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — This is MCP server for Claude that gives it terminal control, file system search and diff file editing capabilities |
| 3 | 802 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Skills for Real Engineers. Straight from my .claude directory. |
| 4 | 802 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 5 | 792.5 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free AI gateway: one endpoint, 231+ providers (50+ free), connect Claude Code, Codex, Cursor, Cline & Copilot to FREE Claude/GPT/Gemini. RTK+Caveman stacked compression saves 15-95% tokens, smart auto-fallback, MCP/A2A, multimodal APIs, Desktop/PWA. |
| 6 | 788.4 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Production-grade engineering skills for AI coding agents. |
| 7 | 787 | [Zackriya-Solutions/meetily](https://github.com/Zackriya-Solutions/meetily) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Privacy first, AI meeting assistant with 4x faster Parakeet/Whisper live transcription, speaker diarization, and Ollama summarization built on Rust. 100% local processing. no cloud required. Meetily (Meetly Ai - https://meetily.ai) is the #1 Self-hosted, Open-source Ai meeting note taker for macOS & Windows. The #1 Ai Meeting Minutes generator. |
| 8 | 783.6 | [oven-sh/bun](https://github.com/oven-sh/bun) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one |
| 9 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 10 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 11 | 755.8 | [alibaba/page-agent](https://github.com/alibaba/page-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — JavaScript in-page GUI agent. Control web interfaces with natural language. |
| 12 | 746 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 13 | 730.5 | [asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Extracted system prompts from Anthropic - Claude Fable 5, Opus 4.8, Claude Code, Claude Design. OpenAI - ChatGPT GPT-5.6, Codex GPT-5.6, GPT-5.5. Google - Gemini 3.5 Flash, 3.1 Pro, Antigravity. xAI - Grok, Cursor, Copilot, VS Code, Perplexity, and more. Updated regularly. |
| 14 | 704.1 | [bradautomates/claude-video](https://github.com/bradautomates/claude-video) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Give Claude the ability to watch any video. /watch downloads, extracts frames, transcribes, hands it all to Claude. |
| 15 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 16 | 672.1 | [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Use Codex from Claude Code to review code or delegate tasks. |
| 17 | 639.3 | [Shpigford/knockoff](https://github.com/Shpigford/knockoff) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Chrome extension that filters pseudo-brand junk out of Amazon. Buy from real, established brands. |
| 18 | 638.5 | [usestrix/strix](https://github.com/usestrix/strix) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Open-source AI penetration testing tool to find and fix your app’s vulnerabilities. |
| 19 | 624.6 | [ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — agent multiplexer that lives in your terminal. |
| 20 | 622.5 | [facebook/astryx](https://github.com/facebook/astryx) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — An open source design system that's fully customizable and agent ready |
| 21 | 552 | [microsoft/TypeScript](https://github.com/microsoft/TypeScript) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — TypeScript is a superset of JavaScript that compiles to clean JavaScript output. |
| 22 | 500.4 | [catchorg/Catch2](https://github.com/catchorg/Catch2) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A modern, C++-native, test framework for unit-tests, TDD and BDD - using C++14, C++17 and later (C++11 support is in v2.x branch, and C++03 on the Catch1.x branch) |
| 23 | 499.4 | [abseil/abseil-cpp](https://github.com/abseil/abseil-cpp) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Abseil Common Libraries (C++) |
| 24 | 493 | [jbeder/yaml-cpp](https://github.com/jbeder/yaml-cpp) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — A YAML parser and emitter in C++ |
| 25 | 465.9 | [Robbyant/lingbot-world-v2](https://github.com/Robbyant/lingbot-world-v2) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Infinite Worlds with Versatile Interactions |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 28 | 386.8 | [withmarbleapp/os-taxonomy](https://github.com/withmarbleapp/os-taxonomy) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Topics: - |
| 29 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 30 | 367 | [chriskohlhoff/asio](https://github.com/chriskohlhoff/asio) | Data / scraping / företagslistor | Documents / wedding planner | Bevaka | TRUE_TRENDING_DAILY — Asio C++ Library |

## Toppkandidater att agera på

- [TencentCloud/CubeSandbox](https://github.com/TencentCloud/CubeSandbox) — 901.8: AI agent / workflow
- [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) — 828.2: AI agent / workflow
- [mattpocock/skills](https://github.com/mattpocock/skills) — 802: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 802: AI agent / workflow
- [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) — 792.5: AI agent / workflow

## Bra att spara för senare

- [bradautomates/claude-video](https://github.com/bradautomates/claude-video) — 704.1: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) — 672.1: AI agent / workflow
- [Shpigford/knockoff](https://github.com/Shpigford/knockoff) — 639.3: AI agent / workflow
- [usestrix/strix](https://github.com/usestrix/strix) — 638.5: AI agent / workflow
- [ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) — 624.6: AI agent / workflow
- [facebook/astryx](https://github.com/facebook/astryx) — 622.5: AI agent / workflow
- [microsoft/TypeScript](https://github.com/microsoft/TypeScript) — 552: AI agent / workflow
- [catchorg/Catch2](https://github.com/catchorg/Catch2) — 500.4: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
