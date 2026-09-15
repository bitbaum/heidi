import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { speechChain, speechConfigured } from "./speech.ts";

describe("where dictation goes", () => {
  test("it is a chain, not a vendor", () => {
    // The whole point of the change. One fetch at one host meant a bad minute
    // at Groq broke dictation outright, with a 502 as the only signal.
    const chain = speechChain();
    assert.ok(chain.length >= 2, "a chain of one is the single point of failure it replaced");
  });

  test("every link transcribes", () => {
    // A chat model at a transcription endpoint answers 404 per link and then
    // reports that every vendor is down.
    for (const link of speechChain()) {
      assert.match(link.model, /whisper/i, `${link.model} does not look like a transcription model`);
      assert.match(link.provider.baseUrl, /^https:\/\//);
    }
  });

  test("turbo leads", () => {
    // Measured as strong on German and the cheapest option that is — which is
    // the pairing dictation needs, since the learner is speaking the language
    // they already have rather than the one they are learning.
    assert.equal(speechChain()[0].model, "whisper-large-v3-turbo");
  });

  test("it claims no share of the token pool", () => {
    // Transcription bills by audio seconds, not tokens. Claiming capacity here
    // would hand out shares of a budget this work never spends, and fair-share
    // would ration the chat against money that was never at stake.
    for (const link of speechChain()) assert.equal(link.provider.dailyTokens, 0);
  });

  test("a deployment with no key says so rather than failing mid-request", () => {
    assert.equal(speechConfigured({}), false);
    assert.equal(speechConfigured({ GROQ_API_KEY: "   " }), false);
    assert.equal(speechConfigured({ GROQ_API_KEY: "gsk-x" }), true);
  });

  test("the key env the chain reads is the one `speechConfigured` checks", () => {
    // Two names for the same secret is a route that reports itself configured
    // and then finds no key on every link.
    for (const link of speechChain()) {
      assert.equal(speechConfigured({ [link.provider.keyEnv]: "x" }), true);
    }
  });

  test("each link carries its own provider object", () => {
    // Shared mutable state across links is how one link's failure bookkeeping
    // silently edits another's.
    const chain = speechChain();
    assert.notEqual(chain[0].provider, chain[1].provider);
  });
});
