import { chromium, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["iPhone 13"] });
const p = await ctx.newPage();
const rows = [];
for (const path of ["/de", "/de/practice", "/de/vocabulary", "/de/situations/restaurant", "/de/grammar", "/de/listen", "/de/method", "/de/chat"]) {
  await p.goto(base + path, { waitUntil: "load" }); await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const dock = document.querySelector('[data-dock="heidi"]');
    const btn = dock?.querySelector("button");
    if (!dock) return { dock: "ABSENT" };
    if (!btn) return { dock: "no launcher" };
    const cs = getComputedStyle(btn); const rr = btn.getBoundingClientRect();
    const visible = cs.display !== "none" && getComputedStyle(dock).display !== "none" && rr.width > 0;
    const hit = visible ? document.elementFromPoint(rr.left + rr.width / 2, rr.top + rr.height / 2) : null;
    return { dock: visible ? "visible" : "hidden", size: `${Math.round(rr.width)}x${Math.round(rr.height)}`,
             at: `right ${Math.round(innerWidth - rr.right)} bottom ${Math.round(innerHeight - rr.bottom)}`,
             label: btn.innerText.trim() || "(icon only)", tappable: !!hit && (btn === hit || btn.contains(hit)) };
  });
  rows.push([path, r]);
}
for (const [path, r] of rows) console.log(path.padEnd(28), JSON.stringify(r));
await b.close();
