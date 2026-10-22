"use client";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { usePush } from "./use-push";

/**
 * "Tell this device" — one card, on the channels page and in settings.
 *
 * Every state the browser can be in has a sentence and, where there is one,
 * a way forward: unsupported on an iPhone says how to add Heidi to the Home
 * Screen; denied says where to allow it again; unconfigured says it is the
 * server, not them. A state with no way forward is the dead end the fleet's
 * rule forbids.
 */
export function PushCard({ t, locale, signedIn, hasChannels }: { t: Dictionary["channels"]["notifications"]; locale: Locale; signedIn: boolean; hasChannels: boolean }) {
  const push = usePush(locale);

  if (!signedIn) return <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.signInFirst}</p>;

  const line = (() => {
    switch (push.status) {
      case "on":
        return t.on;
      case "unsupported":
        return push.needsHomeScreen ? t.ios : t.unsupported;
      case "denied":
        return t.denied;
      case "unconfigured":
        return t.unconfigured;
      case "error":
        return t.failed;
      case "working":
        return t.working;
      default:
        return hasChannels ? null : t.noChannels;
    }
  })();

  const canTurnOn = push.status === "off" || push.status === "error";

  return (
    <div>
      <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.body}</p>
      {line && (
        <p role="status" className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">
          {line}
        </p>
      )}
      {(canTurnOn || push.status === "on") && (
        <div className="mt-4">
          {push.status === "on" ? (
            <button
              type="button"
              onClick={() => void push.turnOff()}
              className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-5 text-sm font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-surface-page"
            >
              {t.turnOff}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void push.turnOn()}
              className="inline-flex min-h-11 items-center rounded-control bg-action px-5 text-sm font-medium text-on-action hover:opacity-90"
            >
              {t.turnOn}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
