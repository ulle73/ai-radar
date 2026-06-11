# AI Radar Totalranking – 2026-06-11

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-11
- Repos rankade: 30
- Fallback-orsak: OpenRouter returned no message content. finish_reason=length; hint=no error message; raw={"id":"gen-1781157972-ZROxAR6JiHSM38JQ0nPl","object":"chat.completion","created":1781157972,"model":"nvidia/nemotron-3-nano-30b-a3b:free","provider":"Nvidia","system_fingerprint":null,"service_tier":null,"choices":[{"index":0,"logprobs":null,"finish_reason":"length","native_finish_reason":"length","message":{"role":"assistant","content":null,"refusal":null,"reasoning":"We need to produce final markdown report with sections as specified. Must include:\n\n- Title \"# AI Radar Totalranking – 2026-06-11\"\n- Summary section with short conclusion, mention TRUE_TRENDING_DAILY and TRUE_TRENDING_WEEKLY priority over Extra Search API.\n- Ranking model description.\n- Totalranking table with exactly 30 unique repos from Allowed repos, sorted, with columns: Rank, JonasFitScore, Repo, Primär match, Sekundär match, Action, Motivering.\n- Must use JonasFitScore 0-1000 with decimals, avoid ties, granular.\n- Action values limited: max 5 \"Testa nu\", max 10 \"Spara för senare\". Others can be \"Bevak

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — AI agent skill that researches any topic across Reddit, X, YouTube, HN, Polymarket, and the web - then synthesizes a grounded summary |
| 2 | 940 | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — PM Skills Marketplace: 100+ agentic skills, commands, and plugins — from discovery to strategy, execution, launch, and growth. |
| 3 | 840.5 | [lfnovo/open-notebook](https://github.com/lfnovo/open-notebook) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — An Open Source implementation of Notebook LM with more flexibility and features |
| 4 | 837.8 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees. |
| 5 | 832.5 | [refactoringhq/tolaria](https://github.com/refactoringhq/tolaria) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Desktop app to manage markdown knowledge bases |
| 6 | 804 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The agent that grows with you |
| 7 | 786.1 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Production-grade engineering skills for AI coding agents. |
| 8 | 760 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 9 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 10 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 11 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 12 | 760 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — An open-source AI agent that brings the power of Gemini directly into your terminal. |
| 13 | 756.6 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Taste-Skill - gives your AI good taste. stops the AI from generating boring, generic slop |
| 14 | 752.8 | [chopratejas/headroom](https://github.com/chopratejas/headroom) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Compress tool outputs, logs, files, and RAG chunks before they reach the LLM. 60-95% fewer tokens, same answers. Library, proxy, MCP server. |
| 15 | 740.2 | [openai/plugins](https://github.com/openai/plugins) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — OpenAI Plugins |
| 16 | 708.5 | [Open-LLM-VTuber/Open-LLM-VTuber](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Talk to any LLM with hands-free voice interaction, voice interruption, and Live2D taking face running locally across platforms |
| 17 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 18 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 19 | 613.3 | [maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — open-source healthcare ai |
| 20 | 593.1 | [soxoj/maigret](https://github.com/soxoj/maigret) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — 🕵️‍♂️ Collect a dossier on a person by username from 3000+ sites |
| 21 | 554 | [microsoft/markitdown](https://github.com/microsoft/markitdown) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — Python tool for converting files and office documents to Markdown. |
| 22 | 512.1 | [NoopApp/noop](https://github.com/NoopApp/noop) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Offline WHOOP companion — pair your strap over Bluetooth, keep all data on your own device. No cloud, no account, no subscription. |
| 23 | 510.8 | [XiaomiMiMo/MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Topics: - |
| 24 | 510 | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models |
| 25 | 472.2 | [masterking32/MasterDnsVPN](https://github.com/masterking32/MasterDnsVPN) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Advanced DNS tunneling VPN for censorship bypass, optimized beyond DNSTT and SlipStream with low-overhead ARQ, resolver load balancing, high packet-loss stability and speed. |
| 26 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 27 | 426.3 | [shadcn/improve](https://github.com/shadcn/improve) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Use your most capable model to audit your codebase and write plans for cheaper models to execute. |
| 28 | 363 | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — 利用AI大模型，一键生成高清短视频 Generate short videos with one click using AI LLM. |
| 29 | 334 | [ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — An agent-managed museum exhibit, built in Rust with Gajae-Code / LazyCodex — developed and maintained with no human intervention. |
| 30 | 20 | [MSNightmare/RoguePlanet](https://github.com/MSNightmare/RoguePlanet) | Svag/oklar match | EXTRA_SEARCH_API | Ignorera | EXTRA_SEARCH_API — RoguePlanet Windows Defender Vulnerability |

## Toppkandidater att agera på

- [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) — 940: AI agent / workflow
- [phuryn/pm-skills](https://github.com/phuryn/pm-skills) — 940: AI agent / workflow
- [lfnovo/open-notebook](https://github.com/lfnovo/open-notebook) — 840.5: AI agent / workflow
- [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) — 837.8: AI agent / workflow
- [refactoringhq/tolaria](https://github.com/refactoringhq/tolaria) — 832.5: AI agent / workflow

## Bra att spara för senare

- [Open-LLM-VTuber/Open-LLM-VTuber](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber) — 708.5: AI agent / workflow
- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed) — 613.3: AI agent / workflow
- [soxoj/maigret](https://github.com/soxoj/maigret) — 593.1: AI agent / workflow
- [microsoft/markitdown](https://github.com/microsoft/markitdown) — 554: Web / e-commerce / FAIV
- [NoopApp/noop](https://github.com/NoopApp/noop) — 512.1: AI agent / workflow
- [XiaomiMiMo/MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) — 510.8: AI agent / workflow
- [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) — 510: AI agent / workflow

## Brus / ignorera

- [MSNightmare/RoguePlanet](https://github.com/MSNightmare/RoguePlanet) — 20

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
