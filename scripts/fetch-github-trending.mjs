import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const MAX_REPOS = Number(process.env.RADAR_MAX_REPOS || 30);
const TRENDING_REPOS_PER_SOURCE = Number(process.env.RADAR_TRENDING_REPOS_PER_SOURCE || 10);
const TRENDING_DEVELOPERS_PER_SOURCE = Number(process.env.RADAR_TRENDING_DEVELOPERS_PER_SOURCE || 10);
const README_MAX_CHARS = Number(process.env.RADAR_README_MAX_CHARS || 25000);
const SUMMARY_README_CHARS = Number(process.env.RADAR_SUMMARY_README_CHARS || 1600);
const NEW_DAYS = Number(process.env.RADAR_NEW_DAYS || 7);
const PUSHED_DAYS = Number(process.env.RADAR_PUSHED_DAYS || 7);
const MIN_STARS_NEW = Number(process.env.RADAR_MIN_STARS_NEW || 20);
const MIN_STARS_ACTIVE = Number(process.env.RADAR_MIN_STARS_ACTIVE || 500);

const SOURCE_TRENDING_DAILY = "GitHub Trending – daily";
const SOURCE_TRENDING_WEEKLY = "GitHub Trending – weekly";
const SOURCE_SEARCH_API = "GitHub Search API";

const TRENDING_REPO_SOURCES = [
  {
    name: SOURCE_TRENDING_DAILY,
    url: "https://github.com/trending"
  },
  {
    name: SOURCE_TRENDING_WEEKLY,
    url: "https://github.com/trending?since=weekly"
  }
];

const TRENDING_DEVELOPER_SOURCES = [
  {
    name: "GitHub Trending Developers – weekly",
    url: "https://github.com/trending/developers?since=weekly"
  }
];

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

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ulle73-ai-radar",
      Accept: "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HTML fetch error ${response.status} for ${url}\n${body.slice(0, 500)}`);
  }

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

async function fetchRepo(fullName) {
  return githubJson(`https://api.github.com/repos/${fullName}`);
}

async function fetchReadme(fullName) {
  const url = `https://api.github.com/repos/${fullName}/readme`;
  const text = await githubText(url);
  return normalizeText(text).slice(0, README_MAX_CHARS);
}

async function fetchUserRepos(username) {
  const url = new URL(`https://api.github.com/users/${username}/repos`);
  url.searchParams.set("sort", "updated");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", "10");

  try {
    const repos = await githubJson(url.toString());
    return (repos || [])
      .filter((repo) => !repo.fork && !repo.archived && !repo.disabled)
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 3)
      .map((repo) => ({
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count || 0,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at
      }));
  } catch (error) {
    console.warn(`Could not fetch repos for developer ${username}: ${error.message}`);
    return [];
  }
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function decodeHtml(text) {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function stripTags(text) {
  return decodeHtml(String(text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseTrendingRepos(html, limit) {
  const found = [];
  const seen = new Set();
  const regex = /href="\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)"/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const owner = match[1];
    const repo = match[2];
    const fullName = `${owner}/${repo}`;

    if (
      owner === "features" ||
      owner === "topics" ||
      owner === "collections" ||
      owner === "marketplace" ||
      owner === "sponsors" ||
      seen.has(fullName)
    ) {
      continue;
    }

    seen.add(fullName);
    found.push(fullName);
    if (found.length >= limit) break;
  }

  return found;
}

function parseTrendingDevelopers(html, limit) {
  const articleMatches = html.match(/<article[\s\S]*?<\/article>/g) || [];
  const developers = [];
  const seen = new Set();

  for (const article of articleMatches) {
    const usernameMatch = article.match(/href="\/([A-Za-z0-9-]+)"/);
    if (!usernameMatch) continue;

    const username = usernameMatch[1];
    if (seen.has(username)) continue;

    const nameMatch = article.match(/<h1[\s\S]*?<\/h1>/);
    const repoMatch = article.match(/href="\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)"/);

    seen.add(username);
    developers.push({
      username,
      profile_url: `https://github.com/${username}`,
      display_name: nameMatch ? stripTags(nameMatch[0]) : username,
      featured_repo: repoMatch ? `https://github.com/${repoMatch[1]}` : null
    });

    if (developers.length >= limit) break;
  }

  return developers;
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

function entrySourceRank(entry) {
  const sources = [...entry.sourceNames];
  if (sources.includes(SOURCE_TRENDING_DAILY)) return 3;
  if (sources.includes(SOURCE_TRENDING_WEEKLY)) return 2;
  if (sources.includes(SOURCE_SEARCH_API)) return 1;
  return 0;
}

function compactRepo(repo, readme, sourceNames = []) {
  return {
    full_name: repo.full_name,
    name: repo.name,
    owner: repo.owner?.login,
    html_url: repo.html_url,
    source_names: sourceNames,
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

function hasSource(repo, sourceName) {
  return (repo.source_names || []).includes(sourceName);
}

function getRepoGroups(repos) {
  const used = new Set();

  function take(predicate) {
    const matched = repos
      .filter((repo) => !used.has(repo.full_name) && predicate(repo))
      .sort((a, b) => b.trend_score - a.trend_score);

    for (const repo of matched) used.add(repo.full_name);
    return matched;
  }

  const groups = [
    {
      title: "GitHub Trending – daily",
      description: "Repos scraped directly from https://github.com/trending. These should be treated as the cleanest daily trending signal.",
      repos: take((repo) => hasSource(repo, SOURCE_TRENDING_DAILY))
    },
    {
      title: "GitHub Trending – weekly",
      description: "Repos scraped directly from https://github.com/trending?since=weekly that were not already shown in daily trending.",
      repos: take((repo) => hasSource(repo, SOURCE_TRENDING_WEEKLY))
    },
    {
      title: "Extra Search API finds",
      description: "Additional repos found through GitHub Search API using Jonas-focused keywords. Useful, but noisier than GitHub Trending.",
      repos: take((repo) => hasSource(repo, SOURCE_SEARCH_API))
    },
    {
      title: "Other captured repos",
      description: "Fallback bucket for repos without a known source label.",
      repos: take(() => true)
    }
  ];

  return groups.filter((group) => group.repos.length > 0);
}

function renderRepoTable(lines, repos) {
  lines.push("| # | Repo | Score | Stars | Lang | Sources | Topics | Description |");
  lines.push("|---:|---|---:|---:|---|---|---|---|");

  repos.forEach((repo, index) => {
    lines.push(
      `| ${index + 1} | [${repo.full_name}](${repo.html_url}) | ${repo.trend_score} | ${repo.stargazers_count} | ${repo.language || "-"} | ${markdownEscape((repo.source_names || []).join(", ")) || "-"} | ${markdownEscape((repo.topics || []).slice(0, 6).join(", ")) || "-"} | ${markdownEscape(repo.description || "")} |`
    );
  });
}

function makeSummary(repos, developers, meta) {
  const lines = [];
  const repoGroups = getRepoGroups(repos);

  lines.push(`# GitHub Radar – ${meta.date}`);
  lines.push("");
  lines.push(`Generated at: ${meta.generated_at}`);
  lines.push(`Repos saved: ${repos.length}`);
  lines.push(`Trending developers saved: ${developers.length}`);
  lines.push("");
  lines.push("## How to use this file");
  lines.push("");
  lines.push("This summary is generated without an LLM. It is meant to be read by Jonas or a ChatGPT Task and compared against `/projects`, `/ideas` and `/chatgpt-genererade-ideer`.");
  lines.push("");
  lines.push("## Sources");
  lines.push("");
  for (const source of meta.trending_repo_sources) lines.push(`- ${source.name}: ${source.url}`);
  for (const source of meta.trending_developer_sources) lines.push(`- ${source.name}: ${source.url}`);
  lines.push("- Extra Search API finds: GitHub Search API queries based on keywords in this script");
  lines.push("");

  lines.push("## Repo sections by source");
  lines.push("");
  lines.push("Repos are grouped by source so true GitHub Trending results do not get buried under high-scoring Search API results.");
  lines.push("");

  for (const group of repoGroups) {
    lines.push(`### ${group.title}`);
    lines.push("");
    lines.push(group.description);
    lines.push("");
    renderRepoTable(lines, group.repos);
    lines.push("");
  }

  lines.push("## Overall top repos by score");
  lines.push("");
  lines.push("This is a secondary view. Use the source sections above as the primary reading order.");
  lines.push("");
  renderRepoTable(lines, repos);

  if (developers.length) {
    lines.push("");
    lines.push("## Trending developers – weekly");
    lines.push("");
    lines.push("These are stored separately from repos. Use them as people/projects to watch, not as direct implementation candidates.");
    lines.push("");

    developers.forEach((developer, index) => {
      lines.push(`### ${index + 1}. [${developer.username}](${developer.profile_url})`);
      lines.push("");
      lines.push(`- **Name:** ${developer.display_name || developer.username}`);
      if (developer.featured_repo) lines.push(`- **Featured repo:** ${developer.featured_repo}`);
      if (developer.recent_repos?.length) {
        lines.push("- **Top recent repos:**");
        for (const repo of developer.recent_repos) {
          lines.push(`  - [${repo.full_name}](${repo.html_url}) — ${repo.stargazers_count} stars — ${repo.description || "-"}`);
        }
      }
      lines.push("");
    });
  }

  lines.push("");
  lines.push("## Repo details with README excerpts");
  lines.push("");

  repos.forEach((repo, index) => {
    lines.push(`### ${index + 1}. [${repo.full_name}](${repo.html_url})`);
    lines.push("");
    lines.push(`- **Score:** ${repo.trend_score}`);
    lines.push(`- **Sources:** ${(repo.source_names || []).join(", ") || "-"}`);
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

async function collectTrendingRepos(found) {
  for (const source of TRENDING_REPO_SOURCES) {
    console.log(`Fetching trending source: ${source.url}`);
    try {
      const html = await fetchHtml(source.url);
      const fullNames = parseTrendingRepos(html, TRENDING_REPOS_PER_SOURCE);
      for (const fullName of fullNames) {
        const existing = found.get(fullName);
        if (existing) {
          existing.sourceNames.add(source.name);
          continue;
        }

        try {
          const repo = await fetchRepo(fullName);
          if (!repo.archived && !repo.disabled && repo.full_name) {
            found.set(repo.full_name, { repo, sourceNames: new Set([source.name]) });
          }
        } catch (error) {
          console.warn(`Could not fetch repo ${fullName}: ${error.message}`);
        }
      }
    } catch (error) {
      console.warn(`Trending source failed: ${source.url}`);
      console.warn(error.message);
    }
  }
}

async function collectTrendingDevelopers() {
  const developers = [];
  const seen = new Set();

  for (const source of TRENDING_DEVELOPER_SOURCES) {
    console.log(`Fetching trending developers: ${source.url}`);
    try {
      const html = await fetchHtml(source.url);
      const parsed = parseTrendingDevelopers(html, TRENDING_DEVELOPERS_PER_SOURCE);
      for (const developer of parsed) {
        if (seen.has(developer.username)) continue;
        seen.add(developer.username);
        developers.push({
          ...developer,
          source_name: source.name,
          recent_repos: await fetchUserRepos(developer.username)
        });
      }
    } catch (error) {
      console.warn(`Trending developer source failed: ${source.url}`);
      console.warn(error.message);
    }
  }

  return developers;
}

async function collectSearchRepos(found) {
  const createdSince = daysAgo(NEW_DAYS);
  const pushedSince = daysAgo(PUSHED_DAYS);

  const queries = [
    `created:>${createdSince} stars:>${MIN_STARS_NEW}`,
    `pushed:>${pushedSince} stars:>${MIN_STARS_ACTIVE}`,
    ...KEYWORDS.map((keyword) => `${keyword} pushed:>${pushedSince} stars:>${MIN_STARS_NEW}`)
  ];

  for (const query of queries) {
    console.log(`Searching: ${query}`);
    try {
      const repos = await searchRepositories(query, 10);
      for (const repo of repos) {
        if (!repo.archived && !repo.disabled && repo.full_name) {
          const existing = found.get(repo.full_name);
          if (existing) {
            existing.sourceNames.add(SOURCE_SEARCH_API);
          } else {
            found.set(repo.full_name, { repo, sourceNames: new Set([SOURCE_SEARCH_API]) });
          }
        }
      }
    } catch (error) {
      console.warn(`Search failed for query: ${query}`);
      console.warn(error.message);
    }
  }
}

async function collectRepos() {
  const found = new Map();

  await collectTrendingRepos(found);
  await collectSearchRepos(found);

  return [...found.values()]
    .sort((a, b) => {
      const sourceDelta = entrySourceRank(b) - entrySourceRank(a);
      if (sourceDelta !== 0) return sourceDelta;
      return repoScore(b.repo) - repoScore(a.repo);
    })
    .slice(0, MAX_REPOS);
}

async function main() {
  await ensureDirs();

  const [repoEntries, developers] = await Promise.all([collectRepos(), collectTrendingDevelopers()]);
  console.log(`Fetching README for ${repoEntries.length} repos...`);

  const enriched = [];
  for (const entry of repoEntries) {
    console.log(`README: ${entry.repo.full_name}`);
    const readme = await fetchReadme(entry.repo.full_name);
    enriched.push(compactRepo(entry.repo, readme, [...entry.sourceNames]));
  }

  enriched.sort((a, b) => {
    const aRank = hasSource(a, SOURCE_TRENDING_DAILY) ? 3 : hasSource(a, SOURCE_TRENDING_WEEKLY) ? 2 : hasSource(a, SOURCE_SEARCH_API) ? 1 : 0;
    const bRank = hasSource(b, SOURCE_TRENDING_DAILY) ? 3 : hasSource(b, SOURCE_TRENDING_WEEKLY) ? 2 : hasSource(b, SOURCE_SEARCH_API) ? 1 : 0;
    const sourceDelta = bRank - aRank;
    if (sourceDelta !== 0) return sourceDelta;
    return b.trend_score - a.trend_score;
  });

  const meta = {
    date: today,
    generated_at: new Date().toISOString(),
    max_repos: MAX_REPOS,
    trending_repos_per_source: TRENDING_REPOS_PER_SOURCE,
    trending_developers_per_source: TRENDING_DEVELOPERS_PER_SOURCE,
    trending_repo_sources: TRENDING_REPO_SOURCES,
    trending_developer_sources: TRENDING_DEVELOPER_SOURCES,
    new_days: NEW_DAYS,
    pushed_days: PUSHED_DAYS,
    min_stars_new: MIN_STARS_NEW,
    min_stars_active: MIN_STARS_ACTIVE,
    keywords: KEYWORDS
  };

  const payload = {
    meta,
    developers,
    repos: enriched
  };

  const rawJson = JSON.stringify(payload, null, 2) + "\n";
  const summary = makeSummary(enriched, developers, meta);

  await writeFile(path.join(root, "data", "raw", `${today}.json`), rawJson, "utf8");
  await writeFile(path.join(root, "data", "summaries", `${today}.md`), summary, "utf8");
  await writeFile(path.join(root, "data", "latest.json"), rawJson, "utf8");
  await writeFile(path.join(root, "data", "latest.md"), summary, "utf8");

  console.log(`Saved ${enriched.length} repos and ${developers.length} developers to data/raw/${today}.json and data/summaries/${today}.md`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
