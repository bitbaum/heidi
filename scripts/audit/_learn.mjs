import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
const ANSWER = { mode: "understand", text: "Das heisst: Mir geht es gut.", dialect: "Mir gaht's guet, merci.",
  glosses: [{ form: "gaht's", standard: "geht es", english: "geht es", rule: "" }], suggestions: [], next: [{ id: "reply" }], model: "mock" };
const sent = [];
await p.route("**/api/chat", async (r) => {
  sent.push((r.request().postData() ?? "").slice(0, 400));
  await r.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: `event: message\ndata: ${JSON.stringify({ type: "answer", answer: ANSWER })}\n\n` });
});
await p.goto("http://localhost:3000/de/grammar", { waitUntil: "load" }); await p.waitForTimeout(1500);
await p.locator('[data-dock="heidi"] button').first().click(); await p.waitForTimeout(400);
await p.locator('[data-dock="heidi"] textarea').fill("Was heisst Mir gaht's guet?");
await p.locator('[data-dock="heidi"] textarea').press("Enter"); await p.waitForTimeout(1500);
const row = await p.evaluate(() => {
  const d = document.querySelector('[data-dock="heidi"]');
  const i = d.innerText.indexOf("DARAUS LERNEN");
  return i < 0 ? "NO LEARN ROW" : d.innerText.slice(i, i + 120).replace(/\n+/g, " | ");
});
console.log("ROW:", row);
await p.getByRole("button", { name: "Ähnlich und Gegenteil" }).first().click(); await p.waitForTimeout(1500);
console.log("requests sent:", JSON.stringify(sent));
const visible = await p.evaluate(() => /Welche Wörter sagt man in Zürich ähnlich wie «gaht's»/.test(document.querySelector('[data-dock="heidi"]').innerText));
console.log("tap appears as the learner's own visible message:", visible);
await p.screenshot({ path: "/home/g/.claude/jobs/74feb87c/tmp/learn-row.png" });
await b.close();
