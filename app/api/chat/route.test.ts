import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { POST } from "./route.ts";

/**
 * Streaming must not be a way around anything.
 *
 * The risk a second response shape creates is not that it breaks — it is that
 * it becomes a second ROUTE in everything but name, with its own quietly
 * divergent validation. That has already happened once in this file's history:
 * `/api/chat` grew a private copy of the turn wiring that `respond.ts` existed
 * to own, and the copies drifted.
 *
 * So the guards are asserted through BOTH shapes. Every one of these runs
 * before the branch that decides between JSON and an event stream, and this is
 * what keeps them there.
 *
 * No model is called in any of these: the checks reject first, and this
 * deployment has no key configured anyway — which is itself one of the cases.
 *
 * One guard was REMOVED here rather than weakened, and the distinction
 * matters: refusing a picture because no key was brought was not a guard, it
 * was a wrong belief about free models. What replaced it is a stricter pair —
 * a malformed picture is still refused, and a valid one is allowed through to
 * a chain that decides for itself whether it can be read.
 */

function request(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const BOTH = [
  { name: "blocking", extra: {} },
  { name: "streaming", extra: { stream: true } },
] as const;

describe("the guards hold in both response shapes", () => {
  for (const { name, extra } of BOTH) {
    test(`${name}: empty input is refused`, async () => {
      const res = await POST(request({ input: "   ", locale: "de", ...extra }));
      assert.equal(res.status, 400);
    });

    test(`${name}: an over-long input is refused`, async () => {
      // A streaming request that skipped this would let anyone post a novel
      // and have it forwarded to a vendor a token at a time.
      const res = await POST(request({ input: "a".repeat(2001), locale: "de", ...extra }));
      assert.equal(res.status, 400);
    });

    test(`${name}: a MALFORMED picture is still refused`, async () => {
      // The validation guard, which must survive the change below. A data URL
      // of a type no vendor accepts is rejected here rather than forwarded and
      // paid for.
      const res = await POST(
        request({
          input: "Was heisst das?",
          locale: "de",
          images: ["data:text/html;base64,PGh0bWw+"],
          ...extra,
        }),
      );
      assert.equal(res.status, 400);
    });

    test(`${name}: a VALID picture is no longer refused for lacking a key`, async () => {
      /**
       * This test used to assert the opposite, and the sentence above it read
       * "only a brought key can see". That was never true of free models —
       * `google/gemma-4-26b-a4b-it:free` was already in the chain this app
       * installs — only of a chain with no vision routing, which ai-kit 1.11
       * fixed for the whole fleet.
       *
       * So a picture is VALIDATED here and no longer REFUSED here. Whether one
       * can be read is the chain's question and it answers for itself: a
       * deployment with a sighted vendor keyed reads it, and one without says
       * `blind` in its own words rather than this route guessing from the
       * presence of a key.
       *
       * Asserted as "not 400", not as a specific success: this deployment has
       * no key at all, so the turn lands on the unconfigured path pinned
       * below. The point is only that the PICTURE is not what stopped it.
       */
      const res = await POST(
        request({
          input: "Was heisst das?",
          locale: "de",
          images: ["data:image/png;base64,iVBORw0KGgo="],
          ...extra,
        }),
      );
      assert.notEqual(res.status, 400);
    });
  }

  test("unparseable JSON is refused before either shape is chosen", async () => {
    const res = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not json",
      }),
    );
    assert.equal(res.status, 400);
  });
});

describe("the two shapes differ only in shape", () => {
  /**
   * With no model configured — which is this deployment — the blocking path
   * answers 503 and the streaming path answers 200 and says so in an event.
   *
   * That asymmetry is deliberate and worth pinning. An event stream cannot
   * report a status: by the time anything is written the headers have gone. So
   * a stream's failures are IN the stream, and "the connection simply ended"
   * must never be how a reader learns something went wrong.
   */
  test("blocking says 503 in the status", async () => {
    const res = await POST(request({ input: "Chunnsch du?", locale: "de" }));
    assert.equal(res.status, 503);
    assert.match(res.headers.get("content-type") ?? "", /application\/json/);
  });

  test("streaming says 200, then says unconfigured in an event", async () => {
    const res = await POST(request({ input: "Chunnsch du?", locale: "de", stream: true }));
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /text\/event-stream/);
    // `no-transform` and `x-accel-buffering: no` are what stop a proxy holding
    // the whole answer back and delivering it in one piece — which looks
    // exactly like streaming being broken.
    assert.match(res.headers.get("cache-control") ?? "", /no-transform/);
    assert.equal(res.headers.get("x-accel-buffering"), "no");

    const body = await res.text();
    assert.match(body, /^data: /m, "every frame is an SSE data line");
    const frame = JSON.parse(body.split("data: ")[1].split("\n")[0]);
    assert.deepEqual(frame, { type: "error", kind: "unconfigured" });
  });
});
