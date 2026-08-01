# Strict AI Radar Quality Calibration

## Goal

AI Radar ska optimera för precision: Jonas ska hellre missa ett halvbra repo än få brus, generiska AI-rekommendationer eller flera nästan likadana verktyg i huvudrankingen och framtida Telegram-notiser.

## Product behavior

Systemet behåller alla analyser i katalogen och dagshistoriken, men skiljer strikt mellan:

1. **Huvudranking** – endast exceptionella och starka, konkreta matchningar.
2. **Arkiv/historik** – mellanbra, generiska, osäkra eller inaktuella fynd.
3. **Notifieringar** – endast nya exceptionella matchningar med tydligt nästa steg.

En tom eller mycket kort huvudranking är ett korrekt resultat.

## Required assessment evidence

Modellen måste för varje repo returnera:

- `match_type`: `exact`, `adjacent` eller `generic`.
- `category`: en kort stabil kategori för diversifiering.
- `concrete_use_case`: exakt vad Jonas kan göra med repot i ett namngivet projekt.
- `next_step`: ett litet praktiskt test.
- `differentiator`: varför repot tillför något utöver vanliga alternativ.
- `evidence`: 1–3 korta README-/metadata-baserade fakta som stöder bedömningen.
- befintliga poängdimensioner, risker och confidence.

Modellen får inte skapa en stark match enbart från ord som AI, agent, Codex, automation eller många stars.

## Deterministic quality gates

### Strong ranking eligibility

Ett repo får visas i huvudrankingen endast om alla krav uppfylls:

- modellanalys, aldrig fallback,
- `match_type = exact`,
- minst en konkret projektmatchning,
- `confidence >= 0.72`,
- `score >= 78`,
- `project_fit >= 23`,
- `concrete_value >= 13`,
- `testability >= 7`,
- icke-tom `concrete_use_case`, `next_step`, `differentiator`,
- minst ett evidensobjekt,
- inte manuellt avfärdad.

Kvalitetsnivåer:

- `exceptional`: score >= 86 och confidence >= 0.82.
- `strong`: övriga som passerar samtliga rankingkrav.
- `archive`: allt annat.

### Notification eligibility

Telegram-kön får bara ta emot ett repo när:

- kvalitetsnivån är `exceptional`,
- score >= 88,
- confidence >= 0.85,
- project_fit >= 25,
- concrete_value >= 15,
- repot är nytt eller har förbättrats minst 10 poäng,
- det inte redan ligger i pending-kön.

### Diversity

Huvudrankingen sorteras på ett deterministiskt `ranking_score`, men visar högst två repos per `category`. Övriga stannar i katalogen och dagshistoriken.

### Freshness and feedback

`state/feedback.json` är en manuell kontrollfil med status per repo:

- `saved`
- `testing`
- `adopted`
- `rejected`

`rejected` exkluderas. `saved`, `testing` och `adopted` skyddas från freshness-avdrag.

Otestade fynd får rankingavdrag baserat på senaste gång de sågs:

- 0–30 dagar: inget avdrag.
- 31–60 dagar: −3.
- 61–90 dagar: −7.
- över 90 dagar: tas bort från huvudrankingen.

## Ranking score

`ranking_score` utgår från grundpoängen och justeras deterministiskt:

- confidence under 0.85: upp till −3.
- freshness enligt ovan.
- `adopted`: +4.
- `testing`: +2.
- `saved`: +1.

Grundpoängen bevaras separat för spårbarhet.

## Quality telemetry

Varje körning skriver `status/quality.json` med:

- antal analyserade kandidater,
- antal exact/adjacent/generic,
- antal som passerade huvudrankingen,
- rekommendationsgrad,
- antal exkluderade av varje gate,
- kategorikoncentration,
- genomsnittlig confidence,
- antal notifieringar.

`quality_status` blir `warning` om något av följande inträffar:

- över 20 % av dagens kandidater passerar huvudrankingens gate,
- över 50 % av rankingen ligger i samma kategori före diversifieringscap,
- genomsnittlig confidence bland rankade repos är under 0.78.

Det påverkar inte teknisk `healthy/degraded`, men syns tydligt i statusfilerna.

## Migration

Bedömningar får `assessment_version: 2`. Alla katalogposter från tidigare version analyseras om vid nästa körning så den gamla generösa rankingen inte lever vidare.

## Error behavior

Fallbackanalyser sparas i historiken men kan aldrig hamna i huvudrankingen eller notifieringskön. Saknade nya evidensfält gör modellobjektet ogiltigt och utlöser konservativ fallback för det repot.

## Testing

Tester ska verifiera:

- generiska 90-poängsrepos exkluderas,
- exact 78+-matchningar med evidens inkluderas,
- exceptionell notifieringsgate,
- category-cap,
- freshness-avdrag och manuellt skydd,
- rejected-status,
- assessment-version tvingar omanalys,
- kvalitetsvarningar,
- fallback kan aldrig rankas.
