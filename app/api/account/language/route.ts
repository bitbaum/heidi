import { auth, authEnabled } from "../../../../lib/auth/index.ts";
import { dbConfigured } from "../../../../lib/db/index.ts";
import { actorKey, preferenceWrite, tooMany } from "../../../../lib/domain/limits.ts";
import { inLocale, localeOf, safeNext, worthSeeding } from "../../../../lib/domain/preferences/language.ts";
import { saveLocale, savedLocale } from "../../../../lib/domain/preferences/store.ts";
import { DEFAULT_LOCALE, isLocale } from "../../../../lib/i18n/locales.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

/**
 * A RELATIVE `Location`, deliberately. Behind Caddy the request URL reads
 * `https://localhost:4025/…` (see the note in `middleware.ts`), so an absolute
 * redirect built from it would send a signed-in learner to localhost.
 */
function goTo(path: string): Response {
  return new Response(null, { status: 303, headers: { location: path } });
}

/**
 * Where every sign-in returns: the page they came from, in the language they
 * last chose. Nothing saved yet and they signed in from a non-German page —
 * that choice is saved now, so the next device inherits it.
 *
 * Never fails the sign-in. A database that is down or not configured costs
 * the learner their saved language for one page, not their session.
 */
export async function GET(request: Request) {
  const next = safeNext(new URL(request.url).searchParams.get("next")) ?? `/${DEFAULT_LOCALE}`;
  if (!authEnabled || !dbConfigured()) return goTo(next);

  const actorId = (await auth())?.actorId;
  if (!actorId) return goTo(next);

  try {
    const saved = await savedLocale(actorId);
    if (saved) return goTo(inLocale(next, saved));
    const here = localeOf(next);
    if (worthSeeding(here)) await saveLocale(actorId, here);
  } catch {
    // See above: the language is a courtesy, the session is not.
  }
  return goTo(next);
}

/**
 * Remember a language this learner just picked.
 *
 * Every language link posts here, signed in or not (see `language-link.tsx`),
 * so "nobody to remember it for" is the ordinary case and answers 204 with
 * nothing stored — not a 401 that would print an error in every signed-out
 * reader's console.
 */
export async function POST(request: Request) {
  if (!authEnabled || !dbConfigured()) return new Response(null, { status: 204 });
  const actorId = (await auth())?.actorId;
  if (!actorId) return new Response(null, { status: 204 });
  const allowed = preferenceWrite.check(actorKey(actorId, "preferences"));
  if (!allowed.allowed) return tooMany(allowed);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }
  const locale = (body as { locale?: unknown })?.locale;
  if (typeof locale !== "string" || !isLocale(locale)) {
    return Response.json({ error: '"locale" must be one of the site languages' }, { status: 400 });
  }
  await saveLocale(actorId, locale);
  return Response.json({ ok: true });
}
