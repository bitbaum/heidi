import type { PracticeItem } from "./types.ts";

/**
 * What a sitting is about — the difference between "practise" and "practise
 * THIS".
 *
 * THE PROBLEM THIS SOLVES, stated as a reader's experience rather than as an
 * architecture. Somebody finishes reading `am-progressive`, understands it for
 * about ninety seconds, and the only button available asks them eight
 * questions drawn from the whole pack, two of which might be about the thing
 * they just read. The reference section could tell you something and it could
 * send you to a drill, and there was no path between the two that kept its
 * subject.
 *
 * The evidence this repo already rests on is the same point from the other
 * side: a correspondence works as an attentional cue beside something you are
 * about to meet again, and does nothing as a lecture you sit through first
 * (Bergsma 2014; Pederson & Guion-Anderson 2010). A scoped session IS that
 * cue — the questions arrive while the topic is still warm, and they are about
 * the topic.
 *
 * WHY IT IS A FILTER OVER EXISTING ITEMS rather than a generator of new ones.
 * Because every item in the pool already says where it came from. `ItemSource`
 * was built to make a wrong answer traceable, and a traceable answer is an
 * addressable one: the same field that lets a missed question link back to its
 * grammar topic lets a page ask for exactly the questions belonging to it.
 * Nothing new is generated, nothing is invented, and a scope that matches
 * nothing yields an empty session rather than a padded one.
 */
export type Scope =
  /** The whole pool. The default, and what `/practice` means with no query. */
  | { kind: "all" }
  /** One grammar topic — its own examples AND the scene lines that use it. */
  | { kind: "topic"; id: string }
  /** One scene from a situation pack. */
  | { kind: "scene"; id: string }
  /** One group of the vocabulary page. */
  | { kind: "group"; id: string };

export const ALL: Scope = { kind: "all" };

/**
 * The query parameters a scope is spelled with.
 *
 * One key each rather than `?scope=topic:am-progressive`, because these are
 * URLs people share and land on: `?topic=am-progressive` is legible, and a
 * mistyped one degrades to an empty session with an explanation rather than to
 * a parse error.
 */
export const SCOPE_KEYS = ["topic", "scene", "group"] as const;
export type ScopeKey = (typeof SCOPE_KEYS)[number];

/**
 * Read a scope out of a URL's parameters.
 *
 * FIRST KEY WINS, in the order above, and the others are ignored rather than
 * combined. Two scopes at once has no meaning a reader could predict — is
 * `?topic=x&scene=y` the intersection or the union? — and the honest answer to
 * an ambiguous URL is to pick one deterministically rather than to invent an
 * algebra nobody asked for.
 *
 * A blank or whitespace value is no scope at all, not a scope matching
 * nothing: `?topic=` is what a form submits when a field was left empty.
 */
export function parseScope(params: Record<string, string | string[] | undefined>): Scope {
  for (const key of SCOPE_KEYS) {
    const raw = params[key];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
    if (value) return { kind: key, id: value } as Scope;
  }
  return ALL;
}

/** The query string for a scope, for a page building a link to one. */
export function scopeQuery(scope: Scope): string {
  return scope.kind === "all" ? "" : `?${scope.kind}=${encodeURIComponent(scope.id)}`;
}

/**
 * Whether an item belongs to a scope.
 *
 * THE TOPIC CASE IS THE INTERESTING ONE, and it is why `situation` sources
 * carry a topic id at all. A grammar topic's own items are the two or three
 * sentences the pack wrote to demonstrate the rule. The scene lines that turn
 * on the same rule are REAL instances of it — «Si isch am warte uf d Tochter»
 * is what `am-progressive` actually looks like on a Tuesday — and a topic
 * session that left them out would be drilling the illustration while ignoring
 * the thing illustrated.
 *
 * So a topic scope unions both, which also means the reference section and the
 * situation packs reinforce each other automatically: every scene written from
 * now on deepens whichever topics it happens to use, with nothing to wire up.
 */
export function inScope(item: PracticeItem, scope: Scope): boolean {
  if (scope.kind === "all") return true;

  const source = item.source;

  switch (scope.kind) {
    case "topic":
      if (source.kind === "grammar") return source.topic === scope.id;
      if (source.kind === "situation") return source.topic === scope.id;
      return false;
    case "scene":
      return source.kind === "situation" && source.scene === scope.id;
    case "group":
      return source.kind === "word" && source.group === scope.id;
  }
}

/** The pool, narrowed. Order is preserved; the session decides the order. */
export function itemsInScope(items: readonly PracticeItem[], scope: Scope): PracticeItem[] {
  return items.filter((item) => inScope(item, scope));
}

/**
 * Whether a learner's own kept words belong in this sitting.
 *
 * ONLY WHEN THE SCOPE IS EVERYTHING, and this is a judgement rather than a
 * technicality. A session opened from `am-progressive` that quietly mixed in
 * four unrelated words somebody kept last week is no longer a session about
 * `am-progressive` — it is the general drill again, wearing the topic's name.
 *
 * The cost is real and accepted: a due word does not come back during a scoped
 * sitting, so its schedule waits. That is the right trade, because the
 * schedule is about a word and the scope is about an intention, and overriding
 * somebody's stated intention to service a scheduler is how software starts
 * deciding what its user meant.
 */
export function includesSaved(scope: Scope): boolean {
  return scope.kind === "all";
}
