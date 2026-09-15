"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { useByok } from "./use-byok";
import { Composer } from "./chat/composer";
import { Transcript } from "./chat/transcript";
import { useConversation } from "./chat/use-conversation";
import { fromApi, groupTransport } from "./chat/transports";

type Member = { actorId: string; displayName: string };

/**
 * A group conversation with Heidi in it.
 *
 * What makes this different from the solo chat is not the layout — it is that
 * Heidi does NOT answer every message. threadkit's rule, which this product
 * wants, is that in a thread of three or more the assistant waits to be
 * addressed by name, because two humans talking to each other is not an
 * invitation. So a group is mostly people talking, and Heidi arrives when
 * someone writes her name. The hint under the box says so, because a bot that
 * silently declines to answer reads as broken.
 *
 * It used to render `m.body` as a plain paragraph and ignore `answer`
 * entirely — while the server was storing the whole thing in
 * `group_messages.answer`. Every gloss, suggestion, copy button and keep-word
 * control a group member should have seen has been sitting in the database
 * unrendered since the day groups shipped. Sharing `Transcript` fixes that by
 * construction rather than by remembering to.
 *
 * Messages are polled rather than pushed. A websocket would be better and is
 * not free: a connection held open per reader, a reconnect strategy, and a
 * story for what happens when a deploy restarts the process mid-conversation.
 * Polling survives all three and can be replaced without changing anything a
 * user sees.
 */
const POLL_MS = 5000;

export function GroupChat({
  groupId,
  t,
  chatT,
  modelT,
  locale,
  me,
  initialMessages,
  initialMembers,
}: {
  groupId: string;
  t: Dictionary["groups"];
  chatT: Dictionary["chat"];
  modelT: Dictionary["model"];
  locale: Locale;
  me: string;
  /** Rendered on the server, so the thread is there on first paint. */
  initialMessages: ChatMessage[];
  initialMembers: Member[];
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const byok = useByok();
  const membersRef = useRef<Member[]>(initialMembers);

  const chat = useConversation({
    transport: groupTransport(groupId),
    locale,
    t: chatT,
    imageTooBig: modelT.imageTooBig,
    byok: byok.config,
    initial: initialMessages,
    me,
  });

  const { setMessages } = chat;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`);
      if (!res.ok) return;
      const data = (await res.json()) as { messages: unknown; members: Member[] };
      membersRef.current = data.members;
      setMessages(fromApi(data.messages));
    } catch {
      // A failed poll is not worth telling anyone about; the next one is in
      // five seconds and the messages already on screen are still true.
    }
  }, [groupId, setMessages]);

  // Only the interval. The first thread came from the server, so there is no
  // fetch-on-mount here and no empty flash before it arrives.
  useEffect(() => {
    const timer = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (chat.messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages]);

  const nameFor = useCallback(
    (actorId: string) => membersRef.current.find((m) => m.actorId === actorId)?.displayName ?? actorId,
    [],
  );

  return (
    <section aria-label={t.title} className="flex w-full flex-col">
      <Transcript
        messages={chat.messages}
        me={me}
        t={chatT}
        busy={chat.busy}
        nameFor={nameFor}
        onRetry={chat.retry}
        endRef={endRef}
        className="flex min-h-48 flex-col gap-3 rounded-control border border-border-strong bg-surface-raised p-3 sm:p-4"
      />

      {/* No pictures in a group: an image is sent to whoever is in the room,
          and the attachment path is built for a private thread. Dictation is
          here, because saying something out loud is how a group chat is used. */}
      <Composer
        value={chat.input}
        onChange={chat.setInput}
        onSubmit={() => chat.send(chat.input)}
        busy={chat.busy}
        t={chatT}
        modelT={modelT}
        placeholder={t.composer}
        locale={locale}
        className="mt-3"
        footer={<p className="mt-2 px-1 font-mono text-[11px] text-fg-muted">{t.heidiHint}</p>}
      />
    </section>
  );
}
