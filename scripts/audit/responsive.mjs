/**
 * Every page, at every phone width, in every language — does anything run off
 * the side of the screen?
 *
 * WHY THIS EXISTS AS A SCRIPT RATHER THAN A TEST. Horizontal overflow is a
 * LAYOUT fact: it depends on the real width of real glyphs in a real font at a
 * real viewport, and no amount of reading the source finds it. It was reported
 * three times from a phone before anything caught it, and each time the fix
 * was applied to the one page in the screenshot while three others stayed
 * broken — because nobody could see them.
 *
 * WHAT IT CHECKS, and the second one is the one that matters:
 *
 *   OVER  an element's box extends past the viewport. Before `overflow-x: clip`
 *         went on the body this made the whole DOCUMENT scroll sideways; now it
 *         is clipped, so `document.scrollWidth` no longer reveals it and this
 *         has to measure the elements themselves.
 *   CLIP  an element's content is wider than the element and the element does
 *         not scroll — text cut off and unreachable. The same defect, one level
 *         down, and invisible without measuring.
 *
 * It seeds real browser state first: a dozen kept words, in several scripts,
 * with the contexts they were kept from — one of them a link, because a
 * learner keeping a word from a pasted URL is the exact case that broke
 * `/portal`, and an empty localStorage would have shown a clean page.
 *
 *   pnpm run dev                    # in another terminal
 *   pnpm run audit:responsive
 *   LOCALES=de,fr WIDTHS=320 pnpm run audit:responsive   # narrow it down
 *
 * NOT part of `pnpm run verify`: it needs a running server and a browser
 * binary, which `verify` deliberately does not. Run it when you touch layout.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const LOCALES = (process.env.LOCALES ?? "de,fr,ru").split(",");
const WIDTHS = (process.env.WIDTHS ?? "320,360,390").split(",").map(Number);
const THEMES = (process.env.THEMES ?? "light,dark").split(",");

/** Every page below a locale. A route missing here is a route nobody measures. */
const PATHS = [
  "", "/chat", "/portal", "/about", "/contribute", "/dialect", "/dialect/zueritueuetsch",
  "/grammar", "/impressum", "/investors", "/listen", "/method", "/organisations",
  "/practice", "/privacy", "/settings", "/speaking", "/technology", "/vocabulary",
];

/**
 * A browser that has been used.
 *
 * The long link and the 49-letter compound are not decoration: they are the
 * two shapes with no break opportunity in them, and they are what a learner
 * pastes. The Cyrillic and French contexts are here because a kept word
 * carries the sentence it came from, in whatever language that was.
 */
const LINK =
  "https://www.zuerich.ch/de/portal/verwaltung/mitteilungen/2026/wohnungsvergabe-mitteilung-an-alle-mieterinnen.html";
const SAVED = {
  version: 1,
  words: [
    { target: "chrank", bridge: "krank", context: "Je suis malade", savedAt: "2026-09-19T08:00:00.000Z" },
    { target: "hesch", bridge: "hast", context: "Hesch mir mal de Schlüssel, bitte?", savedAt: "2026-09-17T08:00:00.000Z" },
    { target: "Morn", bridge: "morgen", context: "tomorrow you have your MRI Mr meijer", savedAt: "2026-09-17T08:00:00.000Z" },
    { target: "wotsch", bridge: "willst", context: "Wanna go to this party", savedAt: "2026-09-17T08:00:00.000Z" },
    { target: "ha", bridge: "habe", context: "Sagen Sie das bestimmter — ich habe schon zweimal gefragt.", savedAt: "2026-09-16T08:00:00.000Z" },
    { target: "wett", bridge: "möchte", context: "я хочу пойти на концерт в пятницу вечером", savedAt: "2026-09-16T08:00:00.000Z" },
    { target: "Donaudampfschifffahrtsgesellschaftskapitaenswitwe", bridge: "Donaudampfschifffahrtsgesellschaftskapitänswitwe", context: LINK, savedAt: "2026-09-15T08:00:00.000Z" },
    { target: "znacht", bridge: "Abendessen", context: "Mir gaht's guet, danke. Und dir?", savedAt: "2026-09-15T08:00:00.000Z" },
    { target: "öppis", bridge: "etwas", context: "Wotsch öppis z trinke?", savedAt: "2026-09-13T08:00:00.000Z" },
  ],
};

/** An answer carrying every field that has ever run off the edge. */
const ANSWER = {
  mode: "produce",
  text: `Sie antworten, dass es Ihnen gut geht. Nachschlagen: ${LINK}`,
  dialect: "Mir gaht's guet, danke. Und dir?",
  dialectClean: false,
  dialectFlags: ["nicht-zuerichdeutsche-form-xyz", "unbekannte-schreibung-abcdefgh"],
  tone: "warm",
  toneNote: "Warm und freundlich, passt für Kolleginnen und Kollegen in einem informellen Gespräch.",
  glosses: [
    { form: "gaht's", standard: "geht es", english: "geht es", rule: "nd → nn" },
    { form: "Donaudampfschifffahrtsgesellschaftskapitaenswitwe", standard: "Donaudampfschifffahrtsgesellschaftskapitänswitwe", english: "Witwe eines Donaudampfschiffskapitäns", rule: "nd → nn" },
  ],
  suggestions: [
    { label: "WÄRMER UND VIEL LÄNGER ALS ÜBLICH", text: LINK, english: "Ein sehr langer Link", variety: "bridge", clean: false, flags: ["flag-eins-sehr-lang", "flag-zwei"] },
    { label: "KÜRZER", text: "Guet, danke!", english: "Gut, danke!", clean: true, flags: [] },
  ],
  next: [{ id: "reply" }, { id: "rephrase", axis: "warmer" }],
  model: "openai/gpt-oss-120b-instruct-turbo-preview-2026",
};

const DRAFT = {
  version: 1,
  locale: "de",
  messages: [
    { id: "m1", authorId: "me", body: `Wie antworte ich darauf? ${LINK}`, createdAt: "2026-09-19T08:00:00.000Z" },
    { id: "m2", authorId: "heidi", body: ANSWER.text, createdAt: "2026-09-19T08:00:05.000Z", answer: ANSWER },
  ],
};

/** Runs in the page: every element whose box or whose content is too wide. */
function findOverflow(viewport) {
  const over = [];
  const clipped = [];
  for (const el of document.querySelectorAll("body *")) {
    const box = el.getBoundingClientRect();
    const visible = box.width > 0 || box.height > 0;

    if (visible && (box.right > viewport + 1 || box.left < -1)) {
      // Only the outermost offender: a child sticking out of a parent that is
      // itself sticking out is one defect reported twice.
      const parent = el.parentElement?.getBoundingClientRect();
      if (!parent || (parent.right <= viewport + 1 && parent.left >= -1)) {
        over.push(describe(el, box));
      }
    }

    if (el.scrollWidth > el.clientWidth + 1) {
      const overflowX = getComputedStyle(el).overflowX;
      // A real scroller is a deliberate choice; `visible` and `clip` are not.
      if (overflowX === "visible" || overflowX === "clip") clipped.push(describe(el, box));
    }
  }
  return { over, clipped, doc: document.documentElement.scrollWidth };

  function describe(el, box) {
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute("class") ?? "").slice(0, 110),
      left: Math.round(box.left),
      right: Math.round(box.right),
      sw: el.scrollWidth,
      cw: el.clientWidth,
      text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 44),
    };
  }
}

/**
 * `pnpm exec playwright install chromium` provides one; an environment that
 * already ships a browser (a CI image, a sandbox) points at it instead rather
 * than downloading a second copy.
 */
const browser = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {},
);
let renders = 0;
let bad = 0;

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 780 },
      isMobile: true,
      hasTouch: true,
      colorScheme: theme,
    });
    // Before the first paint, so the page renders WITH the data rather than
    // filling in afterwards and being measured empty.
    await context.addInitScript(
      ([saved, draft]) => {
        try {
          localStorage.setItem("heidi.saved.v1", JSON.stringify(saved));
          localStorage.setItem("heidi.chat.draft.v1", JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
        } catch {
          // A browser with storage denied still has to render; so does this.
        }
      },
      [SAVED, DRAFT],
    );

    const page = await context.newPage();
    // No model is called: the answer above is the fixture, so the audit is
    // deterministic and costs nobody a token.
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: { "content-type": "text/event-stream" },
        body: `event: message\ndata: ${JSON.stringify({ type: "answer", answer: ANSWER })}\n\n`,
      }),
    );

    for (const locale of LOCALES) {
      for (const path of PATHS) {
        const url = `${BASE}/${locale}${path}`;
        let response;
        try {
          response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
        } catch (error) {
          console.log(`ERR  ${locale}${path} @${width} ${theme}: ${String(error).slice(0, 90)}`);
          bad += 1;
          continue;
        }
        if (!response || response.status() >= 400) {
          console.log(`HTTP ${response?.status()} ${locale}${path}`);
          bad += 1;
          continue;
        }
        await page.waitForTimeout(350);
        renders += 1;

        const found = await page.evaluate(findOverflow, width);
        if (found.over.length === 0 && found.clipped.length === 0) continue;

        bad += 1;
        console.log(`\n### ${locale}${path} @${width} ${theme}  (document ${found.doc}px)`);
        for (const o of found.over.slice(0, 6)) {
          console.log(`   OVER <${o.tag}> L${o.left} R${o.right} "${o.text}"\n        ${o.cls}`);
        }
        for (const o of found.clipped.slice(0, 6)) {
          console.log(`   CLIP <${o.tag}> content ${o.sw}px in ${o.cw}px "${o.text}"\n        ${o.cls}`);
        }
      }
    }
    await context.close();
  }
}

await browser.close();
console.log(`\n${renders} page renders measured — ${bad} with overflow`);
process.exit(bad === 0 ? 0 : 1);
