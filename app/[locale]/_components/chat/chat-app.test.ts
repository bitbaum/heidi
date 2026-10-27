import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Answer } from "../../../../lib/domain/chat/types.ts";
import { failureSentence, fromRows, fromWire, toAnswer, toThread } from "./chat-app.ts";

const answer: Answer = {
  mode: "understand",
  text: "It means: are you coming too?",
  dialect: "Chunnsch au?",
  glosses: [],
  suggestions: [],
  model: "test",
  replies: ["Yes, gladly"],
} as unknown as Answer;

describe("Heidi on chatkit's ChatApp", () => {
  test("the explanation is the message; the checked answer rides along", () => {
    const result = toAnswer(answer, "Chunnsch au?");
    assert.ok(typeof result === "object");
    assert.equal(result.content, answer.text, "Copy and Listen read the explanation, never the dialect");
    assert.deepEqual(result.replies, ["Yes, gladly"]);
    assert.equal((result as { asked?: string }).asked, "Chunnsch au?");
  });

  test("a server row becomes a thread message, with its answer decoded", () => {
    const rows = [
      { id: "1", authorId: "me", body: "Chunnsch au?", createdAt: "2026-10-27T10:00:00Z", imageCount: 0 },
      { id: "2", authorId: "heidi", body: answer.text, answer, createdAt: "2026-10-27T10:00:01Z" },
      { id: 3, authorId: "heidi" },
      null,
    ];
    const messages = fromRows(rows);
    assert.equal(messages.length, 2, "a malformed row is dropped, not rendered");
    assert.deepEqual(messages[0], { id: "1", role: "user", content: "Chunnsch au?" });
    assert.equal(messages[1].role, "assistant");
    assert.equal(messages[1].content, answer.text);
    assert.equal(messages[1].asked, "Chunnsch au?", "a kept word carries the sentence it came from");
  });

  test("a reply whose answer no longer decodes still shows its words", () => {
    const [m] = fromRows([{ id: "9", authorId: "heidi", body: "plain words", answer: { glosses: "broken" } }]);
    assert.equal(m.content, "plain words");
    assert.equal(m.answer, undefined);
  });

  test("history goes to the stateless route as the two-party thread", () => {
    const thread = toThread([
      { id: "a", role: "user", content: "Grüezi" },
      { id: "b", role: "assistant", content: answer.text, answer },
    ]);
    assert.deepEqual(
      thread.map((m) => m.authorId),
      ["me", "heidi"],
    );
    assert.equal(thread[1].answer?.dialect, "Chunnsch au?", "Heidi's dialect line travels with her turn");
  });

  test("pictures leave as data URLs; a text file's words join the message", () => {
    const [text, pictures] = fromWire("Was steht da?", [
      { kind: "image", name: "a.png", mimeType: "image/png", dataBase64: "AAAA" },
      { kind: "text", name: "b.txt", content: "Hoi zäme" },
    ] as never);
    assert.equal(text, "Was steht da?\n\nHoi zäme");
    assert.deepEqual(pictures, ["data:image/png;base64,AAAA"]);
  });

  test("every failure has its own sentence", () => {
    const t = { notConfigured: "nc", unreachable: "un", cannotSeePicture: "blind", failed: "f" };
    assert.equal(failureSentence("blind", t), "blind");
    assert.equal(failureSentence("unconfigured", t), "nc");
    assert.equal(failureSentence("unreachable", t), "un");
    assert.equal(failureSentence("failed", t), "f");
  });
});
