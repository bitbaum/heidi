import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { createAuthInstance } from "@bitbaum/accountkit/auth/server";
import * as schema from "../db/schema.ts";

/**
 * Heidi's migrations, applied in order to a real (in-memory) Postgres, carry
 * the account tables better-auth needs: a learner can register with an email
 * and a password, with no OrangeCat account, and is signed in.
 */
test("a learner registers without OrangeCat against Heidi's own migrations", async () => {
  const pg = new PGlite();
  const dir = join(process.cwd(), "drizzle");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    for (const statement of readFileSync(join(dir, file), "utf8").split("--> statement-breakpoint")) {
      if (statement.trim()) await pg.exec(statement);
    }
  }
  const site = { url: "https://heidi.orangecat.ch", title: "Heidi", slug: "heidi" };
  const auth = createAuthInstance({
    site,
    database: drizzle(pg, { schema }),
    mail: { configured: false, send: async () => {} },
    env: { NODE_ENV: "test", BETTER_AUTH_SECRET: "h".repeat(48) },
  });
  const r = await auth.handler(
    new Request(`${site.url}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: site.url },
      body: JSON.stringify({ email: "lerner@example.ch", password: "grüezi mitenand zäme", name: "" }),
    }),
  );
  assert.equal(r.status, 200);
  const cookie = r.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const session = await (await auth.handler(new Request(`${site.url}/api/auth/get-session`, { headers: { cookie } }))).json();
  assert.equal(session.user.email, "lerner@example.ch");
  await pg.close();
});
