
# Merge → live

<!-- fleet:rules:begin — generated from bitbaum/fleet templates/agent-rules.md; edit it there, not here -->

## Org rules

Read `bitbaum/fleet` `AGENTS.md`, `SHARED.md` and the registers it names before
inventing a host, a name, a page or a shared behaviour. Do not copy their facts
into this file.

- **Packages first.** If a `@bitbaum/*` package (or `bip-kit`, `limitkit`,
  `threadkit`, `ai-forms`) already does it, use it and fix a defect in the
  package, not in this app. Every chat is `@bitbaum/chatkit`, every search box
  `@bitbaum/searchkit`, every chart `@bitbaum/chartkit`, accounts
  `@bitbaum/accountkit`, model calls `@bitbaum/ai-kit`. Review this product's
  `package-plan.json` before building anything. When a second product needs
  what one product built (a map, a globe, a calculator), extract it into a
  package before writing the second copy.
- **A gap is a task, not an answer.** Never end the work, or a reply, at "not
  supported" or "not available". When a source cannot be read or a case does
  not fit the model, find another way (another format or publisher, the
  official tool measured, the model extended) and do it. What truly cannot be
  done yet is tracked with its plan, never presented as a limit of the product.
- **Every page leads to an action.** What a reader learns, they can act on
  from the same screen: file, pay, apply, compare, ask, contact.
- **One shape per kind.** Things of the same kind look the same and sit in the
  same place (fleet `AGENTS.md`, "One shape per kind").
- **Finished work ships by itself.** Open a non-draft pull request; the fleet
  auto-merge sweep is the only merge path. Never merge by hand, through the
  merge API, with `--auto` or with an admin bypass, and never force-push a
  shared branch.
- **Nothing made up.** A fact on a page or in a doc needs a source that was
  opened; where there is none, the line is removed or softened. A gap is
  filled with sourced data, never with a guess.
- **Bitcoin orange is for Bitcoin and top-of-funnel actions only.**
- **No model identifier** in anything pushed to a repository.
- Before you finish, run `node <fleet>/scripts/ci/docs-truth-audit.mjs --dir .`:
  the same check the sweep runs on every pull request.

<!-- fleet:rules:end -->

One full proof per change, on the pull request. `.github/workflows/ci.yml` runs
`pnpm run verify`, the build and the layout and overlay audits there. A squash
merge onto main (subject ends in `(#N)`) gets the fast gate: `pnpm run verify:main`
— type-check, lint, file-input check — and then `.github/workflows/deploy.yml` ships it, which
builds on the box. Target: green main in about three minutes, live a few after.
A main push without `(#N)` still runs everything.

Re-running the full verify and the audits on main for a PR merge is a regression,
not a safety net: it repeats the pull request's proof and doubles merge → live.
Main runs are grouped per commit, so two merges never queue behind each other.

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

It also lays out every word and fails on one drawn across two lines
(`findBrokenWords` from `@bitbaum/chatkit/audit`): nothing overflows, nothing
is clipped, and «Schwiizerdütsch» still read «Schwiizerd / ütsch» in the
footer on every page, because `wrap-anywhere` makes a box willing to cut a word
whenever a narrower one would fit. Reserve `wrap-anywhere` for text nobody on
this side wrote; a known word gets a column wide enough for it.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
