/**
 * The vendors someone may plug their own key into.
 *
 * A FIXED LIST, deliberately — not a base URL the browser can choose.
 *
 * The obvious design is "paste your endpoint and your key", and it is a
 * server-side request forgery hole with a friendly form around it: our server
 * would happily POST a credential to `http://169.254.169.254/` or to anything
 * else reachable from inside the box, because the visitor asked it to. An
 * allowlist makes that unrepresentable, and costs a user nothing real — the
 * vendors people actually have keys for are all here.
 *
 * Every entry must speak the OpenAI `/chat/completions` shape, because that is
 * what ai-kit posts. Anthropic and Google do not, so they are reachable through
 * OpenRouter rather than directly — which is also why OpenRouter is the
 * recommended choice: one key, and Claude, Gemini and GPT are all behind it.
 */

import { BYOK_VENDORS, type ByokVendorId } from "@bitbaum/ai-kit/byok";

/**
 * WHICH VENDORS A KEY MAY BE SENT TO — ai-kit's list, not ours.
 *
 * Heidi kept its own five-vendor table (no Anthropic, no Gemini) while
 * ai-kit's `BYOK_VENDORS` became the one answer every app shares: which hosts
 * a server may send a stranger's key to (the SSRF allowlist), where to get a
 * key, and how to check one. A vendor added there reaches Heidi with a version
 * bump. This file only adapts the names Heidi's code already uses.
 *
 * No per-vendor "can read pictures" flag and no default model: ai-kit routes
 * images on the model's observed capability, and the model is picked from the
 * list the reader's own key can reach (`/api/model/check`), not guessed here.
 */
export type ProviderId = ByokVendorId;

export type ByokProvider = {
  id: ProviderId;
  label: string;
  /** No trailing slash. ai-kit appends `/chat/completions`. */
  baseUrl: string;
  /** Where the person goes to create a key. */
  keysUrl: string;
  /** Placeholder hint for the key field. Not validation. */
  keyHint: string;
  /** Placeholder for the model field, when the vendor lists no models. */
  modelExample: string;
};

export const BYOK_PROVIDERS: readonly ByokProvider[] = BYOK_VENDORS.map((v) => ({
  id: v.id,
  label: v.label,
  baseUrl: v.baseUrl,
  keysUrl: v.keyUrl,
  keyHint: v.keyHint,
  modelExample: v.modelExample,
}));

export function findProvider(id: string): ByokProvider | undefined {
  return BYOK_PROVIDERS.find((p) => p.id === id);
}
