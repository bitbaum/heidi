import type { Metadata } from "next";
import { auth, authEnabled } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { dbConfigured } from "@/lib/db";
import { listTopics, listUpcomingRounds } from "@/lib/domain/speaking/store";
import type { Round, Topic } from "@/lib/domain/speaking/types";
import { PageHeader, Section, Shell } from "../_components/page-shell";
import { SpeakingPractice } from "../_components/speaking-practice";
import { RoundList } from "../_components/round-list";
import { TopicBoard } from "../_components/topic-board";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  // Indexed, unlike a study group: a scheduled conversation group is a public
  // thing, and somebody searching for one is looking for exactly this page.
  return { title: dict.speaking.title, description: dict.speaking.lead };
}

/**
 * Speaking rounds.
 *
 * THE ORDER OF THIS PAGE IS THE ORDER OF ITS OWN LEAD SENTENCE.
 *
 * "Webinars and circles on topics you propose. And in between: practise out
 * loud." So: what is coming up, then where those come from, then the practice
 * that fills the gap between them.
 *
 * It was built the other way round — practice first, because that is the half
 * that works signed out and needs no calendar to have anything in it. That
 * reasoning is real but it loses to a simpler test: read the lead, then look
 * at the page. They disagreed, and a reader resolves that disagreement by
 * deciding the page is about something other than what it says it is about.
 * The empty states are two short lines, and the practice section is one scroll
 * below them, so the cost of being honest about the subject is small.
 *
 * The lists are queried on the SERVER and passed down, like the groups list:
 * a signed-in visitor should not watch an empty box while a round trip fetches
 * what the session already had the credentials to read. Signed out, the
 * queries still run — the board and the calendar are public, because they are
 * the evidence that there is something here worth an account.
 *
 * With no database configured, the social half is simply absent and the
 * practice half still works, because it has no server side at all.
 */
export default async function SpeakingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.speaking;

  const configured = dbConfigured();
  const session = authEnabled && configured ? await auth() : null;
  const actorId = session?.actorId ?? null;

  let rounds: Round[] = [];
  let topics: Topic[] = [];
  if (configured) {
    // One failure here must not take the practice half down with it: the
    // recorder needs no database and a visitor who came to speak should not
    // meet an error page because Postgres is having a moment.
    [rounds, topics] = await Promise.all([
      listUpcomingRounds({ actorId, now: new Date() }).catch(() => []),
      listTopics(actorId).catch(() => []),
    ]);
  }

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.speaking} title={t.title} lead={t.lead} />
      <Section>
        {configured ? (
          <>
            <RoundList
              t={t}
              locale={locale}
              signedIn={Boolean(actorId)}
              actorId={actorId}
              rounds={rounds}
              topics={topics.filter((topic) => !topic.roundId).map((topic) => ({ id: topic.id, title: topic.title }))}
            />
            <TopicBoard t={t} signedIn={Boolean(actorId)} topics={topics} />
          </>
        ) : (
          <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.notConfigured}</p>
        )}

        <SpeakingPractice t={t} locale={locale} />
      </Section>
    </Shell>
  );
}
