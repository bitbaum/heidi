import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { GET } from "./route.ts";

const request = (authorization?: string) =>
  new Request("http://localhost/api/chat/review-export?since=2026-10-21T00:00:00Z", {
    headers: authorization ? { authorization } : {},
  });

/**
 * The route guards the one door a day of conversations can leave by. One of
 * the cases is the deployment with no database: a caller with the right token
 * is told so, not handed an empty array that looks like a quiet night.
 */
describe("the review export", () => {
  const was = process.env.CHAT_REVIEW_TOKEN;
  afterEach(() => {
    if (was === undefined) delete process.env.CHAT_REVIEW_TOKEN;
    else process.env.CHAT_REVIEW_TOKEN = was;
  });

  test("answers 503 when the token is not set, whatever is presented", async () => {
    delete process.env.CHAT_REVIEW_TOKEN;
    assert.equal((await GET(request("Bearer anything"))).status, 503);
    assert.equal((await GET(request())).status, 503);
  });

  test("answers 401 to no token and to the wrong one", async () => {
    process.env.CHAT_REVIEW_TOKEN = "night-secret";
    assert.equal((await GET(request())).status, 401);
    assert.equal((await GET(request("Bearer night-secre"))).status, 401);
    assert.equal((await GET(request("Bearer night-secret-x"))).status, 401);
  });

  test("with the right token and no database, says so rather than answering empty", async () => {
    process.env.CHAT_REVIEW_TOKEN = "night-secret";
    // CI runs with a database; this case is the deployment without one.
    const hadDb = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const res = await GET(request("Bearer night-secret"));
      assert.equal(res.status, 503);
      const body = (await res.json()) as { error: string };
      assert.match(body.error, /database/i);
    } finally {
      if (hadDb !== undefined) process.env.DATABASE_URL = hadDb;
    }
  });
});
