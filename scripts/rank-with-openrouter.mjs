import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const today = new Date().toISOString().slice(0, 10);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "";
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const SITE_URL = process.env.OPENROUTER_SITE_URL || "https://github.com/ulle73/ai-radar";
const APP_NAME = process.env.OPENROUTER_APP_NAME || "Jonas AI Radar";
const MAX_INPUT_CHARS = Number(process.env.RANKING_MAX_INPUT_CHARS || 120000);

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

function buildPrompt({ radar, projects, ideas, candidates }) {
  const input = `
# Latest radar
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

Du ska ranka ALLA repon från dagens radar, inte bara topp 3. Använd Jonas projektbank, idébank och befintliga kandidater som bedömningsgrund.

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
          content: "You are a precise analyst that writes durable markdown ranking reports. Return only markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      top_p: 0.9
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenRouter error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned no message content.");
  return content.trim() + "\n";
}

async function main() {
  if (!OPENROUTER_API_KEY || !OPENROUTER_MODEL) {
    console.log("Skipping ranking: OPENROUTER_API_KEY and OPENROUTER_MODEL must be set.");
    return;
  }

  const radar = await readText("data/latest.md");
  if (!radar.trim()) {
    throw new Error("data/latest.md is missing or empty. Run npm run radar first.");
  }

  const projects = await readMarkdownFiles("projects");
  const ideas = await readMarkdownFiles("ideas");
  const candidates = await readMarkdownFiles("chatgpt-genererade-ideer/candidates");

  const prompt = buildPrompt({ radar, projects, ideas, candidates });
  const ranking = await callOpenRouter(prompt);

  await mkdir(path.join(root, "rankings", "daily"), { recursive: true });
  await writeFile(path.join(root, "rankings", "daily", `${today}.md`), ranking, "utf8");
  await writeFile(path.join(root, "rankings", "latest.md"), ranking, "utf8");

  console.log(`Saved rankings/daily/${today}.md and rankings/latest.md`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
