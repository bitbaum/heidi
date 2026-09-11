import type { Metadata } from "next";
import Link from "next/link";
import { LANDING } from "@/lib/config/landing";

export const metadata: Metadata = { title: "Try" };

export default function TryPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-shell flex-col px-5 sm:px-8">
      <header className="flex items-baseline justify-between border-b border-border-subtle py-5">
        <Link href="/" className="font-heading text-2xl font-semibold tracking-display text-fg-primary">
          {LANDING.brand}
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{LANDING.eyebrow}</span>
      </header>
      <main className="flex flex-1 flex-col justify-center py-16">
        <p className="font-mono text-[11px] uppercase tracking-caps text-accent">Coming shortly</p>
        <h1 className="mt-3 max-w-[22ch] font-heading text-3xl font-semibold leading-tight tracking-display text-fg-primary sm:text-5xl">
          The sixty-second ear-change.
        </h1>
        <p className="mt-5 max-w-measure text-lg leading-relaxed text-fg-secondary">
          Hear a Zurich speaker and catch almost nothing. Tune in for twenty seconds with the text. Then hear a{" "}
          <em>different</em> speaker, and we measure what changed. The second speaker is the whole point: adapting to one
          voice is easy and proves nothing, so the test is always someone you have not heard.
        </p>
        <p className="mt-4 max-w-measure text-base leading-relaxed text-fg-muted">
          What a minute can honestly do is speed up how fast you process the sound — that effect is real and replicated.
          Understanding more words takes longer than a minute, and Heidi will show you that number too, rather than
          claiming it now.
        </p>
        <Link href="/" className="mt-9 inline-flex min-h-11 w-fit items-center text-link underline underline-offset-4 hover:text-accent">
          Back to the start
        </Link>
      </main>
    </div>
  );
}
