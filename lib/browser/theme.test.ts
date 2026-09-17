import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_THEME, THEME_KEY, THEME_SCRIPT, THEMES, applyTheme, decodeTheme, isTheme } from "./theme.ts";

describe("theme", () => {
  test("only the three known values are themes", () => {
    assert.deepEqual([...THEMES], ["system", "light", "dark"]);
    assert.ok(isTheme("dark"));
    assert.ok(!isTheme("DARK"));
    assert.ok(!isTheme("sepia"));
    assert.ok(!isTheme(null));
  });

  test("anything unrecognised in storage decodes to system", () => {
    // Storage is data a previous version wrote and the reader can edit by
    // hand, so it is validated exactly like something arriving over a wire.
    assert.equal(decodeTheme("dark"), "dark");
    assert.equal(decodeTheme(null), DEFAULT_THEME);
    assert.equal(decodeTheme("nonsense"), DEFAULT_THEME);
    assert.equal(decodeTheme(""), DEFAULT_THEME);
  });

  test("system REMOVES the attribute rather than naming itself", () => {
    // The stylesheet's dark block is guarded by `:not([data-theme="light"])`.
    // A literal data-theme="system" would satisfy that guard today and is a
    // value the CSS never mentions, so it would break the day someone
    // tightened the selector.
    const calls: string[] = [];
    const root = {
      setAttribute: (name: string, value: string) => calls.push(`set ${name}=${value}`),
      removeAttribute: (name: string) => calls.push(`remove ${name}`),
    } as unknown as HTMLElement;

    applyTheme("system", root);
    assert.deepEqual(calls, ["remove data-theme"]);

    calls.length = 0;
    applyTheme("dark", root);
    assert.deepEqual(calls, ["set data-theme=dark"]);
  });
});

describe("the no-flash script", () => {
  test("it reads the same key the module writes", () => {
    // Generated from the constant rather than written out, so this asserts the
    // generation actually happened rather than that someone typed it twice.
    assert.ok(
      THEME_SCRIPT.includes(JSON.stringify(THEME_KEY)),
      "the inline script must read the key the rest of the code writes",
    );
  });

  test("it cannot throw the page down", () => {
    // localStorage THROWS in a private window and where site data is blocked.
    // This runs before React, so an uncaught throw takes the whole page with it.
    assert.match(THEME_SCRIPT, /try\{/, "the script must be wrapped in try/catch");
    assert.match(THEME_SCRIPT, /catch\(e\)\{\}/, "and must swallow the error rather than rethrow");
  });

  test("it sets only the two explicit themes, never system", () => {
    assert.match(THEME_SCRIPT, /"light"\|\|t==="dark"/);
    assert.ok(!THEME_SCRIPT.includes('"system"'), "system means no attribute at all");
  });

  test("it actually does the thing, run for real", () => {
    /**
     * Proved by EXECUTION rather than by reading the string.
     *
     * A test that greps a script for the word `setAttribute` passes just as
     * well when the script is subtly broken — an unbalanced brace, a typo'd
     * property. This runs it against a stand-in document and checks the root
     * came out stamped, which is the behaviour the page depends on.
     */
    for (const [stored, expected] of [
      // The JSON-quoted form is what `createBrowserStore` actually writes, and
      // reading it as-is was a real bug: `"dark"` never equals `dark`, so the
      // script did nothing and the only symptom was the flash it exists to
      // prevent. Both forms are pinned so neither encoding can drift alone.
      ['"dark"', "dark"],
      ['"light"', "light"],
      ["dark", "dark"],
      ["light", "light"],
      ['"system"', null],
      ["system", null],
      ["nonsense", null],
      [null, null],
    ] as const) {
      let attribute: string | null = null;
      const fakeWindow = {
        localStorage: { getItem: (key: string) => (key === THEME_KEY ? stored : null) },
        document: {
          documentElement: {
            setAttribute: (_name: string, value: string) => {
              attribute = value;
            },
          },
        },
      };
      new Function("localStorage", "document", THEME_SCRIPT)(fakeWindow.localStorage, fakeWindow.document);
      assert.equal(attribute, expected, `stored ${String(stored)} should stamp ${String(expected)}`);
    }
  });

  test("it survives storage that throws, which is the private-window case", () => {
    let attribute: string | null = null;
    const throwing = {
      getItem() {
        throw new Error("The operation is insecure.");
      },
    };
    const document = {
      documentElement: {
        setAttribute: (_name: string, value: string) => {
          attribute = value;
        },
      },
    };
    assert.doesNotThrow(() => new Function("localStorage", "document", THEME_SCRIPT)(throwing, document));
    assert.equal(attribute, null);
  });
});
