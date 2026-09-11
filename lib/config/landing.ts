/**
 * Every word on the landing page, in one place. The page renders this; it
 * never carries copy of its own.
 */
export const LANDING = {
  eyebrow: "Züritüütsch · Zürich",
  brand: "Heidi",
  headline: "Understand Zurich German. Then text like a local.",
  sub: "For people who already know some German and still understand nothing at the lunch table. Listening first, texting second, speaking last — in that order, on purpose.",
  cta: { label: "Try Heidi", href: "/try" },
  secondary: { label: "Why understanding comes first", href: "#understand" },

  /**
   * The correspondences themselves are NOT here — they are linguistic content
   * and live in the variety pack (`lib/variety/packs/`), which the page reads
   * directly. Copy about them stays here.
   */
  correspondencesNote:
    "A dozen regular rules like these unlock hundreds of words you already own. Heidi shows them one at a time, beside a clip you are about to hear again, rather than as a lecture up front. Honestly: the lecture version is the only version anyone has rigorously tested, and it produced no measurable gain. Ours has not been tested — so Heidi measures it.",

  sections: [
    {
      id: "understand",
      title: "Understand first",
      body: "Listening comes before speaking. In Switzerland, understanding dialect and replying in Standard German is a complete, respected way to belong — and it is the only way to keep the input flowing, because the Swiss switch to Hochdeutsch the moment they notice you struggling.",
    },
    {
      id: "text",
      title: "Text like a local",
      body: "Reply to real WhatsApp and Telegram messages in dialect. Heidi glosses the few words you would miss, offers replies you can pick from, and lets you type your own — because typing it yourself is where the learning actually happens.",
    },
    {
      id: "measured",
      title: "Measured, not gamified",
      body: "Your progress is a real number: how much of an unfamiliar Zurich speaker you understand, before and after. No streaks, no gems, no fabricated scores. If it cannot be measured, Heidi does not claim it.",
    },
  ],

  state: {
    title: "Built in the open",
    body: "Today: this page. Next: the sixty-second ear-change — hear a Zurich speaker, tune in, hear another, and catch measurably more. Every second of dialect you will hear in Heidi is a real person, recorded in Zurich.",
  },

  footer: {
    line: "Built on OrangeCat, in Zürich.",
    link: { label: "orangecat.ch", href: "https://orangecat.ch" },
  },
} as const;
