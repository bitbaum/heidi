
# Layout: the mistake this repo keeps making

Horizontal overflow has been reported from a phone three times, by a person,
after it was live: the chat transcript, `/portal`, and the header the day an
avatar was added to it. Every one of them passed review, passed the type
checker and passed every test. They are LAYOUT facts — real glyphs, real font,
real viewport — and reading the source finds none of them.

So before changing anything that affects layout, know these four:

1. **A grid track defaults to `auto`, whose automatic minimum is min-content.**
   One `truncate` line is `white-space: nowrap`, so its min-content is the
   whole sentence, and the column becomes as wide as it. Put `grid-cols-safe`
   (globals.css) on any grid whose base layout is one column.
2. **A flex item refuses to shrink below its content** unless it is told to.
   `min-w-0` on the item, or `wrap-anywhere` on a container of text nobody on
   this side wrote.
3. **`overflow-x: clip` on the body is a backstop, not a fix.** It turns a
   sideways-scrolling site into a clipped card. The card is still broken.
4. **An `absolute right-0` panel hangs from the nearest positioned ancestor.**
   That is correct only while its button is the last control in the row. Put
   the anchor on the row.

# The microphone is the same mistake, one floor down

"I don't think that the speaking part works, at least with regards to the
dialect" was answered with a question — what did you see? — when everything
needed to find out was already here. Chrome takes a fake microphone, the page
is three clicks, and the network tab says whether audio was sent.

A microphone fact needs a real `getUserMedia`, a real `MediaRecorder` and a
real upload, and reading the source finds none of them. The unit tests around
`useRecorder` all pass whether or not a single byte of audio ever leaves the
page.

```bash
pnpm run dev                                        # in another terminal
pnpm run audit:speaking                             # both varieties, both lengths
BASE=https://heidi.orangecat.ch pnpm run audit:speaking
AUDIO=~/zuerich.wav pnpm run audit:speaking         # for transcript QUALITY
```

It makes its own audio (ffmpeg, pink noise under a tremolo) because Chrome's
synthetic tone sits below this product's own `too-quiet` floor — measure with
that and every take reads as unusable, and the harness blames the page for its
own microphone. It found one real defect on its first run: a 1.5-second take,
which the product itself calls too short to say anything about, was sent to the
transcriber and came back as «Bis zum nächsten Mal.» — four words nobody said.

And run the check, which is the only thing here that actually finds them:

```bash
pnpm run dev                                        # in another terminal
pnpm run audit:responsive                           # every page, 3 languages
LOCALES=de,fr,ru WIDTHS=320 pnpm run audit:responsive   # narrow it down
```

It measures elements rather than the document (the backstop hides the document
symptom), and it OPENS the header's dropdowns, because measuring a page at
rest is what let the fourth one through. CI runs it against the built site on
every pull request.

<!-- BEGIN:nextjs-agent-rules -->

# The product fits the person

This site loads Loki's feedback widget (`app/[locale]/layout.tsx`). Whatever a visitor
dislikes, they point at it and choose **Change it for me** or **Show me how to
get there**. Loki then builds that experience, or shows the path and makes it
findable for the next person. Tailoring every product to the person using it is
the direction for the whole fleet. It is defined once, together with what has and
hasn't shipped, in bitbaum/loki `docs/architecture/tailored-experience.md`, so
do not restate it here.

To make a surface changeable in place, put `data-loki-target` and an
`aria-label` on it and call `window.Loki?.report({ target })` from a control
inside it. That control must be a real link to the feedback page, taken over
only when `window.Loki.ready` is true, so it is never a button that does
nothing.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
