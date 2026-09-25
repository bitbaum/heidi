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

**The channel is spoken, and the product had better be too.** Zurich German is
a language people HEAR. It has no standard orthography (§6), the lunch table
that prompted this product is audio, and a learner who can only read it has
solved a version of the problem that does not occur. So hearing this language
and being heard in it are not a feature tier above the text — they are the
subject, arrived at late.

What that does NOT mean is a promise the field cannot keep. Everything below —
the overclaim register in §8, the gate over synthetic voices in §6, the refusal
to correct a transcript's forms in §9 — exists so that adding the spoken
channel did not quietly add four claims we cannot support. The honest summary
is one sentence: **Heidi can speak to you and understand you speaking; she
cannot tell you whether you sound right, and neither can anything else.**

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
- **One correct retrieval is not the finding; more than one, spaced, is.**
  Relearning to a criterion of repeated correct retrieval is what produces
  durable and efficient gains, and the marginal return falls off sharply after
  the first few. *(Rawson & Dunlosky 2011, JEP: General.)* This is why a missed
  item comes back before the sitting ends rather than only in a fortnight —
  and why the distance is three questions rather than immediately, which is
  OUR number and not theirs.
- **A multiple-choice question without feedback can teach the wrong answer.**
  Choosing a lure exposes the learner to it; feedback both raises the benefit
  of testing and removes that specific harm. *(Butler & Roediger 2008, Memory &
  Cognition.)* Three of the five item kinds here are multiple choice, so this
  is load-bearing rather than interesting.
- **Generating beats reading, and by less than its reputation suggests.**
  A meta-analysis puts the generation effect at a real but moderate size.
  *(Bertsch, Pesta, Wiscott & McDaniel 2007.)* It justifies having cloze and
  open items; it does not justify making every item productive.
- **Interleaving is conditional, and the condition is similarity.** The
  meta-analysis finds the benefit depends on how similar the material is, and
  that on highly similar material blocking can win. *(Brunmair & Richter
  2019, Psychological Bulletin.)* Heidi interleaves item KINDS, which are not
  similar to each other, and does not claim the finding it does not have.
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
- **Measured, not gamified — and the line is sharper than it was.** Revised
  2026-09-22, after a fair challenge: *why are we so hateful towards streaks,
  percentages, gamification, addictiveness?*

  The honest answer is that the original rule was two rules wearing one coat,
  and only one of them survives scrutiny. Two questions decide everything here,
  and they are independent:

  **What is counted?** *Consumption* — days opened, minutes spent, lessons
  finished — or *capability*: forms you now get right that you got wrong
  before. A streak counting days is a measurement of us, printed in the place a
  learner reads as a measurement of them. That objection is real and it stands.

  **How is it framed?** *Gain* — here is what you can do now — or *loss*:
  don't break your streak, your progress will reset, you have not practised
  today. Loss framing is what makes a product feel compulsory, and a compulsory
  language app is one somebody quits with a bad feeling about the language.

  What we refuse is the **dishonest quadrant**: consumption counted, loss
  framed. Not measurement, and not motivation. A learner being shown, in plain
  numbers, that they now recognise forty-one words they missed in September is
  being told something true about themselves, and withholding it is not
  integrity — it is just a worse product. Competence and relatedness are
  motivating on their own (Ryan & Deci 2000); nothing about that requires a
  flame icon.

  So: **counts of capability, framed as gain, never loss.** Revised again
  2026-09-25: a **streak of days is allowed** on exactly those terms — shown as
  what you have built, never as something you are about to lose. No shaming
  reminder, no "your streak ends tonight", no paying to repair one, and a free
  freeze, because a week of illness is not a failure. A weekly goal is offered
  beside it for people whose life does not run in days. What stays refused is
  the guilt, not the count.
  No percentage "fluency", because there is no denominator for a language — a
  SITUATION has one, which is why "10 of 10 lines" is allowed and "73% fluent"
  is not. No pronunciation
  score, for the separate reason in §8 — that one is about what can be measured
  at all, not about how it would be framed.

  The reported headline number is unchanged: comprehension of an unfamiliar
  Zurich speaker, before and after.
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

### The third axis: situations

Two axes were already separate and deliberately so — `VARIETY` is what you
learn, one per deployment; `locale` is what Heidi speaks to you while you learn
it, seven of them. Neither answers the question a care assistant actually
arrives with, which is not *what is Zurich German* but *what is said to me at
half past six in the morning, and what do I say back*.

So there is a third: **domain — where you need it.**

```
lib/situations/
  pack.ts                 the contract — what any domain must declare
  active.ts               THE SEAM — the packs matching the taught variety
  display.ts              the projection, same rule as the variety's
  packs/gsw-zh-care.ts    care and nursing homes, in Zurich German
```

Unlike the variety, a domain is **not** one per deployment. One Heidi serves a
care assistant, a relocating doctor and somebody who has just moved into a
shared flat, and those are not three deployments. So packs are a list, filtered
at module load by the variety they declare — a Lesya build that inherited this
folder offers no Zurich sentences rather than offering them in the wrong
language, which is §2's failure with the packaging changed.

**Why it is not simply more vocabulary.** The word list is organised by what
KIND of word each one is, and that is right for its own argument: function
words and the constant verbs are what no correspondence rescues. It is the
wrong organisation for a shift. Nobody walks into a handover needing the twelve
commonest particles; they need to follow four sentences about who slept badly.
A situation is a scene and the lines that occur in it, in the order the moment
unfolds — and the unit is the sentence, because the sentence is the unit a
learner fails at.

**Three things keep it honest**, and none of them is care:

1. **Every line passes the deterministic gate**, at the `foreign` threshold the
   generation gate uses. The contract suite runs `check()` over all of them, so
   a Bernese vowel fails the build rather than reaching somebody who could not
   detect it. Proven by mutation, not by the suite being green.
2. **Every line names a source** for its lexis — required on every phrase,
   unlike a vocabulary entry where a bare pair may inherit the pack default. A
   sentence is a bigger claim than a gloss, and this module publishes nothing
   but sentences. The source vouches for the WORDS; the arrangement is ours,
   because example sentences must be written for this product rather than
   lifted from resources that are research-licensed or non-commercial.
3. **A pack declares whether a native speaker has read it, and the page prints
   that answer either way.** `provenance.nativeReviewed` is `false` on `care`
   today and the scene pages say so above the lines. This is the field most
   easily skipped and the one that matters most: §2's argument is that this
   learner cannot audit what we sell them, and that is far more true of a
   sentence somebody will say to a frightened person at six in the morning than
   it is of a greeting. It flips when a named person has read every line, and
   `by` records who — a test refuses a claimed review that names nobody.

**Direction is a field, not decoration.** `hear` or `say`, per line. §1 puts
listening first and speaking last on purpose, and a domain pack is the easiest
place in this codebase to drift into a phrasebook, which is all `say`. A test
holds every pack to at least a third `hear`, and each scene prints the count.
The floor is a third rather than a half because `care` legitimately leans on
production — the reply to somebody frightened at six in the morning is not a
sentence you get to compose in Standard German first — and a rule that failed
the honest pack is a rule nobody keeps.

**Where it surfaces.** `/situations` and `/situations/<scene>`, under
`reference` in the nav rather than `use`: the header test caps `use` at five
because a sixth link there is the sideways-scrolling bar this repo already
shipped once, and the DOING half of a situation is `/practice`, which every
scene links into. Scene lines become practice items — `hear` lines only, same
blanking rule as the grammar cloze, and a missed one traces back to the SCENE
rather than to the topic, because the other nine lines are the context that
makes it stick.

---

## 5. What is true of the repo today

A seven-language site — home, chat, a reference section (grammar, dialects,
vocabulary), method, contribute, about, plus a personal dashboard and settings
— with the assistant on the home page, at full size on `/chat`, AND docked on
every other page, the deterministic gate shown as evidence on `/method`, and
the variety layer underneath. Signed in, the home page IS the dashboard: same
address, different page, because "Start" has to mean start.

There are now accounts and a database. Identity is federated to OrangeCat and
Heidi holds no users table; Postgres holds study groups (and teams), private
conversations, the speaking rounds people schedule, votes and comments on the
roadmap and changelog (under a random browser key, not an account), and — ONLY
for a learner who switched it on — their synced progress and the certificates
issued from it. Saved vocabulary, the learner model and recorded takes live in
the visitor's own browser by default; see "Progress on more than one device"
below for what changes when sync is on.

There is now audio, and the shape of it matters: a learner can record
themselves, and the recording is measured **in the browser** — always, in every
mode, before anything else happens to it. On the dialect it is then dropped and
nothing is sent anywhere, which is the default and the whole position.

One mode differs and it is a choice the learner makes per take, not a setting
that creeps: practising the BRIDGE — Swiss Standard German, the variety with a
recogniser that returns what was said — sends the recording once to be
transcribed. There is still no audio table and no upload endpoint that stores
anything; the recording exists for the length of one request. The screen says
which of the two it is in, next to the button, in the learner's language. See
§9 and §10.

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
- **The theme is the reader's.** `globals.css` had carried a full dark palette
  since the retheme, in blocks guarded on `data-theme` — and nothing ever set
  that attribute, so the palette was unreachable. Light, dark or the device's
  own, stamped by an inline script before first paint, because an effect runs
  after it and a reader who chose dark would watch a white page flash to black
  on every navigation.
- **The assistant is reachable from every page.** Chat is how people use this
  product, and it existed on two surfaces out of eleven: a reader on
  `/grammar` had to notice the nav, work out which link was the chat, and lose
  the page they were reading. Signed in it was worse — the locale root is the
  dashboard, so the landing page had no composer at all. The dock
  (`_components/chat/dock.tsx`) is the same conversation as the other two
  surfaces, because all three read one store through `use-draft-chat.ts`.
- **A page that already holds a conversation marks itself**, with
  `data-chat="surface"`, and `globals.css` hides the dock when the document
  contains one. CSS rather than a list of pathnames, because whether the locale
  root holds a chat depends on whether the visitor is signed in — which a route
  table cannot know and the rendering page always does. Same mechanism as
  `data-chrome="chat"`.
- **The account is one control, not three.** An avatar menu replaced a gear
  icon beside a pill with a green status dot that nothing measured. What is in
  it comes from `ACCOUNT_MENU_KEYS` in `lib/i18n/routes.ts`, so a menu entry
  naming a page the site does not have is a build error — the same rule that
  keeps the nav and the sitemap from disagreeing.
- **One dismiss implementation, for everything that opens over the page.**
  `use-dismiss.ts`. It had been written twice and the copies disagreed: one
  returned focus to its trigger on Escape and one dropped it to the top of the
  document. The mobile menu had neither, and no way to close at all short of
  pressing the button again — found by the test that asserts every
  `aria-expanded` control uses the hook.

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

**The same gate applies to sound, and there it is stricter.** Every argument
above survives being read aloud and gets worse, because written text can be
stared at and looked up while speech is gone the moment it is said. So
`lib/voice/variety.ts` judges what a synthetic voice is actually speaking, and
its rule is absolute rather than probabilistic: **no synthesiser is ever
reported as dialect.** Not "probably not" — no platform ships a Züritüütsch
voice, `de-CH` is Swiss Standard German on every operating system in reach, and
§7.2 records the market selling the accent as the dialect. Dialect can only come
from a source verified to be dialect, which today means a recorded human being.

The consequence is what makes it worth having: because the gate knows, every
control that speaks can say what it is about to speak, and does.

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
- ❌ "Heidi speaks Zurich German." **No synthesiser anywhere does.** A `de-CH`
  voice is Swiss STANDARD German — the written language read aloud in a Swiss
  accent — and §7.2 already records that most voices sold as "Swiss German" are
  exactly that. ✅ "This is a Swiss Standard German voice, not Zurich dialect",
  said every time she speaks. `lib/voice/variety.ts` has no code path that
  returns `dialect`, and a test feeds it voices named *Züritüütsch* and
  *Schweizerdeutsch Mundart* to prove it is not fooled by a label.
- ❌ "Heidi hears your dialect and corrects your pronunciation." She hears TEXT
  produced by a recogniser, and §7.4 says what that recogniser does: it
  transcribes dialect INTO Standard German. There is no confidence and no
  phoneme alignment anywhere in the correction path, so a score would have to
  be invented rather than measured. ✅ "Heidi cannot tell you whether your
  accent is right. Nothing can, reliably."

  **This survives the bridge transcript unchanged, and the distinction is the
  point.** A take practised in Swiss Standard German IS sent to a recogniser,
  so "there is no audio in the correction path" is no longer the reason — the
  reason is the one that does not depend on plumbing. A word error rate tells
  you how often the transcript is wrong; it tells you nothing about how the
  speaker sounded, because the recogniser threw the sound away to produce it.
  `capability.ts` therefore marks pronunciation `refused` rather than `none`:
  not "not yet, at this accuracy", but never, at any accuracy, by decision.
- ❌ Correcting the FORMS in a transcript of what somebody said. Those forms are
  the recogniser's spelling, not the speaker's — flagging `ist` or `nicht` in a
  transcript corrects the machine and bills it to the learner, who may have
  said `isch` and `nöd` perfectly. This is refused at every correction level
  rather than at the low ones.
- ❌ Calling a machine reading Zurich spelling in a Standard German voice a
  model of the pronunciation. It is a way to find a word in a sentence, and
  the copy beside it says so.
- ❌ Publishing a listening source as dialect because it is Swiss. Half of
  Swiss broadcasting is Standard German by format, which is exactly the trap a
  learner cannot see; `lib/listening/sources.ts` labels every row and names
  what the label rests on.

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
and never block the thing they came for.

**Dictation prefers the browser's own recogniser** — free, instant, and no
audio leaves the device. But that API is a promise the browser does not always
keep: on Chromium builds without Google's speech service it accepts `start()`
and never fires an event, and Firefox does not implement it at all. So there is
a server fallback, and since 2026-09-15 it walks a CHAIN through
`transcribe()` in `@bitbaum/ai-kit` rather than being one `fetch` at one vendor
with one key. That function was added upstream in the same week, because the
fleet had three copies of the hand-rolled shape and the package that owns model
routing had the endpoint declared in its registry with nothing behind it.

Either way it is explicitly NOT a claim to transcribe DIALECT, which nothing
does well — it transcribes what the learner wants to SAY, in a language they
already have, which is the job the browser was supposed to do. §8 binds this.

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

**And a kept word comes back somewhere new.** The review card showed the
sentence the word was found in — the same sentence every time — so the word got
learned attached to that context rather than learned. It now carries one or two
further sentences, generated once at save time and gated like everything else.
Free for everyone, and that was a measurement rather than a concession: the
call is about 174 tokens in and 60 out, roughly five hundredths of a rappen for
the lifetime of that word, so a learner who fills the entire 500-word cap costs
about a quarter of a franc. Gating that would be arbitrary, and people can feel
arbitrary. Saving never waits for it: the word is written first and the call
fires after, so a failure costs nothing anybody did.

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

**And a reference section, built on one rule: a claim is DATA, gated and
tested, not prose somebody wrote.** `/dialect` says what Swiss German is —
spoken rather than written, no correct spelling, not one language — and lists
every dialect area in the country. `/vocabulary` carries the words that
actually block a sentence, which are the short constant ones no sound
correspondence rescues, not the ones a phrasebook would pick. A test enforces
that: function words and verbs must outnumber the rest, or the page is a
phrasebook however it is labelled.

The area pages carry NO prose. Eleven areas across seven languages is
seventy-seven blocks nobody here can check, and a machine-translated claim
about where a form is spoken is how a reference page ends up confidently wrong
in six languages at once. What is there instead is the endonym, the cantons,
the town, and the forms the gate can actually tell apart — READ from the rules,
so no page can show a form the checker does not enforce. An area we cannot
place yet says so rather than inventing something plausible.

**And the map now says which claim it is making.** It drew `family.planned` —
a roadmap — which is why a reader asked where Graubünden was and got an answer
about product priorities rather than about language. Three things that were one
list are now three: where the dialects are, what Heidi will teach, and what the
gate can detect. All twenty-one German-speaking cantons are covered, and a test
says so.

Sourced, and the tests refuse an unsourced claim: the SDS for where a form is
spoken, the Idiotikon for what a word means. Citing the atlas for a gloss would
be a reference that looks right and does not support the sentence above it.

**Built: a pasted message is read as a message, not as text.** The situation
this product exists for is that a letter arrived from a landlord, an insurer or
a Verwaltung, it is half-readable, and it has to be ANSWERED. People paste the
whole thing: headers, signature, the quoted chain of the last four replies.

Handed that raw, a model answers the quoted message rather than the new one,
spends its four glosses translating *"Gesendet: Montag, 3. März 2025"*, and
never asks the obvious question. So the envelope is now recovered
DETERMINISTICALLY (`lib/domain/chat/email.ts`) and handed over as labelled
fields — from, subject, date, the new message, and a note that an older chain
was left out. Headers are one of the few things here that really are a regular
language, so they are parsed rather than inferred, and the header names are
matched in German, French, Italian, English and Russian because Outlook
localises them to the SENDER's interface language, not the reader's.

It refuses to guess. No recognisable envelope and no quoted chain means the
paste is ordinary text, which is what most pastes are — a parser that found
structure everywhere would mangle the two-line WhatsApp message that is the
other half of this product's input.

**And the reply offer no longer depends on the model remembering.** The prompt
says `reply` is "the most useful button on this list and the easiest to
forget", and then asks a model to remember it — on a chain whose whole design
is that any vendor may be serving, including a small free one having a bad
minute. When the paste was deterministically recognised as a message addressed
to the reader, the offer is added by the harness (`withReply`) rather than
hoped for. It goes first, so the cap drops something the model guessed at
instead of the one move we are sure about.

**The rephrase axes grew from six to eleven**, and the five new ones are not
more tone dials. Six dials say the same thing differently; `decline`,
`apologise`, `thank` and `ask` change what the message DOES, and they are the
four a learner most often cannot perform in a language they half-have.
`decline` matters most and no phrasebook teaches it: saying no to a landlord
without giving offence is hard in your own language, and in a second one people
either agree to things they did not want or write something that reads as rude
and never find out. `ask` is the move for post that is too ambiguous to answer
— asking is allowed, and learners rarely believe it is.

**Built: the reference pages do something.** `/vocabulary` was two columns of
text, sixty times, and `/grammar` was a page to read. Everything the product
knows how to do with a word — keep it, ask it back at the right moment, meet it
in a new sentence — already existed and was reachable only from inside a chat
answer. Both pages now hand work to the assistant through one event
(`lib/browser/ask.ts`), and what they send is an ordinary sentence that lands in
the transcript as the reader's own message. There is no hidden prompt channel
anywhere in this product: a turn you cannot see is a conversation you cannot
re-read.

**Built: what a computer can and cannot do with this language, published.**
§8 is an overclaim register — a list of things this product must not say, the
largest of which is that it transcribes dialect. The strongest form of that
discipline is not a promise to be careful; it is publishing what the field can
actually do, with the numbers, so a reader can hold our claims against it.

`/technology` is that page. Five public speech corpora with their hours,
speakers, regions and licences; three ASR results as word error rate on one
test set so they can be read against each other; four speech-synthesis systems;
three language models. Every row names a paper, and the thirteen new sources
were each opened and checked against the claim they support.

The central fact is visible in the table without a word of argument: almost
every Swiss German speech corpus pairs dialect SPEECH with STANDARD GERMAN
text, because in a diglossic country writing down what was said is a
translation task rather than a transcription one. That is why "Swiss German
speech recognition" nearly always means "produces Standard German", and why
Heidi's dictation does too.

Three things the page says that a product page would not:

- The best Swiss German word error rate we could verify is 12.1%, and those
  weights are not published.
- Most voices sold as "Swiss German" are Swiss STANDARD German — the written
  language read aloud. Real dialect synthesis is research prototypes.
- Apertus, Switzerland's open LLM, carries a Swiss German component of 6,000
  post-training examples and publishes **no dialect evaluation at all**. The
  table marks it `dialect not evaluated`, which is the difference between a
  claim and a result.

Its numbers live in `lib/research/language-tech.ts` and not in the
dictionaries, for the reason the citations do not either: a figure is not
translatable, and seven copies of "343 hours" are seven chances for one of them
to become 340. The English `note` on each row is maintainer copy and is
deliberately NOT rendered — `providers.ts` already records what happens when an
English source-copy field reaches a component.

**Built: the explanation arrives as it is written.** Every answer used to
appear at once, after a silent wait of up to 25 seconds.

**Only the explanation streams, and that is a safety property rather than a
scoping decision.** `text` is prose in the reader's own language, and §6's gate
must not judge it — it would flag ordinary German words. Everything the gate
DOES judge waits for `parseAnswer`: the dialect line, the suggestions, the
invented-correspondence strip, the gloss-against-itself drop, the
degenerate-loop refusal. A learner cannot audit dialect (§2), so a form shown
before it has been checked — even for a second, even unmarked — is the failure
this product exists to prevent. The prose streams; the language waits for the
checker.

That needed a primitive the repo did not have. The answer is a JSON object, so
raw tokens read `{"mode":"understand","text":"Sie f`. `extractJson` already
repairs truncated JSON and is no use here: it repairs by cutting back to the
last COMPLETE value, so a string still being written is discarded entirely and
the explanation would appear in one jump when its closing quote arrived.
`lib/domain/chat/partial.ts` reads a half-written string instead — a real scan
tracking string state rather than a regular expression, because the one thing
people paste into this product is text they did not write, and that is
occasionally JSON. Its test asserts the property streaming actually needs:
every prefix of a real answer is showable, never leaking a quote, a brace or
half an escape.

It is an OBSERVATION on the existing turn, not a second path — `respondInThread`
takes an `onText` and swaps `complete` for ai-kit's `completeStream`; threadkit
still decides whether Heidi speaks and every guard still runs on the whole
answer. One route, too: the rate limit, the input ceiling, the picture checks
and the history rebuild are the part that must not diverge, so only the reply
shape branches, at the last possible moment. Tests assert the guards hold
through both shapes.

A streaming turn always ends with a terminal event. A stream has sent its
headers by the time anything goes wrong, so it cannot report a status — and a
stream that merely stopped would be indistinguishable from a vendor dying
mid-sentence, which is the likeliest failure here. Silence is not a status.

ai-kit stops falling back once a link has produced its first token, because
replaying from a second vendor would make the reader watch the answer restart.
A break after that is `StreamInterrupted` and reaches the reader as an ordinary
failed turn: half an explanation with no gated dialect under it is not an
answer, so the partial is discarded rather than kept.

**And now there is a place to open your mouth.** Study groups were a thread
with more than one human in it; speaking rounds are the same social object with
the medium changed, which is the half a diglossic variety otherwise gives away
for free. Two shapes, because the difference is social and decides the
capacity: a **webinar** is one voice and an audience, a **circle** is everyone
in turn and holds eight. Topics are **proposed by the people who would come**,
not programmed — the one thing a language school cannot buy is a room of adults
who want to talk about the thing on the board, and the cheapest way to get it
is to stop choosing the thing.

"Regularly" is a field rather than a row somebody remembers to create, and that
made this a time-zone problem rather than a scheduling one. A round is an
absolute instant; a repeat is a wall-clock promise. Those disagree twice a
year, and adding 7 × 86,400,000 ms to a Tuesday in March produces a Tuesday at
20:00 and an empty room. So the recurrence is computed in the zone's calendar
and converted back, and the tests cross both Swiss changeovers in both
directions. Sittings are COMPUTED, never stored: a table of generated
occurrences is a table extended by a job nobody notices has stopped.

**Heidi does not carry the meeting.** `meetingUrl` is an https room the host
already has — and https only, because that string is rendered as a link for
every attendee, so accepting the scheme as given would accept `javascript:`.
Building an SFU is not this product. What Heidi owns is the part nobody else
does: the topic, the repeat, who is coming, and the take you record around it.

**And the take is where §8 had to be obeyed rather than quoted.** The obvious
build for "evaluate my speaking" is a pronunciation score, which the overclaim
register bans by name, and §7 says why it would be worse here than anywhere:
Swiss German ASR is unsolved, the honest figure is ~25.6% WER, and the state of
the art transcribes dialect INTO Standard German — it translates away the exact
thing being learned. A score on top of that is a number with nothing underneath
it, handed to the one person who cannot check it.

So the evaluation is three things that are each true:

1. **The signal is measured, in the browser.** How long there was sound, where
   the gaps fell, the longest one, whether the microphone clipped. Arithmetic
   over samples — reproducible, checkable by anyone with the same audio, and
   true whatever language was spoken, which is why it works for Lesya
   unchanged. Nothing in it knows what a phoneme is. A test asserts no field of
   the result reads as a rating, because the way that ban gets broken is not
   somebody disagreeing with it — it is a well-meaning `score` field appearing
   because a designer wanted one number for the card.

   The measurement also now prints the LENGTH OF THE RECORDING beside the time
   spent speaking, and that is a correction rather than an addition. "You spoke
   for 16 seconds" is not one finding, it is two — a complete short answer, or
   a microphone that stopped hearing — and the screen printed it with no
   denominator anywhere on it, so a learner had no way to tell which they were
   looking at. Same defect, same class as the overclaim register: a number
   presented as more settled than it is.

   And a real bug sat under it. A cough, a breath or a lip smack inside a long
   silence is a run of sound too short to be speech; the segmentation discarded
   it as a run while still letting it END the gap before it and START the gap
   after, so ONE silence of 1.9 s was reported as two of 0.9 s. The count
   inflated, the longest pause understated, and `pauseCount` was free to exceed
   `runCount` — impossible for gaps that by definition sit between runs. Seen
   on a real take: 16 s of speech with 14 pauses and a mean run of 1.5 s, which
   is about eleven runs with fourteen gaps between them. Fixed by dropping the
   blips before segmenting rather than during, and the invariant is now a test
   rather than a property of the loop.
2. **The learner writes down what they said**, and the honest reason is on the
   screen: nothing transcribes this dialect, and a machine transcript labelled
   "what you said" would be wrong in precisely the way they could not detect.
   The friction buys the only version of this feature that is not a lie, and
   writing it out is a retrieval act rather than dead time.
3. **Their own words go through the deterministic gate** (§6), then one model
   suggestion on top of text they confirmed — gated like every other generated
   line. Only `foreign` findings survive: a real form of another variety is a
   word-choice fact with a spoken correlate, while `unattested` findings are
   orthographic and there is no way to SAY a `ß`. Flagging one would be telling
   somebody their spelling is wrong in a variety with no standard spelling,
   which §6 forbids outright.

The pause threshold is 250 ms, for a phonetic reason rather than a tidy one:
the silence inside a `t` is tens of milliseconds, so a lower threshold reports
a person's own consonants back to them as hesitation. Where the sound/silence
threshold is ambiguous the code takes the reading that finds MORE speech and
therefore fewer pauses — between a measure that flatters and a measure that
accuses, the honest failure is the one that flatters, because a pause we missed
costs nothing and a pause we invented is the product telling somebody they
hesitated when they did not.

Comparisons are with the learner's own previous take, need a difference beyond
measurement noise, and are refused between takes of wildly different lengths.
Both directions are reported; a product that only reports improvement is not
measuring anything.

**The stated limit has been closed, and it was closed by asking a question the
product had already answered.** This paragraph used to say that offering a
machine transcript where one would be trustworthy was NOT built, because no
pack with usable recognition had a deployment to test it against — build it at
the second consumer, not the first.

That was wrong about its own pack. `packs/gsw-zh.ts` declares
`bridgeRecognition: { available: true, returnsSpokenVariety: true, wer: 6.4 }`,
`evidence.ts` reads that as `words`, and `capability.ts` had been computing a
verdict of `bridge` for fluency, vocabulary and grammar the whole time. The
second consumer was never needed: the first pack was already two varieties, and
Zurich is diglossic, so the German a learner must actually speak at a doctor's
desk, a Verwaltung counter or an insurer's phone line IS the one with a
faithful recogniser. Everything except the branch that offered it existed and
was unit-tested. `lib/speech/fluency.ts`, `syllables.ts` and `grammar.ts` had
no importer in the app at all.

So the practice screen now asks which variety this take is in, and the answer
decides what may be said about it:

- **Züritüütsch** — unchanged, and the default. The signal is measured on the
  device, the audio never leaves it, the learner types what they said. §7 in
  full force.
- **Swiss Standard German** — the recording goes once to a recogniser, the
  transcript comes back as the learner's own words, and speech rate,
  articulation rate, filled pauses and the gate all have something to work on.
  Then `dialect-marker.ts` checks the vendor's answer on every take, so "you
  used dialect words while practising Standard German" is a finding rather than
  a silence — and so a vendor that quietly starts translating is caught by the
  product rather than by a lab.

Nothing in that branch names a language. `lib/domain/speaking/varieties.ts`
asks the pack; a pack whose TARGET recogniser becomes faithful — the Swiss
dialect-preserving vendors in `lib/research/language-tech.ts`, the day somebody
tests one — gains all of it by editing one object, and a pack with neither
renders no switch and the screen is exactly what it was.

**What did NOT change is the ban.** There is still no pronunciation score, in
either mode, at any word error rate. `capability.ts` marks it `refused` rather
than `none` precisely so that a future contributor reading the verdicts as "not
yet" does not implement it when the WER drops. A rate is a measurement of an
utterance; a nativeness score is a judgement about a person.

**And the rate is reported as a PAIR, never as a number.** Speech rate and
articulation rate separate two problems that feel identical from inside and
have opposite fixes: equal articulation with a slower speech rate is somebody
who has the words and is hunting for them, which is answered by saying the same
thing again immediately. Neither is compared with a norm, because no norm
exists for an adult talking about a topic they chose, on a phone, in this
language — and inventing one for a progress bar is the false precision §8
forbids wearing a lab coat. Where the two rates do not separate, the screen
says nothing.

**Built: the spoken channel, and the gate that had to come with it.** The
product could read and write a language that is mostly heard. Three things
changed that, and the third is the one that took the thinking.

*Heidi speaks.* A speak control sits beside every copy control — on the dialect
line and on each suggestion, which are the lines a learner has to produce and
the ones "what does this actually sound like" was unanswerable for. The
browser's own synthesiser, for the two reasons dictation chose it in the same
order: free and instant, and no text leaves the device to be read back.

*And she says what she is speaking with.* No browser ships a Zurich voice —
`de-CH` is Swiss Standard German — so `lib/voice/variety.ts` is the variety
gate for sound, and has no path that returns `dialect` at all. That is not an
omission for a later commit to widen; it is the claim the module exists to
refuse, and a test feeds it plausible Swiss-sounding voice names to prove it.
The claim rides in the flow of the page rather than a tooltip: phones have no
hover, screen readers announce it last, and the learner cannot hear the
difference, which is the whole reason they are here.

*Correction is a setting with three rules above it.* Never spelling, because
there is no correct one (§6). Never pronunciation, and that is structural
rather than principled — the correction path receives no audio, no confidence
and no alignment, so a percentage would have to be invented. And never the
forms in a transcript, which is the one that is easy to get wrong and silently
ruins the feature: §7.4 says recognition transcribes dialect into Standard
German, so a learner who said `isch` and `nöd` perfectly gets back `ist` and
`nicht` and would be corrected, confidently and in detail, for being right. So
speech is not variety-checked at any level, and the three silences — you turned
this off, this cannot be judged, you made no mistakes — are told apart rather
than collapsed into a blank space.

**Two correction surfaces, and they disagree on purpose.** `feedback.ts` judges
a spoken take the learner WROTE DOWN, and keeps only `foreign` findings: an
`unattested` finding is orthographic and there is no way to say a `ß`.
`lib/voice/correction.ts` judges typed text, where orthography is exactly what
the learner produced and `unattested` is the most certain judgement available,
so its default keeps that and nothing else. Same gate, two surfaces, two
defensible mappings. Both files say so, because the next person to meet them
will reasonably assume one is a copy of the other.

**Built: where to hear it, as a register.** The recordings the listening lab
waits on do not exist yet. The largest source of dialect exposure in the world
does, and it needs no corpus and no licence: the media the Swiss already make
for themselves. `lib/listening/sources.ts` is fifty of them — podcasts, radio,
YouTube, television, series and films — and what makes it more than a list of
Swiss channels is that every row says WHAT IS SPOKEN.

That is the same lemons problem §6 built the gate for, one level up. Swiss
media splits along the diglossia in a way nobody tells a learner: the evening
bulletin is read in Standard German and the magazine after it is in dialect.
Somebody sent to the Tagesschau to practise Swiss German gets an hour of the
German they already have, concludes this is easy, and is no closer to the lunch
table.

`basis` is required on every row and `listened` is claimed nowhere, because
nobody here has sat down with these programmes and written down what they
heard. A test fails the moment a row claims it, so the day somebody spends that
afternoon, the page copy has to change with it. There is no difficulty number
anywhere — what is written down is observable (how many voices at once, read or
spontaneous, whether publisher subtitles exist) and `demand()` derives an
ordering, so an argument about the ordering is an argument about four weights
in one place.

Two things the register knows that a reader would not: the famous Swiss films
and series are mostly BERNESE, so working through them trains a Zurich learner's
ear on a dialect two hours away; and Zurich material specifically is scarce —
four rows against a dozen pan-Swiss ones, which is why `area` is a preference
in the flow and never a filter.

Kept honest by `scripts/check-listening-links.mjs`, which has three verdicts
rather than two: a Cloudflare challenge is not a dead link, and only GONE fails
the run. Its first pass caught `youtube.com/@srf3` answering 200 under the name
SRF Unterhaltung, and its own normaliser calling TeleZüri a mismatch because it
decomposed the umlaut to a bare `u` where the publisher writes `ue`.

**Built: where you need it, and the claim it was standing under.**
`/situations` holds six scenes from a care shift — handover, the morning, pain,
meals, the evening, visitors — sixty lines with their Standard German beside
them, each marked `hear` or `say`, each linking the grammar topic it turns on.
Twenty-seven of them became practice items, which took the pack's question
count from forty to sixty-seven.

It was built in this order for a reason that is worth recording as a fault
rather than a feature. `sectors.ts` had been telling a Heimleitung since it
shipped that Heidi "practises the sentences that are actually said on your
ward" — and the product held forty-eight words, of which none was said on a
ward. That is the §8 failure exactly, on a live public page, ours. The fix was
not to soften the sentence. It was to build the thing and then say what it
actually is: sixty lines WE wrote for six scenes, machine-checked for Zurich
forms, unread by any native speaker — and to put a link on the sales page
straight to them, so a care-home director can judge the content in two minutes
rather than take a sentence's word for it. A sector row with proof links to it
and a row without one does not, and that asymmetry is now the most useful thing
on `/organisations`: it is how a reader tells which of the six we have actually
built for.

**Next**, in order: capture what the learner did not know into a learner model —
**the existing Heidi GPT generates that evidence daily and throws all of it
away**, and every question asked of it is a labelled datapoint about what a real
learner could not understand; then the listening lab, once there are recordings
to put in it.

Three loops explain Heidi better than any feature list:
Three things the spoken channel now makes concrete, in the order they are worth
doing:

1. **Listen to the register and flip `basis` to `listened`.** It is the
   cheapest real improvement available to this product — an afternoon per dozen
   programmes, no corpus, no licence, no model — and it converts forty careful
   inferences into forty facts.
2. **A verified dialect voice.** §7.2 says at least one vendor advertises
   commercially-cleared Züridütsch, unverified by us. Verifying one would be
   the first time Heidi could speak the language she teaches; the gate is
   already built to receive it, and nothing else has to change.
3. **The listening lab**, which is where the register and the recordings meet:
   a source a learner can already reach, a measurement of what they caught, and
   the same speaker-change effect the two loops below describe.

### The exercise track, in order

Practice is the half of this product that decides whether anybody comes back,
and it is the half where guessing is least excusable: every decision below can
be argued from the FACT list above, and where it cannot, it says so.

**Built, and cited on `/practice` itself** — the page explains its own design
with links, because the person reading it has just been told they got something
wrong and is entitled to know whether the thing telling them knows anything.

1. Asked, never shown first *(Yang 2021)*.
2. Expanding intervals, 1/3/7/16/35 days, ending rather than growing *(Kim &
   Webb 2022)*. No SM-2, no FSRS: eleven kept words cannot support a fitted
   curve, and §8 forbids that kind of false precision.
3. A missed item returns three questions later, once *(Rawson & Dunlosky 2011;
   Butler & Roediger 2008)*. The gap of three is ours. The schedule hears the
   FIRST answer only — a word got right a minute after being revealed has not
   been retrieved, and grading it again would inflate the very interval the
   spacing is for.
4. No two item kinds in a row *(Brunmair & Richter 2019, with its moderator
   stated rather than suppressed)*.
5. Five item kinds, two of them objective. Anything needing a model to mark it
   is not an exercise type, because Zurich German has no settled orthography
   and marking a typed answer means deciding whether a near-miss counts.

**Built since: the reference section became navigable, and practice became
addressable.** Four changes that are really one change.

*Scope.* `/practice?topic=…`, `?scene=…`, `?group=…`. Every reference surface
now opens a sitting about ITSELF — the grammar topic just read, the scene just
skimmed, the group of words on screen. It is a filter over existing items
rather than a generator, because `ItemSource` already recorded where every
question came from; the field built to make a wrong answer traceable turned
out to make a pool addressable. A topic scope unions the topic's own examples
with the real scene lines that turn on the same rule, so the situation packs
deepen the grammar section automatically.

*Grammar as pages.* `/grammar/<topic>`, indexed by BAND — `blocks` (the
sentence does not survive) and `marks` (it survives, you do not). That division
was in the page's lead from the first day and was carried entirely by the order
of a list; it is now a field, two headed sections, and a card per topic showing
its first contrast. The topic page adds what a section could not hold: practise
this now, where it actually comes up, and previous/next within the band.

*Vocabulary as something you can find a word in.* A filter over BOTH languages
(you meet the German word in your head first), jump links, a scoped sitting per
group, and — for the words that have one — the scenes where the word is said,
joined whole-word because `si` lives inside `isch`.

*Two new exercise kinds, both objective, neither inventing language.*
`match` is four words and four meanings; `gaptext` is a four-line passage from
a scene with three words lifted out and offered back. The word bank is what
makes a passage objectively markable in a variety with no settled spelling: the
learner chooses rather than spells, every option is a real form from the
passage, and the key is which hole each came out of. Both shuffle by ROTATION,
which is a derangement for free and keeps the board reproducible.

*Refused, and it is a decision rather than a backlog item:* a word-order
exercise. Reconstructing a scrambled sentence is the obvious next shape and it
cannot be marked honestly here — this variety tolerates more than one order,
and an item that calls a valid alternative wrong would be §6's failure in a new
place, aimed at the one person who cannot detect it.

**Built: progress on more than one device, certificates, and teams — all opt-in.**
Off by default and offered only signed in. When a learner switches sync on,
each device keeps only what it observed and the server keeps each device's
record apart; pages show the sum, so nothing is counted twice
(`lib/domain/progress/sync.ts`). Switching off removes that device's copy; one
button deletes all of it. A certificate is issued by the SERVER from the synced
record, by the same rule the situation page shows (`strengthOf`, only at
"sure"), and its public page carries no name. In a team, each member decides
whether the organiser sees their standing per situation — never which lines or
answers (`lib/domain/teams/overview.ts`). The default of §2 stands: without
those switches, nothing about what a person cannot understand leaves their
browser.

**Built: the system knows what you keep getting wrong.** A learner model, in
the browser, beside the kept words and for the same reason HEIDI.md gives for
those: it keeps Heidi from holding a record of what a particular person cannot
understand. It reads `ItemSource` and keeps a miss rate per topic, scene, word
group and rule, and it does two things with it — reorders every sitting so the
weak half leads, and names the two or three areas worth going back to with a
link straight at them.

Three properties make it defensible rather than a score. The rate is SHRUNK BY
SAMPLE SIZE (`rate × asked/(asked+3)`) — the obvious smoothing let one wrong
answer out of one outrank a topic missed nine times in twenty, and a failing
test is how that was found. It hears the FIRST answer only, like the review
schedule, so nobody can talk their weakest topic out of the model by being
shown the answer and repeating it. And the ordering is BANDED rather than
continuous, so a bad area cannot own every sitting.

It shows no number anywhere: no percentage, no miss count, no level. §8's rule
is that this product measures how much of an unfamiliar Zurich speaker you
understand, and a miss rate rendered at a person is a score whatever it is
called. The diagnosis points at the MATERIAL — "these keep catching you out",
with the topic named and a session offered. Declared on `/privacy` and
deletable from `/settings`, along with the seen-history, which had been
undeclared since the exercises shipped.

**Built: one module per exercise kind, and a registry.** `lib/domain/practice/
kinds/` — a file per kind, each declaring its id, its marking, whether the
SERVER can generate it, and how. Adding `match` had touched five places, three
of them invisible until something went wrong and one of them a bug shipped in
the same commit as the feature (the keyboard handler fell through and answered
a matching item correctly on a single Enter). A kind is now a file and a line
in `registry.ts`. The shared text operations — which word to blank, whether the
clue gives it away — live in `kinds/text.ts` so the second gapped kind could
not fork them.

The registry's contract test found a real defect on its first run: cloze ids
were `cloze:<topic>:<word>`, and two examples of one topic that blank to the
same word produced the SAME id. Ids key the seen-history, so answering one
marked the other asked and one of the two was never served again — invisible,
because both items exist and both are correct.

**Built: enough material that the questions stop repeating.** The complaint was
arithmetic, not scheduling: eight questions a sitting out of sixty-seven items
means meeting the same ones within the week, and no shuffle fixes that.
`everyday` is the second domain — the shop, the tram, the stairwell, the
telephone, the lunch table — and the vocabulary gained the short words no
correspondence rescues (`grad`, `äbe`, `gäng`, `aalüte`) plus paradigms for
`si`, `gah` and `cho`. Those three earn a table by the same standard `ha` set:
every form already appears in a sentence the packs publish, so the table is a
reorganisation rather than four new claims. `gsi` is in it because it carries
every past tense in a variety with no preterite.

Practice items went **67 → 195**, scenes 6 → 14, lines 60 → 140, vocabulary
48 → 83 and grammar topics 8 → 11 — and the pool stopped being three quarters
one kind. Article questions alone went 3 → 24, which is the cheapest exercise
the pack can grow: gender is the error a German reader is least able to avoid,
because it is carried by a word they never had to learn.

Three of the new topics are `question-words`, `indefinite-article` and
`imperative`, and each names something the packs had been teaching by example
without ever saying: `wänn` heard as German `wenn` turns a question into a
condition, the article `es` is identical to the pronoun `es`, and the polite
imperative ends in `-ed` rather than `-en`.

**Built: the two kinds the material was asking for, and typing that is not
marked.**

*Coverage was the problem, not variety.* Measured: the pack's twenty-six
function words produced SIX questions between them, because they carry no
article and no paradigm, so the only generator that could see them was the
matching grid. They are the words `/vocabulary` argues buy the most
comprehension, and they were the least practised thing in the product.

`pick` is a real pack sentence with one word cut out and four real words
offered. What makes it objective is the bridge printed underneath: several
options will produce a perfectly good Zurich sentence — that is what function
words are like — and exactly one of them makes the sentence mean the German.
The learner can check the verdict against the evidence rather than take it.

Its distractors are filtered by a rule worth stating: a candidate's own gloss
must not appear in the bridge. Without it the generator eventually offers
`nüme` ("nicht mehr") against a German line containing "nicht mehr" and marks a
defensible answer wrong, which is the single thing an objective item may never
do. A test asserts both halves — the answer's gloss present, every distractor's
absent.

Function-word questions went **6 → 32**, and the pool to 221.

*And the reveal button stopped being the only control.* A learner could press
it and read the answer without attempting one — the retrieval this page exists
for, skipped in a keystroke. There is now an optional field to write the answer
in first.

Nothing compares what they wrote to what the pack says. §6 is why: a machine
that judges typed dialect eventually tells somebody their spelling is wrong
when it is not, in a variety where they cannot argue back. What typing adds is
the COMMITMENT — the answer is out of your head and on the screen before the
real one appears — and the two are then shown one above the other with no
verdict between them. That is the same information and none of the false
authority.

**What comes next lives in one place: the public roadmap, `lib/config/roadmap.ts`,
rendered at `/roadmap`.** This section used to hold a second, numbered copy of
it, and that copy went stale twice without anybody noticing — its first item
had largely shipped (#117), and its refusal of "percentages and levels"
contradicted §3 while "10 of 10 lines" was already live. A list in prose drifts;
the roadmap is typed data that a test can hold. So this section keeps only the
REASONING behind the order:

- **The situation is the spine.** "I understand Swiss German at the doctor's"
  is the claim a learner wants to make and an employer wants to buy, so
  situations get deeper before anything gets wider — and the certificate, when
  it comes, is per situation, never "Swiss German, level B1".
- **Individuals and organisations are one product.** Care homes, hospitals
  recruiting from Germany, relocation firms and employers of people who moved
  here buy the same situations their people practise. Teams, workplace packs and
  per-situation certificates are the organisation side of features that exist
  for one person.
- **Motivation without guilt.** Streaks and weekly goals, framed as gain — §3.
- **The productive direction**, meaning → dialect, once a word has survived a
  few reviews: recognition first (§1), production when it has something to
  stand on *(Bertsch 2007)*.
- **Multi-talker listening** is the best-evidenced method available
  *(Lively 1993; Clopper & Pisoni 2004)*, and it is built on real dialect audio,
  never a Standard German voice reading dialect spelling (§7.2, §8).
- **Wider, for everyone in Switzerland.** Other dialects, and a detector that
  tells anybody where a sentence comes from, make Heidi worth opening for people
  who already speak Swiss German.

INTERNAL, NOT ON THE ROADMAP: content is machine-verified against Zurich forms
(the gate, cross-model checks, the Idiotikon); a native speaker's read would
strengthen it further. It is noted here and nowhere public.

Two loops explain Heidi better than any feature list:

> Upload a real message → understand it → reply naturally → learn one thing from
> it → meet that thing again later.

> Hear a real Zurich speaker → half-fail → get one cue → understand a
> *different* speaker better.

> Say it out loud → see what the recording actually shows → write down what you
> said → find the one word that was not from here → say it to someone next week.

Note what the third loop does not contain: a mark out of ten. It ends in a
room with other people, because that is where speaking a language happens and
a score is what a product offers instead.

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

**Your voice never reaches us at all, and where it reaches anyone it is
because you chose that take.** A recorded take is decoded and measured in the
page that recorded it. What is KEPT is a handful of numbers and your own
write-up of what you said, in your browser, under `heidi.takes.v1` — there is
no audio table and no upload endpoint that stores anything, in any mode.

On the dialect the audio is then dropped and never sent. That is the default,
and it is enforced rather than remembered: `useRecorder` hands the recording
back only under `retainAudio`, which defaults to false and is fixed for the
take before the microphone opens, so there is no path from "recorded without
it" to "uploaded anyway". A test asserts both the default and the gate, because
the sentence above is one deleted ternary away from being false and neither the
UI nor a unit test would show it.

Practising the bridge is the one mode that sends the recording, once, to be
transcribed — and it exists because the transcript is worth something there and
is worth nothing on the dialect (§7.4). It is a per-take choice with its
consequence printed beside it, and the privacy line under the screen changes
with the mode rather than describing the friendlier half of it.

This is the strongest version of the call `image_count` already made, and it is
not a flourish. A table of how somebody sounds when they are bad at a language
is worse than a table of the words they looked up, and this section opens by
naming voice notes among the most private things a person owns. The cheapest
way to honour that is to never hold one — there is then no breach to have, no
retention policy to write, and no paragraph here that could later turn out to
be untrue. The cost is stated rather than hidden: clear your browser data and
your recordings' history is gone, and it does not follow you to a second
device. That is the same deal saved words make, and it is the right way round.

The one thing that does leave the device is the sentence you typed, when you
press the button asking for a suggestion — one request, answered and not
stored, exactly like a signed-out chat.
