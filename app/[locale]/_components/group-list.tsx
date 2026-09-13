"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";

type Group = { id: string; name: string; createdBy: string; createdAt: string; memberCount: number };

/**
 * The groups you are in, and a way to open another.
 *
 * The list is rendered on the SERVER and passed in. An earlier version fetched
 * it on mount, which meant a signed-in visitor watched an empty box until the
 * round trip finished, and the portal shipped a loading state for data it
 * already had the session to query. The server skips the query entirely when
 * nobody is signed in, so the signed-out case costs nothing either way.
 *
 * After creating one, `router.refresh()` re-runs the server component rather
 * than this file keeping a second copy of the list in sync by hand.
 */
export function GroupList({
  t,
  locale,
  signedIn,
  groups,
}: {
  t: Dictionary["groups"];
  locale: Locale;
  signedIn: boolean;
  groups: Group[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        setError(t.failed);
        return;
      }
      setName("");
      router.refresh();
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) {
    return <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.signInFirst}</p>;
  }

  return (
    <div>
      <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.lead}</p>

      {groups.length === 0 && <p className="mt-4 font-mono text-sm text-fg-muted">{t.empty}</p>}

      {groups.length > 0 && (
        <ul className="mt-5 grid gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle sm:grid-cols-2">
          {groups.map((g) => (
            <li key={g.id} className="bg-surface-page">
              <Link
                href={href(locale, `groups/${g.id}`)}
                className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-raised"
              >
                <span className="min-w-0">
                  <span className="block truncate font-heading text-lg leading-tight tracking-display text-fg-primary">
                    {g.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-caps text-fg-muted">
                    {g.memberCount} {t.members}
                  </span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-fg-muted">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={create} className="mt-8 border-t border-border-subtle pt-6">
        <h3 className="font-heading text-lg font-semibold leading-tight tracking-display text-fg-primary">
          {t.createTitle}
        </h3>
        <p className="mt-1 max-w-measure text-sm leading-relaxed text-fg-secondary">{t.createHint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <label htmlFor="group-name" className="sr-only">
            {t.createTitle}
          </label>
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder={t.namePlaceholder}
            className="min-h-11 flex-1 rounded-control border border-border-strong bg-surface-raised px-3 text-base text-fg-primary placeholder:text-fg-muted focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="inline-flex min-h-11 items-center rounded-control bg-accent px-5 font-medium text-on-accent transition-colors disabled:bg-surface-sunk disabled:text-fg-muted"
          >
            {busy ? t.creating : t.create}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-accent">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
