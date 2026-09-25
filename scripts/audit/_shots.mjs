import { chromium } from "playwright";
const tag = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage();
await p.setViewportSize({ width: 1100, height: 1000 });
for (const [name, path] of [["practice","/de/practice?topic=modal-particles"],["vocab","/de/vocabulary"],["home","/de"],["situation","/de/situations/restaurant"]]) {
  await p.goto("http://localhost:3000" + path, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `/home/g/.claude/jobs/74feb87c/tmp/shots/${tag}-${name}.png` });
}
// count red pixels-ish: elements whose computed colour/background is the red token
const counts = {};
for (const [name, path] of [["practice","/de/practice?topic=modal-particles"],["vocab","/de/vocabulary"],["home","/de"]]) {
  await p.goto("http://localhost:3000" + path, { waitUntil: "load" }); await p.waitForTimeout(2000);
  counts[name] = await p.evaluate(() => {
    const red = (c) => { const m = c.match(/\d+(\.\d+)?/g); if (!m) return false; const [r,g,bl] = m.map(Number); return r > 170 && g < 90 && bl < 90; };
    let n = 0;
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if ((el.childNodes.length && [...el.childNodes].some(c => c.nodeType === 3 && c.textContent.trim()) && red(cs.color)) || red(cs.backgroundColor)) n++;
    }
    return n;
  });
}
console.log(tag, "red elements:", JSON.stringify(counts));
await b.close();
