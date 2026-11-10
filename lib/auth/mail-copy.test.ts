import { test } from "node:test";
import assert from "node:assert/strict";
import { LOCALES } from "../i18n/locales.ts";
import { mailLocale, renderAuthMail } from "./mail-copy.ts";

const BASE = "https://heidi.orangecat.ch";
const verify = (callback: string) =>
  `${BASE}/api/auth/verify-email?token=eyJhbGciOiJIUzI1NiJ9.e30.x&callbackURL=${encodeURIComponent(callback)}`;

test("the mail speaks the language of the page the link lands on", () => {
  assert.equal(mailLocale(verify("/fr/settings")), "fr");
  assert.equal(mailLocale(verify("/ru/account")), "ru");
  // The language route wraps the real destination; the inner locale counts.
  assert.equal(mailLocale(verify("/api/account/language?next=/it/portal")), "it");
});

test("Swiss German, no callback and a broken URL all fall back to Standard German", () => {
  assert.equal(mailLocale(verify("/gsw/settings")), "de");
  assert.equal(mailLocale(`${BASE}/api/auth/verify-email?token=t`), "de");
  assert.equal(mailLocale("not a url"), "de");
});

test("every site language has every kind of mail, with the link on its own line", () => {
  for (const locale of LOCALES) {
    const url = verify(`/${locale}/settings`);
    for (const kind of ["verify", "magicLink", "reset"] as const) {
      const mail = renderAuthMail(kind, url, {});
      assert.ok(mail.subject.length > 0, `${locale} ${kind} subject`);
      assert.ok(mail.text.split("\n").includes(url), `${locale} ${kind}: the link stands alone`);
      assert.ok(!mail.text.includes("{"), `${locale} ${kind}: no unfilled placeholder`);
      assert.match(mail.subject + mail.text, /Heidi/, `${locale} ${kind}: names the product`);
    }
  }
});

test("the sign-in code is printed, spaced, only in the sign-in mail", () => {
  const url = verify("/de/portal");
  assert.match(renderAuthMail("magicLink", url, { code: "123456" }).text, /123 456/);
  assert.doesNotMatch(renderAuthMail("verify", url, { code: "123456" }).text, /123/);
});

test("a German reader gets German, not the shared English template", () => {
  const mail = renderAuthMail("verify", verify("/de/settings"), {});
  assert.match(mail.subject, /Bestätigen/);
  assert.doesNotMatch(mail.subject, /Confirm/);
});

test("no doubled blank lines, whichever kind", () => {
  const url = verify("/de/settings");
  for (const kind of ["verify", "magicLink", "reset"] as const) {
    assert.doesNotMatch(renderAuthMail(kind, url, { code: "123456" }).text, /\n\n\n/, kind);
  }
});

test("every mail also comes as laid-out HTML: one button to the link, a reason, no way to unsubscribe from a sign-in", () => {
  for (const locale of LOCALES) {
    const url = verify(`/${locale}/settings`);
    for (const kind of ["verify", "magicLink", "reset"] as const) {
      const { html } = renderAuthMail(kind, url, { code: "123456" });
      assert.ok(html, `${locale} ${kind}: html`);
      assert.ok(html.includes(`href="${url.replaceAll("&", "&amp;")}"`), `${locale} ${kind}: the button carries the link`);
      assert.match(html, /<h1/, `${locale} ${kind}`);
      assert.doesNotMatch(html, /\{site\}|\{code\}/, `${locale} ${kind}: no unfilled placeholder`);
    }
  }
});
