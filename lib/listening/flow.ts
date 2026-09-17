import { LISTENING_SOURCES, type ListeningSource, type Topic } from "./sources.ts";

/**
 * Which of the register a given learner is offered, and in what order.
 *
 * A register of forty things is a list nobody opens. The value is not in
 * having the list — anyone can search for Swiss podcasts — it is in handing
 * over the three that fit THIS person today, and a different three tomorrow.
 * That is the part software can do that a blog post cannot, and it is the same
 * argument §2 of HEIDI.md makes for measuring the frontier rather than
 * recommending a radio station.
 *
 * PURE, AND DETERMINISTIC. No `Math.random`, no `Date.now`, no storage. The
 * caller passes a cursor and gets the same answer every time for the same
 * cursor, which is what makes "a different three tomorrow" testable rather
 * than merely plausible. It is also what lets the same selection be computed
 * on the server and on the client without them disagreeing — a random pick
 * would hydrate differently from what was rendered and React would replace it.
 *
 * REGULATING THE FLOW IS A DATA EDIT. There is no admin screen and there does
 * not need to be one: what is offered is `sources.ts` filtered by rules that
 * live here, so adding, removing or re-labelling a source is a pull request
 * that runs the tests and the link sweep. That is the same decision the
 * variety packs already record — the content is data, the behaviour is code.
 */

/**
 * How hard this is to follow, on a scale with no pretensions.
 *
 * DERIVED, NEVER ASSERTED. Nobody here has calibrated a difficulty scale, so
 * a number written onto each row would be an opinion wearing a measurement's
 * clothes — the false precision §8 forbids. What is written down instead is
 * observable and checkable (how many people talk, whether it is read aloud,
 * whether subtitles exist), and this function turns that into an ordering.
 *
 * Which means it can be WRONG in an honest way: if the ordering feels wrong,
 * the argument is about these four weights, in one place, rather than about
 * forty hand-written numbers.
 */
export type Demand = 1 | 2 | 3 | 4;

export function demand(source: ListeningSource): Demand {
  let score = 1;

  // The single biggest factor, and the one learners underestimate. One person
  // telling a story is a different task from six people interrupting.
  score += source.voices === "many" ? 3 : source.voices === "few" ? 1 : 0;

  // Spontaneous speech has the false starts, the swallowed syllables and the
  // speed that a read script does not.
  if (!source.scripted) score += 1;

  // Publisher subtitles in Standard German put the bridge variety on screen
  // while the target goes past the ear. Machine subtitles do not count: they
  // are wrong often enough to mislead, and on dialect they are wrong a lot.
  if (source.subtitles === "standard") score -= 1;

  // Swiss Standard German is, for someone who already has German, simply
  // easier. Saying so is not a criticism of the programme.
  if (source.spoken === "standard") score -= 1;

  return Math.min(4, Math.max(1, score)) as Demand;
}

export type Appetite = {
  /** Interests. Empty or absent means no topic filter — not "no results". */
  topics?: readonly Topic[];
  /** Prefer this dialect area. A preference, never a filter: see below. */
  area?: string;
  /**
   * Whether the learner is in Switzerland. Half of Play SRF does not play
   * abroad, and offering a link that answers "not available in your country"
   * is worse than not offering it: it reads as the product being broken.
   */
  inSwitzerland: boolean;
  /**
   * Include Swiss Standard German sources. Default false.
   *
   * Off by default because someone who asked for dialect and is handed the
   * Tagesschau has been sent to practise the language they already have.
   * On when the learner is working on the OTHER half of the diglossia — the
   * written-and-read register an email to an insurer needs — which §9 already
   * treats as a first-class output rather than a bridge.
   */
  includeStandard?: boolean;
  /** Offer nothing harder than this. */
  ceiling?: Demand;
};

export type FlowOptions = {
  /** How many to offer. Three by default: a choice, not a catalogue. */
  take?: number;
  /**
   * Rotates the window through the candidates. Any integer; the caller can
   * use a day number, a visit count, or a stored counter. Same cursor, same
   * answer — which is the property a test can hold on to.
   */
  cursor?: number;
  /** Override the register, for tests and for a future per-area pack. */
  sources?: readonly ListeningSource[];
};

/** True when the source teaches the target variety rather than the bridge. */
function isDialectal(source: ListeningSource): boolean {
  return source.spoken === "dialect" || source.spoken === "mixed";
}

function matchesTopics(source: ListeningSource, topics?: readonly Topic[]): boolean {
  if (!topics || topics.length === 0) return true;
  return source.topics.some((t) => topics.includes(t));
}

/**
 * The sources this learner could be offered at all, before ordering.
 *
 * Separate from `flow` because "what is even available to me" is a question
 * the page asks directly — an empty flow and an empty register are different
 * facts and a reader deserves to be told which one they are looking at.
 */
export function eligible(want: Appetite, sources: readonly ListeningSource[] = LISTENING_SOURCES): ListeningSource[] {
  const ceiling = want.ceiling ?? 4;
  return sources.filter((s) => {
    if (!want.includeStandard && !isDialectal(s)) return false;
    if (!want.inSwitzerland && s.reach === "ch") return false;
    if (!matchesTopics(s, want.topics)) return false;
    return demand(s) <= ceiling;
  });
}

/**
 * Order: easiest first, then by id so the result is stable.
 *
 * Easiest first is a decision and not an obvious one — a learner who is
 * already comfortable wants the hard thing. The ceiling is how they say so,
 * which keeps one axis instead of two and means the easy end is never hidden
 * from a beginner by a setting they did not know existed.
 *
 * `area` is a PREFERENCE and not a filter. Zurich material is scarce — the
 * register has four Zurich rows against a dozen pan-Swiss ones — so filtering
 * on it would hand a Zurich learner a nearly empty page and call that
 * personalisation. Matching sources come first; the rest still come.
 */
function ordered(candidates: readonly ListeningSource[], area?: string): ListeningSource[] {
  return [...candidates].sort((a, b) => {
    if (area) {
      const aHit = a.area === area ? 0 : 1;
      const bHit = b.area === area ? 0 : 1;
      if (aHit !== bHit) return aHit - bHit;
    }
    const byDemand = demand(a) - demand(b);
    if (byDemand !== 0) return byDemand;
    return a.id.localeCompare(b.id, "en");
  });
}

/**
 * What to offer, now.
 *
 * Variety of MEDIUM is enforced, because three podcasts is one suggestion
 * wearing three hats: somebody who does not listen to podcasts has been given
 * nothing. A repeat medium is taken only when nothing else is left, so a
 * request that only matches podcasts still returns podcasts rather than
 * returning less than it was asked for.
 */
export function flow(want: Appetite, options: FlowOptions = {}): ListeningSource[] {
  const take = options.take ?? 3;
  if (take <= 0) return [];

  const candidates = ordered(eligible(want, options.sources ?? LISTENING_SOURCES), want.area);
  if (candidates.length === 0) return [];

  // Rotate the whole ordering rather than slicing at an offset, so every
  // source is reachable by some cursor instead of the tail never being shown.
  // `%` keeps its sign in JS, so a negative cursor needs the second modulo.
  const start = ((options.cursor ?? 0) % candidates.length + candidates.length) % candidates.length;
  const window = [...candidates.slice(start), ...candidates.slice(0, start)];

  const picked: ListeningSource[] = [];
  const media = new Set<string>();
  for (const source of window) {
    if (picked.length === take) break;
    if (media.has(source.medium)) continue;
    picked.push(source);
    media.add(source.medium);
  }
  if (picked.length < take) {
    for (const source of window) {
      if (picked.length === take) break;
      if (!picked.includes(source)) picked.push(source);
    }
  }
  return picked;
}

/**
 * Everything in the register, grouped for a page that lists rather than picks.
 *
 * The page needs both: `flow` is the answer to "what should I do now", and
 * this is the answer to "what is there". Conflating them produced a page that
 * was either a catalogue nobody read or a suggestion nobody could look past.
 */
export function byMedium(
  sources: readonly ListeningSource[] = LISTENING_SOURCES,
): { medium: ListeningSource["medium"]; sources: ListeningSource[] }[] {
  const order: ListeningSource["medium"][] = ["podcast", "radio", "youtube", "tv", "series", "film"];
  return order
    .map((medium) => ({
      medium,
      sources: ordered(sources.filter((s) => s.medium === medium)),
    }))
    .filter((group) => group.sources.length > 0);
}
