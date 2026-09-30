import { safeNext } from "../preferences/language.ts";
import type { Flow, Mode } from "./mode.ts";
import { ALL, scopeQuery, type Scope } from "./scope.ts";

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

/**
 * The session screen's address for a sitting, opened FROM `back`.
 *
 * Every "practise this" goes here directly rather than to `/practice` first:
 * the practice page asked for a second tap on a button below the fold, and
 * the choices it offers are one tap away inside the session anyway.
 */
export function sessionPath(
  locale: string,
  sitting: { scope: Scope; mode?: Mode; flow?: Flow },
  back?: string,
): string {
  const params = new URLSearchParams(
    sittingQuery({ scope: sitting.scope, mode: sitting.mode ?? "mixed", flow: sitting.flow ?? "practice" }),
  );
  if (back) params.set(BACK_PARAM, back);
  const query = params.toString();
  return `/${locale}/practice/session${query ? `?${query}` : ""}`;
}

/**
 * What "Üben" means on the page the learner is reading: the scene on a scene
 * page, the topic on a topic page, and everything anywhere else — where
 * "everything" puts due words first and the weak areas next (`session.ts`).
 *
 * `practisable` is the list of scenes and topics that have questions
 * (`pool.ts`), so a page without any opens the general drill rather than an
 * empty one.
 */
export function quickScope(
  pathname: string,
  practisable: { scene: readonly string[]; topic: readonly string[] },
): Scope {
  const [, , section, id, ...rest] = pathname.split("/");
  if (!id || rest.length > 0) return ALL;
  const decoded = decodeURIComponent(id);
  if (section === "situations" && practisable.scene.includes(decoded)) return { kind: "scene", id: decoded };
  if (section === "grammar" && practisable.topic.includes(decoded)) return { kind: "topic", id: decoded };
  return ALL;
}
