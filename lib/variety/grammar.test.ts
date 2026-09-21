import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { check } from "./check.ts";
import { ZURICH_GERMAN } from "./packs/gsw-zh.ts";
import { DISPLAY } from "./display.ts";
import { systemPrompt } from "./prompt.ts";
import { getDictionary } from "../i18n/index.ts";
import { LOCALES } from "../i18n/locales.ts";

/**
 * The grammar area is a join between two files: the pack holds the forms and
 * the dictionaries hold the words, keyed by topic id. A join has exactly one
 * interesting failure — a key on one side and not the other — and it fails
 * silently, as a topic that renders nothing or a heading with no examples.
 */
describe("grammar topics", () => {
  const topics = ZURICH_GERMAN.grammar ?? [];

  test("the pack has topics at all", () => {
    assert.ok(topics.length >= 4, "the page exists to hold these; an empty one is a promise unkept");
  });

  test("every topic has its words in every language", () => {
    // Adding a topic without translating it renders a heading for a section
    // with nothing in it — in six languages, silently, because the author
    // checked German.
    for (const locale of LOCALES) {
      const t = getDictionary(locale).grammar;
      for (const topic of topics) {
        const words = t.topics[topic.id as keyof typeof t.topics];
        assert.ok(words, `${locale} has no words for "${topic.id}"`);
        assert.ok(words.title.trim(), `${locale}.${topic.id} has no title`);
        assert.ok(words.rule.trim(), `${locale}.${topic.id} has no rule`);
        assert.ok(words.watch.trim(), `${locale}.${topic.id} does not say what trips people`);
      }
      assert.ok(t.title.trim() && t.lead.trim() && t.ruleLabel.trim() && t.watchLabel.trim());
    }
  });

  test("no dictionary describes a topic the pack does not have", () => {
    // The other direction of the same join: words nobody will ever see,
    // translated seven times.
    const known = new Set(topics.map((t) => t.id));
    for (const locale of LOCALES) {
      for (const id of Object.keys(getDictionary(locale).grammar.topics)) {
        assert.ok(known.has(id), `${locale} explains "${id}", which is not in the pack`);
      }
    }
  });

  test("ids are URL-safe and stable-looking", () => {
    // They are anchors and the argument of a `grammar` move, so an answer can
    // hand one out and expect it to still resolve later.
    for (const topic of topics) {
      assert.match(topic.id, /^[a-z][a-z0-9-]*$/, `"${topic.id}" is not a usable URL fragment`);
    }
  });

  test("every topic shows a real contrast, more than once", () => {
    for (const topic of topics) {
      assert.ok(topic.examples.length >= 2, `${topic.id}: one example is an anecdote`);
      for (const example of topic.examples) {
        assert.ok(example.target.trim(), `${topic.id} has an example with no dialect form`);
        assert.ok(example.bridge.trim(), `${topic.id} has an example with nothing to compare it to`);
        assert.notEqual(
          example.target.trim(),
          example.bridge.trim(),
          `${topic.id}: a pair that is identical demonstrates nothing`,
        );
      }
    }
  });

  test("our own dialect examples pass our own dialect gate", () => {
    // The same rule the site's Swiss German copy is held to. If Heidi's
    // grammar page cannot pass Heidi's checker, either the checker is wrong or
    // the page is, and we would rather find out here than have a Zurich reader
    // find it on a page about Zurich grammar.
    for (const topic of topics) {
      for (const example of topic.examples) {
        const verdict = check(example.target, ZURICH_GERMAN);
        assert.equal(
          verdict.ok,
          true,
          `${topic.id}: "${example.target}" — ${verdict.findings.map((f) => f.form).join(", ")}`,
        );
      }
    }
  });

  test("the display projection carries the forms and no English", () => {
    assert.equal(DISPLAY.grammar.length, topics.length);
    for (const topic of DISPLAY.grammar) {
      /**
       * `band` joined `id` and `examples`, and it belongs here for the same
       * reason they do: it is a CLOSED KEY, not prose. The grammar index
       * groups the topics by it and the dictionaries hold the heading each
       * band renders under — exactly the split the topic titles already make.
       *
       * The list stays exhaustive rather than becoming a "must not contain
       * `note`" check. An allow-list fails when somebody adds a field; a
       * deny-list passes until somebody adds the wrong one, which is the
       * failure this test exists to prevent.
       */
      assert.deepEqual(
        Object.keys(topic).sort(),
        ["band", "examples", "id"],
        "nothing else survives the projection",
      );
    }
  });

  test("nothing links to a grammar topic as an anchor any more", () => {
    /**
     * A SOURCE SCAN, for the reason `header.test.ts` gives: this project has
     * no jsdom, and what can be checked cheaply and exactly is whether the
     * files say the wrong thing.
     *
     * Topics became PAGES. While they were sections of one document, a link
     * was `/grammar#no-preterite`; now that is a page with no such anchor, so
     * the link silently lands at the top of the index and the reader has to
     * find the topic themselves. Nothing 404s, nothing throws, and no type is
     * wrong — which is precisely why it survived the split in four places,
     * including the chat's own grammar button, the product's main loop.
     */
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) walk(path);
        else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) files.push(path);
      }
    };
    walk("app");

    const offenders = files.filter((file) => /href\(locale, "grammar"\)\}#/.test(readFileSync(file, "utf8")));
    assert.deepEqual(offenders, [], `these link to a topic anchor that no longer exists:\n${offenders.join("\n")}`);
  });

  test("every topic tells the model when it is the right one", () => {
    /**
     * The prompt lists these ids so an answer can offer a button to the page
     * instead of explaining the same structure again. With eight of them, the
     * slug alone is not enough to choose between `articles` and
     * `possessive-dative` for a sentence that involves both — the note is what
     * makes the choice a reading rather than a guess.
     *
     * A topic added without one silently degrades every answer that should
     * have pointed at it, and nothing else would notice.
     */
    for (const topic of topics) {
      assert.ok(topic.note, `${topic.id} has no note, so the model must guess from the slug`);
      assert.ok(
        (topic.note ?? "").length > 20,
        `${topic.id}'s note is too short to distinguish it from the others`,
      );
    }
  });

  test("the notes reach the prompt, and only the prompt", () => {
    // Half the guarantee is in the projection test above — `note` does not
    // survive into DISPLAY. This is the other half: it is actually used.
    const prompt = systemPrompt(ZURICH_GERMAN);
    for (const topic of topics) {
      assert.ok(prompt.includes(topic.id), `the prompt does not list ${topic.id}`);
      assert.ok(prompt.includes(topic.note ?? ""), `the prompt does not carry ${topic.id}'s note`);
    }
  });
});
