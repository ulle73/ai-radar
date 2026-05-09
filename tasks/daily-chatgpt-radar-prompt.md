# Daily ChatGPT Radar Task Prompt

Den här prompten används för en daglig ChatGPT Task som läser senaste GitHub Radar-resultatet och matchar fynd mot Jonas projekt- och idébank.

## Prompt

Läs senaste GitHub Radar-rapporten i detta repo:

- `https://github.com/ulle73/ai-radar/blob/main/data/latest.md`

Läs även projekt- och idébanken i samma repo:

- `https://github.com/ulle73/ai-radar/tree/main/projects`
- `https://github.com/ulle73/ai-radar/tree/main/ideas`
- `https://github.com/ulle73/ai-radar/tree/main/chatgpt-genererade-ideer/candidates`

Analysera dagens GitHub Radar-resultat och jämför mot mina aktiva projekt och idéer.

Mina viktigaste aktiva projekt är bland annat:

- FAIV.se redesign och WooCommerce/webshop
- företagslistor.se / nyabolaget data- och listplattform
- nyabolaget.se partnerflöden och cold email
- stock-signals
- Socials v2
- AI Byggstart / Bygg med AI
- Dormy AI och automation

Mina idéer ligger i `/ideas` och ska också matchas mot dagens repo-fynd.

Gör detta:

1. Läs dagens radarfil och identifiera de mest relevanta repo-fynden.
2. Dela upp analysen i:
   - GitHub Trending daily
   - GitHub Trending weekly
   - Extra Search API finds
   - Trending developers
3. Matcha varje relevant repo mot mina projekt.
4. Matcha varje relevant repo mot min idébank.
5. Ge score 0–10 för relevans.
6. Förklara kort varför score är hög/låg.
7. Föreslå max 3 konkreta actions jag borde göra.
8. Föreslå max 3 nya idékandidater om något i dagens radar skapar en ny affärs-/produktidé.
9. Skriv nya idékandidater i färdigt markdown-format så de senare kan sparas under `/chatgpt-genererade-ideer/candidates/`.
10. Lista också vilka repos som verkar vara brus och bör ignoreras.

Viktiga regler:

- Prioritera praktisk nytta framför hype.
- Var hård med brus. Allt behöver inte bli en idé.
- Separera tydligt mellan “bör testas nu”, “spara för senare” och “ignorera”.
- Föreslå inte Codex-implementation om det inte finns tydlig koppling till ett aktivt projekt.
- Om ett repo är relevant för FAIV/design/UI, freebasa inte generisk design. Be om eller utgå från relevant DESIGN.md från `https://github.com/voltagent/awesome-design-md`.
- Om dagens radarfil saknas eller är gammal, säg det tydligt och analysera inte påhittad data.

Svarstruktur:

```md
# Daily AI Radar – analys

## Snabb slutsats

## Topp 3 att agera på
| Repo | Passar projekt/idée | Score | Varför | Nästa steg |

## Matchningar mot aktiva projekt

### FAIV
### företagslistor / nyabolaget
### stock-signals
### Socials v2
### AI Byggstart
### Dormy AI

## Matchningar mot idébanken

## Nya idékandidater

## Brus att ignorera

## Rekommenderad prioritet idag
```
