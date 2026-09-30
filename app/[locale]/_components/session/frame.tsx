"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { ActionSlot } from "../exercises/actions";
import { useKeyboardViewport } from "../use-keyboard-viewport";

/**
 * The screen an exercise session runs in: close, progress, the question, and
 * one bar at the bottom for the answer buttons.
 *
 * WHY A SCREEN AND NOT A SECTION OF A PAGE. Practice used to be the fifth
 * thing on `/practice`, under the streak, the warm-up invitation, two rows of
 * choices and the focus panel — the first question began 1,072px down on a
 * phone, and everything above it changed height as answers came in, so the
 * question moved under the learner's thumb after every answer (iOS Safari has
 * no scroll anchoring to hide it). An app does not do that because its
 * exercise is not on a page at all. Neither is this one: the route marks
 * itself `data-chrome="session"`, `globals.css` drops the site header and
 * footer, and the body is exactly the visible screen.
 *
 * THREE ROWS, AND ONLY THE MIDDLE ONE SCROLLS. The top bar and the action bar
 * are fixed parts of the layout rather than floating over it, so nothing ever
 * covers the question, and a verdict arriving at the bottom shrinks the middle
 * instead of pushing it. A new question (`scrollKey`) starts at the top.
 *
 * THE KEYBOARD. `--app-height` is what the on-screen keyboard leaves visible
 * (`use-keyboard-viewport.ts`), pinned like the full-screen chat, so writing a
 * sentence keeps "Prüfen" directly above the keys.
 *
 * On a wide screen it is the same screen, centred at a reading width, and the
 * number keys and Enter still answer.
 */
export function SessionFrame({
  t,
  closeHref,
  progress,
  aside,
  scrollKey,
  children,
}: {
  t: Dictionary["session"];
  /** Where closing goes: the page the session was opened from. */
  closeHref: string;
  /** How far along, as a bar. Position only — never how well it is going. */
  progress?: { at: number; total: number; label: string };
  /** Beside the progress: a clock, when the learner asked for one. */
  aside?: React.ReactNode;
  scrollKey?: string;
  children?: React.ReactNode;
}) {
  useKeyboardViewport({ pin: true });
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [scrollKey]);

  const share = progress && progress.total > 0 ? Math.min(1, progress.at / progress.total) : 0;

  return (
    <div data-chrome="session" className="flex min-h-0 w-full flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-6">
        <Link
          href={closeHref}
          replace
          aria-label={t.close}
          className="grid size-11 shrink-0 place-items-center rounded-control text-fg-secondary transition-colors hover:bg-surface-raised hover:text-fg-primary"
        >
          <CloseIcon />
        </Link>
        {progress && (
          <>
            <div
              role="progressbar"
              aria-label={progress.label}
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.at}
              className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-border-subtle"
            >
              <div
                className="h-full rounded-full bg-fg-primary transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${Math.round(share * 100)}%` }}
              />
            </div>
            <span aria-hidden="true" className="shrink-0 font-mono text-caption tabular-nums text-fg-muted">
              {Math.min(progress.at + 1, progress.total)}/{progress.total}
            </span>
          </>
        )}
        {!progress && <div className="flex-1" />}
        {aside}
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-2 sm:px-6">
          <ActionSlot.Provider value={slot}>{children}</ActionSlot.Provider>
        </div>
      </div>

      {/* The answer bar. Empty — while the options themselves are the answer —
          it takes no room at all. */}
      <div
        ref={setSlot}
        className="border-t border-border-subtle bg-surface-page px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 empty:hidden sm:px-6"
      />
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
