/**
 * Handing Heidi a question from anywhere on the site.
 *
 * WHAT IT IS FOR. The reference pages are where a learner stalls — a word in
 * the vocabulary list they cannot place, a grammar topic that does not click —
 * and until now the only thing those pages could do about it was show more
 * text. The chat is the product; the pages next to it were a dead end.
 *
 * WHY AN EVENT AND NOT A CONTEXT. The chat dock lives in the root layout,
 * beside `<main>` rather than inside it, and the buttons that ask things live
 * deep inside server-rendered pages. A React context would work, but it would
 * mean wrapping the entire page tree in a client provider so that two
 * components which never render near each other can agree — a structural
 * coupling that has to be maintained by everyone who touches the layout.
 *
 * An event has no structural constraint at all: the dock listens while it is
 * mounted, any page may ask, and neither imports the other. This module exists
 * so that arrangement is not stringly-typed at the call sites — there is one
 * name and one payload shape, both here.
 *
 * NOT A HIDDEN PROMPT. What is dispatched is the sentence the reader would
 * otherwise have typed, and it lands in the transcript as their own ordinary
 * message. The same rule the one-tap follow-ups already follow: a turn you
 * cannot see is a conversation you cannot re-read.
 */

export const ASK_EVENT = "heidi:ask";

export type AskDetail = { text: string };

/**
 * Ask Heidi something, opening the dock if it is closed.
 *
 * Safe to call during a render pass that never reaches a browser — it simply
 * does nothing on the server, which is what a component that renders in both
 * places needs from it.
 */
export function askHeidi(text: string): void {
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AskDetail>(ASK_EVENT, { detail: { text: trimmed } }));
}

/** Read a dispatched event's text back out, without trusting its shape. */
export function askedText(event: Event): string {
  const detail = (event as CustomEvent<unknown>).detail;
  if (!detail || typeof detail !== "object") return "";
  const text = (detail as Record<string, unknown>).text;
  return typeof text === "string" ? text.trim() : "";
}
