import { HEIDI_ID, LEARNER_ID, type ChatMessage } from "./types.ts";
import { decodeAnswer } from "./answer.ts";

/**
 * The conversation of someone who has not signed in.
 *
 * It lives in the browser and nowhere else. The alternative — minting a
 * pseudo-actor from a cookie so anonymous rows have an owner — is a tracking
 * id by another name, and it creates rows that nobody can ever authenticate to
 * in order to delete. So: signed out means device-local, with no server copy
 * to ask about.
 *
 * It is also what makes the homepage box and the full-screen chat the same
 * conversation. Expanding does not TRANSFER anything: both surfaces read this
 * store, so the transcript is already there when `/chat` mounts. Passing a
 * transcript in a query string would put it in the access log, the Referer
 * header and browser history — three places a private message has no business
 * being.
 *
 * Pure and tested here; `use-draft.ts` is the wiring.
 */

export const DRAFT_KEY = "heidi.chat.draft.v1";

/**
 * How much of a thread is kept.
 *
 * localStorage is a few megabytes for the whole ORIGIN — shared with saved
 * words and the model settings — and a rich answer is far larger than the
 * sentence that produced it. Truncating is honest here in a way it would not
 * be on the server: this is a convenience cache for one device, not the
 * record. Someone who wants the record signs in.
 */
export const MAX_DRAFT_MESSAGES = 40;

export type Draft = {
  /** Which language Heidi was explaining in. A reopened draft must not switch. */
  locale: string;
  messages: ChatMessage[];
  updatedAt: string;
};

export const EMPTY_DRAFT: Draft = { locale: "", messages: [], updatedAt: "" };

/**
 * Turn stored text back into a draft, or into nothing.
 *
 * Strict on purpose. This is data a previous version of the site wrote, that
 * the reader can edit by hand, and that a later version has to render — so it
 * is validated exactly like something arriving over a wire. A single bad
 * message is dropped; a bad envelope discards the lot, because a draft nobody
 * can read is worth less than a clean start.
 */
export function decodeDraft(raw: string): Draft | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;

  const d = parsed as Record<string, unknown>;
  if (!Array.isArray(d.messages)) return null;

  const messages = d.messages.flatMap(decodeDraftMessage).slice(-MAX_DRAFT_MESSAGES);
  if (messages.length === 0) return null;

  return {
    locale: typeof d.locale === "string" ? d.locale : "",
    messages,
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : "",
  };
}

function decodeDraftMessage(row: unknown): ChatMessage[] {
  if (!row || typeof row !== "object") return [];
  const m = row as Record<string, unknown>;
  if (typeof m.body !== "string") return [];

  // Two roles, and only two. A draft is a private thread, so anything not
  // Heidi is the reader — a stored `authorId` of "system" is either corruption
  // or someone trying their luck, and neither deserves a third bubble style.
  const authorId = m.authorId === HEIDI_ID ? HEIDI_ID : LEARNER_ID;
  const answer = authorId === HEIDI_ID ? decodeAnswer(m.answer) : null;

  // A failed turn is not kept: its error text was in the reader's language at
  // the time and is meaningless once reloaded, and the retry it belongs to is
  // gone. Dropping it leaves the question, which is what they can act on.
  if (!m.body && !answer) return [];

  return [
    {
      id: typeof m.id === "string" && m.id ? m.id : `draft-${authorId}-${messageCounter()}`,
      authorId,
      body: m.body,
      createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date().toISOString(),
      ...(answer ? { answer } : {}),
    },
  ];
}

let counter = 0;
function messageCounter(): number {
  counter += 1;
  return counter;
}

/**
 * What gets written.
 *
 * Failed turns are stripped before storage rather than at read time so the
 * quota is not spent on them, and the cap is applied from the END: the recent
 * half of a conversation is the half a follow-up needs.
 */
export function toDraft(messages: ChatMessage[], locale: string): Draft {
  return {
    locale,
    messages: messages.filter((m) => !m.error && m.body).slice(-MAX_DRAFT_MESSAGES),
    updatedAt: new Date().toISOString(),
  };
}
