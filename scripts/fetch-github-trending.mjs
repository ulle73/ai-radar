import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const MAX_REPOS = Number(process.env.RADAR_MAX_REPOS || 30);
const README_MAX_CHARS = Number(process.env.RADAR_README_MAX_CHARS || 25000);
const SUMMARY_README_CHARS = Number(process.env.RADAR_SUMMARY_README_CHARS || 1600);
const NEW_DAYS = Number(process.env.RADAR_NEW_DAYS || 7);
const PUSHED_DAYS = Number(process.env.RADAR_PUSHED_DAYS || 7);
const MIN_STARS_NEW = Number(process.env.RADAR_MIN_STARS_NEW || 20);
const MIN_STARS_ACTIVE = Number(process.env.RADAR_MIN_STARS_ACTIVE || 500);

const DEFAULT_KEYWORDS = [
  "ai agent",
  "agentic",
  "browser automation",
  "workflow automation",
  "nextjs",
  "supabase",
  "vercel",
  "wordpress",
  "woocommerce",
  "email deliverability",
  "lead generation",
  "scraping",
  "trading indicators",
  "developer tools"
];

const KEYWORDS = (process.env.RADAR_KEYWORDS || DEFAULT_KEYWORDS.join(","))
  .split(",")
  .map((keyword) => keyword.trim())
  .filter(Boolean);

const today = new Date().toISOString().slice(0, 10);
const root = process.cwd();

function daysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function headers(extra = {}) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ulle73-ai-radar",
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
    ...extra
  };
}

async function githubJson(url) {
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`GitHub API error ${response.status} for ${url}\n${body}`);
  }
  return response.json();
}

async function githubText(url) {
  const response = await fetch(url, { headers: headers({ Accept: "application/vnd.github.raw" }) });
  if (response.status === 404) return "";
  if (!response.ok) return "";
  return response.text();
}

async function searchRepositories(query, perPage = 20) {
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(perPage));
  const data = await githubJson(url.toString());
  return data.items || [];
}

async function fetchReadme(fullName) {
  const url = `https://api.github.com/repos/${fullName}/readme`;
  const text = await githubText(url);
  return normalizeText(text).slice(0, README_MAX_CHARS);
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function repoScore(repo) {
  const createdAt = new Date(repo.created_at).getTime();
  const pushedAt = new Date(repo.pushed_at).getTime();
  const now = Date.now();
  const ageDays = Math.max(1, (now - createdAt) / 86_400_000);
  const pushedDays = Math.max(1, (now - pushedAt) / 86_400_000);

  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  const starsPerDay = stars / ageDays;
  const recencyBoost = Math.max(0, 30 - pushedDays) / 30;

  return Number((starsPerDay * 5 + Math.log10(stars + 1) * 10 + Math.log10(forks + 1) * 3 + recencyBoost * 10).toFixed(2));
}

function compactRepo(repo, readme) {
  return {
    full_name: repo.full_name,
    name: repo.name,
    owner: repo.owner?.login,
    html_url: repo.html_url,
    description: repo.description,
    language: repo.language,
    topics: repo.topics || [],
    stargazers_count: repo.stargazers_count || 0,
    forks_count: repo.forks_count || 0,
    open_issues_count: repo.open_issues_count || 0,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
    license: repo.license?.spdx_id || null,
    homepage: repo.homepage || null,
    trend_score: repoScore(repo),
    readme_excerpt: readme.slice(0, README_MAX_CHARS)
  };
}

function markdownEscape(text) {
  return String(text || "").replace(/\|/g, "\\|");
}

function makeSummary(repos, meta) {
  const lines = [];
  lines.push(`# GitHub Radar – ${meta.date}`);
  lines.push("");
  lines.push(`Generated at: ${meta.generated_at}`);
  lines.push(`Repos saved: ${repos.length}`);
  lines.push("");
  lines.push("## How to use this file");
  lines.push("");
  lines.push("This summary is generated without an LLM. It is meant to be read by Jonas or a ChatGPT Task and compared against `/projects`, `/ideas` and `/chatgpt-genererade-ideer`.");
  lines.push("");
  lines.push("## Top repos");
  lines.push("");
  lines.push("| # | Repo | Score | Stars | Lang | Topics | Description |");
  lines.push("|---:|---|---:|---:|---|---|---|");

  repos.forEach((repo, index) => {
    lines.push(
      `| ${index + 1} | [${repo.full_name}](${repo.html_url}) | ${repo.trend_score} | ${repo.stargazers_count} | ${repo.language || "-"} | ${markdownEscape((repo.topics || []).slice(0, 6).join(", ")) || "-"} | ${markdownEscape(repo.description || "")} |`
    );
  });

  lines.push("");
  lines.push("## Repo details with README excerpts");
  lines.push("");

  repos.forEach((repo, index) => {
    lines.push(`### ${index + 1}. [${repo.full_name}](${repo.html_url})`);
    lines.push("");
    lines.push(`- **Score:** ${repo.trend_score}`);
    lines.push(`- **Stars:** ${repo.stargazers_count}`);
    lines.push(`- **Forks:** ${repo.forks_count}`);
    lines.push(`- **Language:** ${repo.language || "-"}`);
    lines.push(`- **Topics:** ${(repo.topics || []).join(", ") || "-"}`);
    lines.push(`- **Created:** ${repo.created_at}`);
    lines.push(`- **Updated:** ${repo.updated_at}`);
    lines.push(`- **Pushed:** ${repo.pushed_at}`);
    if (repo.homepage) lines.push(`- **Homepage:** ${repo.homepage}`);
    lines.push("");
    lines.push(`**Description:** ${repo.description || "-"}`);
    lines.push("");
    const excerpt = normalizeText(repo.readme_excerpt).slice(0, SUMMARY_README_CHARS);
    if (excerpt) {
      lines.push("**README excerpt:**");
      lines.push("");
      lines.push("```md");
      lines.push(excerpt);
      lines.push("```");
    } else {
      lines.push("_No README found._");
    }
    lines.push("");
  });

  return `${lines.join("\n")}\n`;
}

async function ensureDirs() {
  const dirs = [
    "data/raw",
    "data/summaries",
    "projects",
    "ideas",
    "chatgpt-genererade-ideer/candidates",
    "chatgpt-genererade-ideer/approved",
    "chatgpt-genererade-ideer/rejected"
  ];

  await Promise.all(dirs.map((dir) => mkdir(path.join(root, dir), { recursive: true })));
}

async function collectRepos() {
  const createdSince = daysAgo(NEW_DAYS);
  const pushedSince = daysAgo(PUSHED_DAYS);

  const queries = [
    `created:>${createdSince} stars:>${MIN_STARS_NEW}`,
    `pushed:>${pushedSince} stars:>${MIN_STARS_ACTIVE}`,
    ...KEYWORDS.map((keyword) => `${keyword} pushed:>${pushedSince} stars:>${MIN_STARS_NEW}`)
  ];

  const found = new Map();

  for (const query of queries) {
    console.log(`Searching: ${query}`);
    try {
      const repos = await searchRepositories(query, 20);
      for (const repo of repos) {
        if (!repo.archived && !repo.disabled && repo.full_name) {
          found.set(repo.full_name, repo);
        }
      }
    } catch (error) {
      console.warn(`Search failed for query: ${query}`);
      console.warn(error.message);
    }
  }

  return [...found.values()]
    .sort((a, b) => repoScore(b) - repoScore(a))
    .slice(0, MAX_REPOS);
}

async function main() {
  await ensureDirs();

  const repos = await collectRepos();
  console.log(`Fetching README for ${repos.length} repos...`);

  const enriched = [];
  for (const repo of repos) {
    console.log(`README: ${repo.full_name}`);
    const readme = await fetchReadme(repo.full_name);
    enriched.push(compactRepo(repo, readme));
  }

  enriched.sort((a, b) => b.trend_score - a.trend_score);

  const meta = {
    date: today,
    generated_at: new Date().toISOString(),
    max_repos: MAX_REPOS,
    new_days: NEW_DAYS,
    pushed_days: PUSHED_DAYS,
    min_stars_new: MIN_STARS_NEW,
    min_stars_active: MIN_STARS_ACTIVE,
    keywords: KEYWORDS
  };

  const payload = {
    meta,
    repos: enriched
  };

  const rawJson = JSON.stringify(payload, null, 2) + "\n";
  const summary = makeSummary(enriched, meta);

  await writeFile(path.join(root, "data", "raw", `${today}.json`), rawJson, "utf8");
  await writeFile(path.join(root, "data", "summaries", `${today}.md`), summary, "utf8");
  await writeFile(path.join(root, "data", "latest.json"), rawJson, "utf8");
  await writeFile(path.join(root, "data", "latest.md"), summary, "utf8");

  console.log(`Saved ${enriched.length} repos to data/raw/${today}.json and data/summaries/${today}.md`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
