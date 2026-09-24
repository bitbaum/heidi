import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { formatDate } from "./dates.ts";
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
});
