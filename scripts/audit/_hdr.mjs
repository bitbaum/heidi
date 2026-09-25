import { chromium } from "playwright";
const b = await chromium.launch();
for (const w of [320, 390, 834, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto("http://localhost:3000/de/grammar", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const header = document.querySelector("header");
    const btn = [...header.querySelectorAll("button[type=submit]")].find((b) => b.getAttribute("aria-label"));
    const out = [];
    for (const el of header.querySelectorAll("a, button")) {
      const r = el.getBoundingClientRect(); if (!r.width) continue;
      if (r.right > innerWidth + 0.5 || r.left < -0.5) out.push(el.innerText.trim() || el.getAttribute("aria-label"));
    }
    const small = [...header.querySelectorAll("a, button")].filter((el) => { const r = el.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); })
      .map((el) => `${(el.innerText.trim() || el.getAttribute("aria-label") || "?").slice(0,14)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
    const rb = btn?.getBoundingClientRect();
    return { signIn: btn ? `visible ${Math.round(rb.width)}x${Math.round(rb.height)} "${btn.innerText.trim() || "(icon)"}" name="${btn.getAttribute("aria-label")}"` : "NOT IN BAR",
             crossesEdge: out, under44: small, pageScrollsSideways: document.documentElement.scrollWidth > innerWidth };
  });
  console.log(String(w).padStart(4) + "px", JSON.stringify(r));
  await p.screenshot({ path: `/home/g/.claude/jobs/74feb87c/tmp/hdr-${w}.png`, clip: { x: 0, y: 0, width: w, height: 90 } });
  await p.close();
}
await b.close();
