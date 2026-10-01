import type { SectorLocale } from "./sectors.ts";
import { CONTACT_EMAIL } from "./site.ts";

/**
 * The ways a person can be part of Heidi other than by learning from it.
 *
 * THE DIAGNOSIS THIS ANSWERS: "study groups is useless and not developed;
 * tutors are not incorporated at all; no one can register as a tutor or study
 * partner; the social aspect lacks entirely."
 *
 * Half of that is a build problem and half is a page problem, and it is worth
 * separating them because the fix is different. The INFRASTRUCTURE is further
 * along than the site admits: there are study groups with invite links and a
 * social rule about when the assistant speaks, and there are speaking rounds
 * with topics, interest and attendance, in the database, today. What has never
 * existed is a ROLE other than "learner" — no way to say "I am from Zurich and
 * I will read your lines", and nowhere that explains what any of it is for.
 *
 * WHY THIS IS NOT A TUTOR MARKETPLACE, and the distinction is the whole design.
 * A generic directory of paid tutors is a crowded business that Heidi has no
 * advantage in and no users for. What Heidi uniquely has is a QUALITY PROBLEM
 * that only a Zurich ear can solve — lines that pass every rule and still
 * sound wrong — and that makes the learner ↔ native relationship the one worth building around,
 * because it pays twice:
 *
 *   the learner gets the thing no software provides — somebody who actually
 *     speaks it
 *   the product gets the thing it cannot buy — verification, with a name on
 *     it (`Provenance.by` has been waiting for this since the packs were
 *     written)
 *
 * SO THE ROLES ARE ORDERED BY COMMITMENT, smallest first, and the smallest one
 * is the most valuable to us: pointing at one wrong line. That is a better first ask than "become a tutor", and a person
 * who does it once is the person who later does the next thing.
 *
 * WHAT EACH ROW MUST SAY. `today` is the honest state of that role in the
 * product right now — built, partly built, or not built. A register that
 * described four thriving communities would be the exact lie this repo spends
 * `FORBIDDEN_CLAIMS` preventing on the sector page, and it would be found out
 * in one click by anybody who joined.
 */

export type RoleId = "read" | "record" | "talk" | "teach";

export type Copy = { de: string; en: string };

export type Role = {
  id: RoleId;
  name: Copy;
  /** Who this is for, in one line. The filter, before the pitch. */
  who: Copy;
  /** What they would actually do. Concrete, and small where it is small. */
  ask: Copy;
  /** Why it matters — to the learner, to us, or both. */
  why: Copy;
  /**
   * What exists in the product for this role TODAY.
   *
   * The field that keeps the page honest: what is built, said as built, and
   * what is not, said as not. That is what separates a register from a
   * promise.
   */
  today: Copy;
  /** Where to go and see it, when there is somewhere. A route segment. */
  segment?: string;
};

export const ROLES: readonly Role[] = [
  {
    id: "read",
    name: { de: "Zeilen gegenlesen", en: "Read our lines" },
    who: {
      de: "Sie sind in Zürich oder Umgebung aufgewachsen. Zwanzig Minuten, einmalig oder gelegentlich.",
      en: "You grew up in or around Zurich. Twenty minutes, once or now and then.",
    },
    ask: {
      de: "Sie lesen Sätze, die wir geschrieben haben, und sagen bei jedem: sagt man das so, sagt man das anders, oder sagt das niemand.",
      en: "You read sentences we wrote and say, for each one: that is how it is said, that is not, or nobody says that at all.",
    },
    why: {
      de: "Alle 390 Sätze aus Alltag und Pflege sind maschinell auf Zürcher Formen geprüft. Ein Ohr von hier hört, was keine Regel hört: einen Satz, der stimmt und den trotzdem niemand so sagt. Und das sind Sätze, die jemand um halb sieben morgens zu einer verängstigten Person sagt.",
      en: "All 390 lines from everyday and care scenes are machine-checked for Zurich forms. An ear from here hears what no rule can: a sentence that is correct and that still nobody says. And these are sentences somebody says to a frightened person at half past six in the morning.",
    },
    today: {
      de: "Jede Situation ist offen zum Lesen. Zeigen Sie über das Rückmelde-Fenster auf den Satz, der nicht stimmt.",
      en: "Every situation is open to read. Point at the line that is wrong through the feedback window on the page.",
    },
    segment: "situations",
  },
  {
    id: "record",
    name: { de: "Ihre Stimme aufnehmen", en: "Record your voice" },
    who: {
      de: "Zürcher Mundart als Erstsprache, jedes Alter, jede Ecke des Kantons.",
      en: "Zurich dialect as a first language — any age, any corner of the canton.",
    },
    ask: {
      de: "Ein paar Minuten sprechen, zu Themen, die wir vorgeben, mit einer Einwilligung, die Sie lesen können, bevor Sie zusagen.",
      en: "A few minutes of speech on topics we suggest, with a consent form you read before you agree to anything.",
    },
    why: {
      de: "Training mit vielen verschiedenen Sprechenden ist die am besten belegte Hörmethode, die es gibt — und sie lässt sich nicht aus einer hochdeutschen Computerstimme bauen, die Mundart vorliest. Darauf baut das Hörlabor.",
      en: "Training on many different speakers is the best-evidenced listening method there is — and it cannot be built out of a Standard German computer voice reading dialect. The listening lab is built on exactly this.",
    },
    today: {
      de: "Wie die Einwilligung aussieht, steht weiter unten auf dieser Seite. Die ersten Stimmen kommen ins Hörlabor.",
      en: "What the consent looks like is further down this page. The first voices go into the listening lab.",
    },
    segment: "listen",
  },
  {
    id: "talk",
    name: { de: "Sprechpartnerin sein", en: "Be a speaking partner" },
    who: {
      de: "Sie sprechen Mundart und haben gelegentlich eine halbe Stunde.",
      en: "You speak dialect and have half an hour now and then.",
    },
    ask: {
      de: "An einer Sprechrunde teilnehmen: eine kleine Gruppe, ein Thema, ein Termin. Sie sprechen einfach, wie Sie sprechen.",
      en: "Join a speaking round: a small group, a topic, a time. You simply talk the way you talk.",
    },
    why: {
      de: "Die Sprechübung in Heidi endet absichtlich nicht mit einer Note, sondern in einem Raum mit anderen Leuten — weil dort eine Sprache gesprochen wird. Eine Punktzahl ist das, was ein Produkt stattdessen anbietet.",
      en: "The speaking loop in Heidi deliberately ends not in a score but in a room with other people — because that is where a language is spoken. A score is what a product offers instead of that.",
    },
    today: {
      de: "Gebaut: Runden, Themen, Anmeldungen und Anwesenheit. Eröffnen Sie eine Runde oder tragen Sie sich ein.",
      en: "Built: rounds, topics, sign-ups and attendance. Open a round or sign up for one.",
    },
    segment: "speaking",
  },
  {
    id: "teach",
    name: { de: "Unterrichten", en: "Teach" },
    who: {
      de: "Sie unterrichten Deutsch oder Mundart, freiberuflich oder an einer Sprachschule.",
      en: "You teach German or dialect, freelance or at a language school.",
    },
    ask: {
      de: "Sagen Sie uns, was Sie anbieten und was Ihre Lernenden hier brauchen würden. Wir bauen keinen Marktplatz gegen Sie, sondern das Material darunter.",
      en: "Tell us what you offer and what your learners would need here. We are not building a marketplace against you — we are building the material underneath.",
    },
    why: {
      de: "Eine Sprachschule hat Menschen im Raum und weiss, woran Lernende wirklich scheitern. Heidi hat geprüftes Mundartmaterial und die Übungen, die daraus entstehen. Das passt zusammen.",
      en: "A language school has people in a room and knows where learners actually fail. Heidi has checked dialect material and the exercises generated from it. The two fit together.",
    },
    today: {
      de: "Noch keine Tutorenprofile und keine Vermittlung. Was es gibt, ist ein Gespräch.",
      en: "No tutor profiles or matching yet. What there is, is a conversation.",
    },
  },
];

/**
 * What a learner can ask the register for.
 *
 * Deliberately short and deliberately last on the page. The register is thin
 * today, and a learner-facing promise of "find a partner" would be the fake
 * marketplace this file's header rejects — so this says what is true: the
 * groups and rounds are open, and the rest depends on who joins.
 */
export const LEARNER_NOTE: Copy = {
  de: "Als Lernende können Sie heute schon eine Gruppe aufmachen und einen Link weitergeben, und Sie können sich für eine Sprechrunde eintragen. Beides funktioniert ab null Mitgliedern — es wird nur besser, wenn oben jemand zusagt.",
  en: "As a learner you can already open a group and pass on a link, and you can sign up for a speaking round. Both work from zero members — they only get better when somebody above says yes.",
};

export function roleMailto(role: Role, lang: SectorLocale): string {
  const subject = `Heidi — ${role.name[lang]}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
