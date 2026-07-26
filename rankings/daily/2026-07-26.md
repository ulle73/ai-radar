# AI Radar Totalranking – 2026-07-26

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-26
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Expected 30 ranking rows, got 0; Missing repo from ranking: obra/superpowers; Missing repo from ranking: composiohq/awesome-claude-skills; Missing repo from ranking: alibaba/open-code-review; Missing repo from ranking: shiyu-coder/kronos; Missing repo from ranking: block/buzz; Missing repo from ranking: permissionlesstech/bitchat; Missing repo from ranking: anthropics/claude-cookbooks

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows |
| 2 | 880 | [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The fastest browser for AI agents to run web automation, built for sharing your logged-in browser state with your AI agents, like Codex or Claude Code, without disturbing you. Zero cost, zero config. |
| 3 | 874.2 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 4 | 873.6 | [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Open-source & free — Battle-tested at Alibaba's scale. Hybrid architecture code review tool: deterministic pipelines + LLM Agent, precise line-level comments, built-in fine-tuned ruleset (NPE, thread-safety, XSS, SQL injection), OpenAI & Anthropic compatible. |
| 5 | 864.7 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free MIT AI gateway: one endpoint, 290+ providers (90+ free), 500+ models — Kimi, Claude, GPT, OpenAI, Gemini, GLM, DeepSeek, MiniMax. Works with Claude Code, Codex, Cursor, OpenCode, Cline & Copilot. Quota-aware auto-fallback, RTK+Caveman compression saves 15-95% tokens, MCP/A2A, Desktop/PWA. Built by 500+ contributors |
| 6 | 854.9 | [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Learn it. Build it. Ship it for others. |
| 7 | 837.9 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Local-first code intelligence graph for MCP and CLI. Builds a persistent map of your codebase so AI coding tools read only what matters, with benchmarked context reductions on reviews and large-repo workflows. |
| 8 | 831.2 | [block/buzz](https://github.com/block/buzz) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — A hive mind communication platform |
| 9 | 802 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 10 | 794.2 | [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 《深入理解 AI Agent：设计原理与工程实践》（李博杰 著）开源主仓库：全书正文、编译版 PDF 与按章配套代码 |
| 11 | 760 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 12 | 760 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 13 | 760 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables. |
| 14 | 748.8 | [1jehuang/jcode](https://github.com/1jehuang/jcode) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The most intelligent agent harness for code |
| 15 | 747.4 | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Kronos: A Foundation Model for the Language of Financial Markets |
| 16 | 715.8 | [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A collection of notebooks/recipes showcasing some fun and effective ways of using Claude. |
| 17 | 704 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Skills for Real Engineers. Straight from my .agents directory. |
| 18 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 19 | 678.5 | [earendil-works/pi](https://github.com/earendil-works/pi) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI |
| 20 | 675.2 | [mikiarlo3/ai-copywriter](https://github.com/mikiarlo3/ai-copywriter) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — An AI copywriter that uses real copywriting skills + real marketing knowledge with human tone. |
| 21 | 661.9 | [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Kimi Code CLI — The Starting Point for Next-Gen Agents |
| 22 | 658.2 | [agegr/pi-web](https://github.com/agegr/pi-web) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Web UI for the pi coding agent |
| 23 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 24 | 624.5 | [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Kimi Code CLI is your next CLI agent. |
| 25 | 623.8 | [Automattic/harper](https://github.com/Automattic/harper) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Offline, privacy-first grammar checker. Fast, open-source, Rust-powered |
| 26 | 604.1 | [andrewyng/openworker](https://github.com/andrewyng/openworker) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Topics: - |
| 27 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 28 | 418.4 | [permissionlesstech/bitchat](https://github.com/permissionlesstech/bitchat) | Web / e-commerce / FAIV | Data / scraping / företagslistor | Bevaka | TRUE_TRENDING_DAILY — bluetooth mesh chat, IRC vibes |
| 29 | 293.8 | [Pumpkin-MC/Pumpkin](https://github.com/Pumpkin-MC/Pumpkin) | AI agent / workflow | Web / e-commerce / FAIV | Ignorera | TRUE_TRENDING_DAILY — Empowering everyone to host fast and efficient Minecraft servers. |
| 30 | 257.2 | [slvDev/esp32-ai](https://github.com/slvDev/esp32-ai) | AI agent / workflow | Data / scraping / företagslistor | Ignorera | EXTRA_SEARCH_API — Topics: - |

## Toppkandidater att agera på

- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — 940: AI agent / workflow
- [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) — 880: AI agent / workflow
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 874.2: AI agent / workflow
- [alibaba/open-code-review](https://github.com/alibaba/open-code-review) — 873.6: AI agent / workflow
- [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) — 864.7: AI agent / workflow

## Bra att spara för senare

- [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) — 715.8: AI agent / workflow
- [mattpocock/skills](https://github.com/mattpocock/skills) — 704: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [earendil-works/pi](https://github.com/earendil-works/pi) — 678.5: AI agent / workflow
- [mikiarlo3/ai-copywriter](https://github.com/mikiarlo3/ai-copywriter) — 675.2: AI agent / workflow
- [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) — 661.9: AI agent / workflow
- [agegr/pi-web](https://github.com/agegr/pi-web) — 658.2: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) — 624.5: AI agent / workflow
- [Automattic/harper](https://github.com/Automattic/harper) — 623.8: AI agent / workflow

## Brus / ignorera

- [Pumpkin-MC/Pumpkin](https://github.com/Pumpkin-MC/Pumpkin) — 293.8
- [slvDev/esp32-ai](https://github.com/slvDev/esp32-ai) — 257.2

## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
