import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cardItems } from "./card.ts";
import { orderSession } from "../session.ts";
import { EMPTY_MODEL, observe } from "../model.ts";
import { seeded } from "../random.ts";
import { ZURICH_GERMAN } from "../../../variety/packs/gsw-zh.ts";
import { CARE } from "../../../situations/packs/gsw-zh-care.ts";
import { saysWord } from "../../../text/words.ts";
import type { CardItem } from "../types.ts";

const NOW = new Date("2026-11-12T06:00:00Z");
const CARDS = cardItems(ZURICH_GERMAN, [CARE]);
const lines = CARE.situations.flatMap((scene) => scene.phrases.map((phrase) => phrase.target));
const heard = (word: string) => lines.filter((line) => saysWord(line, word)).length;

const sitting = (model = EMPTY_MODEL, seed = 7) =>
  orderSession({ items: CARDS, saved: [], now: NOW, size: 20, model, random: seeded(seed) }) as CardItem[];

describe("cards", () => {
  test("a word's two cards stand at the same place, and the most-heard word stands first", () => {
    const first = CARDS.find((card) => card.order === 0)!;
    for (const card of CARDS) {
      assert.ok(heard(first.source.kind === "word" ? first.source.word : "") >= heard(card.source.kind === "word" ? card.source.word : ""));
    }
    const see = CARDS.filter((card) => card.direction === "recognise");
    for (const card of see) {
      const say = CARDS.find((other) => other.direction === "produce" && other.answer === card.prompt)!;
      assert.equal(say.order, card.order);
    }
    assert.equal(new Set(see.map((card) => card.order)).size, see.length, "two words share a place");
  });

  test("a new learner's first cards are dialect → meaning, most-heard words first, whatever the seed", () => {
    // It was luck: any word, either way round — so a first sitting asked
    // somebody to produce the Zurich word for «Dachboden» before they had
    // ever seen it.
    for (const seed of [1, 7, 99]) {
      const cards = sitting(EMPTY_MODEL, seed);
      assert.equal(cards.length, 20);
      assert.ok(cards.every((card) => card.direction === "recognise"), "a word nobody has met is asked for");
      const orders = cards.map((card) => card.order);
      assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
      assert.equal(orders[0], 0);
    }
  });

  test("once a word has been asked, its meaning → dialect card may come", () => {
    const first = sitting()[0]!;
    const model = observe(EMPTY_MODEL, first, "right");
    const next = orderSession({
      items: CARDS.filter((card) => card.id !== first.id),
      saved: [],
      now: NOW,
      size: 20,
      model,
      random: seeded(7),
    }) as CardItem[];
    assert.equal(next[0]!.direction, "produce");
    assert.equal(next[0]!.answer, first.prompt);
    assert.ok(next.slice(1).every((card) => card.direction === "recognise"));
  });
});
