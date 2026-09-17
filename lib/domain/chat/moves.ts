/**
 * What Heidi offers to do next.
 *
 * An answer used to end and leave the learner holding "…and now what?". Every
 * way of resolving that costs them a sentence they have to compose — "can you
 * make that shorter", "how would I reply to this", "say it more politely" —
 * and composing a request ABOUT the answer is a different and harder job than
 * reading it. Most people do not bother, which is why the product felt like a
 * lookup rather than a conversation.
 *
 * The biggest gap it closes is the most obvious one: somebody pastes a message
 * a Swiss colleague sent them, Heidi decodes it beautifully, and never asks
 * whether they need to ANSWER it. That is the actual situation they are in.
 *
 * A CLOSED VOCABULARY, AND WHY THAT IS THE WHOLE DESIGN
 *
 * The model picks ids from this file; the dictionaries supply the wording in
 * seven languages. It would be far easier to let the model write the chip
 * labels itself, and it would be wrong in three separate ways: the label would
 * arrive in whatever language the model felt like, it could promise something
 * pressing it does not do, and it could not be tested — there is no assertion
 * to write about a string that is different every time. Ids are checkable,
 * translatable, and finite.
 *
 * Pressing one sends an ordinary message. There is no side channel, no
 * command protocol and no hidden prompt: the chip is a shortcut for a sentence
 * the person would otherwise have typed, and it appears in the transcript as
 * that sentence. A follow-up you cannot see is a conversation you cannot
 * re-read, and the thread is the product.
 */

/** The kinds of move. Anything not in here is not offered. */
export const MOVE_IDS = ["reply", "rephrase", "grammar"] as const;
export type MoveId = (typeof MOVE_IDS)[number];

/**
 * How a sendable line can be changed.
 *
 * Wider than the two that existed ("shorter", "warmer"), because those are not
 * the two a person most often needs. `firmer` is what you want when your
 * landlord has ignored you twice; `formal` is what an email to an employer
 * needs and a chat message does not. The model picks the two or three that fit
 * THIS message rather than the UI showing all of them — seven permanent chips
 * under every answer is a toolbar, and a toolbar is what the mode switch was
 * removed for.
 */
export const REPHRASE_AXES = [
  "shorter",
  "warmer",
  "firmer",
  "formal",
  "casual",
  "simpler",
  /**
   * The four SPEECH ACTS, as opposed to the six tone dials above.
   *
   * The dials all answer "say the same thing differently". These four change
   * what the message DOES, and they are here because they are the four a
   * learner most often cannot perform in a language they half-have — the
   * point at which people give up and switch to English, or send nothing.
   *
   * `decline` is the one that matters most and the one no phrasebook teaches.
   * Saying no to a landlord, a neighbour or an employer without giving offence
   * is difficult in your OWN language; in a second one, without the register
   * to soften it, a learner either agrees to things they did not want or
   * writes something that reads as rude and never finds out.
   *
   * `apologise` and `thank` are the two Swiss-register moves where the
   * bridge language actively misleads: the German forms a learner already has
   * are either too stiff or too familiar here.
   *
   * `ask` turns a message into a question back — the move for when the thing
   * they received is not clear enough to answer, which is extremely common
   * with official post and which learners almost never think is allowed.
   */
  "decline",
  "apologise",
  "thank",
  "ask",
  /**
   * The odd one out, and the most useful.
   *
   * Not a tone but a VARIETY: give me this in the written standard instead of
   * dialect. It belongs here rather than in its own move because it is the
   * same gesture from the person's side — "say that differently" — and giving
   * it a separate mechanism would mean two ways to ask one question.
   *
   * It is the one people will need most and would never think to ask for,
   * because nothing tells a learner that the language you speak to a
   * neighbour is not the language you write to their insurer.
   */
  "swiss",
] as const;
export type RephraseAxis = (typeof REPHRASE_AXES)[number];

export type NextMove =
  | { id: "reply" }
  | { id: "rephrase"; axis: RephraseAxis }
  /** Opens the grammar topic this answer turned on. `topic` is a pack id. */
  | { id: "grammar"; topic: string };

/**
 * A topic id is checked for SHAPE here and for existence at render time.
 *
 * This module stays free of any dependency on the variety pack, so the shape
 * check is all it can honestly do — and it is the half that matters for
 * safety, since the id becomes a URL fragment. Whether the topic actually
 * exists is the renderer's question, and it answers it by looking the words
 * up: no words, no chip.
 */
const TOPIC = /^[a-z][a-z0-9-]{0,40}$/;

/**
 * At most this many. Three chips is a suggestion; six is a menu, and a menu
 * asks the person to choose all over again.
 */
export const MAX_MOVES = 3;

function isAxis(value: unknown): value is RephraseAxis {
  return typeof value === "string" && (REPHRASE_AXES as readonly string[]).includes(value);
}

/**
 * Validate what the model proposed.
 *
 * Unknown ids are DROPPED rather than rendered, for the same reason the answer
 * decoder drops an unvouched `tone`: a chip we do not recognise is a chip
 * whose label we cannot look up and whose press we cannot honour. Duplicates
 * go too — "shorter" offered twice is one suggestion and one wasted slot.
 */
export function decodeMoves(raw: unknown): NextMove[] {
  if (!Array.isArray(raw)) return [];

  const moves: NextMove[] = [];
  const seen = new Set<string>();

  for (const candidate of raw) {
    if (!candidate || typeof candidate !== "object") continue;
    const m = candidate as Record<string, unknown>;

    let move: NextMove | null = null;
    if (m.id === "reply") move = { id: "reply" };
    else if (m.id === "rephrase" && isAxis(m.axis)) move = { id: "rephrase", axis: m.axis };
    else if (m.id === "grammar" && typeof m.topic === "string" && TOPIC.test(m.topic)) {
      move = { id: "grammar", topic: m.topic };
    }

    if (!move) continue;

    const key =
      move.id === "rephrase" ? `rephrase:${move.axis}` : move.id === "grammar" ? `grammar:${move.topic}` : move.id;
    if (seen.has(key)) continue;
    seen.add(key);

    moves.push(move);
    if (moves.length === MAX_MOVES) break;
  }

  return moves;
}

/**
 * Guarantee the reply offer, whatever the model remembered to do.
 *
 * THE HARNESS HAS TO BE BETTER THAN THE MODEL AT THIS. The system prompt says
 * `reply` "is the most useful button on this list and the easiest to forget",
 * and then asks a model to remember it — on a chain whose whole design is that
 * any vendor may be serving, including a small free one having a bad minute.
 * An instruction is not a guarantee, and this particular omission is invisible:
 * the answer looks complete, and the learner is simply never offered the one
 * thing they actually came for.
 *
 * So when the paste was DETERMINISTICALLY recognised as a message addressed to
 * them — real headers, a real sender; see `email.ts` — the offer is added here
 * rather than hoped for. That condition is the honest limit of what can be
 * decided without a model: somebody who pasted a line of overheard dialect is
 * not owed a reply button, and gets none.
 *
 * FIRST, and within the cap. A move appended after three others would be
 * dropped by the same limit that keeps the row from becoming a menu, so the
 * one move we know belongs goes at the front and something the model guessed
 * at falls off the end instead.
 */
export function withReply(moves: NextMove[]): NextMove[] {
  if (moves.some((m) => m.id === "reply")) return moves;
  const reply: NextMove = { id: "reply" };
  return [reply, ...moves].slice(0, MAX_MOVES);
}

/** The dictionary key a move's label and message live under. */
export function moveKey(move: NextMove): string {
  if (move.id === "rephrase") return move.axis;
  return move.id;
}

/** A stable React key, since two grammar chips differ only by topic. */
export function moveId(move: NextMove): string {
  return move.id === "grammar" ? `grammar:${move.topic}` : moveKey(move);
}
