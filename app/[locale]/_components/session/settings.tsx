"use client";

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { useDismiss } from "../use-dismiss";

/**
 * What this sitting is — "Im Spital · Gemischt" — and, behind it, the choices.
 *
 * AFTER STARTING, NOT BEFORE. Every way into practice opens the first question
 * directly, because a choice asked before anything happens is a decision the
 * learner has to make to find out whether they wanted to make it. The choices
 * still exist, one tap away from where the learner already is: what to
 * practise (this scene, or everything), how (tap, write, cards) and whether it
 * is a test. Each is a link that replaces the sitting, so closing still goes
 * back to the page the learner came from.
 */
export function SessionSettings({
  label,
  scopes,
  t,
  children,
}: {
  /** The sitting in a few words, on the chip. */
  label: string;
  /** What else this could be about, with the current one marked. Hidden when there is no choice. */
  scopes: ReadonlyArray<{ label: string; href: string; current: boolean }>;
  t: Dictionary["session"];
  /** How and whether it is a test: the practice chooser, pointed at this screen. */
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss({ open, onDismiss: close, containerRef: panel, focusRef: trigger });

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`${t.adjust}: ${label}`}
        className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-border-subtle px-3 text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg-primary"
      >
        <span className="min-w-0 truncate">{label}</span>
        <SlidersIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/50 sm:items-center sm:p-6">
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            className="max-h-[85dvh] w-full overflow-y-auto overscroll-contain rounded-t-card border border-border-subtle bg-surface-page px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-lg sm:max-w-xl sm:rounded-card"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id={`${id}-title`} className="font-heading text-lg font-semibold tracking-display text-fg-primary">
                {t.adjustTitle}
              </h2>
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-11 items-center rounded-control px-3 text-sm font-medium text-fg-primary hover:bg-surface-raised"
              >
                {t.finish}
              </button>
            </div>

            {scopes.length > 1 && (
              <div className="mb-6">
                <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.what}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {scopes.map((scope) => (
                    <Link
                      key={scope.href}
                      href={scope.href}
                      replace
                      aria-current={scope.current ? "page" : undefined}
                      className={`min-w-0 flex-1 basis-[calc(50%-0.25rem)] rounded-control border px-4 py-3 text-left font-heading text-base font-semibold tracking-display sm:flex-none sm:basis-auto ${
                        scope.current
                          ? "border-action bg-action text-on-action"
                          : "border-border-strong text-fg-primary hover:bg-surface-raised"
                      }`}
                    >
                      {scope.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {children}
          </div>
        </div>
      )}
    </>
  );
}

function SlidersIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" strokeLinecap="round" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}
