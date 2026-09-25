import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { plural } from "./plural.ts";
import { getDictionary } from "./index.ts";
import { LOCALES } from "./locales.ts";

describe("counts read correctly in every language", () => {
  test("Russian uses its three forms", () => {
    const d = getDictionary("ru").streak.days;
    assert.equal(plural(d, 1, "ru"), "1 день подряд");
    assert.equal(plural(d, 3, "ru"), "3 дня подряд");
    assert.equal(plural(d, 5, "ru"), "5 дней подряд");
    assert.equal(plural(d, 21, "ru"), "21 день подряд");
  });

  test("German says one day, not one days", () => {
    assert.equal(plural(getDictionary("de").streak.best, 1, "de"), "Bestwert: 1 Tag");
    assert.equal(plural(getDictionary("de").streak.best, 4, "de"), "Bestwert: 4 Tage");
  });

  test("every locale fills every count without a stray placeholder", () => {
    for (const l of LOCALES) {
      const s = getDictionary(l).streak;
      for (const n of [0, 1, 2, 5, 11, 21]) {
        for (const forms of [s.days, s.best, s.goalDays]) {
          assert.ok(!plural(forms, n, l).includes("{"), `${l}: ${plural(forms, n, l)}`);
        }
        assert.ok(!plural(s.week, 3, l, { goal: "3" }).includes("{"));
      }
    }
  });
});
