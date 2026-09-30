import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PACK_ITEMS } from "../practice/published.ts";
import { LADDER, OPENER, tierOf } from "./ladder.ts";
import {
  LENGTH,
  decodeWarmup,
  finished,
  nextQuestion,
  nextTier,
  portrait,
  sceneLookup,
  type WarmupAnswer,
} from "./run.ts";

const sceneOf = sceneLookup(PACK_ITEMS);
const CARE = ["handover", "morning-care", "pain", "meals", "evening-unrest", "visitors"];

/** Answer the warm-up with a fixed rule, the way a learner of that kind would. */
function play(isRight: (id: string, tier: number) => boolean, random = () => 0): WarmupAnswer[] {
  const answers: WarmupAnswer[] = [];
  for (let guard = 0; guard < 20; guard++) {
    const id = nextQuestion(answers, sceneOf, random);
    if (!id) break;
    answers.push({ id, right: isRight(id, tierOf(id)) });
  }
  return answers;
}

describe("the warm-up ladder", () => {
  test("every rung is a real «What is meant?» question from an everyday scene", () => {
    for (const id of [OPENER, ...LADDER.flat()]) {
      const item = PACK_ITEMS.find((i) => i.id === id);
      assert.ok(item, `${id} is not a question the pack generates`);
      assert.equal(item.kind, "gist", `${id} is not a gist question`);
      const scene = sceneOf(id);
      assert.ok(scene, `${id} has no scene`);
      assert.ok(!CARE.includes(scene), `${id} is a care line; the warm-up is for anybody who arrives`);
    }
  });

  test("no question sits on two rungs", () => {
    const all = [OPENER, ...LADDER.flat()];
    assert.equal(new Set(all).size, all.length);
  });
});

describe("the adaptive run", () => {
  test("it opens with «Verstahsch scho ächli Züridütsch?» and climbs while you keep up", () => {
    const answers = play(() => true);
    assert.equal(answers[0].id, OPENER);
    assert.equal(tierOf(answers[1].id), 1);
    assert.equal(tierOf(answers[2].id), 2);
    assert.equal(answers.length, LENGTH);
  });

  test("it steps down after a miss", () => {
    assert.equal(nextTier([{ id: LADDER[2][0], right: false }]), 1);
    assert.equal(nextTier([{ id: LADDER[0][0], right: false }]), 0);
    assert.equal(nextTier([{ id: LADDER[1][0], right: true }]), 2);
  });

  test("it never ends on a miss when one more line could help, and never runs on", () => {
    const answers = play(() => false);
    assert.equal(answers.length, LENGTH + 1);
    const eight = play((_, tier) => tier === 0);
    assert.ok(eight.length === LENGTH || eight.length === LENGTH + 1);
    assert.ok(finished(eight));
  });

  test("never the same line twice, and not the same scene twice in a row when avoidable", () => {
    for (const seed of [0, 0.3, 0.7, 0.99]) {
      const answers = play((_, tier) => tier < 2, () => seed);
      const ids = answers.map((a) => a.id);
      assert.equal(new Set(ids).size, ids.length);
      for (let i = 1; i < answers.length; i++) {
        assert.notEqual(sceneOf(ids[i]), sceneOf(ids[i - 1]), `${ids[i - 1]} then ${ids[i]}`);
      }
    }
  });
});

describe("the portrait", () => {
  test("a strong reader is offered the site in Swiss German", () => {
    const p = portrait(play(() => true), sceneOf);
    assert.equal(p.readsDialect, true);
    assert.equal(p.betweenTheLines, true);
    assert.equal(p.startAt, undefined);
    assert.ok(p.followed.length >= 4);
  });

  test("one miss among strong answers still earns the offer; two do not", () => {
    const top = LADDER[2];
    const base: WarmupAnswer[] = [
      { id: OPENER, right: true },
      { id: top[0], right: true },
      { id: top[1], right: true },
    ];
    assert.equal(portrait([...base, { id: LADDER[1][0], right: false }], sceneOf).readsDialect, true);
    assert.equal(
      portrait([...base, { id: LADDER[1][0], right: false }, { id: LADDER[1][1], right: false }], sceneOf).readsDialect,
      false,
    );
  });

  test("somebody who follows the everyday lines starts where they first missed", () => {
    const answers = play((_, tier) => tier === 0);
    const p = portrait(answers, sceneOf);
    assert.equal(p.readsDialect, false);
    const firstGentleMiss = answers.filter((a) => !a.right).sort((a, b) => tierOf(a.id) - tierOf(b.id))[0];
    assert.equal(p.startAt, sceneOf(firstGentleMiss.id));
    assert.ok(!p.followed.includes(p.startAt!), "a scene cannot be both followed and the place to start");
  });

  test("nothing followed is a portrait too, not an error", () => {
    const p = portrait(play(() => false), sceneOf);
    assert.deepEqual(p.followed, []);
    assert.ok(p.startAt);
    assert.equal(p.readsDialect, false);
  });
});

describe("the record in the browser", () => {
  test("round trips, and refuses what it should not keep", () => {
    const record = { at: "2026-09-30T12:00:00.000Z", answers: [{ id: OPENER, right: true }], dialect: "declined" };
    assert.deepEqual(decodeWarmup(JSON.stringify(record)), record);
    assert.equal(decodeWarmup("not json"), null);
    assert.equal(decodeWarmup(JSON.stringify({ at: "yesterday", answers: [] })), null);
    assert.equal(decodeWarmup(JSON.stringify({ at: record.at, answers: [{ id: 1, right: true }] })), null);
    assert.equal(decodeWarmup(JSON.stringify({ at: record.at, answers: Array(LENGTH + 2).fill(record.answers[0]) })), null);
    assert.equal(decodeWarmup(JSON.stringify({ ...record, dialect: "maybe" }))?.dialect, undefined);
  });
});
