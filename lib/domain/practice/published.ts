import { VARIETY } from "../../variety/active.ts";
import { SITUATIONS } from "../../situations/active.ts";
import { packItems } from "./generate.ts";
import type { PracticeItem } from "./types.ts";

/**
 * The questions the pack can ask, frozen at module load — and the ONLY thing
 * about the pack that a practice page is allowed to see.
 *
 * WHY THIS MODULE EXISTS AT ALL.
 *
 * `display.ts` makes the same argument for the pack itself: a variety pack is
 * authored in one language, some of its fields are English prose meant for
 * whoever maintains it and for the model, and those fields reached readers
 * three separate times before the rule became structural. The practice page
 * needs the pack — it has to generate items from the rules, the grammar
 * examples and the vocabulary — so it would have been the fourth.
 *
 * It does not need a projection of the PACK, though. It needs a projection of
 * the QUESTIONS, which is what this is: `PracticeItem` carries only words of
 * the variety, words of the bridge, closed keys the dictionaries render, and
 * the source ids a page links with. No `reason`, no `cue`, no `note`. The
 * prose-field walk in `display.test.ts` runs over this too, so an item kind
 * that starts carrying an explanation fails the build rather than shipping
 * English to a French reader.
 *
 * The learner's own words are deliberately absent. They live in the browser
 * and are turned into items there; the server has none and this is what it
 * means for it to have none.
 *
 * The situation packs come in here too, and this is the only place that knows
 * about them: `generate.ts` stays pure and takes them as an argument, so a
 * test can build a session out of two invented scenes without the deployment's
 * own packs leaking into the assertion.
 */
export const PACK_ITEMS: readonly PracticeItem[] = packItems(VARIETY, SITUATIONS);
