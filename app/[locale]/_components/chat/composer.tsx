"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { LOCALE_TAGS } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n";
import { useDictation } from "../use-dictation";
import { imagesFromClipboard } from "../downscale";
import { ClipIcon, MicIcon, SendIcon } from "./icons";

/**
 * The box you type in.
 *
 * Every surface had its own before this. The group's was a bare `<input>`: no
 * auto-grow, no Enter/Shift-Enter handling, no paste-an-image, no dictation —
 * not because a group wants less, but because the second copy was written from
 * scratch and stopped earlier.
 *
 * Capability is passed in rather than assumed. Omit `images` and there is no
 * clip button; omit `dictation` and there is no microphone. That is how one
 * component serves a surface that takes pictures and one that does not, without
 * either of them growing a fork.
 */
export function Composer({
  value,
  onChange,
  onSubmit,
  busy,
  t,
  modelT,
  placeholder,
  locale,
  id = "chat-input",
  images,
  dictation: dictationEnabled = true,
  footer,
  className,
  sticky,
  autoFocus,
  labelledOutside,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  busy: boolean;
  t: Dictionary["chat"];
  modelT: Dictionary["model"];
  placeholder: string;
  locale: Locale;
  /**
   * The id the box claims, and the one its label points at.
   *
   * A prop rather than a constant because two composers can now be in one
   * document: the dock floats over the home page, which has its own. `htmlFor`
   * resolves to the FIRST match in the document, so a duplicate id silently
   * hands the dock's label to the page's box — the reader tabs into one
   * control and hears the name of another.
   *
   * Defaulted, not required, so the surfaces that were here first keep the id
   * their visible labels already reference.
   */
  id?: string;
  /** Absent means this surface takes no pictures. */
  images?: {
    attached: string[];
    onAccept: (files: File[]) => void;
    onRemove: (index: number) => void;
    error: string | null;
    /** False when no connected model can see — the button explains rather than greys out. */
    enabled: boolean;
    onNeedsKey: () => void;
  };
  dictation?: boolean;
  /** A line under the box: the group's "write Heidi's name" hint lives here. */
  footer?: React.ReactNode;
  className?: string;
  sticky?: boolean;
  autoFocus?: boolean;
  /**
   * The caller renders its own visible `<label htmlFor="chat-input">`.
   *
   * Two labels for one control is a bug, not redundancy: a screen reader
   * announces the sentence, then announces it again. The home page shows the
   * invitation as a real label before a conversation starts, so the sr-only
   * one here must stand down while that is on screen.
   */
  labelledOutside?: boolean;
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const speech = useDictation(LOCALE_TAGS[locale], (heard) => {
    onChange(value ? `${value} ${heard}` : heard);
    areaRef.current?.focus();
  });

  const grow = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // Capped so a pasted conversation cannot eat the whole screen and push the
    // send button out of reach on a phone.
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(grow, [value, grow]);

  const submit = () => {
    if (busy || !value.trim()) return;
    onSubmit();
  };

  const accept = (files: File[]) => {
    if (!images) return;
    if (!images.enabled) {
      images.onNeedsKey();
      return;
    }
    images.onAccept(files);
  };

  return (
    <form
      // Sticky only where there IS something to scroll past. In an empty
      // thread it pinned the composer over the panel above and clipped it.
      className={`z-10 bg-surface-page pb-1 pt-1 ${sticky ? "sticky bottom-0" : ""} ${className ?? ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {images && images.attached.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2" aria-label={modelT.imagesLabel}>
          {images.attached.map((src, i) => (
            <li key={src.slice(-24)} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- a
                  client-side data URL; next/image optimises remote files and
                  would only add a round trip here. */}
              <img src={src} alt="" className="h-16 w-16 rounded-control border border-border-strong object-cover" />
              <button
                type="button"
                onClick={() => images.onRemove(i)}
                aria-label={modelT.remove}
                className="absolute -right-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border-strong bg-surface-raised text-xs text-fg-secondary hover:text-accent"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {images?.error && (
        <p role="alert" className="mb-2 px-1 text-sm text-accent">
          {images.error}
        </p>
      )}

      <div
        className="flex items-end gap-2 rounded-control border border-border-strong bg-surface-raised p-2 focus-within:border-accent"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const files = imagesFromClipboard(e.dataTransfer);
          if (files.length > 0) {
            e.preventDefault();
            accept(files);
          }
        }}
      >
        {!labelledOutside && (
          <label htmlFor={id} className="sr-only">
            {t.placeholder}
          </label>
        )}
        <textarea
          id={id}
          ref={areaRef}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends on a keyboard; Shift+Enter is a newline. On a phone
            // there is no Shift, so the button is the only send — which is why
            // it is always visible rather than appearing on input.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          onPaste={(e) => {
            // How a screenshot actually arrives: Cmd+V straight into the box.
            const files = imagesFromClipboard(e.clipboardData);
            if (files.length > 0) {
              e.preventDefault();
              accept(files);
            }
          }}
          rows={1}
          maxLength={2000}
          // Short and visible; the full sentence is the accessible label above.
          placeholder={placeholder}
          className="max-h-[200px] min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-base leading-relaxed text-fg-primary placeholder:text-fg-muted focus:outline-none"
        />

        {images && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                accept(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
            {/* Always visible, never disabled. Without a vision model it opens
                the explanation instead of doing nothing — a greyed-out button
                with a tooltip teaches nobody why. */}
            <button
              type="button"
              onClick={() => (images.enabled ? fileRef.current?.click() : images.onNeedsKey())}
              aria-label={images.enabled ? modelT.attach : modelT.attachNeedsKey}
              title={images.enabled ? modelT.attach : modelT.attachNeedsKey}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-border-strong text-fg-secondary transition-colors hover:text-fg-primary"
            >
              <ClipIcon />
            </button>
          </>
        )}

        {dictationEnabled && speech.supported && (
          <button
            type="button"
            onClick={speech.toggle}
            disabled={speech.transcribing}
            aria-label={speech.listening ? t.micStop : t.mic}
            aria-pressed={speech.listening}
            aria-busy={speech.transcribing}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border transition-colors disabled:opacity-50 ${
              speech.listening
                ? "border-accent bg-accent text-on-accent"
                : "border-border-strong text-fg-secondary hover:text-fg-primary"
            }`}
          >
            <MicIcon />
          </button>
        )}

        <button
          type="submit"
          disabled={busy || !value.trim()}
          aria-label={t.send}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-accent text-on-accent transition-colors disabled:bg-surface-sunk disabled:text-fg-muted"
        >
          <SendIcon />
        </button>
      </div>

      {dictationEnabled && (speech.listening || speech.transcribing) && (
        <p role="status" className="mt-1 px-1 font-mono text-caption uppercase tracking-caps text-accent">
          {speech.transcribing ? t.micTranscribing : t.micListening}
        </p>
      )}
      {dictationEnabled && speech.problem && (
        <p role="alert" className="mt-1 px-1 text-sm text-fg-muted">
          {t.micProblem[speech.problem]}
        </p>
      )}

      {footer}
    </form>
  );
}
