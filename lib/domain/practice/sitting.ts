import { safeNext } from "../preferences/language.ts";
import type { Flow, Mode } from "./mode.ts";
import { scopeQuery, type Scope } from "./scope.ts";

/**
 * What a sitting is, as a URL: its scope, its mode and its flow.
 *
 * The same three values build the chooser's links on `/practice` and the
 * session screen's address, so the rules live here once — above all that a
 * test carries no mode (see `practice-chooser.tsx`: a test may only ask what
 * can be marked outright, so `?mode=write&flow=test` would select nothing).
 */
export function sittingQuery({ scope, mode, flow }: { scope: Scope; mode: Mode; flow: Flow }): string {
  const params = new URLSearchParams(scopeQuery(scope).replace(/^\?/, ""));
  const m = flow === "test" ? "mixed" : mode;
  if (m !== "mixed") params.set("mode", m);
  if (flow !== "practice") params.set("flow", flow);
  return params.toString();
}

/** Which sitting a saved one belongs to — see `resume.ts`. */
export function sittingKey({ scope, mode }: { scope: Scope; mode: Mode }): string {
  return `${mode}|${scope.kind === "all" ? "all" : `${scope.kind}:${scope.id}`}`;
}

/** The query parameter naming the page a session screen closes to. */
export const BACK_PARAM = "back";

/**
 * Where closing the session screen goes: the page it was opened from, if that
 * is a path on this site, else the fallback. The same guard the sign-in
 * redirect uses — a `back` that could point off-site is an open redirect.
 */
export function closeTarget(raw: string | string[] | undefined, fallback: string): string {
  return safeNext(Array.isArray(raw) ? raw[0] : raw) ?? fallback;
}
