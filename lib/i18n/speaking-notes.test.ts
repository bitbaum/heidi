import { test } from "node:test";
import assert from "node:assert/strict";
import { getDictionary } from "./index.ts";
import { LOCALES } from "./locales.ts";
import { NOTE_WORDING, NUMERIC_NOTES, type PlainNoteId } from "./speaking-notes.ts";
import { NOTE_IDS } from "../domain/speaking/feedback.ts";

/**
 * The join between what the domain produces and what a reader sees.
 *
 * The chat's suggestion chips already made this argument and this is the same
 * one: a label the model wrote itself arrives in whatever language it felt
 * like and cannot be tested, so the vocabulary is closed and the wording lives
 * in the dictionaries. That only buys anything if something checks that every
 * id HAS wording, in every language — otherwise adding a note renders a blank
 * line in six locales and the one person who reads German never finds out.
 */

test("every note the domain can produce has a sentence in every language", () => {
  for (const id of NOTE_IDS) {
    if (id === "foreign-form" || id === "nothing-flagged") continue;
    const key = NOTE_WORDING[id as PlainNoteId];
    assert.ok(key, `${id} has no wording key`);

    for (const locale of LOCALES) {
      const wording = getDictionary(locale).speaking.notes[key];
      assert.equal(typeof wording, "string", `${locale}.speaking.notes.${key} is missing`);
      assert.ok(wording.trim().length > 0, `${locale}.speaking.notes.${key} is empty`);
    }
  }
});

test("NOTE_WORDING covers the closed set exactly — no spares, no gaps", () => {
  const mapped = new Set(Object.keys(NOTE_WORDING));
  const expected = NOTE_IDS.filter((id) => id !== "foreign-form" && id !== "nothing-flagged");

  for (const id of expected) assert.ok(mapped.has(id), `${id} is in NOTE_IDS but has no wording`);
  for (const key of mapped) {
    assert.ok(
      (NOTE_IDS as readonly string[]).includes(key),
      `${key} has wording but is not a note the domain can produce`,
    );
  }
});

test("a note that carries a number has somewhere to put it, in every language", () => {
  // A translation that quietly drops `{n}` reads as a complete sentence and
  // silently loses the measurement — the one thing the note existed to carry.
  for (const id of NUMERIC_NOTES) {
    const key = NOTE_WORDING[id];
    for (const locale of LOCALES) {
      const wording = getDictionary(locale).speaking.notes[key];
      assert.ok(wording.includes("{n}"), `${locale}.speaking.notes.${key} lost its {n} placeholder`);
    }
  }
});

test("a note that does NOT carry a number has no orphan placeholder", () => {
  const plain = Object.keys(NOTE_WORDING).filter(
    (id) => !(NUMERIC_NOTES as readonly string[]).includes(id),
  ) as PlainNoteId[];

  for (const id of plain) {
    const key = NOTE_WORDING[id];
    for (const locale of LOCALES) {
      const wording = getDictionary(locale).speaking.notes[key];
      assert.ok(!wording.includes("{n}"), `${locale}.speaking.notes.${key} has a {n} nothing will fill`);
    }
  }
});

test("the foreign-form templates keep every slot they interpolate", () => {
  for (const locale of LOCALES) {
    const t = getDictionary(locale).speaking;
    for (const slot of ["{form}", "{origin}", "{suggest}"]) {
      assert.ok(t.foreignForm.includes(slot), `${locale}.speaking.foreignForm lost ${slot}`);
    }
    // The plain variant is the one used when the pack offers no replacement,
    // so a `{suggest}` in it would render the literal braces at a learner.
    assert.ok(t.foreignFormPlain.includes("{form}"), `${locale}.speaking.foreignFormPlain lost {form}`);
    assert.ok(
      !t.foreignFormPlain.includes("{suggest}"),
      `${locale}.speaking.foreignFormPlain promises a suggestion it is never given`,
    );
  }
});

/**
 * §8, checked in the copy rather than only in the code.
 *
 * The measurement code has its own test that no field reads as a rating. This
 * is the other half: the product could obey that perfectly and still put
 * "your score" on the screen, because the screen is written in seven
 * dictionaries by hand.
 */
test("no speaking copy in any language offers a score", () => {
  const banned: Record<string, RegExp> = {
    de: /\b(Punktzahl|Bewertung|Prozent|Aussprachenote)\b/i,
    en: /\b(score|rating|percent|grade)\b/i,
    fr: /\b(score|note de prononciation|pourcentage)\b/i,
    it: /\b(punteggio|percentuale)\b/i,
    rm: /\b(puncts|pertschient)\b/i,
    ru: /\b(балл|баллов|оценка произношения|процент)\b/i,
    gsw: /\b(Punktzahl|Bewertig|Prozänt)\b/i,
  };

  for (const locale of LOCALES) {
    const speaking = getDictionary(locale).speaking;
    const all = JSON.stringify(speaking);
    const pattern = banned[locale];
    if (!pattern) continue;
    const found = all.match(pattern);
    assert.equal(
      found,
      null,
      `${locale} speaking copy says "${found?.[0]}" — §8 forbids selling a mark on somebody's speech`,
    );
  }
});
