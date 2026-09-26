import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { VARIETY } from "../../../variety/active.ts";
import { SITUATIONS } from "../../../situations/active.ts";
import { check } from "../../../variety/check.ts";
import { getDictionary } from "../../../i18n/index.ts";
import { LOCALES } from "../../../i18n/locales.ts";
import { KIND_BY_ID } from "../kinds/registry.ts";
import { glossesOverlap, meaningItems } from "../kinds/question.ts";
import { PACK_ITEMS } from "../published.ts";
import { LESSON_IDS, QUESTION_OPTIONS, type QuestionItem } from "../types.ts";
import { REPLY } from "./authored/reply.ts";
import { GIST } from "./authored/gist.ts";
import { TRANSFORM } from "./authored/transform.ts";
import { CLOCK } from "./authored/clock.ts";
import { templateProblems } from "./validate.ts";
import { slotFor, type Library } from "./template.ts";

const LIBRARY: Library = { pack: VARIETY, situations: SITUATIONS };
const SETS = { reply: REPLY, gist: GIST, transform: TRANSFORM, clock: CLOCK };

const QUESTIONS = PACK_ITEMS.filter((item): item is QuestionItem => "lesson" in item);

describe("the exercise templates", () => {
  test("every authored record resolves, passes the gate, and cannot be marked wrongly", () => {
    // The whole contract of `templates/`, in one assertion. See `validate.ts`
    // for what each refusal protects.
    assert.deepEqual(templateProblems(LIBRARY, SETS), []);
  });

  test("the validator actually refuses what it says it refuses", () => {
    /**
     * A gate that cannot fail is worse than none: it reads as a guarantee.
     * So each rule is shown one broken record and must object to it.
     */
    const broken = templateProblems(LIBRARY, {
      reply: [
        {
          id: "x",
          heard: { scene: "shopping", line: 7 }, // a `say` line
          right: { scene: "no-such-scene", line: 0 },
          wrong: [{ scene: "tram", line: 7 }, { scene: "tram", line: 7 }, { scene: "tram", line: 8 }],
          lesson: "offer",
        },
      ],
      gist: [
        {
          id: "y",
          heard: { scene: "shopping", line: 2 },
          right: "A",
          wrong: ["A", "B", "C"],
          lesson: "offer",
          listen: { word: "Velo", means: "Fahrrad" },
        },
      ],
      transform: [
        {
          id: "z",
          about: { topic: "no-such-topic" },
          right: { target: "Ich gang hei.", bridge: "Ich gehe nach Hause.", cite: "idiotikon" },
          wrong: [
            { target: "Ich gange hei.", bridge: "Ich gehe nach Hause.", cite: "idiotikon" },
            { target: "Ig gang hei.", bridge: "Ich gehe heim.", cite: "idiotikon" },
            { target: "Mir gönd hei.", bridge: "Wir gehen nach Hause.", cite: "idiotikon" },
          ],
          lesson: "past",
        },
        {
          id: "z",
          about: { word: "nüme" },
          right: { scene: "at-work", line: 19 },
          wrong: [{ scene: "tram", line: 7 }, { scene: "tram", line: 8 }, { scene: "tram", line: 9 }],
          lesson: "small-word",
        },
      ],
      clock: [
        {
          id: "c",
          said: { scene: "shopping", line: 11 },
          scene: "shopping",
          right: "3.20",
          wrong: ["drei", "3.02", "20.03"],
          lesson: "price",
        },
      ],
    }).join("\n");

    assert.match(broken, /"say" line/);
    assert.match(broken, /does not exist/);
    assert.match(broken, /two options are the same/);
    assert.match(broken, /listens for «Velo»/);
    assert.match(broken, /no grammar topic/);
    assert.match(broken, /the same as the answer/);
    assert.match(broken, /fails the gate/);
    assert.match(broken, /not a time or a price/);
    assert.match(broken, /used 2 times/);
  });

  test("every record reaches the pool — none is dropped silently", () => {
    const counts = new Map<string, number>();
    for (const item of QUESTIONS) counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1);
    assert.equal(counts.get("reply"), REPLY.length);
    assert.equal(counts.get("gist"), GIST.length);
    assert.equal(counts.get("transform"), TRANSFORM.length);
    assert.equal(counts.get("clock"), CLOCK.length);
  });

  test("every question has four options, one answer, and the kind's own marking", () => {
    for (const item of QUESTIONS) {
      assert.equal(item.options.length, QUESTION_OPTIONS, item.id);
      assert.ok(item.answer >= 0 && item.answer < QUESTION_OPTIONS, item.id);
      const lowered = item.options.map((o) => o.toLowerCase());
      assert.deepEqual([...new Set(lowered)], lowered, `${item.id} offers the same thing twice`);
      assert.equal(KIND_BY_ID.get(item.kind)?.marking, "objective");
      assert.equal(KIND_BY_ID.get(item.kind)?.decisions, "one", `${item.id} could not appear in a test run`);
    }
  });

  test("the right answer does not always sit in the same place", () => {
    // Placement is by a hash of the id. A bug there — every answer in slot 0
    // — would make the whole kind answerable without reading it.
    for (const kind of ["reply", "gist", "transform", "clock", "meaning"]) {
      const slots = new Set(QUESTIONS.filter((i) => i.kind === kind).map((i) => i.answer));
      assert.ok(slots.size >= 3, `${kind} puts its answers in only ${[...slots].join(",")}`);
    }
    assert.equal(slotFor("reply:card-or-cash"), slotFor("reply:card-or-cash"), "placement must be stable");
  });

  test("every Zurich option and every heard line passes the gate", () => {
    for (const item of QUESTIONS) {
      const dialect = [...(item.said ? [item.said] : []), ...(item.optionsIn === "target" ? item.options : [])];
      for (const text of dialect) {
        const verdict = check(text, VARIETY, "dispreferred");
        assert.ok(verdict.ok, `${item.id}: «${text}» — ${verdict.findings.map((f) => f.form).join(", ")}`);
      }
    }
  });
});

describe("the lessons", () => {
  test("every lesson is used by some question, and every question's lesson exists", () => {
    const used = new Set(QUESTIONS.map((item) => item.lesson));
    for (const id of LESSON_IDS) assert.ok(used.has(id), `lesson "${id}" is translated seven times and asked by nothing`);
  });

  test("every dictionary has every lesson and nothing else, and fills its placeholders", () => {
    for (const locale of LOCALES) {
      const lessons = getDictionary(locale).practice.lessons as Record<string, string>;
      assert.deepEqual(Object.keys(lessons).sort(), [...LESSON_IDS].sort(), `${locale} lessons`);
      // A false friend's sentence names the trap; if a translation dropped
      // `{trap}`, the one thing the item exists to show would vanish.
      assert.match(lessons["false-friend"]!, /\{word\}/, locale);
      assert.match(lessons["false-friend"]!, /\{trap\}/, locale);
      assert.match(lessons["false-friend"]!, /\{means\}/, locale);
      for (const kind of ["reply", "gist", "transform", "clock", "meaning"] as const) {
        assert.ok(getDictionary(locale).practice.ask[kind], `${locale} has no question line for ${kind}`);
      }
    }
  });
});

describe("the meaning question", () => {
  const items = meaningItems(VARIETY);

  test("offers the trap for every false friend the pack names", () => {
    const traps = (VARIETY.vocabulary ?? []).filter((v) => v.mistakenFor && !/\s/.test(v.target));
    assert.ok(traps.length > 0);
    for (const entry of traps) {
      const item = items.find((i) => i.focus === entry.target.trim());
      assert.ok(item, `no question for the false friend ${entry.target}`);
      assert.ok(item.options.includes(entry.mistakenFor!.trim()), `${entry.target} does not offer its trap`);
      assert.equal(item.lesson, "false-friend");
    }
  });

  test("the answer is the pack's gloss, and no wrong option could share it", () => {
    const gloss = new Map((VARIETY.vocabulary ?? []).map((v) => [v.target.trim(), v.bridge.trim()]));
    for (const item of items) {
      const right = item.options[item.answer]!;
      assert.equal(right, gloss.get(item.focus!), item.id);
      for (const [i, option] of item.options.entries()) {
        if (i === item.answer) continue;
        assert.ok(!glossesOverlap(option, right), `${item.id}: «${option}» could mean «${right}»`);
      }
    }
  });

  test("a word shown in its sentence is shown WITHOUT the German", () => {
    // The German of the example contains the answer; the item carries none.
    for (const item of items) assert.equal(item.german, undefined, item.id);
  });
});
