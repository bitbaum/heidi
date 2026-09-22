/**
 * Is there English on the German page?
 *
 * WHY THIS EXISTS. `region` was "Canton of Zürich, Switzerland" and `name` was
 * "Zurich German" — English sentences in the variety pack that survived the
 * display projection and printed in the footer of every page, in every
 * language, for weeks. A reader found them. `display.ts` had been written
 * specifically to stop this and had already caught three earlier escapes; the
 * shape of the failure each time is that somebody looks at a field and decides
 * it is data because it is short.
 *
 * The exhaustive key check in `display.test.ts` closes that one file. This
 * closes the general case, which no unit test reaches: what actually reaches a
 * reader, on a rendered page, in a language that is not English.
 *
 * HOW IT DECIDES. A closed list of English function words — "the", "and",
 * "which", "with" — matched as whole words against the page's visible text.
 * Function words are the right detector because they are the part of English
 * that cannot be a loanword, a brand or a proper noun: German pages carry
 * "Chat", "Podcast" and "Whitepaper" quite legitimately, and none of them is
 * "which".
 *
 * WHAT IT DELIBERATELY SKIPS. Four things, each for a stated reason rather
 * than because it was inconvenient:
 *
 *   /investors   English on purpose, and gated. One document for one kind of
 *                conversation; `investors.ts` argues it at length.
 *   /paper       German and English only by design, like the sectors and the
 *   /roadmap     roadmap — writing ABOUT the project rather than interface
 *   /changelog   copy, where seven machine-checked translations of an
 *   /organisations  unreviewed argument would be six liabilities.
 *   /contribute  recruits people who LIVE here — natives to read our lines,
 *                voices to record, partners to talk. Same reasoning, and the
 *                page now says so in the reader's own language rather than
 *                leaving them to guess, which is what the essays page does
 *                for an untranslated piece.
 *
 * Those pages render English to a French reader BY DECISION. Everything else
 * renders the reader's language or it is a bug.
 *
 *   pnpm run dev                                   # in another terminal
 *   pnpm run audit:language                        # German, every page
 *   LOCALE=ru pnpm run audit:language
 */

import { chromium } from "playwright";
import { INDEXED_ROUTES } from "../../lib/i18n/routes.ts";

const BASE = process.env.BASE ?? "http://localhost:3000";
const LOCALE = process.env.LOCALE ?? "de";

/**
 * English words that cannot be anything else.
 *
 * No nouns and no verbs: "Test", "Start" and "Chat" are ordinary German, and
 * a detector that flagged them would be turned off within a week. These are
 * closed-class words with no German homograph.
 */
const ENGLISH = [
  "the",
  "and",
  "which",
  "with",
  "from",
  "that",
  "this",
  "their",
  "there",
  "would",
  "should",
  "about",
  "because",
  "through",
  "between",
];

/** Pages whose English is a decision. See the header. */
const BY_DESIGN = new Set(["paper", "roadmap", "changelog", "organisations", "investors", "contribute"]);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const routes = INDEXED_ROUTES.filter((route) => !BY_DESIGN.has(route.key));
  let flagged = 0;

  console.log(`language: ${BASE}/${LOCALE} — ${routes.length} pages, skipping ${BY_DESIGN.size} English by design\n`);

  for (const route of routes) {
    const url = `${BASE}/${LOCALE}${route.segment ? `/${route.segment}` : ""}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    /**
     * THE WHOLE PAGE, header and footer included — and that is the point.
     *
     * This scanned `<main>` only at first, to avoid flagging the language
     * switcher for listing «English» on a German page. Which meant it could
     * not have found the bug it was written for: `region` printed in the
     * FOOTER of every page. A detector that skips the place the last leak was
     * is a detector for the next one only.
     *
     * The switcher is handled properly instead: its links carry `lang`, which
     * is correct HTML for a link whose text is a language's own name, and the
     * rule below removes anything that declares its own language.
     */
    const text = await page.evaluate(() => {
      const copy = document.body.cloneNode(true);

      /**
       * Not content: scripts, styles, and the dev server's own overlay.
       *
       * `innerText` picks up module paths out of Next's development tooling —
       * `render-from-template-context` and friends — which is English, is on
       * every page, and is not the product. Stripped by tag rather than by
       * matching the strings, so a production build and a dev build agree.
       */
      for (const junk of copy.querySelectorAll("script, style, noscript, nextjs-portal, template")) {
        junk.remove();
      }

      /**
       * ANYTHING THAT DECLARES ITS OWN LANGUAGE IS NOT A LEAK.
       *
       * A bibliography is the case this exists for. A German page citing
       * "Mutual intelligibility between closely related languages in Europe"
       * is correct — a paper title is a proper noun and translating it would
       * make the reference unfindable — and the markup now says `lang="en"`
       * on those, which is also what a screen reader needs to pronounce them.
       *
       * The same rule removes the dialect itself (`lang` is the variety tag)
       * and the bridge lines (`lang="de"`), which is right: text that has
       * announced what language it is in cannot be an accident.
       */
      for (const marked of copy.querySelectorAll("[lang]")) marked.remove();
      return copy.innerText;
    });

    const hits = new Map();
    for (const word of ENGLISH) {
      const matches = text.match(new RegExp(`\\b${word}\\b`, "gi"));
      if (matches) hits.set(word, matches.length);
    }

    if (hits.size === 0) {
      console.log(`  ok    ${route.segment || "/"}`);
      continue;
    }

    flagged += 1;
    const summary = [...hits.entries()].map(([word, n]) => `${word}×${n}`).join(" ");
    console.log(`  ENGL  ${route.segment || "/"}  ${summary}`);

    // One sentence of context, so the finding is actionable rather than a count.
    const sentence = text
      .split(/[.!?\n]/)
      .map((line) => line.trim())
      .find((line) => [...hits.keys()].some((word) => new RegExp(`\\b${word}\\b`, "i").test(line)));
    if (sentence) console.log(`        ${sentence.slice(0, 160)}`);
  }

  console.log(`\n${routes.length} pages checked — ${flagged} with English in them`);
  await browser.close();
  process.exit(flagged === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
