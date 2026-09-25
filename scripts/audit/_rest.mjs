import { chromium, devices } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["iPhone SE"] });
const p = await ctx.newPage();
let stuck = 0;
for (const path of ["/de/practice", "/de/vocabulary", "/de/situations/restaurant", "/de/grammar", "/de/listen", "/de/situations", "/de/method", "/de/privacy"]) {
  await p.goto(base + path, { waitUntil: "load" }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const btn = document.querySelector('[data-dock="heidi"] button');
    if (!btn || getComputedStyle(btn).display === "none") return { skip: true };
    const under = () => {
      const L = btn.getBoundingClientRect(); const out = [];
      for (const el of document.querySelectorAll("a, button, input, select, textarea")) {
        if (el.closest('[data-dock="heidi"]')) continue;
        const r = el.getBoundingClientRect(); if (!r.width) continue;
        if (r.left < L.right && r.right > L.left && r.top < L.bottom && r.bottom > L.top) {
          const x = (Math.max(r.left, L.left) + Math.min(r.right, L.right)) / 2;
          const y = (Math.max(r.top, L.top) + Math.min(r.bottom, L.bottom)) / 2;
          const top = document.elementFromPoint(x, y);
          if (top && btn.contains(top)) out.push((el.innerText || el.tagName).trim().slice(0, 24));
        }
      }
      return out;
    };
    window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 60)); const atTop = under();
    window.scrollTo(0, document.documentElement.scrollHeight); await new Promise((r) => setTimeout(r, 60)); const atEnd = under();
    return { onArrival: atTop, atTheEnd: atEnd };
  });
  if (r.onArrival?.length || r.atTheEnd?.length) stuck++;
  console.log(path.padEnd(28), JSON.stringify(r));
}
console.log(`=> ${stuck} page(s) with a control under the button at rest`);
await b.close();
