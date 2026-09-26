# Exercise templates

A new question is a record, not a feature. The full contract is the header of
`template.ts`; this is the short version.

| Kind        | File                    | The learner sees                       | Options          |
| ----------- | ----------------------- | -------------------------------------- | ---------------- |
| `reply`     | `authored/reply.ts`     | a heard line                           | 4 Zurich replies |
| `gist`      | `authored/gist.ts`      | a heard line                           | 4 German readings |
| `transform` | `authored/transform.ts` | a German sentence                      | 4 Zurich sentences, each meaning something else |
| `clock`     | `authored/clock.ts`     | a time or price said in Zurich German  | 4 numbers        |
| `meaning`   | generated (`kinds/question.ts`) | a word in its sentence         | 4 glosses, the false friend's trap among them |

## Adding a question

1. Append a record to the kind's file. Point at existing lines where you can —
   `{ scene: "tram", line: 4 }` or `{ topic: "wo-relative", example: 1 }` —
   they are already gated, sourced and translated. Write a new sentence only as
   `{ target, bridge, cite }`.
2. Choose a `lesson` from `LESSON_IDS` in `../types.ts`. A new lesson is a new
   id there and one sentence in `practice.lessons` in all seven dictionaries;
   the type checker lists the ones you missed.
3. Add `listen: { word, means }` — the Zurich word the answer turns on. It must
   occur in the question.
4. Run `pnpm run verify`. `templates.test.ts` resolves every record against the
   live packs and fails on a dangling reference, a string the gate rejects, an
   unknown citation, duplicate options, a wrong option whose German equals the
   answer's, a `listen` word not in the question, or a reused id.

**Wrong answers must be wrong on content, never on nuance.** A different time,
person, tense or thing asked is markable; "less polite" is not. Nuance goes in
the lesson.

Ids are permanent: `<kind>:<id>` keys the learner's history in their browser.
