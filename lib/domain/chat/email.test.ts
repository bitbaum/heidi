import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { describeMessage, looksLikeMessage, parseMessage, splitQuoted } from "./email.ts";

/**
 * The cases here are the shapes a message in Switzerland actually arrives in,
 * not the shapes an RFC describes. A Swiss company's Outlook writes German
 * headers to a reader whose own browser is in English; Gmail writes its own
 * banner; a WhatsApp forward has no envelope at all.
 */

const OUTLOOK_DE = `Von: Hausverwaltung Meier AG <verwaltung@meier-immo.ch>
Gesendet: Montag, 3. März 2025 14:22
An: anna@example.com
Betreff: Heizungsablesung Wohnung 4B

Guten Tag

Am 12. März kommt der Ableser zwischen 08:00 und 12:00 Uhr. Bitte bestätigen
Sie uns diesen Termin bis am Freitag.

Freundliche Grüsse
M. Meier`;

const GMAIL_REPLY = `Hoi Anna

Passt mir gut, bis Samschtig!

On 3 March 2025, Anna Meier wrote:
> Chunnsch du am Samschtig?
> Mir sind ab 14i deheim.`;

describe("parseMessage", () => {
  test("reads a German Outlook envelope", () => {
    const parsed = parseMessage(OUTLOOK_DE);
    assert.ok(parsed, "should parse");
    assert.equal(parsed.kind, "headers");
    assert.equal(parsed.from, "Hausverwaltung Meier AG <verwaltung@meier-immo.ch>");
    assert.equal(parsed.subject, "Heizungsablesung Wohnung 4B");
    assert.equal(parsed.date, "Montag, 3. März 2025 14:22");
    assert.equal(parsed.to, "anna@example.com");
    // The body is what is left — and critically NOT the headers.
    assert.match(parsed.body, /^Guten Tag/);
    assert.match(parsed.body, /Ableser/);
    assert.doesNotMatch(parsed.body, /Betreff|Gesendet/);
  });

  test("reads French and Italian envelopes too", () => {
    const fr = parseMessage("De : Service client\nObjet : Votre facture\n\nBonjour, veuillez payer.");
    assert.ok(fr);
    assert.equal(fr.from, "Service client");
    assert.equal(fr.subject, "Votre facture");

    const it = parseMessage("Da: Assicurazione\nOggetto: Polizza\n\nBuongiorno.");
    assert.ok(it);
    assert.equal(it.from, "Assicurazione");
    assert.equal(it.subject, "Polizza");
  });

  test("keeps the OUTER envelope of a forwarded chain", () => {
    // The reader was sent the outer one. The inner headers belong to history,
    // and answering the inner sender is the specific mistake this prevents.
    const forwarded = `Von: Anna <anna@example.ch>
Betreff: Fwd: Termin

Schau mal.

---------- Forwarded message ---------
Von: Hausverwaltung <hv@example.ch>
Betreff: Termin`;
    const parsed = parseMessage(forwarded);
    assert.ok(parsed);
    assert.equal(parsed.from, "Anna <anna@example.ch>");
    assert.equal(parsed.body, "Schau mal.");
    assert.match(parsed.quoted ?? "", /Forwarded message/);
  });

  test("a chat message with a quoted reply has no envelope but still splits", () => {
    const parsed = parseMessage(GMAIL_REPLY);
    assert.ok(parsed);
    assert.equal(parsed.kind, "chain");
    assert.match(parsed.body, /Passt mir gut/);
    assert.doesNotMatch(parsed.body, /Chunnsch du/);
    assert.match(parsed.quoted ?? "", /Chunnsch du am Samschtig/);
  });

  test("ordinary pasted dialect is NOT a message", () => {
    // The other half of this product's input. Finding structure here would
    // mangle it — and would tell the model a sender exists when none does.
    assert.equal(parseMessage("Im Kauz scho, hät mer nöd so gfalle. Du au?"), null);
    assert.equal(parseMessage("Chunnsch du am Samschtig scho öppis vor?"), null);
    assert.equal(looksLikeMessage("Sag ihnen, dass ich später komme."), false);
  });

  test("one header line alone is not an envelope", () => {
    // How people write a subject at the top of a note to themselves. Treating
    // it as email would invent a sender.
    assert.equal(parseMessage("Betreff: Einkaufen\n\nMilch, Brot"), null);
  });

  test("empty and whitespace input yield nothing", () => {
    assert.equal(parseMessage(""), null);
    assert.equal(parseMessage("   \n  \n"), null);
  });

  test("a colon in ordinary prose is not read as a header", () => {
    // `Aber:` is a word, not a field. Two of these would otherwise look like
    // an envelope.
    assert.equal(parseMessage("Aber: das ist gut.\nUnd: so weiter."), null);
  });
});

describe("splitQuoted", () => {
  test("splits on the > convention", () => {
    const { body, quoted } = splitQuoted("Ja gern.\n\n> Chunnsch?");
    assert.equal(body, "Ja gern.");
    assert.equal(quoted, "> Chunnsch?");
  });

  test("a paste that is ENTIRELY quoted stays whole", () => {
    // Forwarded with no comment: the chain IS the message, and setting it all
    // aside would leave nothing to answer.
    const all = "> Chunnsch du?\n> Mir sind deheim.";
    const { body, quoted } = splitQuoted(all);
    assert.equal(body, all);
    assert.equal(quoted, undefined);
  });

  test("text with no chain is returned unchanged", () => {
    const { body, quoted } = splitQuoted("Nur ein Satz.");
    assert.equal(body, "Nur ein Satz.");
    assert.equal(quoted, undefined);
  });
});

describe("describeMessage", () => {
  test("labels the fields and names the ask", () => {
    const parsed = parseMessage(OUTLOOK_DE);
    assert.ok(parsed);
    const described = describeMessage(parsed);

    assert.match(described, /from: Hausverwaltung Meier AG/);
    assert.match(described, /subject: Heizungsablesung/);
    // The instruction that stops four glosses being spent on the envelope.
    assert.match(described, /Never gloss a header/);
    // And the one that makes the reply offer happen.
    assert.match(described, /reply/);
  });

  test("names the quoted chain without including it", () => {
    const parsed = parseMessage(GMAIL_REPLY);
    assert.ok(parsed);
    const described = describeMessage(parsed);
    assert.match(described, /left out/);
    assert.doesNotMatch(described, /Chunnsch du am Samschtig/);
  });

  test("a very long message is capped", () => {
    const long = `Von: X\nBetreff: Y\n\n${"a".repeat(9000)}`;
    const parsed = parseMessage(long);
    assert.ok(parsed);
    const described = describeMessage(parsed);
    // A 40KB circular must not become 40KB of prompt.
    assert.ok(described.length < 6000, `expected a capped description, got ${described.length}`);
    assert.match(described, /…/);
  });
});
