import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { href } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Pick up where you left off.
 *
 * A server component with no client JavaScript: the page already has the rows,
 * so there is nothing to fetch and nothing to hydrate. It is a list of links.
 *
 * Titles are the learner's own first message, so they are rendered as text and
 * never as anything else — and the list is short on purpose. A dashboard panel
 * that reprints an entire history is an archive; the question this answers is
 * "what was I in the middle of", and the answer is the top few.
 */
export function RecentConversations({
  conversations,
  t,
  locale,
  untitled,
}: {
  conversations: { id: string; title: string; updatedAt: string }[];
  t: Dictionary["review"];
  locale: Locale;
  /** From `chat.full.untitled` — a thread whose first message never landed. */
  untitled: string;
}) {
  if (conversations.length === 0) {
    return <p className="text-sm text-fg-muted">{t.recentEmpty}</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {conversations.slice(0, 5).map((c) => (
        <li key={c.id}>
          <Link
            href={`${href(locale, "chat")}/${c.id}`}
            className="block truncate rounded-control px-2.5 py-2 text-sm text-fg-secondary transition-colors hover:bg-surface-raised hover:text-fg-primary"
          >
            {c.title || untitled}
          </Link>
        </li>
      ))}
    </ul>
  );
}
