"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { LEARNER_ID } from "@/lib/domain/chat/types";
import { ASK_EVENT, askedText } from "@/lib/browser/ask";
import { useDismiss } from "../use-dismiss";
import { ModelSheet } from "../model-sheet";
import { CowMark } from "../cow-mark";
import { Composer } from "./composer";
import { Transcript } from "./transcript";
import { WordPick } from "./word-pick";
import { useDraftChat } from "./use-draft-chat";

/**
 * The dock's box, which must NOT be `chat-input`.
 *
 * `htmlFor` and `getElementById` both resolve to the first match in the
 * document, and the dock floats over pages that have a composer of their own.
 * A shared id hands one box's label to the other.
 */
const DOCK_INPUT_ID = "heidi-dock-input";

/** Ids for asks. A counter cannot collide; a clock can, and text repeats. */
let askCounter = 0;
function nextAskId(): number {
  askCounter += 1;
  return askCounter;
}

/**
 * Heidi, on every page.
 *
 * THE PROBLEM THIS SOLVES. Chat is how people use this product — it is the
 * home page, it is the thing the whole site argues for — and it existed on
 * exactly two of eleven surfaces. A reader on `/grammar` who wanted to ask what
 * a form meant had to notice the nav, work out which of eight links was the
 * chat, navigate, and lose the page they were reading. A signed-in reader had
 * it worse: the locale root is their dashboard, so their landing page had no
 * composer anywhere on it. The most-used thing in the product was the one you
 * had to go looking for.
 *
 * WHY A DOCK RATHER THAN A COMPOSER ON EVERY PAGE. A composer stitched into
 * each page would compete with what that page is for — the vocabulary list
 * would become a list with a chat box in it — and it would multiply the
 * surfaces that have to get the seed guard, the key sheet and the image
 * handling right. One floating affordance is the convention every reader
 * already knows, costs the page below it nothing, and is the SAME conversation
 * as the other two surfaces because it reads the same store.
 *
 * WHERE IT IS NOT. Pages that already hold a conversation mark themselves with
 * `data-chat="surface"`, and `globals.css` hides the dock when the document
 * contains one. That is the mechanism the full-screen chat already uses to drop
 * the footer (`data-chrome="chat"`), and it is CSS rather than a list of
 * pathnames for a concrete reason: whether the locale root holds a chat depends
 * on whether the visitor is SIGNED IN, which a route table cannot know and the
 * rendering page always does.
 */
export function ChatDock({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.chat;
  const [open, setOpen] = useState(false);
  /**
   * A question handed in from a page — a word on the vocabulary list, a grammar
   * topic — waiting for the panel to exist so it can be sent.
   *
   * It has to be held HERE rather than sent directly, because the thing that
   * can send it is inside the panel, and the panel does not exist until this
   * press opens it.
   */
  const [asked, setAsked] = useState<{ id: number; text: string } | null>(null);
  const panelId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onAsk(event: Event) {
      const text = askedText(event);
      if (!text) return;
      /**
       * A monotonic id, NOT the text.
       *
       * Deduping on the text meant pressing the same word twice did nothing
       * the second time: the effect saw the value it had already sent and
       * returned early — without clearing `asked`, which then sat there and
       * replayed the moment a fresh panel mounted. Asking the same question
       * twice is a perfectly ordinary thing to want.
       */
      setAsked({ id: nextAskId(), text });
      setOpen(true);
    }
    window.addEventListener(ASK_EVENT, onAsk);
    return () => window.removeEventListener(ASK_EVENT, onAsk);
  }, []);

  const dismiss = useCallback(() => setOpen(false), []);
  useDismiss({
    open,
    onDismiss: dismiss,
    containerRef: wrap,
    focusRef: launcher,
    // A chat panel does not close because you clicked the page behind it. The
    // reader is very often mid-sentence, and the thing they clicked is usually
    // the word they are asking about.
    onPointerOutside: false,
    /**
     * Nor because they followed a link.
     *
     * A menu closing on navigation is right; a dock is the opposite case. It
     * lives in the root layout precisely so it outlives the page under it —
     * and following a grammar link FROM an answer is a thing this product
     * actively encourages, so closing on it would punish the intended move.
     *
     * It also lost work: `useConversation` has no abort handling, so a reply
     * still in flight when the panel unmounted was dropped before it reached
     * the draft store. The reader came back to their question and no answer.
     */
    onNavigate: false,
  });

  return (
    // `print:hidden` because a floating button over a printed grammar page is
    // an ink-coloured rectangle in the margin.
    <div ref={wrap} data-dock="heidi" className="print:hidden">
      {/*
        Mounted only while open, and that is not an optimisation.

        The dock is in the root layout, so it is on every page. Its wiring reads
        and WRITES the draft store — and the full-screen chat owns that same
        store on `/chat`. A dock mounted there would seed itself from the store
        and later write its now-stale copy back, which is a way to lose a
        conversation that nobody would think to test for. Nothing touches
        storage until the reader actually opens it.
      */}
      {open && (
        <DockPanel
          id={panelId}
          locale={locale}
          dict={dict}
          asked={asked}
          onAskHandled={() => setAsked(null)}
          onClose={() => {
            dismiss();
            /**
             * Only where the launcher still exists to receive it. While the
             * panel is open on a phone the launcher carries `hidden`, so it is
             * `display:none` and `.focus()` is a silent no-op that leaves
             * focus on `document.body` — the exact defect the Escape path was
             * written to avoid. `offsetParent` is null for a hidden element,
             * which is the cheapest honest test for "is this focusable".
             */
            if (launcher.current?.offsetParent !== null) launcher.current?.focus();
          }}
        />
      )}

      {/*
        The launcher.

        Hidden while the panel is open on a phone — there the panel covers the
        whole screen, and a floating button over it would sit on the composer.
        On a laptop the panel is a card beside the button, so the button stays
        and doubles as the way to close it.
      */}
      <button
        ref={launcher}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        // `env(safe-area-inset-bottom)` keeps it off the iOS home indicator,
        // which otherwise swallows the bottom third of the button.
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
        className={`fixed right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-control border border-border-strong bg-fg-primary px-4 text-surface-page shadow-lg transition-colors hover:opacity-90 ${ open ? "hidden sm:inline-flex" : "" }`}
      >
        <ChatIcon />
        {/*
          Visible on a laptop, collapsing to the icon on a phone where 390px of
          bar is already spoken for — but it stays in the accessible tree either
          way, because an icon-only button with no name is announced as
          "button".
        */}
        <span className="text-sm font-medium max-sm:sr-only">{t.dock.open}</span>
      </button>
    </div>
  );
}

/**
 * The panel — the conversation itself.
 *
 * Separate from the launcher so that everything stateful (the draft store, the
 * transport, the key sheet) exists only while it is open. See the note at its
 * mount point.
 */
function DockPanel({
  id,
  locale,
  dict,
  asked,
  onAskHandled,
  onClose,
}: {
  id: string;
  locale: Locale;
  dict: Dictionary;
  /** A question handed in by a page, waiting to be sent. Identified by id. */
  asked: { id: number; text: string } | null;
  onAskHandled: () => void;
  onClose: () => void;
}) {
  const t = dict.chat;
  const endRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { chat, byok, reset, started, ready, modelSheet } = useDraftChat({ locale, dict });

  /**
   * Send what a page asked for, exactly once, and not before the stored thread
   * has been restored.
   *
   * `ready` is the half that is easy to miss: sending in the flush that
   * restores the conversation would send from an empty one and silently drop
   * whatever the reader already had.
   *
   * The `sent` ref rather than the dependency list alone, because React mounts
   * every component twice in development. Without it, pressing "show it in a
   * sentence" asks twice and spends two model calls.
   *
   * `onAskHandled` clears it upstream so that closing and reopening the dock
   * does not replay a question some page asked an hour ago.
   */
  const sent = useRef<number | null>(null);
  const send = chat.send;
  useEffect(() => {
    if (!ready || !asked || sent.current === asked.id) return;
    sent.current = asked.id;
    send(asked.text);
    onAskHandled();
  }, [ready, asked, send, onAskHandled]);

  // Follow the conversation down. No "only once started" guard is needed here:
  // the panel exists because the reader opened it, so there is no page under
  // them to yank away.
  useEffect(() => {
    if (chat.messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages]);

  /**
   * Focus the box.
   *
   * Someone who pressed "Ask Heidi" has a question ready; landing them on the
   * panel's outer div means their next keystroke goes nowhere. Safe to do on
   * mount precisely because the panel mounts on that press.
   */
  useEffect(() => {
    document.getElementById(DOCK_INPUT_ID)?.focus();
  }, []);

  return (
    <div
      id={id}
      role="dialog"
      aria-label={t.dock.title}
      /**
       * Full-screen on a phone, a card on a laptop.
       *
       * `dvh`, not `vh`: `vh` measures the viewport WITHOUT the browser
       * toolbar, so on a phone the panel ends up taller than the screen and the
       * composer sits underneath the toolbar — the trap the full-screen chat
       * already documents in globals.css.
       */
      /*
       * `sm:bottom-20` clears the launcher rather than covering it. At
       * `bottom-4` the card sat exactly on top of the button that opened it,
       * so on a laptop the one control that closes the dock was underneath the
       * dock. Measured on screen, not reasoned about.
       */
      className="fixed inset-0 z-50 flex flex-col border-border-strong bg-surface-page sm:inset-auto sm:bottom-20 sm:right-4 sm:h-[min(34rem,calc(100dvh-8rem))] sm:w-[26rem] sm:rounded-control sm:border sm:shadow-lg"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border-strong px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <CowMark size={22} className="shrink-0 text-fg-primary" />
          <p className="truncate font-heading text-base font-bold tracking-display text-fg-primary">{t.dock.title}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {started && (
            <button
              type="button"
              onClick={reset}
              className="text-sm text-link underline underline-offset-4 hover:text-accent"
            >
              {t.newChat}
            </button>
          )}
          {/* The way out of a small box and into the room. Offered only once
              there is something to expand — on an empty panel it is a second
              front door to the same empty panel. */}
          {started && (
            <Link
              href={href(locale, "chat")}
              prefetch={false}
              onClick={onClose}
              aria-label={t.full.expand}
              title={t.full.expand}
              className="inline-flex h-9 w-9 items-center justify-center text-fg-secondary hover:text-fg-primary"
            >
              <ExpandIcon />
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t.dock.close}
            className="inline-flex h-9 w-9 items-center justify-center text-fg-secondary hover:text-fg-primary"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      {/*
        `min-h-0` is the load-bearing line: a flex child defaults to
        `min-height: auto` and refuses to shrink below its content, so without
        it the transcript pushes the composer off the bottom instead of
        scrolling inside the panel.

        `overscroll-contain` stops a flick at the end of the transcript from
        scrolling the page behind — which is why there is no body scroll lock
        here, and so nothing left behind if the panel unmounts unexpectedly.
      */}
      <div ref={transcriptRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
        {started || chat.busy ? (
          <Transcript
            voiceT={dict.voice}
            messages={chat.messages}
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
          // Bottom-aligned, so the invitation sits just above the box it is
          // about rather than floating at the top of an empty panel.
          <div className="flex h-full flex-col justify-end gap-3">
            <p className="text-sm leading-relaxed text-fg-secondary">{t.dock.lead}</p>
            <ul className="flex flex-col gap-1.5">
              {t.dock.prompts.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => chat.send(prompt)}
                    className="w-full rounded-control border border-border-subtle px-3 py-2 text-left text-sm text-fg-secondary transition-colors hover:border-accent hover:text-fg-primary"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <Composer
          id={DOCK_INPUT_ID}
          value={chat.input}
          onChange={chat.setInput}
          onSubmit={() => chat.send(chat.input)}
          busy={chat.busy}
          t={t}
          modelT={dict.model}
          placeholder={t.composer}
          locale={locale}
          images={{
            attached: chat.attached,
            onAccept: chat.accept,
            onRemove: chat.removeAttachment,
            error: chat.attachError,
            enabled: byok.canSee,
            onNeedsKey: modelSheet.show,
          }}
        />
      </div>

      <WordPick containerRef={transcriptRef} t={t} onAsk={chat.send} />

      {modelSheet.open && (
        <ModelSheet
          t={dict.model}
          current={byok.config}
          onSave={byok.save}
          onClear={byok.clear}
          onClose={modelSheet.hide}
        />
      )}
    </div>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-8 8M3 21l8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
