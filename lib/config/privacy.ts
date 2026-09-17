import { BYOK_PROVIDERS } from "../domain/model/providers.ts";

/**
 * Where a person's words actually go, as data rather than as prose.
 *
 * WHY THIS IS NOT A PARAGRAPH SOMEBODY WROTE. A privacy page is the one page
 * whose whole value is that it is true, and it is also the page most likely to
 * quietly stop being true — a vendor is added to the chain, a field starts
 * being stored, and the page says what it said last year. The settings page
 * already proved the failure mode: it told readers their conversation
 * "disappears when you close the tab" (it is in `localStorage` and survives)
 * and that "nothing of it is on our servers" (a signed-in conversation is in
 * Postgres).
 *
 * So the RECIPIENTS are derived from the same modules the product calls, and
 * the flows are listed once, here, in a shape a page can render and a test can
 * check. What is left for the dictionaries is the framing — which genuinely is
 * a translation — and nothing that can go stale.
 *
 * WHAT IS DELIBERATELY NOT CLAIMED. No data-processing agreement is asserted,
 * because none has been signed. No certification, no "GDPR compliant" badge,
 * no promise about vendors' own retention. Those would be exactly the kind of
 * sentence an institution checks first, and the one this project cannot
 * currently support.
 */

/** Where a thing physically sits. The distinction an institution asks about. */
export type Place =
  /** The reader's own browser. It never reaches us at all. */
  | "device"
  /** Our server, which is in Germany — see `HOSTING`. */
  | "server"
  /** A third party's systems. */
  | "vendor";

export type Flow = {
  id: string;
  place: Place;
  /** The storage key, table or endpoint, so a reader can verify the claim. */
  where: string;
  /** True when it leaves the reader's device at all. */
  leavesDevice: boolean;
  /** Who else can see it, by name. Empty when nobody does. */
  recipients: string[];
};

/**
 * The server, named precisely.
 *
 * Read from the machine rather than assumed: Hetzner `fsn1`, which is
 * Falkenstein. GERMANY, not Switzerland — a distinction a Swiss institution
 * will ask about within the first two questions, and one it is much better to
 * volunteer than to be caught not knowing.
 */
export const HOSTING = {
  provider: "Hetzner",
  city: "Falkenstein",
  country: "DE",
} as const;

/**
 * The model vendors that may answer a message.
 *
 * DERIVED, not typed out. `freeChain("HEIDI")` in ai-kit declares these and the
 * product walks them in order; writing the list again here is how a page comes
 * to name a vendor the code dropped, or miss one it gained.
 *
 * Which of them is reachable on a given deployment depends on which keys are
 * configured, so the page names all of them as possible recipients. Promising
 * a specific one would be a claim about an environment variable.
 */
export const MODEL_VENDORS = ["Groq", "Google", "OpenRouter"] as const;

/** Vendors a reader can choose for themselves, from the BYOK allowlist. */
export const BROUGHT_KEY_VENDORS = BYOK_PROVIDERS.map((p) => p.label);

/** Speech-to-text, which is a different chain from the one that answers. */
export const TRANSCRIPTION_VENDOR = "Groq";

export const FLOWS: readonly Flow[] = [
  {
    id: "draftConversation",
    place: "device",
    where: "localStorage · heidi.chat.draft.v1",
    // It is SENT to be answered, but never written down on our side.
    leavesDevice: true,
    recipients: [...MODEL_VENDORS],
  },
  {
    id: "savedConversation",
    place: "server",
    where: "conversations · conversation_messages",
    leavesDevice: true,
    recipients: [...MODEL_VENDORS],
  },
  {
    id: "savedWords",
    place: "device",
    where: "localStorage · heidi.saved.v1",
    leavesDevice: false,
    recipients: [],
  },
  {
    id: "ownKey",
    place: "device",
    where: "localStorage · heidi.byok.v1",
    // It is forwarded with each request so the vendor can authenticate it, and
    // never stored on our side or written to a log — `redact()` exists for it.
    leavesDevice: true,
    recipients: [],
  },
  {
    id: "theme",
    place: "device",
    where: "localStorage · heidi.theme.v1",
    leavesDevice: false,
    recipients: [],
  },
  {
    id: "dictation",
    place: "vendor",
    where: "Web Speech API, or /api/transcribe",
    leavesDevice: true,
    // The browser path is not private either, and saying so is the point: in
    // Chrome the Web Speech API is served by Google's speech service.
    recipients: ["Google", TRANSCRIPTION_VENDOR],
  },
  {
    id: "pictures",
    place: "vendor",
    where: "downscaled in the browser; only a count is stored",
    leavesDevice: true,
    recipients: [...BROUGHT_KEY_VENDORS],
  },
  {
    /**
     * A recorded take, and the strongest claim on this page.
     *
     * The audio is decoded and measured in the page that recorded it and then
     * dropped — there is no audio table, no upload endpoint for takes, and no
     * transcript of anybody's speech anywhere in this product. What stays is a
     * handful of durations and the learner's own write-up, in their browser.
     *
     * It has to be on this page precisely because it is the sensitive one. A
     * privacy page that enumerates nine flows and silently omits the voice
     * recording is worse than one that never claimed to be complete.
     */
    id: "speakingTakes",
    place: "device",
    where: "localStorage · heidi.takes.v1",
    leavesDevice: false,
    recipients: [],
  },
  {
    /**
     * The one thing the speaking surface does send: the sentence the learner
     * typed out and pressed a button to have checked. Never the audio, and
     * never stored on our side — one request, answered and forgotten, exactly
     * like a signed-out chat.
     */
    id: "speakingSuggestion",
    place: "vendor",
    where: "/api/speaking/take · the confirmed sentence only",
    leavesDevice: true,
    recipients: [...MODEL_VENDORS],
  },
  {
    id: "account",
    place: "server",
    where: "OrangeCat OIDC · the actor id only",
    leavesDevice: true,
    recipients: ["OrangeCat"],
  },
  {
    id: "groups",
    place: "server",
    where: "study_groups · group_members · group_messages",
    leavesDevice: true,
    recipients: [...MODEL_VENDORS],
  },
  {
    id: "feedback",
    place: "vendor",
    where: "widget.js from loki.orangecat.ch",
    leavesDevice: true,
    recipients: ["Loki"],
  },
];

/**
 * Things a site of this kind usually does and this one does not.
 *
 * Worth stating explicitly rather than leaving as an absence: "we have no
 * analytics" is a claim a reader can check in the page source in ten seconds,
 * and it is unusual enough to be worth the line. Verified by grep before it
 * was written, and there is a test that keeps it true.
 */
export const NOT_DONE = ["analytics", "advertising", "profileSale", "trackingCookies"] as const;
