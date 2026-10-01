"use client";

import type { RefObject } from "react";
import {
  Composer as ChatkitComposer,
  type ComposerLabelOverrides,
} from "@bitbaum/chatkit/react";
import type { Attachment } from "@bitbaum/chatkit";
import type { Locale } from "@/lib/i18n/locales";
import { LOCALE_TAGS } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n";
import { MAX_BYTES, MAX_EDGE, MAX_IMAGES } from "@/lib/domain/chat/image";

/** Heidi's server leg for the microphone: one model, behind the dictation limit. */
const TRANSCRIBE_URL = "/api/transcribe";

/** Where chatkit remembers a dead speech recogniser — listed in `lib/config/privacy.ts`. */
const DICTATION_VERDICT_KEY = "heidi.dictation.recogniser-dead.v1";

/**
 * THE composer — now the fleet's: `@bitbaum/chatkit`'s Composer, with Heidi's
 * words in its labels and Heidi's transcription route as the microphone's
 * server leg. Every surface (the page, the dock, the full-screen chat, a
 * group) keeps this one API.
 *
 * Until 2026-10-01 this file WAS a composer — its own textarea, its own
 * dictation hook, its own screenshot handling — and the microphone was the
 * part that kept failing: browser recogniser first, so on a browser whose
 * recogniser accepts `start()` and then says nothing, a press did nothing for
 * seconds before falling back. A fix to composing belongs in bitbaum/chatkit,
 * where every product gets it, never here. Only Heidi's wiring lives here.
 *
 * Voice PREFERS THE SERVER, like Loki: one transcription model everywhere, no
 * dead seconds on a silent recogniser. chatkit still falls back to the
 * browser's recogniser, and says why in words when neither can work.
 *
 * Pictures are shrunk to MAX_EDGE in the browser by chatkit (its
 * `maxImageEdge`, which came from Heidi's own downscale) and reach the caller
 * as data URLs, the shape `/api/chat` validates. A dropped text file is not
 * lost: its words are added to the message.
 */
export function Composer({
  value,
  onChange,
  onSend,
  busy,
  onStop,
  t,
  modelT,
  placeholder,
  locale,
  images = false,
  dictation = true,
  footer,
  className,
  sticky,
  inputRef,
  autoFocus,
}: {
  value: string;
  onChange: (next: string) => void;
  /** What was written, and the pictures with it as data URLs. */
  onSend: (text: string, images: string[]) => void;
  busy: boolean;
  /** Given, the send slot becomes Stop while `busy`. */
  onStop?: () => void;
  t: Dictionary["chat"];
  modelT: Dictionary["model"];
  placeholder: string;
  locale: Locale;
  /** This surface takes screenshots. */
  images?: boolean;
  dictation?: boolean;
  /** A line under the box: the group's "write Heidi's name" hint lives here. */
  footer?: React.ReactNode;
  className?: string;
  sticky?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  autoFocus?: boolean;
}) {
  const fill = (template: string, values: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (_, key: string) =>
      String(values[key] ?? ""),
    );

  const labels: ComposerLabelOverrides = {
    send: t.send,
    stop: t.stop,
    voice: t.mic,
    voiceStop: t.micStop,
    cancelRecording: t.micCancel,
    confirmRecording: t.micDone,
    listening: t.micListening,
    transcribing: t.micTranscribing,
    attach: modelT.attach,
    remove: (name) => fill(t.removeNamed, { name }),
    dismiss: t.dismiss,
    dictation: t.micProblem,
    attachNotes: {
      wrongType: (name) => fill(t.attachNotes.wrongType, { name }),
      imageTooLarge: (name, mb) =>
        fill(t.attachNotes.imageTooLarge, { name, mb }),
      textTooLarge: (name) => fill(t.attachNotes.textTooLarge, { name }),
      unreadable: (name) => fill(t.attachNotes.unreadable, { name }),
      tooMany: (max) => fill(t.attachNotes.tooMany, { max }),
    },
  };

  return (
    <div
      // Sticky only where there IS something to scroll past. In an empty
      // thread it pinned the composer over the panel above and clipped it.
      className={`z-10 bg-surface-page pb-1 pt-1 ${sticky ? "sticky bottom-0" : ""} ${className ?? ""}`}
    >
      <ChatkitComposer
        value={value}
        onValueChange={onChange}
        onSend={(text, attachments) => onSend(...fromWire(text, attachments))}
        placeholder={placeholder}
        ariaLabel={t.placeholder}
        sending={busy}
        onStop={onStop}
        attach={
          images
            ? {
                maxFiles: MAX_IMAGES,
                maxImageEdge: MAX_EDGE,
                maxImageBytes: MAX_BYTES,
              }
            : false
        }
        // A screenshot alone is the commonest question there is.
        attachmentOnlyText={images ? t.exampleUnderstand : undefined}
        voice={
          dictation
            ? {
                transcribeUrl: TRANSCRIBE_URL,
                prefer: "server",
                lang: LOCALE_TAGS[locale],
                // The key the privacy page names and "delete everything" clears.
                rememberKey: DICTATION_VERDICT_KEY,
              }
            : false
        }
        footer={footer}
        labels={labels}
        inputRef={inputRef}
        autoFocus={autoFocus}
      />
    </div>
  );
}

/** chatkit's wire shape → what Heidi's conversation sends. */
export function fromWire(
  text: string,
  attachments: Attachment[],
): [string, string[]] {
  const pictures: string[] = [];
  const words = [text];
  for (const a of attachments) {
    if (a.kind === "image")
      pictures.push(`data:${a.mimeType};base64,${a.dataBase64}`);
    else words.push(a.content);
  }
  return [words.filter((w) => w.trim()).join("\n\n"), pictures];
}
