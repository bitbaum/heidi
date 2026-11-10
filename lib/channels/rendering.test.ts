import { test, before, mock } from "node:test";
import assert from "node:assert/strict";

/**
 * A dialect episode's machine text is a RENDERING, never an `auto` transcript
 * (HEIDI.md, "On a dialect source that text is a RENDERING"). The recogniser
 * is faked: what is under test is the label, not the vendor.
 */
let transcribeOpening: typeof import("./remote.ts").transcribeOpening;

before(async () => {
  mock.module("../domain/model/speech.ts", {
    namedExports: { speechConfigured: () => true, speechChain: () => [] },
  });
  mock.module("@bitbaum/ai-kit", {
    namedExports: {
      transcribe: async () => ({
        text: "Heute reden wir über Ferien. Wohin geht es? Ans Meer.",
        words: [
          { word: "Heute", start: 0, end: 0.4 }, { word: "reden", start: 0.4, end: 0.8 }, { word: "wir", start: 0.8, end: 1 },
          { word: "über", start: 1, end: 1.3 }, { word: "Ferien.", start: 1.3, end: 2 }, { word: "Wohin", start: 4, end: 4.4 },
          { word: "geht", start: 4.4, end: 4.7 }, { word: "es?", start: 4.7, end: 5 }, { word: "Ans", start: 8, end: 8.3 },
          { word: "Meer.", start: 8.3, end: 9 },
        ],
      }),
    },
  });
  ({ transcribeOpening } = await import("./remote.ts"));
});

const audio = async () => new Response(new Uint8Array(64 * 1024), { status: 206, headers: { "content-type": "audio/mpeg" } });

test("a dialect episode comes back labelled as a rendering, an ordinary one as automatic", async () => {
  const rendered = await transcribeOpening("https://feeds.example/ep.mp3", audio, { language: "de", as: "rendering" });
  assert.equal(rendered.state, "ready");
  if (rendered.state === "ready") {
    assert.equal(rendered.transcript.source, "rendering");
    assert.ok(rendered.transcript.lines.length >= 3);
    assert.ok((rendered.transcript.coverageSeconds ?? 0) > 0, "says how far it reaches");
  }
  const plain = await transcribeOpening("https://feeds.example/ep.mp3", audio, { language: "de" });
  assert.equal(plain.state === "ready" && plain.transcript.source, "auto");
});

test("a stored rendering survives decoding as a rendering", async () => {
  const { decodeTranscript } = await import("./transcript.ts");
  const back = decodeTranscript({ lines: [{ start: 0, end: 1, text: "a" }, { start: 1, end: 2, text: "b" }, { start: 2, end: 3, text: "c" }], source: "rendering", lang: "de" });
  assert.equal(back?.source, "rendering");
});
