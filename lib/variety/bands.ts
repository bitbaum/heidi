import type { GrammarBand } from "./pack.ts";

/**
 * The two bands, in reading order — and the order is the argument.
 *
 * `blocks` first, because those are the topics without which the listening
 * does not start at all: a reader who never learns that this variety has no
 * preterite will keep waiting for one. `marks` second, because a learner who
 * cannot yet follow a sentence is not helped by being told they would sound
 * foreign producing it.
 *
 * HERE RATHER THAN IN THE PAGE, for the same reason `NAV_GROUPS` is not in the
 * header: a list a component keeps in its own JSX is a list that silently
 * drops a member when the type gains one. This is exported as a readonly tuple
 * of the union, so adding a third band to `GrammarBand` and forgetting to add
 * it here is a type error rather than a section nobody notices is missing.
 */
export const GRAMMAR_BANDS = ["blocks", "marks"] as const satisfies readonly GrammarBand[];
