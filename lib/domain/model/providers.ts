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

export type ProviderId = "openrouter" | "openai" | "groq" | "deepseek" | "together";

export type ByokProvider = {
  id: ProviderId;
  label: string;
  /** No trailing slash. ai-kit appends `/chat/completions`. */
  baseUrl: string;
  /** Where the person goes to create a key. */
  keysUrl: string;
  /** Shape hint used for a cheap client-side sanity check, never for auth. */
  keyPrefix?: string;
  /** A sensible default model that can read images, when the vendor has one. */
  visionModel?: string;
  /** A sensible default for text, when they just want better answers. */
  textModel: string;
  /**
   * Why someone would pick this one — SOURCE COPY for maintainers, in English.
   *
   * Deliberately not rendered: it leaked English into a German dropdown once.
   * What a visitor needs in order to choose is whether the provider can read a
   * picture, and that is shown from the dictionary as a localised badge.
   */
  note: string;
};

export const BYOK_PROVIDERS: readonly ByokProvider[] = [
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    keysUrl: "https://openrouter.ai/keys",
    keyPrefix: "sk-or-",
    visionModel: "openai/gpt-5-mini",
    textModel: "openai/gpt-5-mini",
    note: "One key, and Claude, Gemini and GPT are all behind it.",
  },
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    keysUrl: "https://platform.openai.com/api-keys",
    keyPrefix: "sk-",
    visionModel: "gpt-5-mini",
    textModel: "gpt-5-mini",
    note: "Direct, if you already have an account.",
  },
  {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    keysUrl: "https://console.groq.com/keys",
    keyPrefix: "gsk_",
    // Groq's hosted models are text-only at the time of writing, so no vision
    // default is offered rather than one being guessed.
    textModel: "openai/gpt-oss-120b",
    note: "Very fast. Text only.",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    keysUrl: "https://platform.deepseek.com/api_keys",
    keyPrefix: "sk-",
    textModel: "deepseek-chat",
    note: "Inexpensive. Text only.",
  },
  {
    id: "together",
    label: "Together",
    baseUrl: "https://api.together.xyz/v1",
    keysUrl: "https://api.together.ai/settings/api-keys",
    textModel: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
    note: "Open-weight models.",
  },
];

export function findProvider(id: string): ByokProvider | undefined {
  return BYOK_PROVIDERS.find((p) => p.id === id);
}

/** Providers that can be given a picture. Drives what the attach button says. */
export const VISION_PROVIDERS = BYOK_PROVIDERS.filter((p) => p.visionModel);
