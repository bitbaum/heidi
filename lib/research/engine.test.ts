import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { freeChain } from "@bitbaum/ai-kit";
import { engineChain } from "./engine.ts";

/**
 * The projection keeps what a reader may see and drops the rest.
 *
 * Same discipline as `display.test.ts` one floor up, and for the same reason:
 * a projection whose only guarantee is that somebody remembered to write it
 * carefully will leak the first time a field is added upstream. `ai-kit` owns
 * the chain and will grow fields; this asserts that growth cannot reach the
 * page by accident.
 */
describe("the published model chain", () => {
  test("nothing but provider, host and models survives", () => {
    for (const link of engineChain()) {
      assert.deepEqual(
        Object.keys(link).sort(),
        ["host", "models", "provider"],
        "a field reached the page that the projection does not name",
      );
    }
  });

  test("no environment variable name is published", () => {
    /**
     * `keyEnv` and `modelsEnv` are not secrets and printing them is still free
     * reconnaissance for nothing a reader wants. An exhaustive key check above
     * already covers this; asserting the VALUES too catches the other shape of
     * the mistake — a host or a model id that happens to carry the name.
     */
    const published = JSON.stringify(engineChain());
    for (const link of freeChain()) {
      for (const name of [link.keyEnv, link.modelsEnv, link.dailyTokensEnv]) {
        if (!name) continue;
        assert.ok(!published.includes(name), `the page publishes ${name}`);
      }
    }
  });

  test("the host is a hostname, not a URL with a path on it", () => {
    // The point of printing the host is "this company receives your question".
    // A full base URL with `/openai/v1` on the end is an API detail wearing the
    // costume of a privacy statement.
    for (const link of engineChain()) {
      assert.ok(!link.host.includes("/"), `${link.provider} publishes a path: ${link.host}`);
      assert.ok(!link.host.startsWith("http"), `${link.provider} publishes a scheme: ${link.host}`);
    }
  });

  test("there is more than one provider, which is the point of a chain", () => {
    // One provider is not a chain, it is a dependency — and the failure this
    // whole shape exists to survive is a retired model taking the product down.
    assert.ok(engineChain().length >= 2, "the free chain should have a fallback in it");
  });
});
