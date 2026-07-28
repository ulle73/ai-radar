# AI Radar Totalranking – 2026-07-28

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-28
- Repos rankade: 30
- Fallback-orsak: OpenRouter returned no message content. finish_reason=length; hint=no error message; raw={"id":"gen-1785213036-2Lkxy1BxXEYMEnHsJDvt","object":"chat.completion","created":1785213036,"model":"cohere/north-mini-code:free","provider":"Cohere","system_fingerprint":null,"service_tier":null,"choices":[{"index":0,"logprobs":null,"finish_reason":"length","native_finish_reason":"max_tokens","message":{"role":"assistant","content":null,"refusal":null,"reasoning":"We need to produce a markdown report with exactly 30 repos from Allowed repos, ranked with JonasFitScore 0-1000, action, motivation, etc. Must follow format:\n\n# AI Radar Totalranking – YYYY-MM-DD\n\n## Summary\nShort conclusion about today's most important findings. Clearly mention TRUE_TRENDING_DAILY and TRUE_TRENDING_WEEKLY prioritized over Extra Search API.\n\n## Ranking model\nBrief description.\n\n## Totalranking\nTable with columns: Rank, JonasFitScore, Repo, Primary match, Secondary match, Action, Motivation\n\nWe need exactly 30 rows, one per allowed repo. Must rank all allowed repos (there are 30 listed). So we ne

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 926 | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The design language that makes your AI harness better at design. |
| 2 | 903 | [moeru-ai/airi](https://github.com/moeru-ai/airi) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 💖🧸 Self hosted, you-owned Grok Companion, a container of souls of waifu, cyber livings to bring them into our worlds, wishing to achieve Neuro-sama's altitude. Capable of realtime voice chat, Minecraft, Factorio playing. Web / macOS / Windows supported. |
| 3 | 874.5 | [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open-source & free — Battle-tested at Alibaba's scale. Hybrid architecture code review tool: deterministic pipelines + LLM Agent, precise line-level comments, built-in fine-tuned ruleset (NPE, thread-safety, XSS, SQL injection), OpenAI & Anthropic compatible. |
| 4 | 874.3 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 5 | 865.1 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free MIT AI gateway: one endpoint, 290+ providers (90+ free), 500+ models — Kimi, Claude, GPT, OpenAI, Gemini, GLM, DeepSeek, MiniMax. Works with Claude Code, Codex, Cursor, OpenCode, Cline & Copilot. Quota-aware auto-fallback, RTK+Caveman compression saves 15-95% tokens, MCP/A2A, Desktop/PWA. Built by 500+ contributors |
| 6 | 838.1 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Local-first code intelligence graph for MCP and CLI. Builds a persistent map of your codebase so AI coding tools read only what matters, with benchmarked context reductions on reviews and large-repo workflows. |
| 7 | 826.7 | [NanmiCoder/MediaCrawler](https://github.com/NanmiCoder/MediaCrawler) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 小红书笔记 \| 评论爬虫、抖音视频 \| 评论爬虫、快手视频 \| 评论爬虫、B 站视频 ｜ 评论爬虫、微博帖子 ｜ 评论爬虫、百度贴吧帖子 ｜ 百度贴吧评论回复爬虫 \| 知乎问答文章｜评论爬虫 |
| 8 | 804 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .agents directory. |
| 9 | 795.1 | [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 《深入理解 AI Agent：设计原理与工程实践》（李博杰 著）开源主仓库：全书正文、编译版 PDF 与按章配套代码 |
| 10 | 760 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 11 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 12 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 13 | 749.2 | [1jehuang/jcode](https://github.com/1jehuang/jcode) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The most RAM effiecent harness |
| 14 | 747.6 | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Kronos: A Foundation Model for the Language of Financial Markets |
| 15 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 16 | 678.6 | [earendil-works/pi](https://github.com/earendil-works/pi) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI |
| 17 | 673.4 | [oblien/openship](https://github.com/oblien/openship) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Self-hosted deployment platform |
| 18 | 672.7 | [0xwilliamortiz/openclaude-improved](https://github.com/0xwilliamortiz/openclaude-improved) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — runs anywhere. uses anything |
| 19 | 670.3 | [opengeos/GeoLibre](https://github.com/opengeos/GeoLibre) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A lightweight, cloud-native GIS platform for visualizing, exploring, and analyzing geospatial data. It runs in the web browser, on the desktop, on mobile, and inside Jupyter notebooks. |
| 20 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 21 | 658.7 | [agegr/pi-web](https://github.com/agegr/pi-web) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Web UI for the pi coding agent |
| 22 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 23 | 627.8 | [jenkinsci/jenkins](https://github.com/jenkinsci/jenkins) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Jenkins automation server |
| 24 | 594.3 | [mshumer/Claude-of-Duty](https://github.com/mshumer/Claude-of-Duty) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A Call of Duty-quality FPS in Three.js, built from a single prompt. |
| 25 | 540.9 | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A skill for your coding agent to stop it from burying the answer. ADHD-friendly output. |
| 26 | 472.4 | [MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Open Frontier Intelligence |
| 27 | 461.2 | [permissionlesstech/bitchat](https://github.com/permissionlesstech/bitchat) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — bluetooth mesh chat, IRC vibes |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 422 | [amnezia-vpn/amnezia-client](https://github.com/amnezia-vpn/amnezia-client) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Amnezia VPN Client (Desktop+Mobile) |
| 30 | 388.5 | [yorukot/superfile](https://github.com/yorukot/superfile) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | TRUE_TRENDING_DAILY — Pretty fancy and modern terminal file manager |

## Toppkandidater att agera på

- [pbakaus/impeccable](https://github.com/pbakaus/impeccable) — 926: AI agent / workflow
- [moeru-ai/airi](https://github.com/moeru-ai/airi) — 903: AI agent / workflow
- [alibaba/open-code-review](https://github.com/alibaba/open-code-review) — 874.5: AI agent / workflow
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 874.3: AI agent / workflow
- [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) — 865.1: AI agent / workflow

## Bra att spara för senare

- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [earendil-works/pi](https://github.com/earendil-works/pi) — 678.6: AI agent / workflow
- [oblien/openship](https://github.com/oblien/openship) — 673.4: AI agent / workflow
- [0xwilliamortiz/openclaude-improved](https://github.com/0xwilliamortiz/openclaude-improved) — 672.7: AI agent / workflow
- [opengeos/GeoLibre](https://github.com/opengeos/GeoLibre) — 670.3: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [agegr/pi-web](https://github.com/agegr/pi-web) — 658.7: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [jenkinsci/jenkins](https://github.com/jenkinsci/jenkins) — 627.8: AI agent / workflow
- [mshumer/Claude-of-Duty](https://github.com/mshumer/Claude-of-Duty) — 594.3: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
