# AI Radar Totalranking – 2026-07-30

## Sammanfattning

Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.

- Radar datum: 2026-07-30
- Repos rankade: 30
- Fallback-orsak: OpenRouter output failed validation: Missing ## Totalranking section; Missing ranking table header; Contains reasoning/prompt leakage; Expected 30 ranking rows, got 0; Missing repo from ranking: affaan-m/ecc; Missing repo from ranking: obra/superpowers; Missing repo from ranking: microsoft/vibevoice; Missing repo from ranking: different-ai/openwork

## Rankingmodell

Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.

## Totalranking

| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|
| 1 | 940 | [affaan-m/ECC](https://github.com/affaan-m/ECC) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond. |
| 2 | 903.2 | [moeru-ai/airi](https://github.com/moeru-ai/airi) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — 💖🧸 Self hosted, you-owned Grok Companion, a container of souls of waifu, cyber livings to bring them into our worlds, wishing to achieve Neuro-sama's altitude. Capable of realtime voice chat, Minecraft, Factorio playing. Web / macOS / Windows supported. |
| 3 | 874.4 | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Real-time global intelligence dashboard. AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface |
| 4 | 865.5 | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Never stop coding. Free MIT AI gateway: one endpoint, 290+ providers (90+ free), 500+ models — Kimi, Claude, GPT, OpenAI, Gemini, GLM, DeepSeek, MiniMax. Works with Claude Code, Codex, Cursor, OpenCode, Cline & Copilot. Quota-aware auto-fallback, RTK+Caveman compression saves 15-95% tokens, MCP/A2A, Desktop/PWA. Built by 500+ contributors |
| 5 | 843 | [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — The fastest browser for AI agents to run browser automation, built for sharing your logged-in browser state with your AI agents, like Codex or Claude Code, without disturbing you. Zero cost, zero config. |
| 6 | 834.9 | [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Open-source & free — Battle-tested at Alibaba's scale. Hybrid architecture code review tool: deterministic pipelines + LLM Agent, precise line-level comments, built-in fine-tuned ruleset (NPE, thread-safety, XSS, SQL injection), OpenAI & Anthropic compatible. |
| 7 | 804 | [mattpocock/skills](https://github.com/mattpocock/skills) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — Skills for Real Engineers. Straight from my .agents directory. |
| 8 | 802 | [obra/superpowers](https://github.com/obra/superpowers) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — An agentic skills framework & software development methodology that works. |
| 9 | 793.3 | [block/buzz](https://github.com/block/buzz) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — A hive mind communication platform |
| 10 | 789.9 | [1jehuang/jcode](https://github.com/1jehuang/jcode) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — The most RAM efficient harness |
| 11 | 760 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | EXTRA_SEARCH_API — Your own personal AI assistant. Any OS. Any Platform. The lobster way. 🦞 |
| 12 | 754.2 | [UditAkhourii/adhd](https://github.com/UditAkhourii/adhd) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — ADHD — a skill for coding agents. Tree-of-thought with pruning, built on the Claude & Codex Agent SDK. Fans out parallel divergent thoughts under different cognitive frames, scores, prunes traps, deepens the survivors. The no-brainer skill for creative and interdisciplinary work. |
| 13 | 746.6 | [huggingface/speech-to-speech](https://github.com/huggingface/speech-to-speech) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_DAILY — Build local voice agents with open-source models |
| 14 | 725.9 | [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | AI agent / workflow | Web / e-commerce / FAIV | Testa nu | TRUE_TRENDING_WEEKLY — 《深入理解 AI Agent：设计原理与工程实践》（李博杰 著）开源主仓库：全书正文、编译版 PDF 与按章配套代码 |
| 15 | 707.6 | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — Kronos: A Foundation Model for the Language of Financial Markets |
| 16 | 704 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — The agent that grows with you |
| 17 | 679.6 | [different-ai/openwork](https://github.com/different-ai/openwork) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — The open-source alternative to Claude Cowork (powered by opencode) |
| 18 | 675.3 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Persistent Context Across Sessions for Every Agent – Captures everything your agent does during sessions, compresses it with AI, and injects relevant context back into future sessions. Works with Claude Code, OpenClaw, Codex, Gemini, Hermes, Copilot, OpenCode + More |
| 19 | 672.7 | [opengeos/GeoLibre](https://github.com/opengeos/GeoLibre) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A lightweight, cloud-native GIS platform for visualizing, exploring, and analyzing geospatial data. It runs in the web browser, on the desktop, on mobile, and inside Jupyter notebooks. |
| 20 | 672.5 | [deepfakes/faceswap](https://github.com/deepfakes/faceswap) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Deepfakes Software For All |
| 21 | 640 | [anthropics/skills](https://github.com/anthropics/skills) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Public repository for Agent Skills |
| 22 | 638.3 | [grokability/snipe-it](https://github.com/grokability/snipe-it) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — A free open source IT asset/license management system |
| 23 | 599 | [mshumer/Claude-of-Duty](https://github.com/mshumer/Claude-of-Duty) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — A Call of Duty-quality FPS in Three.js, built from a single prompt. |
| 24 | 548.5 | [xikhar/persona](https://github.com/xikhar/persona) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | EXTRA_SEARCH_API — Bringing real-time voice to life. |
| 25 | 548 | [microsoft/VibeVoice](https://github.com/microsoft/VibeVoice) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_DAILY — Open-Source Frontier Voice AI |
| 26 | 541.9 | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | AI agent / workflow | Web / e-commerce / FAIV | Spara för senare | TRUE_TRENDING_WEEKLY — A skill for your coding agent to stop it from burying the answer. ADHD-friendly output. |
| 27 | 479.1 | [MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Open Frontier Intelligence |
| 28 | 454 | [anomalyco/opencode](https://github.com/anomalyco/opencode) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — The open source coding agent. |
| 29 | 380.3 | [0xwilliamortiz/ponytail-improved](https://github.com/0xwilliamortiz/ponytail-improved) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote. |
| 30 | 344.9 | [digimata/quill](https://github.com/digimata/quill) | AI agent / workflow | Web / e-commerce / FAIV | Bevaka | EXTRA_SEARCH_API — Ultra-minimalist macOS recording + transcription. |

## Toppkandidater att agera på

- [affaan-m/ECC](https://github.com/affaan-m/ECC) — 940: AI agent / workflow
- [moeru-ai/airi](https://github.com/moeru-ai/airi) — 903.2: AI agent / workflow
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor) — 874.4: AI agent / workflow
- [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) — 865.5: AI agent / workflow
- [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) — 843: AI agent / workflow

## Bra att spara för senare

- [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) — 707.6: AI agent / workflow
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 704: AI agent / workflow
- [different-ai/openwork](https://github.com/different-ai/openwork) — 679.6: AI agent / workflow
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) — 675.3: AI agent / workflow
- [opengeos/GeoLibre](https://github.com/opengeos/GeoLibre) — 672.7: AI agent / workflow
- [deepfakes/faceswap](https://github.com/deepfakes/faceswap) — 672.5: AI agent / workflow
- [anthropics/skills](https://github.com/anthropics/skills) — 640: AI agent / workflow
- [grokability/snipe-it](https://github.com/grokability/snipe-it) — 638.3: AI agent / workflow
- [mshumer/Claude-of-Duty](https://github.com/mshumer/Claude-of-Duty) — 599: AI agent / workflow
- [xikhar/persona](https://github.com/xikhar/persona) — 548.5: AI agent / workflow

## Brus / ignorera


## Nya idékandidater

Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.
