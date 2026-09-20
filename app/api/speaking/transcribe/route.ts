import { transcribe, createHealthTracker, ChainExhaustedError } from "@bitbaum/ai-kit";
import { VARIETY } from "@/lib/variety/active";
import { isFaithfulRendering } from "@/lib/speech/evidence";
import { markerVerdict } from "@/lib/speech/dialect-marker";
import { looksLikeSilence } from "@/lib/domain/chat/transcription";
import { speechChain, speechConfigured } from "@/lib/domain/model/speech";
import { redact } from "@/lib/domain/model/byok";
import { callerKey, speakingTake, tooMany } from "@/lib/domain/limits";
import { MAX_SAID_LENGTH } from "@/lib/domain/speaking/take";
import { spokenVarieties, type SpokenVarietyId } from "@/lib/domain/speaking/varieties";

export const dynamic = "force-dynamic";

/**
 * Transcribe a spoken take — but only in a variety whose recogniser returns
 * what was actually said.
 *
 * THIS ROUTE IS THE ANSWER TO "WHY DO I HAVE TO TYPE OUT MY OWN SENTENCE".
 *
 * The honest answer, for Zurich German, is §7: no recogniser returns it.
 * Whisper answers Swiss German at a published 25.6% WER and answers it in
 * STANDARD German — it translates the dialect away, which is the one piece of
 * information the learner came for. `evidence.ts` states that as a rule rather
 * than as a fact about Swiss German, and `isFaithfulRendering` is the rule's
 * name.
 *
 * What nothing had noticed is that the SAME rule, applied to the same pack,
 * says yes to the bridge. `packs/gsw-zh.ts` has declared
 * `bridgeRecognition: { available: true, returnsSpokenVariety: true, wer: 6.4 }`
 * all along: Standard German recognition returns Standard German, 6.4 is well
 * inside `FORM_JUDGEMENT_MAX_WER`, and Zurich is diglossic — the German spoken
 * at a doctor's desk, a Verwaltung counter or an insurer's phone line is Swiss
 * Standard German, and §9 already makes producing it a product output. So for
 * half of what a learner here actually has to say out loud, the machine may
 * transcribe, and the learner never needed to type.
 *
 * Nothing in this file names a language. It asks
 * `lib/domain/speaking/varieties.ts`, which asks the pack. A pack whose TARGET
 * recogniser becomes faithful — the Swiss dialect-preserving vendors in
 * `lib/research/language-tech.ts`, the day somebody tests one — starts serving
 * the dialect here with no edit to this route, which is the property the whole
 * `lib/variety` discipline exists to buy.
 *
 * THE AUDIO IS NOT STORED. It exists for the length of one request, the same
 * deal `/api/transcribe` makes. What IS different from the dialect half is
 * honest and has to be said on screen rather than buried here: signal-only
 * practice never sends the recording anywhere, and this sends it to a vendor.
 * That is why the mode is a CHOICE the learner makes per take, not a default
 * that quietly upgrades them.
 */

/** One take, generously. Past this it is not a take, it is a podcast. */
const MAX_BYTES = 8 * 1024 * 1024;

/** Per LINK, so a stalled vendor costs one budget rather than the request. */
const TIMEOUT_MS = 30_000;

/** Its own tracker, so a future health page can tell takes from dictation. */
export const takeSpeechHealth = createHealthTracker();

function bad(error: string, status: number, operator = false) {
  return Response.json({ error, operator }, { status });
}

export async function POST(request: Request) {
  const limit = speakingTake.check(callerKey(request, "speaking-transcribe"));
  if (!limit.allowed) return tooMany(limit);

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

  /**
   * WHICH VARIETY, AND THE REFUSAL IF IT IS THE WRONG ONE.
   *
   * The browser asks for a variety by id; the pack decides whether it may be
   * transcribed. A client that asks for the dialect gets 409 and the reason,
   * not a transcript — because the transcript it would get back is Standard
   * German wearing the learner's sentence, and showing that under "what you
   * said" is a false statement in the one place they cannot check it.
   */
  const askedFor = form.get("variety");
  const available = spokenVarieties(VARIETY);
  const chosen = available.find((v) => v.id === (askedFor as SpokenVarietyId));

  if (!chosen) return bad("no such practice variety", 400);
  if (!chosen.recognition || !isFaithfulRendering(chosen.recognition)) {
    return bad("this variety is not transcribed — see §7", 409);
  }

  try {
    const result = await transcribe({
      audio,
      filename: "take.webm",
      // The variety's own recognition language, from the pack. Naming it is
      // worth real accuracy on a short clip, where there is too little audio
      // to detect it from — and getting it wrong returns a fluent, confident
      // sentence in the wrong language.
      language: chosen.recognitionLang,
      chain: speechChain(),
      health: takeSpeechHealth,
      timeoutMs: TIMEOUT_MS,
      signal: request.signal,
    });

    // Whisper never answers "silence" — it answers with the likeliest sentence
    // given no evidence, which in German is a subtitle credit. Returning that
    // would hand somebody a sentence they never said and then measure it.
    const said = result.text.trim();
    const text = looksLikeSilence(said) ? "" : said.slice(0, MAX_SAID_LENGTH);

    /**
     * AND THEN CHECK THE VENDOR'S WORK.
     *
     * `dialect-marker.ts` settles, from the response itself, the question a
     * vendor's sales page cannot: did the recogniser answer in the variety
     * that was spoken? Two things come out of running it on every take rather
     * than once in a lab:
     *
     *  - the learner spoke dialect while practising the bridge, which is a
     *    genuinely useful thing to be told and the commonest thing to do by
     *    accident in a diglossic place;
     *  - or the vendor translated, in which case the pack's
     *    `returnsSpokenVariety` is wrong and this is the evidence for editing
     *    it. Reported, never acted on automatically — see §3.
     */
    const markers = VARIETY.speech.markers;
    const verdict = markers && text ? markerVerdict(text, markers) : null;

    return Response.json({
      text,
      variety: chosen.id,
      // "target" here means the learner used dialect forms. On a bridge take
      // that is a fact about them; the page has the sentence for it.
      spoke: verdict?.variety ?? "unclear",
    });
  } catch (error) {
    const detail =
      error instanceof ChainExhaustedError
        ? error.failures.map((f) => f.message).join(" | ")
        : error instanceof Error
          ? error.message
          : String(error);
    console.warn("[heidi/speaking-transcribe]", redact(detail));
    return bad("transcription is not available right now", 502, true);
  }
}
