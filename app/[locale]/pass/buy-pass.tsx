"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/locales";

/**
 * The pay button. Asks the server for an invoice and goes to its page; the
 * server answers with OrangeCat's own sentence when it cannot make one, and
 * that sentence is shown as it is.
 */
export function BuyPass({ plan, locale, label, failed }: { plan: string; locale: Locale; label: string; failed: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/pay/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const body = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
      if (response.ok && body?.id) {
        router.push(`/${locale}/pass/checkout/${body.id}`);
        return;
      }
      setError(body?.message ? `${failed} ${body.message}` : failed);
    } catch {
      setError(failed);
    }
    setBusy(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={buy}
        disabled={busy}
        aria-busy={busy}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90 disabled:opacity-60"
      >
        {label}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm leading-relaxed text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
