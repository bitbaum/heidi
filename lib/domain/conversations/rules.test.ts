import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_BODY,
  MAX_CONVERSATIONS,
  MAX_MESSAGES,
  checkBody,
  mayAppend,
  mayCreate,
  mayRead,
  mayWrite,
} from "./rules.ts";

/**
 * Decisions, tested with no database — the same split as `groups/rules.test.ts`.
 * Every case here is one a route can get wrong while every query still works.
 */
describe("conversation rules", () => {
  test("only the owner reads or writes", () => {
    const mine = { actorId: "alice" };
    assert.equal(mayRead(mine, "alice"), true);
    assert.equal(mayWrite(mine, "alice"), true);
    assert.equal(mayRead(mine, "mallory"), false);
    assert.equal(mayWrite(mine, "mallory"), false);
  });

  test("nothing at all is readable when there is nothing there", () => {
    // A missing row reaching a permission check must answer no, not throw — a
    // 500 on a bad id tells a stranger the id was worth trying again.
    assert.equal(mayRead(null, "alice"), false);
    assert.equal(mayWrite(null, "alice"), false);
  });

  test("a deleted conversation belongs to nobody, including its owner", () => {
    const gone = { actorId: "alice", deletedAt: new Date().toISOString() };
    assert.equal(mayRead(gone, "alice"), false);
    assert.equal(mayWrite(gone, "alice"), false);
  });

  test("an empty message is not a message", () => {
    for (const nothing of ["", "   ", "\n\t ", null, undefined, 42, {}, []]) {
      assert.equal(checkBody(nothing).ok, false, `${JSON.stringify(nothing)} should be refused`);
    }
  });

  test("a body is trimmed, and a long one is refused rather than truncated", () => {
    assert.deepEqual(checkBody("  hoi zäme  "), { ok: true, body: "hoi zäme" });

    // Silently cutting someone's message at 2000 characters loses the half
    // they cared about without telling them it went.
    const tooLong = checkBody("a".repeat(MAX_BODY + 1));
    assert.equal(tooLong.ok, false);
    assert.equal(tooLong.ok === false && tooLong.problem, "too-long");
    assert.equal(checkBody("a".repeat(MAX_BODY)).ok, true, "exactly the limit is allowed");
  });

  test("the caps REFUSE; they never prune", () => {
    // Deleting someone's oldest conversation to make room for a new one is
    // data loss dressed as a feature. The answer is no, with a reason.
    assert.equal(mayCreate(MAX_CONVERSATIONS - 1).ok, true);
    const full = mayCreate(MAX_CONVERSATIONS);
    assert.equal(full.ok, false);
    assert.equal(full.ok === false && full.problem, "too-many-conversations");

    assert.equal(mayAppend(MAX_MESSAGES - 1).ok, true);
    const long = mayAppend(MAX_MESSAGES);
    assert.equal(long.ok, false);
    assert.equal(long.ok === false && long.problem, "conversation-full");
  });
});
