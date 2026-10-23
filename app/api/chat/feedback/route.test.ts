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
 * The guards before a row is written, in the order they run. The last case is
 * the deployment with no database: a well-formed thumb it cannot keep answers
 * 503 rather than pretending to.
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
    // CI runs with a database; this case is the deployment without one.
    const was = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      assert.equal((await POST(request(thumb))).status, 503);
    } finally {
      if (was !== undefined) process.env.DATABASE_URL = was;
    }
  });
});
