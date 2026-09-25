import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage();
await p.setViewportSize({ width: 1100, height: 1300 });
await p.goto("http://localhost:3000/de/portal", { waitUntil: "load" });
console.log("url after load:", p.url());
await p.evaluate(() => {
  const lines = {}; for (let i=0;i<10;i++) lines[`handover:${i}`] = { asked: 3, missed: 0 };
  lines["restaurant:0"] = { asked: 2, missed: 0 };
  localStorage.setItem("heidi.practice.model.v1", JSON.stringify({ topics:{}, scenes:{}, groups:{}, words:{}, lines }));
});
await p.reload({ waitUntil: "load" }); await p.waitForTimeout(3500);
console.log((await p.evaluate(() => document.querySelector("main")?.innerText ?? "")).slice(0, 900));
await p.screenshot({ path: "/home/g/.claude/jobs/74feb87c/tmp/dash-local.png", fullPage: false });
await b.close();
