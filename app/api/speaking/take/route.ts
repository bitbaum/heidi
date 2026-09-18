import { complete, freeChain, usableChain } from "@bitbaum/ai-kit";
import { VARIETY } from "@/lib/variety/active";
import { takePrompt } from "@/lib/variety/prompt";
import { check } from "@/lib/variety/check";
import { languageNotes } from "@/lib/domain/speaking/feedback";
import { byokChain, readByok, redact } from "@/lib/domain/model/byok";
import { extractJson } from "@/lib/domain/chat/parse";
import { EXPLANATION_LANGUAGE, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { llmHealth } from "../../chat/route";
import { callerKey, speakingTake, tooMany } from "@/lib/domain/limits";
import { MAX_SAID_LENGTH } from "@/lib/domain/speaking/take";
import { DEFAULT_CORRECTION, isCorrectionLevel } from "@/lib/voice/correction";

export const dynamic = "force-dynamic";

/** Short work, like the example route. */
const TIMEOUT_MS = 15_000;

/**
 * One improvement on a line the learner spoke and then wrote down.
 *
 * WHAT THIS ROUTE NEVER RECEIVES IS THE POINT: there is no audio here, no
 * upload, no multipart body. The recording is measured in the browser by
 * `domain/speaking/delivery.ts` and never leaves the device, and this route
 * sees only the sentence the learner CONFIRMED they said. That is not a
 * privacy flourish, it is forced by §7 — no system transcribes Zurich German
 * reliably, and the state of the art translates the dialect into Standard
 * German on the way. A machine transcript shown to a learner as "what you
 * said" would be wrong in exactly the way they cannot detect.
 *
 * So the learner is the transcriber. That costs a step of friction and buys
 * the only version of this feature that is not a lie — and the writing-down is
 * itself a retrieval act rather than dead time.
 *
 * FAILING IS FINE, like `/api/example`. The measurements and the deterministic
 * gate findings are computed locally and are already on screen; this is one
 * extra opinion on top. Every failure path answers 200 with nothing, because
 * nothing the learner did is lost by the model being unavailable.
 */
export async function POST(request: Request) {
  const allowed = speakingTake.check(callerKey(request, "speaking-take"));
  if (!allowed.allowed) return tooMany(allowed);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ language: [], suggestion: null });
  }

  const { said, locale, byok, correction } = (body ?? {}) as {
    said?: unknown;
    locale?: unknown;
    byok?: unknown;
    correction?: unknown;
  };

  /**
   * How much the learner asked to be told. Device-local, so it arrives on the
   * request rather than from a table — the same reason saved words never got
   * a row (§10).
   *
   * `off` is honoured BEFORE the gate runs, not after: a learner who asked not
   * to be corrected should not have their sentence judged and the verdict
   * quietly discarded.
   */
  const level = isCorrectionLevel(correction) ? correction : DEFAULT_CORRECTION;
  const text = typeof said === "string" ? said.trim() : "";
  if (!text || text.length > MAX_SAID_LENGTH) return Response.json({ language: [], suggestion: null });

  const reader: Locale = typeof locale === "string" && isLocale(locale) ? locale : DEFAULT_LOCALE;

  /**
   * THE DETERMINISTIC HALF, RUN HERE RATHER THAN IN THE BROWSER.
   *
   * It is pure and could run on the client — but running it there would pull
   * the whole variety pack into the bundle, and the pack carries English prose
   * fields (`reason`, `note`) that must never reach a reader in another
   * language. `lib/variety/display.test.ts` enforces that structurally by
   * failing the build if any `.tsx` imports the pack, which is the rule that
   * caught this. So the gate runs server-side and the page renders ids.
   *
   * It is also the half that does not need a model, which is why it is
   * computed before the chain is even looked at: a deployment with no key
   * still tells a learner they said a Bernese word.
   */
  /**
   * WHY `blocking` AND `all` DO THE SAME THING HERE, on purpose.
   *
   * The levels are defined over the gate's severity classes, and a spoken take
   * only ever has one of them. `feedback.ts` keeps `foreign` findings — a real
   * word of another variety, which is a thing you can HEAR — and drops
   * `unattested` ones, because they are orthographic and there is no way to
   * SAY a `ß`. So on this surface there is exactly one correctable class, and
   * the two upper levels necessarily coincide; the distinction between them
   * belongs to typed text, which has no surface yet.
   *
   * Mapping `blocking` onto "unattested only" here would have silenced the
   * word notes entirely at the DEFAULT level — turning somebody else's working
   * feature off while appearing to configure it.
   */
  const language = level === "off" ? [] : languageNotes(text, VARIETY);

  const own = readByok(byok);
  const byokLinks = own.ok ? byokChain(own.config) : null;
  const chain = byokLinks ? byokLinks.chain : usableChain(freeChain("HEIDI"), process.env);
  const env = byokLinks ? { ...process.env, ...byokLinks.env } : process.env;

  // No model configured is a deployment without this one extra opinion, not an
  // error: the measurements and the gate findings above still stand.
  if (chain.length === 0) return Response.json({ language, suggestion: null });

  try {
    const { text: raw } = await complete({
      chain,
      env,
      health: llmHealth,
      // Low: this is a correction, and a creative correction is a different
      // sentence rather than a better one.
      temperature: 0.3,
      maxTokens: 300,
      timeoutMs: TIMEOUT_MS,
      signal: request.signal,
      messages: [{ role: "user", content: takePrompt(VARIETY, { said: text, explainIn: EXPLANATION_LANGUAGE[reader] }) }],
    });

    const parsed = extractJson(raw) as { better?: unknown; why?: unknown } | null;
    const better = typeof parsed?.better === "string" ? parsed.better.trim() : "";
    const why = typeof parsed?.why === "string" ? parsed.why.trim() : "";
    if (!better) return Response.json({ language, suggestion: null });

    // THE SAME GATE AS EVERY OTHER GENERATED LINE. A model asked for Zurich
    // German will hand back Bernese forms fluently, and the learner is buying
    // the variety precisely because they cannot tell. Flagged rather than
    // dropped, so drift stays visible — §9's first guard, applied here.
    const gate = check(better, VARIETY, "foreign");

    return Response.json({
      language,
      suggestion: {
        better,
        why,
        flagged: gate.findings.filter((f) => f.severity === "foreign" || f.severity === "unattested"),
      },
    });
  } catch (error) {
    // redact(): a vendor error can echo the request, and the request may have
    // carried somebody's own key.
    console.error("[heidi/speaking-take]", redact(error instanceof Error ? error.message : String(error)));
    // The gate findings are deterministic and already computed; a dead vendor
    // must not take them down with it.
    return Response.json({ language, suggestion: null });
  }
}
