"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LEARNER_ID, type ChatMessage } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import { type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { formatDate } from "@/lib/i18n/dates";
import { useByok } from "../use-byok";
import { readDraft, useDraft } from "../use-draft";
import { ModelSheet } from "../model-sheet";
import { Composer } from "./composer";
import { Examples } from "./examples";
import { DISPLAY } from "@/lib/variety/display";
import { Transcript } from "./transcript";
import { useConversation } from "./use-conversation";
import { conversationTransport, streamingDraftTransport, type ConversationSummary } from "./transports";
import { ConversationList } from "./conversation-list";
import { WordPick } from "./word-pick";

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
    imageTooBig: dict.model.imageTooBig,
    byok: byok.config,
    initial: initialMessages,
    me: LEARNER_ID,
  });

  const { messages, setMessages } = chat;

  /**
   * Restore the conversation this browser was already having.
   *
   * Waits for `ready`, because the server pass cannot read localStorage and
   * rendering the thread before it can would be a hydration mismatch. It reads
   * the store DIRECTLY rather than through the subscribed value: `ready` and
   * the stored draft are two independent `useSyncExternalStore` subscriptions,
   * and nothing orders them — so the subscribed draft can still be null on the
   * tick `ready` flips, which would seed an empty thread and mark the job done.
   */
  const seeded = useRef(false);
  useEffect(() => {
    if (signedIn || seeded.current || !draft.ready) return;
    seeded.current = true;
    const stored = readDraft();
    if (stored?.messages.length) setMessages(stored.messages);
  }, [signedIn, draft.ready, setMessages]);

  /**
   * Signed out, the thread IS the storage.
   *
   * Written on every change rather than on unload: `beforeunload` does not
   * fire reliably when a tab is discarded on mobile, and losing the
   * conversation is the exact failure this exists to prevent.
   *
   * NOT before the seed has run. Without that guard this effect fires on mount
   * with an empty `messages`, which clears the very draft the seed is about to
   * restore — found by reloading the page and watching the conversation
   * vanish, having "persisted" it a moment earlier.
   */
  const keepDraft = draft.keep;
  useEffect(() => {
    if (signedIn || !seeded.current) return;
    keepDraft(messages, locale);
  }, [signedIn, messages, locale, keepDraft]);

  useEffect(() => {
    if (messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

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
          className="absolute inset-0 z-20 cursor-default bg-fg-primary/20 lg:hidden"
        />
      )}

      <aside
        // Off-canvas below `lg`, where a permanent sidebar would eat the half
        // of a phone screen the conversation needs.
        className={`${
          menuOpen ? "flex" : "hidden"
        } absolute inset-y-0 left-0 z-30 w-72 shrink-0 flex-col border-r border-border-subtle bg-surface-page p-3 lg:relative lg:flex`}
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

        <button
          type="button"
          onClick={startNew}
          className="mb-3 w-full rounded-control border border-border-strong px-3 py-2 text-sm font-medium text-fg-primary transition-colors hover:bg-surface-raised"
        >
          {t.newChat}
        </button>

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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4"
          >
            {f.menuOpen}
          </button>
        </div>

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

        {/* min-h-0 is load-bearing: a flex child defaults to min-height:auto
            and refuses to shrink below its content, so without it the PAGE
            grows instead of the transcript scrolling. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <div ref={transcriptRef} className="mx-auto w-full max-w-3xl">
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
              <Empty t={t} onPick={chat.send} />
            )}
          </div>
        </div>

        {/* `env(safe-area-inset-bottom)` — on a phone with a home indicator the
            composer otherwise sits under it, and the line beneath it is
            clipped. `max()` keeps the ordinary 1rem on every device that has
            no inset, so this costs nothing on a laptop. */}
        <div className="border-t border-border-subtle px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto w-full max-w-3xl">
            <Composer
              value={chat.input}
              onChange={chat.setInput}
              onSubmit={() => chat.send(chat.input)}
              busy={chat.busy}
              t={t}
              modelT={dict.model}
              placeholder={t.composer}
              locale={locale}
              autoFocus
              images={{
                attached: chat.attached,
                onAccept: chat.accept,
                onRemove: chat.removeAttachment,
                error: chat.attachError,
                enabled: byok.canSee,
                onNeedsKey: () => setSheetOpen(true),
              }}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
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
          </div>
        </div>
      </div>

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

/**
 * An empty chat says what it is for — and then offers something to press.
 *
 * It used to be a heading and a sentence, which on a phone left roughly six
 * hundred pixels of white between the greeting and the text box. That reads as
 * a page which has not finished loading, and it asks the least confident
 * visitor to do the hardest thing in the product first: compose a sentence in
 * a language they cannot yet write.
 *
 * The home page already had the answer and the full-screen chat did not, so
 * the examples moved into their own module and both surfaces render the same
 * ones. `DISPLAY` rather than the pack itself: a component may not import the
 * variety — see `lib/variety/display.test.ts`.
 */
function Empty({ t, onPick }: { t: Dictionary["chat"]; onPick: (s: string) => void }) {
  return (
    <div className="py-10">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-display text-fg-primary">{t.emptyTitle}</h1>
        <p className="mx-auto mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.placeholder}</p>
      </div>
      <Examples t={t} dialect={{ tag: DISPLAY.tag, showcase: DISPLAY.showcase?.line }} onPick={onPick} />
    </div>
  );
}
