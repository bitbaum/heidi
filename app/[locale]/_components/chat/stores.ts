import {
  deriveTitle,
  httpConversationStore,
  localConversationStore,
  type ConversationStore,
} from "@bitbaum/chatkit";
import { LEARNER_ID, type ChatMessage } from "@/lib/domain/chat/types";
import { fromRows } from "./chat-app";

/**
 * Where the full chat keeps conversations — chatkit's two reference stores.
 *
 * SIGNED IN, the server: `/api/conversations` is the REST shape chatkit's
 * `httpConversationStore` was generalised from. The messages route already
 * writes both rows of a turn, so `serverWritesTurns` — nothing is stored
 * twice. The one mapping left is the row itself: Heidi's rows are
 * `{ authorId, body, answer }`, and `fromRows` turns them into the thread's
 * `{ role, content }` with the checked `Answer` riding along.
 *
 * SIGNED OUT, the device — and nothing anonymous reaches the database. The key
 * is declared in `lib/config/privacy.ts` (`deviceConversations`), which is what
 * lets the settings page's delete-everything reach it.
 */
export const DEVICE_CHATS_KEY = "heidi.chats";

/** Which conversation a reload reopens — declared as `openChat`. */
export const OPEN_CHAT_KEY = "heidi.chat.open.v1";

export function serverStore(): ConversationStore {
  const base = httpConversationStore({ baseUrl: "/api/conversations", serverWritesTurns: true });
  return {
    ...base,
    async get(id) {
      const conversation = await base.get(id);
      return conversation && { ...conversation, messages: fromRows(conversation.messages) };
    },
  };
}

export function deviceStore(): ConversationStore {
  return localConversationStore({ key: DEVICE_CHATS_KEY });
}

/**
 * A thread the home card or the dock kept in this browser, moved into the
 * device store as a conversation of its own. Returns its id.
 */
export async function adoptDraft(store: ConversationStore, messages: readonly ChatMessage[]): Promise<string> {
  const first = messages.find((m) => m.authorId === LEARNER_ID && m.body.trim());
  const created = await store.create({ title: deriveTitle(first?.body ?? "") ?? "" });
  for (const message of fromRows(messages)) await store.append(created.id, message);
  return created.id;
}
