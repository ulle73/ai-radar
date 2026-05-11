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

const ACTIONS = new Set(["Testa nu", "Spara för senare", "Bevaka", "Ignorera"]);
const DAILY = "GitHub Trending – daily";
const WEEKLY = "GitHub Trending – weekly";
const SEARCH = "GitHub Search API";

async function readText(filePath, fallback = "") {
  try {
    return await readFile(path.join(root, filePath), "utf8");
  } catch {
    return fallback;
  }
}

async function readMarkdownFiles(dir) {
  try {
    const absDir = path.join(root, dir);
    const entries = await readdir(absDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name)
      .sort();

    const chunks = [];
    for (const file of files) {
      const rel = path.join(dir, file).replaceAll("\\", "/");
      chunks.push(`\n\n--- FILE: ${rel} ---\n${await readText(rel)}`);
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
  return String(text || "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function sourcePriority(repo) {
  const sources = repo.source_names || [];
  if (sources.includes(DAILY)) return 3;
  if (sources.includes(WEEKLY)) return 2;
  if (sources.includes(SEARCH)) return 1;
  return 0;
}

function sourceLabel(repo) {
  const priority = sourcePriority(repo);
  if (priority === 3) return "TRUE_TRENDING_DAILY";
  if (priority === 2) return "TRUE_TRENDING_WEEKLY";
  if (priority === 1) return "EXTRA_SEARCH_API";
  return "UNKNOWN";
}

function isTrueTrending(repo) {
  return sourcePriority(repo) >= 2;
}

function dedupeRepos(repos) {
  const seen = new Map();

  for (const repo of repos || []) {
    if (!repo?.full_name) continue;
    const key = String(repo.full_name).toLowerCase();

    if (!seen.has(key)) {
      seen.set(key, { ...repo, source_names: [...(repo.source_names || [])] });
      continue;
    }

    const existing = seen.get(key);
    const sourceNames = new Set([...(existing.source_names || []), ...(repo.source_names || [])]);
    seen.set(key, {
      ...existing,
      ...repo,
      source_names: [...sourceNames],
      readme_excerpt: existing.readme_excerpt || repo.readme_excerpt || "",
      description: existing.description || repo.description || ""
    });
  }

  return [...seen.values()].sort((a, b) => {
    const sourceDelta = sourcePriority(b) - sourcePriority(a);
    if (sourceDelta !== 0) return sourceDelta;
    return (b.trend_score || 0) - (a.trend_score || 0);
  });
}

function compactReposForPrompt(repos) {
  return repos
    .map((repo, index) => ({
      index: index + 1,
      full_name: repo.full_name,
      url: repo.html_url,
      source_class: sourceLabel(repo),
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
    { label: "Web / e-commerce / FAIV", weight: 190, terms: ["wordpress", "woocommerce", "ecommerce", "commerce", "devtools", "browser", "chrome", "frontend", "web", "ui", "react"] },
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

  // True GitHub Trending should be the primary source signal.
  if (sourcePriority(repo) === 3) score += 150;
  else if (sourcePriority(repo) === 2) score += 110;
  else if (sourcePriority(repo) === 1) score += 10;

  const stars = repo.stargazers_count || 0;
  score += Math.min(70, Math.log10(stars + 1) * 14);

  if (text.includes("exploit") || text.includes("vulnerability") || text.includes("vpn") || text.includes("censorship")) score -= 160;
  if (text.includes("gaussian") || text.includes("3d")) score -= 70;

  // Search API-only repos should not dominate unless they are extremely well matched.
  if (sourcePriority(repo) === 1 && score > 760) score = 760;

  score = Math.max(20, Math.min(940, score));
  return {
    score: Number(score.toFixed(1)),
    primaryMatch: matched[0] || "Svag/oklar match",
    secondaryMatch: matched[1] || sourceLabel(repo)
  };
}

function actionForScore(score) {
  if (score >= 720) return "Testa nu";
  if (score >= 500) return "Spara för senare";
  if (score >= 300) return "Bevaka";
  return "Ignorera";
}

function makeFallbackRanking({ repos, meta, reason }) {
  const ranked = dedupeRepos(repos)
    .map((repo) => {
      const heuristic = localHeuristicScore(repo);
      return { repo, ...heuristic, action: actionForScore(heuristic.score) };
    })
    .sort((a, b) => b.score - a.score);

  const lines = [];
  lines.push(`# AI Radar Totalranking – ${today}`);
  lines.push("");
  lines.push("## Sammanfattning");
  lines.push("");
  lines.push("Automatisk fallback-ranking skapades eftersom OpenRouter inte returnerade en validerad ranking. Fallbacken prioriterar riktig GitHub Trending före Extra Search API.");
  lines.push("");
  lines.push(`- Radar datum: ${meta.date || today}`);
  lines.push(`- Repos rankade: ${ranked.length}`);
  if (reason) lines.push(`- Fallback-orsak: ${reason}`);
  lines.push("");
  lines.push("## Rankingmodell");
  lines.push("");
  lines.push("Fallbackmodellen premierar TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY som primär signal. Extra Search API är sekundärt och får inte dominera toppositionerna om det inte är extremt relevant.");
  lines.push("");
  lines.push("## Totalranking");
  lines.push("");
  lines.push("| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |");
  lines.push("|---:|---:|---|---|---|---|---|");

  ranked.forEach((item, index) => {
    const repo = item.repo;
    const reasonText = `${sourceLabel(repo)} — ${repo.description || `Topics: ${(repo.topics || []).join(", ") || "-"}`}`;
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
  const repoNames = repos.map((repo) => `${repo.full_name} | ${sourceLabel(repo)}`).join("\n");
  const trueTrendingCount = repos.filter(isTrueTrending).length;
  const input = `
# Goals
${goals || "No GOALS.md found."}

# Allowed repos - rank exactly these, once each
${repoNames}

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

VIKTIGASTE REGELN:
Jonas vill främst fånga upp repon från de riktiga GitHub Trending-url:erna:
- TRUE_TRENDING_DAILY = https://github.com/trending
- TRUE_TRENDING_WEEKLY = https://github.com/trending?since=weekly

Extra Search API är bara en kompletterande källa. Search API-repon får vara med i rankingen, men de ska inte dominera topp 5/topp 10 om de inte har extremt tydlig direkt nytta för Jonas projekt.

Du ska ranka EXAKT alla repos i listan "Allowed repos". Varje repo får förekomma exakt en gång i Totalranking. Du får inte lägga till repos som inte finns i Allowed repos.

Använd GOALS.md, Jonas projektbank, idébank och befintliga kandidater som bedömningsgrund.

Källprioritet i score:
- TRUE_TRENDING_DAILY ska få stark timing/nyhetsvärde-premie.
- TRUE_TRENDING_WEEKLY ska också få tydlig premie.
- EXTRA_SEARCH_API ska bedömas hårdare och främst ses som sidofynd.
- Om ett Search API-repo rankas före ett true-trending repo måste motiveringen vara mycket konkret.
- Minst 7 av topp 10 bör komma från TRUE_TRENDING_DAILY/TRUE_TRENDING_WEEKLY om det finns tillräckligt många relevanta true-trending repos. Dagens true-trending count är ${trueTrendingCount}.

VIKTIGT:
- Svara ENDAST med markdown.
- Skapa en långsiktig rankingfil, inte en chattig rapport.
- Använd JonasFitScore 0–1000 med decimaler.
- Undvik att många får samma score. Var granulär.
- Prioritera praktisk nytta framför hype.
- Var hård med brus.
- Om ett repo passar FAIV/design/UI: nämn att relevant DESIGN.md från https://github.com/voltagent/awesome-design-md bör användas innan UI/design ändras.
- Föreslå inte att implementera trading-agenter som beslutsmotor i stock-signals; de får bara vara researchinspiration om de är relevanta.
- Action ska hänga ihop med score:
  - 720–1000: Testa nu eller Spara för senare. Aldrig Ignorera.
  - 500–719: Spara för senare eller Bevaka. Aldrig Ignorera.
  - 300–499: Bevaka eller Ignorera.
  - 0–299: Ignorera.
- Max 5 repos får Action = Testa nu.
- Max 10 repos får Action = Spara för senare.
- Om du är osäker, välj Bevaka hellre än Testa nu.
- Hitta inte på exakta kostnadsbesparingar eller prestandalöften om README inte stödjer det.

Rankingmodell:
- Projektmatchning: 0–300
- Idébanksmatchning: 0–200
- Praktisk implementering: 0–200
- Affärs-/intäktsnytta: 0–150
- Timing/nyhetsvärde och källprioritet: 0–100
- Strategisk edge: 0–50
- Total: 0–1000

Obligatoriskt output-format:

# AI Radar Totalranking – ${today}

## Sammanfattning
Kort slutsats om dagens viktigaste fynd. Nämn tydligt att TRUE_TRENDING_DAILY och TRUE_TRENDING_WEEKLY prioriteras över Extra Search API.

## Rankingmodell
Beskriv modellen kort.

## Totalranking
| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |
|---:|---:|---|---|---|---|---|

Här ska EXAKT ${repos.length} unika repos från Allowed repos listas i sorterad ordning.

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
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      top_p: 0.8,
      max_tokens: 12000
    })
  });

  const bodyText = await response.text();
  if (!response.ok) throw new Error(`OpenRouter error ${response.status}: ${bodyText}`);

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

function extractRepoFromMarkdownRow(row) {
  const match = row.match(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/);
  return match ? `${match[1]}/${match[2]}`.toLowerCase() : "";
}

function extractScoreFromMarkdownRow(row) {
  const cells = row.split("|").map((cell) => cell.trim()).filter(Boolean);
  const scoreCell = cells[1] || "";
  const match = scoreCell.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

function extractActionFromMarkdownRow(row) {
  for (const action of ACTIONS) {
    if (row.includes(`| ${action} |`) || row.includes(`| **${action}** |`)) return action;
  }
  return "";
}

function extractRankingRows(markdown) {
  const lines = String(markdown || "").split("\n");
  const start = lines.findIndex((line) => /^##\s+Totalranking/i.test(line.trim()));
  if (start === -1) return [];

  const rows = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line.trim())) break;
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    if (trimmed.includes("---")) continue;
    if (/Rank\s*\|\s*JonasFitScore/i.test(trimmed)) continue;
    if (trimmed.includes("github.com/")) rows.push(trimmed);
  }
  return rows;
}

function validateModelOutput(markdown, repos) {
  const errors = [];
  const text = String(markdown || "");

  if (!text.includes("## Totalranking")) errors.push("Missing ## Totalranking section");
  if (!text.includes("| Rank | JonasFitScore | Repo |")) errors.push("Missing ranking table header");
  if (text.includes("The question:") || text.includes("So we need to") || text.includes("Let's assign")) errors.push("Contains reasoning/prompt leakage");

  const allowed = new Set(repos.map((repo) => String(repo.full_name).toLowerCase()));
  const trueTrending = new Set(repos.filter(isTrueTrending).map((repo) => String(repo.full_name).toLowerCase()));
  const rows = extractRankingRows(text);
  const seen = new Set();

  if (rows.length !== allowed.size) errors.push(`Expected ${allowed.size} ranking rows, got ${rows.length}`);

  let testaNuCount = 0;
  let sparaCount = 0;
  let trueTrendingTop10 = 0;

  rows.forEach((row, index) => {
    const repoName = extractRepoFromMarkdownRow(row);
    const score = extractScoreFromMarkdownRow(row);
    const action = extractActionFromMarkdownRow(row);

    if (index < 10 && trueTrending.has(repoName)) trueTrendingTop10 += 1;

    if (!repoName) errors.push(`Row ${index + 1}: could not parse GitHub repo URL`);
    else if (!allowed.has(repoName)) errors.push(`Row ${index + 1}: repo not allowed: ${repoName}`);
    else if (seen.has(repoName)) errors.push(`Duplicate repo in ranking: ${repoName}`);
    else seen.add(repoName);

    if (!Number.isFinite(score) || score < 0 || score > 1000) errors.push(`Row ${index + 1}: invalid score: ${score}`);
    if (!ACTIONS.has(action)) errors.push(`Row ${index + 1}: invalid or missing action`);

    if (action === "Testa nu") testaNuCount += 1;
    if (action === "Spara för senare") sparaCount += 1;

    if (score >= 720 && action === "Ignorera") errors.push(`Row ${index + 1}: high score cannot be Ignorera`);
    if (score >= 500 && action === "Ignorera") errors.push(`Row ${index + 1}: medium/high score cannot be Ignorera`);
    if (score < 300 && action === "Testa nu") errors.push(`Row ${index + 1}: low score cannot be Testa nu`);
  });

  for (const repoName of allowed) {
    if (!seen.has(repoName)) errors.push(`Missing repo from ranking: ${repoName}`);
  }

  if (testaNuCount > 5) errors.push(`Too many Testa nu actions: ${testaNuCount}`);
  if (sparaCount > 10) errors.push(`Too many Spara för senare actions: ${sparaCount}`);
  if (trueTrending.size >= 7 && trueTrendingTop10 < 7) errors.push(`Too few true GitHub Trending repos in top 10: ${trueTrendingTop10}`);

  return errors;
}

async function main() {
  const rawJson = await readText("data/latest.json");
  const { meta, repos: rawRepos } = parseRadarJson(rawJson);
  const repos = dedupeRepos(rawRepos);

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
      const modelOutput = await callOpenRouter(prompt);
      const validationErrors = validateModelOutput(modelOutput, repos);
      ranking = validationErrors.length
        ? makeFallbackRanking({ repos, meta, reason: `OpenRouter output failed validation: ${validationErrors.slice(0, 8).join("; ")}` })
        : modelOutput;
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
