import { chromium } from "playwright";
const b = await chromium.launch();
const ANSWER = { mode: "understand", text: "**Äbe** heisst hier *genau*.\n\n- «gäll» sucht Zustimmung\n- «halt» heisst: nichts zu machen\n\nMehr: [Grammatik](https://heidi.orangecat.ch/de/grammar)",
  glosses: [], suggestions: [], next: [], model: "mock" };

async function openDock(p) {
  await p.goto("http://localhost:3000/de/grammar", { waitUntil: "load" }); await p.waitForTimeout(1500);
  await p.locator('[data-dock="heidi"] button').first().click(); await p.waitForTimeout(500);
  const box = p.locator('[data-dock="heidi"] textarea');
  await box.fill("Was heisst äbe?");
  await box.press("Enter");
}

// 1. markdown
{
  const p = await b.newPage({ viewport: { width: 1000, height: 900 } });
  await p.route("**/api/chat", (r) => r.fulfill({ status: 200, headers: { "content-type": "text/event-stream" },
    body: `event: message\ndata: ${JSON.stringify({ type: "answer", answer: ANSWER })}\n\n` }));
  await openDock(p); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const d = document.querySelector('[data-dock="heidi"]');
    return { strong: d.querySelectorAll("strong").length, em: d.querySelectorAll("em").length, li: d.querySelectorAll("li").length,
      link: d.querySelector('a[href="https://heidi.orangecat.ch/de/grammar"]')?.getAttribute("rel") ?? null,
      literalAsterisks: /\*\*/.test(d.innerText) };
  });
  console.log("MARKDOWN", JSON.stringify(r));
  await p.screenshot({ path: "/home/g/.claude/jobs/74feb87c/tmp/chat-md.png" });
  await p.close();
}
// 2. stop
{
  const p = await b.newPage({ viewport: { width: 1000, height: 900 } });
  let aborted = false;
  await p.route("**/api/chat", async (r) => { await new Promise((res) => setTimeout(res, 15000)); try { await r.fulfill({ status: 200, body: "" }); } catch { aborted = true; } });
  p.on("requestfailed", (req) => { if (req.url().includes("/api/chat")) aborted = true; });
  await openDock(p); await p.waitForTimeout(800);
  const stop = p.locator('[data-dock="heidi"] button[aria-label="Anhalten"]');
  const stopVisible = await stop.count() > 0;
  const t0 = Date.now();
  if (stopVisible) await stop.click();
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const d = document.querySelector('[data-dock="heidi"]');
    return { stoppedBubble: /Angehalten/.test(d.innerText), sendBack: !!d.querySelector('button[aria-label="Senden"], button[type=submit]'), questionKept: /Was heisst äbe\?/.test(d.innerText) };
  });
  console.log("STOP", JSON.stringify({ stopVisible, stoppedIn: Date.now() - t0 + "ms", requestAborted: aborted, ...r }));
  await p.close();
}
await b.close();
