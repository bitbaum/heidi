import type { ClockTemplate, LineRef, Written } from "../template.ts";

/**
 * "What time is that? How much is that?" — said in Zurich German, answered
 * in digits.
 *
 * THE MOST OBJECTIVE QUESTION THIS PRODUCT CAN ASK. The options are numbers,
 * the same in every language, and the right one is arithmetic. It is also a
 * real gap: a German reader follows «halbi drüü» (it is «halb drei») but not
 * «Viertel ab drüü», and a price said at a till as «drüü Franke zwänzg» is gone
 * before `drüü` has resolved into `drei`.
 *
 * GENERATED FROM TWO SMALL TABLES rather than written out one by one: the
 * hours as this pack spells them, and a few carrier sentences shaped like
 * lines the scenes already have («De Dokter chunt am zäh», «Mir händ am zäh e
 * Sitzig»). Adding an hour is one row; adding a way of saying a time is one
 * function. The wrong answers are the mistakes the forms invite — `halbi drüü`
 * read as half past three, `ab` read as `vor` — so every miss is a specific,
 * explainable one.
 *
 * TWELVE-HOUR DIGITS, because that is how the times are said: «am halbi drüü»
 * does not say whether it is afternoon, and an option that did would be a
 * claim the sentence never made.
 */

const W = (target: string, bridge: string): Written => ({ target, bridge, cite: "idiotikon" });
const L = (scene: string, line: number): LineRef => ({ scene, line });

/**
 * The hours, as this pack writes them after `am`. Every form here but `nüüni`
 * and `elfi` already occurs in a scene; those two follow the same -i pattern.
 * `zäh` is left out of the half and quarter forms on purpose: the pack says
 * «am zäh» for the hour, and inventing its -i form here would be the pack
 * spelling one word two ways.
 */
const HOURS: readonly { n: number; said: string; german: string }[] = [
  { n: 2, said: "zwei", german: "zwei" },
  { n: 3, said: "drüü", german: "drei" },
  { n: 4, said: "vieri", german: "vier" },
  { n: 6, said: "sächsi", german: "sechs" },
  { n: 8, said: "achti", german: "acht" },
  { n: 9, said: "nüüni", german: "neun" },
  { n: 11, said: "elfi", german: "elf" },
  { n: 12, said: "zwölfi", german: "zwölf" },
];

/** Where a time is said. `{t}` is the Zurich time, `{g}` the German one. */
const CARRIERS: readonly { target: string; bridge: string; scene: string }[] = [
  { target: "De Dokter chunt am {t}.", bridge: "Der Arzt kommt um {g}.", scene: "handover" },
  { target: "Mir händ am {t} e Sitzig.", bridge: "Wir haben um {g} eine Sitzung.", scene: "at-work" },
  { target: "De Termin isch am {t}.", bridge: "Der Termin ist um {g}.", scene: "appointment" },
  { target: "D Wösch isch am {t} fertig.", bridge: "Die Wäsche ist um {g} fertig.", scene: "laundry-room" },
];

const time = (h: number, m: number) => `${h}:${String(m).padStart(2, "0")}`;

type Shape = {
  key: string;
  said: (h: string) => string;
  german: (g: string) => string;
  right: (n: number) => string;
  wrong: (n: number) => [string, string, string];
  lesson: ClockTemplate["lesson"];
};

const SHAPES: readonly Shape[] = [
  {
    key: "half",
    said: (h) => `halbi ${h}`,
    german: (g) => `halb ${g}`,
    right: (n) => time(n - 1, 30),
    // `n:30` is «halbi drüü» read as English "half three", half PAST three.
    wrong: (n) => [time(n, 30), time(n - 1, 15), time(n, 15)],
    lesson: "clock-half",
  },
  {
    key: "quarter-past",
    said: (h) => `Viertel ab ${h}`,
    german: (g) => `Viertel nach ${g}`,
    right: (n) => time(n, 15),
    // `(n-1):45` is `ab` taken for `vor`.
    wrong: (n) => [time(n - 1, 45), time(n, 45), time(n - 1, 15)],
    lesson: "clock-quarter",
  },
  {
    key: "quarter-to",
    said: (h) => `Viertel vor ${h}`,
    german: (g) => `Viertel vor ${g}`,
    right: (n) => time(n - 1, 45),
    wrong: (n) => [time(n, 15), time(n, 45), time(n - 1, 15)],
    lesson: "clock-quarter",
  },
];

function times(): ClockTemplate[] {
  const out: ClockTemplate[] = [];
  let turn = 0;
  for (const shape of SHAPES) {
    for (const hour of HOURS) {
      const carrier = CARRIERS[turn++ % CARRIERS.length]!;
      const said = shape.said(hour.said);
      out.push({
        id: `${shape.key}-${hour.n}`,
        said: W(carrier.target.replace("{t}", said), carrier.bridge.replace("{g}", shape.german(hour.german))),
        scene: carrier.scene,
        right: shape.right(hour.n),
        wrong: shape.wrong(hour.n),
        lesson: shape.lesson,
        listen: { word: said, means: shape.german(hour.german) },
      });
    }
  }
  return out;
}

/**
 * Prices, as a till says them: francs, then rappen, no «und» and no «Komma».
 * The wrong answers swap the two halves or mishear a numeral — the mistakes
 * somebody makes with a queue behind them.
 */
const PRICES: readonly ClockTemplate[] = [
  {
    id: "price-3-20",
    said: L("shopping", 11),
    scene: "shopping",
    right: "3.20",
    wrong: ["2.30", "3.02", "20.03"],
    lesson: "price",
    listen: { word: "drüü Franke zwänzg", means: "drei Franken zwanzig" },
  },
  {
    id: "price-12-50",
    said: W("Das macht zwölf Franke füfzg.", "Das macht zwölf Franken fünfzig."),
    scene: "shopping",
    right: "12.50",
    wrong: ["15.20", "12.15", "2.50"],
    lesson: "price",
    listen: { word: "füfzg", means: "fünfzig" },
  },
  {
    id: "price-6-40",
    said: W("Es macht sächs Franke vierzg.", "Das macht sechs Franken vierzig."),
    scene: "shopping",
    right: "6.40",
    wrong: ["4.60", "6.14", "7.40"],
    lesson: "price",
    listen: { word: "sächs Franke vierzg", means: "sechs Franken vierzig" },
  },
  {
    id: "price-9-90",
    said: W("Das choschtet nüün Franke nüünzg.", "Das kostet neun Franken neunzig."),
    scene: "shopping",
    right: "9.90",
    wrong: ["9.19", "19.90", "9.09"],
    lesson: "price",
    listen: { word: "nüün", means: "neun" },
  },
  {
    id: "price-4-30",
    said: W("Es macht vier Franke drissg.", "Das macht vier Franken dreissig."),
    scene: "shopping",
    right: "4.30",
    wrong: ["3.40", "4.13", "14.30"],
    lesson: "price",
    listen: { word: "drissg", means: "dreissig" },
  },
  {
    id: "price-10-stutz",
    said: W("Das choschtet zäh Stutz.", "Das kostet zehn Franken."),
    scene: "shopping",
    right: "10.00",
    wrong: ["0.10", "100.00", "1.00"],
    lesson: "price",
    listen: { word: "Stutz", means: "Franken" },
  },
];

export const CLOCK: readonly ClockTemplate[] = [...times(), ...PRICES];
