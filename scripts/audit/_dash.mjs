import { chromium } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage();
await p.setViewportSize({ width: 1100, height: 1300 });
await p.goto(base + "/de/portal", { waitUntil: "load" });
await p.evaluate(() => {
  const lines = {}; for (let i=0;i<10;i++) lines[`handover:${i}`] = { asked: 3, missed: 0 };
  lines["restaurant:0"] = { asked: 2, missed: 0 };
  localStorage.setItem("heidi.practice.model.v1", JSON.stringify({ topics:{}, scenes:{}, groups:{}, words:{}, lines }));
  localStorage.setItem("heidi.saved.v1", JSON.stringify({ version: 1, words: [
    { target: "schoguet", bridge: "gut", savedAt: "2026-09-24T10:00:00Z" },
    { target: "schlofe", bridge: "schlafen", savedAt: "2026-09-15T10:00:00Z" } ] }));
});
await p.reload({ waitUntil: "load" }); await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  const broken = [...document.querySelectorAll("[aria-labelledby]")].filter((e) => {
    const t = document.getElementById(e.getAttribute("aria-labelledby")); return !t || t === e || t.contains(e);
  }).map((e) => e.getAttribute("aria-labelledby"));
  return {
    duplicateIds: [...new Set(dup)],
    selfOrMissingLabels: broken,
    boardShown: !!document.querySelector('[aria-labelledby="board-heading"]'),
    patternsShown: !!document.getElementById("patterns-heading") || /immer wieder begegnet/.test(document.body.innerText),
    jumpStrip: [...document.querySelectorAll('nav[aria-label] a[href^="#"]')].map((a) => a.textContent.trim()).slice(0, 12),
  };
});
console.log(base.includes("localhost") ? "LOCAL " : "PROD  ", JSON.stringify(r));
await b.close();
