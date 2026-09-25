import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 1600 } });
await p.goto("http://localhost:3000/de/practice?topic=modal-particles&mode=write", { waitUntil: "load" });
await p.waitForTimeout(2500);
for (let i = 0; i < 4; i++) {
  if (/habe ich gemeint/.test(await p.evaluate(() => document.querySelector("main").innerText))) break;
  await p.getByRole("button", { name: "Überspringen" }).click(); await p.waitForTimeout(600);
}
await p.locator("main textarea, main input").first().fill("Ebe, das han ich gmeint.");
await p.getByRole("button", { name: "Prüfen" }).click(); await p.waitForTimeout(900);
const main = await p.evaluate(() => document.querySelector("main").innerText);
const at = main.indexOf("SIE HABEN GESCHRIEBEN");
console.log(main.slice(at, at + 1700));
const box = await p.locator("text=SIE HABEN GESCHRIEBEN").boundingBox();
await p.screenshot({ path: "/home/g/.claude/jobs/74feb87c/tmp/explain.png", clip: { x: 0, y: Math.max(0, box.y - 140), width: 900, height: 1200 } });
await b.close();
