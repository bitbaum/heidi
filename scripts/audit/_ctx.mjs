import { chromium, devices } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["iPhone 13"] });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/de/practice?scene=restaurant&mode=write", { waitUntil: "load" });
await p.waitForTimeout(2500);
await p.locator("main textarea, main input").first().fill("Händ Si reserviert?");
await p.getByRole("button", { name: "Prüfen" }).click(); await p.waitForTimeout(900);
const main = await p.evaluate(() => document.querySelector("main").innerText);
const i = main.search(/IM GESPRÄCH/);
console.log(i >= 0 ? main.slice(i, i + 900) : "NO CONTEXT SECTION\n" + main.slice(main.indexOf("FRAGE"), main.indexOf("FRAGE") + 900));
const el = p.locator("text=/IM GESPRÄCH/").first();
if (await el.count()) { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); }
await p.screenshot({ path: "/home/g/.claude/jobs/74feb87c/tmp/ctx-phone.png" });
console.log("sideways scroll:", await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await b.close();
