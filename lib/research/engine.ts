import { freeChain } from "@bitbaum/ai-kit";

/**
 * Which models answer you — read from the chain, not typed into a sentence.
 *
 * WHY THIS EXISTS. `/technology` publishes what the field can do with Swiss
 * German, with the numbers, so a reader can check our claims against it. The
 * question it never answered is the one a reader actually asks next: and which
 * model is answering ME? A product that asks to be checked and will not say
 * what is behind the curtain has answered the easy half.
 *
 * READ FROM `@bitbaum/ai-kit` AT RENDER, not written down here. A list of
 * model names in a dictionary is a list that goes stale the first time the
 * chain changes, and it would go stale silently — the page would keep naming a
 * model that was retired months ago, which is precisely the kind of confident
 * falsehood this whole site is built to avoid. The package owns the chain
 * (`ai-kit` defines it; apps only adapt a link to their client), so the page
 * reads the same object the request does.
 *
 * WHAT IS DELIBERATELY NOT PUBLISHED:
 *
 *   — The environment variable names. They are not secrets and printing them
 *     is still free reconnaissance, and nothing a reader wants is in them.
 *   — Any claim about what a given model CAN do. This repo's standing rule is
 *     that a capability is OBSERVED from real traffic and never declared, and
 *     "Gemini handles dialect well" is exactly the sentence that gets written
 *     once and stays wrong for a year.
 *   — Any suggestion that the ORDER is a ranking. It is not. The chain is
 *     ordered by scarcity — the scarcest capacity is drained LAST — so the
 *     first entry is the one with room today, not the one that is best. Saying
 *     "best first" would be inventing a quality claim out of a rate limit.
 */

export type EngineLink = {
  /** The provider's id in the chain — `groq`, `google`, `openrouter`. */
  provider: string;
  /** The host that actually receives the request. A privacy fact, so it ships. */
  host: string;
  /** The models this provider is asked for, in the order they are tried. */
  models: readonly string[];
};

/**
 * The chain as a reader may see it.
 *
 * Pure projection, like `lib/variety/display.ts`: it drops everything a page
 * has no business rendering and keeps what a reader has a right to know —
 * who receives the request and what is asked of them.
 */
export function engineChain(): EngineLink[] {
  return freeChain().map((link) => ({
    provider: link.id,
    host: hostOf(link.baseUrl),
    models: [...(link.models ?? [])],
  }));
}

/**
 * The hostname, or the raw value when it will not parse.
 *
 * Falling back rather than throwing: a malformed base URL is a configuration
 * problem, and it must not be the reason a page about honesty fails to render.
 */
function hostOf(baseUrl: string): string {
  try {
    return new URL(baseUrl).hostname;
  } catch {
    return baseUrl;
  }
}
