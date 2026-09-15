# Heidi

The canonical definition. If product behaviour is decided anywhere else — a
ChatGPT prompt, a Claude transcript, a blog post, a landing-page config — it is
not decided. It is written here or it is not real.

One file, not four. A product this small does not need a documentation set; it
needs one page that cannot drift from itself.

---

## 1. What it is

> Heidi helps an adult who already has German understand the Zurich German
> actually spoken around them, deal with the messages and speech they meet in
> real life, and turn those encounters into learning — measured by how much of
> an unfamiliar Zurich speaker they understand, not by how much Heidi they have
> consumed.

Live at `heidi.orangecat.ch`. An OrangeCat property, built and dispatched
through Loki.

---

## 2. The problem, from first principles

An adult lives in an environment where communication happens in a target
variety **T**. They already command a related bridge variety **B**. They cannot
understand T.

The mechanism that would fix this is exposure. And the environment withdraws
exposure precisely when it detects that they need it: the Swiss switch to
Hochdeutsch or English the moment they notice you struggling. The learner is
denied the input *because* they are a learner.

**That trap is the reason a product is justified at all.** Heidi is a source of
exposure that does not withdraw. Everything else is downstream of that sentence.

Two consequences follow immediately:

1. **Raw exposure is not input.** Speech you understand 0% of is noise. The job
   is calibrated exposure at the learner's frontier — which means the frontier
   has to be measured, per learner, continuously. That measurement is the thing
   software can do that a podcast cannot, and it is the whole justification for
   building this rather than recommending a radio station.

2. **The learner cannot audit what we sell them.** They are buying Zurich German
   *because* they do not know Zurich German. If we hand them Bernese forms, they
   will never find out. This is a lemons market, and it is why the deterministic
   variety gate (§6) is not a quality nicety but the thing that makes the
   product honest at all. The same logic forces real recorded speakers.

---

## 3. Fact, hypothesis, decision

Language-learning products accumulate pseudoscience by letting "there is a
study" become "this is proven" become "the product is built on it". These three
headings are kept separate on purpose, and every claim below is filed under one.

### FACT — established, and we rely on it

- **Exposure dominates every linguistic distance measure.** Across 1,833
  listeners and 70 language pairs, exposure to the test language overrode
  lexical, phonological and orthographic distance as a predictor of
  intelligibility. *(Gooskens, van Heuven, Golubović, Schüppert, Swarte & Voigt
  2017/18, Int. J. Multilingualism.)*
- **Consonant correspondences predict intelligibility far better than vowel
  ones** — r ≈ −.74 vs −.29. *(Gooskens & Heeringa.)* Two of Heidi's current
  four correspondences are vowel rules, which is the weaker bet; note recorded
  in the pack.
- **Multi-talker training is what buys generalisation to unheard talkers.**
  Single-talker training can match or beat it on the trained voice and fails to
  transfer. Demonstrated for phonetic training *(Logan, Lively & Pisoni 1991;
  Lively et al. 1993)* and replicated specifically for regional **dialects**
  *(Clopper & Pisoni 2004)* — the closest precedent to our exact case.
- **Generalisation is graded by acoustic similarity, not a switch.** Adapting to
  one talker transfers partially to a new talker of the same variety, and less
  as the voices diverge. *(Bradlow & Bent 2008; Xie & Weatherholtz et al. 2017.)*
- **Telling the listener what to attend to is an active ingredient.** Identical
  stimuli and identical feedback; only the group cued to the relevant contrast
  learned it. *(Pederson & Guion-Anderson 2010.)*
- **Retrieval with corrective feedback beats restudy.** 222 studies, 48,478
  students; g ≈ 0.50 overall, and feedback matters — g ≈ 0.54 with, 0.37
  without. *(Yang, Luo, Vadillo, Yu & Shanks 2021, Psychological Bulletin.)*
- **Spacing beats massing in L2**, and the advantage grows at delay: g ≈ 0.76
  immediate, g ≈ 1.15 delayed, over 48 experiments and 3,411 participants.
  *(Kim & Webb 2022, Language Learning.)*
- **Captions help, after the listening attempt.** Large effect on vocabulary
  (g ≈ 0.87) and on comprehension, apparently by helping segment the speech
  stream. *(Montero-Perez, Van Den Noortgate & Desmet 2013.)* The crutch risk is
  real and is specifically about text shown *during* listening.
- **Perception training transfers weakly to production** — d ≈ 0.92 perception,
  d ≈ 0.54 production, uncorrelated across studies. *(Sakai & Moorman 2018.)*
  So comprehension training must not be sold as a speaking fix.
- **Written dialect is normal in Swiss digital communication**, not slang —
  which is what makes "text like a local" a real competence and not a gimmick.
  *(Uni Bern, Texting in Time; UZH What's Up corpus.)*

### HYPOTHESIS — plausible, untested, and Heidi is the instrument

- **Correspondences work as in-practice attentional cues even though they fail
  as a lecture.** The one rigorous test of the lecture form — 50 minutes of
  Dutch↔Frisian correspondence instruction — produced no significant gain
  *(Bergsma, Swarte & Gooskens 2014)*, and the authors themselves decline to
  generalise it. The whole European intercomprehension pedagogy tradition
  (EuroCom, Galanet, Galapro) is, in Gooskens & van Heuven's own words,
  essentially unevaluated. The nearest positive evidence is indirect: Slavic
  learners recognised non-words far better when the change followed a regular
  correspondence, amplified by sentence context. **Status: our design is the
  untested one. Test it — condition A audio→answer→replay, condition B
  audio→one correspondence cue→replay→answer, outcome = delayed generalisation
  to unseen words from an unheard speaker.**
- **A short tuning session measurably improves cross-speaker comprehension.**
  See the overclaim register (§8) — what is established at ~60 seconds is
  processing speed, not accuracy.

### DECISION — product choices, valid whether or not the hypotheses hold

- **Listening before texting before speaking** for Zurich German. Justified by
  the sociolinguistics, not only the evidence: understanding dialect and
  replying in Standard German is a complete, respected way to take part.
- **Measured, not gamified.** The reported number is comprehension of an
  unfamiliar Zurich speaker, before and after. No streaks, no gems.
- **The test speaker is always one the learner has not heard.** Forced by the
  generalisation research; without it we would be measuring memory.
- **Real recorded Zurich speakers.** Note the reason has changed — see §7.
- **The model never judges its own variety.** §6.

---

## 4. Architecture: the variety is data

George's requirement: *"if tomorrow I tell you to make the same kind of Heidi
but for Ukrainian, and call it Lesya, we should be able to do that."*

Taken as a **now** constraint, not a later one — because it decides the shape of
everything, and retrofitting it costs more than building it.

The wrong answer is i18n. Translating the UI is not the problem; the subject
matter is the problem. The right answer falls out of §2: if the product is
"comprehension of a related variety across a bridge you already have", then the
*variety* is a parameter and the *engine* is general.

```
lib/variety/
  pack.ts        the contract — what any variety must declare
  check.ts       the deterministic gate, generic over packs
  active.ts      THE SEAM — one line saying which variety this build teaches
  packs/gsw-zh.ts  Zurich German   (Heidi)
  packs/uk.ts      Ukrainian       (Lesya)
```

**The house rule that keeps it honest:** nothing outside `lib/variety/packs/`
may name a Zurich form, a German word or a Swiss fact. If swapping the pack
would not swap the product, something has leaked.

A pack declares identity, bridges, the learner profile, correspondences,
contamination rules, orthography policy, and capabilities. It is enforced by a
contract test suite that runs over *every* pack, so a half-finished Lesya turns
the build red rather than shipping.

### What writing the second pack actually proved

Writing `uk.ts` was the point — an abstraction with one instance is a guess.
It held, and it cost two fields:

| | Heidi (Zurich German) | Lesya (Ukrainian) |
|---|---|---|
| Contamination threat | Bernese / Basel / Ostschweiz forms | Russian calques, surzhyk |
| Orthography | **none** — spelling is convention | **state standard** — spelling can be wrong |
| Learner's broken skill | **comprehension** | **production** |
| ASR / TTS | none usable | both, off the shelf |
| Licensed audio | none (all NC) | abundant |

Three things generalised cleanly: the bridge mechanism, the contamination gate,
and the pipeline shape. Two broke the contract and forced new fields:

1. **`orthography.standardised`.** Identical checker behaviour would be wrong in
   one direction or the other — nagging Swiss users about spelling that has no
   standard, or waving through genuine Ukrainian errors.

2. **`learner.priority` — and this is the one that would have sunk a naive
   port.** A Russian-speaking Ukrainian has understood Ukrainian since school;
   they receive it fluently. Their gap is confident, interference-free
   *production*. Shipping Heidi's listening-first front door to that population
   drills a skill they already have and skips the one they came for. So the
   engine never hardcodes the front door — it reads `priority[0]`.

`capabilities` earns its place for the same reason: it declares which surfaces
can exist at all, so the engine degrades rather than assumes. Heidi cannot offer
pronunciation feedback; Lesya could on day one.

**Extraction:** this stays inside Heidi until a second instance exists. Per the
fleet's own rule, the shared package is created at the second consumer, not the
first. The seam is drawn now so the extraction is mechanical then.

---

## 5. What is true of the repo today

A seven-language site — home, chat, grammar, method, contribute, about, plus a
personal portal and settings — with the assistant on the home page AND at full size on
`/chat`, the deterministic gate shown as evidence on `/method`, and the variety
layer underneath.

There are now accounts and a database. Identity is federated to OrangeCat and
Heidi holds no users table; Postgres holds study groups and private
conversations, and nothing else. Saved vocabulary lives in the visitor's own
browser. There is still no audio and no learner model.

- **Linguistic knowledge is data**, in the packs — not embedded in prompts. The
  model's instructions are *generated from* the pack (`lib/variety/prompt.ts`),
  so no language is named in prose anywhere in the engine.
- **The UI language and the taught variety are separate axes.** `VARIETY` is
  what you learn, one per deployment; `locale` is what Heidi speaks to you
  while you learn it, seven of them. Conflating them would make a Lesya
  deployment re-translate the site as well as swap the pack.
- **German is the default locale**, then the other national languages, Swiss
  German, English and Russian. German is the source dictionary and the others
  are typed against it, so a missing key is a build error. Romansh is unreviewed
  by a native speaker and says so; the assistant answers Romansh readers in
  German rather than invent low-resource output at an audience that would spot
  it instantly. Swiss German is offered as a *dialect*, deliberately not filed
  with the four national languages — Switzerland has four and this is not one
  of them.
- **Identity is federated, and Heidi keeps no users table.** The OIDC `sub` from
  OrangeCat is the actor id, stored as bare text with no foreign key, because
  the row it would point at lives in another product. The cost is a denormalised
  display name on a membership row; the benefit is that Heidi holds nothing that
  can be stolen from it.
- **Postgres holds groups and private conversations.** `study_groups`,
  `group_members`, `group_messages`, `conversations`, `conversation_messages`.
  The two families are deliberately not one family. A group's `invite_token` is
  `NOT NULL UNIQUE` and is a *credential*, so reusing the table for private
  chats would mint a joinable room key for every conversation anyone ever had;
  and their deletion semantics run opposite ways. Leaving a group sets
  `left_at` rather than removing the row, so the messages someone wrote keep an
  author. Deleting a conversation destroys its messages.
- **A private conversation stores `image_count`, never the images.**
  Attachments would be the largest rows in the database and the most private
  artefact the product touches. The count is enough for a reopened thread to
  say a picture was here.
- **Signed out, a conversation never reaches the database.** It lives in
  `localStorage` under `heidi.chat.draft.v1`. The alternative — minting a
  pseudo-actor from a cookie so anonymous rows have an owner — is a tracking id
  by another name, and it creates rows nobody can ever authenticate to in order
  to delete. Adopting a signed-out conversation into an account is **offered,
  never automatic**, and every field is rebuilt server-side.
- **Saved vocabulary is device-local.** `lib/browser/store.ts` over
  localStorage, not a table — it needs no account, works signed out, and keeps
  Heidi from holding a record of what a particular person cannot understand.

---

## 6. The variety gate

A deterministic, model-free check over any text claiming to be the target
variety. Findings carry a severity, ranked by *how certainly wrong*:

| severity | meaning | example |
|---|---|---|
| `unattested` | not a form of the language at all | `ß` in Swiss; `ы` in Ukrainian |
| `foreign` | a real form, of another variety | Bernese `güet`; Russian `кофе` |
| `dispreferred` | real here, but house style differs | — |
| `variant` | legitimate spelling variation — never shown as an error | — |

`unattested` outranks `foreign` deliberately: a Bernese form is a real word that
a real person says and the judgement is regional and arguable; a `ß` in Swiss
text is not a form of the language and no reviewer will overturn it. Ranking
these the other way round let both through the gate — caught by a test, which is
the argument for the tests.

One rule set, two thresholds. The generation gate rejects at `foreign` and
above. House style is checked at `dispreferred` for our own copy. **A learner's
own writing is checked at `foreign` too** — telling someone their spelling is
wrong in a variety with no standard spelling is the one thing this product must
never do.

Known limit: the regional judgements in `gsw-zh.ts` are inherited and have not
been reviewed by a native Zurich speaker. An LLM must not be the sole grader of
another LLM's dialect. A native panel is required before any generated dialect
reaches a learner.

---

## 7. Corrections to the record

Findings that contradict what is currently published or assumed. These are here
because being wrong in public is expensive and quiet correction is cheap.

1. **SwissDial is CC BY-NC 4.0 — non-commercial.** So is SDS-200, ArchiMob,
   SwissCrawl, the What's Up WhatsApp corpus and the sms4science corpus.
   STT4SG-350's licence is *contested across primary sources* (META-SHARE
   NonCommercial in one catalogue, CC BY 4.0 in another). **No Zurich-region
   speech corpus has been confirmed usable commercially.** Any plan that leans
   on one needs a licence in writing first.

2. **"There is no purchasable Swiss German TTS" is probably no longer true.**
   At least one vendor advertises commercially-cleared Züridütsch voices, and
   ZHAW/FHNW academic pipelines are close behind. Unverified independently —
   but it is published on the OrangeCat blog as fact and should be softened.
   Separately: most "Swiss German" TTS on the market is Standard German in a
   Swiss accent. Listen before believing a label.

   **The moat argument survives the correction, and is stronger for it.** It was
   never really "TTS doesn't exist" — synthetic speech will keep improving. It
   is that every Zurich corpus is research-licensed, so a *consented,
   commercially clean, richly annotated* corpus built around perceptual learning
   is an asset nobody can download. That is a licensing and consent moat, not a
   technology gap.

3. **Common Voice `gsw` is not safely "Swiss German"** — the ISO code is shared
   with Alsatian. Filter by provenance, never by label.

4. **Swiss German ASR is an unsolved problem**, and the honest published figure
   is ~25.6% WER after fine-tuning on 1,367 h; earlier, better-looking numbers
   are inflated by benchmark contamination and convention mismatch. The state of
   the art still transcribes dialect *into Standard German* — it translates away
   exactly the information a learner needs.

5. **The landing copy overclaimed the Frisian result.** "The lecture version was
   tested and did not work" implied more than one 50-minute study supports, and
   implied our alternative is the evidence-backed one when it is the untested
   one. Corrected in `lib/config/landing.ts`.

---

## 8. Overclaim register — what we must not say

- ❌ "Sixty seconds and you will understand more." What is replicated at that
  timescale is **processing speed** (reaction time, single talker, lab measure),
  not comprehension accuracy, and it is not reliably durable past a week without
  further exposure. ✅ "In under a minute your brain starts adjusting to the
  sound, and here is that effect measured."
- ❌ "Learn to speak like a local." Perception training transfers weakly to
  production.
- ❌ "93% native pronunciation." Speech-score theatre; false precision.
- ❌ Any claim that correspondence rules are proven to help. They are our
  hypothesis, and we say so.
- ❌ Presenting a Zurich spelling as the correct one. There is no correct one.

---

## 9. What is built, and what is next

**Built: the conversation.** One field on `/`, and no mode switch.

It had one — *Understand* or *Say it* — and the switch was the bug. Someone
arrives with a communication problem, not with a decision about which of our
tools to use, and making them classify their own problem first is our internal
structure pushed onto them. The model decides now and reports which it decided;
a follow-up ("why did they say it like that?") is an ordinary next message
instead of a new query with no past.

It answers first and completely, because at 08:55 before a meeting someone
needs the message decoded, not a lesson; the words worth keeping sit underneath
and never block the thing they came for. Dictation is the browser's own
recogniser — free, instant, no audio leaves the device, and explicitly NOT a
claim to transcribe dialect, which nothing does well.

**Two packages, each doing its own job.** `threadkit` owns the thread: who
participates, what each may see, and *whether the assistant speaks at all*.
`@bitbaum/ai-kit` owns the model call: which vendor, what to do when one dies.
Neither knows the other exists — the seam is a `complete` callback. That is
overkill for a two-party chat and exactly right for the next feature, because a
group thread with a tutor in it is the same object with a longer participant
list rather than a migration. threadkit already encodes the social rule we
would have got wrong: two participants means the assistant *is* the
conversation and answers every turn; three or more means it waits to be
addressed, since two humans talking is not an invitation.

Four deterministic guards sit between the model and the learner, and all four
exist for the same reason — the learner cannot check this work:

1. **Every generated line goes through the variety gate** (§6) before it is
   shown, and a flagged line is marked rather than dropped, so drift is visible.
2. **A correspondence may only be cited if the pack vouches for it.** Found in
   testing: asked about *"Im Kauz"* — a Zurich bar — the model decided Kauz was
   a typo for *Huus* and supplied the sound law "k → h". Confident, plausible,
   invented. Rules the pack does not list are now stripped.
3. **A word glossed against itself is dropped.** The model kept explaining that
   *freundlich* means *freundlich*.
4. **A looping answer is refused.** Seen live from a free model asked what a
   word meant: *„verbi" ist ein Kurzwort für „verbi" = „verbi"*. Fluent,
   well-punctuated, confident, and empty. Sending that to someone learning the
   language is worse than sending nothing, because not understanding is the
   state they are already in and they cannot tell it is broken. It now surfaces
   as a failed turn with a retry.

**Known limit, stated rather than hidden:** the guards catch invented *rules*
and looping *form*, not an invented *fact*. Asked about "Im Kauz" the model
still offers a wrong gloss — confidently, in fluent German. Stripping
fabricated lexical claims needs a Zurich lexicon to check against, and that is
the next piece of linguistic work. Answer quality also varies run to run on the
free model tier.

The AI layer is `@bitbaum/ai-kit` — `freeChain` + `complete()`, so a retired
model cannot take Heidi down, which is the failure that took five repos out at
once on 2026-08-26. With no key the route answers 503 and says so plainly
rather than pretending.

**Also built since:** the full-screen chat at `/chat`, which is the same
conversation as the box on the home page rather than a second one — both read
the same store, so expanding continues the thread instead of starting one, and
nothing is passed in a query string where it would land in the access log, the
`Referer` header and browser history. Signed in, the server remembers: a
sidebar of past conversations, resumable, renameable, deletable. The
conversation row is created on the first message, not when the page opens, so a
"new chat" button that gets pressed and abandoned leaves nothing behind. It
escapes the site chrome with one CSS rule keyed on `body:has([data-chrome="chat"])`
rather than a second root layout, because there can only be one root layout —
`<html lang>` has to carry the real language of the page — and navigating
between two of them costs a full document reload.

Also study groups, where the thread has a longer participant list and threadkit's rule does the social work — two participants and Heidi *is*
the conversation, three or more and she waits to be addressed by name. The
invite link is the credential, so it is 192 CSPRNG bits kept separate from the
group id and rotatable, because the only way to un-invite a link already sitting
in somebody's WhatsApp is to kill it. And **kept words**: the gloss Heidi
already produced on every answer used to be drawn once and thrown away, so
looking the same word up on Tuesday and Friday accumulated nothing. One tap now
keeps it, in the browser, with the sentence it came from.

**And spaced reuse, which was the next item on this list and is now the
dashboard.** Kept words come back on an expanding schedule — a day, then three,
then a week — and they come back as a QUESTION rather than a list, because
being asked beats being shown by about half a standard deviation
([Yang 2021](https://doi.org/10.1037/bul0000309)) and spacing's advantage is
larger on a delayed test than an immediate one
([Kim & Webb 2022](https://doi.org/10.1111/lang.12479)). Deliberately not
SM-2 or FSRS: those model hundreds of reviews a day across thousands of cards,
and fitting a curve to a learner's eleven kept words is the false precision §8
forbids. Fixed intervals carry the finding and nothing more.

Beside it, **what keeps catching you** — the correspondences that actually
separate the words they kept from the forms they already knew. Derived, not
tracked: no lookup counter and no record of what a particular person failed to
understand, because six kept words that all turn `k` into `ch` already say it.

**And the answer now proposes what to do next.** It used to end and leave the
learner holding *"…and now what?"* — where every way out cost them a sentence
they had to compose ("can you make that shorter", "how would I reply to this"),
and composing a request ABOUT an answer is a harder job than reading it. Most
people did not bother, which is why the product felt like a lookup rather than
a conversation. The biggest gap it closes is the most obvious one: somebody
pastes a message a Swiss colleague sent them, Heidi decodes it beautifully, and
never asks whether they need to ANSWER it.

Two or three chips, each one tap, chosen by the model for that exchange. The
rephrase axes widened from two to six, because *shorter* and *warmer* are not
what people most often need — *firmer* is what you want when your landlord has
ignored you twice, and *formal* is what an email to an employer needs.

**The vocabulary is closed, and that is the whole design.** The model picks ids
from a fixed list; the dictionaries supply the wording in seven languages. A
label the model wrote itself would arrive in whatever language it felt like,
could promise something pressing it does not do, and could not be tested —
there is no assertion to write about a string that differs every time. A test
asserts every id has wording in every locale, so adding a move without its
seven translations fails the build rather than rendering a blank button in six
languages. Pressing a chip sends an ORDINARY message, visible in the
transcript: a follow-up you cannot see is a conversation you cannot re-read.

**And Swiss Standard German is now an output, not just a bridge.** Zurich is
diglossic, and the product had only ever produced the spoken half: dialect is
what is said and what is written informally between people who know each other,
while an email to a landlord, a doctor, an employer or an insurer is written in
Swiss Standard German. Producing only dialect taught half the competence and
quietly set people up to send a chat message to an insurance company.

This was already in the data model — `de-CH` is the pack's first `sibling`
bridge, the variety the correspondences are computed from — so the work was
using the design rather than extending it. A suggestion now carries which
variety it is IN, because the gate has to judge it against the right standard:
a Swiss Standard German line sent through the DIALECT gate is flagged as
not-Zurich-German, correctly and uselessly, and the learner sees a warning on
the one line that fits their situation.

**And the bridge has its own gate**, for the same reason the target does. Asked
for Swiss Standard German, a model will hand back Germany's German — fluent,
grammatical, and undetectable by the person reading it, who cannot know that
asking about a *Fahrrad* marks them as foreign in the first line. So: `ß` is
unattested (Switzerland does not use the letter at all), and Germany's lexis is
`foreign` with the Swiss form to use instead — *Velo*, *Trottoir*, *Matura*,
*parkieren*, *Tram*, *Rahm*, *Sack*. The list is short and certain on purpose;
a gate that nags about defensible choices trains people to ignore it, and is
then worth nothing on the day it is right.

**And any word is now askable, not just the ones Heidi chose to gloss.** The
word a learner is stuck on is by definition the one nobody predicted, so a
feature that only worked on predicted words missed the case it existed for.
Selecting a word in Heidi's half of the transcript offers to ask about it; the
answer comes back with a gloss, and the gloss already carries the keep button —
which is what finally joins "I did not know this word" to the review queue.
Selection rather than a button per word, because wrapping every word would
triple the DOM and wreck copy-paste, which is the most common thing anyone does
with these messages.

**And grammar has a place to live.** Four things that stop a German reader
following spoken Zurich German — no preterite, `wo` as the universal relative,
possession built from the dative, and the `-li` that is on everything and often
means nothing small. Chosen by what blocks COMPREHENSION rather than by what a
grammar book would cover: somebody who reads German already has the vocabulary
and the word order, and what derails them is a past tense that does not exist.

Each topic is one sentence of rule, the forms beside the German they already
have, and the thing that actually trips them. Not a chapter — the evidence this
document already cites is that these work as cues beside something you are
about to meet again and produce no measurable gain as a lecture you sit through
first, so a page that taught Zurich grammar front-to-back would be the version
that was measured and found not to work.

It is deep-linkable, and an answer that turned on a structure offers a chip
straight to the topic. The FORMS live in the variety pack and the WORDS in the
dictionaries, joined by topic id: `Ich bi gange` is Zurich German whoever is
reading, while the sentence explaining it has to exist seven times. A test
asserts the two sides of that join agree in every locale, and that our own
examples pass our own dialect gate.

**Next**, in order: capture what the learner did not know into a learner model —
**the existing Heidi GPT generates that evidence daily and throws all of it
away**, and every question asked of it is a labelled datapoint about what a real
learner could not understand; then meeting a kept word again in a NEW sentence
rather than only the one it came from; then the listening lab, once there are
recordings to put in it.

Two loops explain Heidi better than any feature list:

> Upload a real message → understand it → reply naturally → learn one thing from
> it → meet that thing again later.

> Hear a real Zurich speaker → half-fail → get one cue → understand a
> *different* speaker better.

---

## 10. Privacy

Screenshots, chats and voice notes are among the most private things a person
owns. Consent to operate the product and consent to contribute to a research
corpus are **separate**, and the second is never assumed from the first. A
user's conversations do not silently become a linguistic corpus.

This section used to be four sentences of intent written when there was nothing
to be private about. There is now, so here is what actually happens.

**Signed out, nothing you type reaches our database.** The conversation is kept
in your own browser (`heidi.chat.draft.v1`). It is sent to a model to be
answered, and it is not stored on our side. No cookie mints an anonymous
identity for you: an id like that is a tracking id whatever it is called, and
it produces rows that nobody can ever prove are theirs in order to delete them.

**Signed in, your conversations are stored, and only you can read them.** Every
route checks ownership before anything else, and a conversation that is not
yours answers 404 rather than 403 — whether a given id names a real
conversation is not a stranger's to learn.

**Delete means delete.** Deleting a conversation destroys its messages in the
same transaction. The conversation row itself remains as an empty tombstone,
holding nothing but its id and the fact that it is gone, so a deleted link
keeps answering a stable 404; the title, which was your words, goes with the
rest. A `deleted_at` that leaves the text sitting in the table would make this
paragraph a lie.

**Pictures are answered from and then forgotten.** An attachment is downscaled
in your browser, sent to the model to be read, and never written to the
database. What is stored is a number: how many there were.

**Adopting a signed-out conversation is offered, not assumed.** Sign in with a
conversation open and Heidi asks whether to keep it. Silent adoption is what
the big chat apps do and nobody would blink — but the first act of a new
account should not be to quietly upload the transcript that was device-local a
second ago.

**Your own model key is never stored by us.** A key you bring stays in your
browser, is forwarded on the request it is for, and is redacted out of every
log line before anything is written.

**Saved words stay on your device.** They need no account, work signed out, and
keep Heidi from holding a record of what a particular person cannot understand.
