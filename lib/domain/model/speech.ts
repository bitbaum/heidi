import type { Link } from "@bitbaum/ai-kit";

/**
 * Where dictation goes, and in what order.
 *
 * A chain rather than a vendor, which is the whole change. The route used to
 * be one `fetch` at one host with one key: when Groq had a bad minute,
 * dictation was simply broken, and the only signal was a 502 that said
 * "not available right now" to everybody until somebody looked at a log.
 *
 * NOT the chat chain. Those models answer questions; these transcribe audio,
 * and pointing one at the other's endpoint produces a 404 per link and a
 * confident report that every vendor is down. The lists are separate because
 * the capabilities are.
 *
 * Two models at one vendor is a smaller fallback than two vendors, and it is
 * the honest extent of what heidi has a key for. It still covers the common
 * case — a single model rotted or briefly overloaded — and adding a second
 * vendor is a change to this array and nothing else.
 */

const GROQ = {
  id: "groq",
  baseUrl: "https://api.groq.com/openai/v1",
  keyEnv: "GROQ_API_KEY",
  models: ["whisper-large-v3-turbo", "whisper-large-v3"],
  // Transcription is billed by audio seconds, not tokens, so it draws on no
  // part of the token pool that fair-share rations. Claiming capacity here
  // would hand out shares of a budget this work never spends.
  dailyTokens: 0,
} as const;

/**
 * The links to try, in order.
 *
 * `turbo` first: measured as strong on German and the cheapest option that is,
 * which is the pairing that matters for dictation — the learner is speaking
 * the language they already have, not the one they are learning.
 */
export function speechChain(): Link[] {
  return GROQ.models.map((model) => ({ provider: { ...GROQ, models: [...GROQ.models] }, model }));
}

/**
 * Whether this deployment can transcribe at all.
 *
 * Takes a plain lookup rather than `NodeJS.ProcessEnv`: it reads one key, and
 * Next declares `NODE_ENV` required on that type, so every caller in a test
 * would have to invent one to ask a question that does not involve it.
 */
export function speechConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env[GROQ.keyEnv]?.trim());
}
