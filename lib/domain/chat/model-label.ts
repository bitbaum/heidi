/**
 * The model that answered, as a person reads it.
 *
 * The footer names the model on purpose — an answer with no model attached is
 * a rumour — but it printed the route id as the vendor spells it,
 * «google/models/gemini-flash-latest», which is a path, not a name. The id is
 * still what is stored with the answer; this is only how it is shown.
 */
export function modelLabel(id: string): string {
  const last = id.trim().split("/").filter(Boolean).pop() ?? "";
  const words = last
    .replace(/[:@].*$/, "")
    .replace(/-(preview|exp|experimental)\b.*$/i, "")
    .split(/[-_]/)
    .filter((w) => w && !/^(latest|preview|exp|experimental|instruct|versatile|it|chat)$/i.test(w) && !/^\d{4,}$/.test(w));
  if (words.length === 0) return id;
  return words
    .map((w) => (/^\d+(\.\d+)?[bkm]$/i.test(w) ? w.toUpperCase() : /^\d/.test(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}
