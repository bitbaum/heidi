"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/i18n/fill";
import { plural } from "@/lib/i18n/plural";
import type { Locale } from "@/lib/i18n/locales";
import { dueCount } from "@/lib/domain/practice/memory";
import { useBrowserStore } from "@/lib/browser/store";
import { RESUME_WITHIN_MS } from "@/lib/domain/practice/resume";
import { sessionStore } from "../practice-stores";
import { useMemoryView } from "../sync-stores";

/**
 * The way into the session screen from `/practice`: one button, and — when
 * this same sitting was left half way — the place it was left.
 *
 * The questions are not on the page any more (`session/frame.tsx`), so this is
 * what the chooser above configures. "Weitermachen — Frage 4 von 8" instead of
 * "Losgehen" is the only difference a half-done sitting makes, because opening
 * the screen picks it up by itself (`resume.ts`).
 */
export function StartCard({
  sessionHref,
  sessionKey,
  test,
  t,
  sessionT,
  locale,
  ids,
}: {
  sessionHref: string;
  sessionKey: string;
  /** The test has its own button, and never resumes. */
  test: boolean;
  t: Dictionary["practice"];
  sessionT: Dictionary["session"];
  locale: Locale;
  /** The questions this sitting draws from, for the due count. Absent: all of them. */
  ids?: readonly string[];
}) {
  const saved = useBrowserStore(sessionStore);
  const memory = useMemoryView();
  const [now] = useState(Date.now);
  const due = test ? 0 : dueCount(memory, new Date(now), ids);
  const resumable =
    !test &&
    saved?.key === sessionKey &&
    saved.at < saved.ids.length &&
    now - Date.parse(saved.savedAt) <= RESUME_WITHIN_MS;

  const label = resumable
    ? fill(sessionT.resume, { n: String(saved.at + 1), total: String(saved.ids.length) })
    : test
      ? t.testStart
      : t.start;

  return (
    <div className="mb-8 max-w-measure">
      <Link
        href={sessionHref}
        className="flex min-h-14 w-full items-center justify-between gap-3 rounded-control bg-action px-6 text-lg font-semibold text-on-action hover:opacity-90 sm:w-auto sm:justify-start"
      >
        {label}
        <span aria-hidden="true">→</span>
      </Link>
      {/* Why the first questions are ones already seen: they are due. */}
      {due > 0 && <p className="mt-3 text-sm text-fg-secondary">{plural(t.dueToday, due, locale)}</p>}
    </div>
  );
}
