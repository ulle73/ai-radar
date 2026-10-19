# AI Radar v2 – den självgående analytikern

Status: **beslutad design, inget byggt**. Beslut tagna av Jonas 2026-10-19 (grill-me-session med Claude). Ändra inte ett beslut i denna fil utan att Jonas godkänt det.

## 1. Mål

AI Radar v2 är en självgående analytiker som arbetar som Jonas gör, utan att bli tillsagd. Den bevakar verktyg, konkurrenter, försäljning och egna projekt, och lämnar bara förslag som är **användbara, konkreta och sådant vi annars missat eller inte följt upp**.

Den lyckas när:

- varje kort leder till ett beslut (OK, Nej, Inte nu) inom ett dygn,
- en tyst dag är normal och korrekt,
- Jonas inte får veta något viktigt från annat håll först.

Den misslyckas när den producerar idéer från modellens fantasi, generiska råd eller kort som Jonas redan visste.

### Grundprincip: observation först

```
OBSERVATION (data, ingen AI)  →  HYPOTES  →  RESEARCH  →  SKEPTIKER  →  KORT  →  Jonas OK  →  UTFÖRANDE  →  UPPFÖLJNING
```

Ingen hypotes får skapas utan en observation: en siffra som avviker, ett konkurrentinlägg, en release i primärkälla, ett repo som både trendar och nämns av en följd kanal, eller ett arbetsmoment Jonas gjort för hand flera gånger. Det är den enskilt viktigaste skillnaden mot de tre system som ersätts.

## 2. Vad som ersätts och varför

Mätt 2026-10-19:

| System | Var | Resultat | Grundorsak |
|---|---|---|---|
| AI Radar (n8n 30–35) | n8n på Railway | 42 317 poster på en månad, 7 Discord-kort, 3 betyg. GitHub Trending-parsern ger 0 poster. | Firehose-källor (MCP Registry, OpenRouter- och HF-kataloger), gratismodeller i batchar om 25, ingen kunskap om befintlig hubb, bedömer releaser i stället för förmågor. |
| `ulle73/ai-radar` (detta repo) | GitHub Actions | Tom ranking (`rankings/latest.json` = `[]`). Körningar röda sedan 2026-10-16. | Grindarna är så strikta att inget passerar. Rött sedan 16 okt: *"recent account payments have failed or your spending limit needs to be increased"*. Repot är privat och drar Actions-minuter. |
| Opportunity OS (n8n 50–62) | n8n + Railway-worker | 361 möjligheter, 0 publicerade. Generiska idéer ("AI-genererat innehåll", "bedrägeridetektering"). | Idéer genereras top-down. Research avbryts på timeout. Domare och skeptiker ger inget giltigt svar och då skapas reservbedömningar ändå. |

Det som är bra och återanvänds:

- detta repos deterministiska grindar, projektkatalog, tester och principen "tom ranking är korrekt",
- n8n:s Discord-interaktioner med 1–10 (`37 AI – Discord Interactions v2`), datatabeller och `00 CORE – Error Handler`,
- Opportunity OS:s Deploy Controller och Railway-worker, för senare utförande,
- content-engines Competitor Intelligence (insamling av sociala medier, följlista, Meta Ad Library),
- `youtube-systems-library` (yt-dlp, textning, tidslinje) för djupa videogenomgångar.

## 3. Arkitektur

```
                 ┌────────────────────────────── n8n (nerver) ──────────────────────────────┐
  Källor ──────▶ │ heartbeat var 15:e min · detektorer utan AI · kö · budget · Discord · tabeller │
                 └──────────────┬──────────────────────────────────────────▲──────────────┘
                                │ jobb (pull, header-hemlighet)            │ färdiga kort / utfall
                                ▼                                          │
                 ┌──────────── lokal domare (Jonas dator) ───────────────┐ │
                 │ Codex headless · läser hubben, transkript, repon      │─┘
                 │ provkör i karantän (Codex sandlåda) · A/B · skeptiker │
                 └──────────────┬────────────────────────────────────────┘
                                │ logik, prompter, grindar, scheman, tester
                 ┌──────────────┴── ulle73/ai-radar (hjärna) ────────────┐
                 │ kod + projektkatalog + kortkontrakt + grindar          │
                 └───────────────────────────────────────────────────────┘
  Minne och uppföljning: Notion Growth System (Log, Growth Radar, Company Knowledge)
```

| Del | Ansvar | Varför där |
|---|---|---|
| **Repo (hjärna)** | All logik: detektorer, kortkontrakt (JSON-schema), deterministiska grindar, prompter, projektkatalog, tester. | Versionerat, testbart, en källa. n8n och den lokala domaren kör samma kod och samma prompter. |
| **n8n (nerver)** | Heartbeat och schemaläggning, insamling via HTTP, kö, budgetvakt, Discord-kort och knappar, betyg, morgonbrev, felhantering. | Det n8n redan gör bra och som redan har credentials (Discord, Notion, Apify, OpenRouter, Outlook). |
| **Lokal domare** | Djup bedömning som kräver hela hubben, transkript eller provkörning. Utför godkända åtgärder (hubbinstallation, branch och PR). | Bara datorn ser `~/.agents`, transkripten och lokala repon. Körs på prenumerationen, inte API-budgeten. |
| **Notion** | Beslut, tester, resultat och lärdomar som både Jonas, ChatGPT, Claude och Codex läser. | Redan source of truth för Golfkuponger Growth System. |

**Actions och integritet (ändrat 2026-10-19):** Repot gjordes publikt, så Actions är gratis och används för heartbeat mot **publika** källor. Detektorerna körs alltså där koden finns (Node i repot) och inte som kopior i n8n-noder. Data som bara finns hos oss (försäljning, Notion Log, lokala installationer, privata repon) läses i stället av den **lokala** körningen. Actions-loggar är publika, så körningen skriver bara ut antal och källstatus, aldrig innehåll.

| Del | Var | Vad |
|---|---|---|
| `scripts/v2/heartbeat.mjs --mode public` | GitHub Actions `v2 Heartbeat (public)`, var 30:e minut | Releaser, YouTube och CI för publika repon |
| `scripts/v2/heartbeat.mjs --mode private` | Jonas dator (schemalagd aktivitet, tillsammans med domaren) | Försäljning och Notion Log via `R2 – Data Feed`, installerade versioner och CI för privata repon |
| `R2 – Observation Ingest` (n8n, `/webhook/r2-observations`) | n8n | Tar emot signerade batchar (högst 200), validerar, deduplicerar på `dedupe_key` och skriver till `GK_R2_OBSERVATIONS` med status `NEW` |
| `R2 – Data Feed` (n8n, `/webhook/r2-data-feed`) | n8n | Signerad läsning: `GK_DAILY_ORDER_REPORTS` (aggregat) och hela Notion Log |
| `GK_R2_CONFIG`, `GK_R2_COSTS` | n8n-tabeller | Signeringshemlighet, budgettak och kostnadslogg |

Signatur: `x-r2-timestamp` (unix-sekunder) och `x-r2-signature` = hex(HMAC-SHA256(hemlighet, `"<timestamp>.<rå body>"`)). Anrop äldre än 5 minuter avvisas. Hemligheten finns i `GK_R2_CONFIG`, som GitHub-hemligheten `R2_SIGNING_SECRET` och lokalt i `~/.ai-radar/secrets.json` (läsbar bara för Jonas). Flödenas källkod ligger i `n8n/`.

### Heartbeat

- **Var 30:e minut:** detektorerna körs mot källorna (publika i Actions, privata lokalt). De använder ingen AI och kostar nästan inget. Bara nya observationer, dedupliceras på `dedupe_key`, hamnar i kön.
- **Lokal domare var 30:e minut** (Windows schemalagd aktivitet, bara när datorn är på): hämtar högst N jobb, med en tidsgräns per jobb. Är datorn avstängd ligger jobben kvar i kön.
- **Morgonbrev vardagar 07:30:** n8n väljer de 3 bästa färdiga korten över alla områden. Finns inget som klarar grindarna skickas inget brev.
- **Direktlarm:** bara för tidskritiska observationer (se 6.3).
- **Fredag 15:00:** sammanfattning med vad som genomfördes, uppmätt effekt, kort som väntar på beslut och mindre nyheter i en rad var.

## 4. Områden och datakällor

Alla fyra områden startar samtidigt (fas 2). Fokusvikt inom Verktyg & hubb: **kodning och agentarbetsflöde** samt **video och kreativt**.

### 4.1 Verktyg & hubb

Målet är att Claude och Codex blir bättre, och att båda använder exakt samma saker via den delade hubben (`~/.agents`, se skillen `agent-hub`).

| Källa | Metod | Anmärkning |
|---|---|---|
| GitHub Trending (daglig, veckovis) | HTML-hämtning med en parser som testas mot en sparad fixture | Dagens parser i n8n ger 0 poster och måste skrivas om och få tester. |
| GitHub Search API | Ämnena `agent-skills`, `claude-code`, `codex`, `mcp-server`, `n8n`, `remotion`, `hyperframes`, sorterade på stjärntillväxt | `gh`/token. Mät stjärnor per dag, inte totalt. |
| Skill-register | Commits och nya mappar i `anthropics/skills`, `openai/plugins`, `anthropics/claude-plugins-official` och skills.sh | Finns delvis i `GK_AI_RADAR_SOURCES`. |
| YouTube (16 kanaler) | Kanalens officiella RSS-flöde `https://www.youtube.com/feeds/videos.xml?channel_id=…` → förfilter på titel och beskrivning → transkript via Apify bara för de som passerar → extrahera repon, skills och tips | Kanal-ID och flöden verifierade 2026-10-19 (`config/v2/sources.json`). Förfiltret har starka och svaga ord: ett starkt ord i titeln, eller ett starkt plus ett svagt, krävs. Breda ord som "video" och "claude" släppte igenom 26 videor på 3 dygn, och med de nuvarande listorna passerar 11, alla relevanta. Djupgenomgång vid behov via `youtube-systems-library`. |
| Plattformsnyheter (primärkällor) | Claude Platform release notes, Claude Code-releaser och CHANGELOG, Codex-releaser, OpenAI changelog och What's New, Gemini API changelog, Gemini CLI-releaser, n8n-releaser, Shopify dev changelog | Bara primärkällor kan bära ett kort. |
| Plattformsnyheter (upptäckt) | agentnative.inc/updates och liknande aggregatorer | Har inget flöde. Används bara för att upptäcka nyheter, som sedan måste bekräftas av en primärkälla. **Rykten skickas aldrig.** |
| Hubbens innehåll | `node scripts/v2/build-inventory.mjs` läser `~/.agents` skrivskyddat (skills, verktyg, MCP, AGENTS.md och Codex-only-undantag) och slår ihop det med den lokala `config/v2/inventory.static.json` (repon, n8n-flöden, Notion, mått). Resultatet skrivs till `~/.ai-radar/inventory.json`. | Byggs i repot i stället för som `hub.py`-kommando, så att den delade hubben inte ändras och koden kan testas. Den statiska filen är gitignorerad eftersom repot är publikt. |
| Egen användning | Lokal läsning av Claude- och Codex-transkript | Bara rensade mönster lämnar datorn, se 9.3. |

YouTube-kanaler (valda 2026-10-19): IndyDevDan, Cole Medin, Matt Pocock, AI Jason, Nick Saraev, Simon Scrapes, Nate Herk, Leon van Zyl, Developers Digest, All About AI, Eric Tech, Tech With Tim, Anthropic, OpenAI, n8n, Greg Isenberg. Greg Isenberg väger tyngst för affärsidéer, inte för hubben.

**Korssignal:** ett repo som nämns av en följd kanal *och* trendar på GitHub får högst prioritet.

### 4.2 Sociala medier & konkurrenter

**content-engine samlar in, Radar analyserar.** Ingen dubbel insamling och en enda följlista.

| Källa | Metod |
|---|---|
| content-engine Competitor Intelligence | Skrivskyddad roll mot content-engines Postgres (Neon): poster, snapshots, signaler (prestation mot baslinje vid samma postålder) och referensvideoanalyser. Tabellnamn verifieras i fas 1. |
| Följlistan `library/follow-lists/golfkuponger.json` | Läses. Ändringar föreslås som PROJEKT-kort mot content-engine. |
| Meta Ad Library | Via content-engines befintliga annonssidor och sökordet "friskvårdsbidrag". |

Det Radar tillför och som content-engine inte gör:

- känner igen **tävlingar och kampanjer** hos konkurrenter och inspirationskonton (nyckelord som tävling, vinn, utlottning, giveaway, friskvårdsbidrag kvar),
- **strategikort** som kopplar sociala signaler till försäljningsdata ("Hagabadet kör 'friskvårdsbidrag kvar?' nu, ni har ingen Q4-kampanj, och december förra året stod för X % av friskvårdsförsäljningen"),
- **uppföljning** av egna planer, till exempel Instagram-piloten från 2026-10-16 som saknar baslinje och publicering.

Första PROJEKT-kortet som redan är känt: lägg till de verifierade direkta konkurrenterna (SGF/Sweetspot, Cloud Golf, GolfNext, OnTee) i följlistan. Källa: Notion Company Knowledge, "Golfmarknaden – mått, distributionsgränser och digitala konkurrenter", 2026-09-16.

### 4.3 Försäljning & siffror

All personinformation stannar i källan. Radar läser bara **aggregat**.

| Källa | Innehåll |
|---|---|
| n8n `GK_ORDERS` | Order per kanal (Benifex, Epassi, Stripe, Shopify), produkt, belopp, status |
| n8n `GK_DAILY_ORDER_REPORTS` | Dagssumma, återköp, jämförelse mot samma datum förra året (`development_pct`) |
| n8n `GK_CRM_EVENTS`, `GK_RETENTION_QUEUE` | WINBACK och CRM-utfall |
| Search Console-veckodata | Arket från `Golfkuponger – Weekly SEO Tracker` |
| Shopify Analytics | Via Shopify-anslutningen (analytics query), bara läsning |
| Notion Growth System | Log, Growth Radar och Company Knowledge: vad som redan prövats, beslutats och verifierats |

### 4.4 Projekt & kod

| Källa | Innehåll |
|---|---|
| Projektkatalogen `projects/catalog.json` | Utökas med `main_repos` per projekt (content-engine, golfkuponger-app och andra) |
| GitHub | Röd CI i ≥ 2 dygn, öppna PR:er utan aktivitet, brancher utan PR, öppna issues, beroenden med säkerhetsvarningar |
| Notion Log | Poster med "Test startat" utan "Testresultat", och "Idé" eller "Beslut" utan uppföljning i > 14 dagar |
| Transkriptmönster | Påbörjat men inte slutfört, upprepade manuella steg |

### 4.5 REA (reverse engineering)

Beslut: Radar får själv köra REA på **allt publikt**, med fasta gränser:

- appar hämtas bara från officiella butiker eller som publika web bundles,
- bara statisk analys, utan att kringgå skydd och utan att använda inloggning,
- målet är att förstå konkurrenters checkout, erbjudanden, spårning och tekniska val, aldrig att kopiera kod,
- allt REA-material behandlas som osäker data (se 9.2).

## 5. Pipeline

1. **Detektorer** (kod i repot, körs av n8n, ingen AI) skapar `observation`-poster med källa, tidpunkt, värde och `dedupe_key`.
2. **Förfilter** (liten betald modell i n8n, inom budget) avgör för varje observation om den är värd en hypotes, och skriver en mening om varför. Billigt och brett.
3. **Domare.** Hubb- och projektfrågor går till den **lokala domaren**. Affärsfrågor går till en **stark modell i n8n** inom budget. Domaren returnerar ett kort enligt kontraktet i avsnitt 7.
4. **Test.** NY kräver smoke-test och ERSÄTT kräver A/B (se 6.2), som den lokala domaren kör i karantän.
5. **Skeptiker.** En separat körning med instruktionen att hitta varför kortet är fel, redan känt eller generiskt. Den kan godkänna, sänka eller avvisa kortet.
6. **Grindar** (kod, avsnitt 6). Bara kort som klarar dem kan publiceras.
7. **Publicering** i morgonbrevet eller som direktlarm.
8. **Beslut och utförande** efter Jonas OK (avsnitt 8).
9. **Uppföljning.** Notion uppdateras, effekten mäts efter bestämd tid och resultatet tas med i fredagssammanfattningen.

**Fail closed:** svarar inte modellen med ett giltigt kontrakt skapas **inget** kort. Reservbedömningar som i Opportunity OS är förbjudna.

## 6. Grindar

Grindarna är deterministisk kod med tester. Modellen beskriver, och koden avgör.

### 6.1 Gemensamma grindar (alla kort)

| # | Grind | Krav |
|---|---|---|
| G1 | Observation | Minst en evidenspost med källa, datum och värde, hämtad och verifierad (HTTP 200 eller datarad finns). Plattformsnyheter kräver en URL på leverantörens egen domän. |
| G2 | Konkret mål | `target` pekar på något som finns i inventeringen: en skill, ett verktyg, ett repo med sökväg, ett n8n-arbetsflöde med id, en Notion-sida, ett mått eller en tabell. Valideras mot inventeringen. Okänt mål innebär avslag. |
| G3 | Nytt för oss | Inte redan i hubben (namn och beskrivningslikhet), inte beslutat i Notion Log de senaste 90 dagarna och inte avvisat tidigare utan ny evidens. |
| G4 | "För att…" | `because` nämner minst en namngiven entitet från inventeringen plus en konsekvens. En lista med generiska fraser (till exempel "öka engagemang", "förbättra effektiviteten", "spara tid") avvisar texten om den inte har en siffra eller entitet. |
| G5 | Skeptiker | Skeptikern får inte ha returnerat `REJECT`. `DOWNGRADE` sänker rangen. |
| G6 | Giltigt kontrakt | JSON enligt schemat, aktuell `contract_version` och ingen reserv. |
| G7 | Tak och spridning | Högst 3 kort per morgonbrev och högst 2 per område per dag. Därefter rangordnas korten. |
| G8 | Budget | Ingen domarkörning när månadsbudgeten är slut. |

### 6.2 Grindar per korttyp

| Typ | Extra krav |
|---|---|
| **NY** | Smoke-test på en realistisk uppgift i vår stack har passerat (`test.verified = true`). Statisk säkerhetsskanning utan fynd. Licensen tillåter användning. Skillen fungerar i båda klienterna, eller anger varför inte. |
| **ERSÄTT** | A/B: samma uppgift körd med gammal och ny skill, där båda utdata sparas och jämförs. Den nya ska vinna på minst ett angivet kriterium utan att förlora på något. Namnet på det som ersätts måste finnas i inventeringen. |
| **PROJEKT** | Repo, sökväg eller arbetsflöde finns. Planen rör aldrig `main` direkt eller Shopify-temat **Fabric**. Det finns ett mått som ska förbättras och en baslinje. |
| **ANVÄND** | En regel på högst 3 rader som passar i `~/.agents/AGENTS.md`, plus en källa eller observation som visar varför. |
| **LARM** | Se 6.3. |

Ett kort vars test inte kunde verifieras får märkningen **overifierad** och kan aldrig hamna i topp 3.

### 6.3 Direktlarm

Bara när väntan till nästa morgonbrev minskar värdet:

- en konkurrent eller ett inspirationskonto kör en tävling eller kampanj **just nu** som rör friskvårdsbidrag eller golf,
- försäljningen ligger klart under förra året: rullande 7 dagar minst 30 % under samma dagar förra året, två fönster i rad, och med minst 20 000 kr i jämförelsefönstret. Daglig volym (2–20 order) svänger för mycket för dagsjämförelser: −60 % till +600 % under oktober 2026. En stor uppgång ger en vanlig observation, aldrig ett larm,
- en plattformsnyhet i primärkälla bryter eller förändrar något vi kör (till exempel en ändring i Claude Code eller Codex som påverkar hubben eller sync),
- en säkerhetsvarning för något som är installerat i hubben.

## 7. Kortkontrakt och format

### 7.1 JSON-kontrakt

Källan är [`schemas/card.v1.schema.json`](../schemas/card.v1.schema.json) (JSON Schema 2020-12). Den valideras av `scripts/lib/v2/card-contract.mjs`, som använder en egen validator utan beroenden för exakt den delmängd av JSON Schema som schemat använder. Okända nyckelord ger fel i stället för att tyst ignoreras.

Fält utöver skissen i den första versionen av specen, fastställda i fas 1:

| Fält | Varför |
|---|---|
| `analysis_mode` (`model` eller `fallback`) | Gör reservbedömningar synliga, så att G6 kan avvisa dem. |
| `platform_news` | Avgör om G1 kräver en primärkälla på leverantörens egen domän. |
| `observations[].source_kind` | `primary`, `aggregator`, `data`, `social`, `repo`, `video` eller `transcript`. Aggregatorer kan aldrig ensamma bära ett kort. |
| `anchors[]` | De befintliga entiteter i vår stack som kortet bygger på. För NY och ERSÄTT finns målet ännu inte, så kopplingen till stacken bärs av ankarna. |
| `test.outcome` (`pass`, `fail`, `not_run`) och `test.ab` | Skiljer ett misslyckat test (avvisas) från ett som inte är verifierat (overifierad). A/B anger vinnare per kriterium. |
| `security` | Statisk skanning, licens och vilka klienter som stöds. Krävs för NY och ERSÄTT. |
| `rule_text` | Regeltexten för ANVÄND. |
| `urgency` | Utlösare och giltighetstid för LARM. |
| `target.branch` | Branch för PROJEKT. |

**Inventeringen** som grindarna jämför mot är JSON med listorna `skills`, `tools`, `mcp`, `repos`, `workflows`, `notion`, `metrics`, `agents_rules` och `shopify_themes`. Varje post identifieras av `id`, `name`, `title` eller `aliases`. Repon kan ange `default_branch` och `protected_refs`. Exempel finns i `tests/helpers/v2-fixtures.mjs`. Exporten från hubben och n8n byggs senare i fas 1.

### 7.1.1 Grindarna i kod

`scripts/lib/v2/gates.mjs`:

- `evaluateCard(card, { inventory, decisions, budget, now })` kör G1–G6, G8 och typgrinden och returnerar `publishable`, `unverified`, `rank_score` och skälet per grind. Är kontraktet ogiltigt (G6) körs inget annat.
- `selectForBrief(evaluations)` är G7: högst 3 kort, högst 2 per område, larm separat och overifierade kort hålls utanför brevet.

Förtydliganden som fastställdes när grindarna byggdes:

- **G2:** alla ankare måste finnas i inventeringen. Målet måste finnas, utom för NY och ERSÄTT.
- **G3:** NY avvisas om namnet redan finns i hubben (också med `tool-`-prefix). Samma `dedupe_key` som beslutats inom 90 dagar avvisas. Ett äldre Nej kräver en observation efter beslutet.
- **G4:** motiveringen måste alltid nämna en namngiven entitet (ankare, mål eller det som ersätts) och vara minst 40 tecken. En generisk fras utan siffra avvisas även om en entitet nämns.
- **G8:** saknad budgetstatus räknas som underkänt (fail closed).
- **PROJEKT:** branchen måste börja med `radar/` och får inte vara `main`, `master`, repots standardbranch eller en skyddad ref. Ordet Fabric i rubrik, rekommendation, åtgärd, mål eller branch ger avslag.

### 7.2 Hur korten ser ut i Discord

Fyra mallar, efter Jonas egna formuleringar:

> **NY · Verktyg & hubb**
> **Använd skillen `X`.** Ni har ingen skill som gör just detta, och det är viktigt för att *[konkret konsekvens i er stack]*.
> Bevis: *[observation + testresultat]* · Insats: 10 min · Kostnad: 0 kr

> **ERSÄTT · Verktyg & hubb**
> **`X` bör ersätta er `Y`**, för att *[A/B-resultat i en mening]*.
> A/B: *[uppgift]*. Gammal: *[resultat]*. Ny: *[resultat]*. Vid OK flyttas `Y` till backup.

> **PROJEKT · Sociala medier**
> **Lägg till X i content-engine**, för att *[observation + koppling till era siffror]*.
> Vid OK: branch `radar/…` + PR, som du mergar själv.

> **ANVÄND · Försäljning**
> **Det här bör ni använda: X**, för att *[observation]*.
> Vid OK: regeln läggs i den delade hubben, eller ett test startas och loggas i Notion.

Knappar på varje kort:

- **OK** · **Nej** · **Mer info**
- **1–10** (bara Jonas Discord-ID får betygsätta, som i dag)
- Orsak (valfri, ett tryck): **Visste redan** · **För generiskt** · **Fel fakta** · **Bra men inte nu** · **Bygg detta!**

## 8. Utförande efter OK

Inget utförs utan Jonas OK på just det kortet. Ett OK gäller bara det kortet.

| Typ | Utförande |
|---|---|
| NY (skill) | Den lokala domaren lägger skillen i `~/.agents/skills/<namn>/` enligt `agent-hub`, kör `hub.py sync` och verifierar att den syns i både Claude och Codex. |
| NY (verktyg) | `hub.py tool clone` → isolerad installation → smoke-test → `hub.py tool new` → `hub.py tool publish`, enligt `agent-hub`. Installerare och program kräver ett extra OK där storlek och källa anges. |
| ERSÄTT | Som NY, och sedan `hub.py skill remove <gammal>`, som flyttar den gamla till backup. |
| PROJEKT | Branch `radar/<kort-id>` i målrepot → ändring → projektets tester → PR med kortets motivering. Jonas mergar. Aldrig `main`, aldrig Fabric. |
| ANVÄND | Ändring i `~/.agents/AGENTS.md` + `hub.py sync`, eller ett test som loggas i Notion Log ("Test startat" med baslinje). |

Efter varje utförande skrivs en post i Notion Log, och utfallet mäts enligt `measure.check_after_days`.

## 9. Säkerhet

### 9.1 Provkörning (lokal domare)

Beslut: Codex inbyggda sandlåda (`workspace-write`, nätverk av) på Windows 11 Home. WSL, Docker och Windows Sandbox finns inte. Codex dokumentation anger att nätverket är avstängt som standard i `workspace-write`, och att `codex sandbox windows` kan användas som självtest. Det finns öppna rapporter om Windows-specifika hål, så sandlådan är ett **extra skyddslager** och aldrig det enda:

1. `codex sandbox windows`-självtestet körs före varje körning. Fallerar det avbryts allt.
2. Statisk skanning före provkörning: skript, hooks, install-steg, nätverksanrop, kodade strängar och injection-mönster i SKILL.md och README.
3. Repots install-, postinstall- och hook-skript körs **aldrig** under provkörning.
4. Inga hemligheter i miljön. Karantänmappen ligger utanför `~/.agents` och raderas efteråt.
5. Kandidaten publiceras till hubben först efter OK, och då via `hub.py`, som tar backup.

Codex-versionen och den aktuella dokumentationen kontrolleras i fas 0, eftersom Windows-stödet ändras ofta.

### 9.2 Osäkert innehåll

Allt från källor (README, SKILL.md, videotranskript, konkurrentsidor, REA-utdata) är **data, inte instruktioner**. Prompterna ska säga det uttryckligen. Kandidattext som försöker styra agenten ("ignore previous", "run this", "install") flaggas och sänker kortet till avslag.

### 9.3 Integritet

- Claude- och Codex-transkript läses bara lokalt. Bara rensade mönster går vidare till n8n ("X gjort för hand 5 gånger", "skill Y oanvänd i 60 dagar", "påbörjat Z 2026-10-02, inte slutfört"). Hemligheter, e-postadresser och kunddata tas bort.
- Försäljningsdata lämnar källan bara som aggregat.
- Hemligheter läggs aldrig i repot, korten eller Notion.

## 10. Inlärning

- **Betyg och orsak** sparas per kort (tabell som motsvarar `GK_AI_RADAR_FEEDBACK`, utökad med `reason`).
- **Exempelbank:** de senaste högt och lågt betygsatta korten med orsak läggs in som exempel i domarens och skeptikerns prompter, per område.
- **Kalibrering:** tröskeln per område justeras utifrån betygen. Många "För generiskt" höjer kravet i G4. Många "Visste redan" skärper G3.
- **Ej betygsatta kort** räknas som neutrala, inte som positiva.
- **Missade kort:** Jonas kan logga något viktigt som Radar missade (kommando eller Discord-knapp). Varje sådant räknas som ett misslyckande och analyseras: vilken källa eller detektor saknades?

## 11. Hubbunderhåll

Utöver NY och ERSÄTT:

- **Uppdateringar:** upstream-ändringar i installerade skills och verktyg bevakas och blir UPPDATERA-kort (en variant av ERSÄTT, där A/B körs vid större ändringar).
- **Städning, en gång i månaden:** skills som inte använts på 60 dagar enligt transkripten, eller som överlappar andra, föreslås för borttagning. Antalet skill-beskrivningar är begränsat i båda klienterna (102 skills 2026-10-19), så fler skills är inte automatiskt bättre.

## 12. Budget

- **Hårt tak: 250 kr/mån** för API-kostnader (förfiltermodell, affärsdomare i n8n, Apify för transkript och REA-insamling). Larm vid 80 %.
- Den lokala domaren körs på Jonas prenumeration och räknas inte mot taket.
- Hellre färre bedömningar än sämre. När taket nås pausas domarsteget, men detektorerna fortsätter att köras.
- Kostnad loggas per körning (modell, tokens, Apify `usageTotalUsd`) och visas i fredagssammanfattningen.

## 13. Faser

Faserna anger byggordning. Alla fyra områden går live samtidigt i fas 2.

### Fas 0 – förutsättningar

- [x] ~~**Jonas:** lös GitHub-faktureringen~~. Löst genom att repot gjordes publikt 2026-10-19, så Actions kör gratis och testerna körs på varje PR.
- [ ] Discord-kanal `#radar` och bot-behörigheter (återanvänd AI Radar-boten).
- [ ] Kontrollera Codex-version och sandlåda: `codex sandbox windows` passerar.
- [ ] Skrivskyddad databasroll mot content-engines Postgres.
- [x] Bestäm hur jobbkön nås från datorn: HMAC-signerade n8n-webhooks med bara utgående anrop från datorn (se avsnitt 3).

Klart när: alla punkter är bockade och verifierade.

### Fas 1 – ryggrad (skuggläge, inget publiceras)

- [x] Kortkontraktet som JSON Schema plus validering och tester.
- [x] Grindarna G1–G8 och typgrindarna som kod med tester, inklusive negativa fall (generisk text, okänt mål, reserv).
- [x] Inventeringsexport från hubben (`scripts/v2/build-inventory.mjs`) plus lokal statisk del för repon, n8n, Notion och mått.
- [x] n8n: observationstabell (`GK_R2_OBSERVATIONS`), ingest och data feed, konfiguration och kostnadslogg. Heartbeat körs i Actions och lokalt (avsnitt 3).
- [ ] Budgetvakt som läser `GK_R2_COSTS` (behövs först när domaren gör betalda anrop).
- [ ] Lokal domare: Windows-aktivitet, hämtning av jobb, Codex headless, karantän, statisk skanning, retur av kort.
- [x] Minst en detektor per område som ren kod (`scripts/lib/v2/detectors/`): releaser och YouTube (verktyg & hubb), kampanjer och avvikande inlägg (sociala), 7-dagarstrend (försäljning), röd CI och Notion Log som stått stilla (projekt). Alla har tester, och releaser, YouTube och CI är provkörda mot riktig data.
- [x] Koppla detektorerna till riktiga indata: GitHub-releaser och CI, YouTube-RSS, `GK_DAILY_ORDER_REPORTS` och Notion Log. Verifierat end-to-end 2026-10-19 med 104 observationer i `GK_R2_OBSERVATIONS` och 0 dubbletter vid omkörning.
- [ ] content-engine som källa för sociala signaler (kräver skrivskyddad databasroll, fas 0).
- [x] Verifiera YouTube-kanal-ID för alla 16 kanaler.

Klart när: varje område har producerat minst ett kort i skuggläge som klarar grindarna, och Jonas har läst dem i en testkanal.

### Fas 2 – live, alla fyra områden

- [ ] Morgonbrev 07:30 (max 3), direktlarm och fredagssammanfattning.
- [ ] Discord-knappar för OK, Nej, Mer info, 1–10 och orsak.
- [ ] Alla källor i avsnitt 4 inkopplade, med GitHub Trending-parsern omskriven och testad.
- [ ] Notion-skrivning av kort som fått OK eller Nej.

Klart när: två veckor i drift utan tekniska fel, och gamla system körs parallellt i skuggläge.

### Fas 3 – utförande

- [ ] NY och ERSÄTT via `hub.py`, med A/B-artefakter sparade.
- [ ] PROJEKT som branch plus PR.
- [ ] ANVÄND till `AGENTS.md` eller ett test i Notion.
- [ ] Uppföljning av effekt enligt `measure`.

### Fas 4 – inlärning och städning

- [ ] Exempelbank och kalibrering per område.
- [ ] Bevakning av uppdateringar för installerade skills och verktyg.
- [ ] Månatlig städning baserad på transkriptmönster.
- [ ] Rapportering och analys av missade kort.

### Fas 5 – avveckling

Efter två veckor med godkänt resultat (avsnitt 14):

- [ ] Inaktivera n8n 30–35 (AI Radar) och 50–62 (Opportunity OS). Behåll Deploy Controller och worker om de används i fas 3.
- [ ] Ta bort Telegram-leveransen i detta repo och arkivera v1-flödet.
- [ ] Rensa firehose-källor ur `GK_AI_RADAR_SOURCES`.

## 14. Framgångsmått

Avstämning efter fyra veckor i fas 2:

| Mått | Mål |
|---|---|
| Snittbetyg (Jonas 1–10) | ≥ 7 |
| Kort som fått OK och genomförts | ≥ 1 per vecka |
| Andel "Visste redan" + "För generiskt" | ≤ 20 % |
| Missade viktiga saker (loggade av Jonas) | 0 |
| Budget | ≤ 250 kr/mån |

Om målen inte nås justeras källor, detektorer och grindar innan något nytt läggs till.

## 15. Beroenden och öppna punkter

- GitHub-faktureringen är inte längre ett hinder, eftersom repot är publikt sedan 2026-10-19 och Actions därmed är gratis.
- Claude Code CLI finns inte i PATH på datorn, så domaren är Codex. En korskontroll med Claude kan läggas till senare om CLI installeras.
- Tabellnamn i content-engines databas verifieras i fas 1 (YouTube-kanalernas ID är verifierade).
- Shopify Analytics nås via Shopify-anslutningen. Om n8n behöver egen åtkomst krävs en skrivskyddad app eller token (fas 1).
- Discord-komponenternas gränser kontrolleras mot aktuell dokumentation innan kortlayouten fastställs. `37 AI – Discord Interactions v2` hanterar redan 1–10.
