/**
 * Checks that every source in the listening register still exists.
 *
 *   node scripts/check-listening-links.mjs
 *   node scripts/check-listening-links.mjs --id telezueri
 *
 * WHY THIS IS A SCRIPT AND NOT A TEST. The register is forty links to other
 * people's websites, and other people's websites go away. A unit test cannot
 * check that, because a test that reaches the network fails on a train and
 * blocks a deploy over somebody else's outage. So the property lives here, is
 * run by a person or a schedule, and produces a decision rather than a colour.
 *
 * THREE VERDICTS, NOT TWO. A checker with a pass and a fail has to call a
 * Cloudflare challenge a dead link, and then either it cries wolf or somebody
 * deletes a perfectly good row. The third verdict is the honest one:
 *
 *   ALIVE     2xx, and the page says who it is.
 *   GONE      404 or 410. The publisher removed it. Fix or drop the row.
 *   UNKNOWN   403, 429, a timeout, a redirect away. Something is in the way.
 *             Look yourself; do not touch the register on this evidence.
 *
 * Only GONE fails the run, which is what makes the exit code worth gating on.
 *
 * A STATUS CODE IS NOT AN IDENTITY. `youtube.com/@srf3` answers 200 and is
 * called "SRF Unterhaltung"; a handle that gets reassigned answers 200 as
 * somebody else entirely. So the page title is compared against the name in
 * the register, and a mismatch is reported — not as a failure, because titles
 * carry taglines and seasons, but loudly enough that a reassigned handle
 * cannot pass unnoticed.
 */

import { LISTENING_SOURCES } from "../lib/listening/sources.ts";

const AGENT = "Mozilla/5.0 (X11; Linux x86_64) heidi-link-check";
const TIMEOUT_MS = 20_000;
/** Politeness, and it keeps us under any per-host rate limit worth having. */
const CONCURRENCY = 4;

const only = process.argv.includes("--id") ? process.argv[process.argv.indexOf("--id") + 1] : null;

/**
 * Strip punctuation and case so "Dini Mundart – Schnabelweid" matches its title.
 *
 * Umlauts are TRANSLITERATED — ü to ue — before anything else, and that is not
 * a nicety. Swiss publishers routinely write their own name both ways: the
 * channel filed here as TeleZüri calls itself `telezueri` in its page title,
 * and a normaliser that decomposed the umlaut to a bare `u` reported its own
 * register as wrong. Decomposition-then-strip is the usual recipe and it is
 * the wrong one for German: `ue` is what the writer meant, not `u`.
 */
function normalise(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Does the page admit to being the thing we filed it as?
 *
 * Deliberately generous: a match on any word of four letters or more that is
 * not a stopword. The strict version rejected "SRF Kids – Zambo" against a
 * title of "Hörspiele für Kinder – SRF Kids" and would have had somebody
 * "fix" a row that was correct.
 */
function looksLikeItself(name, title) {
  if (!title) return null;
  const words = normalise(name)
    .split(" ")
    .filter((w) => w.length >= 4);
  if (words.length === 0) return null;
  const haystack = normalise(title);
  return words.some((w) => haystack.includes(w));
}

async function check(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(source.url, {
      redirect: "follow",
      headers: { "user-agent": AGENT, "accept-language": "de-CH,de;q=0.9" },
      signal: controller.signal,
    });
    const status = response.status;
    if (status === 404 || status === 410) return { verdict: "GONE", status };

    if (!response.ok) return { verdict: "UNKNOWN", status, why: "the host would not serve us" };

    const html = await response.text();
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
    const identity = looksLikeItself(source.name, title);
    return {
      verdict: "ALIVE",
      status,
      title,
      ...(identity === false ? { why: `title does not mention "${source.name}"` } : {}),
      mismatch: identity === false,
    };
  } catch (error) {
    return { verdict: "UNKNOWN", status: 0, why: error.name === "AbortError" ? "timed out" : error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const rows = only ? LISTENING_SOURCES.filter((s) => s.id === only) : LISTENING_SOURCES;
  if (rows.length === 0) {
    console.error(only ? `no source with id "${only}"` : "the register is empty");
    process.exit(2);
  }

  const results = [];
  const queue = [...rows];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        results.push({ source: next, ...(await check(next)) });
      }
    }),
  );

  results.sort((a, b) => a.source.id.localeCompare(b.source.id, "en"));
  for (const r of results) {
    const flag = r.verdict === "ALIVE" ? (r.mismatch ? "ALIVE?" : "ALIVE") : r.verdict;
    const tail = r.why ? `  — ${r.why}` : "";
    console.log(`${flag.padEnd(7)} ${String(r.status).padStart(3)}  ${r.source.id.padEnd(28)}${tail}`);
  }

  const gone = results.filter((r) => r.verdict === "GONE");
  const unknown = results.filter((r) => r.verdict === "UNKNOWN");
  const mismatched = results.filter((r) => r.mismatch);

  console.log(
    `\n${results.length - gone.length - unknown.length} alive, ${gone.length} gone, ${unknown.length} unverifiable` +
      (mismatched.length ? `, ${mismatched.length} whose title does not match the name` : ""),
  );

  if (mismatched.length) {
    console.log("\nOpen these yourself — a handle can be reassigned to somebody else and still answer 200:");
    for (const r of mismatched) console.log(`  ${r.source.id}  ${r.source.url}\n    title: ${r.title}`);
  }
  if (unknown.length) {
    console.log("\nUnverifiable is not dead. Do not edit the register on this evidence:");
    for (const r of unknown) console.log(`  ${r.source.id}  ${r.source.url}  (${r.why})`);
  }
  if (gone.length) {
    console.log("\nGONE — fix the url or drop the row, in a commit that says which:");
    for (const r of gone) console.log(`  ${r.source.id}  ${r.source.url}`);
    process.exit(1);
  }
  console.log(
    `\nNothing is gone. When you have acted on the above, set CHECKED in lib/listening/sources.ts to today.`,
  );
}

await main();
