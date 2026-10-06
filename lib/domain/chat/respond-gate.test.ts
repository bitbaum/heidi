import { test, describe, mock, before } from "node:test";
import assert from "node:assert/strict";
import * as aiKit from "@bitbaum/ai-kit";
import type { Link } from "@bitbaum/ai-kit";
import { checkExplanation, parseAnswer } from "./parse.ts";
import { ZURICH_GERMAN } from "../../variety/packs/gsw-zh.ts";
import { LEARNER_ID, type ChatMessage } from "./types.ts";

/**
 * The fixes for the chats George pasted on 2026-10-06 («Le Bilan», «Pire», the
 * Novartis screenshot). Each test names the line that went wrong live.
 */

describe("an explanation written in Zurich German is judged too", () => {
  test("Standard German passed off as a Zurich German explanation is refused", () => {
    const v = checkExplanation("Der Text ist in Hochdeutsch, weil er aus einer offiziellen Quelle stammt.", ZURICH_GERMAN);
    assert.equal(v.ok, false);
  });

  test("«Züritüütsch» in Heidi's own voice is refused — house style, not just the generation gate", () => {
    assert.equal(checkExplanation("«Pire» isch Französisch und heisst uf Züritüütsch «schlechter».", ZURICH_GERMAN).ok, false);
  });

  test("«hesch» in Heidi's own voice is rewritten to the house «häsch»", () => {
    assert.equal(checkExplanation("Hesch öppis anders welle wüsse?", ZURICH_GERMAN).ok, false);
    assert.equal(checkExplanation("Häsch öppis anders welle wüsse?", ZURICH_GERMAN).ok, true);
  });

  test("a quoted word is the subject, not a mistake", () => {
    const v = checkExplanation("«Le Bilan» isch Französisch und heisst «die Bilanz».", ZURICH_GERMAN);
    assert.equal(v.ok, true, v.flags.join(", "));
  });

  test("parseAnswer marks the explanation only when asked to — elsewhere it is the reader's own language", () => {
    const raw = JSON.stringify({ mode: "answer", text: "Der Text ist in Hochdeutsch." });
    assert.equal(parseAnswer(raw, ZURICH_GERMAN, "m", { explainInVariety: true }).textClean, false);
    assert.equal(parseAnswer(raw, ZURICH_GERMAN, "m").textClean, undefined);
  });
});

describe("the gate's new forms", () => {
  test("«stöh» and «göh» are Bern's plurals, not Zurich's", () => {
    for (const line of ["wo mir grad stöh", "Mir göh hüt is Kino."]) {
      assert.equal(parseAnswer(JSON.stringify({ mode: "produce", text: "t", dialect: line }), ZURICH_GERMAN, "m").dialectClean, false, line);
    }
  });

  test("two articles on one noun («d'Le Bilan») are refused; one article passes", () => {
    const flagged = (line: string) =>
      parseAnswer(JSON.stringify({ mode: "produce", text: "t", dialect: line }), ZURICH_GERMAN, "m").dialectClean === false;
    assert.equal(flagged("I ha d'Le Bilan fertig gmacht."), true);
    assert.equal(flagged("I ha de Bilan fertig gmacht."), false);
    assert.equal(flagged("D Lena chunt hüt."), false);
  });
});

describe("respondInThread: second chance, the real model, no echoed glosses", () => {
  const calls: { system: string }[] = [];
  let replies: { text: string; id: string }[] = [];
  const link = (id: string, model: string) => ({ provider: { id, baseUrl: "https://x.invalid", keyEnv: "K", models: [model] }, model }) as unknown as Link;
  let respond: typeof import("./respond.ts");

  before(async () => {
    mock.module("@bitbaum/ai-kit", {
      namedExports: {
        ...aiKit,
        usableChain: () => [link("groq", "openai/gpt-oss-120b"), link("google", "models/gemini-flash-latest")],
        complete: async (call: { messages: { role: string; content: string }[] }) => {
          calls.push({ system: call.messages[0].content });
          const next = replies.shift();
          if (!next) throw new Error("no reply scripted");
          return { text: next.text, id: next.id, link: link("google", "models/gemini-flash-latest"), toolCalls: [], raw: {} };
        },
      },
    });
    respond = await import("./respond.ts");
  });

  const say = (body: string): ChatMessage[] => [{ id: "1", authorId: LEARNER_ID, body, createdAt: new Date().toISOString() }];
  const turn = async (body: string, locale: "gsw" | "de" = "de") => {
    const { soloThread } = await import("./thread.ts");
    return respond.respondInThread({ thread: soloThread(), messages: say(body), locale });
  };

  test("a refused line is retried once, by name, and the cleaner answer is kept", async () => {
    calls.length = 0;
    replies = [
      { text: JSON.stringify({ mode: "produce", text: "So sait mer das.", dialect: "Mir göh hüt is Kino." }), id: "google/models/gemini-flash-latest" },
      { text: JSON.stringify({ mode: "produce", text: "So sait mer das.", dialect: "Mir gönd hüt is Kino." }), id: "google/models/gemini-flash-latest" },
    ];
    const r = await turn("Sag, dass wir heute ins Kino gehen.");
    assert.equal(r.status, "answered");
    if (r.status !== "answered") return;
    assert.equal(r.answer.dialect, "Mir gönd hüt is Kino.");
    assert.equal(r.answer.dialectClean, true);
    assert.equal(calls.length, 2);
    assert.match(calls[1].system, /göh → gönd/, "the correction must name the refused form");
  });

  test("a clean answer is not asked twice", async () => {
    calls.length = 0;
    replies = [{ text: JSON.stringify({ mode: "produce", text: "t", dialect: "Mir gönd hüt is Kino." }), id: "groq/openai/gpt-oss-120b" }];
    await turn("Sag, dass wir heute ins Kino gehen.");
    assert.equal(calls.length, 1);
  });

  test("the footer names the link that SERVED, not the first in the chain", async () => {
    replies = [{ text: JSON.stringify({ mode: "answer", text: "Das isch es Bild." }), id: "google/models/gemini-flash-latest" }];
    const r = await turn("Was ist das?");
    assert.equal(r.status === "answered" && r.answer.model, "google/models/gemini-flash-latest");
  });

  test("a word the learner typed in a question is not handed back as vocabulary", async () => {
    replies = [
      {
        text: JSON.stringify({
          mode: "answer",
          text: "Damit du de Inhalt verstahsch.",
          glosses: [{ form: "Translation", standard: "Übersetzung", english: "Übersetzung", rule: "" }],
        }),
        id: "google/models/gemini-flash-latest",
      },
    ];
    const r = await turn("Warum hast du mir die Translation gegeben?");
    assert.equal(r.status === "answered" && r.answer.glosses.length, 0);
  });

  test("…but a one-word lookup keeps the gloss of that word", async () => {
    replies = [
      {
        text: JSON.stringify({ mode: "answer", text: "«Pire» isch Französisch.", glosses: [{ form: "pire", standard: "schlimmer", english: "schlimmer", rule: "" }] }),
        id: "google/models/gemini-flash-latest",
      },
    ];
    const r = await turn("Pire");
    assert.equal(r.status === "answered" && r.answer.glosses.length, 1);
  });
});

describe("Heidi's chain puts Gemini first", () => {
  test("the google link moves to the front; the rest keep ai-kit's order", async () => {
    const { dialectFirst } = await import("./respond.ts");
    const l = (id: string) => ({ provider: { id }, model: id }) as unknown as Link;
    assert.deepEqual(
      dialectFirst([l("groq"), l("google"), l("openrouter")]).map((x) => x.provider.id),
      ["google", "groq", "openrouter"],
    );
  });
});

