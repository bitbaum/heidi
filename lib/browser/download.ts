/**
 * Hand the reader a file, once, correctly.
 *
 * WHY THIS IS A MODULE AND NOT FOUR LINES IN TWO COMPONENTS. Because it WAS
 * four lines in two components, and the second copy shipped with the exact bug
 * the first copy's comment describes.
 *
 * `settings/data-section.tsx` revoked the object URL on a timeout and said
 * why: Safari has not always finished reading the blob by the time `click()`
 * returns. `_components/saved-words.tsx` — the same idea, written separately —
 * revoked it synchronously on the next line. So "save my words to a file"
 * could produce an empty download in Safari, while the page next door, doing
 * the same thing, could not.
 *
 * That is the argument for extracting even a small thing: the duplicate did
 * not merely risk drifting, it had already drifted into the failure the
 * original had learned about and written down.
 *
 * NO REACT, NO DOM TYPES BEYOND WHAT IT TOUCHES — so a test can call it and a
 * server component cannot accidentally import a hook.
 */

/**
 * How long to hold the object URL before releasing it.
 *
 * A second is far longer than the browser needs and costs nothing: the URL is
 * a pointer into memory the page already holds, and releasing it early is the
 * only failure mode that matters here.
 */
const REVOKE_AFTER_MS = 1000;

/**
 * Save `data` as a file the reader chooses where to put.
 *
 * `filename` is used as given — callers own their own naming, because a date
 * stamp is right for a whole-device export and a slug is right for one list.
 */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  // See REVOKE_AFTER_MS. Revoking synchronously is the Safari bug this module
  // exists to stop being written a third time.
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS);
}

/** A filename-safe slug, so two callers cannot disagree about spaces. */
export function fileSlug(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Today, as `YYYY-MM-DD`, for an export named after when it was taken. */
export function fileDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
