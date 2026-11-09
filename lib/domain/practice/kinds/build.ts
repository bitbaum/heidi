import type { SituationPack } from "../../../situations/pack.ts";
import type { BuildItem, VerifyItem } from "../types.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/** A line's words as tiles: split on spaces, the sentence's punctuation kept on its word. */
export function tilesOf(line: string): string[] {
  return line.split(/\s+/).map((w) => w.trim()).filter(Boolean);
}

/** For comparing an order: case and the punctuation around words do not count. */
export function sameWords(a: readonly string[], b: readonly string[]): boolean {
  const norm = (w: string) => w.toLocaleLowerCase("de").replace(/^[«»„“"'(]+|[«»„“"'),.!?;:—–]+$/g, "");
  return a.length === b.length && a.every((w, i) => norm(w) === norm(b[i]));
}

/** A small stable number from a string, so generation needs no dice. */
function hash(text: string): number {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

export function buildItems(packs: readonly SituationPack[]): BuildItem[] {
  const items: BuildItem[] = [];
  for (const pack of packs) {
    for (const scene of pack.situations) {
      const said = scene.phrases.map((phrase, index) => ({ phrase, index })).filter(({ phrase }) => phrase.direction === "say");
      for (const { phrase, index } of said) {
        const words = tilesOf(phrase.target);
        if (words.length < 3 || words.length > 9) continue;
        const mine = new Set(words.map((w) => w.toLocaleLowerCase("de")));
        // One word from another line of the same scene that this line does not use.
        const pool = said
          .filter((other) => other.index !== index)
          .flatMap((other) => tilesOf(other.phrase.target))
          .filter((w) => w.length > 2 && !mine.has(w.toLocaleLowerCase("de")) && !/[.!?,]$/.test(w));
        const extra = pool.length ? [pool[hash(`${scene.id}:${index}`) % pool.length]] : [];
        items.push({
          id: `build:${scene.id}:${index}`,
          kind: "build",
          marking: "objective",
          prompt: phrase.bridge,
          words,
          extra,
          answer: phrase.target,
          source: { kind: "situation", scene: scene.id, line: index, ...(phrase.grammar ? { topic: phrase.grammar } : {}) },
        });
      }
    }
  }
  return items;
}

export function verifyItems(packs: readonly SituationPack[]): VerifyItem[] {
  const items: VerifyItem[] = [];
  for (const pack of packs) {
    for (const scene of pack.situations) {
      const heard = scene.phrases.map((phrase, index) => ({ phrase, index })).filter(({ phrase }) => phrase.direction === "hear");
      for (const { phrase, index } of heard) {
        const others = heard.filter((o) => o.index !== index && o.phrase.bridge.trim() !== phrase.bridge.trim());
        const h = hash(`${scene.id}:${index}`);
        const correct = others.length === 0 || h % 2 === 0;
        const meaning = correct ? phrase.bridge : others[(h >>> 1) % others.length].phrase.bridge;
        items.push({
          id: `verify:${scene.id}:${index}`,
          kind: "verify",
          marking: "objective",
          said: phrase.target,
          meaning,
          truth: phrase.bridge,
          correct,
          source: { kind: "situation", scene: scene.id, line: index, ...(phrase.grammar ? { topic: phrase.grammar } : {}) },
        });
      }
    }
  }
  return items;
}

export const BUILD: ExerciseKind = {
  id: "build",
  answering: "tap",
  decisions: "several",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => buildItems(material.situations),
};

export const VERIFY: ExerciseKind = {
  id: "verify",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => verifyItems(material.situations),
};
