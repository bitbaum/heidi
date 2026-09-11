import type { PurityViolation } from "@/lib/domain/dialect/purity";

/** Renders `text` with each violation's span wrapped in a highlighted <mark>. */
export function HighlightedText({ text, violations }: { text: string; violations: PurityViolation[] }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  violations.forEach((v, i) => {
    const start = v.index;
    const end = v.index + v.form.length;
    if (start < cursor) return; // skip overlaps with an already-rendered span

    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={i} className="rounded-sm bg-accent-tint px-0.5 font-medium text-dialect">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });

  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}
