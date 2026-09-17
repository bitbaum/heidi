import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { VARIETY } from "../../variety/active.ts";
import { check, checkAgainst } from "../../variety/check.ts";
import { bridgeRules } from "../../variety/bridge.ts";
import { allItems, clozeItems, pairItems, recallItems } from "./generate.ts";
import { buildSession, summarise } from "./session.ts";
import { SESSION_SIZE } from "./types.ts";
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
      // And the answer must really be gone from what is shown.
      assert.ok(!item.prompt.includes(item.answer), `${item.id} still shows its answer`);
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
    const saved = [word("Chunnsch", "kommst du")];
    for (const item of allItems(VARIETY, saved)) {
      assert.ok(["rule", "grammar", "saved"].includes(item.source.kind), `${item.id} has no provenance`);
    }
  });
});
