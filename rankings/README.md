# Rankings

Den här mappen är till för dagliga totalrankingar från AI Radar-analysen.

Målet är att kunna gå tillbaka om ett år och se vilka GitHub-repon som faktiskt passade Jonas projekt och idéer bäst.

## Struktur

```txt
rankings/
  latest.md
  daily/
    YYYY-MM-DD.md
```

## Viktigt

- Alla repon från `data/latest.md` ska rankas, inte bara topp 3.
- Ranking ska baseras på Jonas projekt, idébank och praktisk nytta.
- Ranking ska inte bara vara 1–10, eftersom för många får samma score.
- Använd `JonasFitScore`, ett mer granulärt score-system.
- Spara både score, primär match och motivering, så filen är användbar långt senare.

## JonasFitScore

Rekommenderat intervall: `0–1000`, med decimaler till en decimal.

Det ger tillräckligt mycket precision för att undvika att många repon får exakt samma ranking.

### Föreslagen viktning

```txt
Projektmatchning:        0–300
Idébanksmatchning:       0–200
Praktisk implementering: 0–200
Affärs-/intäktsnytta:    0–150
Timing/nyhetsvärde:      0–100
Strategisk edge:         0–50
Summa:                   0–1000
```

## Rekommenderat format

```md
# AI Radar Totalranking – YYYY-MM-DD

## Sammanfattning

## Rankingmodell
Kort beskrivning av hur JonasFitScore beräknats.

## Totalranking
| Rank | JonasFitScore | Repo | Primär match | Sekundär match | Action | Motivering |

## Toppkandidater att agera på

## Bra att spara för senare

## Brus / ignorera

## Nya idékandidater
```
