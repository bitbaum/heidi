import type { EssayText } from "../../../lib/essays/types.ts";

export const en: EssayText = {
  title: "Why Switzerland kept its dialects",
  lead: "A country of eight million speaks dozens of dialects while its large neighbour has largely given its own up. It is not the mountains.",
  blocks: [
    {
      kind: "p",
      text: "Someone who moves to Zurich from Germany usually has the same experience: German learned, German examined, German spoken — and still nothing understood at the ticket counter. The handy explanation is that Switzerland is mountainous and was remote, and that old forms survive in remote valleys. It sounds right and explains very little. Austria is at least as mountainous. So is Norway. And Switzerland's densest dialect differences are not in the Alps at all; they are in the flat Mittelland between Basel, Bern and Zurich.",
    },
    {
      kind: "p",
      text: "The better question is not why Switzerland **kept** its dialects but why Germany stopped speaking its own. That is the departure. A dialect continuum across central Europe was the ordinary state of affairs; a population that speaks a supra-regional written language in everyday life is the innovation.",
    },
    { kind: "h", text: "Two languages, two jobs" },
    {
      kind: "p",
      text: "What German-speaking Switzerland has is what linguistics calls diglossia: two varieties of one language with cleanly separated jobs. Speech is dialect — everyone's, at every level, in the cantonal government and on the building site. Writing is Standard German: laws, newspapers, schoolbooks, the letter to the insurer. [Ferguson](https://doi.org/10.1080/00437956.1959.11659702) named the pattern in 1959, and German-speaking Switzerland was one of the four cases he described it from.",
    },
    {
      kind: "p",
      text: "What matters is what diglossia is **not**. It is not a gradient from educated to uneducated. In Germany, dialect became marked — rural, unschooled, something to put down. In German-speaking Switzerland the dialect is the unmarked, ordinary way of speaking, and Standard German is the marked one: using it among locals signals something, usually distance, or that an outsider is present.",
    },
    {
      kind: "pull",
      text: "The difference from Germany is not that more dialect is spoken here. It is that dialect here says nothing about which class you came from.",
    },
    { kind: "h", text: "How it happened" },
    {
      kind: "p",
      text: "The division of labour is old. The Reformation brought printing and with it a supra-regional written language, which German-speaking Switzerland adopted as a **written** language without letting it displace the spoken one. What followed elsewhere in the German-speaking world — a court, a capital, a stage, all lending prestige to a spoken norm — did not happen here. The Confederation had no princely court, no residence city, and until 1848 not even a capital. There was simply no place whose pronunciation everyone else was supposed to imitate.",
    },
    {
      kind: "p",
      text: "The nineteenth century added the second difference. Elsewhere, nation-building turned the written language into a spoken one: school, barracks, administration and railway spread a norm against which dialects wore smooth. Switzerland built its state on the opposite principle. Where competence stays with the cantons — and schooling did — there is no office that could impose a spoken norm, even if anyone had wanted one.",
    },
    {
      kind: "p",
      text: "Then, in the twentieth century, Standard German had a problem in Switzerland that it had nowhere else: it was the language of the large neighbour, and the large neighbour became a threat. Through the 1930s and 1940s the movement known as [Geistige Landesverteidigung](https://hls-dhs-dss.ch/de/articles/017426/) set itself the explicit task of marking off what was Swiss from what was German, with radio and film as its main instruments. It would be too neat to say the dialect was invented or rescued then; it was being spoken regardless. But in exactly those years something taken for granted turned into something declared.",
    },
    {
      kind: "p",
      text: "What came after is well documented: the dialect moved into the places it was vanishing from in Germany. Radio and television broadcast in it, advertising uses it, teachers speak it in the classroom beside a Standard German textbook. The Historical Dictionary of Switzerland describes the result as [media diglossia](https://hls-dhs-dss.ch/de/articles/024596/) — the division of labour did not survive mass media so much as capture it.",
    },
    { kind: "h", text: "What about Austria?" },
    {
      kind: "p",
      text: "Austria is the control case, and it argues against the mountains. Austria's Bavarian dialects are alive, but Vienna was an imperial residence and capital for centuries, and a capital with a court produces a spoken norm the country orients itself towards. Precisely what the Confederation lacked, Austria had in abundance. Liechtenstein, by contrast — Alemannic, small, with no centre of its own — behaves like Switzerland.",
    },
    {
      kind: "p",
      text: "A pattern suggests itself: what preserves dialects is not topography but the absence of a centre radiating a spoken norm. We find that plausible and are calling it a conjecture on purpose. It is a claim about political history rather than about sounds, and the sources below cover the language situation, not the causation.",
    },
    { kind: "h", text: "And why you still cannot understand any of it" },
    {
      kind: "p",
      text: "Because this history has a side effect: there is no correct spelling. A language that never had to be written down never acquired an orthography. Two people write the same word differently and both are right — which is why Heidi never tells you your spelling is wrong, only how we write it. More on [the method page](/en/method).",
    },
    {
      kind: "contrast",
      caption: "And because the lines run through the country rather than around it:",
      rows: [
        { left: "Kind", right: "Chind", note: "Basel, and everything south of it" },
        { left: "schneie", right: "schniie", note: "the Mittelland, and the alpine valleys" },
        { left: "gäll", right: "gäu", note: "Zurich, and Bern" },
      ],
    },
    {
      kind: "p",
      text: "Which dialect is spoken where, and how to recognise it, is on [the dialect page](/en/dialect). Zurich German is the one you learn here — and Heidi tells you when a form comes from another valley instead of pretending there is only one.",
    },
  ],
};
