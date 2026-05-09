# Idé: Cold email-system för nystartade företag

## Status
Aktivt experiment-/researchspår kopplat till nyabolaget/företagslistor.

## Kort beskrivning
Ett system för att skicka relevanta B2B-mejl till nystartade företag i Sverige utan att hamna i skräppost, med fokus på klick till partnererbjudanden eller egna tjänster.

Fokus är leveransbarhet och klick, inte snygg design.

## Problem
Kalla utskick riskerar att hamna i spam, särskilt vid hög volym. Samtidigt vill projektet kunna nå många nystartade företag med erbjudanden från exempelvis One.com och Bokio.

## Målgrupp
- Nystartade företag i Sverige.
- Särskilt bolag som kan behöva domän, hemsida, bokföring, fakturering eller hjälp att komma igång.

## Mål
- Maximera inbox placement.
- Maximera relevanta klick.
- Minimera spamrisk.
- Segmentera och testa ämnesrader, timing och copy.
- Bygga hållbar cold email-infrastruktur med flera domäner/inboxar om det behövs.

## Möjlig MVP
- 2–5 domäner/inboxar.
- Warmup/volymstyrning.
- En enkel textbaserad mailvariant.
- UTM-spårning.
- Segmenterade listor.
- Dashboard för öppningar/klick/svar/opt-out.
- Test av olika erbjudanden.

## Stack / implementation
- Google Workspace eller Microsoft 365
- Instantly eller liknande cold email-verktyg
- Brevo för vissa kampanjer om lämpligt
- DNS: SPF, DKIM, DMARC
- UTM tracking
- Analytics
- Supabase/CSV för lead tracking

## Vad GitHub-radarn bör leta efter
- Deliverability checkers.
- DNS/SPF/DKIM/DMARC tooling.
- Email validation.
- Open source cold email sequencers.
- UTM click tracking.
- Simple campaign dashboards.
- Bounce/complaint tracking.
- Inbox placement testing.

## Vad som ska ignoreras
- Spamverktyg.
- Massmail-bots utan opt-out eller deliverability-kontroll.
- Aggressiva scraping+mailing pipelines.
- Verktyg som bryter mot plattformars villkor.

## Matchningsregler för AI Radar
Hög relevans om ett repo hjälper med:
- email deliverability
- DNS/email authentication
- cold email sequencing på ett seriöst sätt
- UTM och klicktracking
- bounce handling
- domain/inbox management
- lead segmentation

Låg relevans om repo är spammy, svart-hatt eller saknar leveransbarhetsfokus.
