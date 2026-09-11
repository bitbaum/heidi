/**
 * The variety this deployment teaches.
 *
 * This is the seam. Everything else in the app imports VARIETY from here and
 * asks it questions; nothing else names a language. Turning Heidi into Lesya
 * is editing the next two lines and the brand copy — not the engine, not the
 * checker, not a single component.
 *
 * Deliberately a static import and not an environment variable: one build
 * serves one variety, the bundler can tree-shake the packs nobody ships, and
 * "which language is this?" stays answerable by reading the file rather than
 * by inspecting a running process.
 */

export { ZURICH_GERMAN as VARIETY } from "./packs/gsw-zh.ts";
