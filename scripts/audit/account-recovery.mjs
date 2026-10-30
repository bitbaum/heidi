// Password recovery in a real browser, in both states of account mail.
//
// Run by the fleet's shared account journey (.github/workflows/browser-smoke.yml,
// `integration-check-script`), which starts this app's BUILT site with a
// synthetic RESEND_API_KEY and an outbox that catches every message. The journey
// itself then proves the emailed reset link sets a new password. This file
// proves what the person sees:
//
//   CONFIGURED   "Forgot your password?" and the sign-in link are on the sign-in
//                page in de, fr and ru, fit a 320px phone, and the forgot form
//                ends in the "a link is on its way" notice.
//   UNCONFIGURED The same build started without any mail env offers neither:
//                nothing is advertised that cannot arrive.
//
// It never targets anything but a local test app, and starts the second server
// itself on the next port.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const LOCALES = ["de", "fr", "ru"];
const WIDTHS = [320, 390];

const consumerRequire = createRequire(resolve("package.json"));
const { authLabelsFor } = await import(consumerRequire.resolve("@bitbaum/accountkit/auth"));

const button = (page, name) => page.getByRole("button", { name, exact: true });

async function overflowAt(page, width) {
  await page.setViewportSize({ width, height: 844 });
  return page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
}

async function startUnconfigured(base) {
  const port = Number(new URL(base).port || 3000) + 1;
  const env = { ...process.env };
  for (const key of Object.keys(env))
    if (key.startsWith("RESEND_") || key.startsWith("MAIL_") || key.startsWith("FLEET_AUTH_TEST_")) delete env[key];
  // The journey's outbox hook refuses to load without its synthetic key.
  env.NODE_OPTIONS = (env.NODE_OPTIONS ?? "").replace(/--import\s+\S*capture-auth-mail\.mjs/g, "");
  env.BETTER_AUTH_SECRET = randomBytes(48).toString("base64");
  const child = spawn("pnpm", ["run", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    env,
    detached: true,
    stdio: "ignore",
  });
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i++) {
    if (child.exitCode !== null) throw new Error("unconfigured test app exited");
    try {
      if ((await fetch(`${url}/de/sign-in`)).ok) return { url, child };
    } catch {
      /* starting */
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error("unconfigured test app never became ready");
}

function stop(child) {
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    /* already gone */
  }
}

export async function run({ page, base }) {
  const host = new URL(base).hostname;
  assert.ok(["localhost", "127.0.0.1"].includes(host), "recovery check runs only against a local test app");
  const browser = page.context().browser();

  // CONFIGURED: the journey's own server, mail caught by its outbox.
  const signedOut = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const view = await signedOut.newPage();
    for (const locale of LOCALES) {
      const labels = authLabelsFor(locale);
      await view.goto(`${base}/${locale}/sign-in`);
      await button(view, labels.recovery.forgot).waitFor();
      await button(view, labels.withLink).waitFor();
      for (const width of WIDTHS)
        assert.equal(await overflowAt(view, width), false, `${locale} sign-in overflows at ${width}px with recovery shown`);
    }

    const labels = authLabelsFor("de");
    await view.goto(`${base}/de/sign-in`);
    await button(view, labels.recovery.forgot).click();
    const address = view.locator('input[type="email"][autocomplete="email"]');
    await address.waitFor();
    for (const width of WIDTHS)
      assert.equal(await overflowAt(view, width), false, `forgot form overflows at ${width}px`);
    await address.fill(`vergessen-${randomBytes(4).toString("hex")}@example.test`);
    await button(view, labels.recovery.send).click();
    await view.getByRole("status").filter({ hasText: labels.recovery.sent }).waitFor();
  } finally {
    await signedOut.close();
  }

  // UNCONFIGURED: the same build with no mail env.
  const { url, child } = await startUnconfigured(base);
  const plain = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const view = await plain.newPage();
    for (const locale of LOCALES) {
      const labels = authLabelsFor(locale);
      await view.goto(`${url}/${locale}/sign-in`);
      await view.locator('input[autocomplete="current-password"]').waitFor();
      await view.waitForLoadState("networkidle");
      assert.equal(await button(view, labels.recovery.forgot).count(), 0, `${locale}: no "forgot" without mail`);
      assert.equal(await button(view, labels.withLink).count(), 0, `${locale}: no sign-in link without mail`);
      await view.goto(`${url}/${locale}/sign-up`);
      await view.locator('input[type="password"]').first().waitFor();
      assert.equal(await button(view, labels.signUpWithLink).count(), 0, `${locale}: no sign-up link without mail`);
    }
  } finally {
    await plain.close();
    stop(child);
  }
  console.log("PASS recovery shown with mail (de, fr, ru; 320 and 390px) and hidden without it");
}
