# AI Radar Totalranking – 2026-08-01

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-08-01
- Repos rankade: 30
- Fallback-orsak: OpenRouter returned no message content. finish_reason=length; hint=no error message; raw={"id":"gen-1785559030-7ZVPbNlcgrqKwXl54aUl","object":"chat.completion","created":1785559030,"model":"cohere/north-mini-code:free","provider":"Cohere","system_fingerprint":null,"service_tier":null,"choices":[{"index":0,"logprobs":null,"finish_reason":"length","native_finish_reason":"max_tokens","message":{"role":"assistant","content":null,"refusal":null,"reasoning":"We need to produce a markdown ranking report per the specification. The user wants a total ranking of exactly 30 repos from the Allowed repos list, each appearing once. We must rank them based on the scoring model and criteria. We have data for each repo: score (trend_score), source (TRUE_TRENDING_DAILY, TRUE_TRENDING_WEEKLY, EXTRA_SEARCH_API), description, topics, stars, etc. We need to compute a JonasFitScore 0-1000, granular, not many same scores. Use the ranking model: project match (0-300), idea match (0-200), practical implementation (0-200), business value (0-150), timing/news value and source priority (0-100), strate

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — AI agent skill that researches any topic across Reddit, X, YouTube, HN, Polymarket, and the web - then synthesizes a grounded summary |
| 2 | 874.5 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 3 | 843.9 | [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The fastest browser for AI agents to run browser automation, built for sharing your logged-in browser state with your AI agents, like Codex or Claude Code, without disturbing you. Zero cost, zero config. |
| 4 | 835.3 | [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Open-source & free — Battle-tested at Alibaba's scale. Hybrid architecture code review tool: deterministic pipelines + LLM Agent, precise line-level comments, built-in fine-tuned ruleset (NPE, thread-safety, XSS, SQL injection), OpenAI & Anthropic compatible. |
| 5 | 804 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .agents directory. |
| 6 | 794.1 | [block/buzz](https://github.com/block/buzz) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — A hive mind communication platform |
| 7 | 767 | [paperswithbacktest/awesome-systematic-trading](https://github.com/paperswithbacktest/awesome-systematic-trading) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A curated list of awesome libraries, packages, strategies, books, blogs, tutorials for systematic trading. |
| 8 | 760 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 9 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 10 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 11 | 758.2 | [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Turn any technical book PDF into a Claude Code skill — ready to study, reference, and use while you work. |
| 12 | 750.3 | [1jehuang/jcode](https://github.com/1jehuang/jcode) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The most RAM efficient harness |
| 13 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 14 | 694.7 | [agavra/tuicr](https://github.com/agavra/tuicr) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — a code review TUI with vim keybindings |
| 15 | 681.5 | [yc-software/qm](https://github.com/yc-software/qm) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Multiplayer agent harness for work |
| 16 | 680.1 | [different-ai/openwork](https://github.com/different-ai/openwork) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — The open-source alternative to Claude Cowork (powered by opencode) |
| 17 | 672.6 | [deepfakes/faceswap](https://github.com/deepfakes/faceswap) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Deepfakes Software For All |
| 18 | 662 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An agentic skills framework & software development methodology that works. |
| 19 | 617.9 | [geo-tp/ESP32-Bit-Pirate](https://github.com/geo-tp/ESP32-Bit-Pirate) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A Hardware Hacking Tool with Web-Based CLI That Speaks Every Protocol |
| 20 | 604.4 | [microsoft/AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — 12 Weeks, 24 Lessons, AI for All! |
| 21 | 553.6 | [chatwoot/chatwoot](https://github.com/chatwoot/chatwoot) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Open-source live-chat, email support, omni-channel desk. An alternative to Intercom, Zendesk, Salesforce Service Cloud etc. 🔥💬 |
| 22 | 544.5 | [zhaoxuya520/reverse-skill](https://github.com/zhaoxuya520/reverse-skill) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Reverse Engineering / Authorized Penetration Testing / Security Research Skill Router Pack AI-powered routing + On-demand toolchain bootstrapping + Self-evolving knowledge base Supports Claude Code, Kiro, Cursor, Cline, and other AI coding clients 逆向/渗透/安全技能路由包 - AI 自动路由 + 按需自举工具链 + 自动进化经验库 \| 支持 Claude Code / Kiro / Cursor / Cline 等代码 AI 客户端 |
| 23 | 542.9 | [pingdotgg/t3code](https://github.com/pingdotgg/t3code) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Topics: - |
| 24 | 542.4 | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A skill to stop your coding agent from burying the answer. ADHD-friendly output. |
| 25 | 534 | [usekaneo/kaneo](https://github.com/usekaneo/kaneo) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — 🎯 All you need. Nothing you don't. Open source project management that works for you, not against you. |
| 26 | 516.4 | [pascalorg/editor](https://github.com/pascalorg/editor) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Create and share 3D architectural projects. |
| 27 | 480.4 | [MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Open Frontier Intelligence |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 304.8 | [bashalarmistalt/decimen-optical-transfer](https://github.com/bashalarmistalt/decimen-optical-transfer) | Web / e-commerce / FAIV | Content / Socials / marketing | Bevaka | EXTRA_SEARCH_API — Topics: - |
| 30 | 212.9 | [xdash/FDE-the-Guidance-Book-of-Forward-Deployed-Engineer](https://github.com/xdash/FDE-the-Guidance-Book-of-Forward-Deployed-Engineer) | Web / e-commerce / FAIV | Documents / wedding planner | Ignorera | EXTRA_SEARCH_API — FDE（前沿部署工程师）从零入门指南（基于范冰《增长黑客》原书框架） |

## Toppkandidater att agera på

- [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) — 940: AI agent / workflow
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 874.5: AI agent / workflow
- [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) — 843.9: AI agent / workflow
- [alibaba/open-code-review](https://github.com/alibaba/open-code-review) — 835.3: AI agent / workflow
- [mattpocock/skills](https://github.com/mattpocock/skills) — 804: AI agent / workflow

## Bra att spara för senare

- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [agavra/tuicr](https://github.com/agavra/tuicr) — 694.7: AI agent / workflow
- [yc-software/qm](https://github.com/yc-software/qm) — 681.5: AI agent / workflow
- [different-ai/openwork](https://github.com/different-ai/openwork) — 680.1: AI agent / workflow
- [deepfakes/faceswap](https://github.com/deepfakes/faceswap) — 672.6: AI agent / workflow
- [obra/superpowers](https://github.com/obra/superpowers) — 662: AI agent / workflow
- [geo-tp/ESP32-Bit-Pirate](https://github.com/geo-tp/ESP32-Bit-Pirate) — 617.9: AI agent / workflow
- [microsoft/AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners) — 604.4: AI agent / workflow
- [chatwoot/chatwoot](https://github.com/chatwoot/chatwoot) — 553.6: AI agent / workflow
- [zhaoxuya520/reverse-skill](https://github.com/zhaoxuya520/reverse-skill) — 544.5: AI agent / workflow

## Brus / ignorera

- [xdash/FDE-the-Guidance-Book-of-Forward-Deployed-Engineer](https://github.com/xdash/FDE-the-Guidance-Book-of-Forward-Deployed-Engineer) — 212.9

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
