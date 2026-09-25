import Link from "next/link";
import { auth, authEnabled, signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { Shell } from "./page-shell";
import { SectionNav, SectionNavLayout, type NavSection } from "./section-nav";
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

  /**
   * The index, built from what is actually on the page.
   *
   * Derived rather than listed: a hand-written nav is the thing that still
   * names a section after somebody removes it. The counts come from the same
   * queries the sections render, so the strip cannot claim two groups over a
   * section showing three.
   *
   * `recent` is only here when signed in, because only then is there anything
   * to resume — the same condition the section itself renders under.
   */
  const sections: NavSection[] = [
    // SHORT LABELS, not the section headings. "Was Ihnen immer wieder
    // begegnet" is a good heading and a terrible nav item: five words wrap to
    // two lines in a strip whose whole job is to be scannable in one.
    { id: "focus", label: t.sections.focus },
    { id: "review", label: t.sections.review },
    ...(signedIn ? [{ id: "recent", label: t.sections.recent, count: conversations.length }] : []),
    /* Before `patterns`, because "what you can do" is the answer to the
       question somebody opens this page with, and "what keeps catching you"
       is the answer to the one they ask second. The old order had the
       diagnosis first and no counterpart to it at all. */
    { id: "mastered", label: t.sections.mastered },
    { id: "patterns", label: t.sections.patterns },
    { id: "words", label: t.sections.words },
    { id: "groups", label: t.sections.groups, count: groups.length },
    { id: "onward", label: t.sections.onward },
  ];

  return (
    <Shell>
      {/* A personal space, not a document about one.
          It read: eyebrow "MEIN BEREICH" over the title "Mein Bereich" — the
          same words twice — then four full-width sections stacked down 2,200px
          of a mostly empty column, ending in an essay about the identity
          provider. Nothing on it was anything to DO, and the only way back to
          the tool was a small link at the very bottom.
          Now: their words fill the page, because that is the part that is
          theirs and it works signed out; the two tools sit one tap away; the
          account and the roadmap are beside it, sized like the secondary
          things they are. */}
      {/* A personal space is the one page that may be warm. The pattern is
          6% black — felt, not read — and it stops at the rule, so the working
          part of the page stays plain. */}
      <header className="-mx-5 flex items-start gap-4 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <CowMark size={44} className="mt-1 shrink-0 text-fg-primary" />
        <div>
          <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
            {t.portalTitle}
          </h1>
          <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.portalLead}</p>
        </div>
      </header>

      {/*
        THE NAVIGATION COMES FIRST, in the DOM and on the screen.

        It was five sections stacked down two thousand pixels of phone with
        nothing to steer by — no index, no counts, no sign that anything
        existed below the fold. The sidebar this page always needed is the same
        component as the strip a phone gets; see `dashboard-nav.tsx`.

        The sidebar moved to the LEFT and the account block out of it entirely.
        A right-hand rail on a page whose left column is the content is a place
        things go to be missed, and the account belongs in the header where
        every other site on earth keeps it — which is now where it is.
      */}
      {/* THE SAME FRAME AS EVERY OTHER RAIL ON THE SITE. This page used to
          carry its own two-column grid at 14rem while the paper carried
          another at 13rem — a difference nobody chose and nobody could see a
          reason for. `SectionNavLayout` is the one frame now. */}
      <div className="border-t border-border-subtle pt-6 lg:pt-10">
      <SectionNavLayout nav={<SectionNav label={dict.nav.menu} sections={sections} />}>

        {/* SOMETHING TO DO LEADS, and everything else is underneath it.
            This page used to open with a list — their saved words — and a list
            is a thing to look at. The question a personal page has to answer
            first is "what should I do next", and for this product the honest
            answer is the one the roadmap already named: the words you did not
            know, asked again at the right moment. The list is still here; it
            is just no longer the first thing, because reading your own
            vocabulary is not practising it.

            It needs no account, which is why it can lead: review runs entirely
            in the browser, on the words already in it. */}
        <main className="min-w-0">
          {/*
            WHAT TO WORK ON LEADS, above even the words that are due.

            The page already answered "what is owed" — a review schedule is a
            deadline, and deadlines are easy to render. What it never answered
            is "what am I actually bad at", which is the question somebody
            opens their own page to ask, and which this product only learned to
            answer when the learner model shipped.

            It renders NOTHING until it has something to say: `weakest` refuses
            to name an area on fewer than two answers, so a first visit shows
            no panel rather than a placeholder promising one later. That is why
            it can lead without pushing the rest of the page down for a learner
            who has not practised yet.

            No number appears in it. §8's rule is that the product measures how
            much of an unfamiliar Zurich speaker you understand — the diagnosis
            names the material and offers a session on it, and never scores the
            person.
          */}
          <section aria-labelledby="focus" className="scroll-mt-anchor lg:scroll-mt-anchor" id="focus">
            <FocusPanel t={dict.practice} grammarT={dict.grammar} situationsT={dict.situations} locale={locale} />
          </section>

          <section aria-labelledby="review" className="scroll-mt-anchor lg:scroll-mt-anchor" id="review">
          <h2
            id="review-heading"
            className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
          >
            {dict.review.title}
          </h2>
          <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">
            {dict.review.lead}
          </p>
          <ReviewPanel t={dict.review} locale={locale} />
          </section>

          {/* Only for someone signed in, because only then is there anything
              to resume — a signed-out conversation lives in their browser and
              is already on the page they left it on. */}
          {signedIn && (
            <section aria-labelledby="recent" id="recent" className="mt-12 scroll-mt-anchor border-t border-border-subtle pt-10 lg:scroll-mt-anchor">
              <h2
                id="recent"
                className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
              >
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

          <div id="mastered" className="scroll-mt-anchor lg:scroll-mt-anchor">
            <MasteredPanel
              t={dict.review}
              grammarT={dict.grammar}
              vocabularyT={dict.vocabulary}
              locale={locale}
            />
          </div>

          <div id="patterns" className="scroll-mt-anchor lg:scroll-mt-anchor">
            <PatternsPanel t={dict.review} />
          </div>

          <section aria-labelledby="words" id="words" className="mt-12 scroll-mt-anchor border-t border-border-subtle pt-10 lg:scroll-mt-anchor">
            <h2
              id="words"
              className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
            >
              {dict.saved.title}
            </h2>
            <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">
              {dict.saved.lead}
            </p>
            <SavedWords t={dict.saved} locale={locale} />
          </section>

          {/* Groups sit beside the words rather than in the sidebar: they are
              the other half of what this page is FOR, and a list of rooms you
              are in is not a secondary control. */}
          <section aria-labelledby="groups" id="groups" className="mt-12 scroll-mt-anchor border-t border-border-subtle pt-10 lg:scroll-mt-anchor">
            <h2
              id="groups"
              className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
            >
              {dict.groups.title}
            </h2>
            <div className="mt-3">
              <GroupList t={dict.groups} locale={locale} signedIn={signedIn} groups={groups} />
            </div>
          </section>

          {/*
            WHAT USED TO BE A RIGHT-HAND RAIL.

            It held three things and each one has a better home. The account —
            your name and the way out — is in the header now, at the top right,
            where every other site on earth keeps it and where somebody looking
            for "sign out" looks first. The roadmap is the project talking
            about itself on a page that is supposed to be about the reader.
            What is left is the one thing that genuinely belonged: the way back
            into the product, which is now at the END of a personal page rather
            than in a column beside it, because that is where you are when you
            have finished reading your own words.

            Signed OUT this page still has to offer the door, so the sign-in
            stays — it is the whole content of the page for that visitor.
          */}
          <section aria-labelledby="onward" className="mt-12 border-t border-border-subtle pt-10">
            <h2
              id="onward"
              className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
            >
              {dict.chat.emptyTitle}
            </h2>
            <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">
              {dict.chat.placeholder}
            </p>
            <Link
              href={href(locale, "")}
              className="inline-flex min-h-11 items-center justify-center rounded-control bg-action px-6 text-center font-medium text-on-action hover:opacity-90"
            >
              {dict.chat.emptyTitle}
            </Link>

            {authEnabled && !signedIn && (
              <div className="mt-8 border-t border-border-subtle pt-6">
                <p className="max-w-measure text-sm leading-relaxed text-fg-secondary">{t.notSignedInBody}</p>
                <form
                  className="mt-4"
                  action={async () => {
                    "use server";
                    await signIn("orangecat", { redirectTo: href(locale, "portal") });
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center rounded-control border border-border-strong px-6 font-medium text-fg-primary hover:bg-surface-raised"
                  >
                    {t.signInWith}
                  </button>
                </form>
                <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">{t.whyBody}</p>
              </div>
            )}
          </section>
        </main>
      </SectionNavLayout>
      </div>
    </Shell>
  );
}
