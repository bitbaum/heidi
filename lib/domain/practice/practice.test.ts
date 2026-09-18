import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { VARIETY } from "../../variety/active.ts";
import { check, checkAgainst } from "../../variety/check.ts";
import { bridgeRules } from "../../variety/bridge.ts";
import { allItems, articleItems, clozeItems, formItems, pairItems, recallItems } from "./generate.ts";
import { buildSession, summarise } from "./session.ts";
import { MIN_FORMS_TO_ASK, SESSION_SIZE } from "./types.ts";
import type { SavedWord } from "../saved/types.ts";

/**
 * The properties that make practice safe to ship in a product that refuses to
 * let a model be the authority on dialect.
 *
 * The exercises are a rearrangement of material the pack already vouches for.
 * If any of these fail, something started inventing language at the one person
 * who cannot check it.
 */

const NOW = new Date("2026-09-17T09:00:00Z");

function word(target: string, bridge: string, extra: Partial<SavedWord> = {}): SavedWord {
  return { target, bridge, savedAt: "2026-09-01T09:00:00Z", ...extra };
}

describe("which one is Zurich", () => {
  test("every pair is built from a rule the checker enforces", () => {
    /**
     * The claim that makes this the only objectively markable item: the right
     * answer is not an opinion, it is what the gate would say. So the gate is
     * asked, for every single item.
     */
    const items = pairItems(VARIETY);
    assert.ok(items.length >= 8, "expected pairs from both the dialect rules and the sibling's");
    // Both questions must be represented: "which is Zurich" and "which is Swiss".
    assert.ok(items.some((i) => i.variety === "target"));
    assert.ok(items.some((i) => i.variety === "bridge"));

    for (const item of items) {
      const right = item.options[item.answer];
      const wrong = item.options[item.answer === 0 ? 1 : 0];

      // Each pair is judged by the gate it belongs to. A bridge pair asks
      // "which is Swiss written German", and running it through the DIALECT
      // gate would be asking the wrong checker — which is precisely the
      // confusion the `variety` field exists to prevent.
      const verdict = (text: string) =>
        item.variety === "bridge" ? checkAgainst(text, bridgeRules(VARIETY)) : check(text, VARIETY);

      assert.equal(verdict(right).ok, true, `"${right}" is marked correct but its gate flags it`);
      assert.equal(verdict(wrong).ok, false, `"${wrong}" is marked wrong but its gate accepts it`);
    }
  });

  test("the two options are never the same word", () => {
    for (const item of pairItems(VARIETY)) {
      assert.notEqual(item.options[0].toLowerCase(), item.options[1].toLowerCase(), item.id);
    }
  });

  test("the answer is not always on the same side", () => {
    // A learner who notices the answer is always on the left has stopped
    // reading the words, which is the failure mode of a generated drill.
    const sides = new Set(pairItems(VARIETY).map((i) => i.answer));
    assert.equal(sides.size, 2, "every correct answer landed on the same side");
  });

  test("a pattern rule produces no item rather than showing a regex", () => {
    // `display` exists because a page once printed a lookahead assertion at a
    // learner. An exercise must not reintroduce that.
    for (const item of pairItems(VARIETY)) {
      for (const option of item.options) {
        assert.ok(!/[\\^$*+?()[\]{}|]/.test(option), `${item.id} shows regex syntax: ${option}`);
      }
    }
  });
});

describe("grammar cloze", () => {
  test("the blank removes a word the German sentence does not have", () => {
    /**
     * The point of the item. Blanking a word that appears in both sentences
     * tests nothing the topic is about — the learner could read it off the
     * clue.
     */
    const items = clozeItems(VARIETY);
    assert.ok(items.length >= 3, "expected cloze items from the grammar topics");

    for (const item of items) {
      assert.ok(item.prompt.includes("____"), `${item.id} has no blank`);
      assert.ok(
        !item.bridge.toLowerCase().includes(item.answer.toLowerCase()),
        `${item.id} blanked "${item.answer}", which is visible in the clue`,
      );
      /**
       * And the answer must really be gone from what is shown — EVERY
       * occurrence of it, in any casing.
       *
       * A substring check on the exact spelling passed «Mir händ, ihr händ, si
       * händ.» for a while, because `blank` replaced only the first one and the
       * test only asked whether the first one was gone. Matched as a whole word
       * and case-insensitively, so a capitalised occurrence at the start of a
       * sentence cannot hide either.
       */
      const showsAnswer = new RegExp(`(?<![\\p{L}])${item.answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}])`, "iu");
      assert.ok(!showsAnswer.test(item.prompt), `${item.id} still shows its answer: ${item.prompt}`);
    }
  });

  test("every cloze names the grammar topic it came from", () => {
    // So the page can link to the explanation, which is the whole reason the
    // reference section and practice belong to each other.
    const topics = new Set((VARIETY.grammar ?? []).map((t) => t.id));
    for (const item of clozeItems(VARIETY)) {
      assert.equal(item.source.kind, "grammar");
      if (item.source.kind === "grammar") {
        assert.ok(topics.has(item.source.topic), `${item.id} cites a topic that does not exist`);
      }
    }
  });

  test("it is self-marked, because there is no correct spelling to check against", () => {
    for (const item of clozeItems(VARIETY)) assert.equal(item.marking, "self");
  });
});

describe("the learner's own words", () => {
  test("a word with no meaning is not asked", () => {
    assert.deepEqual(recallItems([word("Chunnsch", "  ")]), []);
    assert.deepEqual(recallItems([word("  ", "kommst du")]), []);
  });

  test("it asks dialect first, which is the direction a message arrives in", () => {
    const [item] = recallItems([word("Chunnsch", "kommst du")]);
    assert.equal(item.prompt, "Chunnsch");
    assert.equal(item.answer, "kommst du");
  });
});

describe("a sitting", () => {
  test("works on day one, with nothing saved", () => {
    // The empty-state failure this avoids: a practice page that tells a new
    // learner to come back once they have saved something.
    const session = buildSession({ pack: VARIETY, saved: [], now: NOW });
    assert.equal(session.length, SESSION_SIZE);
    assert.ok(session.every((item) => item.kind !== "recall"));
  });

  test("a word that is NOT due is never asked", () => {
    /**
     * The schedule is the feature. Filling a session with a word due in three
     * weeks spends the spacing effect that `review.ts` exists to produce.
     */
    const notDue = word("Chunnsch", "kommst du", { dueAt: "2026-10-30T09:00:00Z", step: 2 });
    const session = buildSession({ pack: VARIETY, saved: [notDue], now: NOW });
    assert.ok(!session.some((item) => item.id === "recall:chunnsch"));
  });

  test("a due word leads the session", () => {
    const due = word("Chunnsch", "kommst du", { dueAt: "2026-09-01T09:00:00Z", step: 1 });
    const session = buildSession({ pack: VARIETY, saved: [due], now: NOW });
    assert.equal(session[0].id, "recall:chunnsch", "the only item with a deadline should come first");
  });

  test("the same inputs give the same session", () => {
    // No shuffle anywhere: a random session cannot be tested or resumed.
    const a = buildSession({ pack: VARIETY, saved: [], now: NOW });
    const b = buildSession({ pack: VARIETY, saved: [], now: NOW });
    assert.deepEqual(a.map((i) => i.id), b.map((i) => i.id));
  });

  test("what was asked last time is asked last this time", () => {
    const first = buildSession({ pack: VARIETY, saved: [], now: NOW });
    const second = buildSession({ pack: VARIETY, saved: [], now: NOW, seen: first.map((i) => i.id) });
    assert.notDeepEqual(
      second.map((i) => i.id),
      first.map((i) => i.id),
      "a second session repeated the first exactly",
    );
  });

  test("two items of the same kind avoid sitting together where possible", () => {
    // Eight multiple-choice questions in a row is how a person stops reading
    // the options and starts pattern-matching the layout.
    const session = buildSession({ pack: VARIETY, saved: [], now: NOW });
    const kinds = session.map((i) => i.kind);
    const runs = kinds.filter((kind, i) => i > 0 && kind === kinds[i - 1]).length;
    assert.ok(runs <= 2, `too many same-kind neighbours: ${kinds.join(", ")}`);
  });

  test("every item id is unique within a session", () => {
    const ids = buildSession({ pack: VARIETY, saved: [], now: NOW }).map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("the summary invents nothing", () => {
  test("it counts, and derives no score", () => {
    const summary = summarise([
      { id: "a", outcome: "right" },
      { id: "b", outcome: "wrong" },
      { id: "c", outcome: "skipped" },
    ]);
    assert.deepEqual(summary, { asked: 3, right: 1, again: 1 });
    // No percentage, no streak, no level — §8 forbids measuring consumption
    // and dressing it as learning.
    assert.deepEqual(Object.keys(summary).sort(), ["again", "asked", "right"]);
  });
});

describe("nothing is invented", () => {
  test("every item traces to the pack or to the learner's own words", () => {
    /**
     * Four provenances, and each one names something that exists: a variety
     * rule, a grammar topic, a word in the vocabulary, or a phrase the learner
     * saved themselves. `word` joined the list when articles and paradigms
     * did — it is the narrowest of the four, because it must resolve to an
     * entry, and an entry is the only place a gender or a form is ever
     * asserted.
     *
     * Checking the KIND alone would let a typo pass as provenance, so the
     * pointer is followed.
     */
    const saved = [word("Chunnsch", "kommst du")];
    /**
     * Both directions, because half the pairs come from `bridgeRules` — the
     * mirrored set that catches the German word a learner reaches for. Those
     * rules are derived rather than written, so they are absent from
     * `pack.rules` and a check against that alone would call the better half of
     * the drill unsourced.
     */
    const rules = new Set(
      [...VARIETY.rules, ...bridgeRules(VARIETY)]
        .map((r) => r.match)
        .filter((m): m is string => typeof m === "string")
        .map((m) => m.trim()),
    );
    const topics = new Set((VARIETY.grammar ?? []).map((t) => t.id));
    const words = new Set((VARIETY.vocabulary ?? []).map((w) => w.target));

    for (const item of allItems(VARIETY, saved)) {
      const from = item.source;
      switch (from.kind) {
        case "rule":
          assert.ok(rules.has(from.rule), `${item.id} cites a rule the pack does not have`);
          break;
        case "grammar":
          assert.ok(topics.has(from.topic), `${item.id} cites a grammar topic the pack does not have`);
          break;
        case "word":
          assert.ok(words.has(from.word), `${item.id} cites a word the pack does not have`);
          break;
        case "saved":
          break;
        default:
          assert.fail(`${item.id} has no provenance`);
      }
    }
  });
});

describe("article and form items", () => {
  test("an article item offers all three, always", () => {
    // Offering only the plausible two would leak the answer.
    for (const item of articleItems(VARIETY)) {
      assert.deepEqual([...item.options], ["de", "d", "s"]);
      assert.equal(
        item.options[item.answer],
        VARIETY.vocabulary?.find((w) => w.target === item.noun)?.article,
      );
    }
  });

  test("a noun with no declared article produces no item", () => {
    /**
     * The guarantee that matters more than any item this generates. The schema
     * keeps `article` optional so that "nobody has checked this" stays
     * expressible, and an exercise that quietly filled the gap would be the one
     * place in the product that invents language.
     */
    const asked = new Set(articleItems(VARIETY).map((i) => i.noun));
    for (const entry of VARIETY.vocabulary ?? []) {
      if (!entry.article) {
        assert.ok(!asked.has(entry.target), `${entry.target} was asked about without a declared article`);
      }
    }
  });

  test("a form item's distractors are the verb's OWN forms", () => {
    // Nothing invented to distract with — which is what lets this be marked
    // objectively in a variety nobody here can adjudicate.
    for (const item of formItems(VARIETY)) {
      const entry = VARIETY.vocabulary?.find((w) => w.target === item.word);
      const real = new Set((entry?.forms ?? []).map((f) => f.target));
      for (const option of item.options) {
        assert.ok(real.has(option), `${item.id} offers "${option}", which is not a form of ${item.word}`);
      }
      assert.equal(
        item.options[item.answer],
        entry?.forms?.find((f) => f.label === item.label)?.target,
      );
    }
  });

  test("a thin paradigm is not asked about at all", () => {
    for (const entry of VARIETY.vocabulary ?? []) {
      if ((entry.forms ?? []).length >= MIN_FORMS_TO_ASK) continue;
      assert.ok(
        !formItems(VARIETY).some((i) => i.word === entry.target),
        `${entry.target} has fewer than ${MIN_FORMS_TO_ASK} forms but is asked about`,
      );
    }
  });
});
