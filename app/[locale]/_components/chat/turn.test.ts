import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createTurnGate, mergeStored, wasUnanswered } from "./turn.ts";
import type { ChatMessage } from "../../../../lib/domain/chat/types.ts";

const ME = "me";
const row = (id: string, authorId: string, body: string): ChatMessage => ({
  id,
  authorId,
  body,
  createdAt: "2026-10-27T10:00:00.000Z",
});
const local = row("local-1", ME, "hoi");

describe("mergeStored", () => {
  test("a reply: the reader's message is replaced by the stored row, not repeated", () => {
    const out = mergeStored([local], {
      localId: "local-1",
      stored: [row("db-1", ME, "hoi"), row("db-2", "heidi", "Grüezi")],
      me: ME,
      retry: false,
    });
    assert.deepEqual(out.map((m) => m.id), ["db-1", "db-2"]);
  });

  test("no reply: the message is shown once", () => {
    const out = mergeStored([local], { localId: "local-1", stored: [row("db-1", ME, "hoi")], me: ME, retry: false });
    assert.deepEqual(out.map((m) => m.id), ["db-1"]);
  });

  test("a transport that returns only Heidi's reply leaves the optimistic message", () => {
    const out = mergeStored([local], { localId: "local-1", stored: [row("h", "heidi", "Grüezi")], me: ME, retry: false });
    assert.deepEqual(out.map((m) => m.id), ["local-1", "h"]);
  });

  test("retry: the stored copy of the question is dropped, as before", () => {
    const out = mergeStored([local], {
      localId: "local-2",
      stored: [row("db-1", ME, "hoi"), row("db-2", "heidi", "Grüezi")],
      me: ME,
      retry: true,
    });
    assert.deepEqual(out.map((m) => m.id), ["local-1", "db-2"]);
  });
});

describe("a turn with no answer", () => {
  test("only an explicit answered:false counts; absent is not a failure", () => {
    assert.equal(wasUnanswered({ answered: false }), true);
    assert.equal(wasUnanswered({}), false);
    assert.equal(wasUnanswered(null), false);
  });
});

describe("createTurnGate", () => {
  test("a second call in the same tick is ignored until the first leaves", () => {
    const gate = createTurnGate();
    assert.equal(gate.enter(), true);
    assert.equal(gate.enter(), false);
    gate.leave();
    assert.equal(gate.enter(), true);
  });
});
