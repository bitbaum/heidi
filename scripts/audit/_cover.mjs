import { chromium, devices } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["iPhone SE"] });
const p = await ctx.newPage();
let covered = 0;
for (const path of ["/de/practice", "/de/vocabulary", "/de/situations/restaurant", "/de/grammar", "/de/listen", "/de/situations"]) {
  await p.goto(base + path, { waitUntil: "load" }); await p.waitForTimeout(1500);
  // walk the page top to bottom; at each stop, is any control under the launcher?
  const r = await p.evaluate(async () => {
    const btn = document.querySelector('[data-dock="heidi"] button');
    if (!btn || getComputedStyle(btn).display === "none") return { skip: true };
    const hits = new Set();
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y <= H; y += Math.floor(innerHeight / 2)) {
      window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30));
      const L = btn.getBoundingClientRect();
      for (const el of document.querySelectorAll("a, button, input, select, textarea, [role=button]")) {
        if (btn.contains(el) || el.closest('[data-dock="heidi"]')) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.left < L.right && r.right > L.left && r.top < L.bottom && r.bottom > L.top) {
          // covered only if the launcher is what a tap at the overlap would hit
          const x = (Math.max(r.left, L.left) + Math.min(r.right, L.right)) / 2;
          const yy = (Math.max(r.top, L.top) + Math.min(r.bottom, L.bottom)) / 2;
          const top = document.elementFromPoint(x, yy);
          if (top && btn.contains(top)) hits.add((el.innerText || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30));
        }
      }
    }
    // and at the very bottom specifically
    window.scrollTo(0, H); await new Promise((r) => setTimeout(r, 60));
    return { label: btn.innerText.trim(), width: Math.round(btn.getBoundingClientRect().width), coveredSomewhere: [...hits].slice(0, 6) };
  });
  if (r.coveredSomewhere?.length) covered++;
  console.log(path.padEnd(28), JSON.stringify(r));
}
console.log(`\n${covered} page(s) where a control can end up under the chat button`);
await b.close();
