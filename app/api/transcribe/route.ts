import { transcribe, createHealthTracker, ChainExhaustedError } from "@bitbaum/ai-kit";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { callerKey, dictation as dictationLimit, tooMany } from "@/lib/domain/limits";
import { looksLikeSilence } from "@/lib/domain/chat/transcription";
import { speechChain, speechConfigured } from "@/lib/domain/model/speech";
import { redact } from "@/lib/domain/model/byok";

export const dynamic = "force-dynamic";

/**
 * Turn a recording into text, when the browser cannot.
 *
 * The dictation control prefers the browser's own recogniser: free, instant,
 * and no audio leaves the device. But that API is a promise the browser does
 * not always keep. On Chromium builds without Google's speech service it
 * accepts `start()` and then never fires an event — measured on the live site,
 * 2026-09-12: nine seconds, zero events — and Firefox does not implement it at
 * all. For those people the control could only ever explain itself; it could
 * not dictate. This route is the half that makes it work.
 *
 * Deliberately narrow. It transcribes; it does not translate, summarise or
 * answer. Nothing is stored: the audio exists for the length of one request.
 *
 * Not a contradiction of the note in use-dictation.ts, which rejects uploading
 * audio to a model FOR DIALECT. That objection stands and is untouched — this
 * transcribes what the learner wants to SAY, in a language they already have,
 * which is exactly the job the browser was supposed to do.
 *
 * IT WAS ONE FETCH AT ONE VENDOR. A hand-rolled Groq call with a single key,
 * no fallback, no health tracking and no rate-limit classification — so a bad
 * minute at one host meant dictation was simply broken, and the only signal
 * was a 502 saying "not available right now" until somebody read a log. Two
 * more copies of the same shape live in loki. `transcribe()` in ai-kit is the
 * one implementation the fleet is supposed to share; this is its first
 * consumer, and everything below the chain is the same routing `complete()`
 * has always used.
 */

/** One dictated sentence, generously. Past this it is not dictation. */
const MAX_BYTES = 8 * 1024 * 1024;
/** Per LINK, so a stalled vendor costs one budget and not the whole request. */
const TIMEOUT_MS = 20_000;

/** One per process, so a future /api/health/speech reports what this route feeds. */
export const speechHealth = createHealthTracker();

function bad(error: string, status: number, operator = false) {
  return Response.json({ error, operator }, { status });
}

export async function POST(request: Request) {
  const limit = dictationLimit.check(callerKey(request, "dictation"));
  if (!limit.allowed) return tooMany(limit);

  // `operator` marks a fault the visitor cannot fix, so the UI says "not
  // available right now" rather than blaming their microphone.
  if (!speechConfigured()) return bad("transcription is not configured", 503, true);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("expected an audio upload", 400);
  }

  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) return bad("expected an audio upload", 400);
  if (audio.size > MAX_BYTES) return bad("that recording is too long", 413);

  const rawLocale = form.get("locale");
  const locale: Locale = typeof rawLocale === "string" && isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  try {
    const result = await transcribe({
      audio,
      // Whisper reads the container from the filename, and browsers hand us webm.
      filename: "dictation.webm",
      // Naming the language is worth real accuracy on short clips, where there
      // is too little audio to detect it from.
      language: locale,
      chain: speechChain(),
      health: speechHealth,
      timeoutMs: TIMEOUT_MS,
      signal: request.signal,
    });

    // Whisper never answers "silence" — it answers with the likeliest sentence
    // given no evidence, which in German is a subtitle credit. Returning that
    // types words the person never said into their own message. Silence is a
    // legitimate answer and the control already has words for it.
    const said = result.text.trim();
    return Response.json({ text: looksLikeSilence(said) ? "" : said });
  } catch (error) {
    // Every link's failure, not just the last — the one that explains an
    // outage is usually not the final one. Logged, never returned: a vendor
    // body carries request ids and quota detail that mean nothing to a visitor
    // and something to an attacker. `redact` because an error can echo a key.
    const detail =
      error instanceof ChainExhaustedError
        ? error.failures.map((f) => f.message).join(" | ")
        : error instanceof Error
          ? error.message
          : String(error);
    console.warn("[transcribe]", redact(detail));
    return bad("transcription is not available right now", 502, true);
  }
}
