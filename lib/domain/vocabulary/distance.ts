import { distance, parseRule } from "../saved/patterns.ts";

/**
 * HOW FAR A ZURICH WORD IS FROM ITS GERMAN — the one classification.
 *
 * A German speaker meets three kinds of Zurich German word, and they are not
 * equally hard:
 *
 *   same / close  `Hund`, `schlafe` — the German gives it away.
 *   rule          `Chind`, `Huus` — free once you know one sound rule of the
 *                 pack (k → ch, au → uu …), and not before.
 *   far           `nöd`, `öppis`, `mir` for «wir» — nothing in German leads
 *                 there; it has to be learned.
 *   trap          `Estrich` — looks German and means something else (the
 *                 pack's `mistakenFor`). The hardest of all, because the
 *                 learner is sure.
 *
 * Measured, not judged: relative spelling distance to each German gloss, with
 * and without the pack's own correspondences applied. Relative, because one
 * letter in `tue`/`tun` is a third of the word and in `Schwöschter`/
 * `Schwester` is nothing. The vocabulary page's ranking ("guessable"), every
 * exercise's level and the learner's progress by level all read THIS.
 */
export type Closeness = "same" | "close" | "rule" | "far" | "trap";

/** The three levels a learner sees: like German, by a rule, different. */
export type Level = 1 | 2 | 3;

/** Distance per letter at or below which the German gives the word away. */
export const GUESSABLE_AT = 0.25;

type Rules = readonly { rule: string }[];

function fold(text: string): string {
  return text.normalize("NFC").trim().toLocaleLowerCase("de");
}

function ratio(a: string, b: string): number {
  return distance(a, b) / Math.max(a.length, b.length, 1);
}

/** Every spelling the German can take once the pack's sound rules are applied. */
function ruled(gloss: string, rules: Rules): string[] {
  let spellings = [gloss];
  for (const sub of rules.map((c) => parseRule(c.rule)).filter((s) => s !== null)) {
    spellings = spellings.flatMap((s) => (s.includes(sub.from) ? [s, s.replaceAll(sub.from, sub.to)] : [s]));
  }
  return spellings.slice(1);
}

export function closenessOf(
  word: { target: string; bridge: string; mistakenFor?: string },
  rules: Rules,
): Closeness {
  if (word.mistakenFor) return "trap";
  const target = fold(word.target);
  const glosses = word.bridge.split(/[,(;/]/).map(fold).filter(Boolean);
  let best: Closeness = "far";
  for (const gloss of glosses) {
    if (gloss === target) return "same";
    if (ratio(target, gloss) <= GUESSABLE_AT || droppedEnding(target, gloss)) best = "close";
    else if (best === "far" && ruled(gloss, rules).some((s) => ratio(target, s) <= GUESSABLE_AT)) best = "rule";
  }
  return best;
}

/**
 * The German word with its ending dropped — `au` for «auch», `no` for «noch»,
 * `mache` for «machen». Zurich German drops a final -ch or -n all the time,
 * and by letter count a two-letter word missing two letters looks half
 * different when the German gives it straight away.
 */
function droppedEnding(target: string, gloss: string): boolean {
  return target.length >= 2 && gloss.startsWith(target) && gloss.length - target.length <= 2;
}

export function levelOf(closeness: Closeness): Level {
  if (closeness === "same" || closeness === "close") return 1;
  if (closeness === "rule") return 2;
  return 3;
}

const WORD = /[\p{L}\p{M}'’-]+/gu;

/**
 * A whole sentence's level: by the share of its Zurich words that nothing in
 * the German sentence gives away. All of them guessable is level 1; up to a
 * third far is level 2; more is level 3. A rule-only word counts half.
 */
export function sentenceLevel(target: string, bridge: string, rules: Rules): Level {
  const words = (target.match(WORD) ?? []).map(fold);
  const german = (bridge.match(WORD) ?? []).map(fold);
  if (words.length === 0) return 1;
  let cost = 0;
  for (const word of words) {
    const c = german.reduce<Closeness>((best, g) => {
      const here = closenessOf({ target: word, bridge: g }, rules);
      const order: Closeness[] = ["same", "close", "rule", "far"];
      return order.indexOf(here) < order.indexOf(best) ? here : best;
    }, "far");
    cost += c === "far" ? 1 : c === "rule" ? 0.5 : 0;
  }
  const share = cost / words.length;
  if (share === 0) return 1;
  return share <= 1 / 3 ? 2 : 3;
}
