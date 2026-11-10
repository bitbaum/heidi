import assert from "node:assert/strict";
import { test } from "node:test";
import { sendNotification, setVapidDetails } from "web-push";
import { pushConfigured, sendPush } from "./send.ts";

/**
 * web-push 4 is an ES module with named exports and no default. The type
 * package still describes both shapes, so only loading the real module says
 * whether the two functions this file calls are there.
 */
test("the two web-push functions this module calls exist", () => {
  assert.equal(typeof sendNotification, "function");
  assert.equal(typeof setVapidDetails, "function");
});

test("without VAPID keys nothing is sent and nothing is called dead", async () => {
  const saved = { ...process.env };
  delete process.env.VAPID_PUBLIC_KEY;
  delete process.env.VAPID_PRIVATE_KEY;
  delete process.env.VAPID_SUBJECT;
  try {
    assert.equal(pushConfigured(), false);
    assert.deepEqual(await sendPush({ endpoint: "https://push.example/x", p256dh: "k", auth: "a", locale: "en", actorId: "a1" }, { title: "t", body: "b", url: "/" } as never), {
      ok: false,
      dead: false,
    });
  } finally {
    process.env = saved;
  }
});
