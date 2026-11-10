/**
 * True when a request SAYS its body is larger than `max` (plus room for the
 * multipart envelope), so the route can refuse before `formData()` reads all
 * of it into memory. Both transcription routes take uploads from signed-out
 * visitors; the size check after parsing came after the memory was spent.
 * A request without a length is not refused here: the check after parsing
 * still applies to it.
 */
export function declaresTooLarge(request: Request, max: number, envelope = 64 * 1024): boolean {
  const declared = Number(request.headers.get("content-length"));
  return Number.isFinite(declared) && declared > max + envelope;
}
