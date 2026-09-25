import { chromium, devices } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["iPhone 13"] });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/de/grammar", { waitUntil: "load" }); await p.waitForTimeout(2000);
await p.screenshot({ path: "/home/g/.claude/jobs/74feb87c/tmp/dock-after.png" });
await b.close();
