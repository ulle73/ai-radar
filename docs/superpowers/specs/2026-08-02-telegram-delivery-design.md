# Reliable Telegram Delivery

## Goal

AI Radar ska skicka endast kvalitetsgodkända poster från `notifications/pending.json` till Jonas Telegram-chat utan dubbelsändningar eller borttappade notifieringar.

## Architecture

Telegram-leveransen körs i samma GitHub Actions-jobb direkt efter analysen. En separat, testbar modul formaterar meddelanden och anropar Telegram Bot API. En körfil läser kön, levererar sekventiellt, tar bort endast lyckade poster, sparar leveranshistorik och skriver `status/telegram.json`.

## Queue semantics

- `notifications/pending.json` innehåller oskickade notifieringar.
- Varje notifiering får ett deterministiskt `notification_id`.
- En lyckad leverans tas bort ur pending-kön och läggs i `notifications/sent.json`.
- En misslyckad leverans ligger kvar för automatisk retry nästa körning.
- Om en redan skickad `notification_id` återkommer i pending tas den bort utan att skickas igen.

## Telegram message

Meddelandet använder Telegram HTML och innehåller:

- repo och GitHub-länk,
- namngivet projekt,
- varför matchningen är relevant,
- konkret användningsfall,
- differentiator,
- nästa praktiska test,
- poäng och confidence,
- högst ett evidensobjekt.

All dynamisk text HTML-escapas. Token, chat-ID och API-URL med token får aldrig skrivas till loggar eller statusfiler.

## Error handling

- Tom kö: status `idle`, inget API-anrop.
- Saknad token eller chat-ID med poster i kön: status `failed`, kön lämnas orörd och steget misslyckas.
- Delvis API-fel: lyckade poster arkiveras, misslyckade ligger kvar, status `degraded` och steget misslyckas.
- Full framgång: status `healthy`.
- Workflowens commit-steg körs även efter Telegram-fel, men endast om analyssteget lyckades. Därmed sparas pending-kö och felstatus för nästa retry.

## Smoke test

`TELEGRAM_SMOKE_TEST=true` skickar ett separat anslutningstest utan att skapa eller konsumera en radar-notifiering. `workflow_dispatch` får en boolean-input för detta.

## Files

- `scripts/lib/telegram.mjs`: formatering, identitet, API-anrop och leveranslogik.
- `scripts/send-telegram.mjs`: fil-I/O, smoke test, status och exit code.
- `tests/telegram.test.mjs`: enhetstester utan nätverk.
- `.github/workflows/daily-github-radar.yml`: secrets, notify-steg och säker commit-condition.
- `notifications/sent.json`: leveranshistorik.
- `status/telegram.json`: senaste leveransstatus.

## Configuration

GitHub Actions secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Inga nya runtime-beroenden krävs.
