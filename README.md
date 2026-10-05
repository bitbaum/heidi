# Heidi

Helps adults who already speak German understand the Zurich German actually
spoken around them. Live at [heidi.orangecat.ch](https://heidi.orangecat.ch).
The product is
defined in [HEIDI.md](HEIDI.md); how to work in the repo is in
[AGENTS.md](AGENTS.md).

## Development

```bash
pnpm install
pnpm run dev       # http://localhost:3000
pnpm run verify    # type-check + lint + tests
```

## Take it

Bitbaum is a platform for the new economy and for creation: building,
engineering and researching. It's a community of builders, creators and
researchers, and of the people who support them. We work as engineers in the
loop: agents do much of the typing, and people own the judgement.

This code is MIT-licensed so that you can take it. Use it, fork it, rebrand it,
sell it, or lift a single file. Make it yours and keep improving it the way you
like. You don't need to ask, book a call or sign a CLA. Just keep the
[LICENSE](LICENSE) with your copy.

```bash
npx degit bitbaum/heidi my-heidi   # a clean copy without our git history
cd my-heidi && pnpm install
```

- **Needs:** Postgres (`DATABASE_URL`). The `@bitbaum/*` kits document their own keys.
- **Shared pieces:** the `@bitbaum/*` kits install from public npm or public GitHub, so you need no tokens or private registry.

More to take: [orangecat.ch/steal](https://orangecat.ch/steal) and [github.com/bitbaum](https://github.com/bitbaum).

### Want to build it with us? Show us how you think

Copying code is free. What stays scarce once agents and robots write most of
it is seeing the whole system. Pick one of these, in this repo, and open an
issue or a pull request:

1. **Find the second source of truth.** Find a fact this code defines in two
   places. Show how the copies will drift, and say where the one copy should
   live.
2. **Find the silent failure.** Pick a promise this system makes. Find where it
   fails while every check stays green, and propose the check that would catch
   it.
3. **Find where the human belongs.** Point to a step where an agent acts alone
   but a person should decide, or the reverse, and say why.

A short, correct answer beats a long one, and so does an answer that admits
what it doesn't know.
