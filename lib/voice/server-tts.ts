/**
 * Heidi reading aloud from the server, for a device that has no German voice.
 *
 * WHY. Read-aloud used the browser's own synthesiser and nothing else, so on
 * a computer without a German voice installed — most Windows and Linux
 * machines out of the box — it could only say "no voice on this device". A
 * learner does not know they are supposed to install one, and should not
 * have to. This is the second leg: the same text, spoken by a Gemini voice,
 * with the key the chat already uses (GEMINI_API_KEY).
 *
 * WHAT IT IS NOT. A German voice reading — Standard German, exactly what the
 * browser offers at best, labelled the same way ("german" in
 * `variety.ts`). No synthetic voice is Zurich German and this one does not
 * pretend to be.
 *
 * TWO ROUTES, because Google is moving speech to a new endpoint: the
 * `generateContent` form of gemini-2.5-flash-preview-tts, then the
 * `interactions` form of gemini-3.8-flash-lite-tts. Each answer is parsed
 * defensively; if neither yields audio the caller gets `null` and the page
 * says what it said before. This is the first server voice in the fleet:
 * when a second product needs one, it moves to @bitbaum/ai-kit
 * ("extract before the second copy").
 */
export type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

const BASE = "https://generativelanguage.googleapis.com/v1beta";
export const VOICE = "Kore";
const SAMPLE_RATE = 24_000;
const TIMEOUT_MS = 20_000;

export function serverVoiceConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.GEMINI_API_KEY?.trim());
}

type Leg = { name: string; url: string; body: (text: string) => unknown; audio: (json: unknown) => Audio | null };
type Audio = { data: string; mimeType: string };

const LEGS: readonly Leg[] = [
  {
    name: "gemini-2.5-flash-preview-tts",
    url: `${BASE}/models/gemini-2.5-flash-preview-tts:generateContent`,
    body: (text) => ({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
      },
    }),
    audio: (json) => {
      const parts = (json as { candidates?: { content?: { parts?: { inlineData?: Partial<Audio> }[] } }[] })
        ?.candidates?.[0]?.content?.parts;
      const found = parts?.find((p) => typeof p?.inlineData?.data === "string")?.inlineData;
      return found?.data ? { data: found.data, mimeType: found.mimeType ?? "audio/L16" } : null;
    },
  },
  {
    name: "gemini-3.8-flash-lite-tts",
    url: `${BASE}/interactions`,
    body: (text) => ({
      model: "gemini-3.8-flash-lite-tts",
      input: [{ type: "user_input", content: [{ type: "text", text }] }],
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: VOICE }] },
    }),
    audio: (json) => {
      const steps = (json as { steps?: { type?: string; content?: { type?: string; data?: string; mime_type?: string }[] }[] })?.steps;
      const clips = (steps ?? [])
        .filter((s) => s?.type === "model_output")
        .flatMap((s) => s.content ?? [])
        .filter((c) => c?.type === "audio" && typeof c.data === "string");
      const last = clips.at(-1);
      return last?.data ? { data: last.data, mimeType: last.mime_type ?? "audio/wav" } : null;
    },
  },
];

/** WAV bytes for the text, or null when no route answered with audio. */
export async function synthesize(
  text: string,
  options: { env?: Record<string, string | undefined>; fetch?: Fetch } = {},
): Promise<Uint8Array | null> {
  const env = options.env ?? process.env;
  const key = env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  const doFetch = options.fetch ?? ((input, init) => fetch(input, init));
  for (const leg of LEGS) {
    try {
      const res = await doFetch(leg.url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(leg.body(text)),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        console.error("[speak] a voice route refused", { route: leg.name, status: res.status });
        continue;
      }
      const audio = leg.audio(await res.json());
      if (!audio) {
        console.error("[speak] a voice route answered without audio", { route: leg.name });
        continue;
      }
      return asWav(base64Bytes(audio.data), audio.mimeType);
    } catch (error) {
      console.error("[speak] a voice route failed", { route: leg.name, error: (error as Error).name });
    }
  }
  return null;
}

function base64Bytes(data: string): Uint8Array {
  return new Uint8Array(Buffer.from(data, "base64"));
}

/** A WAV file as-is; raw 16-bit PCM (audio/L16, audio/pcm) given a RIFF header. */
export function asWav(bytes: Uint8Array, mimeType: string): Uint8Array {
  const isRiff = bytes.length >= 4 && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF";
  if (isRiff) return bytes;
  const rate = Number(/rate=(\d+)/i.exec(mimeType)?.[1]) || SAMPLE_RATE;
  const header = new DataView(new ArrayBuffer(44));
  const ascii = (at: number, s: string) => [...s].forEach((c, i) => header.setUint8(at + i, c.charCodeAt(0)));
  ascii(0, "RIFF");
  header.setUint32(4, 36 + bytes.length, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  header.setUint32(16, 16, true); // PCM chunk size
  header.setUint16(20, 1, true); // PCM
  header.setUint16(22, 1, true); // mono
  header.setUint32(24, rate, true);
  header.setUint32(28, rate * 2, true); // byte rate
  header.setUint16(32, 2, true); // block align
  header.setUint16(34, 16, true); // bits
  ascii(36, "data");
  header.setUint32(40, bytes.length, true);
  const out = new Uint8Array(44 + bytes.length);
  out.set(new Uint8Array(header.buffer), 0);
  out.set(bytes, 44);
  return out;
}
