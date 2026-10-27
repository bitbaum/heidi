"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationStore } from "@bitbaum/chatkit";
import { firstLine, isStillGoing } from "@/lib/domain/chat/draft";
import { HEIDI_ID, LEARNER_ID, type ChatMessage } from "@/lib/domain/chat/types";
import type { Locale } from "@/lib/i18n/locales";
import { forgetDraft, readDraft, useDraft } from "../use-draft";
import { adoptDraft, deviceStore } from "./stores";
import type { HeidiMessage } from "./chat-app";

/**
 * What the reader wrote in this browser before — as the full chat offers it.
 *
 * Two places hold it. The home card and the dock keep ONE thread under
 * `heidi.chat.draft.v1` (`use-draft.ts`); the full chat, signed out, keeps a
 * list of them in chatkit's device store (`stores.ts`). The rules are the ones
 * `useRestoreDraft` states for the draft, and they hold for both:
 *
 *   - a thread from a moment ago is simply continued;
 *   - an older one is OFFERED, never put back on its own;
 *   - signed in, nothing on the device is uploaded without a yes.
 */

/** Signed out: carry the home card's or the dock's thread into the full chat. */
export function useDraftHandoff({
  enabled,
  store,
  onOpen,
}: {
  enabled: boolean;
  store: ConversationStore;
  /** Open the conversation the thread became. */
  onOpen: (id: string) => void;
}): { line: string; when: string; resume: () => void } | null {
  const { ready } = useDraft();
  const ran = useRef(false);
  const [offer, setOffer] = useState<{ line: string; when: string; messages: ChatMessage[] } | null>(null);

  const adopt = useCallback(
    async (messages: readonly ChatMessage[]) => {
      const id = await adoptDraft(store, messages);
      // Moved, not copied: the thread now lives in the list, and leaving it in
      // the draft as well would offer it again on the next visit.
      forgetDraft();
      onOpen(id);
    },
    [store, onOpen],
  );

  useEffect(() => {
    if (!enabled || !ready || ran.current) return;
    ran.current = true;
    const stored = readDraft();
    const going = Boolean(stored?.messages.length) && isStillGoing(stored);
    if (stored && going) void adopt(stored.messages);
    // Read directly, like `useRestoreDraft`: the subscribed draft and `ready`
    // are two subscriptions that nothing orders.
    const line = stored && !going ? firstLine(stored) : "";
    setOffer(stored && line ? { line, when: stored.updatedAt, messages: stored.messages } : null);
  }, [enabled, ready, adopt]);

  if (!offer) return null;
  return {
    line: offer.line,
    when: offer.when,
    resume: () => {
      setOffer(null);
      void adopt(offer.messages);
    },
  };
}

/**
 * Signed in: what this browser holds from before signing in — the draft and
 * any signed-out conversations — offered to the account in one prompt.
 */
export function useAdoptOffer({ enabled, locale }: { enabled: boolean; locale: Locale }) {
  const draft = useDraft();
  const [device, setDevice] = useState<{ id: string; title: string; updatedAt: string }[]>([]);
  const [hidden, setHidden] = useState(false);
  const local = useRef<ConversationStore | null>(null);

  useEffect(() => {
    if (!enabled) return;
    local.current = deviceStore();
    let alive = true;
    void local.current.list().then((rows) => {
      if (alive) setDevice(rows.map((r) => ({ id: r.id, title: r.title, updatedAt: String(r.updatedAt) })));
    });
    return () => {
      alive = false;
    };
  }, [enabled]);

  // The FIRST line the learner wrote, so the offer names what it is about —
  // and none at all for a draft that holds no line of theirs.
  const written = draft.draft?.messages.find((m) => m.authorId === LEARNER_ID && m.body.trim());
  const latest = device[0];
  const offer =
    enabled && !hidden && draft.ready && (written || latest)
      ? {
          wrote: written?.body ?? latest?.title ?? "",
          when: written ? (draft.draft?.updatedAt ?? "") : (latest?.updatedAt ?? ""),
        }
      : null;

  /** Import everything; resolves with the last conversation made, or null. */
  const keep = useCallback(async (): Promise<string | null> => {
    let last: string | null = null;
    const pending = draft.draft;
    if (pending && written) {
      last = (await importThread(pending.locale || locale, pending.messages)) ?? last;
      draft.forget();
    }
    const store = local.current;
    for (const row of store ? device : []) {
      const conversation = await store!.get(row.id);
      if (!conversation) continue;
      const messages = (conversation.messages as HeidiMessage[]).map((m) => ({
        authorId: m.role === "user" ? LEARNER_ID : HEIDI_ID,
        body: m.content,
        ...(m.answer ? { answer: m.answer } : {}),
      }));
      const id = await importThread(locale, messages);
      if (!id) continue;
      last = id;
      await store!.remove(row.id);
    }
    setHidden(true);
    return last;
  }, [device, draft, locale, written]);

  const discard = useCallback(() => {
    // As before: the draft is let go. Conversations in the device list stay
    // where they are — "leave it here" is what the button says.
    draft.forget();
    setHidden(true);
  }, [draft]);

  return { offer, keep, discard };
}

async function importThread(locale: string, messages: unknown[]): Promise<string | null> {
  try {
    const res = await fetch("/api/conversations/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale, messages }),
    });
    if (!res.ok) return null;
    const { conversation } = (await res.json()) as { conversation: { id: string } };
    return conversation.id;
  } catch {
    // Left in the browser, which is where it already was. Nothing is lost by a
    // failed adoption, so there is nothing to apologise for.
    return null;
  }
}
