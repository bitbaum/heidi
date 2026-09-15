import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth, authEnabled } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { dbConfigured } from "@/lib/db";
import { mayRead } from "@/lib/domain/conversations/rules";
import { asSoloMessages, conversationById, conversationsFor, messagesIn } from "@/lib/domain/conversations/store";
import { ChatWorkspace } from "../../_components/chat/workspace";
import { SignInToKeep } from "../sign-in-to-keep";

export const dynamic = "force-dynamic";

/**
 * Checked before the id reaches Postgres. `conversationById` casts to `uuid`,
 * and a cast that fails is a 500 in the server log for what is really just a
 * mistyped URL.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  // Somebody's private conversation. The title stays generic and the page
  // stays out of every index — a thread title IS their words, and putting it
  // in a <title> would leak it to anything that reads one.
  return { title: dict.chat.full.title, robots: { index: false, follow: false } };
}

/**
 * One saved conversation.
 *
 * Rendered on the server, so the thread is in the HTML rather than appearing
 * after a fetch — and so the ownership check happens before a single message
 * is serialised. `notFound()` rather than a 403 for a conversation that is not
 * yours, which is the same answer an id that never existed gets: whether a
 * given id names a real conversation is not a stranger's to learn.
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const session = authEnabled ? await auth() : null;
  const actorId = session?.actorId;
  if (!actorId || !dbConfigured() || !UUID.test(id)) notFound();

  const conversation = await conversationById(id);
  if (!mayRead(conversation, actorId)) notFound();

  const [messages, conversations] = await Promise.all([messagesIn(id), conversationsFor(actorId)]);

  return (
    <ChatWorkspace
      // A different conversation is a different component: `key` resets the
      // draft seed, the composer and the transport in one move, which an
      // effect synchronising four pieces of state could only approximate.
      key={id}
      locale={locale}
      dict={dict}
      signedIn
      signInSlot={authEnabled ? <SignInToKeep locale={locale} label={dict.chat.full.signInToKeep} /> : null}
      initialConversations={conversations.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt }))}
      initialConversationId={id}
      // Rows carry the OIDC sub; the transcript is built on the fixed
      // LEARNER_ID, so the mapping happens at this boundary and nowhere else.
      initialMessages={asSoloMessages(messages, actorId)}
    />
  );
}
