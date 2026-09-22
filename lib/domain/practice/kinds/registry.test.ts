import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { KINDS, KIND_BY_ID, PACK_KINDS, generateAll } from "./registry.ts";
import { ZURICH_GERMAN } from "../../../variety/packs/gsw-zh.ts";
import { CARE } from "../../../situations/packs/gsw-zh-care.ts";
import { check } from "../../../variety/check.ts";
import { PASSAGE_GAPS, PICK_OPTIONS, PICK_PER_WORD } from "../types.ts";

const MATERIAL = { pack: ZURICH_GERMAN, situations: [CARE], saved: [] };

describe("the exercise registry", () => {
  test("every kind is registered exactly once", () => {
    const ids = KINDS.map((kind) => kind.id);
    assert.deepEqual([...new Set(ids)], ids, "a kind registered twice generates its items twice");
    assert.equal(KIND_BY_ID.size, KINDS.length);
  });

  test("every generated item declares the kind that generated it", () => {
    // The join that makes `KIND_BY_ID` worth anything: an item whose `kind`
    // does not match the module that produced it would be marked by the wrong
    // rules — and `marking` decides whether this product may tell somebody
    // they are wrong.
    for (const kind of KINDS) {
      for (const item of kind.generate(MATERIAL)) {
        assert.equal(item.kind, kind.id, `${kind.id} generated an item claiming to be ${item.kind}`);
        assert.equal(item.marking, kind.marking, `${item.id} disagrees with its kind about marking`);
      }
    }
  });

  test("no two items anywhere share an id", () => {
    // Ids key the history and the requeue. A collision would make answering
    // one item mark another as seen, which is invisible until a learner
    // notices a question they have never been asked is never asked.
    const ids = generateAll(MATERIAL).map((item) => item.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual([...new Set(dupes)], [], "duplicate item ids");
  });

  test("the pack half excludes exactly the kinds that are not the pack's", () => {
    // `recall` is the learner's own words, which live in their browser and
    // have never been sent anywhere. The server must not try to generate them.
    assert.deepEqual(
      KINDS.filter((k) => !PACK_KINDS.includes(k)).map((k) => k.id),
      ["recall"],
    );
    for (const item of generateAll(MATERIAL, PACK_KINDS)) {
      assert.notEqual(item.source.kind, "saved");
    }
  });

  test("every item is made of language the gate accepts", () => {
    /**
     * The whole-corpus version of the situation pack's own check, and it earns
     * its place because generation REARRANGES text: a blank is cut into a
     * sentence, four words are lifted out of a list, a passage is assembled
     * from four lines. Any of those could in principle produce a string the
     * gate would refuse, and the learner cannot tell.
     */
    for (const item of generateAll(MATERIAL)) {
      const dialect: string[] = [];
      if (item.kind === "match") dialect.push(...item.targets);
      if (item.kind === "gaptext") dialect.push(...item.bank, ...item.lines.map((l) => l.prompt));
      if (item.kind === "cloze") dialect.push(item.answer);
      if (item.kind === "article" || item.kind === "form") dialect.push(...item.options);

      for (const text of dialect) {
        // Blanks are not words; the gate should never see them.
        const result = check(text.replaceAll("____", " "), ZURICH_GERMAN, "foreign");
        assert.ok(result.ok, `${item.id}: "${text}" — ${result.findings.map((f) => f.form).join(", ")}`);
      }
    }
  });
});

describe("the missing-word pick", () => {
  const picks = KIND_BY_ID.get("pick")!.generate(MATERIAL);

  test("reaches the words that nothing else could ask about", () => {
    /**
     * THE MEASUREMENT THIS KIND WAS BUILT FROM, pinned so it cannot quietly
     * regress. The twenty-six function words produced six questions between
     * them before this existed — they carry no article and no paradigm, so
     * only the matching grid could see them, and a grid asks four at a time.
     */
    const words = new Set(
      picks.flatMap((item) => (item.source.kind === "word" ? [item.source.word] : [])),
    );
    assert.ok(words.size >= 10, `only ${words.size} function words are askable this way`);
  });

  test("the answer is one of the options, and it is the word that was cut", () => {
    for (const item of picks) {
      if (item.kind !== "pick") continue;
      assert.ok(item.prompt.includes("____"), `${item.id} has no gap in it`);
      assert.equal(item.options.length, PICK_OPTIONS);
      const answer = item.options[item.answer];
      assert.ok(answer, `${item.id} points at no option`);
      assert.equal(
        item.source.kind === "word" ? item.source.word : "",
        answer,
        `${item.id} says it came from a word it does not ask for`,
      );
    }
  });

  test("no option appears twice", () => {
    // A duplicated option is two correct answers, one of which is marked wrong.
    for (const item of picks) {
      if (item.kind !== "pick") continue;
      const lowered = item.options.map((o) => o.toLowerCase());
      assert.deepEqual([...new Set(lowered)], lowered, `${item.id} offers the same word twice`);
    }
  });

  test("the answer's meaning is visible in the German, and no distractor's is", () => {
    /**
     * THE RULE THAT MAKES THIS MARKABLE AT ALL, and the one worth a test
     * rather than a comment.
     *
     * Several options will make a grammatical sentence — that is what function
     * words are like. What makes exactly one correct is the German printed
     * underneath, so two things have to hold: the answer's gloss must be
     * present in it (or the learner has nothing to decide on), and no
     * distractor's gloss may be (or a defensible answer is marked wrong).
     *
     * `nüme` glosses "nicht mehr". Offered against a German line containing
     * "nicht mehr", it is correct and would be scored as a miss — which is the
     * single thing an objective item may never do.
     */
    const glossOf = new Map(
      (ZURICH_GERMAN.vocabulary ?? []).map((entry) => [entry.target.trim(), entry.bridge.trim().toLowerCase()]),
    );

    for (const item of picks) {
      if (item.kind !== "pick") continue;
      const bridge = item.bridge.toLowerCase();

      for (const [index, option] of item.options.entries()) {
        const gloss = glossOf.get(option);
        if (!gloss) continue;
        if (index === item.answer) {
          assert.ok(bridge.includes(gloss), `${item.id}: the answer «${option}» (${gloss}) is not in "${item.bridge}"`);
        } else {
          assert.ok(
            !bridge.includes(gloss),
            `${item.id}: the distractor «${option}» means "${gloss}", which IS in "${item.bridge}" — it is defensible and would be marked wrong`,
          );
        }
      }
    }
  });

  test("no word floods the pool", () => {
    // `nöd` occurs in dozens of pack lines; uncapped it would own the exercise.
    const perWord = new Map<string, number>();
    for (const item of picks) {
      if (item.source.kind !== "word") continue;
      perWord.set(item.source.word, (perWord.get(item.source.word) ?? 0) + 1);
    }
    for (const [word, count] of perWord) {
      assert.ok(count <= PICK_PER_WORD, `${word} claims ${count} questions`);
    }
  });
});

describe("the gapped passage", () => {
  const passages = KIND_BY_ID.get("gaptext")!.generate(MATERIAL);

  test("there are some", () => {
    assert.ok(passages.length > 0, "the care pack has scenes long enough to make one");
  });

  test("every gap has exactly one word, and every word exactly one gap", () => {
    for (const item of passages) {
      assert.equal(item.kind, "gaptext");
      if (item.kind !== "gaptext") continue;

      assert.equal(item.bank.length, PASSAGE_GAPS);
      assert.equal(item.answer.length, PASSAGE_GAPS);
      // A permutation: every bank index used once, so no word fits two holes
      // and no hole is unreachable.
      assert.deepEqual([...item.answer].sort((a, b) => a - b), [0, 1, 2]);

      const gaps = item.lines.filter((line) => line.gap !== undefined).map((line) => line.gap);
      assert.deepEqual(gaps, [...gaps].sort((a, b) => a! - b!), "gaps are numbered in reading order");
      assert.equal(gaps.length, PASSAGE_GAPS);
    }
  });

  test("no word sits at its own gap", () => {
    // The rotation's whole job. Unrotated, the exercise is solved by reading
    // the bank downwards without looking at the passage at all.
    for (const item of passages) {
      if (item.kind !== "gaptext") continue;
      for (const [gap, bankIndex] of item.answer.entries()) {
        assert.notEqual(bankIndex, gap, `${item.id}: gap ${gap} is answered by bank slot ${gap}`);
      }
    }
  });

  test("the bank holds no duplicate, so no hole is ambiguous", () => {
    // Two identical bank words would make one of two correct placements score
    // as wrong, which is the one thing an objective item may never do.
    for (const item of passages) {
      if (item.kind !== "gaptext") continue;
      const lowered = item.bank.map((w) => w.toLowerCase());
      assert.deepEqual([...new Set(lowered)], lowered, `${item.id} offers the same word twice`);
    }
  });

  test("every blanked line actually has a blank in it", () => {
    for (const item of passages) {
      if (item.kind !== "gaptext") continue;
      for (const line of item.lines) {
        if (line.gap === undefined) continue;
        assert.ok(line.prompt.includes("____"), `${item.id}: a gap line with nothing cut out of it`);
      }
    }
  });
});
