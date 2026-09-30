import type { Dictionary } from "@/lib/i18n";
import { wordsIn, type Scope } from "@/lib/domain/practice/scope";
import { fill } from "@/lib/i18n/fill";

/**
 * What to call a scope, in the reader's language. Empty for everything.
 *
 * It reads the SAME dictionary entries the pages themselves render — the
 * grammar topic's own title, the scene's own title, the vocabulary group's own
 * heading — rather than a second set of names written for this banner. Two
 * names for one thing is how a product ends up telling somebody they are
 * practising "Verbs" on a page headed "Verben, die ständig vorkommen".
 *
 * An id nothing recognises falls back to the id itself. That is deliberate: a
 * hand-edited URL should show what it asked for, so the person can see their
 * typo, rather than a friendly label that hides it.
 */
export function scopeName(dict: Dictionary, scope: Scope): string {
  switch (scope.kind) {
    case "all":
      return "";
    case "topic":
      return dict.grammar.topics[scope.id as keyof typeof dict.grammar.topics]?.title ?? scope.id;
    case "scene":
      return dict.situations.scenes[scope.id as keyof typeof dict.situations.scenes]?.title ?? scope.id;
    case "group":
      return dict.vocabulary.groups[scope.id as keyof typeof dict.vocabulary.groups] ?? scope.id;
    case "words": {
      const words = wordsIn(scope.id);
      const shown = words.slice(0, 3).join(", ") + (words.length > 3 ? " …" : "");
      return fill(dict.vocabulary.wordsScope, { words: shown });
    }
  }
}
