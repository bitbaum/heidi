import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { decodeQuestionSet, parseQuestions, questionsPrompt } from "./questions.ts";
import { acceptedLanguages, allowAutomatic, questionLanguage } from "./accepted.ts";
import { VARIETY } from "../variety/active.ts";
import { ZURICH_GERMAN } from "../variety/packs/gsw-zh.ts";
import { UKRAINIAN } from "../variety/packs/uk.ts";

const PACKS = [ZURICH_GERMAN, UKRAINIAN];

const LINES = [
  { start: 0, end: 2, text: "Guten Morgen." },
  { start: 2, end: 5, text: "Heute testen wir Orangensaft aus dem Kühlregal." },
  { start: 5, end: 9, text: "Er kostet doppelt so viel wie der ungekühlte." },
  { start: 9, end: 12, text: "Lohnt sich das?" },
];

const q = (prompt: string, answer = 0, evidence: number[] = [1]) => ({
  prompt,
  options: ["Saft", "Milch", "Wasser"],
  answer,
  evidence,
});

const CONTEXT = { lineCount: LINES.length, linesUsed: LINES.length, truncated: false, model: "test" };

describe("the request", () => {
  test("numbers the lines and names the bridge, never a language of its own", () => {
    const { system, user } = questionsPrompt({ title: "Saft", lines: LINES, askIn: "Bridgish" });
    assert.ok(system.includes("Write every prompt and every option in Bridgish."));
    assert.ok(user.includes("1: Heute testen wir Orangensaft aus dem Kühlregal."));
    assert.ok(user.startsWith("Title: Saft"));
    for (const word of ["German", "Deutsch", "Swiss", "Zurich", "English"]) {
      assert.ok(!system.includes(word), `the prompt names ${word}`);
    }
  });

  test("the pack says which languages a caption track may be in and which the questions are asked in", () => {
    const accepted = acceptedLanguages(VARIETY);
    assert.equal(accepted[0], VARIETY.tag, "the target variety itself first");
    assert.ok(accepted.length >= 2, "and at least one bridge");
    assert.ok(!accepted.some((t) => VARIETY.bridges.find((b) => b.tag === t)?.relation === "gloss"), "a gloss language is not a transcript");
    assert.equal(questionLanguage(VARIETY), VARIETY.bridges.find((b) => b.relation === "sibling")?.name);
    for (const pack of PACKS) {
      assert.ok(questionLanguage(pack).length > 0);
      assert.equal(typeof allowAutomatic(pack), "boolean");
    }
  });
});

describe("what the model sent back", () => {
  test("a well-formed set is kept, fenced or not", () => {
    const raw = "```json\n" + JSON.stringify({ gist: q("Worum geht es?", 0, []), detail: [q("A"), q("B", 1, [2]), q("C", 2, [3])] }) + "\n```";
    const set = parseQuestions(raw, CONTEXT);
    assert.ok(set);
    assert.equal(set.detail.length, 3);
    assert.deepEqual(set.gist.evidence, []);
    assert.deepEqual(set.detail[1].evidence, [2]);
    assert.equal(set.model, "test");
  });

  test("a detail question that cites no real line is dropped, and too few left is no set", () => {
    const raw = JSON.stringify({ gist: q("G"), detail: [q("A", 0, [99]), q("B"), q("C")] });
    assert.equal(parseQuestions(raw, CONTEXT), null);
    const ok = JSON.stringify({ gist: q("G"), detail: [q("A", 0, [99, 1]), q("B"), q("C")] });
    assert.equal(parseQuestions(ok, CONTEXT)?.detail[0].evidence.length, 1, "the bad citation goes, the good one stays");
  });

  test("an answer outside the options, duplicate options or two options are refused", () => {
    const bad = (detail: unknown) => parseQuestions(JSON.stringify({ gist: q("G"), detail }), CONTEXT);
    assert.equal(bad([q("A", 3), q("B"), q("C")]), null);
    assert.equal(bad([{ ...q("A"), options: ["x", "X", "y"] }, q("B"), q("C")]), null);
    assert.equal(bad([{ ...q("A"), options: ["x", "y"] }, q("B"), q("C")]), null);
    assert.equal(parseQuestions("no json here", CONTEXT), null);
    assert.equal(parseQuestions(JSON.stringify({ detail: [q("A"), q("B"), q("C")] }), CONTEXT), null, "no gist, no set");
  });

  test("more than five detail questions are cut, an answer given as a string is read", () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ ...q(`Q${i}`), answer: "1" }));
    const set = parseQuestions(JSON.stringify({ gist: q("G"), detail: many }), CONTEXT);
    assert.equal(set?.detail.length, 5);
    assert.equal(set?.detail[0].answer, 1);
  });

  test("the stored shape round-trips and rejects a stranger", () => {
    const set = parseQuestions(JSON.stringify({ gist: q("G"), detail: [q("A"), q("B"), q("C")] }), CONTEXT);
    assert.deepEqual(decodeQuestionSet(set, LINES.length), set);
    assert.equal(decodeQuestionSet({ gist: q("G") }, LINES.length), null);
    assert.equal(decodeQuestionSet(null, LINES.length), null);
  });
});
