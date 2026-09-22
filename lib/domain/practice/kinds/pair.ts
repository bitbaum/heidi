import { bridgeRules } from "../../../variety/bridge.ts";
import type { VarietyPack, VarietyRule } from "../../../variety/pack.ts";
import type { PairItem } from "../types.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * Which one is the Zurich form?
 *
 * The flagship item, and one of the objective ones. Generated from a pack rule
 * that names both a foreign form and the Zurich form it should have been —
 * `nid` → `nöd`, `güet` → `guet` — so the answer is defined by the checker
 * rather than by anybody's opinion.
 *
 * It trains the exact discrimination the product exists for: a learner who
 * cannot tell Bernese from Zurich German is the person §2 describes, and this
 * is the only exercise that measures it directly.
 */
export function pairItems(pack: VarietyPack): PairItem[] {
  return [
    ...fromRules(pack.rules, "target"),
    /**
     * The sibling's rules are the other half, and arguably the more useful.
     *
     * The pack says it best: somebody who writes a careful German email asking
     * about a *Fahrrad* "has written perfect German and marked themselves as
     * foreign in the first line, and no amount of care on their part would
     * have caught it". That is the definition of a thing worth drilling — an
     * error the learner cannot detect, with a right answer we can prove.
     */
    ...fromRules(bridgeRules(pack), "bridge"),
  ];
}

/**
 * Only rules that name BOTH halves can become a question.
 *
 * A rule that only says "this form is foreign" is useful to a checker and
 * useless here: an exercise needs the right answer, not just the wrong one. So
 * `suggest` is required, and the rules without it simply produce no items
 * rather than a question with one option.
 *
 * `match` must be a literal string too. A RegExp rule matches a pattern, and a
 * pattern cannot be shown to a learner as a word — `display` exists precisely
 * because a page once printed a lookahead assertion at somebody.
 */
function fromRules(rules: readonly VarietyRule[], variety: "target" | "bridge"): PairItem[] {
  const items: PairItem[] = [];

  for (const rule of rules) {
    if (typeof rule.match !== "string") continue;
    const wrong = rule.match.trim();
    const right = rule.suggest?.trim();
    if (!wrong || !right || wrong.toLowerCase() === right.toLowerCase()) continue;

    /**
     * The correct answer's position is decided by the CONTENT, not by a random
     * number: a shuffled position would make the session non-reproducible and,
     * worse, could put the answer on the same side several times in a row by
     * chance. Alternating on a stable property of the pair keeps it
     * unpredictable to a learner and fixed for a test.
     */
    const answer: 0 | 1 = right.length % 2 === 0 ? 0 : 1;
    const options: [string, string] = answer === 0 ? [right, wrong] : [wrong, right];

    items.push({
      id: `pair:${variety}:${wrong.toLowerCase()}`,
      kind: "pair",
      marking: "objective",
      variety,
      options,
      answer,
      ...(rule.origin ? { origin: rule.origin } : {}),
      source: { kind: "rule", rule: wrong },
    });
  }

  return items;
}

export const PAIR: ExerciseKind = {
  id: "pair",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => pairItems(material.pack),
};
