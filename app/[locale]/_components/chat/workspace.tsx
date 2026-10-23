"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatScreen } from "@bitbaum/chatkit/react";
import { LEARNER_ID, type ChatMessage } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import { type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { formatDate } from "@/lib/i18n/dates";
import { useByok } from "../use-byok";
import { useDraft, useRestoreDraft } from "../use-draft";
import { ModelSheet } from "../model-sheet";
import { Composer } from "./composer";
import { EmptyChat } from "./empty-chat";
import { DISPLAY } from "@/lib/variety/display";
import { Transcript } from "./transcript";
import { useConversation } from "./use-conversation";
import { conversationTransport, streamingDraftTransport, type ConversationSummary } from "./transports";
import { ConversationList } from "./conversation-list";
import { WordPick } from "./word-pick";
import { NewChatButton } from "./new-chat-button";
import { MenuIcon } from "./icons";
import { useKeyboardViewport } from "../use-keyboard-viewport";
import { useDismiss } from "../use-dismiss";

/**
 * The chat with room to be a chat.
 *
 * The homepage box is the same conversation in a smaller frame — same
 * transport, same transcript, same composer. What this adds is everything that
 * needs space: the thread you had yesterday, a sidebar to reach it, and a
 * transcript that scrolls inside the viewport instead of growing the page.
 *
 * Two modes, one component, because the difference between them is a transport
 * and a sidebar and genuinely nothing else:
 *
 *   SIGNED OUT — `streamingDraftTransport`, and the thread is kept in this
 *     browser.
 *     No conversation row is created; nothing anonymous reaches the database.
 *   SIGNED IN  — `conversationTransport`, and the server remembers. The
 *     conversation row is created on the FIRST MESSAGE, not when the page
 *     opens, so pressing "new chat" and changing your mind leaves nothing
 *     behind.
 */
export function ChatWorkspace({
  locale,
  dict,
  signedIn,
  signInSlot,
  initialConversations,
  initialConversationId = null,
  initialMessages = [],
}: {
  locale: Locale;
  dict: Dictionary;
  signedIn: boolean;
  /**
   * The sign-in control, rendered by the server page.
   *
   * A NODE rather than an href because signing in is a server action, which is
   * what lets it work with no client JavaScript — the one control that has to
   * survive a bad connection on a tram. Null when OrangeCat is not configured,
   * where a button would dead-end at the code exchange.
   */
  signInSlot: React.ReactNode;
  initialConversations: ConversationSummary[];
  initialConversationId?: string | null;
  /** The thread the server already rendered, when opening a saved one. */
  initialMessages?: ChatMessage[];
}) {
  const t = dict.chat;
  const f = t.full;
  const router = useRouter();
  const byok = useByok();
  const draft = useDraft();
  useKeyboardViewport({ pin: true });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [conversations, setConversations] = useState(initialConversations);
  // Seeded once. Moving between two saved conversations remounts this
  // component rather than updating it — the pages give it a `key` — so there
  // is no stale-prop case to synchronise, and no effect that writes state
  // during render's shadow.
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const endRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  // The backdrop already closes it on a tap beside it.
  useDismiss({ open: menuOpen, onDismiss: closeMenu, containerRef: sidebarRef, focusRef: menuButtonRef, onPointerOutside: false });

  /**
   * The conversation was created by the transport, on the first message.
   *
   * The URL is updated with `history.replaceState` rather than `router.push`
   * or `router.replace`. A real navigation would remount this page mid-send,
   * and the reply — which arrives afterwards — would be delivered to a
   * component that no longer exists. Shallow is what lets the address bar
   * catch up without interrupting the turn in progress, so a reload now lands
   * on the thread.
   */
  const handleCreated = useCallback(
    (conversation: ConversationSummary) => {
      setConversationId(conversation.id);
      setConversations((prev) => [conversation, ...prev]);
      window.history.replaceState(null, "", `${href(locale, "chat")}/${conversation.id}`);
    },
    [locale],
  );

  /**
   * Built from the STATE, not from the prop.
   *
   * The difference is "new chat". Pressing it sets `conversationId` to null,
   * which rebuilds the transport so the next message creates a fresh
   * conversation. Reading the prop instead would leave a transport still
   * pointing at the previous thread — and because the URL was last changed by
   * `history.replaceState` rather than a navigation, the router may not remount
   * this component to correct it. The next message would then be appended to
   * the conversation the person just walked away from.
   */
  const transport = useMemo(
    () =>
      signedIn
        ? conversationTransport({ conversationId, locale, onCreated: handleCreated })
        : // Signed out, the same streaming route the home fold and the dock use,
          // so the explanation appears as it is written. Signed in, the
          // conversation route still answers in one piece: it writes two rows
          // to Postgres before replying, and streaming a turn whose storage has
          // not happened yet would show a reader an answer that could still
          // fail to be saved.
          streamingDraftTransport(),
    [signedIn, conversationId, locale, handleCreated],
  );

  const chat = useConversation({
    transport,
    locale,
    t,
    byok: byok.config,
    initial: initialMessages,
    me: LEARNER_ID,
  });

  const { messages, setMessages } = chat;

  /**
   * Opening shows a fresh, ready box — unless a thread was going a moment ago.
   *
   * Signed out only: a signed-in reader's conversations live on the server and
   * `/chat` is always a new one. The rule, and why an old thread is OFFERED
   * rather than put back, are in `useRestoreDraft`; the dock and the home card
   * run the same code, so the three cannot disagree about what "open" means.
   */
  const { ready: restored, earlier: earlierDraft } = useRestoreDraft(setMessages, !signedIn);

  /**
   * Signed out, the thread IS the storage.
   *
   * Written on every change rather than on unload: `beforeunload` does not
   * fire reliably when a tab is discarded on mobile, and losing the
   * conversation is the exact failure this exists to prevent.
   *
   * NOT before the restore has run. Without that guard this effect fires on
   * mount with an empty `messages`, which replaced the very draft the restore
   * is about to read — found by reloading the page and watching the
   * conversation vanish, having "persisted" it a moment earlier.
   */
  const keepDraft = draft.keep;
  useEffect(() => {
    if (signedIn || !restored) return;
    keepDraft(messages, locale);
  }, [signedIn, restored, messages, locale, keepDraft]);

  useEffect(() => {
    if (messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Ready to type on a laptop. Not on a phone: focusing there opens the
  // keyboard over the examples before the reader has decided anything.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  const openConversation = useCallback(
    (id: string) => {
      setMenuOpen(false);
      router.push(`${href(locale, "chat")}/${id}`);
    },
    [locale, router],
  );

  const startNew = useCallback(() => {
    setConversationId(null);
    setMenuOpen(false);
    chat.reset();
    if (!signedIn) draft.forget();
    router.push(href(locale, "chat"));
  }, [chat, draft, locale, router, signedIn]);

  const rename = useCallback(async (id: string, title: string) => {
    // Optimistic: a rename that cannot fail in any way the reader can act on
    // should not make them wait to see their own words.
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    }).catch(() => {});
  }, []);

  const remove = useCallback(
    async (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      await fetch(`/api/conversations/${id}`, { method: "DELETE" }).catch(() => {});
      if (conversationId === id) startNew();
    },
    [conversationId, startNew],
  );

  const adopt = useCallback(async () => {
    const pending = draft.draft;
    if (!pending) return;
    try {
      const res = await fetch("/api/conversations/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: pending.locale || locale, messages: pending.messages }),
      });
      if (!res.ok) return;
      const { conversation } = (await res.json()) as { conversation: ConversationSummary };
      draft.forget();
      setConversations((prev) => [conversation, ...prev]);
      router.push(`${href(locale, "chat")}/${conversation.id}`);
    } catch {
      // Left in the browser, which is where it already was. Nothing is lost by
      // a failed adoption, so there is nothing to apologise for.
    }
  }, [draft, locale, router]);

  const started = messages.length > 0;

  /**
   * The row under the question: the conversation you had before.
   *
   * Signed in, that is the most recent saved one — from the server's list as
   * of arriving here, so pressing "new chat" does not immediately offer the
   * conversation you just walked away from. It is for ARRIVAL: gone for good
   * once anything is written, and never on a saved thread's own page.
   * Signed out it is the device's last thread (`useRestoreDraft`).
   */
  const [arrival, setArrival] = useState(true);
  if (started && arrival) setArrival(false);
  const latest = initialConversations[0];
  const earlier =
    signedIn && arrival && initialConversationId === null && latest
      ? { line: latest.title.trim() || f.untitled, when: latest.updatedAt, resume: () => openConversation(latest.id) }
      : signedIn
        ? null
        : earlierDraft;
  /**
   * What the learner actually wrote before signing in — the FIRST turn of
   * theirs, which is what makes the offer recognisable.
   *
   * REPORTED AS "odd", and it was. The prompt said "you wrote something before
   * you signed in" and then named nothing: no line from it, no date. A draft
   * survives in the browser indefinitely, so the thing being offered could be
   * from ten minutes ago or from a fortnight ago, and there was no way to tell
   * which — or whether it was a real question or one stray keystroke.
   *
   * It also fired on a draft containing no turn of the learner's at all. An
   * assistant message alone is not "a conversation you wrote", and offering to
   * keep one is the product describing something that did not happen.
   */
  const written = draft.draft?.messages.find((message) => message.authorId === "me" && message.body.trim());
  const offerAdoption = signedIn && draft.ready && Boolean(written);

  return (
    // `data-chrome="chat"` is the hook globals.css keys on to drop the footer,
    // un-sticky the header and stop the page itself scrolling. Height comes
    // from filling what the layout's flex column leaves over — no magic number
    // that a header change would silently invalidate.
    <div data-chrome="chat" className="relative flex min-h-0 w-full flex-1">
      {/* Tapping beside an off-canvas panel closes it — the behaviour every
          phone user already expects, and without which the only way out is a
          link in the corner. Hidden from assistive tech because the panel's
          own button is the real control; this is a target, not a second way to
          say the same thing. */}
      {menuOpen && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 z-20 cursor-default bg-scrim/40 lg:hidden"
        />
      )}

      <aside
        ref={sidebarRef}
        id="chat-sidebar"
        // Off-canvas below `lg`, where a permanent sidebar would eat the half
        // of a phone screen the conversation needs.
        className={`${
          menuOpen ? "flex" : "hidden"
        } absolute inset-y-0 left-0 z-30 w-72 shrink-0 flex-col border-r border-border-subtle bg-surface-page p-3 lg:relative lg:z-auto lg:flex`}
      >
        <div className="flex items-center justify-between gap-2 pb-2">
          <h2 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{f.yourChats}</h2>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="min-h-9 text-xs text-fg-muted hover:text-fg-primary lg:hidden"
          >
            {f.menuClose}
          </button>
        </div>

        <NewChatButton label={t.newChat} onClick={startNew} className="mb-3 w-full" />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {signedIn ? (
            <ConversationList
              conversations={conversations}
              currentId={conversationId}
              t={f}
              onOpen={openConversation}
              onRename={rename}
              onDelete={remove}
            />
          ) : (
            // Honest rather than empty: the sidebar has nothing in it because
            // there is nowhere to keep anything, and saying so is the only
            // place the trade-off is legible.
            <div className="rounded-control border border-border-subtle p-3">
              <p className="text-sm leading-relaxed text-fg-secondary">{f.onThisDevice}</p>
              {signInSlot && <div className="mt-2">{signInSlot}</div>}
            </div>
          )}
        </div>
      </aside>

      {/* The conversation IS the screen (chatkit's ChatScreen, the fleet's
          one chat layout): the words run edge to edge and the controls float
          over them — the phone's menu and "new chat" as frosted pills at the
          top, the composer as a see-through pill at the bottom. Until
          2026-10-22 each took a strip of the screen away from the reading.
          From `lg` the sidebar is on screen, so the header is not drawn
          (globals.css). */}
      <ChatScreen
        fill="parent"
        className="min-w-0 flex-1"
        header={
          <div className="flex w-full items-center justify-between gap-2">
            {/* On a phone the sidebar is off-canvas, so starting again has to
                be here too — one tap, not open-the-menu-then-find-it. */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="chat-sidebar"
              className="ck-glass min-w-0 gap-2 text-sm font-medium text-fg-primary"
            >
              <MenuIcon />
              <span className="min-w-0 truncate">{f.menuOpen}</span>
            </button>
            {(started || conversationId) && (
              <NewChatButton label={t.newChat} onClick={startNew} className="ck-glass border-0" />
            )}
          </div>
        }
        composer={
          <>
            <Composer
              inputRef={inputRef}
              value={chat.input}
              onChange={chat.setInput}
              onSend={chat.send}
              busy={chat.busy}
              onStop={chat.stop}
              t={t}
              modelT={dict.model}
              placeholder={t.composer}
              locale={locale}
              images
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.explanationsIn}</p>
              {byok.ready && byok.config && (
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="inline-flex items-center gap-1.5 font-mono text-caption uppercase tracking-caps text-ok hover:text-fg-primary"
                >
                  <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
                  {byok.config.model}
                </button>
              )}
            </div>
          </>
        }
      >
        {/* min-h-0 is load-bearing: a flex child defaults to min-height:auto
            and refuses to shrink below its content, so without it the PAGE
            grows instead of the transcript scrolling. The block padding is
            the measured height of the floating header and composer, so the
            first line is never under the one and the last never under the
            other (`heidi-chat-scroll`, globals.css). */}
        <div className="heidi-chat-scroll min-h-0 flex-1 overflow-y-auto px-4">
          <div ref={transcriptRef} className="mx-auto w-full max-w-3xl">
        {offerAdoption && (
          <AdoptPrompt
            t={f}
            wrote={written?.body ?? ""}
            when={draft.draft?.updatedAt ?? ""}
            locale={locale}
            onKeep={adopt}
            onDiscard={draft.forget}
          />
        )}

            {started || chat.busy ? (
              <Transcript
                voiceT={dict.voice}
                messages={messages}
                me={LEARNER_ID}
                t={t}
                busy={chat.busy}
                streaming={chat.streaming}
                onRetry={chat.retry}
                onMove={chat.send}
            locale={locale}
                endRef={endRef}
                className="flex flex-col gap-4"
              />
            ) : (
              <div className="py-8">
                <EmptyChat
                  t={t}
                  locale={locale}
                  dialect={{ tag: DISPLAY.tag, showcase: DISPLAY.showcase?.line }}
                  onPick={chat.send}
                  earlier={earlier}
                  heading="h1"
                />
              </div>
            )}
          </div>
        </div>
      </ChatScreen>

      {/* Select a word Heidi did not gloss and ask about it. Lives outside the
          scrolling transcript because it is positioned in viewport
          coordinates. */}
      <WordPick containerRef={transcriptRef} t={t} onAsk={chat.send} />

      {sheetOpen && (
        <ModelSheet
          t={dict.model}
          current={byok.config}
          onSave={byok.save}
          onClear={byok.clear}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * The offer to keep a signed-out conversation.
 *
 * Offered, never automatic. Adopting silently is what the big chat apps do and
 * nobody would blink — but this product's privacy section says a person's
 * chats are among the most private things they own, and the first act of a new
 * account should not be to quietly upload the transcript that was device-local
 * a second ago. Two dictionary strings buy the right to keep saying that.
 */
function AdoptPrompt({
  t,
  wrote,
  when,
  locale,
  onKeep,
  onDiscard,
}: {
  t: Dictionary["chat"]["full"];
  /** The learner's own first line, so the offer names what it is about. */
  wrote: string;
  /** When the draft was last written, ISO. Empty for one stored before the field. */
  when: string;
  locale: Locale;
  onKeep: () => void;
  onDiscard: () => void;
}) {
  /**
   * The date in the reader's own locale — and nothing at all when the stored
   * draft predates the field or holds something unparseable. Rendering
   * "Invalid Date" at somebody is the usual way this goes wrong.
   */
  const day = when ? formatDate(when, locale, "numeric") : "";

  return (
    <div className="border-b border-border-subtle bg-surface-raised px-4 py-3">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg-primary">{t.adoptTitle}</p>
          <p className="max-w-measure text-sm leading-relaxed text-fg-secondary">{t.adoptBody}</p>
          {/* The line itself. Clamped to two lines rather than the whole
              thread: enough to recognise, never enough to take over the top of
              the screen. */}
          <p className="mt-2 line-clamp-2 max-w-measure wrap-anywhere text-sm italic leading-snug text-fg-muted">
            «{wrote.trim()}»
            {day && <span className="not-italic"> · {day}</span>}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={onKeep}
            className="min-h-9 rounded-control bg-action px-3 py-1.5 text-sm font-medium text-on-action"
          >
            {t.adoptKeep}
          </button>
          <button type="button" onClick={onDiscard} className="min-h-9 text-sm text-fg-muted hover:text-fg-primary">
            {t.adoptDiscard}
          </button>
        </div>
      </div>
    </div>
  );
}
