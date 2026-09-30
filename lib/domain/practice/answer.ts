import type { PracticeItem } from "./types.ts";

/**
 * The right answer, as one printable string, whatever kind of item it was.
 *
 * Used only in the end-of-session list, where the question is gone and the
 * answer is the thing worth carrying away. Every branch returns something the
 * variety actually says — never a paraphrase and never a label — because this
 * line is the last dialect a learner reads before closing the page.
 */
export function answerOf(item: PracticeItem): string {
  switch (item.kind) {
    case "pair":
    case "article":
    case "form":
    case "pick":
    case "reply":
    case "gist":
    case "transform":
    case "clock":
    case "meaning":
      return item.options[item.answer] ?? "";
    /**
     * A grid's answer is four answers, so it prints as the pairs themselves.
     * "1 of 4" is not something anybody can carry away.
     */
    case "match":
      return item.targets.map((target, i) => `${target} — ${item.bridges[item.answer[i]] ?? ""}`).join(" · ");
    /**
     * A passage prints as the words that went into it, in gap order. Not the
     * filled-in passage: four lines would push everything else off the screen,
     * and what went wrong was a placement rather than a sentence.
     */
    case "gaptext":
      return item.answer.map((bankIndex) => item.bank[bankIndex] ?? "").join(" · ");
    default:
      return item.answer;
  }
}

/**
 * The question, as one line a chat message can quote — so "ask Heidi about
 * this" can say what was asked without a screenshot.
 *
 * The dialect or German text the learner was looking at, with the German
 * beside a dialect prompt where the item carries it. Never a label from the
 * interface: this is sent as the learner's own words, in their language, and
 * the quoted part is what they saw.
 */
export function questionOf(item: PracticeItem): string {
  switch (item.kind) {
    case "pair":
      return item.options.join(" / ");
    case "cloze":
    case "pick":
      return `${item.prompt} (${item.bridge})`;
    case "article":
      return `___ ${item.noun} (${item.bridge})`;
    case "form":
      return `${item.subject ?? item.label} ___ (${item.word}, ${item.bridge})`;
    case "match":
      return item.targets.join(", ");
    case "gaptext":
      return item.lines.map((line) => line.prompt).join(" ");
    case "recall":
    case "translate":
    case "card":
      return item.prompt;
    default:
      return [item.german ?? item.said, item.focus && item.said ? `«${item.focus}»` : undefined].filter(Boolean).join(" — ");
  }
}
