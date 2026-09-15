"use client";

import { useEffect, useRef, useState } from "react";
import { LEARNER_ID } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { useByok } from "./use-byok";
import { ModelSheet } from "./model-sheet";
import { Composer } from "./chat/composer";
import { Transcript } from "./chat/transcript";
import { useConversation } from "./chat/use-conversation";
import { draftTransport } from "./chat/transports";

/**
 * A conversation, not a form.
 *
 * What this replaces had two tabs — "Understand" and "Say it" — and the tabs
 * were the bug: someone arrives with a communication problem, not with a
 * decision about which of our tools to use. Asking them to classify their own
 * problem first is us pushing our internal structure onto them. The model
 * works it out now, and a follow-up ("why did they say it like that?") is just
 * the next message instead of a new query with no memory.
 *
 * This file was 724 lines. The transcript, the bubbles, the answer renderer and
 * the composer now live in `./chat/`, because the group chat needed all four
 * and had grown its own worse copies of two of them. What is left here is what
 * is genuinely the home page's: the examples, the model badge, and a stateless
 * transport that posts the whole thread every time — which is also why this
 * surface still works with no database and no account.
 */
export function Chat({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.chat;
  const byok = useByok();
  const [sheetOpen, setSheetOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const chat = useConversation({
    transport: draftTransport(),
    locale,
    t,
    imageTooBig: dict.model.imageTooBig,
    byok: byok.config,
    me: LEARNER_ID,
  });

  // Follow the conversation down, but only once it has started — an empty
  // thread scrolling itself on load would yank the page away from the reader.
  useEffect(() => {
    if (chat.messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages]);

  const started = chat.messages.length > 0;

  return (
    <section aria-label="Heidi" className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.explanationsIn}</p>
          {byok.ready && byok.config && (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-caps text-ok hover:text-fg-primary"
            >
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
              {byok.config.model}
            </button>
          )}
        </div>
        {started && (
          <button type="button" onClick={chat.reset} className="min-h-9 text-sm text-link underline underline-offset-4 hover:text-accent">
            {t.newChat}
          </button>
        )}
      </div>

      {(started || chat.busy) && (
        <Transcript
          messages={chat.messages}
          me={LEARNER_ID}
          t={t}
          busy={chat.busy}
          onRetry={chat.retry}
          endRef={endRef}
          className="flex flex-col gap-4 rounded-control border border-border-strong bg-surface-raised p-3 sm:p-4"
        />
      )}

      <Composer
        value={chat.input}
        onChange={chat.setInput}
        onSubmit={() => chat.send(chat.input)}
        busy={chat.busy}
        t={t}
        modelT={dict.model}
        placeholder={t.composer}
        locale={locale}
        sticky={started}
        className="mt-3"
        images={{
          attached: chat.attached,
          onAccept: chat.accept,
          onRemove: chat.removeAttachment,
          error: chat.attachError,
          enabled: byok.canSee,
          onNeedsKey: () => setSheetOpen(true),
        }}
      />

      {!started && <Examples t={t} onPick={chat.send} />}

      {sheetOpen && (
        <ModelSheet
          t={dict.model}
          current={byok.config}
          onSave={byok.save}
          onClear={byok.clear}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </section>
  );
}

/**
 * Three things worth pasting, BELOW the input rather than above it.
 *
 * They used to sit between the intro and the composer, which put the one
 * control the whole page exists for about 700px down a phone screen — you had
 * to scroll past three examples of the problem to reach the thing that solves
 * it. Examples are a prompt for someone who has nothing to paste; someone who
 * does should meet the box first.
 *
 * This stays in the home page's own file: it is marketing copy, not chat
 * machinery, and no other surface wants it.
 */
function Examples({ t, onPick }: { t: Dictionary["chat"]; onPick: (s: string) => void }) {
  return (
    <div className="mt-3">
      <h2 className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.suggestionsTitle}</h2>
      <ul className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {t.examples.map((ex) => (
          <li key={ex} className="sm:max-w-[22rem]">
            <button
              type="button"
              onClick={() => onPick(ex)}
              className="h-full w-full rounded-control border border-border-subtle bg-surface-page px-3 py-2.5 text-left text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg-primary"
            >
              {ex}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
