import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, authEnabled } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { dbConfigured } from "@/lib/db";
import { groupById, membersOf, messagesIn } from "@/lib/domain/groups/store";
import { visibleMessages } from "threadkit";
import { groupThread, mayInvite, mayPost } from "@/lib/domain/groups/rules";
import { decodeAnswer } from "@/lib/domain/chat/answer";
import type { ChatMessage } from "@/lib/domain/chat/types";
import { PageHeader, Section, Shell } from "../../_components/page-shell";
import { GroupChat } from "../../_components/group-chat";
import { InvitePanel } from "../../_components/invite-panel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  // A private room is not a page for a search engine, and a sitemap that
  // advertised it would contradict this.
  return { title: dict.groups.title, robots: { index: false, follow: false } };
}

/**
 * One study group.
 *
 * Membership is checked on the SERVER, before anything renders. A client-side
 * check would ship the group's name and member list to whoever asked for the
 * URL and then hide it with CSS, which is not a check.
 *
 * A non-member gets `notFound()` rather than a refusal, because whether a
 * given id is a real group is not theirs to learn.
 */
export default async function GroupPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.groups;

  if (!dbConfigured() || !authEnabled) {
    return (
      <Shell>
        <PageHeader eyebrow={t.title} title={t.title} />
        <Section>
          <p className="max-w-measure text-base text-fg-secondary">{t.notConfigured}</p>
        </Section>
      </Shell>
    );
  }

  const session = await auth();
  const actorId = session?.actorId;
  if (!actorId) {
    return (
      <Shell>
        <PageHeader eyebrow={t.title} title={t.title} />
        <Section>
          <p className="max-w-measure text-base text-fg-secondary">{t.signInFirst}</p>
          <Link
            href={href(locale, "portal")}
            className="mt-4 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {t.back}
          </Link>
        </Section>
      </Shell>
    );
  }

  const group = await groupById(id);
  if (!group) notFound();

  const members = await membersOf(group.id);
  if (!mayPost(members, actorId)) notFound();

  // The thread is rendered on the SERVER for the first paint — no loading
  // flash, and no fetch-on-mount. The client only polls for what arrives
  // afterwards. Visibility is threadkit's, applied here exactly as the API
  // route applies it, so the two cannot disagree about what this reader sees.
  const all = await messagesIn(group.id);
  const thread = groupThread(group, members);
  const allowed = new Set(
    visibleMessages(
      thread,
      actorId,
      all.map((m) => ({
        id: m.id,
        threadId: group.id,
        authorId: m.authorId,
        body: m.body,
        createdAt: new Date(m.createdAt),
      })),
    ).map((m) => m.id),
  );
  // `answer` comes back out of jsonb as `unknown`, written by whichever
  // version of the prompt was live that day. Decoding rather than casting is
  // what lets the shared transcript render it at all — the group used to give
  // up here and show the plain body, which is why nobody in a group has ever
  // seen a gloss.
  const initialMessages: ChatMessage[] = all
    .filter((m) => allowed.has(m.id))
    .map((m) => {
      const answer = decodeAnswer(m.answer);
      return {
        id: m.id,
        authorId: m.authorId,
        body: m.body,
        createdAt: m.createdAt,
        ...(answer ? { answer } : {}),
      };
    });
  const initialMembers = members
    .filter((m) => !m.leftAt)
    .map((m) => ({ actorId: m.actorId, displayName: m.displayName }));

  return (
    <Shell>
      <PageHeader eyebrow={`${initialMembers.length} ${t.members}`} title={group.name} />

      <Section>
        <GroupChat
          groupId={group.id}
          t={t}
          chatT={dict.chat}
          modelT={dict.model}
          locale={locale}
          me={actorId}
          initialMessages={initialMessages}
          initialMembers={initialMembers}
        />
      </Section>

      {/* Only the organiser. The panel is not rendered at all for anyone else
          — there is no token in the HTML to find with a dev console. */}
      {mayInvite(group.createdBy, actorId) && (
        <Section title={t.inviteTitle}>
          <InvitePanel groupId={group.id} t={t} locale={locale} token={group.inviteToken!} />
        </Section>
      )}

      <Section>
        <Link
          href={href(locale, "portal")}
          className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
        >
          {t.back}
        </Link>
      </Section>
    </Shell>
  );
}
