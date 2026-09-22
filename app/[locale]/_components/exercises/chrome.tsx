"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { wordSlug } from "@/lib/domain/practice/slug";
import type { PracticeItem } from "@/lib/domain/practice/types";

/**
 * The parts every exercise view shares: the verdict, the link back to where
 * the answer is explained, and the one-line form of an answer.
 *
 * HERE RATHER THAN IN EACH VIEW, because these are about the SESSION rather
 * than about a kind — "was that right", "where does this come from", "what was
 * it" mean the same thing whichever question was asked, and four copies of a
 * verdict is four places for the wording to drift.
 */

/**
 * Right or not, and where the claim comes from.
 *
 * Only ever shown for the objective kinds, which is the whole reason the two
 * markings are separated: this product may tell a learner they are wrong when
 * a fixed rule says so, and may not when the question was about spelling a
 * language with no settled orthography.
 */
export function Verdict({
  right,
  t,
  grammarT,
  item,
  locale,
  onNext,
}: {
  right: boolean;
  t: Dictionary["practice"];
  grammarT: Dictionary["grammar"];
  item: PracticeItem;
  locale: Locale;
  onNext: () => void;
}) {
  return (
    <div className="mt-5 border-t border-border-subtle pt-4">
      <p className={`text-base font-medium ${right ? "text-accent" : "text-fg-primary"}`}>
        {right ? t.right : t.wrong}
      </p>

      {item.kind === "pair" && item.origin && (
        <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{fill(t.origin, { origin: item.origin })}</p>
      )}

      <Explain item={item} grammarT={grammarT} />
      <Trace item={item} t={t} locale={locale} />

      <button
        type="button"
        onClick={onNext}
        className="mt-4 min-h-11 rounded-control bg-accent px-4 font-medium text-on-accent hover:opacity-90"
      >
        {t.next}
      </button>
    </div>
  );
}

/**
 * Which grammar topic explains this item, if any.
 *
 * TWO PLACES A TOPIC CAN COME FROM, and they are not the same relationship.
 * The item's SOURCE is where it came from — a grammar topic's own example, or
 * a scene line that names the structure it turns on. `explains` is a property
 * of the KIND, set from the pack: an article question came from a noun, but
 * what explains it is the page about the article system, and twenty-four
 * questions were being sent to a glossary because those two were conflated.
 *
 * Source first, because it is the more specific claim: a cloze cut from
 * `am-progressive` is about `am-progressive`, whatever kind it is.
 *
 * Exported so the end of a test can print the same line for twenty items at
 * once without a second copy of this precedence.
 */
export function explainingTopic(item: PracticeItem): string | undefined {
  const source = item.source;
  if (source.kind === "grammar") return source.topic;
  if (source.kind === "situation") return source.topic;
  if (item.kind === "article") return item.explains;
  return undefined;
}

/**
 * The one sentence that says WHY, at the moment being wrong is interesting.
 *
 * A link to the topic was the whole of the explanation, and a link is a
 * promise to explain rather than an explanation. Somebody who has just chosen
 * `d Huus` is told "not quite", offered a page, and left to decide whether
 * they care enough to leave the drill — which most people, mid-sitting, do
 * not. So the topic's own rule line comes to them.
 *
 * IT IS THE TOPIC'S OWN WORDS. Not a second explanation written for this
 * panel: the grammar page and the drill then cannot drift, and a topic whose
 * wording is improved improves in both places at once.
 *
 * A SITUATION LINE EXPLAINS ITSELF THROUGH ITS TOPIC, when it names one. That
 * is the field that already makes "practise this topic" work, reused: the
 * scene says which structure the sentence turns on, and the structure knows
 * how to describe itself.
 *
 * Nothing at all when the item's source names no topic — a kept word or a bare
 * gate rule has no rule line, and an empty labelled box is the interface
 * reporting on something that did not happen.
 */
function Explain({ item, grammarT }: { item: PracticeItem; grammarT: Dictionary["grammar"] }) {
  const id = explainingTopic(item);
  if (!id) return null;

  const topic = grammarT.topics[id as keyof typeof grammarT.topics];
  if (!topic) return null;

  return (
    <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">
      <span className="text-fg-muted">{topic.title} — </span>
      {topic.rule}
    </p>
  );
}

/**
 * `flex w-fit`, not `inline-flex`.
 *
 * Inline, it shared a line with the button that follows it and the two
 * overlapped — a 44px tap target on top of another one, where the link was
 * unreachable and the button looked like it had a label glued to its left.
 * Found by looking at the page; no test would have said a word.
 */
const TRACE_LINK =
  "mt-3 flex min-h-11 w-fit items-center text-sm text-link underline underline-offset-4 hover:text-accent";

/** The same link in a list, where a 44px block per row would be a wall. */
const TRACE_LINK_COMPACT = "text-sm text-link underline underline-offset-4 hover:text-accent";

/**
 * The link back to where the answer is explained.
 *
 * This is the part that makes the page more than a quiz. A learner who just
 * got `s Huus` wrong has a specific gap, and the product already has a page
 * about it — sending them there is the difference between being tested and
 * being taught. The link is built from the item's own provenance, so a
 * question that cannot say where it came from silently offers nothing rather
 * than guessing.
 */
export function Trace({
  item,
  t,
  locale,
  compact = false,
}: {
  item: PracticeItem;
  t: Dictionary["practice"];
  locale: Locale;
  /** In the end-of-session list these sit on one line each, not stacked. */
  compact?: boolean;
}) {
  const className = compact ? TRACE_LINK_COMPACT : TRACE_LINK;

  if (item.source.kind === "grammar") {
    return (
      <Link href={`${href(locale, "grammar")}/${item.source.topic}`} className={className}>
        {t.grammarLink}
      </Link>
    );
  }

  /**
   * A line from a scene goes back to the SCENE, not to the grammar topic.
   *
   * The sentence they just missed is one of ten in a handover, and the other
   * nine are the context that makes it stick — sending them to
   * `am-progressive` instead would be technically the same information and a
   * worse answer to "why did I not get that". The topic is one click further
   * on from the scene, where the scene itself links to it.
   */
  if (item.source.kind === "situation") {
    return (
      <Link href={`${href(locale, "situations")}/${item.source.scene}`} className={className}>
        {t.situationLink}
      </Link>
    );
  }

  if (item.source.kind === "word") {
    return (
      <Link href={`${href(locale, "vocabulary")}#${wordSlug(item.source.word)}`} className={className}>
        {t.wordLink}
      </Link>
    );
  }

  /**
   * A pair comes from a gate rule, and the gate's own rule list is published
   * at `/method#gate`.
   *
   * This was the one provenance with nowhere to go, which showed at the end of
   * a session: two of seven missed items were bare words with no way to find
   * out why they were wrong. The rule that judged them is a page the product
   * already publishes — not linking to it was an omission rather than a
   * decision.
   */
  if (item.source.kind === "rule") {
    return (
      <Link href={`${href(locale, "method")}#gate`} className={className}>
        {t.ruleLink}
      </Link>
    );
  }

  return null;
}

/** The person label in the reader's language, falling back to the pack's key. */
export function person(t: Dictionary["practice"], label: string): string {
  const persons: Record<string, string> = t.persons;
  return persons[label] ?? label;
}

/**
 * The right answer, as one printable string, whatever kind of item it was.
 *
 * Used only in the end-of-session list, where the question is gone and the
 * answer is the thing worth carrying away. Every branch returns something the
 * variety actually says — never a paraphrase and never a label — because this
 * line is the last dialect a learner reads before closing the page.
 */
export function answerOf(item: PracticeItem): string {
  switch (item.kind) {
    case "pair":
    case "article":
    case "form":
    case "pick":
      return item.options[item.answer] ?? "";
    /**
     * A grid's answer is four answers, so it prints as the pairs themselves.
     * "1 of 4" is not something anybody can carry away.
     */
    case "match":
      return item.targets.map((target, i) => `${target} — ${item.bridges[item.answer[i]] ?? ""}`).join(" · ");
    /**
     * A passage prints as the words that went into it, in gap order. Not the
     * filled-in passage: four lines would push everything else off the screen,
     * and what went wrong was a placement rather than a sentence.
     */
    case "gaptext":
      return item.answer.map((bankIndex) => item.bank[bankIndex] ?? "").join(" · ");
    default:
      return item.answer;
  }
}

/**
 * The option button's colours, which say three different things.
 *
 * Unanswered, chosen-and-right, chosen-and-wrong — and, once answered, the
 * correct one is marked even if it was not the one pressed. A drill that only
 * says "no" teaches the learner that they were wrong and not what was right.
 */
export function optionClass(index: number, chose: number | null, answer: number): string {
  const base =
    "min-h-11 w-full rounded-control border px-4 font-heading text-base font-semibold tracking-display sm:w-auto";

  if (chose === null) {
    return `${base} border-border-strong text-fg-primary hover:bg-surface-page`;
  }
  if (index === answer) return `${base} border-accent bg-accent text-on-accent`;
  if (index === chose) return `${base} border-border-strong text-fg-muted line-through`;
  return `${base} border-border-subtle text-fg-muted`;
}

/** The dialect prompt, set large. One definition, so the four views agree. */
export const PROMPT_TEXT =
  "mt-2 font-heading text-2xl font-semibold leading-snug tracking-display text-dialect sm:text-3xl";

/**
 * A keydown this page should ignore.
 *
 * `instanceof Element` first, and it is not defensive padding: a keydown's
 * target is not always an element — it is the Window when the event is
 * dispatched there directly, and `Window.closest` does not exist. The cast
 * alone typechecked and then threw `target?.closest is not a function` on the
 * first keypress, which took the whole handler down: every key after it did
 * nothing and the page looked frozen rather than broken.
 *
 * Nothing is bound that a person could be typing into. This page has no text
 * field, but the chat dock floats above it on every page and taking its digits
 * would be the kind of bug that looks like a broken keyboard.
 */
export function ignoreKey(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return true;
  const target = event.target;
  return target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable=true]"));
}
