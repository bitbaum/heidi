import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";

/** The door from the register to your own channels: one card, one action. */
export function ChannelsInvite({ t, locale }: { t: Dictionary["channels"]["invite"]; locale: Locale }) {
  return (
    <Link
      href={href(locale, "channels")}
      className="group mt-10 flex max-w-measure flex-col gap-3 rounded-control border border-border-subtle px-4 py-3 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <span className="min-w-0">
        <span className="block font-medium text-fg-primary">{t.title}</span>
        <span className="block text-sm text-fg-secondary">{t.body}</span>
      </span>
      <span className="shrink-0 self-start text-sm font-medium text-fg-primary underline underline-offset-4 group-hover:text-accent">{t.cta} →</span>
    </Link>
  );
}
