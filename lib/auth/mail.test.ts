import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTACT_EMAIL, SITE_URL } from "../config/site.ts";
import { heidiAuthMailer, mailEnv } from "./mail.ts";

/**
 * Through the real package path, with only the network replaced: this is the
 * mail a learner gets, so the test reads what is posted to the mail service.
 */
test("the first sign-in mail of a server process already has Heidi's sender and a Reply-To that receives", async () => {
  const posted: { from: string; reply_to?: string }[] = [];
  const real = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/domains")) {
      return Response.json({ data: [{ name: "fleetcrown.orangecat.ch", status: "verified" }, { name: "orangecat.ch", status: "verified" }] });
    }
    if (url.endsWith("/emails")) {
      posted.push(JSON.parse(String(init?.body)));
      return Response.json({ id: "mail_1" });
    }
    throw new Error(`unexpected request to ${url}`);
  }) as typeof fetch;

  try {
    // Nothing has asked the mail service yet: no health check, no earlier mail.
    const mailer = heidiAuthMailer(() => ({ RESEND_API_KEY: "re_live_key", NODE_ENV: "test" }));
    await mailer.send("magicLink", "learner@example.ch", `${SITE_URL}/api/auth/magic-link/verify?token=t`, { code: "123456" });
  } finally {
    globalThis.fetch = real;
  }

  assert.equal(posted.length, 1);
  assert.equal(posted[0].from, "Heidi <heidi@orangecat.ch>");
  assert.equal(posted[0].reply_to, CONTACT_EMAIL);
});

test("MAIL_ADDRESS in the environment wins over the contact address", () => {
  assert.equal(mailEnv({ MAIL_ADDRESS: "post@example.ch" }).MAIL_ADDRESS, "post@example.ch");
  assert.equal(mailEnv({}).MAIL_ADDRESS, CONTACT_EMAIL);
});
