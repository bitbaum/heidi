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
 * that only a Zurich native can solve — a hundred and forty lines nobody from
 * here has read, which is the first blocked item on the roadmap — and that
 * makes the learner ↔ native relationship the one worth building around,
 * because it pays twice:
 *
 *   the learner gets the thing no software provides — somebody who actually
 *     speaks it
 *   the product gets the thing it cannot buy — verification, with a name on
 *     it (`Provenance.by` has been waiting for this since the packs were
 *     written)
 *
 * SO THE ROLES ARE ORDERED BY COMMITMENT, smallest first, and the smallest one
 * is the most valuable to us. Reading twenty lines over coffee unblocks a
 * roadmap item. That is a better first ask than "become a tutor", and a person
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
   * The field that keeps the page honest. Two of these are "the machinery is
   * there and empty", one is "not built", and saying so is what separates a
   * register from a promise.
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
      de: "Hundertvierzig Zeilen aus Pflege- und Alltagssituationen haben die maschinelle Prüfung bestanden und noch niemand von hier hat sie gelesen. Die Seiten schreiben das selbst hin. Es sind Sätze, die jemand um halb sieben morgens zu einer verängstigten Person sagt — die wollen wir nicht erraten haben.",
      en: "A hundred and forty lines from care and everyday scenes passed the machine check and nobody from here has read them. The pages say so themselves. These are sentences somebody says to a frightened person at half past six in the morning — we would rather not have guessed them.",
    },
    today: {
      de: "Das ist die erste blockierte Sache auf unserem Fahrplan. Wer gegenliest, wird auf der Seite genannt, die er geprüft hat — wenn er das möchte.",
      en: "This is the first blocked item on our roadmap. Whoever reviews a set is named on the page they checked — if they want to be.",
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
      de: "Training mit vielen verschiedenen Sprechenden ist die am besten belegte Hörmethode, die es gibt — und sie lässt sich nicht aus einer hochdeutschen Computerstimme bauen, die Mundart vorliest. Genau daran hängt das Hörlabor.",
      en: "Training on many different speakers is the best-evidenced listening method there is — and it cannot be built out of a Standard German computer voice reading dialect. This is exactly what the listening lab is blocked on.",
    },
    today: {
      de: "Noch keine Aufnahmen. Die Einwilligung und der Ablauf stehen; es fehlen Stimmen.",
      en: "No recordings yet. The consent and the process exist; what is missing is voices.",
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
      de: "Gebaut und leer: Runden, Themen, Anmeldungen und Anwesenheit gibt es. Was fehlt, sind Leute — angefangen bei Ihnen.",
      en: "Built and empty: rounds, topics, sign-ups and attendance all exist. What is missing is people — starting with you.",
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
      de: "Eine Sprachschule hat das, was uns fehlt: Menschen im Raum und eine Vorstellung davon, woran Lernende wirklich scheitern. Wir haben, was einer Schule fehlt: geprüftes Mundartmaterial und Übungen, die daraus entstehen.",
      en: "A language school has what we lack: people in a room, and a real sense of where learners actually fail. We have what a school lacks: checked dialect material and exercises generated from it.",
    },
    today: {
      de: "Nicht gebaut. Es gibt keine Tutorenprofile, keine Vermittlung und keine Bezahlung — und wir behaupten auch nichts anderes. Was es gibt, ist ein Gespräch.",
      en: "Not built. There are no tutor profiles, no matching and no payments — and we are not pretending otherwise. What there is, is a conversation.",
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
