# Facit för proben P3 (frysta)

Proben P3 frågar en yta: "Var och i vilket format ska lärdomen X sparas?" Motorn bedömer svaret lokalt mot detta facit (C7). Facit är en del av skyddsräckespaketet och ändras bara med Jonas OK.

## Godkänt svar innehåller alla tre delarna

1. **Plats:** under rubriken `## Logg` i den kunskapsnod i Company Knowledge som saken gäller. Om ingen sådan nod finns: en rad i Growth Log.
2. **Format:** `- Lärdom [<nyckel>]: <text> (<YYYY-MM-DD>, <agent>, <källa>)`, med hakparenteserna ordagrant och nyckeln i kebab-case.
3. **Sök först:** sök efter `Lärdom [` (befintlig nyckel) innan en ny nyckel skapas.

## Deterministisk bedömning (probe-local.mjs)

Svaret godkänns om alla dessa mönster matchar (skiftlägesokänsligt, efter NFKC-normalisering):

- `logg`
- `kunskapsnod|company knowledge`
- `growth log`
- `lärdom \[`
- `yyyy-mm-dd|\d{4}-\d{2}-\d{2}`
- `kebab`  eller ett exempel på nyckel som matchar `\[[a-z0-9]+(-[a-z0-9]+)+\]`

## Probfrågan som används

"Var och i vilket format ska lärdomen notion-las-forst sparas? Svara kort med plats och radformat."
