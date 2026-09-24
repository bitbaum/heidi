/** The one place the deployed origin is written down. */
export const SITE_URL = "https://heidi.orangecat.ch";

/**
 * Where people write to — and it has to be an address that RECEIVES.
 *
 * THIS WAS `heidi@fleetcrown.orangecat.ch` AND IT WAS A BLACK HOLE.
 * `fleetcrown.orangecat.ch` is the fleet's verified SENDER domain: it has no
 * MX record at all, so nothing addressed to it is ever delivered. Check it
 * yourself — `dig MX fleetcrown.orangecat.ch` returns nothing, while
 * `dig MX orangecat.ch` returns Infomaniak.
 *
 * That address was published on the legal notice, the privacy page, the
 * contribute page and the data room. Every privacy request, every legal
 * enquiry and every offer to record a voice bounced silently, for months, on
 * the four pages where being reachable is the entire point.
 *
 * The apex is the only domain here that accepts mail, so the address is on
 * the apex. `site.test.ts` holds it there.
 *
 * Written here rather than in each locale's dictionary: an address is not a
 * translation, and five copies of it would drift — which is separately what
 * happened, `organisations` and `roles` having each written a different one
 * out by hand.
 */
export const CONTACT_EMAIL = "cato@orangecat.ch";

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
