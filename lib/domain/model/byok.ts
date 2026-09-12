/**
 * Bring your own key — the shared contract between the browser and the route.
 *
 * Why this exists at all: the free chain has no model that can read a picture,
 * and a screenshot of a WhatsApp thread is the single most valuable thing
 * someone can hand this product. Paying for everyone's vision calls is not on
 * the table, so the capability is offered to whoever brings a key. That keeps
 * Heidi free for everyone and honest about why some things are not.
 *
 * WHERE THE KEY LIVES, precisely, because a user deserves a straight answer:
 *
 *   - It is held in THEIR browser's localStorage. Not in a cookie, so it is
 *     never attached to a request they did not choose to make.
 *   - It is sent to our route with each message, over TLS, and used to call the
 *     vendor they picked.
 *   - It is never written to our disk, never put in a database, never logged,
 *     and never returned in a response. The route holds it for the life of one
 *     request.
 *
 * That posture is defensible and explainable. The alternative — storing keys
 * server-side — buys a marginally smoother experience and makes us the
 * custodian of other people's money, which is a promise this project is not
 * ready to make.
 */

import { findProvider, type ProviderId } from "./providers.ts";

export type ByokConfig = {
  provider: ProviderId;
  key: string;
  /** The model id to call. Chosen by the person, defaulted from the provider. */
  model: string;
};

export type ByokCheck = { ok: true; config: ByokConfig } | { ok: false; reason: string };

/** Anything longer than this is a paste accident, not a key. */
const MAX_KEY = 400;
const MAX_MODEL = 120;

/**
 * Validate what arrived, on the server, before any of it reaches a fetch.
 *
 * The provider is looked up in the allowlist rather than trusted, which is the
 * whole defence against being pointed at an internal address.
 */
export function readByok(raw: unknown): ByokCheck {
  if (raw === undefined || raw === null) return { ok: false, reason: "absent" };
  if (typeof raw !== "object") return { ok: false, reason: "malformed" };

  const v = raw as Record<string, unknown>;
  const key = typeof v.key === "string" ? v.key.trim() : "";
  const model = typeof v.model === "string" ? v.model.trim() : "";
  const providerId = typeof v.provider === "string" ? v.provider : "";

  if (!key) return { ok: false, reason: "no key" };
  if (key.length > MAX_KEY) return { ok: false, reason: "key is implausibly long" };
  // A newline in a credential is how a header injection starts.
  if (/[\r\n]/.test(key)) return { ok: false, reason: "key contains a line break" };

  const provider = findProvider(providerId);
  if (!provider) return { ok: false, reason: "unknown provider" };

  if (!model) return { ok: false, reason: "no model" };
  if (model.length > MAX_MODEL) return { ok: false, reason: "model id is implausibly long" };

  return { ok: true, config: { provider: provider.id, key, model } };
}

/**
 * The ai-kit chain for someone's own key.
 *
 * One link, no fallback: falling through to OUR free models after their paid
 * model failed would silently answer a vision question with a model that
 * cannot see, and bill our budget for the privilege. Better to fail and say so.
 */
export function byokChain(config: ByokConfig) {
  const provider = findProvider(config.provider);
  if (!provider) return null;
  return {
    env: { HEIDI_BYOK_KEY: config.key },
    chain: [
      {
        provider: {
          id: provider.id,
          baseUrl: provider.baseUrl,
          keyEnv: "HEIDI_BYOK_KEY",
          models: [config.model],
          // Their key, their quota. Nothing of ours is being rationed, so the
          // fair-share pool must not think it has capacity it does not own.
          dailyTokens: 0,
        },
        model: config.model,
      },
    ],
  };
}

/** Never let a key reach a log line, an error body, or a bug report. */
export function redact(text: string): string {
  return text.replace(/\b(sk-[A-Za-z0-9-_]{8,}|gsk_[A-Za-z0-9]{8,}|sk-or-[A-Za-z0-9-_]{8,})\b/g, "<key>");
}
