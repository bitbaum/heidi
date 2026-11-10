// Rasterises app/icon.svg into the two files browsers ask for by name and no
// link tag can redirect: /favicon.ico (16, 32 and 48 px, PNG-in-ICO) and
// /apple-touch-icon.png (180 px, opaque, the mark inside iOS's safe area; the
// same file is app/apple-icon.png, which Next links from every page).
//
//   node scripts/build-icons.mjs
//
// Run it again whenever app/icon.svg changes; the outputs are committed.
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const svg = readFileSync(new URL("../app/icon.svg", import.meta.url), "utf8");
const browser = await chromium.launch();

async function render(size, { background, inset }) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const mark = Math.round(size * (1 - 2 * inset));
  await page.setContent(
    `<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:${background}">` +
      svg.replace("<svg ", `<svg style="width:${mark}px;height:${mark}px" `) +
      `</body>`,
  );
  const png = await page.screenshot({ omitBackground: background === "transparent" });
  await page.close();
  return png;
}

// ICO: a 6-byte header, one 16-byte directory entry per image, then the PNGs.
const sizes = [16, 32, 48];
const pngs = [];
for (const size of sizes) pngs.push(await render(size, { background: "transparent", inset: 0 }));
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((size, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngs[i].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return entry;
});
writeFileSync(new URL("../app/favicon.ico", import.meta.url), Buffer.concat([header, ...entries, ...pngs]));

// iOS draws no transparency and rounds the corners itself.
// Twice: app/apple-icon.png is the one Next links from every page, and
// public/apple-touch-icon.png answers the bare path iOS and crawlers probe.
const apple = await render(180, { background: "#ffffff", inset: 0.1 });
writeFileSync(new URL("../app/apple-icon.png", import.meta.url), apple);
writeFileSync(new URL("../public/apple-touch-icon.png", import.meta.url), apple);

await browser.close();
console.log("wrote app/favicon.ico, app/apple-icon.png and public/apple-touch-icon.png");
