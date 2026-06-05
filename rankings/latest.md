# AI Radar Totalranking – 2026-06-05

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-06-05
- Repos rankade: 30
- Fallback-orsak: OpenRouter returned no message content. finish_reason=length; hint=no error message; raw={"id":"gen-1780638536-Pv0d3mW5LlGt9ndGCROF","object":"chat.completion","created":1780638536,"model":"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning-20260428:free","provider":"Nvidia","system_fingerprint":null,"service_tier":null,"choices":[{"index":0,"logprobs":null,"finish_reason":"length","native_finish_reason":"length","message":{"role":"assistant","content":null,"refusal":null,"reasoning":"We need to output markdown ranking report with exactly 30 repos, sorted by JonasFitScore descending. Must include columns: Rank, JonasFitScore, Repo, Primary match, Secondary match, Action, Motivation. Must ensure each repo appears exactly once, from Allowed repos list. Must not add repos not in list. Must ensure max 5 \"Testa now\", max 10 \"Spara för senare\", max 10 \"Bevaka\", rest \"Ignore\". Also need to ensure at least 7 of top 10 from TRUE_TRENDING_DAILY/TRUE_TRENDING_WEEKLY. Also need to ensure 720-1000 score => \"Testa nu\". 500-719 => \"Spara för senare\" or \"Bevaka\". 300-499 => \"Bev

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 2 | 940 | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Graphs that teach > graphs that impress. Turn any code into an interactive knowledge graph you can explore, search, and ask questions about. Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, and more. |
| 3 | 940 | [revfactory/harness](https://github.com/revfactory/harness) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — A meta-skill that designs domain-specific agent teams, defines specialized agents, and generates the skills they use. |
| 4 | 940 | [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Memory engine and app that is extremely fast, scalable. The Memory API for the AI era. |
| 5 | 879.6 | [lfnovo/open-notebook](https://github.com/lfnovo/open-notebook) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An Open Source implementation of Notebook LM with more flexibility and features |
| 6 | 844 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The agent that grows with you |
| 7 | 794.2 | [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Official Compound Engineering plugin for Claude Code, Codex, Cursor, and more |
| 8 | 793.4 | [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — NVIDIA Cosmos is an open platform of world models, datasets, and tools that enables developers to build Physical AI for robots, autonomous vehicles, smart infrastructure, and more. |
| 9 | 789.6 | [chopratejas/headroom](https://github.com/chopratejas/headroom) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Compress tool outputs, logs, files, and RAG chunks before they reach the LLM. 60-95% fewer tokens, same answers. Library, proxy, MCP server. |
| 10 | 774.6 | [PaddlePaddle/PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Turn any PDF or image document into structured data for your AI. A powerful, lightweight OCR toolkit that bridges the gap between images/PDFs and LLMs. Supports 100+ languages. |
| 11 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 12 | 760 | [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The headless browser for AI agents and web scraping |
| 13 | 755.3 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Taste-Skill - gives your AI good taste. stops the AI from generating boring, generic slop |
| 14 | 747.8 | [Open-LLM-VTuber/Open-LLM-VTuber](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Talk to any LLM with hands-free voice interaction, voice interruption, and Live2D taking face running locally across platforms |
| 15 | 736.1 | [openclaw/openclaw-windows-node](https://github.com/openclaw/openclaw-windows-node) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Windows companion suite for OpenClaw - System Tray app, Shared library, Node, and PowerToys Command Palette extension |
| 16 | 704 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 17 | 692 | [pewdiepie-archdaemon/odysseus](https://github.com/pewdiepie-archdaemon/odysseus) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Self-hosted AI workspace. |
| 18 | 642.8 | [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Read-only developer endpoint scanner for on-disk package, extension, and developer-tool metadata, built to check exposure to known software supply-chain compromises. |
| 19 | 620 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 20 | 594 | [jwasham/coding-interview-university](https://github.com/jwasham/coding-interview-university) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A complete computer science study plan to become a software engineer. |
| 21 | 554 | [microsoft/markitdown](https://github.com/microsoft/markitdown) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Spara för senare | TRUE_TRENDING_WEEKLY — Python tool for converting files and office documents to Markdown. |
| 22 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 23 | 450.4 | [asz798838958/aBaiAutoplus](https://github.com/asz798838958/aBaiAutoplus) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — 多平台 AI 账号自动注册与管理 · 协议化付款一键开通 ChatGPT Plus |
| 24 | 412 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI agent / workflow | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. |
| 25 | 388 | [b-nnett/goose](https://github.com/b-nnett/goose) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Goose Swift proof-of-concept README |
| 26 | 385.7 | [aquasecurity/trivy](https://github.com/aquasecurity/trivy) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Find vulnerabilities, misconfigurations, secrets, SBOM in containers, Kubernetes, code repositories, clouds and more |
| 27 | 385.5 | [cpaczek/skylight](https://github.com/cpaczek/skylight) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | EXTRA_SEARCH_API — Project the aircraft passing overhead onto your ceiling in real time, from an RTL-SDR — with a live sky layer (sun, moon, stars, ISS) and where each plane is headed. |
| 28 | 371.2 | [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — A skill file for removing AI tells from prose |
| 29 | 322.6 | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_WEEKLY — 利用AI大模型，一键生成高清短视频 Generate short videos with one click using AI LLM. |
| 30 | 222.5 | [zgwl/chinese-buy-us-stock-guide](https://github.com/zgwl/chinese-buy-us-stock-guide) | Web / e-commerce / FAIV | Trading / finance / stock-signals | Ignorera | EXTRA_SEARCH_API — 美股指南 |

## Toppkandidater att agera på

- [affaan-m/ECC](https://github.com/affaan-m/ECC) — 940: AI agent / workflow
- [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) — 940: AI agent / workflow
- [revfactory/harness](https://github.com/revfactory/harness) — 940: AI agent / workflow
- [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) — 940: AI agent / workflow
- [lfnovo/open-notebook](https://github.com/lfnovo/open-notebook) — 879.6: AI agent / workflow

## Bra att spara för senare

- [openclaw/openclaw](https://github.com/openclaw/openclaw) — 704: AI agent / workflow
- [pewdiepie-archdaemon/odysseus](https://github.com/pewdiepie-archdaemon/odysseus) — 692: AI agent / workflow
- [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) — 642.8: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 620: AI agent / workflow
- [jwasham/coding-interview-university](https://github.com/jwasham/coding-interview-university) — 594: AI agent / workflow
- [microsoft/markitdown](https://github.com/microsoft/markitdown) — 554: Web / e-commerce / FAIV

## Brus / ignorera

- [zgwl/chinese-buy-us-stock-guide](https://github.com/zgwl/chinese-buy-us-stock-guide) — 222.5

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
