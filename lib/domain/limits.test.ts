import { test } from "node:test";
import assert from "node:assert/strict";
import { callerKey, chat, dialectCheck, modelCheck, tooMany } from "./limits.ts";

/**
 * Every public endpoint ran with NO limit until this existed. Two of them
 * spend money on every call and both are reachable with curl, so these assert
 * the shape of the protection rather than trusting that it is wired.
 */

function req(ip = "203.0.113.7"): Request {
  return new Request("https://heidi.orangecat.ch/api/chat", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  });
}

test("the probe is much tighter than the chat", () => {
  // It makes a real outbound call with whatever key it is handed, which makes
  // it the one endpoint that could test stolen credentials in bulk.
  assert.ok(modelCheck.peek("a").limit < chat.peek("a").limit);
});

test("a conversation of ordinary length is never refused", () => {
  // A dozen turns is a normal session; meeting the ceiling while working
  // through one WhatsApp thread would make the limit the product's problem.
  const limiter = chat;
  const key = `ordinary:${Math.random()}`;
  for (let i = 0; i < 12; i++) {
    assert.equal(limiter.check(key).allowed, true, `turn ${i + 1} was refused`);
  }
});

test("the probe refuses a burst and says how long to wait", () => {
  const key = `burst:${Math.random()}`;
  let last = modelCheck.check(key);
  for (let i = 0; i < 20; i++) last = modelCheck.check(key);
  assert.equal(last.allowed, false);
  assert.equal(last.remaining, 0);
  // Never fabricated — derived from the oldest counted hit.
  assert.ok(last.retryAfterSeconds > 0);
});

test("one caller's burst does not refuse another caller", () => {
  const mine = `iso-a:${Math.random()}`;
  const theirs = `iso-b:${Math.random()}`;
  for (let i = 0; i < 20; i++) modelCheck.check(mine);
  assert.equal(modelCheck.check(theirs).allowed, true);
});

test("callers are told apart by address, and endpoints keep separate budgets", () => {
  assert.notEqual(callerKey(req("198.51.100.1"), "chat"), callerKey(req("203.0.113.9"), "chat"));
  // Spending the chat allowance must not lock someone out of the dialect check.
  assert.notEqual(callerKey(req(), "chat"), callerKey(req(), "dialect-check"));
});

test("a caller behind a proxy with no forwarded header still gets a key", () => {
  const bare = new Request("https://heidi.orangecat.ch/api/chat", { method: "POST" });
  assert.ok(callerKey(bare, "chat").length > "chat:".length);
});

test("a refusal answers 429 with the headers a client already reads", async () => {
  const key = `headers:${Math.random()}`;
  let last = modelCheck.check(key);
  for (let i = 0; i < 20; i++) last = modelCheck.check(key);

  const res = tooMany(last);
  assert.equal(res.status, 429);
  assert.ok(res.headers.get("retry-after"), "no Retry-After");
  assert.ok(res.headers.get("x-ratelimit-limit"), "no X-RateLimit-Limit");
  // The message is the client's to localise; the body must not leak internals.
  const body = await res.json();
  assert.equal(body.operator, false);
});

test("the dialect check is the most generous, being free to run", () => {
  assert.ok(dialectCheck.peek("a").limit > chat.peek("a").limit);
});
