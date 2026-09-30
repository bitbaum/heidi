/**
 * The warm-up's questions, from gentle to between-the-lines.
 *
 * Every one is an existing "What is meant?" question (`templates/authored/
 * gist.ts`): a real line from an everyday scene and four German readings that
 * differ in MEANING. Nothing new is claimed here; this file only says which
 * of them to ask first.
 *
 * THE ORDER IS EDITORIAL, NOT MEASURED. Nobody has timed learners on these
 * lines, so the tiers are a judgement about what a newcomer meets first and
 * what trips people who already follow the words:
 *
 *   0  concrete, first-week lines — the till, the tram, the neighbour
 *   1  small words and tempo — `lüüt aa`, `pressant`, `uusbuecht`
 *   2  between the lines — the polite Zurich no, an invitation that sounds
 *      like a remark, a reproach that sounds like a report: every word is
 *      clear and the meaning is not
 *
 * Care lines are left out on purpose: the warm-up is for anybody who arrives,
 * and a handover sentence tells a newcomer nothing about where they stand in
 * the city. `ladder.test.ts` holds every id to a question that exists.
 */
export const OPENER = "gist:verstahsch";

export const LADDER: readonly (readonly string[])[] = [
  [
    "gist:dorf-no-oppis",
    "gist:scho-dra",
    "gist:abhocke",
    "gist:ufrucke",
    "gist:znacht",
    "gist:luuted-eifach",
    "gist:mini-maschine",
  ],
  [
    "gist:lut-aa",
    "gist:blibed-dra",
    "gist:umleitig",
    "gist:nachtrueh",
    "gist:ame",
    "gist:pressant",
    "gist:uusbuecht",
    "gist:versichertecharte",
    "gist:luus",
    "gist:redet-mer",
  ],
  [
    "gist:indirect-no-look",
    "gist:indirect-no-then",
    "gist:indirect-no-another-time",
    "gist:indirect-no-depends",
    "gist:no-rush",
    "gist:gommer-kafi",
    "gist:uber-d-ziit",
    "gist:liisliger",
  ],
];

/** The opener counts as the gentlest tier. */
export function tierOf(id: string): number {
  if (id === OPENER) return 0;
  const tier = LADDER.findIndex((ids) => ids.includes(id));
  return tier === -1 ? 0 : tier;
}
