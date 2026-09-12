/** The one place the deployed origin is written down. */
export const SITE_URL = "https://heidi.orangecat.ch";

/**
 * Where people who want to lend their voice write to.
 *
 * The fleet convention is `<app>@fleetcrown.orangecat.ch` — the shared verified
 * sender domain. Written here rather than in each locale's dictionary: an
 * address is not a translation, and five copies of it would drift.
 */
export const CONTACT_EMAIL = "heidi@fleetcrown.orangecat.ch";

/**
 * What the assistant is called — the brand, not the language.
 *
 * Deliberately here and not in the variety pack: the pack describes what is
 * being taught, and a Lesya deployment would swap the pack while keeping a
 * name of its own. It is also not in the dictionaries, because a name is not
 * a translation and six copies of it would drift.
 *
 * Load-bearing in one specific place: in a group thread the assistant only
 * speaks when addressed, and people address it by this name.
 */
export const ASSISTANT_NAME = "Heidi";
