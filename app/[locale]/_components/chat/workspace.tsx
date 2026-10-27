"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChatApp,
  ChatTurnError,
  type ChatAppHandle,
  type ChatAppLabels,
  type ChatTransport,
  type Starter,
} from "@bitbaum/chatkit/react";
import { HEIDI_ID } from "@/lib/domain/chat/types";
import { decodeAnswer } from "@/lib/domain/chat/answer";
import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/i18n/fill";
import { LOCALE_TAGS, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { formatDate } from "@/lib/i18n/dates";
import { DISPLAY } from "@/lib/variety/display";
import { useByok } from "../use-byok";
import { ModelSheet } from "../model-sheet";
import { useKeyboardViewport } from "../use-keyboard-viewport";
import { composerOptions } from "./composer";
import { PasteButton } from "./paste-button";
import { AnswerFooter } from "./transcript";
import { WordPick } from "./word-pick";
import { EarlierRow } from "./earlier-row";
import { postFeedback } from "./feedback";
import { savedConversationTransport, streamingDraftTransport } from "./transports";
import { failureSentence, fromWire, toAnswer, toThread, type HeidiMessage } from "./chat-app";
import { OPEN_CHAT_KEY, deviceStore, serverStore } from "./stores";
import { useSpeakArrival } from "./use-spoken-answers";
import { useAdoptOffer, useDraftHandoff } from "./use-earlier-writing";

/**
 * The chat with room to be a chat — chatkit's `ChatApp`, the fleet's one chat
 * app: the header, the list of conversations (a drawer on a phone, a rail from
 * 64rem), New chat, Temporary chat, rename and delete, the queue, Stop, and
 * reopening the conversation that was open. Heidi supplies its transport and
 * its words and draws its own answer under chatkit's (`AnswerFooter`).
 *
 * Two modes, and the difference is still only where things go:
 *
 *   SIGNED OUT — the stateless `/api/chat`, streamed; conversations kept in
 *     this browser (`deviceStore`). Nothing anonymous reaches the database.
 *   SIGNED IN  — the server remembers (`serverStore`). The conversation row is
 *     created on the FIRST MESSAGE, so pressing New chat and changing your mind
 *     leaves nothing behind. A temporary chat goes to the stateless route and
 *     is never written anywhere.
 *
 * HEIDI'S OWN RULES, said through ChatApp's props:
 *   - Stop DISCARDS the half answer (`stopKeepsPartial={false}`). What had
 *     streamed has not been through the variety gate yet, so keeping it would
 *     make Stop a way to publish dialect nobody checked.
 *   - The failure says WHY in the reader's language — not configured, cannot
 *     reach, cannot see pictures, or try again — per turn (`ChatTurnError`),
 *     so two failures in one chat keep their own sentences.
 *   - A move chip ("Shorter", "Word by word") and the word pick send in one
 *     tap, as the model's own suggested replies do: the footer through
 *     `renderFooter`'s `send`, the word pick through the handle.
 */
export function ChatWorkspace({
  locale,
  dict,
  signedIn,
  signInSlot,
  conversationId: opened = null,
}: {
  locale: Locale;
  dict: Dictionary;
  signedIn: boolean;
  /**
   * The sign-in control, rendered by the server page — a server action, so it
   * works with no client JavaScript. Null when OrangeCat is not configured.
   */
  signInSlot: React.ReactNode;
  /** `/chat/<id>`: the saved conversation the page was opened on. */
  conversationId?: string | null;
}) {
  const t = dict.chat;
  const f = t.full;
  const router = useRouter();
  const byok = useByok();
  const speakArrival = useSpeakArrival();
  useKeyboardViewport({ pin: true });

  const store = useMemo(() => (signedIn ? serverStore() : deviceStore()), [signedIn]);
  const [openId, setOpenId] = useState<string | null>(opened);
  // Bumped when a conversation was added to the store behind ChatApp's back
  // (a thread carried over from the home card), so it lists it and opens it.
  const [generation, setGeneration] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  // The box's text, only so the paste button knows whether it is empty.
  const [draft, setDraft] = useState("");
  const chatRef = useRef<ChatAppHandle>(null);
  const appRef = useRef<HTMLDivElement>(null);

  /** Signed in, the open conversation is in the address bar, so a reload or a link lands on it. */
  const onConversationChange = useCallback(
    (id: string | null) => {
      setOpenId(id);
      if (signedIn) window.history.replaceState(null, "", id ? `${href(locale, "chat")}/${id}` : href(locale, "chat"));
    },
    [locale, signedIn],
  );

  const openAdopted = useCallback((id: string) => {
    setOpenId(id);
    setGeneration((g) => g + 1);
  }, []);
  const earlier = useDraftHandoff({ enabled: !signedIn, store, onOpen: openAdopted });
  const adoption = useAdoptOffer({ enabled: signedIn, locale });

  const transport = useCallback<ChatTransport>(
    async (turn) => {
      const [text, images] = fromWire(turn.text, turn.attachments);
      // Signed in, a saved conversation answers in one piece: the route writes
      // both rows before replying, and streaming an answer whose storage could
      // still fail would show something that may not be kept.
      const send =
        signedIn && turn.conversationId ? savedConversationTransport(turn.conversationId) : streamingDraftTransport();
      const result = await send({
        text,
        history: toThread(turn.history),
        locale,
        byok: byok.config,
        images,
        signal: turn.signal,
        onText: (soFar) => turn.update({ text: soFar }),
      });

      if (result.status === "ok") {
        const answer = result.messages.find((m) => m.authorId === HEIDI_ID)?.answer;
        if (answer) {
          speakArrival(answer.text);
          return toAnswer(answer, turn.text);
        }
      }
      // A private conversation has no "silence": the reader asked her.
      const kind = result.status === "error" ? result.kind : "failed";
      throw new ChatTurnError(failureSentence(kind, t), { kind });
    },
    [byok.config, locale, signedIn, speakArrival, t],
  );

  /** The word pick asks, in one tap, like a move chip. */
  const ask = useCallback((say: string) => void chatRef.current?.send(say), []);

  const starters: Starter[] = useMemo(
    () =>
      [
        ...(DISPLAY.showcase?.line ? [{ kind: "dialect" as const, text: DISPLAY.showcase.line }] : []),
        ...t.examples,
      ]
        .sort((a, b) => Number(a.kind === "compose") - Number(b.kind === "compose"))
        // A dialect line carries its language, so a screen reader and the
        // font read it as Swiss German, not as the page's language.
        .map((ex) => (ex.kind === "dialect" ? { text: ex.text, label: `«${ex.text}»`, lang: DISPLAY.tag } : ex.text)),
    [t.examples],
  );

  const labels: Partial<ChatAppLabels> = {
    chats: f.yourChats,
    openChats: f.menuOpen,
    closeChats: f.menuClose,
    newChat: t.newChat,
    untitled: f.untitled,
    more: f.more,
    temporary: f.temporary,
    temporaryNote: f.temporaryNote,
    rename: f.rename,
    renameField: f.renameField,
    delete: f.delete,
    deleteAsk: () => f.deleteAsk,
    save: f.save,
    cancel: f.cancel,
    search: f.search,
    today: f.today,
    yesterday: f.yesterday,
    earlier: f.older,
    noChats: f.noChats,
    noMatch: (query) => fill(f.noMatch, { query }),
    loadingChats: f.loading,
    listFailed: f.listFailed,
    tryAgain: f.tryAgain,
    answering: f.answering,
    chatActions: (title) => fill(f.chatActions, { title }),
    queued: f.queued,
    unqueue: (text) => fill(f.unqueue, { text }),
    dismiss: t.dismiss,
    problems: { load: f.listFailed, save: f.notSaved, open: f.notOpened },
  };

  // The word pick reads selections in the answers only — not in the list of
  // conversations or the box.
  const threadRef = useMemo(
    () => ({
      get current() {
        return appRef.current?.querySelector<HTMLElement>(".ck-thread") ?? null;
      },
    }),
    [],
  );

  return (
    // `data-chrome="chat"` is the hook globals.css keys on to drop the footer
    // and stop the page itself scrolling; ChatApp fills what is left.
    <div data-chrome="chat" ref={appRef} className="flex min-h-0 w-full flex-1 flex-col">
      {adoption.offer && (
        <AdoptPrompt
          t={f}
          wrote={adoption.offer.wrote}
          when={adoption.offer.when}
          locale={locale}
          onKeep={async () => {
            const id = await adoption.keep();
            if (id) router.push(`${href(locale, "chat")}/${id}`);
          }}
          onDiscard={adoption.discard}
        />
      )}

      <ChatApp
        ref={chatRef}
        key={generation}
        className="min-h-0 flex-1"
        fill="parent"
        name="Heidi"
        store={store}
        transport={transport}
        conversationId={openId}
        onConversationChange={onConversationChange}
        rememberKey={OPEN_CHAT_KEY}
        locale={LOCALE_TAGS[locale]}
        placeholder={t.composer}
        labels={labels}
        starters={starters}
        startersTitle={
          <div className="flex flex-col gap-3 text-left">
            <h1 className="font-heading text-2xl font-semibold tracking-display text-fg-primary">{t.emptyTitle}</h1>
            {earlier && (
              <EarlierRow t={t.earlier} locale={locale} line={earlier.line} when={earlier.when} onResume={earlier.resume} />
            )}
          </div>
        }
        // Signed out, the chat list says where these chats live and how to keep them.
        historySlot={
          signedIn ? null : (
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-fg-secondary">
              <span>{f.onThisDevice}</span>
              {signInSlot}
            </div>
          )
        }
        stopKeepsPartial={false}
        composer={{
          ...composerOptions({ t, modelT: dict.model, locale, images: true }),
          value: draft,
          onValueChange: setDraft,
          // The commonest first move there is: paste the line you were sent.
          tools: <PasteButton label={t.paste} value={draft} onPaste={setDraft} />,
        }}
        thread={{
          // A private answer has no URL to share.
          share: false,
          renderFooter: (message, { send }) => {
            // ChatApp keeps what the transport and the store put on a message
            // (`HeidiMessage`); decoded, because a stored shape can be old.
            const m = message as HeidiMessage;
            const answer = m.role === "assistant" ? decodeAnswer(m.answer) : null;
            if (!answer) return null;
            return (
              <AnswerFooter
                answer={answer}
                asked={typeof m.asked === "string" ? m.asked : undefined}
                t={t}
                voiceT={dict.voice}
                onMove={(say) => send(say)}
                locale={locale}
              />
            );
          },
          // A thumb goes to the conversation it was given in — or to `draft`
          // while it lives only in this browser or is temporary.
          onFeedback: ({ conversationId, ...feedback }) => postFeedback(signedIn ? conversationId : null, feedback),
          labels: {
            copy: t.copy,
            copied: t.copied,
            listen: dict.voice.speak,
            stop: dict.voice.stop,
            retry: t.retry,
            good: t.feedback.good,
            bad: t.feedback.bad,
            feedbackTitle: t.feedback.title,
            feedbackReasons: t.feedback.reasons,
            feedbackMore: t.feedback.more,
            feedbackSend: t.feedback.send,
            feedbackThanks: t.feedback.thanks,
            thinking: t.thinking,
            working: t.thinking,
            stopped: t.stopped,
            failed: t.failed,
            loading: f.loading,
            jump: f.jump,
            replies: t.moves.title,
          },
        }}
        headerEnd={
          byok.ready && byok.config ? (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="ck-glass min-w-0 max-w-32 gap-1.5 font-mono text-caption uppercase tracking-caps text-ok"
            >
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
              <span className="min-w-0 truncate">{byok.config.model}</span>
            </button>
          ) : null
        }
        footnote={t.explanationsIn}
      />

      {/* Select a word Heidi did not gloss and ask about it. Outside the
          thread because it is positioned in viewport coordinates. */}
      <WordPick containerRef={threadRef} t={t} onAsk={ask} />

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
 * The offer to keep what was written in this browser before signing in.
 *
 * Offered, never automatic. This product's privacy section says a person's
 * chats are among the most private things they own, and the first act of a
 * new account should not be to quietly upload what was device-local a second
 * ago.
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
  /** When it was last written, ISO. Empty for a draft stored before the field. */
  when: string;
  locale: Locale;
  onKeep: () => void;
  onDiscard: () => void;
}) {
  // Nothing at all rather than "Invalid Date" for an unparseable stamp.
  const day = when ? formatDate(when, locale, "numeric") : "";

  return (
    <div className="border-b border-border-subtle bg-surface-raised px-4 py-3">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg-primary">{t.adoptTitle}</p>
          <p className="max-w-measure text-sm leading-relaxed text-fg-secondary">{t.adoptBody}</p>
          {/* Two lines: enough to recognise, never enough to take over the screen. */}
          <p className="mt-2 line-clamp-2 max-w-measure wrap-anywhere text-sm italic leading-snug text-fg-muted">
            «{wrote.trim()}»
            {day && <span className="not-italic"> · {day}</span>}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={onKeep}
            className="min-h-11 rounded-control bg-action px-3 py-1.5 text-sm font-medium text-on-action"
          >
            {t.adoptKeep}
          </button>
          <button type="button" onClick={onDiscard} className="min-h-11 text-sm text-fg-muted hover:text-fg-primary">
            {t.adoptDiscard}
          </button>
        </div>
      </div>
    </div>
  );
}
