import { permutation, type Random } from "./random.ts";
import type { PracticeItem } from "./types.ts";

/**
 * The item as it is SHOWN this time: options, word banks and both columns of
 * a matching board in a fresh order, with every answer index remapped to the
 * order on screen.
 *
 * Every item used to be shown exactly as generated — the same options in the
 * same places every time it came back — so a learner could answer the second
 * time by remembering where, not what. This runs once per card, at display;
 * the stored item, its id and everything the model records are untouched.
 */
export function presented<T extends PracticeItem>(item: T, random: Random): T {
  if ("options" in item && typeof (item as { answer?: unknown }).answer === "number") {
    const { options, answer } = item as unknown as { options: readonly string[]; answer: number };
    const order = permutation(options.length, random);
    return { ...item, options: order.map((i) => options[i]), answer: order.indexOf(answer) };
  }
  if (item.kind === "match") {
    const rows = permutation(item.targets.length, random);
    const cols = permutation(item.bridges.length, random);
    return {
      ...item,
      targets: rows.map((i) => item.targets[i]),
      bridges: cols.map((i) => item.bridges[i]),
      answer: rows.map((i) => cols.indexOf(item.answer[i])),
    };
  }
  if (item.kind === "gaptext") {
    const order = permutation(item.bank.length, random);
    return { ...item, bank: order.map((i) => item.bank[i]), answer: item.answer.map((b) => order.indexOf(b)) };
  }
  return item;
}
