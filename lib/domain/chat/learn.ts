import type { Answer } from "./types.ts";

/**
 * What a learner would most likely ask next about an answer — offered as one
 * tap, decided WITHOUT the model.
 *
 * Asked for: "ai chat should be better in terms of predicting what next
 * request would be and hence allowing for one tap next action … if it's a
 * word, synonyms, antonyms, word in context, short text".
 *
 * `moves.ts` already offers what to do WITH a message — reply to it, say it
 * warmer, firmer, in the written standard — and the model picks those. These
 * are the other half: what to LEARN from it. And they are decided from the
 * answer's own STRUCTURE, for the reason `withReply` gives in `moves.ts`: "the
 * harness has to be better than the model at this". A model on a free chain
 * having a bad minute forgets instructions; an answer that contains a Zurich
 * line always contains a Zurich line.
 *
 *   a Zurich line in the answer   →  word by word
 *   a word that is genuinely not  →  similar words and the opposite,
 *   the German one (a gloss)         a short text using it, more sentences
 *
 * Nothing for a plain explanation with neither: there is nothing specific to
 * learn from, and a row of generic chips under every answer is a toolbar —
 * the thing `moves.ts` removed the mode switch to avoid.
 *
 * Each chip sends an ordinary visible message, like every move: no hidden
 * prompt channel. The wording lives in `chat.learn`, which the practice
 * explanation reads too, so a tap after a drill and a tap in the chat send the
 * same sentence in the same language.
 */
export type LearnMove =
  | { id: "breakdown"; text: string }
  | { id: "similar"; word: string }
  | { id: "story"; word: string }
  | { id: "examples"; word: string };

export const MAX_LEARN = 3;

function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").trim().toLocaleLowerCase();
}

/**
 * The word most worth learning from this answer.
 *
 * The first gloss whose form is not simply the German word respelled: `gaht's`
 * → `geht es` is worth a question, `Hand` → `Hand` is not. Folding diacritics
 * keeps `Gäld`/`Geld` from counting as different words for this purpose.
 */
export function focusWord(answer: Answer): string | undefined {
  for (const g of answer.glosses ?? []) {
    const form = g.form?.trim();
    if (!form) continue;
    if (!g.standard || fold(form) !== fold(g.standard)) return form;
  }
  return undefined;
}

export function learnMoves(answer: Answer): LearnMove[] {
  const out: LearnMove[] = [];
  const line = answer.dialect?.trim();
  if (line) out.push({ id: "breakdown", text: line });
  const word = focusWord(answer);
  if (word) {
    out.push({ id: "similar", word });
    out.push({ id: "story", word });
    out.push({ id: "examples", word });
  }
  return out.slice(0, MAX_LEARN);
}
