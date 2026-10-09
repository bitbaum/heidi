import { test } from "node:test";
import assert from "node:assert/strict";
import { answerRow, MAX_ROW, type RowItem } from "./row.ts";

const send = (label: string, say = label): RowItem => ({ kind: "send", label, say });
const grammar: RowItem = { kind: "link", label: "Grammatik", href: "/de/grammatik/ch" };

test("replies come first, then the app's own items in their order", () => {
  const row = answerRow(["Ja", "Nein"], [send("Antwort schreiben", "Wie antworte ich?"), send("Wort für Wort")]);
  assert.deepEqual(
    row.map((i) => i.label),
    ["Ja", "Nein", "Antwort schreiben", "Wort für Wort"],
  );
});

test("the same thing is offered once — by label or by what it sends, ignoring case and accents", () => {
  const row = answerRow(
    ["wie antworte ich darauf?", "Gäld"],
    [send("Antwort schreiben", "Wie antworte ich darauf?"), send("gald"), send("Wort für Wort")],
  );
  assert.deepEqual(
    row.map((i) => i.label),
    ["wie antworte ich darauf?", "Gäld", "Wort für Wort"],
  );
});

test(`never more than ${MAX_ROW}`, () => {
  const row = answerRow(["a", "b", "c", "d"], [send("e"), send("f"), send("g")]);
  assert.equal(row.length, MAX_ROW);
  assert.deepEqual(
    row.map((i) => i.label),
    ["a", "b", "c", "d", "e"],
  );
});

test("an action keeps its place when replies fill the row; a sentence gives way", () => {
  const row = answerRow(["a", "b", "c", "d"], [send("e"), grammar, send("f")]);
  assert.deepEqual(
    row.map((i) => i.label),
    ["a", "b", "c", "d", "Grammatik"],
  );
  assert.equal(row.at(-1)?.kind, "link");
});

test("no replies: the app's own items alone, still capped", () => {
  assert.deepEqual(answerRow([], []), []);
  const row = answerRow([], [send("1"), send("2"), grammar, send("3"), send("4"), send("5"), send("6")]);
  assert.deepEqual(
    row.map((i) => i.label),
    ["1", "2", "Grammatik", "3", "4"],
  );
});

test("a blank label is not a button", () => {
  assert.deepEqual(answerRow(["  "], [send("")]), []);
});
