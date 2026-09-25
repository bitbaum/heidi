import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Examples never spend the shared free tier.
 *
 * `/api/example` is fired as a side effect of tapping keep — the learner asked
 * to save a word, not for a model call. George, 2026-09-25: free-tier keys are
 * spent only when a person deliberately asks. So the route runs on the
 * learner's own key or not at all.
 *
 * Read as source rather than imported: the route resolves `@/` paths, which
 * the node test runner cannot. The property is structural anyway — the route
 * must not be ABLE to build the free chain, and must leave before `complete()`
 * when no key was brought (ai-kit's `complete()` has no fallback of its own
 * here, so the chain it is handed is the whole question).
 */

const route = readFileSync(new URL("./route.ts", import.meta.url), "utf8");
const hook = readFileSync(new URL("../../[locale]/_components/use-saved.ts", import.meta.url), "utf8");

test("the example route cannot build the free chain", () => {
  assert.doesNotMatch(route, /\b(freeChain|usableChain|freeLinks)\b/);
});

test("with no key brought, the route returns before any model call", () => {
  const guard = route.search(/if \(!byokLinks[^)]*\) return Response\.json\(\{ examples: \[\] \}\)/);
  const call = route.search(/\bcomplete\(\{/);
  assert.ok(guard > 0, "the no-key guard is gone");
  assert.ok(call > guard, "complete() is reachable before the no-key guard");
  assert.match(route, /const \{ chain \} = byokLinks;/);
});

test("the keep button does not ask for examples without a key", () => {
  const skip = hook.search(/if \(!byok\) return;/);
  const fetchAt = hook.indexOf('fetch("/api/example"');
  assert.ok(skip > 0 && fetchAt > skip, "use-saved fetches /api/example without a key");
});
