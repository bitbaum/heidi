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
// Playwright is not a dependency of this app — it is a tool, run by hand
// before shipping visual work, and adding a browser to the install for it
// would cost every CI run for something nothing gates on.
import { chromium } from "playwright";

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

    const interactive =
      el.matches("a[href], button, input, select, textarea, summary, [role=button]") && !el.hasAttribute("disabled");
    if (interactive && r.height > 0 && r.height < 44 && r.width > 0) {
      out.tap.push({ el: name(el), h: Math.round(r.height), w: Math.round(r.width) });
    }

    const size = parseFloat(cs.fontSize);
    const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 12);
    if (hasOwnText && size < 12) out.tiny.push({ el: name(el), size });
  }

  // Gutter: does the main content touch the edge?
  const main = document.querySelector("main") ?? document.body;
  const mr = main.getBoundingClientRect();
  if (mr.left < 12 && vw < 500) {
    const pad = parseFloat(getComputedStyle(main).paddingLeft || "0");
    if (pad < 12) out.gutter.push({ el: name(main), left: Math.round(mr.left), pad });
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
