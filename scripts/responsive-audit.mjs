/**
 * A responsive audit of every page, at three widths.
 *
 * Eyeballing fifteen pages finds the obvious and misses the systematic. This
 * asks each page the questions that actually make a site feel broken, and
 * prints only what fails:
 *
 *   overflow   the page scrolls sideways — the single most damning mobile bug
 *   wide       an element sticking out past the viewport, named so it is
 *              findable rather than merely reported
 *   tap        an interactive target under 44px, which is the size a finger
 *              actually is
 *   tiny       body text under 12px, which nobody reads on a phone
 *   gutter     content flush to the screen edge
 */
//   node scripts/responsive-audit.mjs          (against a dev server)
//   BASE=https://heidi.orangecat.ch node scripts/responsive-audit.mjs
//
// PLAYWRIGHT IS DELIBERATELY NOT A DEPENDENCY. This is a tool run by hand
// before shipping visual work; adding a browser download to every install and
// every CI run, for something nothing gates on, is a poor trade.
//
// So it is imported at run time and the failure explains itself. An earlier
// version said all of the above in a comment and then imported `playwright`
// as though it were installed, which made the script die on its first run for
// anybody but the author.
let chromium;
try {
  ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright"));
} catch {
  console.error(
    [
      "This tool needs Playwright, which is not a dependency of this app (on purpose).",
      "",
      "  pnpm dlx playwright install chromium   # once, to fetch a browser",
      "  PLAYWRIGHT_MODULE=/path/to/node_modules/playwright/index.mjs \\",
      "    node scripts/responsive-audit.mjs",
      "",
      "Any checkout that already has Playwright will do — point at its module.",
    ].join("\n"),
  );
  process.exit(2);
}

const BASE = process.env.BASE ?? "http://localhost:3000";
const LOCALE = "de";
const ROUTES = [
  "",
  "chat",
  "speaking",
  "practice",
  "listen",
  "grammar",
  "dialect",
  "vocabulary",
  "method",
  "technology",
  "contribute",
  "about",
  "portal",
  "settings",
  "privacy",
  "impressum",
  "organisations",
];

const audit = () => {
  const vw = window.innerWidth;
  const out = { overflow: null, wide: [], tap: [], tiny: [], gutter: [] };

  const docW = document.documentElement.scrollWidth;
  if (docW > vw + 1) out.overflow = { docW, vw };

  const name = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : "";
    const txt = (el.textContent ?? "").trim().slice(0, 28).replace(/\s+/g, " ");
    return `${el.tagName.toLowerCase()}${id}${cls}${txt ? ` "${txt}"` : ""}`;
  };

  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    // Sticking out past the right edge. Allow 1px for rounding.
    if (r.right > vw + 1 && cs.overflowX !== "auto" && cs.overflowX !== "scroll") {
      // Only report the OUTERMOST offender, or one wide table reports thirty rows.
      const parent = el.parentElement;
      const parentOut = parent && parent.getBoundingClientRect().right > vw + 1;
      if (!parentOut) out.wide.push({ el: name(el), right: Math.round(r.right), vw });
    }

    // Tap targets, and only where the guideline actually applies.
    //
    // Two false-positive classes had to go before this report was worth
    // reading. 44px is about a FINGER, so it is checked at phone width only —
    // flagging it at 1280 was flagging a mouse pointer. And a link inside a
    // sentence cannot be 44px tall without wrecking the line height it sits
    // in; the guideline is about standalone controls, so a link with a
    // paragraph for an ancestor is skipped.
    const interactive =
      vw < 500 &&
      el.matches("a[href], button, input, select, textarea, summary, [role=button]") &&
      !el.hasAttribute("disabled") &&
      !el.closest("p") &&
      // The skip link is a 1x1 until it is focused, which is the whole point
      // of it. Reporting it as a tap target on every page is reporting an
      // accessibility feature as an accessibility failure.
      !el.classList.contains("sr-only");
    if (interactive && r.height > 0 && r.height < 44 && r.width > 0) {
      out.tap.push({ el: name(el), h: Math.round(r.height), w: Math.round(r.width) });
    }

    const size = parseFloat(cs.fontSize);
    const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 12);
    if (hasOwnText && size < 12) out.tiny.push({ el: name(el), size });
  }

  // Gutter: does the content a reader actually sees touch the screen edge?
  //
  // Measured on the first piece of TEXT rather than on `main`. The earlier
  // version read `main`'s own padding and so reported a gutter failure on
  // every page in the site, because the padding lives on a wrapper inside it.
  // A check that fires everywhere is a check nobody reads, and this one nearly
  // sent me looking for a layout bug that did not exist.
  if (vw < 500) {
    const main = document.querySelector("main") ?? document.body;
    const text = [...main.querySelectorAll("h1, h2, p, li")].find((el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      // A ZERO-SIZE RECT IS NOT AT THE LEFT EDGE, it is nowhere.
      //
      // Checking the element's own `display` misses the commonest case: a
      // child of a hidden ancestor computes `display: block` quite happily and
      // reports a 0×0 rect at 0,0. That made the off-canvas conversation
      // drawer — correctly hidden on a phone — look like a paragraph flush to
      // the screen edge, and it was the one finding left in the whole report.
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      return (el.textContent ?? "").trim().length > 20;
    });
    if (text) {
      const left = text.getBoundingClientRect().left;
      if (left < 12) out.gutter.push({ el: name(text), left: Math.round(left), pad: 0 });
    }
  }

  return out;
};

const browser = await chromium.launch();
let problems = 0;

// 1024 is not optional. 390 and 1280 both passed while every French page
// scrolled sideways at 1024 — the width where the flat desktop nav has
// appeared but has least room. A two-width audit is how that shipped.
for (const width of [390, 1024, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
  // French: the longest nav labels of the seven, which is what runs the header out of room.
  const localeForWidth = width === 1024 ? "fr" : LOCALE;
  const page = await ctx.newPage();
  console.log(`\n${"=".repeat(60)}\n  ${width}px\n${"=".repeat(60)}`);

  for (const route of ROUTES) {
    const url = `${BASE}/${localeForWidth}${route ? `/${route}` : ""}`;
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      if (!res || res.status() >= 400) {
        console.log(`  ${route || "/"}: HTTP ${res?.status()}`);
        continue;
      }
      await page.waitForTimeout(400);
      const r = await page.evaluate(audit);

      const lines = [];
      if (r.overflow) lines.push(`    OVERFLOW  page is ${r.overflow.docW}px wide in a ${r.overflow.vw}px viewport`);
      for (const w of r.wide.slice(0, 4)) lines.push(`    WIDE      ${w.el} → right ${w.right} > ${w.vw}`);
      // Dedupe tap targets by element signature; a list of 20 identical links is one finding.
      const taps = [...new Map(r.tap.map((t) => [t.el.slice(0, 40), t])).values()];
      for (const t of taps.slice(0, 5)) lines.push(`    TAP       ${t.el} → ${t.w}x${t.h}`);
      for (const t of r.tiny.slice(0, 3)) lines.push(`    TINY      ${t.el} → ${t.size}px`);
      for (const g of r.gutter) lines.push(`    GUTTER    ${g.el} → left ${g.left}, padding ${g.pad}`);

      if (lines.length) {
        problems += lines.length;
        console.log(`  /${route || ""}`);
        console.log(lines.join("\n"));
      }
    } catch (err) {
      console.log(`  ${route || "/"}: ${String(err).slice(0, 90)}`);
    }
  }
  await ctx.close();
}

console.log(`\n${problems} findings\n`);
await browser.close();
