/**
 * Pictures — almost always a screenshot of a chat.
 *
 * That is the highest-value thing someone can hand this product: the WhatsApp
 * message they cannot read is the actual problem, and retyping dialect they
 * cannot spell in order to ask about it is a barrier we put there ourselves.
 *
 * Two rules, both about respect for someone else's money:
 *
 *  1. Downscale in the BROWSER, before it is ever uploaded. A modern phone
 *     screenshot is several megabytes and 1290px wide; vision models bill by
 *     image tile, so sending the original costs the person real money for
 *     detail no model needs to read a chat bubble. 1024px is plenty.
 *  2. Validate on the SERVER anyway. The browser is not a security boundary,
 *     and "the client already checked" is how an unbounded body gets accepted.
 */

/** Longest edge after downscaling. Above this, vision models gain nothing. */
export const MAX_EDGE = 1024;

/** A generous ceiling for a downscaled JPEG; anything larger is not a screenshot. */
export const MAX_BYTES = 1_500_000;

export const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

export type ImageCheck = { ok: true; dataUrl: string } | { ok: false; reason: string };

/**
 * Validate a data URL that claims to be an image.
 *
 * Deliberately strict about the prefix: a `data:text/html` URL forwarded to a
 * vendor is not dangerous to us, but accepting anything shaped like a string
 * means we have no idea what we are paying to send.
 */
export function readImage(raw: unknown): ImageCheck {
  if (typeof raw !== "string" || !raw) return { ok: false, reason: "not a string" };

  const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(raw);
  if (!match) return { ok: false, reason: "not a base64 data URL" };

  const [, mime, payload] = match;
  if (!(ACCEPTED as readonly string[]).includes(mime.toLowerCase())) {
    return { ok: false, reason: `unsupported type ${mime}` };
  }

  // base64 is 4 characters per 3 bytes; close enough to reject the outrageous
  // without decoding the whole thing first.
  const bytes = Math.floor((payload.length * 3) / 4);
  if (bytes > MAX_BYTES) return { ok: false, reason: "image is too large" };

  return { ok: true, dataUrl: raw };
}

/**
 * One message in the shape a vision model expects.
 *
 * ai-kit forwards `messages` into the request body untouched, so this already
 * works at runtime — but its `ChatMessage.content` is typed `string`, narrower
 * than what it actually carries. Widening that type is a small change to the
 * fleet's AI layer and the right home for it; until it is published, this is
 * the one place the gap is crossed, named so it can be deleted in one edit
 * rather than hunted for.
 */
export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export function visionMessage(text: string, images: string[]): ContentPart[] {
  return [
    { type: "text", text },
    ...images.map((url) => ({ type: "image_url" as const, image_url: { url } })),
  ];
}
