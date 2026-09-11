import type { Finding } from "@/lib/variety/check";

/** Renders `text` with each finding's span wrapped in a highlighted <mark>. */
export function HighlightedText({ text, findings }: { text: string; findings: Finding[] }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  findings.forEach((f, i) => {
    const start = f.index;
    const end = f.index + f.form.length;
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
