import { EXPLANATION_LANGUAGE, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { callerKey, dictation as dictationLimit, tooMany } from "@/lib/domain/limits";
import { looksLikeSilence } from "@/lib/domain/chat/transcription";

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
 */

/** whisper-large-v3-turbo: strong on German and the cheapest option that is. */
const MODEL = "whisper-large-v3-turbo";
const GROQ_TRANSCRIBE = "https://api.groq.com/openai/v1/audio/transcriptions";

/** One dictated sentence, generously. Past this it is not dictation. */
const MAX_BYTES = 8 * 1024 * 1024;
/** Long enough for a slow speaker, short enough that a stall is not a hang. */
const TIMEOUT_MS = 30_000;

function bad(error: string, status: number, operator = false) {
  return Response.json({ error, operator }, { status });
}

export async function POST(request: Request) {
  const limit = dictationLimit.check(callerKey(request, "dictation"));
  if (!limit.allowed) return tooMany(limit);

  const key = process.env.GROQ_API_KEY?.trim();
  // `operator` marks a fault the visitor cannot fix, so the UI says "not
  // available right now" rather than blaming their microphone.
  if (!key) return bad("transcription is not configured", 503, true);

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
  const locale: Locale =
    typeof rawLocale === "string" && isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const upstream = new FormData();
  // Whisper reads the container from the filename, and browsers hand us webm.
  upstream.append("file", audio, "dictation.webm");
  upstream.append("model", MODEL);
  // Naming the language is worth real accuracy on short clips, where there is
  // too little audio to detect it from.
  upstream.append("language", EXPLANATION_LANGUAGE[locale] ? locale : DEFAULT_LOCALE);
  upstream.append("response_format", "json");

  try {
    const res = await fetch(GROQ_TRANSCRIBE, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: upstream,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      // Never surface the vendor's body: it can carry request ids and quota
      // detail that mean nothing to a visitor and something to an attacker.
      console.warn(`[transcribe] upstream ${res.status}`);
      return bad("transcription is not available right now", 502, true);
    }
    const body = (await res.json()) as { text?: unknown };
    const said = typeof body.text === "string" ? body.text.trim() : "";
    // Whisper never answers "silence" — it answers with the likeliest sentence
    // given no evidence, which in German is a subtitle credit. Returning that
    // types words the person never said into their own message. Silence is a
    // legitimate answer and the control already has words for it.
    const text = looksLikeSilence(said) ? "" : said;
    return Response.json({ text });
  } catch {
    return bad("transcription is not available right now", 502, true);
  }
}
