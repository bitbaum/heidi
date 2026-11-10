import { test } from "node:test";
import assert from "node:assert/strict";
import { createSender, ownSender } from "./sender.ts";

const KEY = { RESEND_API_KEY: "re_live_key" };
const health = (domains: [string, string][]) => ({ ok: true, domains: domains.map(([name, status]) => ({ name, status })) });

test("Heidi's own domain is used only when the mail service says it is verified", () => {
  assert.equal(ownSender(health([["fleetcrown.orangecat.ch", "verified"]])), null);
  assert.equal(ownSender(health([["orangecat.ch", "pending"]])), null);
  assert.equal(ownSender(health([["orangecat.ch", "verified"]])), "Heidi <heidi@orangecat.ch>");
  // Heidi's own host wins over the apex once it exists.
  assert.equal(
    ownSender(health([["orangecat.ch", "verified"], ["heidi.orangecat.ch", "verified"]])),
    "Heidi <heidi@heidi.orangecat.ch>",
  );
  assert.equal(ownSender({ ok: false, error: "Resend 401" }), null);
});

test("until the probe has answered, and while nothing of Heidi's is verified, the shared sender stays", async () => {
  const s = createSender(async () => health([["fleetcrown.orangecat.ch", "verified"]]));
  assert.equal(s.from(KEY), undefined);
  const report = await s.report(KEY);
  assert.equal(report.state, "shared");
  assert.equal(s.from(KEY), undefined);
});

test("the sender switches by itself once a domain of Heidi's is verified, and a blip does not switch it back", async () => {
  let answer: ReturnType<typeof health> | { ok: false; error: string } = health([["fleetcrown.orangecat.ch", "verified"]]);
  let clock = 0;
  const s = createSender(async () => answer, () => clock);
  assert.equal((await s.report(KEY)).state, "shared");

  answer = health([["fleetcrown.orangecat.ch", "verified"], ["orangecat.ch", "verified"]]);
  clock += 11 * 60_000;
  const own = await s.report(KEY);
  assert.equal(own.state, "own");
  assert.equal(own.from, "Heidi <heidi@orangecat.ch>");
  assert.equal(s.from(KEY), "Heidi <heidi@orangecat.ch>");

  answer = { ok: false, error: "Resend 500" };
  clock += 11 * 60_000;
  await s.report(KEY);
  assert.equal(s.from(KEY), "Heidi <heidi@orangecat.ch>");
});

test("an explicit RESEND_FROM wins, and no key means nothing is asked", async () => {
  let asked = 0;
  const s = createSender(async () => (asked++, health([["orangecat.ch", "verified"]])));
  assert.equal(s.from({ ...KEY, RESEND_FROM: "Heidi <x@example.ch>" }), undefined);
  assert.equal(s.from({}), undefined);
  assert.deepEqual(await s.report({}), { state: "unconfigured" });
  assert.equal(asked, 0);
  const pinned = await s.report({ ...KEY, RESEND_FROM: "Heidi <x@example.ch>" });
  assert.equal(pinned.state, "pinned");
  assert.equal(pinned.from, "Heidi <x@example.ch>");
});
