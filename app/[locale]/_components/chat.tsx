"use client";

import { useEffect, useRef } from "react";
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
import { href } from "@/lib/i18n/routes";

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

  // Follow the conversation down, but only once it has started — an empty
  // thread scrolling itself on load would yank the page away from the reader.
  useEffect(() => {
    if (chat.messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages]);

  return (
    <section aria-label="Heidi" className="flex w-full flex-col">
      {/* The instruction used to be the second half of the page subhead, three
          hundred pixels above the box it describes. It sits on the thing it
          tells you to use — and it is the box's real `<label>`, not a `<p>`
          beside a hidden twin, because two labels for one control means a
          screen reader says the sentence twice. */}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pb-2">
        {!started && (
          <label htmlFor="chat-input" className="max-w-measure text-base leading-relaxed text-fg-secondary">
            {t.placeholder}
          </label>
        )}
        {started && byok.ready && byok.config && (
          <button
            type="button"
            onClick={() => modelSheet.show()}
            className="inline-flex items-center gap-1.5 font-mono text-caption uppercase tracking-caps text-ok hover:text-fg-primary"
          >
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
            {byok.config.model}
          </button>
        )}
        {started && (
          <div className="flex items-center gap-4">
            {/* Offered only once there is something to expand. On an empty box
                it would be a second front door to the same empty box. */}
            <Link
              href={href(locale, "chat")}
              className="inline-flex items-center gap-1.5 text-sm text-link underline underline-offset-4 hover:text-accent"
            >
              {t.full.expand}
              <ExpandIcon />
            </Link>
            <button
              type="button"
              onClick={reset}
              className="min-h-9 text-sm text-link underline underline-offset-4 hover:text-accent"
            >
              {t.newChat}
            </button>
          </div>
        )}
      </div>

      {(started || chat.busy) && (
        <div ref={transcriptRef}>
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
            className="flex flex-col gap-4 rounded-control border border-border-strong bg-surface-raised p-3 sm:p-4"
          />
        </div>
      )}

      <Composer
        value={chat.input}
        onChange={chat.setInput}
        onSubmit={() => chat.send(chat.input)}
        busy={chat.busy}
          onStop={chat.stop}
        t={t}
        modelT={dict.model}
        placeholder={t.composer}
        locale={locale}
        sticky={started}
        className="mt-3"
        // The visible label above is the box's label while it is on screen.
        labelledOutside={!started}
        images={{
          attached: chat.attached,
          onAccept: chat.accept,
          onRemove: chat.removeAttachment,
          error: chat.attachError,
          enabled: byok.canSee,
          onNeedsKey: () => modelSheet.show(),
        }}
      />

      {/* A setting, so it sits below the invitation rather than shouting over
          it — and only before there is a conversation to read. */}
      {!started && (
        <div className="mt-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
          <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.explanationsIn}</p>
          {byok.ready && byok.config && (
            <button
              type="button"
              onClick={() => modelSheet.show()}
              className="inline-flex items-center gap-1.5 font-mono text-caption uppercase tracking-caps text-ok hover:text-fg-primary"
            >
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
              {byok.config.model}
            </button>
          )}
        </div>
      )}

      {!started && <Examples t={t} dialect={dialect} onPick={chat.send} />}

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
  );
}

function ExpandIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-8 8M3 21l8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

