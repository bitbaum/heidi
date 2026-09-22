// Temporary: two buttons sat side by side on a grammar topic reading
// "Practise this topic" and "Practise this". They do completely different
// things — one opens a scoped exercise session, the other asks Heidi for
// example sentences. Removed in the same session.
import { readFileSync, writeFileSync } from "node:fs";

const FIXES = {
  de: [['practiseLabel: "Damit üben",', 'practiseLabel: "Mehr Beispiele",']],
  en: [['practiseLabel: "Practise this",', 'practiseLabel: "More examples",']],
  fr: [['practiseLabel: "S\'exercer là-dessus",', 'practiseLabel: "Plus d\'exemples",']],
  it: [['practiseLabel: "Esercitarsi su questo",', 'practiseLabel: "Altri esempi",']],
  ru: [['practiseLabel: "Потренировать это",', 'practiseLabel: "Ещё примеры",']],
  gsw: [['practiseLabel: "Demit üebe",', 'practiseLabel: "Meh Bispil",']],
  rm: [['practiseLabel: "Exercitar quai",', 'practiseLabel: "Dapli exempels",']],
};

for (const [loc, pairs] of Object.entries(FIXES)) {
  const path = `lib/i18n/dictionaries/${loc}.ts`;
  let source = readFileSync(path, "utf8");
  for (const [from, to] of pairs) {
    if (!source.includes(from)) {
      console.log(`${loc}: SKIP — not found: ${from}`);
      continue;
    }
    source = source.replace(from, to);
  }
  writeFileSync(path, source);
  console.log(loc, "ok");
}
