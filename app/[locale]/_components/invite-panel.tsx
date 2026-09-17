"use client";

import { useState } from "react";
import { useClientValue } from "@/lib/browser/store";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";

/**
 * The invite link, for the organiser only.
 *
 * The token arrives as a prop from the server, which renders this panel ONLY
 * when `mayInvite` says so — a non-organiser gets no panel and therefore no
 * token in the document at all.
 *
 * An earlier version fetched it on mount instead, reasoning that a prop would
 * leave the credential in the page source. That was overstated: the page is
 * dynamic, noindex, membership-checked and served over TLS, and the token is
 * displayed in an input on that very page for the organiser to copy. A second
 * round trip moved it from one place the organiser can see to another, and
 * bought nothing. Rotation is what actually limits a leaked link.
 *
 * That rotation is offered here because it is the only way to un-invite a link
 * already sitting in somebody's WhatsApp — needed on the day they realise they
 * pasted it into the wrong chat.
 */
/** Stable identity: `useSyncExternalStore` calls this on every render. */
const readOrigin = () => window.location.origin;

export function InvitePanel({
  groupId,
  t,
  locale,
  token: initialToken,
}: {
  groupId: string;
  t: Dictionary["groups"];
  locale: Locale;
  token: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  // `window` does not exist during the server pass, and reading it during
  // render would hydrate a tree different from the one that was sent. This is
  // the same seam the browser stores use for exactly that shape of value.
  const origin = useClientValue(readOrigin, "");

  // Built in the browser so the link carries whatever origin the reader is
  // actually on, rather than one baked in at build time.
  const link = `${origin}${href(locale, `join/${token}`)}`;

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied — the field is selectable, so there is
      // still a way to get the link out.
    }
  }

  async function rotate() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { token: string };
        setToken(data.token);
        setCopied(false);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.inviteHint}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={link}
          aria-label={t.inviteTitle}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-11 min-w-0 flex-1 rounded-control border border-border-subtle bg-surface-raised px-3 font-mono text-xs text-fg-secondary focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={copy}
          disabled={!link}
          className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-surface-page disabled:opacity-50"
        >
          {copied ? t.copied : t.copyLink}
        </button>
      </div>

      <div className="mt-4 border-t border-border-subtle pt-4">
        <button
          type="button"
          onClick={rotate}
          disabled={busy}
          className="min-h-9 font-mono text-caption uppercase tracking-caps text-fg-muted underline underline-offset-4 transition-colors hover:text-accent disabled:opacity-50"
        >
          {t.rotate}
        </button>
        <p className="mt-1 text-sm text-fg-muted">{t.rotateHint}</p>
      </div>
    </div>
  );
}
