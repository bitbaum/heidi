/**
 * Every menu, popover and drawer on the site, opened — can you actually see it?
 *
 * WHY THIS EXISTS. The header's menus were drawn underneath the chat page's
 * conversation list on a desktop: both sat on layer 30, the list came later
 * in the document, and a tie goes to the later element. Every other check
 * passed, because they measure pages at rest with everything shut, and a
 * covered panel is still "there" to any test that reads the DOM. Only a real
 * browser asking "what is on top at this point?" sees it. `lib/config/
 * layers.test.ts` holds the layer scale in the source; this proves it on the
 * rendered page.
 *
 * WHAT IT DOES. On each page, at each width, in light and dark: click every
 * visible control with `aria-expanded`, find the panel it opened
 * (`aria-controls`, or a menu/dialog/listbox beside it), and report
 *
 *   NONE     no panel can be found — for a screen reader, too
 *   EMPTY    the panel has no size
 *   COVERED  another element is on top of the panel at one of five points
 *   CLEAR    no background anywhere up the tree: the page shows through
 *   BRIGHT   in dark mode, a fixed element (floating chrome, a backdrop)
 *            painted light — the white pill in the corner and the white haze
 *            behind dialogs both shipped that way
 *
 *   pnpm run build && pnpm start      # in another terminal
 *   pnpm run audit:overlays
 *   PAGES=/de/chat WIDTHS=1440 THEMES=dark pnpm run audit:overlays
 *
 * NOT part of `pnpm run verify`, for the same reason as the layout audit: it
 * needs a running server and a browser. CI runs it after the build.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const PAGES = (process.env.PAGES ?? "/de,/de/chat,/de/practice,/de/vocabulary,/de/situations,/de/portal").split(",");
const WIDTHS = (process.env.WIDTHS ?? "1440,1024,390").split(",").map(Number);
const THEMES = (process.env.THEMES ?? "light,dark").split(",");

/** Runs in the page: what is wrong with the panel `trigger` just opened. */
function inspect(trigger) {
  const id = trigger.getAttribute("aria-controls");
  const panel =
    (id && document.getElementById(id)) ||
    trigger.parentElement?.querySelector('[role="menu"],[role="dialog"],[role="listbox"]');
  if (!panel) return ["NONE"];
  const r = panel.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return ["EMPTY"];

  const out = [];
  const clampX = (x) => Math.max(1, Math.min(x, innerWidth - 2));
  const clampY = (y) => Math.max(1, Math.min(y, innerHeight - 2));
  const bottom = Math.min(r.bottom, innerHeight);
  const points = [
    [r.left + r.width / 2, r.top + (bottom - r.top) / 2],
    [r.left + 8, r.top + 8],
    [r.right - 8, r.top + 8],
    [r.left + 8, bottom - 8],
    [r.right - 8, bottom - 8],
  ];
  for (const [x, y] of points) {
    const top = document.elementFromPoint(clampX(x), clampY(y));
    if (top && !panel.contains(top) && !trigger.contains(top)) {
      const cls = (top.getAttribute("class") ?? "").slice(0, 70);
      out.push(`COVERED by <${top.tagName.toLowerCase()} class="${cls}">`);
      break;
    }
  }
  let el = panel;
  let opaque = false;
  while (el && el !== document.documentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) {
      opaque = true;
      break;
    }
    el = el.parentElement;
  }
  if (!opaque) out.push("CLEAR");
  return out;
}

/** Runs in the page: fixed elements that are light-coloured, for the dark theme. */
function brightFixed() {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const style = getComputedStyle(el);
    if (style.position !== "fixed" || style.display === "none" || style.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width * r.height < 1500) continue;
    const m = style.backgroundColor.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
    if (!m) continue;
    const [red, green, blue] = [m[1], m[2], m[3]].map(Number);
    const alpha = m[4] === undefined ? 1 : Number(m[4]);
    const light = ((0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255) * alpha;
    if (light > 0.15) out.push(`BRIGHT <${el.tagName.toLowerCase()} class="${(el.getAttribute("class") ?? "").slice(0, 70)}">`);
  }
  return out;
}

const browser = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {},
);
const problems = [];
let opened = 0;

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: theme,
    });
    const page = await context.newPage();
    for (const path of PAGES) {
      const url = BASE + path;
      const response = await page.goto(url, { waitUntil: "networkidle" });
      if (!response?.ok()) {
        problems.push(`${theme} ${width} ${path}: HTTP ${response?.status()}`);
        continue;
      }
      if (theme === "dark") {
        for (const issue of await page.evaluate(brightFixed)) problems.push(`${theme} ${width} ${path}: ${issue}`);
      }
      const triggers = page.locator('[aria-expanded="false"]:visible');
      const count = await triggers.count();
      for (let i = 0; i < count; i++) {
        const trigger = triggers.nth(i);
        if (!(await trigger.count())) continue;
        const name = (
          (await trigger.getAttribute("aria-label")) ||
          (await trigger.innerText()).trim()
        ).slice(0, 40);
        const handle = await trigger.elementHandle();
        await trigger.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(250);
        if (page.url() !== url) {
          await page.goto(url, { waitUntil: "networkidle" });
          continue;
        }
        if (handle && (await handle.getAttribute("aria-expanded")) === "true") {
          opened++;
          for (const issue of await handle.evaluate(inspect)) {
            problems.push(`${theme} ${width} ${path} «${name}»: ${issue}`);
          }
          if (theme === "dark") {
            for (const issue of await page.evaluate(brightFixed)) problems.push(`${theme} ${width} ${path} «${name}»: ${issue}`);
          }
        }
        await page.keyboard.press("Escape");
        await page.waitForTimeout(100);
        if ((await page.locator('[aria-expanded="true"]').count()) > 0) {
          await page.goto(url, { waitUntil: "networkidle" });
        }
      }
    }
    await context.close();
  }
}
await browser.close();

if (opened === 0) {
  console.error("Opened nothing — the audit is not looking at the site.");
  process.exit(1);
}
if (problems.length) {
  console.error(`${problems.length} overlay problem(s) in ${opened} opened panels:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log(`${opened} panels opened, all visible and on top.`);
