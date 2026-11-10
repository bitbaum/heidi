"use client";

import { useEffect, useSyncExternalStore } from "react";
import { notFoundLocale } from "@/lib/i18n/not-found";

type Words = Record<string, { title: string; body: string; home: string }>;

const FALLBACK = "de";

const noSubscription = () => () => {};

export function LocalizedNotFound({ words }: { words: Words }) {
  // The URL and the browser's languages do not change while this page is open,
  // so this is read once on the client; the server renders German, the default.
  const locale = useSyncExternalStore(
    noSubscription,
    () => notFoundLocale(Object.keys(words), window.location.pathname, navigator.languages ?? [navigator.language], FALLBACK),
    () => FALLBACK,
  );
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const t = words[locale] ?? words[FALLBACK]!;
  return (
    <main style={{ maxWidth: "36rem", margin: "0 auto", padding: "4rem 1.25rem" }}>
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">404</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-display text-fg-primary">{t.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-fg-secondary">{t.body}</p>
      <a
        href={`/${locale}`}
        className="mt-8 inline-flex min-h-11 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
      >
        {t.home}
      </a>
    </main>
  );
}
