import { auth, authEnabled, signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DOMAINS } from "@/lib/situations/display";
import { PACK_ITEMS } from "@/lib/domain/practice/published";
import { askableLines } from "@/lib/domain/practice/situation-strength";
import { SituationBoard } from "./situation-board";
import { type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { afterSignIn } from "@/lib/domain/preferences/language";
import { Shell } from "./page-shell";
import { CowMark } from "./cow-mark";
import { SavedWords } from "./saved-words";
import { GroupList } from "./group-list";
import { ReviewPanel } from "./review-panel";
import { FocusPanel } from "./focus-panel";
import { PatternsPanel } from "./patterns-panel";
import { MasteredPanel } from "./mastered-panel";
import { RecentConversations } from "./recent-conversations";
import { dbConfigured } from "@/lib/db";
import { groupsFor } from "@/lib/domain/groups/store";
import { conversationsFor } from "@/lib/domain/conversations/store";
import { TodayPanel } from "./today-panel";
import { WarmupInvite } from "./warmup-invite";

/**
 * The learner's own page, wherever it is rendered.
 *
 * Lifted out of `/portal` so that `/` can render it too. Signed in, the locale
 * root IS this — George's framing: "once we build dashboard, start could be
 * dashboard, otherwise it is a public page."
 *
 * A COMPONENT, NOT A REWRITE. The first attempt at "different page, same
 * address" was a middleware rewrite, and it took production down for every
 * signed-in visitor: `nextUrl.clone()` inherits the external protocol behind
 * Caddy, so Next dialled TLS at an http socket. Nothing in the test suite
 * could see it, because the failure needs a real reverse proxy. Deciding in
 * the PAGE reconstructs no URL and guesses no protocol.
 */

export async function Dashboard({ locale }: { locale: Locale }) {
  const scenes = DOMAINS.flatMap((domain) =>
    domain.scenes.map((scene) => ({
      id: scene.id,
      title: getDictionary(locale).situations.scenes[scene.id as keyof ReturnType<typeof getDictionary>["situations"]["scenes"]]?.title ?? scene.id,
    })),
  );
  const askableByScene = Object.fromEntries(
    [...askableLines(PACK_ITEMS)].map(([scene, lines]) => [scene, [...lines].sort((a, b) => a - b)]),
  );
  const dict = getDictionary(locale);
  const t = dict.auth;
  const session = authEnabled ? await auth() : null;
  const signedIn = Boolean(session?.actorId);

  // Queried here rather than fetched on mount: the page already has the
  // session, and a signed-out visitor costs no query at all. In parallel,
  // because neither answer depends on the other and this page is now the
  // signed-in landing surface — two round trips in series would be felt.
  const [groups, conversations] = signedIn && dbConfigured()
    ? await Promise.all([groupsFor(session!.actorId!), conversationsFor(session!.actorId!)])
    : [[], []];

  return (
    <Shell>
      {/* A personal space is the one page that may be warm. The pattern is
          6% black — felt, not read — and it stops at the rule, so the working
          part of the page stays plain. */}
      <header className="-mx-5 flex items-start gap-4 bg-hide px-5 py-8 sm:-mx-8 sm:px-8 sm:py-10">
        <CowMark size={44} className="mt-1 shrink-0 text-fg-primary" />
        <div>
          <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
            {t.portalTitle}
          </h1>
          <p className="mt-3 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.portalLead}</p>
        </div>
      </header>

      {/*
        ONE COLUMN, IN THE ORDER SOMEBODY ASKS THE QUESTIONS.

        What does today want from me, and where do I start? Then: what am I
        working on, what can I already do? Then the things that are mine —
        words, conversations, groups.

        It was a jump strip of seven links beside eleven stacked sections, six
        of them empty boxes on a new account ("nothing yet — practise and this
        fills in"), flush against each other, with four different buttons that
        all meant "practise". A section that has nothing to show now renders
        nothing; the strip went with them, because a table of contents for a
        page this short only ever pointed at the empty parts.

        The gap between blocks is set HERE, once. Panels carry no outer margin,
        so no two of them can disagree about spacing again.
      */}
      <div className="flex flex-col gap-12 border-t border-border-subtle pt-8 pb-4 lg:pt-10">
        <WarmupInvite t={dict.warmup} locale={locale} variant="card" />

        <TodayPanel t={dict.streak} locale={locale} askLabel={dict.nav.quickChat} dueQuestions={dict.practice.dueToday} />

        {/* Progress: each renders nothing until it has something true to say. */}
        <FocusPanel t={dict.practice} grammarT={dict.grammar} situationsT={dict.situations} locale={locale} />
        <SituationBoard scenes={scenes} askable={askableByScene} t={dict.situations} locale={locale} />
        <MasteredPanel t={dict.review} grammarT={dict.grammar} vocabularyT={dict.vocabulary} locale={locale} />
        <PatternsPanel t={dict.review} />

        {/* THEIR WORDS, one section: the ones due are asked first, then the
            whole list. It works signed out — it all lives in this browser. */}
        <section aria-labelledby="words-heading" id="words" className="scroll-mt-anchor">
          <h2 id="words-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {dict.saved.title}
          </h2>
          <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{dict.saved.lead}</p>
          <ReviewPanel t={dict.review} />
          <div className="mt-6">
            <SavedWords t={dict.saved} locale={locale} />
          </div>
        </section>

        {/* The people side, beside each other on a wide screen: what you were
            talking about, and the groups you talk in. */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Only for someone signed in, because only then is there anything
              to resume — a signed-out conversation lives in their browser and
              is already on the page they left it on. */}
          {signedIn && (
            <section aria-labelledby="recent-heading" className="min-w-0">
              <h2 id="recent-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
                {dict.review.recentTitle}
              </h2>
              <div className="mt-3">
                <RecentConversations
                  conversations={conversations}
                  t={dict.review}
                  locale={locale}
                  untitled={dict.chat.full.untitled}
                />
              </div>
            </section>
          )}

          <section aria-labelledby="groups-heading" className="min-w-0">
            <h2 id="groups-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
              {dict.groups.title}
            </h2>
            <div className="mt-3">
              <GroupList t={dict.groups} locale={locale} signedIn={signedIn} groups={groups} />
            </div>
          </section>
        </div>

        {/* Signed OUT, the account is the one thing this page cannot give, so
            the door to it closes the page. */}
        {authEnabled && !signedIn && (
          <section aria-labelledby="signin-heading" className="rounded-control border border-border-subtle p-5 sm:p-6">
            <h2 id="signin-heading" className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
              {t.signInWith}
            </h2>
            <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">{t.notSignedInBody}</p>
            <form
              className="mt-4"
              action={async () => {
                "use server";
                await signIn("orangecat", { redirectTo: afterSignIn(href(locale, "portal")) });
              }}
            >
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
              >
                {t.signInWith}
              </button>
            </form>
            <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">{t.whyBody}</p>
          </section>
        )}
      </div>
    </Shell>
  );
}
