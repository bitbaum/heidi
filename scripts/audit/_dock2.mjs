import { chromium, devices } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["iPhone 13"] });
const p = await ctx.newPage();
for (const path of ["/de/vocabulary", "/de/practice"]) {
  await p.goto("https://heidi.orangecat.ch" + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(9000); // lazyOnload runs after idle
  const r = await p.evaluate(() => {
    const btn = document.querySelector('[data-dock="heidi"] button');
    const rr = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(rr.left + rr.width / 2, rr.top + rr.height / 2);
    const describe = (el) => el ? `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${(el.className?.toString?.() ?? "").slice(0, 50)}` : null;
    // any other fixed element in the bottom-right corner?
    const fixed = [...document.querySelectorAll("body *")].filter((e) => {
      const cs = getComputedStyle(e); if (cs.position !== "fixed") return false;
      const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > innerHeight - 120 && r.right > innerWidth - 120;
    }).map((e) => { const r = e.getBoundingClientRect(); return `${describe(e)} @ right ${Math.round(innerWidth - r.right)} bottom ${Math.round(innerHeight - r.bottom)} ${Math.round(r.width)}x${Math.round(r.height)} z=${getComputedStyle(e).zIndex}`; });
    return { lokiScript: !!document.querySelector('script[src*="loki.orangecat.ch/widget"]'),
             onTopOfHeidi: describe(hit), heidiTappable: btn === hit || btn.contains(hit), bottomRightFixed: fixed };
  });
  console.log(path, JSON.stringify(r, null, 1));
}
await p.screenshot({ path: "/home/g/.claude/jobs/74feb87c/tmp/mobile-corner.png" });
await b.close();
