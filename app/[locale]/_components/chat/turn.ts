import type { ChatMessage } from "../../../../lib/domain/chat/types.ts";

/**
 * The pure parts of one chat turn, apart from React so they can be tested.
 *
 * `conversationTransport` and `groupTransport` get BOTH rows back from the
 * server: the reader's own stored message and Heidi's reply. `run()` has
 * already drawn the reader's message optimistically, so appending the server's
 * copy as well showed it twice — and when the model gave no reply, the reader
 * saw their message twice and nothing else.
 */

/**
 * Fold a successful result into the transcript.
 *
 * - the optimistic copy (`localId`) is REPLACED by the server's stored row, so
 *   the id is the real one and nothing is shown twice;
 * - every other row is appended;
 * - a transport that returns only Heidi's reply (stateless, streaming) leaves
 *   the optimistic message as it is;
 * - on a retry the question is already on screen and the stored copy of it is
 *   dropped, as before.
 */
export function mergeStored(
  prev: ChatMessage[],
  { localId, stored, me, retry }: { localId: string; stored: ChatMessage[]; me: string; retry: boolean },
): ChatMessage[] {
  const own = stored.filter((m) => m.authorId === me);
  const others = stored.filter((m) => m.authorId !== me);
  if (retry || own.length === 0) return [...prev, ...others];
  const [first, ...extra] = own;
  const swapped = prev.map((m) => (m.id === localId ? first : m));
  return [...swapped, ...extra, ...others];
}

/**
 * The solo route says outright when it stored the reader's message but made no
 * reply. Absent (an older server, or any other route) is NOT a failure.
 */
export function wasUnanswered(data: { answered?: unknown } | null): boolean {
  return data?.answered === false;
}

/** A guard that lets one turn through at a time, readable in the same tick. */
export function createTurnGate() {
  let open = false;
  return {
    /** True if the caller may start a turn; false if one is already running. */
    enter(): boolean {
      if (open) return false;
      open = true;
      return true;
    },
    leave() {
      open = false;
    },
  };
}
