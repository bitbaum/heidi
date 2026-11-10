import { test } from "node:test";
import assert from "node:assert/strict";
import { signUnsubscribe } from "@bitbaum/mail-kit";
import { actorOfToken, oneClickUrl, unsubscribeToken } from "./unsubscribe.ts";

process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-0000";

test("a token names the person and works with no sign-in", () => {
  assert.equal(actorOfToken(unsubscribeToken("actor-1")), "actor-1");
});

test("a damaged, foreign or other-list token names nobody", () => {
  const good = unsubscribeToken("actor-1");
  assert.equal(actorOfToken(`${good}x`), null);
  assert.equal(actorOfToken(null), null);
  assert.equal(actorOfToken("garbage"), null);
  // Signed with the same label but for a different list: not a reminder unsubscribe.
  assert.equal(actorOfToken(signUnsubscribe(`${process.env.BETTER_AUTH_SECRET}:mail-unsubscribe`, { user: "actor-1", list: "digest" })), null);
  // Signed with the bare session secret: cannot be replayed from elsewhere.
  assert.equal(actorOfToken(signUnsubscribe(process.env.BETTER_AUTH_SECRET!, { user: "actor-1", list: "reminders" })), null);
});

test("the one-click URL is https and carries the token", () => {
  assert.match(oneClickUrl("a.b"), /^https:\/\/.+\/api\/mail\/unsubscribe\?t=a\.b$/);
});
