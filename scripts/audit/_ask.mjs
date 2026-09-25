import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 1400 } });
await p.goto("http://localhost:3000/de/practice?topic=modal-particles&mode=write", { waitUntil: "load" });
await p.waitForTimeout(2500);
for (let i = 0; i < 4; i++) {
  if (/habe ich gemeint/.test(await p.evaluate(() => document.querySelector("main").innerText))) break;
  await p.getByRole("button", { name: "Überspringen" }).click(); await p.waitForTimeout(600);
}
await p.locator("main textarea, main input").first().fill("Ebe, das han ich gmeint.");
await p.getByRole("button", { name: "Prüfen" }).click(); await p.waitForTimeout(800);
await p.getByRole("button", { name: "Wort für Wort" }).click(); await p.waitForTimeout(1500);
const dock = await p.evaluate(() => {
  const d = document.querySelector('[data-dock="heidi"]');
  const panel = d?.querySelector('[role="dialog"], section, div[id]');
  return { dockOpen: !!d && /Erklär mir/.test(d.innerText), text: (d?.innerText ?? "").slice(0, 300) };
});
console.log(JSON.stringify(dock, null, 1));
await b.close();
