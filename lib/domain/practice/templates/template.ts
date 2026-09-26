import type { SituationPack } from "../../../situations/pack.ts";
import type { VarietyPack } from "../../../variety/pack.ts";
import type { SourceId } from "../../../research/sources.ts";
import { QUESTION_OPTIONS, type ItemSource, type LessonId, type QuestionItem, type QuestionKind } from "../types.ts";

/**
 * EXERCISE TEMPLATES — a new question is a record, not a feature.
 *
 * The generated kinds (`pair`, `pick`, `gaptext` …) rearrange the packs, and
 * that is still where most questions come from. But some of the best questions
 * cannot be generated: "which reply fits" needs somebody to decide which
 * replies do NOT fit, and "what does she mean" needs somebody to write the
 * wrong readings a German reader actually makes. Before this file each such
 * question would have been a new kind — a type, a generator, a view, a
 * keyboard handler. Now it is one of the records below, in `authored/`, and it
 * reaches `/practice`, the test run, the learner model and the explanation
 * panel through the same registry every other kind uses.
 *
 * HOW TO ADD A QUESTION (the whole procedure):
 *
 *   1. Open the file in `authored/` for the kind — `reply.ts`, `gist.ts`,
 *      `transform.ts`, `clock.ts` — and append a record. Point at lines the
 *      packs already have (`{ scene, line }`, `{ topic, example }`) whenever
 *      you can: those are gated, sourced and translated already. Write a new
 *      Zurich sentence only as `{ target, bridge, cite }`.
 *   2. Pick a `lesson` from `LESSON_IDS` (types.ts). A NEW teaching point is a
 *      new id there plus one sentence in `practice.lessons` in all seven
 *      dictionaries — the type checker names every one you missed.
 *   3. Optionally add `listen: { word, means }` — the Zurich word the answer
 *      turns on. It must occur in the question, and it is the most specific
 *      feedback an item can give.
 *   4. `pnpm run verify`. `templates.test.ts` resolves every record against
 *      the live packs and refuses: a reference that points at nothing, a Zurich
 *      string the gate rejects, a citation that is not a source, two options
 *      that are the same, a wrong answer that MEANS the same as the right one
 *      (same German), and an id used twice. A record that fails is dropped
 *      from the pool rather than shipped half-built, and the test says why.
 *
 * THE RULE THAT KEEPS AN AUTHORED ITEM MARKABLE. Wrong answers must be wrong
 * on CONTENT — a different time, a different person, a different thing asked
 * — never on nuance. "Which reply is more polite" is a real skill and not one
 * this product can mark; the lesson is where nuance goes, and it is never the
 * thing being scored.
 */

/** A line already in a situation pack, by scene and position. */
export type LineRef = { scene: string; line: number };

/** A grammar topic's own example sentence, by topic and position. */
export type ExampleRef = { topic: string; example: number };

/**
 * A Zurich sentence written for an exercise. Must pass the gate, and must name
 * who vouches for its words — the same bar a situation line meets.
 */
export type Written = { target: string; bridge: string; cite: SourceId };

/** Any Zurich sentence a template can use. References first; written last. */
export type Said = LineRef | ExampleRef | Written;

type Common = {
  /** Unique within the kind. Becomes `<kind>:<id>` — permanent, it keys the learner's history. */
  id: string;
  lesson: LessonId;
  /** The Zurich word the answer turns on, and its German. Must occur in the question. */
  listen?: { word: string; means: string };
};

/** A line is heard; which of four Zurich replies fits it? */
export type ReplyTemplate = Common & {
  heard: LineRef;
  right: Said;
  wrong: readonly [Said, Said, Said];
};

/** A line is heard; which German reading of it is right? */
export type GistTemplate = Common & {
  heard: LineRef;
  right: string;
  wrong: readonly [string, string, string];
};

/**
 * A German sentence is shown; which Zurich sentence says exactly that?
 *
 * The wrong ones are real Zurich sentences that say something ELSE — another
 * person, another tense, another word — so each is correct language and
 * wrong only as an answer to this German. `about` names what the difference
 * is about, and becomes the item's source.
 */
export type TransformTemplate = Common & {
  about: { topic: string } | { word: string };
  right: Said;
  wrong: readonly [Said, Said, Said];
};

/** A time or a price is said; which number is it? Options are digits. */
export type ClockTemplate = Common & {
  said: Said;
  /** The scene this is said in, for the trace link and the learner model. */
  scene: string;
  right: string;
  wrong: readonly [string, string, string];
};

/** The packs a template is resolved against. */
export type Library = { pack: VarietyPack; situations: readonly SituationPack[] };

/** A resolved sentence: what is said, and its German. */
export type Resolved = { target: string; bridge: string; direction?: "hear" | "say"; topic?: string };

export function isLine(said: Said): said is LineRef {
  return "scene" in said;
}

export function isExample(said: Said): said is ExampleRef {
  return "example" in said;
}

/** The sentence a reference points at, or undefined when it points at nothing. */
export function resolve(said: Said, library: Library): Resolved | undefined {
  if (isLine(said)) {
    for (const domain of library.situations) {
      const scene = domain.situations.find((s) => s.id === said.scene);
      const phrase = scene?.phrases[said.line];
      if (phrase) {
        return {
          target: phrase.target,
          bridge: phrase.bridge,
          direction: phrase.direction,
          ...(phrase.grammar ? { topic: phrase.grammar } : {}),
        };
      }
    }
    return undefined;
  }
  if (isExample(said)) {
    const example = library.pack.grammar?.find((t) => t.id === said.topic)?.examples[said.example];
    return example ? { target: example.target, bridge: example.bridge, topic: said.topic } : undefined;
  }
  return { target: said.target, bridge: said.bridge };
}

/**
 * Where the right answer goes, decided by the id rather than by a dice roll.
 *
 * The same reason `pair` and `pick` give: a random position makes a session
 * irreproducible for a test, and could put the answer in the same slot three
 * times running for a learner. A hash of a permanent id is neither.
 */
export function slotFor(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return h % QUESTION_OPTIONS;
}

/** The right answer placed among the wrong ones, and its index. */
export function place(id: string, right: string, wrong: readonly string[]): { options: string[]; answer: number } {
  const answer = slotFor(id);
  const options = [...wrong];
  options.splice(answer, 0, right);
  return { options, answer };
}

function sceneSource(ref: LineRef, heard: Resolved): ItemSource {
  return { kind: "situation", scene: ref.scene, line: ref.line, ...(heard.topic ? { topic: heard.topic } : {}) };
}

function common(kind: QuestionKind, t: Common) {
  return {
    id: `${kind}:${t.id}`,
    kind,
    marking: "objective" as const,
    lesson: t.lesson,
    ...(t.listen ? { listen: t.listen } : {}),
  };
}

/**
 * Each template, turned into the item a learner sees — or `undefined` when a
 * reference points at nothing, in which case the item simply does not exist.
 * `validate.ts` is what turns that silence into a failing test.
 */
export function replyItem(t: ReplyTemplate, library: Library): QuestionItem | undefined {
  const heard = resolve(t.heard, library);
  const right = resolve(t.right, library);
  const wrong = t.wrong.map((w) => resolve(w, library));
  if (!heard || !right || wrong.some((w) => !w)) return undefined;
  const base = common("reply", t);
  return {
    ...base,
    said: heard.target,
    ...place(base.id, right.target, wrong.map((w) => w!.target)),
    optionsIn: "target",
    source: sceneSource(t.heard, heard),
  };
}

export function gistItem(t: GistTemplate, library: Library): QuestionItem | undefined {
  const heard = resolve(t.heard, library);
  if (!heard) return undefined;
  const base = common("gist", t);
  return {
    ...base,
    said: heard.target,
    ...place(base.id, t.right, t.wrong),
    optionsIn: "bridge",
    source: sceneSource(t.heard, heard),
  };
}

export function transformItem(t: TransformTemplate, library: Library): QuestionItem | undefined {
  const right = resolve(t.right, library);
  const wrong = t.wrong.map((w) => resolve(w, library));
  if (!right || wrong.some((w) => !w)) return undefined;

  let source: ItemSource | undefined;
  if ("topic" in t.about) {
    source = { kind: "grammar", topic: t.about.topic };
  } else {
    const word = t.about.word;
    const entry = library.pack.vocabulary?.find((v) => v.target === word);
    if (entry) source = { kind: "word", word: entry.target, group: entry.group };
  }
  if (!source) return undefined;

  const base = common("transform", t);
  return {
    ...base,
    german: right.bridge,
    ...place(base.id, right.target, wrong.map((w) => w!.target)),
    optionsIn: "target",
    source,
  };
}

export function clockItem(t: ClockTemplate, library: Library): QuestionItem | undefined {
  const said = resolve(t.said, library);
  const sceneExists = library.situations.some((d) => d.situations.some((s) => s.id === t.scene));
  if (!said || !sceneExists) return undefined;
  const base = common("clock", t);
  return {
    ...base,
    said: said.target,
    ...place(base.id, t.right, t.wrong),
    optionsIn: "plain",
    // A time lifted from a real line counts toward that line; a written one
    // belongs to the scene it would be said in, and to no line of it.
    source: isLine(t.said) && t.said.scene === t.scene ? sceneSource(t.said, said) : { kind: "situation", scene: t.scene },
  };
}
