"use client";

import { ACCEPTED, MAX_EDGE, MAX_BYTES } from "@/lib/domain/chat/image";

/**
 * Shrink a picture in the browser, before it is ever uploaded.
 *
 * This is not a performance nicety, it is the difference between a feature
 * being cheap and being rude. Vision models bill by image tile, and the person
 * paying is the one who brought the key. A modern phone screenshot is around
 * 1290×2796 and several megabytes; nothing a model needs to read a chat bubble
 * survives above ~1024px on the long edge, so sending the original charges
 * them for detail that is discarded.
 *
 * It also means the raw screenshot — which may show far more of someone's
 * phone than the message they asked about — is never transmitted at full
 * fidelity in the first place.
 */

export type Prepared = { dataUrl: string; width: number; height: number };

export async function downscale(file: File): Promise<Prepared> {
  if (!(ACCEPTED as readonly string[]).includes(file.type)) {
    throw new Error(`unsupported type ${file.type || "unknown"}`);
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    ctx.drawImage(bitmap, 0, 0, width, height);

    // JPEG, not PNG: a screenshot re-encoded as PNG is often LARGER than the
    // original, which would defeat the entire point of this function.
    let quality = 0.82;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    // Step down rather than fail — a dense screenshot can still be big at 1024px.
    while (dataUrl.length * 0.75 > MAX_BYTES && quality > 0.4) {
      quality -= 0.15;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    if (dataUrl.length * 0.75 > MAX_BYTES) throw new Error("image is too large");

    return { dataUrl, width, height };
  } finally {
    bitmap.close();
  }
}

/** Pull images out of a paste — how a screenshot actually arrives. */
export function imagesFromClipboard(data: DataTransfer | null): File[] {
  if (!data) return [];
  return Array.from(data.files).filter((f) => (ACCEPTED as readonly string[]).includes(f.type));
}
