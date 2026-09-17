/**
 * What counts as a pause. One definition, for both halves of the measurement.
 *
 * Its own file, holding one constant, because two things measure pauses from
 * opposite directions and must agree:
 *
 *   `domain/speaking/delivery.ts`  from the SIGNAL — gaps between sound.
 *   `speech/fluency.ts`            from the TRANSCRIPT — gaps between words.
 *
 * If those two used different thresholds the product would report a different
 * number of pauses for the same recording depending on which half answered,
 * and nothing would fail: both would be internally consistent and quietly
 * wrong about the same thirty seconds. That is the class of bug a shared
 * constant exists to make impossible rather than unlikely.
 *
 * Deliberately not in either caller. Whichever one held it would look like its
 * owner, and the other would look like it was borrowing — which is how a
 * "temporary" local copy gets made the next time someone tunes one of them.
 */

/**
 * The gap that counts as a pause, in milliseconds.
 *
 * 250 ms, for a phonetic reason rather than a tidy one: the silence inside a
 * `t` or a `k` is tens of milliseconds, so a lower threshold reports a person's
 * own consonants back to them as hesitation. It is also the conventional
 * silent-pause threshold in the fluency literature, which is convenient rather
 * than the argument.
 */
export const MIN_PAUSE_MS = 250;
