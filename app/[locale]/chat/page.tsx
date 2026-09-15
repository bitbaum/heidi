import type { Metadata } from "next";
import { auth, authEnabled } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { dbConfigured } from "@/lib/db";
import { conversationsFor } from "@/lib/domain/conversations/store";
import { ChatWorkspace } from "../_components/chat/workspace";
import { SignInToKeep } from "./sign-in-to-keep";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.chat.full.title, description: dict.meta.description };
}

/**
 * The chat, full screen.
 *
 * Signed in, the sidebar is queried HERE rather than fetched on mount: the
 * page already has the session, so the list arrives with the HTML instead of
 * after a round trip that shows an empty sidebar first. Signed out it costs no
 * query at all, because there is nothing to query — the conversation is in the
 * visitor's own browser.
 */
export default async function ChatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const session = authEnabled ? await auth() : null;
  const actorId = session?.actorId;
  const signedIn = Boolean(actorId);

  const conversations = signedIn && dbConfigured() ? await conversationsFor(actorId!) : [];

  return (
    <ChatWorkspace
      // A different conversation is a different component: `key` resets the
      // draft seed, the composer and the transport in one move, which an
      // effect synchronising four pieces of state could only approximate.
      key="new"
      locale={locale}
      dict={dict}
      signedIn={signedIn}
      signInSlot={authEnabled ? <SignInToKeep locale={locale} label={dict.chat.full.signInToKeep} /> : null}
      initialConversations={conversations.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt }))}
    />
  );
}
