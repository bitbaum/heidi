import { test } from "node:test";
import assert from "node:assert/strict";
import { asWav, serverVoiceConfigured, synthesize } from "./server-tts.ts";

const env = { GEMINI_API_KEY: "test-key-not-real" };
const pcm = Buffer.from(new Uint8Array([1, 0, 2, 0, 3, 0, 4, 0])).toString("base64");
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test("without a key there is no server voice, and nothing is fetched", async () => {
  assert.equal(serverVoiceConfigured({}), false);
  assert.equal(await synthesize("Grüezi", { env: {}, fetch: async () => assert.fail("fetched") }), null);
});

test("the generateContent route: raw PCM comes back as a playable WAV, key in a header", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const wav = await synthesize("Grüezi mitenand", {
    env,
    fetch: async (url, init) => {
      calls.push({ url, init });
      return json({ candidates: [{ content: { parts: [{ inlineData: { mimeType: "audio/L16;codec=pcm;rate=24000", data: pcm } }] } }] });
    },
  });
  assert.ok(wav);
  assert.equal(String.fromCharCode(...wav.subarray(0, 4)), "RIFF");
  assert.equal(wav.length, 44 + 8);
  assert.match(calls[0].url, /gemini-2\.5-flash-preview-tts:generateContent$/);
  assert.equal((calls[0].init?.headers as Record<string, string>)["x-goog-api-key"], "test-key-not-real");
  assert.doesNotMatch(calls[0].url, /key=/, "the key never rides in the URL");
});

test("a refused first route falls through to the interactions route", async () => {
  const urls: string[] = [];
  const wav = await synthesize("Merci vilmal", {
    env,
    fetch: async (url) => {
      urls.push(url);
      if (urls.length === 1) return json({ error: "not found" }, 404);
      return json({ steps: [{ type: "model_output", content: [{ type: "audio", data: pcm }] }] });
    },
  });
  assert.ok(wav);
  assert.match(urls[1], /\/interactions$/);
});

test("no audio anywhere, or a network failure, is null rather than a throw", async () => {
  assert.equal(await synthesize("x", { env, fetch: async () => json({ candidates: [] }) }), null);
  assert.equal(await synthesize("x", { env, fetch: async () => { throw new TypeError("offline"); } }), null);
});

test("a WAV already is left alone; PCM gets a correct 24 kHz mono header", () => {
  const riff = new Uint8Array([82, 73, 70, 70, 0, 0]);
  assert.equal(asWav(riff, "audio/wav"), riff);
  const out = asWav(new Uint8Array(10), "audio/L16");
  const view = new DataView(out.buffer);
  assert.equal(view.getUint32(24, true), 24000);
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(40, true), 10);
});
