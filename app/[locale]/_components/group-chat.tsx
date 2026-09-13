"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { HEIDI_ID } from "@/lib/domain/chat/types";
import { useByok } from "./use-byok";

type Member = { actorId: string; displayName: string };
type Message = { id: string; authorId: string; body: string; createdAt: string; answer?: unknown };

/**
 * A group conversation with Heidi in it.
 *
 * The thing that makes this different from the solo chat is not the layout —
 * it is that Heidi does NOT answer every message. threadkit's rule, which this
 * product wants, is that in a thread of three or more the assistant waits to
 * be addressed by name, because two humans talking to each other is not an
 * invitation. So a group is mostly people talking, and Heidi arrives when
 * someone writes her name. The hint under the box says so, because a bot that
 * silently declines to answer reads as broken.
 *
 * Messages are polled rather than pushed. A websocket would be better and is
 * not free: it needs a connection the box has to hold open per reader, a
 * reconnect strategy, and a story for what happens when the deploy restarts
 * the process mid-conversation. Polling is honest, survives all three, and can
 * be replaced without changing anything a user sees.
 */
const POLL_MS = 5000;

export function GroupChat({
  groupId,
  t,
  chatT,
  locale,
  me,
  initialMessages,
  initialMembers,
}: {
  groupId: string;
  t: Dictionary["groups"];
  chatT: Dictionary["chat"];
  locale: Locale;
  me: string;
  /** Rendered on the server, so the thread is there on first paint. */
  initialMessages: Message[];
  initialMembers: Member[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const byok = useByok();

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`);
      if (!res.ok) return;
      const data = (await res.json()) as { messages: Message[]; members: Member[] };
      setMessages(data.messages);
      setMembers(data.members);
    } catch {
      // A failed poll is not worth telling anyone about; the next one is in
      // five seconds and the messages already on screen are still true.
    }
  }, [groupId]);

  // Only the interval. The first thread came from the server, so there is no
  // fetch-on-mount here and no empty flash before it arrives.
  useEffect(() => {
    const timer = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const nameFor = useCallback(
    (actorId: string) => {
      if (actorId === HEIDI_ID) return "Heidi";
      return members.find((m) => m.actorId === actorId)?.displayName ?? actorId;
    },
    [members],
  );

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    setInput("");
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, locale, byok: byok.config }),
      });
      if (!res.ok) {
        setError(t.failed);
        return;
      }
      // The response carries what was just written — including Heidi's reply
      // when she took a turn — so the thread updates without waiting for the
      // next poll.
      const data = (await res.json()) as { messages: Message[] };
      setMessages((prev) => [...prev, ...data.messages]);
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label={t.title} className="flex w-full flex-col">
      <div
        className="flex min-h-48 flex-col gap-3 rounded-control border border-border-strong bg-surface-raised p-3 sm:p-4"
        aria-live="polite"
      >
        {messages.map((m) => {
          const mine = m.authorId === me;
          const heidi = m.authorId === HEIDI_ID;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span className="mb-1 font-mono text-[10px] uppercase tracking-caps text-fg-muted">
                {mine ? chatT.you : nameFor(m.authorId)}
              </span>
              <p
                className={`max-w-[85%] whitespace-pre-wrap rounded-control px-3 py-2 text-base leading-relaxed ${
                  heidi
                    ? "border border-border-subtle bg-surface-page text-fg-primary"
                    : mine
                      ? "bg-surface-sunk text-fg-primary"
                      : "bg-surface-page text-fg-primary"
                }`}
              >
                {m.body}
              </p>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="mt-3">
        <div className="flex items-end gap-2 rounded-control border border-border-strong bg-surface-raised p-2 focus-within:border-accent">
          <label htmlFor="group-input" className="sr-only">
            {t.composer}
          </label>
          <input
            id="group-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={2000}
            placeholder={t.composer}
            className="min-h-11 flex-1 bg-transparent px-2 text-base text-fg-primary placeholder:text-fg-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-control bg-accent px-4 font-medium text-on-accent transition-colors disabled:bg-surface-sunk disabled:text-fg-muted"
          >
            {t.send}
          </button>
        </div>
        <p className="mt-2 px-1 font-mono text-[11px] text-fg-muted">{t.heidiHint}</p>
        {error && (
          <p role="alert" className="mt-1 px-1 text-sm text-accent">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
