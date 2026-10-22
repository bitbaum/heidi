import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { POST } from "./route.ts";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/chat/feedback", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const thumb = { conversationId: "draft", messageId: "heidi-1", verdict: "up" };

/**
 * The guards before a row is written, in the order they run. No database is
 * configured here, which is the last case: a well-formed thumb on a deployment
 * that cannot keep one answers 503 rather than pretending to.
 */
describe("a thumb is checked before it is kept", () => {
  test("a request another site made is refused", async () => {
    assert.equal((await POST(request(thumb, { "sec-fetch-site": "cross-site" }))).status, 403);
  });

  test("a malformed thumb is refused", async () => {
    assert.equal((await POST(request({ ...thumb, verdict: "meh" }))).status, 400);
    assert.equal((await POST(request({ ...thumb, conversationId: "somebody-elses" }))).status, 400);
    assert.equal((await POST(request({ ...thumb, text: "x".repeat(1001) }))).status, 400);
    const broken = new Request("http://localhost/api/chat/feedback", { method: "POST", body: "{" });
    assert.equal((await POST(broken)).status, 400);
  });

  test("a well-formed thumb with nowhere to go is told so", async () => {
    assert.equal((await POST(request(thumb))).status, 503);
  });
});
