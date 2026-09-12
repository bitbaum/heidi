import { test } from "node:test";
import assert from "node:assert/strict";
import { canRead, visibleMessages } from "threadkit";
import { heidiTurn, soloThread, toThreadMessages, THREAD_ID } from "./thread.ts";
import { HEIDI_ID, LEARNER_ID, type ChatMessage } from "./types.ts";

/**
 * These assert the properties we are BUYING from threadkit — the ones that
 * would be wrong if we had modelled the conversation ourselves, and the ones
 * that decide whether the group chat works when a tutor joins.
 */

const at = (mins: number) => new Date(Date.UTC(2026, 8, 12, 12, mins)).toISOString();

function msg(authorId: string, body: string, mins: number): ChatMessage {
  return { id: `m${mins}`, authorId, body, createdAt: at(mins) };
}

const stubComplete = (reply: string) => async () => reply;

test("a solo thread has the learner and Heidi, and Heidi is not faked as a user", () => {
  const t = soloThread(new Date(at(0)));
  assert.equal(t.participants.length, 2);
  const heidi = t.participants.find((p) => p.actorId === HEIDI_ID);
  // `kind: "ai"` exists so the model need not be given a login to hold a row.
  assert.equal(heidi?.kind, "ai");
  assert.equal(t.participants.find((p) => p.actorId === LEARNER_ID)?.kind, "human");
});

test("both participants can read the whole conversation", () => {
  const t = soloThread(new Date(at(0)));
  assert.equal(canRead(t, LEARNER_ID), true);
  assert.equal(canRead(t, HEIDI_ID), true);
});

test("a stranger reads nothing, and gets [] rather than an exception", () => {
  // visibleMessages failing closed is what makes a forgotten gate leak nothing.
  const t = soloThread(new Date(at(0)));
  const messages = toThreadMessages([msg(LEARNER_ID, "Hoi", 1)]);
  assert.equal(canRead(t, "someone-else"), false);
  assert.deepEqual(visibleMessages(t, "someone-else", messages), []);
});

test("Heidi sees the whole thread, so a follow-up about an earlier turn works", () => {
  // visibleFrom: "thread-start" is deliberate. With threadkit's safer default
  // — history begins when you join — "why did they say that?" would ask about
  // a message the assistant cannot see, which is the one failure that would
  // make the chat feel broken rather than merely limited.
  const t = soloThread(new Date(at(0)));
  const messages = toThreadMessages([
    msg(LEARNER_ID, "Chunnsch au no verbi?", 1),
    msg(HEIDI_ID, "Are you coming by too?", 2),
    msg(LEARNER_ID, "why 'verbi'?", 3),
  ]);
  assert.equal(visibleMessages(t, HEIDI_ID, messages).length, 3);
});

test("messages carry the thread id threadkit orders them within", () => {
  const [m] = toThreadMessages([msg(LEARNER_ID, "Hoi", 1)]);
  assert.equal(m.threadId, THREAD_ID);
  assert.ok(m.createdAt instanceof Date, "threadkit orders on Date, not a string");
});

test("with two participants Heidi answers every turn — it IS the conversation", async () => {
  const t = soloThread(new Date(at(0)));
  const result = await heidiTurn(t, [msg(LEARNER_ID, "Chunnsch au no verbi?", 1)], {
    systemPrompt: "test",
    model: "test/model",
    complete: stubComplete('{"mode":"understand","text":"Are you coming by too?"}'),
  });
  assert.equal(result.status, "responded");
  if (result.status === "responded") assert.match(result.raw, /coming by/);
});

test("Heidi never answers itself", async () => {
  // The loop guard runs before any policy, so a bot cannot talk itself into an
  // unbounded self-conversation — the failure mode of every naive chat loop.
  const t = soloThread(new Date(at(0)));
  const result = await heidiTurn(
    t,
    [msg(LEARNER_ID, "Hoi", 1), msg(HEIDI_ID, "Hello", 2)],
    { systemPrompt: "test", model: "test/model", complete: stubComplete("{}") },
  );
  assert.equal(result.status, "skipped");
});

test("in a group, Heidi stays out of a conversation between humans", async () => {
  // THE reason this is modelled with threadkit rather than an array. When a
  // tutor joins, an assistant that answers every turn is noise — and two
  // humans talking to each other is not an invitation.
  const created = new Date(at(0));
  const group = {
    ...soloThread(created),
    participants: [
      ...soloThread(created).participants,
      { actorId: "tutor", kind: "human" as const, role: "tutor", joinedAt: created, visibleFrom: "thread-start" as const },
    ],
  };
  let called = false;
  const result = await heidiTurn(group, [msg("tutor", "Wie gaht's?", 1)], {
    systemPrompt: "test",
    model: "test/model",
    complete: async () => {
      called = true;
      return "{}";
    },
  });
  assert.equal(result.status, "skipped");
  assert.equal(called, false, "silence must not spend a model call");
});

test("in a group, Heidi answers when addressed by name", async () => {
  const created = new Date(at(0));
  const group = {
    ...soloThread(created),
    participants: [
      ...soloThread(created).participants,
      { actorId: "tutor", kind: "human" as const, role: "tutor", joinedAt: created, visibleFrom: "thread-start" as const },
    ],
  };
  const result = await heidiTurn(group, [msg("tutor", "heidi, was heisst 'verbi'?", 1)], {
    systemPrompt: "test",
    model: "test/model",
    complete: stubComplete('{"mode":"answer","text":"It means: by, as in coming by."}'),
  });
  assert.equal(result.status, "responded");
});

test("a skipped turn reports a reason instead of throwing", () => {
  // Silence is a normal outcome here. Treating it as an error is what turns a
  // quiet assistant into a red banner in front of a learner.
  return heidiTurn(soloThread(new Date(at(0))), [msg(HEIDI_ID, "Hello", 1)], {
    systemPrompt: "test",
    model: "test/model",
    complete: stubComplete("{}"),
  }).then((r) => {
    assert.equal(r.status, "skipped");
    if (r.status === "skipped") assert.ok(r.reason.length > 0);
  });
});
