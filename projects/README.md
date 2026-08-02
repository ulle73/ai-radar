# AI Radar project catalog

`catalog.json` är den kanoniska källan för vilka av Jonas projekt AI Radar får matcha externa GitHub-repos mot.

Äldre fristående markdownfiler i denna katalog får ligga kvar som historisk dokumentation, men de laddas inte längre in i modellens matchningskontext.

## Viktig underhållsregel

Höj rotfältet `version` med ett heltal när en ändring kan påverka hur externa repos bör bedömas. Exempel:

- ett nytt projekt läggs till eller ett projekt tas bort,
- prioritet eller `notification_tier` ändras,
- en norrstjärna, affärsmodell eller målgrupp ändras väsentligt,
- nya aktuella behov eller tillväxtmotorer läggs till,
- `exact_match_requirements` eller `negative_matches` ändras,
- ett projekt byter central teknisk plattform.

Varje bedömt externt repo sparar `project_context_version`. När katalogens `version` inte matchar den sparade versionen kör AI Radar om bedömningen vid nästa analys, även om repot annars är tillräckligt färskt för att återanvändas.

Små stavningsrättningar som inte ändrar betydelsen kräver normalt ingen versionshöjning.

## Projektnamn

Modellsvar måste använda exakt `display_name` från katalogen. Alias används endast för förståelse och discovery; de är inte giltiga värden i `project_matches`.

## Exact-match

Gemensam teknik, bransch eller ämnesord räcker aldrig. En exact-match måste kunna kopplas till minst ett konkret:

- `current_need`,
- `core_workflow`,
- `growth_lever`,
- `exact_match_requirement`,
- utvecklingsarbete eller databehov som uttryckligen beskrivs i profilen.

## Obligatoriska profilområden

Varje projektprofil ska beskriva:

- identitet, prioritet, repoalias och notifieringsnivå,
- produkt, norrstjärna, affärsmodell och målgrupper,
- befintliga funktioner och arbetsflöden,
- aktuella behov och tillväxtmotorer,
- teknisk stack,
- värdefulla matchningsområden och discovery-termer,
- negativa matchningar,
- kraven för exact-match,
- vad Telegram-notisen ska fokusera på.
