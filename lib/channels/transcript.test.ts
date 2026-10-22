import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { clock, decodeTranscript, excerpt, mergeFragments, parseClock, parsePasted } from "./transcript.ts";

describe("a pasted transcript", () => {
  test("the platform's panel copy: a time on one line, the words on the next", () => {
    const lines = parsePasted(["0:00", "Guten Morgen und herzlich willkommen.", "0:04", "Heute geht es um Orangensaft.", "1:02:03", "Das war es für heute."].join("\n"));
    assert.ok(lines);
    assert.equal(lines.length, 3);
    assert.deepEqual(lines[0], { start: 0, end: 4, text: "Guten Morgen und herzlich willkommen." });
    assert.equal(lines[1].start, 4);
    assert.equal(lines[2].start, 3723);
    assert.ok(lines[2].end > lines[2].start, "the last line is given a length");
  });

  test("the same, with the time and the words on one line, bracketed or not", () => {
    const a = parsePasted("[0:00] Eins zwei drei.\n[0:03] Vier fünf sechs.\n[0:06] Sieben acht neun.");
    const b = parsePasted("0:00 Eins zwei drei.\n0:03 Vier fünf sechs.\n0:06 Sieben acht neun.");
    assert.ok(a && b);
    assert.deepEqual(a.map((l) => l.text), ["Eins zwei drei.", "Vier fünf sechs.", "Sieben acht neun."]);
    assert.deepEqual(a, b);
  });

  test("WebVTT and SRT cues, with their own end times and wrapped text", () => {
    const vtt = ["WEBVTT", "", "00:00:01.000 --> 00:00:03.500", "Erste Zeile.", "", "00:00:04.000 --> 00:00:06.000", "Zweite Zeile,", "die umbricht.", "", "00:00:07.000 --> 00:00:08.000", "Dritte."].join("\n");
    const lines = parsePasted(vtt);
    assert.ok(lines);
    assert.deepEqual(lines[0], { start: 1, end: 3.5, text: "Erste Zeile." });
    assert.equal(lines[1].text, "Zweite Zeile, die umbricht.");
    const srt = ["1", "00:00:01,000 --> 00:00:03,000", "Eins.", "", "2", "00:00:04,000 --> 00:00:05,000", "Zwei.", "", "3", "00:00:06,000 --> 00:00:07,000", "Drei."].join("\n");
    assert.equal(parsePasted(srt)?.length, 3);
  });

  test("prose with no times is not a transcript", () => {
    assert.equal(parsePasted("Ein Absatz ohne Zeiten.\nNoch einer.\nUnd noch einer."), null);
    assert.equal(parsePasted(""), null);
    assert.equal(parsePasted("0:00\nNur eine Zeile."), null, "fewer than three lines is a caption, not a transcript");
  });

  test("clock readings", () => {
    assert.equal(parseClock("0:05"), 5);
    assert.equal(parseClock("12:34"), 754);
    assert.equal(parseClock("1:02:03"), 3723);
    assert.equal(parseClock("00:00:01.250"), 1.25);
    assert.equal(parseClock("00:00:01,5"), 1.5);
    assert.equal(parseClock("1:75"), null);
    assert.equal(parseClock("abc"), null);
    assert.equal(clock(3723), "1:02:03");
    assert.equal(clock(65), "1:05");
    assert.equal(clock(5), "0:05");
  });
});

describe("fragments", () => {
  test("are joined until a sentence ends, a pause falls or the line gets long", () => {
    const merged = mergeFragments([
      { start: 0, end: 1, text: "und dann hat" },
      { start: 1, end: 2, text: "er gesagt, dass" },
      { start: 2, end: 3, text: "es reicht." },
      { start: 3.2, end: 4, text: "Danach" },
      { start: 9, end: 10, text: "ging er." },
    ]);
    assert.deepEqual(merged.map((l) => l.text), ["und dann hat er gesagt, dass es reicht.", "Danach", "ging er."]);
    assert.deepEqual(merged[0], { start: 0, end: 3, text: "und dann hat er gesagt, dass es reicht." });
  });

  test("stage directions and blanks are dropped", () => {
    assert.deepEqual(
      mergeFragments([
        { start: 0, end: 1, text: "[Musik]" },
        { start: 1, end: 2, text: "  " },
        { start: 2, end: 3, text: "Hallo." },
      ]),
      [{ start: 2, end: 3, text: "Hallo." }],
    );
  });
});

describe("the stored shape", () => {
  test("is checked rather than trusted", () => {
    const good = { lines: [{ start: 0, end: 1, text: "a" }, { start: 1, end: 2, text: "b" }, { start: 2, end: 3, text: "c" }], source: "auto", lang: "de" };
    assert.deepEqual(decodeTranscript(good), good);
    assert.equal(decodeTranscript({ ...good, source: "wiki" }), null);
    assert.equal(decodeTranscript({ ...good, lines: good.lines.slice(0, 2) }), null);
    assert.equal(decodeTranscript("nonsense"), null);
    assert.equal(decodeTranscript({ ...good, lines: [...good.lines, { start: "x" }] })?.lines.length, 3, "a bad line is dropped, not fatal");
  });

  test("the excerpt a question set is written from is whole lines up to a budget", () => {
    const lines = Array.from({ length: 10 }, (_, i) => ({ start: i, end: i + 1, text: "x".repeat(100) }));
    const cut = excerpt(lines, 450);
    assert.equal(cut.lines.length, 4);
    assert.equal(cut.truncated, true);
    assert.equal(excerpt(lines, 5000).truncated, false);
    assert.equal(excerpt([{ start: 0, end: 1, text: "x".repeat(500) }], 100).lines.length, 1, "the first line always fits");
  });
});
