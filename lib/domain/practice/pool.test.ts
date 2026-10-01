import { test } from "node:test";
import assert from "node:assert/strict";
import { saysWord } from "../../text/words.ts";
import { SCENES } from "../../situations/display.ts";
import { MAX_SCOPE_WORDS, coveredWords, itemsInScope, wordsIn, wordsScope } from "./scope.ts";
import { orderSession } from "./session.ts";
import { SESSION_SIZE, type PracticeItem } from "./types.ts";
import { PRACTISABLE, sittingPool } from "./pool.ts";
import { TEST_MIN, itemsFor, testable } from "./mode.ts";

const handover = SCENES.find((s) => s.id === "handover")!;

test("a scene's sitting asks its sentences AND the words said in it", () => {
  const pool = sittingPool({ kind: "scene", id: "handover" });
  const sentences = pool.filter((i) => i.source.kind === "situation");
  const words = pool.filter((i) => i.source.kind === "word");

  assert.deepEqual(sentences, itemsInScope(pool, { kind: "scene", id: "handover" }));
  assert.ok(sentences.length > 0);
  assert.ok(words.length > 0, "the handover's words are asked too");
  for (const item of words) {
    const word = (item.source as { word: string }).word;
    assert.ok(handover.phrases.some((p) => saysWord(p.target, word)), `${word} is said in the handover`);
  }
});

test("other scopes are exactly their scope", () => {
  const topic = { kind: "topic", id: "am-progressive" } as const;
  assert.equal(sittingPool(topic).length, itemsInScope(sittingPool({ kind: "all" }), topic).length);
  assert.deepEqual(sittingPool({ kind: "scene", id: "no-such-scene" }), []);
});

test("a topic's sitting includes the questions the pack says it explains", () => {
  // Every article question came from a word and every time from a scene; both
  // are what their topic looks like in use, so a topic session drills them.
  const articles = sittingPool({ kind: "topic", id: "articles" });
  assert.ok(articles.some((i) => i.kind === "article"), "articles drills the article questions");
  const clock = sittingPool({ kind: "topic", id: "clock-time" });
  assert.ok(clock.some((i) => i.kind === "clock"), "clock-time drills the clock questions");
  assert.equal(testable(clock), true);
  const modals = sittingPool({ kind: "topic", id: "modals" });
  assert.ok(modals.some((i) => i.kind === "form" && i.word === "chönne"), "modals drills «ich cha, du chasch»");
  assert.equal(testable(modals), true);
  const words = sittingPool({ kind: "group", id: "everyday" });
  assert.ok(words.every((i) => i.source.kind === "word"), "a group is still only its words");
});

test("a words sitting asks exactly the words it names", () => {
  // The vocabulary page's «learn the next ten» and each row's «practise this
  // word» are this scope; a stray item from another word would break the promise.
  const pool = sittingPool(wordsScope(["nöd", "mir"]));
  assert.ok(pool.length > 0);
  const asked = new Set(pool.map((i) => (i.source.kind === "word" ? i.source.word : "—")));
  assert.deepEqual([...asked].sort(), ["mir", "nöd"]);
  assert.deepEqual(wordsIn(" nöd, mir,nöd ,,"), ["nöd", "mir"]);
  const many = Array.from({ length: MAX_SCOPE_WORDS + 5 }, (_, i) => `w${i}`);
  assert.equal(wordsIn(many.join(",")).length, MAX_SCOPE_WORDS, "a URL cannot ask for the whole pack");
});

test("«learn these ten» asks every one of the ten", () => {
  // Shipped broken: the vocabulary page's button named ten words and the
  // sitting held eight seats balanced by kind, so two never came up.
  const ten = ["mir", "no", "hüt", "nöd", "grad", "ächli", "öppis", "si", "au", "wo"];
  const scope = wordsScope(ten);
  const now = new Date("2026-10-01T08:00:00Z");
  const wordsOf = (items: PracticeItem[]) => new Set(items.map((i) => (i.source.kind === "word" ? i.source.word : "")));

  const before = orderSession({ items: sittingPool(scope), saved: [], now });
  assert.ok(wordsOf(before).size < ten.length, "without a cover the sitting is too small — the test proves nothing");

  const session = orderSession({ items: sittingPool(scope), saved: [], now, cover: coveredWords(scope) });
  assert.deepEqual([...wordsOf(session)].sort(), [...ten].sort());
  assert.equal(session.length, ten.length, "it grows to hold them, and no further");
  assert.ok(new Set(session.map((i) => i.kind)).size > 1, "ten named words are not ten of one kind");

  const three = orderSession({ items: sittingPool(wordsScope(["mir", "nöd", "au"])), saved: [], now, cover: ["mir", "nöd", "au"] });
  assert.equal(three.length, SESSION_SIZE, "a short list still fills a normal sitting");
  assert.equal(wordsOf(three).size, 3);
  assert.deepEqual(coveredWords({ kind: "topic", id: "articles" }), []);
});

test("every scene and every listed topic can be practised", () => {
  assert.equal(PRACTISABLE.scene.length, SCENES.length);
  for (const id of PRACTISABLE.topic) assert.ok(sittingPool({ kind: "topic", id }).length > 0, id);
});

test("a scope offers a test only when it can fill half a run", () => {
  // The regression: «Bsitz andersume» offered a "test" of two questions. That
  // topic has its ten now; the particles are still the thin one.
  const thin = sittingPool({ kind: "topic", id: "modal-particles" });
  assert.ok(itemsFor(thin, "mixed", "test").length < TEST_MIN);
  assert.equal(testable(thin), false);

  assert.equal(testable(sittingPool({ kind: "all" })), true);
  for (const id of PRACTISABLE.scene) assert.equal(testable(sittingPool({ kind: "scene", id })), true, id);
});
