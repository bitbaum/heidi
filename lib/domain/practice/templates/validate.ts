import { check } from "../../../variety/check.ts";
import { SOURCES } from "../../../research/sources.ts";
import { saysWord } from "../../../text/words.ts";
import { LESSON_IDS, QUESTION_OPTIONS } from "../types.ts";
import {
  isExample,
  isLine,
  resolve,
  type ClockTemplate,
  type GistTemplate,
  type Library,
  type ReplyTemplate,
  type Resolved,
  type Said,
  type TransformTemplate,
} from "./template.ts";

/**
 * Everything wrong with a set of templates, as sentences a person can act on.
 *
 * EMPTY IS THE ONLY PASSING ANSWER, and `templates.test.ts` asserts exactly
 * that. It lives here rather than in the test so the rules sit next to the
 * types they police, and so the procedure in `template.ts` can name it.
 *
 * WHAT IT REFUSES, and why each one is a real failure rather than tidiness:
 *
 *   - a reference to a scene line or example that does not exist — the item
 *     would silently not be built, and a learner would never know it was
 *     meant to be there;
 *   - a Zurich string the gate rejects, at the house threshold — the product
 *     would be teaching the forms it tells the model not to produce;
 *   - a written sentence citing a source that is not in the register;
 *   - two options that are the same string — two right answers, one marked
 *     wrong;
 *   - a wrong option whose German is the right option's German — it MEANS the
 *     answer, so choosing it is correct and would be scored as a miss;
 *   - a `listen` word that is not in the question — feedback pointing at a
 *     word the learner never saw;
 *   - an unknown lesson, topic or word; and a heard line that is a `say` line,
 *     because the listening kinds are about what is said TO the learner.
 */
export function templateProblems(
  library: Library,
  sets: {
    reply: readonly ReplyTemplate[];
    gist: readonly GistTemplate[];
    transform: readonly TransformTemplate[];
    clock: readonly ClockTemplate[];
  },
): string[] {
  const problems: string[] = [];
  const topics = new Set((library.pack.grammar ?? []).map((t) => t.id));
  const lessons = new Set<string>(LESSON_IDS);

  function where(kind: string, id: string) {
    return `${kind}:${id}`;
  }

  function said(at: string, s: Said): Resolved | undefined {
    const r = resolve(s, library);
    if (!r) {
      const ref = isLine(s) ? `${s.scene}#${s.line}` : isExample(s) ? `${s.topic} example ${s.example}` : s.target;
      problems.push(`${at}: points at ${ref}, which does not exist`);
      return undefined;
    }
    if (!isLine(s) && !isExample(s)) {
      if (!(s.cite in SOURCES)) problems.push(`${at}: «${s.target}» cites "${s.cite}", which is not a source`);
      gate(at, s.target);
    }
    return r;
  }

  function gate(at: string, text: string) {
    // The house threshold — the one the site's own Zurich German copy meets.
    const verdict = check(text, library.pack, "dispreferred");
    if (!verdict.ok) problems.push(`${at}: «${text}» fails the gate (${verdict.findings.map((f) => f.form).join(", ")})`);
  }

  function distinct(at: string, options: readonly string[]) {
    const folded = options.map((o) => o.trim().toLowerCase());
    if (new Set(folded).size !== folded.length) problems.push(`${at}: two options are the same`);
    if (options.length !== QUESTION_OPTIONS) problems.push(`${at}: ${options.length} options, not ${QUESTION_OPTIONS}`);
  }

  function lesson(at: string, id: string) {
    if (!lessons.has(id)) problems.push(`${at}: lesson "${id}" is not in LESSON_IDS`);
  }

  function listen(at: string, word: string | undefined, text: string | undefined) {
    if (!word || !text) return;
    for (const part of word.split("…").map((p) => p.trim()).filter(Boolean)) {
      if (!saysWord(text, part)) problems.push(`${at}: listens for «${part}», which is not in «${text}»`);
    }
  }

  function heardLine(at: string, t: { heard: Said }) {
    const heard = said(at, t.heard);
    if (heard && heard.direction !== "hear") problems.push(`${at}: the heard line is a "say" line`);
    return heard;
  }

  const ids = new Map<string, number>();
  const count = (id: string) => ids.set(id, (ids.get(id) ?? 0) + 1);

  for (const t of sets.reply) {
    const at = where("reply", t.id);
    count(at);
    lesson(at, t.lesson);
    const heard = heardLine(at, t);
    const right = said(at, t.right);
    const wrong = t.wrong.map((w) => said(at, w));
    if (right && wrong.every(Boolean)) {
      distinct(at, [right.target, ...wrong.map((w) => w!.target)]);
      if (heard && [right, ...wrong].some((o) => o!.target === heard.target)) {
        problems.push(`${at}: the heard line is offered as its own reply`);
      }
    }
    listen(at, t.listen?.word, heard?.target);
  }

  for (const t of sets.gist) {
    const at = where("gist", t.id);
    count(at);
    lesson(at, t.lesson);
    const heard = heardLine(at, t);
    distinct(at, [t.right, ...t.wrong]);
    listen(at, t.listen?.word, heard?.target);
  }

  for (const t of sets.transform) {
    const at = where("transform", t.id);
    count(at);
    lesson(at, t.lesson);
    if ("topic" in t.about && !topics.has(t.about.topic)) problems.push(`${at}: no grammar topic "${t.about.topic}"`);
    if ("word" in t.about) {
      const word = t.about.word;
      if (!library.pack.vocabulary?.some((v) => v.target === word)) problems.push(`${at}: no vocabulary entry "${word}"`);
    }
    const right = said(at, t.right);
    const wrong = t.wrong.map((w) => said(at, w));
    if (right && wrong.every(Boolean)) {
      distinct(at, [right.target, ...wrong.map((w) => w!.target)]);
      const german = right.bridge.trim().toLowerCase();
      for (const w of wrong) {
        if (w!.bridge.trim().toLowerCase() === german) {
          problems.push(`${at}: «${w!.target}» means «${w!.bridge}» — the same as the answer`);
        }
      }
    }
    listen(at, t.listen?.word, right?.target);
  }

  for (const t of sets.clock) {
    const at = where("clock", t.id);
    count(at);
    lesson(at, t.lesson);
    if (!library.situations.some((d) => d.situations.some((s) => s.id === t.scene))) {
      problems.push(`${at}: no scene "${t.scene}"`);
    }
    const s = said(at, t.said);
    distinct(at, [t.right, ...t.wrong]);
    for (const option of [t.right, ...t.wrong]) {
      if (!/^\d{1,3}[.:]\d{2}$/.test(option)) problems.push(`${at}: «${option}» is not a time or a price`);
    }
    listen(at, t.listen?.word, s?.target);
  }

  for (const [id, n] of ids) if (n > 1) problems.push(`${id}: used ${n} times — ids key the learner's history`);

  return problems;
}
