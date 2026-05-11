import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const today = new Date().toISOString().slice(0, 10);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "";
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const SITE_URL = process.env.OPENROUTER_SITE_URL || "https://github.com/ulle73/ai-radar";
const APP_NAME = process.env.OPENROUTER_APP_NAME || "Jonas AI Radar";
const MAX_INPUT_CHARS = Number(process.env.RANKING_MAX_INPUT_CHARS || 60000);
const SUMMARY_README_CHARS = Number(process.env.RANKING_README_CHARS || 450);

async function readText(filePath, fallback = "") {
  try {
    return await readFile(path.join(root, filePath), "utf8");
  } catch {
    return fallback;
  }
}

async function readMarkdownFiles(dir) {
  const absDir = path.join(root, dir);
  try {
    const entries = await readdir(absDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name)
      .sort();

    const chunks = [];
    for (const file of files) {
      const rel = path.join(dir, file).replaceAll("\\", "/");
      const content = await readText(rel);
      chunks.push(`\n\n--- FILE: ${rel} ---\n${content}`);
    }
    return chunks.join("\n");
  } catch {
    return "";
  }
}

function truncate(text, maxChars) {
  const value = String(text || "");
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}\n\n[TRUNCATED TO ${maxChars} CHARS]`;
}

function markdownEscape(text) {
  return String(text || "").replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

function parseRadarJson(rawJson) {
  try {
    const parsed = JSON.parse(rawJson);
    return {
      meta: parsed.meta || {},
      repos: Array.isArray(parsed.repos) ? parsed.repos : [],
      developers: Array.isArray(parsed.developers) ? parsed.developers : []
    };
  } catch {
    return { meta: {}, repos: [], developers: [] };
  }
}

function compactReposForPrompt(repos) {
  return repos
    .map((repo, index) => ({
      index: index + 1,
      full_name: repo.full_name,
      url: repo.html_url,
      sources: repo.source_names || [],
      description: repo.description || "",
      language: repo.language || "",
      topics: repo.topics || [],
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      trend_score: repo.trend_score || 0,
      readme_excerpt: truncate(repo.readme_excerpt || "", SUMMARY_README_CHARS)
    }))
    .map((repo) => JSON.stringify(repo))
    .join("\n");
}

function localHeuristicScore(repo) {
  const text = `${repo.full_name || ""} ${repo.description || ""} ${(repo.topics || []).join(" ")} ${repo.readme_excerpt || ""}`.toLowerCase();

  const buckets = [
    { label: "AI agent / workflow", weight: 250, terms: ["agent", "agents", "ai-agent", "mcp", "claude", "codex", "workflow", "skills", "memory", "rag"] },
    { label: "Web / e-commerce / FAIV", weight: 190, terms: ["wordpress", "woocommerce", "ecommerce", "commerce", "devtools", "browser", "chrome", "frontend", "web", "ui"] },
    { label: "Data / scraping / företagslistor", weight: 170, terms: ["scrap", "crawler", "browser automation", "headless", "etl", "data", "pipeline", "index"] },
    { label: "Trading / finance / stock-signals", weight: 160, terms: ["trading", "finance", "financial", "market", "stock", "equity", "indicator", "research"] },
    { label: "Content / Socials / marketing", weight: 110, terms: ["video", "content", "social", "marketing", "publish", "calendar"] },
    { label: "Documents / wedding planner", weight: 90, terms: ["document", "pdf", "signature", "planner", "template"] }
  ];

  let score = 80;
  const matched = [];

  for (const bucket of buckets) {
    const hits = bucket.terms.filter((term) => text.includes(term));
    if (hits.length) {
      score += Math.min(bucket.weight, hits.length * 42);
      matched.push(bucket.label);
    }
  }

  const stars = repo.stargazers_count || 0;
  score += Math.min(90, Math.log10(stars + 1) * 18);

  if ((repo.source_names || []).some((source) => source.includes("Trending"))) score += 35;
  if (text.includes("exploit") || text.includes("vulnerability") || text.includes("vpn") || text.includes("censorship")) score -= 160;
  if (text.includes("gaussian") || text.includes("3d")) score -= 90;

  score = Math.max(20, Math.min(920, score));
  return {
    score: Number(score.toFixed(1)),
    primaryMatch: matched[0] || "Svag/oklar match",
    secondaryMatch: matched[1] || "-"
  };
}

function makeFallbackRanking({ repos, meta, reason }) {
  const ranked = repos
    .map((repo) => {
      const heuristic = localHeuristicScore(repo);
      let action = "Bevaka";
      if (heuristic.score >= 650) action = "Testa nu";
      else if (heuristic.score >= 430) action = "Spara för senare";
      else if (heuristic.score < 220) action = "Ignorera";

      return {
        repo,
        ...heuristic,
        action
      };
    })
    .sort((a, b) => b.score - a.score);

  const lines = [];
  lines.push(`# AI Radar Totalranking – ${today}`);
  lines.push("");
  lines.push("## Sammanfattning");
  lines.push("");
  lines.push("Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en användbar textrespons. Den här rankingen är heuristisk och bör ses som en stabil backup, inte som den slutliga LLM-analysen.");
  lines.push("");
  lines.push(`- Radar datum: ${meta.date || today}`);
  lines.push(`- Repos rankade: ${ranked.length}`);
  if (reason) lines.push(`- Fallback-orsak: ${reason}`);
  lines.push("");
  lines.push("## Rankingmodell");
  lines.push("");
  lines.push("Fallbackmodellen söker efter matchningar mot Jonas mål: AI-agent workflows, FAIV/web/e-commerce, data/scraping, stock-signals/finance, content/social och dokument/planning. Den justerar även för stars, trending-källa och brus/risk.");
  lines.push("");
  lines.push("## Totalranking");
  lines.push("");
  lines.push("| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |");
  lines.push("|---:|---:|---|---|---|---|---|");

  ranked.forEach((item, index) => {
    const repo = item.repo;
    const reasonText = repo.description || `Topics: ${(repo.topics || []).join(", ") || "-"}`;
    lines.push(`| ${index + 1} | ${item.score} | [${repo.full_name}](${repo.html_url}) | ${markdownEscape(item.primaryMatch)} | ${markdownEscape(item.secondaryMatch)} | ${item.action} | ${markdownEscape(reasonText)} |`);
  });

  lines.push("");
  lines.push("## Toppkandidater att agera på");
  lines.push("");
  ranked.filter((item) => item.action === "Testa nu").slice(0, 5).forEach((item) => {
    lines.push(`- [${item.repo.full_name}](${item.repo.html_url}) — ${item.score}: ${item.primaryMatch}`);
  });

  lines.push("");
  lines.push("## Bra att spara för senare");
  lines.push("");
  ranked.filter((item) => item.action === "Spara för senare").slice(0, 10).forEach((item) => {
    lines.push(`- [${item.repo.full_name}](${item.repo.html_url}) — ${item.score}: ${item.primaryMatch}`);
  });

  lines.push("");
  lines.push("## Brus / ignorera");
  lines.push("");
  ranked.filter((item) => item.action === "Ignorera").forEach((item) => {
    lines.push(`- [${item.repo.full_name}](${item.repo.html_url}) — ${item.score}`);
  });

  lines.push("");
  lines.push("## Nya idékandidater");
  lines.push("");
  lines.push("Inga nya idékandidater skapades automatiskt i fallbackläget. Kör OpenRouter-ranking med fungerande modell för bättre idégenerering.");

  return `${lines.join("\n")}\n`;
}

function buildPrompt({ radar, goals, projects, ideas, candidates, repos }) {
  const input = `
# Goals
${goals || "No GOALS.md found."}

# Latest radar compact JSONL
${compactReposForPrompt(repos)}

# Latest radar markdown
${radar}

# Projects memory bank
${projects || "No project files found."}

# Ideas memory bank
${ideas || "No idea files found."}

# Existing generated idea candidates
${candidates || "No candidates found."}
`;

  return `Du är Jonas personliga AI Radar-analytiker.

Uppgift: analysera dagens GitHub Radar och skapa en permanent totalranking som kan sparas i repo och läsas om ett år.

Du ska ranka ALLA repon från dagens radar, inte bara topp 3. Använd GOALS.md, Jonas projektbank, idébank och befintliga kandidater som bedömningsgrund.

VIKTIGT:
- Svara ENDAST med markdown.
- Skapa en långsiktig rankingfil, inte en chattig rapport.
- Använd JonasFitScore 0–1000 med decimaler, t.ex. 842.5.
- Undvik att många får samma score. Var granulär.
- Rankingen ska spegla hur mycket repot faktiskt kan hjälpa Jonas projekt, idéer eller strategiska edge.
- Prioritera praktisk nytta framför hype.
- Var hård med brus.
- Om ett repo passar FAIV/design/UI: nämn att relevant DESIGN.md från https://github.com/voltagent/awesome-design-md bör användas innan UI/design ändras.
- Föreslå inte att implementera trading-agenter som beslutsmotor i stock-signals; de får bara vara researchinspiration om de är relevanta.

Rankingmodell:
- Projektmatchning: 0–300
- Idébanksmatchning: 0–200
- Praktisk implementering: 0–200
- Affärs-/intäktsnytta: 0–150
- Timing/nyhetsvärde: 0–100
- Strategisk edge: 0–50
- Total: 0–1000

Obligatoriskt output-format:

# AI Radar Totalranking – ${today}

## Sammanfattning
Kort slutsats om dagens viktigaste fynd.

## Rankingmodell
Beskriv modellen kort.

## Totalranking
| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|

Här ska ALLA repos från dagens radar listas i sorterad ordning.

Action ska vara en av:
- Testa nu
- Spara för senare
- Bevaka
- Ignorera

## Toppkandidater att agera på
Max 5.

## Bra att spara för senare
Max 10.

## Brus / ignorera
Lista tydligt.

## Nya idékandidater
Max 3. Skriv i kort markdown-format som kan kopieras till /chatgpt-genererade-ideer/candidates/.

Här är inputdata:

${truncate(input, MAX_INPUT_CHARS)}
`;
}

async function callOpenRouter(prompt) {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE_URL,
      "X-Title": APP_NAME
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: "You write durable markdown ranking reports. Return only the final markdown report. Do not restate the prompt. Do not include reasoning scratchpad."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.15,
      top_p: 0.85,
      max_tokens: 12000
    })
  });

  const bodyText = await response.text();

  if (!response.ok) {
    throw new Error(`OpenRouter error ${response.status}: ${bodyText}`);
  }

  let data;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new Error(`OpenRouter returned non-JSON response: ${bodyText.slice(0, 500)}`);
  }

  const choice = data?.choices?.[0];
  const content = choice?.message?.content || choice?.text || data?.output || "";

  if (!String(content).trim()) {
    const finishReason = choice?.finish_reason || "unknown";
    const errorHint = data?.error?.message || "no error message";
    throw new Error(`OpenRouter returned no message content. finish_reason=${finishReason}; hint=${errorHint}; raw=${JSON.stringify(data).slice(0, 1000)}`);
  }

  return String(content).trim() + "\n";
}

function isBadModelOutput(markdown) {
  const text = String(markdown || "");
  if (!text.includes("## Totalranking")) return true;
  if (!text.includes("| Rank | JonasFitScore | Repo |")) return true;
  if (text.includes("The question:") || text.includes("So we need to") || text.includes("Let's assign")) return true;
  return false;
}

async function main() {
  const rawJson = await readText("data/latest.json");
  const { meta, repos } = parseRadarJson(rawJson);

  const radar = await readText("data/latest.md");
  if (!radar.trim() && !repos.length) {
    throw new Error("data/latest.md and data/latest.json are missing or empty. Run npm run radar first.");
  }

  const goals = await readText("GOALS.md");
  const projects = await readMarkdownFiles("projects");
  const ideas = await readMarkdownFiles("ideas");
  const candidates = await readMarkdownFiles("chatgpt-genererade-ideer/candidates");

  let ranking;
  if (!OPENROUTER_API_KEY || !OPENROUTER_MODEL) {
    ranking = makeFallbackRanking({ repos, meta, reason: "OPENROUTER_API_KEY or OPENROUTER_MODEL missing" });
  } else {
    const prompt = buildPrompt({ radar, goals, projects, ideas, candidates, repos });
    try {
      ranking = await callOpenRouter(prompt);
      if (isBadModelOutput(ranking)) {
        ranking = makeFallbackRanking({ repos, meta, reason: "OpenRouter output failed validation" });
      }
    } catch (error) {
      console.warn(error.message);
      ranking = makeFallbackRanking({ repos, meta, reason: error.message });
    }
  }

  await mkdir(path.join(root, "rankings", "daily"), { recursive: true });
  await writeFile(path.join(root, "rankings", "daily", `${today}.md`), ranking, "utf8");
  await writeFile(path.join(root, "rankings", "latest.md"), ranking, "utf8");

  console.log(`Saved rankings/daily/${today}.md and rankings/latest.md`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
