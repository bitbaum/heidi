import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { formatDate } from "./dates.ts";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { LOCALES, LOCALE_TAGS } from "./locales.ts";

describe("dates in the reader's language", () => {
  test("every locale formats without throwing, in all styles", () => {
    for (const locale of LOCALES) {
      for (const style of ["long", "short", "numeric"] as const) {
        const out = formatDate("2026-09-24T00:00:00Z", locale, style);
        assert.ok(out.length > 0, `${locale}/${style} produced nothing`);
        assert.ok(out.includes("2026"), `${locale}/${style} lost the year: ${out}`);
      }
    }
  });

  test("an unparseable date is empty, never the words 'Invalid Date'", () => {
    // The failure `workspace.tsx` had already met: a stored draft from before
    // the field existed.
    for (const bad of ["", "not a date", "2026-13-45"]) {
      assert.equal(formatDate(bad, "de"), "", `"${bad}" should render as nothing`);
    }
  });

  test("the Swiss tag is used, not the bare language code", () => {
    /**
     * The bug this module exists to make unrepresentable. With month NAMES the
     * two agree, so asserting on `formatDate`'s current output would pass
     * whether or not the tag were used. Assert on the distinguishing case
     * instead: Swiss French writes a numeric date with dots, France with
     * slashes. If `LOCALE_TAGS` ever stopped being consulted, this is the
     * difference that would appear.
     */
    const d = new Date("2026-09-24T00:00:00Z");
    const swiss = new Intl.DateTimeFormat(LOCALE_TAGS.fr).format(d);
    const france = new Intl.DateTimeFormat("fr").format(d);
    assert.notEqual(swiss, france, "fr-CH and fr agree — this guard has stopped guarding anything");
    assert.ok(swiss.includes("."), `expected Swiss dots, got ${swiss}`);
  });

  test("`numeric` renders exactly what the chat workspace rendered before", () => {
    /**
     * The chat workspace used `at.toLocaleDateString(LOCALE_TAGS[locale])`.
     * Moving it onto the shared formatter must not change a single glyph for
     * any reader — this asserts that against the old expression directly,
     * which is the only way to know a refactor was one.
     */
    const iso = "2026-09-24T00:00:00Z";
    for (const locale of LOCALES) {
      const before = new Date(iso).toLocaleDateString(LOCALE_TAGS[locale]);
      assert.equal(formatDate(iso, locale, "numeric"), before, `${locale} changed`);
    }
  });

  test("long and short really differ, so the argument is not decoration", () => {
    const long = formatDate("2026-09-24T00:00:00Z", "de", "long");
    const short = formatDate("2026-09-24T00:00:00Z", "de", "short");
    assert.notEqual(long, short);
    assert.ok(long.length > short.length, `${long} should be longer than ${short}`);
  });

  test("a date-only string does not slip a day in a western timezone", () => {
    /**
     * `new Date("2026-09-22")` is midnight UTC, so anywhere behind UTC it
     * formats as the 21st. Essays carry `published: "2026-09-20"` and
     * changelog entries `date: "2026-09-22"` — both date-only, both shown to
     * a reader. The changelog page had found this and anchored at noon by
     * hand; this module shipped without the guard until that copy was folded
     * in.
     *
     * Asserting on the DAY NUMBER rather than re-deriving the anchor, so the
     * test fails if the fix is removed rather than moving with it.
     */
    const before = process.env.TZ;
    try {
      process.env.TZ = "America/New_York";
      assert.match(formatDate("2026-09-22", "de", "long"), /22\./);
      assert.match(formatDate("2026-09-20", "en", "short"), /20/);
    } finally {
      process.env.TZ = before;
    }
  });

  test("a full timestamp is left exactly where it is", () => {
    // It names an instant; moving it would invent a different one.
    const out = formatDate("2026-09-22T23:30:00Z", "de", "numeric");
    assert.ok(out.length > 0);
  });

  test("nothing builds its own formatter from a locale variable", () => {
    /**
     * Everything that turns a `Locale` into an `Intl` argument goes through
     * this file, or the bare-code bug comes back one call site at a time —
     * it already had, in `round-list.tsx`, after three others were fixed.
     *
     * A STRING LITERAL is allowed: `lib/domain/speaking` builds `en-CA`
     * formatters to derive machine date keys, which is not reader-facing
     * formatting and must not follow the reader's locale.
     */
    const roots = ["app", "lib"];
    const offences: string[] = [];
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const entry of readdirSync(dir)) {
        if (entry === "node_modules" || entry === ".next") continue;
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) out.push(...walk(path));
        else if (/\.(ts|tsx)$/.test(entry)) out.push(path);
      }
      return out;
    };

    for (const root of roots) {
      for (const path of walk(root)) {
        if (path.endsWith(join("lib", "i18n", "dates.ts"))) continue;
        if (path.endsWith(".test.ts")) continue;
        for (const [i, line] of readFileSync(path, "utf8").split("\n").entries()) {
          const code = line.split("//")[0];
          const m = /new Intl\.DateTimeFormat\(\s*([^,)\s]+)/.exec(code);
          if (!m) continue;
          if (/^["'`]/.test(m[1])) continue; // a literal tag, deliberately fixed
          offences.push(`${path}:${i + 1}  ${line.trim().slice(0, 80)}`);
        }
      }
    }

    assert.deepEqual(
      offences,
      [],
      `these build their own date formatter:\n\n  ${offences.join("\n  ")}\n\n` +
        `Use \`formatDate\` or \`intlDate\` so the Swiss tag is applied in one place.`,
    );
  });
});
