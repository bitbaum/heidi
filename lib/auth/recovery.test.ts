import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { signInMethods } from "@bitbaum/accountkit/auth";
import { createAuthInstance } from "@bitbaum/accountkit/auth/server";
import * as schema from "../db/schema.ts";
import { authSite, heidiAuthMailer } from "./mail.ts";

/**
 * Password recovery and the email sign-in link exist only when account mail
 * can actually go out. Both states are held here: without mail env nothing is
 * advertised and nothing is sent; with it, Heidi's own adapter sends a reset
 * link to Heidi's origin and the link sets a new password.
 *
 * The key below is synthetic and the Resend endpoint is intercepted: nothing
 * leaves the process.
 */
const production = { NODE_ENV: "production" };
const SYNTHETIC_KEY = "re_heidi_test_not_a_real_key";

test("no mail env: no recovery, no sign-in link, no address check", () => {
  for (const env of [
    {},
    { RESEND_API_KEY: "" },
    { RESEND_API_KEY: "re_placeholder_xxx" },
    { RESEND_API_KEY: SYNTHETIC_KEY, RESEND_FROM: "Heidi <onboarding@resend.dev>" },
  ]) {
    const mailer = heidiAuthMailer(() => ({ ...production, ...env }));
    assert.equal(mailer.configured, false, JSON.stringify(env));
    const methods = signInMethods(production, mailer.configured);
    assert.equal(methods.passwordReset, false);
    assert.equal(methods.magicLink, false);
    assert.equal(methods.verifyEmail, false);
    assert.equal(methods.password, true, "email and password stay available");
  }
});

test("mail env present: recovery, sign-in link and address check appear", () => {
  const mailer = heidiAuthMailer(() => ({ ...production, RESEND_API_KEY: SYNTHETIC_KEY }));
  assert.equal(mailer.configured, true);
  const methods = signInMethods(production, mailer.configured);
  assert.equal(methods.passwordReset, true);
  assert.equal(methods.magicLink, true);
  assert.equal(methods.verifyEmail, true);
});

async function heidiDatabase() {
  const pg = new PGlite();
  const dir = join(process.cwd(), "drizzle");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    for (const statement of readFileSync(join(dir, file), "utf8").split("--> statement-breakpoint")) {
      if (statement.trim()) await pg.exec(statement);
    }
  }
  return pg;
}

type Sent = { from: string; to: string | string[]; subject: string; text: string };

/** Intercepts only the Resend call; every other fetch is the real one. */
function captureMail(): { sent: Sent[]; restore: () => void } {
  const sent: Sent[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.startsWith("https://api.resend.com/")) {
      sent.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ id: `test-${sent.length}` }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return original(input, init);
  }) as typeof fetch;
  return { sent, restore: () => (globalThis.fetch = original) };
}

function runtime(pg: PGlite, mailEnv: Record<string, string>) {
  return createAuthInstance({
    site: authSite,
    database: drizzle(pg, { schema }),
    mail: heidiAuthMailer(() => ({ NODE_ENV: "test", ...mailEnv })),
    env: { NODE_ENV: "test", BETTER_AUTH_SECRET: "h".repeat(48) },
  });
}

function call(
  auth: ReturnType<typeof runtime>,
  path: string,
  body?: unknown,
  cookie = "",
) {
  return auth.handler(
    new Request(`${authSite.url}/api/auth${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json", origin: authSite.url, ...(cookie ? { cookie } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  );
}

const email = "vergesslich@example.ch";
const oldPassword = "grüezi mitenand zäme";
const newPassword = "es neus passwort, gäll";

test("mail env present: a forgotten password comes back by email", async () => {
  const pg = await heidiDatabase();
  const mail = captureMail();
  try {
    const auth = runtime(pg, { RESEND_API_KEY: SYNTHETIC_KEY });
    assert.equal((await call(auth, "/sign-up/email", { email, password: oldPassword, name: "" })).status, 200);
    mail.sent.length = 0; // the address check, sent on sign-up

    const requested = await call(auth, "/request-password-reset", {
      email,
      redirectTo: `${authSite.url}/de/sign-in`,
    });
    assert.equal(requested.status, 200);
    assert.equal(mail.sent.length, 1, "one reset email");
    const [message] = mail.sent;
    assert.deepEqual([message.to].flat(), [email]);
    assert.equal(message.from, "Heidi <heidi@fleetcrown.orangecat.ch>");
    const link = new URL(message.text.match(/https?:\/\/\S+/)![0]);
    assert.equal(link.origin, authSite.url, "the link points at Heidi itself");

    const opened = await auth.handler(new Request(link, { headers: { origin: authSite.url } }));
    const landing = new URL(opened.headers.get("location")!);
    assert.equal(landing.pathname, "/de/sign-in");
    const token = landing.searchParams.get("token");
    assert.ok(token, "the link carries a reset token to the sign-in page");

    assert.equal((await call(auth, "/reset-password", { token, newPassword })).status, 200);
    assert.equal((await call(auth, "/reset-password", { token, newPassword: "nomal öppis" })).status, 400, "one use only");
    assert.equal((await call(auth, "/sign-in/email", { email, password: oldPassword })).status, 401);
    assert.equal((await call(auth, "/sign-in/email", { email, password: newPassword })).status, 200);
  } finally {
    mail.restore();
    await pg.close();
  }
});

test("no mail env: asking for a reset sends nothing", async () => {
  const pg = await heidiDatabase();
  const mail = captureMail();
  try {
    const auth = runtime(pg, {});
    assert.equal((await call(auth, "/sign-up/email", { email, password: oldPassword, name: "" })).status, 200);
    const requested = await call(auth, "/request-password-reset", {
      email,
      redirectTo: `${authSite.url}/de/sign-in`,
    });
    assert.notEqual(requested.status, 200, "the endpoint does not pretend a link is on its way");
    assert.equal(mail.sent.length, 0);
  } finally {
    mail.restore();
    await pg.close();
  }
});
