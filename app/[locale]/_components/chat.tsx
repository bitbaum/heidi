"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LEARNER_ID } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import { Examples } from "./chat/examples";
import type { Locale } from "@/lib/i18n/locales";
import { ModelSheet } from "./model-sheet";
import { Composer } from "./chat/composer";
import { Transcript } from "./chat/transcript";
import { useDraftChat } from "./chat/use-draft-chat";
import { WordPick } from "./chat/word-pick";
import { NewChatButton } from "./chat/new-chat-button";
import { href } from "@/lib/i18n/routes";
import { FocusSurface, useCompact } from "./focus-surface";

/**
 * A conversation, not a form.
 *
 * What this replaces had two tabs — "Understand" and "Say it" — and the tabs
 * were the bug: someone arrives with a communication problem, not with a
 * decision about which of our tools to use. Asking them to classify their own
 * problem first is us pushing our internal structure onto them. The model
 * works it out now, and a follow-up ("why did they say it like that?") is just
 * the next message instead of a new query with no memory.
 */
export function Chat({
  locale,
  dict,
  dialect,
}: {
  locale: Locale;
  dict: Dictionary;
  /**
   * The variety being taught: its BCP-47 tag, so a screen reader does not read
   * Züridütsch with German phonology, and the pack's flagship line, offered as
   * the first thing a visitor can press.
   */
  dialect: { tag: string; showcase?: string };
}) {
  const t = dict.chat;
  const endRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  /**
   * The same wiring the dock and the full-screen chat use, so all three really
   * are one conversation rather than three that happen to look alike. The
   * restore guard in particular is load-bearing and used to live here alone.
   */
  const { chat, byok, reset, started, modelSheet } = useDraftChat({ locale, dict });

  /**
   * On a phone the conversation takes the screen when the learner writes, not
   * when the page loads: a chat restored from last time stays in the page,
   * behind the bar that opens it, instead of covering the home page on arrival.
   */
  const compact = useCompact();
  const [minimized, setMinimized] = useState(true);
  const [wasBusy, setWasBusy] = useState(chat.busy);
  if (chat.busy !== wasBusy) {
    setWasBusy(chat.busy);
    if (chat.busy) setMinimized(false);
  }

  // Follow the conversation down, but only once it has started — an empty
  // thread scrolling itself on load would yank the page away from the reader.
  useEffect(() => {
    if (chat.messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages]);

  return (
    <FocusSurface open={started} title={t.dock.title} t={dict.focus} minimized={minimized} onMinimizedChange={setMinimized}>
      {/* A small Heidi, the home page's second column: tap an example or type,
          and the full screen is one press away — the same conversation, since
          /chat reads the same draft. */}
      <section
        aria-label="Heidi"
        className="flex w-full flex-1 flex-col rounded-control border border-border-strong bg-surface-page"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle py-1.5 pl-4 pr-1.5">
          <p className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="font-heading text-lg font-semibold tracking-display text-fg-primary">Heidi</span>{" "}
            {byok.ready && byok.config ? (
              <button
                type="button"
                onClick={() => modelSheet.show()}
                className="truncate font-mono text-caption uppercase tracking-caps text-fg-muted hover:text-fg-primary"
              >
                {byok.config.model}
              </button>
            ) : (
              // A setting, not news: on the narrowest phones it would only be
              // clipped, so it waits for the room to be read in full.
              <span className="hidden truncate font-mono text-caption uppercase tracking-caps text-fg-muted sm:inline">
                {t.explanationsIn}
              </span>
            )}
          </p>
          <div className="flex shrink-0 items-center">
            {started && <NewChatButton label={t.newChat} onClick={reset} variant="icon" />}
            <Link
              href={href(locale, "chat")}
              aria-label={t.full.expand}
              title={t.full.expand}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control text-fg-secondary hover:bg-surface-raised hover:text-fg-primary"
            >
              <ExpandIcon />
            </Link>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-3 pb-2 pt-3 sm:px-4">
          {!started && (
            <>
              <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.placeholder}</p>
              <Examples t={t} dialect={dialect} onPick={chat.send} />
            </>
          )}

          {(started || chat.busy) && (
            // Inside the card on a wide screen the conversation scrolls in its
            // own box, so an answer never pushes the page. On a phone it is the
            // focus surface's whole screen and simply flows.
            <div ref={transcriptRef} className="mb-2 lg:max-h-[28rem] lg:overflow-y-auto lg:pr-1">
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
            </div>
          )}

          <Composer
            value={chat.input}
            onChange={chat.setInput}
            onSend={chat.send}
            busy={chat.busy}
            onStop={chat.stop}
            t={t}
            modelT={dict.model}
            placeholder={t.composer}
            locale={locale}
            sticky={started}
            className="mt-auto pt-3"
            images
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
      </section>
    </FocusSurface>
  );
}

function ExpandIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-8 8M3 21l8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

