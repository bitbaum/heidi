import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { partialField } from "./partial.ts";
import { extractJson } from "./parse.ts";

/**
 * The live preview, character by character.
 *
 * The important cases are all mid-token: streaming means this function is
 * called on every prefix of the answer, so every prefix has to produce
 * something showable or nothing at all — never a stray brace, never half an
 * escape sequence.
 */

const ANSWER = `{"mode":"understand","text":"Sie fragen, ob Sie am Samstag Zeit haben.","dialect":"Häsch am Samschtig Ziit?","glosses":[]}`;

describe("partialField", () => {
  test("reads the field once the answer is whole", () => {
    assert.equal(partialField(ANSWER), "Sie fragen, ob Sie am Samstag Zeit haben.");
  });

  test("reads a value that is still being written", () => {
    // The whole reason this exists. `extractJson` cannot do it — see below.
    assert.equal(partialField('{"mode":"understand","text":"Sie fra'), "Sie fra");
    assert.equal(partialField('{"mode":"understand","text":"'), "");
  });

  test("EVERY prefix of a real answer is showable", () => {
    /**
     * The property that matters under streaming: the function is called on
     * every prefix, so no prefix may produce markup, a brace, a quote or half
     * an escape. And what it returns must only ever GROW — a preview that went
     * backwards would look like the answer being retyped.
     */
    let previous = "";
    for (let i = 0; i <= ANSWER.length; i++) {
      const shown = partialField(ANSWER.slice(0, i));
      assert.ok(!shown.includes('"'), `prefix ${i} leaked a quote: ${shown}`);
      assert.ok(!shown.includes("{") && !shown.includes("}"), `prefix ${i} leaked a brace`);
      assert.ok(!shown.endsWith("\\"), `prefix ${i} ended on half an escape`);

      // Growth, until the field is complete and the scan moves past it.
      if (shown && previous && shown.length < previous.length) {
        assert.ok(
          previous.startsWith(shown) === false,
          `prefix ${i} shrank the preview from ${previous.length} to ${shown.length}`,
        );
      }
      if (shown) previous = shown;
    }
    assert.equal(previous, "Sie fragen, ob Sie am Samstag Zeit haben.");
  });

  test("nothing before the field has started", () => {
    assert.equal(partialField(""), "");
    assert.equal(partialField("{"), "");
    assert.equal(partialField('{"mode":"underst'), "");
    assert.equal(partialField('{"mode":"understand"'), "");
  });

  test("decodes escapes, and never shows half of one", () => {
    assert.equal(partialField('{"text":"a\\nb"}'), "a\nb");
    assert.equal(partialField('{"text":"sagte \\"ja\\""}'), 'sagte "ja"');
    assert.equal(partialField('{"text":"\\u00e4hnlich"}'), "ähnlich");
    // Cut mid-escape: show what is safe, not a backslash.
    assert.equal(partialField('{"text":"a\\'), "a");
    assert.equal(partialField('{"text":"a\\u00'), "a");
  });

  test("a key inside a pasted string is not mistaken for ours", () => {
    /**
     * People paste text they did not write, and occasionally that text is
     * JSON. A regex for `"text"\s*:\s*"` would read the pasted one; this
     * tracks string state, so it does not.
     */
    const withPaste = '{"mode":"answer","note":"they sent me {\\"text\\":\\"gotcha\\"}","text":"Das ist JSON."}';
    assert.equal(partialField(withPaste), "Das ist JSON.");
  });

  test("a nested field of the same name is not read", () => {
    // `glosses[0].text` is not the answer's explanation.
    assert.equal(partialField('{"glosses":[{"text":"nope"}],"text":"yes"}'), "yes");
  });

  test("another field can be asked for, though only `text` is ever streamed", () => {
    assert.equal(partialField(ANSWER, "dialect"), "Häsch am Samschtig Ziit?");
  });
});

describe("why extractJson is not used for this", () => {
  test("the repairing parser discards a string that is still being written", () => {
    /**
     * Pinned because it is the reason `partial.ts` exists at all, and because
     * somebody will reasonably ask why. `extractJson` repairs by cutting back
     * to the last COMPLETE value — correct for recovering a truncated answer,
     * useless for a live one: the explanation would appear in one jump when
     * its closing quote arrived.
     */
    const midway = '{"mode":"understand","text":"Sie fragen, ob';
    const repaired = extractJson(midway) as Record<string, unknown>;
    assert.equal(repaired.mode, "understand");
    assert.equal(repaired.text, undefined, "extractJson drops the half-written string");

    // Which this one shows.
    assert.equal(partialField(midway), "Sie fragen, ob");
  });
});
