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
 * Who operates the site, for the legal notice.
 *
 * Taken from the LICENSE, which already names the copyright holder — one
 * identity, not a second one invented for a footer. A legal notice that names
 * somebody the repository does not is the first thing a careful reader notices.
 */
export const OPERATOR = "Cato";

/**
 * A postal address, once there is one to give.
 *
 * EMPTY ON PURPOSE, and the page renders nothing rather than a placeholder.
 * Swiss law expects an address on a commercial site; Heidi sells nothing yet,
 * so the honest state is "not applicable, and said so" rather than a line that
 * looks filled in. Publishing a private home address is also a real exposure,
 * so this should be a c/o or a business address when it is filled in — not
 * wherever the operator happens to sleep.
 */
export const POSTAL_ADDRESS = "";

/** The source, which is the strongest thing this notice can point at. */
export const SOURCE_URL = "https://github.com/bitbaum/heidi";

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
