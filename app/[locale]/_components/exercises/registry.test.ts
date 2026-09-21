import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { KINDS } from "../../../../lib/domain/practice/kinds/registry.ts";

/**
 * The join between the two registries.
 *
 * Generation lives in `lib/domain/practice/kinds/` and cannot import a
 * component; rendering lives in `registry.tsx` and must not import a
 * generator. They meet at the kind id, and the failure is silent in both
 * directions: a kind with no view renders nothing inside a card that still
 * counts towards the session, and a view for a kind nothing generates is dead
 * code that looks maintained.
 *
 * A SOURCE SCAN, for the reason `header.test.ts` gives: this project has no
 * jsdom and no testing-library, and buying both to assert that an object has
 * seven keys would spend Heidi's zero-UI-dependency position on one test. What
 * can be checked cheaply and exactly is whether the file names every kind.
 */
const REGISTRY = readFileSync(fileURLToPath(new URL("./registry.tsx", import.meta.url)), "utf8");

describe("the exercise view registry", () => {
  test("names every kind the generators can produce", () => {
    for (const kind of KINDS) {
      assert.match(
        REGISTRY,
        new RegExp(`\\b${kind.id}:\\s*\\w+View`),
        `no view is registered for "${kind.id}", so its questions would render an empty card`,
      );
    }
  });

  test("names nothing the generators cannot produce", () => {
    // The other direction: a view kept for a kind that no longer exists is
    // dead code wearing the clothes of a feature.
    const known = new Set(KINDS.map((kind) => kind.id));
    for (const [, id] of REGISTRY.matchAll(/^\s{2}(\w+):\s*\w+View,/gm)) {
      assert.ok(known.has(id as never), `a view is registered for "${id}", which no kind generates`);
    }
  });

  test("every view owns its own keyboard, or binds none", () => {
    /**
     * THE BUG THIS FILE EXISTS FOR, pinned.
     *
     * While one component rendered every kind, the keyboard handler was a
     * chain of `item.kind ===` with a fallthrough — and the fallthrough was
     * the self-marked branch, where Enter means "I knew it". Adding `match`
     * therefore shipped a grid that a single Enter answered correctly, in the
     * same commit as the feature.
     *
     * The structural fix is that a view binds its OWN keys or none at all, so
     * there is no shared handler left to fall through. This asserts that no
     * `keydown` listener survives outside the views — if one comes back, it is
     * a shared handler again and the same failure is available.
     */
    const session = readFileSync(
      fileURLToPath(new URL("../practice-session.tsx", import.meta.url)),
      "utf8",
    );
    assert.ok(
      !session.includes("keydown"),
      "the session component binds keys again; a shared handler is how a kind inherits another kind's meaning",
    );
  });
});
