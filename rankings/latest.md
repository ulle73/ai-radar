# AI Radar Totalranking – 2026-06-04

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-04
- Repos rankade: 30
- Fallback-orsak: OpenRouter returned no message content. finish_reason=length; hint=no error message; raw={"id":"gen-1780553313-vaFMPzD503LOVQChKnGi","object":"chat.completion","created":1780553313,"model":"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning-20260428:free","provider":"Nvidia","system_fingerprint":null,"service_tier":null,"choices":[{"index":0,"logprobs":null,"finish_reason":"length","native_finish_reason":"length","message":{"role":"assistant","content":null,"refusal":null,"reasoning":"We need to output markdown ranking report with exactly 30 repos, sorted by JonasFitScore descending. Must include columns: Rank, JonasFitScore, Repo, Primary match, Secondary match, Action, Motivation.\n\nWe must ensure each repo appears exactly once, from Allowed repos list. Must not add any repo not in Allowed repos. The Allowed repos list includes 30 items (the ones enumerated). Let's verify count: The list includes 30 entries (index 1 to 30). Yes.\n\nWe need to compute JonasFitScore for each repo based on criteria. We have scores given in each repo JSON (trend_score). But we need to compute Jo

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 2 | 940 | [nesquena/hermes-webui](https://github.com/nesquena/hermes-webui) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Hermes WebUI: The best way to use Hermes Agent from the web or from your phone! |
| 3 | 940 | [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 🕷️ An adaptive Web Scraping framework that handles everything from a single request to a full-scale crawl! |
| 4 | 940 | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Graphs that teach > graphs that impress. Turn any code into an interactive knowledge graph you can explore, search, and ask questions about. Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, and more. |
| 5 | 940 | [revfactory/harness](https://github.com/revfactory/harness) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — A meta-skill that designs domain-specific agent teams, defines specialized agents, and generates the skills they use. |
| 6 | 940 | [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Memory engine and app that is extremely fast, scalable. The Memory API for the AI era. |
| 7 | 886 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The agent that grows with you |
| 8 | 882.4 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Pre-indexed code knowledge graph for Claude Code, Codex, Gemini, Cursor, OpenCode, AntiGravity, Kiro, and Hermes Agent — fewer tokens, fewer tool calls, 100% local |
| 9 | 795.2 | [opendataloader-project/opendataloader-pdf](https://github.com/opendataloader-project/opendataloader-pdf) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — PDF Parser for AI-ready data. Automate PDF accessibility. Open-source. |
| 10 | 794.1 | [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Official Compound Engineering plugin for Claude Code, Codex, Cursor, and more |
| 11 | 788.3 | [chopratejas/headroom](https://github.com/chopratejas/headroom) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Compress tool outputs, logs, files, and RAG chunks before they reach the LLM. 60-95% fewer tokens, same answers. Library, proxy, MCP server. |
| 12 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 13 | 755.2 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Taste-Skill - gives your AI good taste. stops the AI from generating boring, generic slop |
| 14 | 747.4 | [Open-LLM-VTuber/Open-LLM-VTuber](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Talk to any LLM with hands-free voice interaction, voice interruption, and Live2D taking face running locally across platforms |
| 15 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 16 | 691.2 | [pewdiepie-archdaemon/odysseus](https://github.com/pewdiepie-archdaemon/odysseus) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Self-hosted AI workspace. |
| 17 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 18 | 632 | [odoo/odoo](https://github.com/odoo/odoo) | Web / e-commerce / FAIV | Trading / finance / stock-signals | Spara för senare | TRUE_TRENDING_DAILY — Odoo. Open Source Apps To Grow Your Business. |
| 19 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 20 | 594 | [microsoft/markitdown](https://github.com/microsoft/markitdown) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_DAILY — Python tool for converting files and office documents to Markdown. |
| 21 | 464.6 | [SenhorH/tab-labeler](https://github.com/SenhorH/tab-labeler) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Rename browser tabs locally and bring order to chaotic sessions. |
| 22 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 23 | 450.1 | [asz798838958/aBaiAutoplus](https://github.com/asz798838958/aBaiAutoplus) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — 多平台 AI 账号自动注册与管理 · 协议化付款一键开通 ChatGPT Plus |
| 24 | 386.5 | [b-nnett/goose](https://github.com/b-nnett/goose) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Goose Swift proof-of-concept README |
| 25 | 385.7 | [aquasecurity/trivy](https://github.com/aquasecurity/trivy) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Find vulnerabilities, misconfigurations, secrets, SBOM in containers, Kubernetes, code repositories, clouds and more |
| 26 | 383.4 | [cpaczek/skylight](https://github.com/cpaczek/skylight) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Project the aircraft passing overhead onto your ceiling in real time, from an RTL-SDR — with a live sky layer (sun, moon, stars, ISS) and where each plane is headed. |
| 27 | 371.1 | [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — A skill file for removing AI tells from prose |
| 28 | 322.6 | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — 利用AI大模型，一键生成高清短视频 Generate short videos with one click using AI LLM. |
| 29 | 219 | [zgwl/chinese-buy-us-stock-guide](https://github.com/zgwl/chinese-buy-us-stock-guide) | Web / e-commerce / FAIV | Trading / finance / stock-signals | Ignorera | EXTRA_SEARCH_API — 美股指南 |
| 30 | 144.2 | [Gloridust/WechatOnCloud](https://github.com/Gloridust/WechatOnCloud) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | EXTRA_SEARCH_API — 云微WOC，云微信，自由连接 |

## Toppkandidater att agera på

- [affaan-m/ECC](https://github.com/affaan-m/ECC) — 940: AI agent / workflow
- [nesquena/hermes-webui](https://github.com/nesquena/hermes-webui) — 940: AI agent / workflow
- [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) — 940: AI agent / workflow
- [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) — 940: AI agent / workflow
- [revfactory/harness](https://github.com/revfactory/harness) — 940: AI agent / workflow

## Bra att spara för senare

- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [pewdiepie-archdaemon/odysseus](https://github.com/pewdiepie-archdaemon/odysseus) — 691.2: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [odoo/odoo](https://github.com/odoo/odoo) — 632: Web / e-commerce / FAIV
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [microsoft/markitdown](https://github.com/microsoft/markitdown) — 594: Web / e-commerce / FAIV

## Brus / ignorera

- [zgwl/chinese-buy-us-stock-guide](https://github.com/zgwl/chinese-buy-us-stock-guide) — 219
- [Gloridust/WechatOnCloud](https://github.com/Gloridust/WechatOnCloud) — 144.2

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
