import type { Metadata } from "next";
import "./globals.css";
import "@bitbaum/design-tokens/composition.css";
import { getDictionary } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n/locales";
import { LocalizedNotFound } from "./not-found-body";

export const metadata: Metadata = { title: "404 · Heidi", robots: { index: false, follow: false } };

/**
 * A URL that matches no route at all: `/fr/typo`, a removed page, a language
 * that does not exist. Next skips rendering and returns this, so there is no
 * layout, no header and no locale to read — which is why the plain default was
 * a bare English «404» with nowhere to go.
 *
 * It carries all seven languages' words and lets the browser choose: the first
 * path segment if it is one of ours, else the browser's own language, else
 * German. Whatever happens it says what is wrong and has a button home.
 */
export default function GlobalNotFound() {
  const words = Object.fromEntries(
    LOCALES.map((locale) => {
      const { notFoundTitle, notFoundBody, backHome } = getDictionary(locale).errors;
      return [locale, { title: notFoundTitle, body: notFoundBody, home: backHome }];
    }),
  );
  return (
    <html lang="de">
      <body>
        <LocalizedNotFound words={words} />
      </body>
    </html>
  );
}
