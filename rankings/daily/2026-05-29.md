# AI Radar Totalranking – 2026-05-29

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-05-29
- Repos rankade: 30
- Fallback-orsak: OpenRouter returned no message content. finish_reason=length; hint=no error message; raw={"id":"gen-1780033207-WA3Ty2lGP7Qvz5fiV085","object":"chat.completion","created":1780033207,"model":"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning-20260428:free","provider":"Nvidia","system_fingerprint":null,"service_tier":null,"choices":[{"index":0,"logprobs":null,"finish_reason":"length","native_finish_reason":"length","message":{"role":"assistant","content":null,"refusal":null,"reasoning":"We need to produce a markdown ranking report with exactly 30 unique repos from Allowed repos, sorted by JonasFitScore descending. Must include columns: Rank, JonasFitScore, Repo, Primär match, Sekundär match, Action, Motivation. Must obey action limits: max 5 \"Teste nu\", max 10 \"Spara för senare\", max 10 \"Bevaka\", rest \"Ignore\". Also need to ensure at least 7 of top 10 from TRUE_TRENDING_DAILY/TRUE_TRENDING_WEEKLY. Also need to ensure that repos are exactly those in Allowed repos list (the 30 listed). We must rank them based on score (JonasFitScore) which is given in each repo entry (the \

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 2 | 940 | [revfactory/harness](https://github.com/revfactory/harness) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A meta-skill that designs domain-specific agent teams, defines specialized agents, and generates the skills they use. |
| 3 | 940 | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Graphs that teach > graphs that impress. Turn any code into an interactive knowledge graph you can explore, search, and ask questions about. Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, and more. |
| 4 | 940 | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Open source repository of plugins primarily intended for knowledge workers to use in Claude Cowork |
| 5 | 859.6 | [ruvnet/RuView](https://github.com/ruvnet/RuView) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — π RuView turns commodity WiFi signals into real-time spatial intelligence, vital sign monitoring, and presence detection — all without a single pixel of video. |
| 6 | 839.1 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Pre-indexed code knowledge graph for Claude Code, Codex, Gemini, Cursor, OpenCode, AntiGravity, Kiro, and Hermes Agent — fewer tokens, fewer tool calls, 100% local |
| 7 | 799.5 | [twentyhq/twenty](https://github.com/twentyhq/twenty) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The open alternative to Salesforce, designed for AI. |
| 8 | 794.1 | [presenton/presenton](https://github.com/presenton/presenton) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Open-Source AI Presentation Generator and API (Gamma, Beautiful AI, Decktopus Alternative) |
| 9 | 794 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Taste-Skill - gives your AI good taste. stops the AI from generating boring, generic slop |
| 10 | 767.3 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Learn it. Build it. Ship it for others. |
| 11 | 760 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 12 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 13 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 14 | 760 | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Browser automation CLI for AI agents |
| 15 | 760 | [emdash-cms/emdash](https://github.com/emdash-cms/emdash) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — EmDash is a full-stack TypeScript CMS based on Astro; the spiritual successor to WordPress |
| 16 | 756.9 | [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 754 structured cybersecurity skills for AI agents · Mapped to 5 frameworks: MITRE ATT&CK, NIST CSF 2.0, MITRE ATLAS, D3FEND & NIST AI RMF · agentskills.io standard · Works with Claude Code, GitHub Copilot, Codex CLI, Cursor, Gemini CLI & 20+ platforms · 26 security domains · Apache 2.0 |
| 17 | 746 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent that grows with you |
| 18 | 734.7 | [cursor/plugins](https://github.com/cursor/plugins) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Cursor plugin specification and official plugins |
| 19 | 689.4 | [op7418/guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — 🪧 Claude Code / Codex skill — generate Xiaohongshu carousels & WeChat 21:9+1:1 cover pairs. Editorial × Swiss visual systems, 28 layouts, 10 themes, single-file HTML → PNG. 小红书图文 + 公众号封面对 |
| 20 | 664 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 21 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 22 | 594 | [microsoft/markitdown](https://github.com/microsoft/markitdown) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_DAILY — Python tool for converting files and office documents to Markdown. |
| 23 | 530.4 | [alfiyahkamilah1239298/WallpaperDownloader-26](https://github.com/alfiyahkamilah1239298/WallpaperDownloader-26) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A comprehensive community toolkit for organizing, creating, and managing dynamic wallpaper projects and assets, enhancing your Wallpaper Engine experience. |
| 24 | 468 | [DigitalPlatDev/FreeDomain](https://github.com/DigitalPlatDev/FreeDomain) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — DigitalPlat FreeDomain: Free Domain For Everyone |
| 25 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 26 | 421.6 | [byoungd/English-level-up-tips](https://github.com/byoungd/English-level-up-tips) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — An advanced guide to learn English which might benefit you a lot 🎉 . 离谱的英语学习指南/英语学习教程/英语学习/学英语 |
| 27 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 28 | 409.4 | [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — A skill file for removing AI tells from prose |
| 29 | 370 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 30 | 319.6 | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | Web / e-commerce / FAIV | Trading / finance / stock-signals | Bevaka | TRUE_TRENDING_DAILY — 利用AI大模型，一键生成高清短视频 Generate short videos with one click using AI LLM. |

## Toppkandidater att agera på

- [affaan-m/ECC](https://github.com/affaan-m/ECC) — 940: AI agent / workflow
- [revfactory/harness](https://github.com/revfactory/harness) — 940: AI agent / workflow
- [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) — 940: AI agent / workflow
- [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) — 940: AI agent / workflow
- [ruvnet/RuView](https://github.com/ruvnet/RuView) — 859.6: AI agent / workflow

## Bra att spara för senare

- [op7418/guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) — 689.4: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 664: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [microsoft/markitdown](https://github.com/microsoft/markitdown) — 594: Web / e-commerce / FAIV
- [alfiyahkamilah1239298/WallpaperDownloader-26](https://github.com/alfiyahkamilah1239298/WallpaperDownloader-26) — 530.4: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
