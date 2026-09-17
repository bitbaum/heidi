/**
 * What a synthetic voice is actually speaking — the variety gate, for sound.
 *
 * WHY THIS EXISTS AT ALL. §6 built a deterministic gate over generated TEXT,
 * because a model asked for Zurich German returns Bernese forms fluently and
 * the learner cannot tell. Every word of that argument survives being read
 * aloud, and gets worse: a learner can at least stare at written text and look
 * a word up. Speech is gone the moment it is said.
 *
 * And the failure is not hypothetical. §7 of HEIDI.md records it as a
 * correction to our own published claims: MOST SPEECH SYNTHESIS SOLD AS
 * "SWISS GERMAN" IS SWISS STANDARD GERMAN — the written language, read aloud
 * in a Swiss accent. `de-CH` on a voice means the accent, not the dialect.
 * Hand that to somebody who came here to understand the lunch table and they
 * hear a Swiss-sounding newsreader, learn its rhythms, and are no better off.
 *
 * So the rule this module enforces, and the reason it is code rather than a
 * comment: A BROWSER VOICE IS NEVER DIALECT. Not "probably not" — never. No
 * platform ships a Züritüütsch voice; `de-CH` on macOS, Windows and Android is
 * Standard German. Dialect can only come from a source that was verified to be
 * dialect, which today is a recorded human being and nothing else.
 *
 * The consequence is the point: when Heidi speaks, she can say what she is
 * speaking. "This is Swiss Standard German, not Zurich dialect" is a true
 * sentence that costs nothing and prevents a learner from spending a month
 * tuning their ear to the wrong thing.
 */

/**
 * What is coming out of the speaker. Ordered from the target outwards, which
 * is also the order of how useful it is to this learner.
 */
export type SpokenAs =
  /** Zurich German. Only ever a recorded human being, today. */
  | "dialect"
  /** Swiss Standard German — the written language in a Swiss accent. */
  | "swiss-standard"
  /** Germany's or Austria's German. Understandable, and the wrong model. */
  | "german"
  /** Not German at all: the browser fell back to whatever it had. */
  | "foreign";

/**
 * The shape of a `SpeechSynthesisVoice`, narrowed to what we read.
 *
 * Not the DOM type, so this module is pure and testable under `node:test`
 * with no browser and no jsdom — the same reason `speechConfigured` takes a
 * plain lookup rather than `NodeJS.ProcessEnv`.
 */
export type VoiceLike = {
  /** The human-readable name. Wildly inconsistent across platforms. */
  name: string;
  /** A BCP-47 tag: `de-CH`, `de_DE`, `de`. Inconsistent in case and separator. */
  lang: string;
  /** Installed on the device rather than fetched from the vendor's server. */
  localService?: boolean;
};

/** Platforms write `de_CH`, `de-ch` and `de-CH` for the same thing. */
function tag(lang: string): string {
  return lang.replace(/_/g, "-").toLowerCase();
}

/**
 * What this voice is really speaking.
 *
 * Note what is NOT here: any path that returns `"dialect"`. That is not an
 * oversight to be filled in later by widening a condition — it is the claim
 * this module exists to refuse. When a verified dialect voice exists it will
 * arrive as recorded audio or as a named vendor voice with a licence behind
 * it, and it will not be discovered by pattern-matching a string the
 * operating system wrote.
 */
export function spokenAs(voice: VoiceLike): SpokenAs {
  const t = tag(voice.lang);
  if (t === "de-ch" || t.startsWith("gsw")) return "swiss-standard";
  if (t === "de" || t.startsWith("de-")) return "german";
  return "foreign";
}

/**
 * Pick the best voice available for reading Swiss German aloud, or nothing.
 *
 * NOTHING IS A REAL ANSWER and the callers must handle it. A device with no
 * German voice at all exists — a stripped Linux build, a locked-down kiosk —
 * and reading Zurich German with an English voice does not produce
 * accented Swiss German, it produces sounds that teach the wrong thing. Saying
 * "your device has no voice for this" is more useful than performing one.
 *
 * `de-CH` first, then any German, and `localService` breaks the tie: an
 * on-device voice speaks instantly and sends nothing anywhere, which is the
 * same reasoning that puts the browser's own recogniser ahead of the server
 * in dictation.
 */
export function pickVoice(voices: readonly VoiceLike[]): VoiceLike | null {
  const rank = (v: VoiceLike): number => {
    const as = spokenAs(v);
    if (as === "swiss-standard") return 0;
    if (as === "german") return 1;
    return 2;
  };
  const german = voices.filter((v) => rank(v) < 2);
  if (german.length === 0) return null;

  return [...german].sort((a, b) => {
    const byVariety = rank(a) - rank(b);
    if (byVariety !== 0) return byVariety;
    const byLocal = Number(b.localService ?? false) - Number(a.localService ?? false);
    if (byLocal !== 0) return byLocal;
    return a.name.localeCompare(b.name, "en");
  })[0];
}

/**
 * What we are allowed to tell the learner about what they are about to hear.
 *
 * A dictionary key rather than a sentence, for the reason the whole product
 * keeps re-learning: a sentence written here arrives in English inside a
 * French page. The seven wordings live in the dictionaries; which ONE is true
 * is decided here, once, by the same function the audio came from.
 */
export type VoiceClaim =
  /** Swiss accent, Standard German. Honest, useful, and not the target. */
  | "swissStandard"
  /** German German. Further from the target still, and all the device has. */
  | "german"
  /** No voice: the control says so instead of performing. */
  | "none";

export function claimFor(voice: VoiceLike | null): VoiceClaim {
  if (!voice) return "none";
  return spokenAs(voice) === "swiss-standard" ? "swissStandard" : "german";
}

/**
 * Which language tag to ask the synthesiser for, given the text.
 *
 * Zurich German is requested as `de-CH` and not as `gsw`, and that is a
 * deliberate, slightly uncomfortable choice. `gsw` is the correct ISO code for
 * Swiss German and no synthesiser implements it; asking for it gets silence or
 * an English fallback reading Züritüütsch as though it were English, which is
 * the worst outcome available. `de-CH` gets the closest real thing, and
 * `claimFor` makes sure the learner is told what that closest real thing is.
 */
export const SPEECH_LANG = "de-CH";
