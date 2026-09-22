import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { MODES, FLOWS, type Mode, type Flow } from "@/lib/domain/practice/mode";
import { scopeQuery, type Scope } from "@/lib/domain/practice/scope";

/**
 * The two choices, before anything is asked.
 *
 * LINKS, NOT A FORM, AND NOT A SETTING. Each button is a URL, so the choice is
 * shareable, bookmarkable, back-buttonable, and works before any JavaScript
 * arrives — and a scoped session keeps its scope through every one of them,
 * because the query is rebuilt rather than replaced. A preferences panel would
 * have hidden the same choice behind a page nobody visits and made it
 * invisible from the link somebody sends a colleague.
 *
 * THEY ARE TWO ROWS AND NOT ONE, because they are genuinely two questions —
 * what your hands do, and when you find out. Eight combined buttons would be
 * the cross product presented as if it were a list, which is how a simple
 * choice starts looking like a configuration screen.
 *
 * ON A PHONE THEY WRAP AND THE NOTE DISAPPEARS. The one-line description under
 * each label is what makes the choice legible the first time; from the second
 * time it is noise, and at 360px it is three lines of it per button. So it is
 * shown from `sm:` up, where the row has room for it.
 */
export function PracticeChooser({
  mode,
  flow,
  scope,
  t,
  locale,
}: {
  mode: Mode;
  flow: Flow;
  scope: Scope;
  t: Dictionary["practice"];
  locale: Locale;
}) {
  const base = href(locale, "practice");

  /**
   * One link's URL: this row's new value, the other row's current value, and
   * whatever scope is already in force.
   *
   * Built here rather than in the two callers so the scope cannot be dropped
   * from one of them — which is exactly the bug shape that would show up as
   * "choosing cards silently throws away the topic I was practising".
   */
  function link(next: { mode?: Mode; flow?: Flow }): string {
    const params = new URLSearchParams(scopeQuery(scope).replace(/^\?/, ""));
    const f = next.flow ?? flow;
    /**
     * A TEST CARRIES NO MODE, and this line is the whole of a dead end that
     * would otherwise be one tap away.
     *
     * A test may only ask what can be marked outright (`markableInTest`), and
     * every writing and card kind is self-marked. So `?mode=write&flow=test`
     * selects the empty intersection — a learner in the writing mode who
     * pressed "test" would land on a page with no questions and no way to see
     * why. Dropping the mode makes that press mean the obvious thing instead:
     * the test you can actually take.
     */
    const m = f === "test" ? "mixed" : (next.mode ?? mode);
    if (m !== "mixed") params.set("mode", m);
    if (f !== "practice") params.set("flow", f);
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }

  const modeLabel: Record<Mode, { label: string; note: string }> = {
    mixed: { label: t.modeMixed, note: t.modeMixedNote },
    tap: { label: t.modeTap, note: t.modeTapNote },
    write: { label: t.modeWrite, note: t.modeWriteNote },
    card: { label: t.modeCard, note: t.modeCardNote },
  };

  const flowLabel: Record<Flow, { label: string; note: string }> = {
    practice: { label: t.flowPractice, note: t.flowPracticeNote },
    test: { label: t.flowTest, note: t.flowTestNote },
  };

  return (
    <div className="mb-8 flex flex-col gap-6">
      <Row title={t.flowTitle}>
        {FLOWS.map((value) => (
          <Choice
            key={value}
            href={link({ flow: value })}
            current={value === flow}
            label={flowLabel[value].label}
            note={flowLabel[value].note}
          />
        ))}
      </Row>

      {/*
        NO MODE ROW IN A TEST, and saying so beats greying four buttons out.

        Every mode but `tap` is made of self-marked kinds, and a test cannot
        ask those — §6 again: nobody may grade a typed dialect answer, and a
        card the learner marks themselves measures nothing. So in a test the
        four buttons would be one live option and three that do nothing, which
        is a worse interface than one sentence explaining the constraint.
      */}
      {flow === "test" ? (
        <p className="max-w-measure text-sm leading-relaxed text-fg-muted">{t.testOnlyObjective}</p>
      ) : (
        <Row title={t.modeTitle}>
          {MODES.map((value) => (
            <Choice
              key={value}
              href={link({ mode: value })}
              current={value === mode}
              label={modeLabel[value].label}
              note={modeLabel[value].note}
            />
          ))}
        </Row>
      )}
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{title}</h2>
      {/* `grid-cols-safe`-adjacent problem: these are flex items holding text
          nobody on this side wrote, so each one gets `min-w-0` and the row is
          allowed to wrap. See AGENTS.md — a flex item refuses to shrink below
          its content unless it is told to. */}
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Choice({ href: to, current, label, note }: { href: string; current: boolean; label: string; note: string }) {
  const base =
    "min-w-0 flex-1 basis-[calc(50%-0.25rem)] rounded-control border px-4 py-3 text-left sm:flex-none sm:basis-auto";
  const state = current
    ? "border-accent bg-accent text-on-accent"
    : "border-border-strong text-fg-primary hover:bg-surface-raised";

  return (
    <Link href={to} aria-current={current ? "page" : undefined} className={`${base} ${state}`}>
      <span className="block font-heading text-base font-semibold tracking-display">{label}</span>
      <span className={`mt-0.5 hidden text-sm leading-snug sm:block ${current ? "opacity-90" : "text-fg-muted"}`}>
        {note}
      </span>
    </Link>
  );
}
