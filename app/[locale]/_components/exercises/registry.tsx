"use client";

import type { PracticeItem } from "@/lib/domain/practice/types";
import type { ExerciseView } from "./view";
import { ChoiceView } from "./choice";
import { RevealView } from "./reveal";
import { MatchView } from "./match";
import { GapTextView } from "./gaptext";

/**
 * Which component renders which kind — the rendering half of the registry.
 *
 * TWO REGISTRIES, ONE SET OF KEYS, AND A TEST BETWEEN THEM. Generation lives
 * in `lib/domain/practice/kinds/` and cannot import a component; rendering
 * lives here and must not import a generator. They meet at the kind id, and
 * `registry.test.ts` fails the build if either side knows a key the other does
 * not — which is the same join-with-a-test discipline that already holds the
 * grammar topics to their dictionaries and the nav to the sitemap.
 *
 * THE ALTERNATIVE WAS A SWITCH IN A 1,100-LINE COMPONENT, and it had already
 * cost a shipped bug: a kind the keyboard handler did not know about fell
 * through to the self-marked branch, where Enter means "I knew it", so one
 * keypress answered a matching grid correctly. A missing key here renders
 * nothing and turns a test red instead.
 *
 * Several kinds share a view on purpose. `pair`, `pick`, `article` and `form` differ
 * in what the question SAYS and agree on what answering looks like; `cloze`
 * and `recall` are both reveal-then-self-mark. One view per kind would be
 * files that can only ever be edited together.
 */
export const VIEWS: Record<PracticeItem["kind"], ExerciseView> = {
  pair: ChoiceView,
  pick: ChoiceView,
  article: ChoiceView,
  form: ChoiceView,
  cloze: RevealView,
  recall: RevealView,
  match: MatchView,
  gaptext: GapTextView,
};
