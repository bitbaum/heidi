import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { PRACTISABLE } from "@/lib/domain/practice/pool";
import { DOMAINS } from "@/lib/situations/display";
import type { SituationDomain } from "./my-situations";

/**
 * The situations a learner can choose, by domain, in their language — only
 * the ones a sitting can actually be opened on. Server-side: the packs do not
 * travel to the browser, only these titles do.
 */
export function situationDomains(locale: Locale): SituationDomain[] {
  const t = getDictionary(locale).situations;
  return DOMAINS.map((domain) => ({
    id: domain.id,
    title: t.domains[domain.id as keyof typeof t.domains]?.title ?? domain.id,
    scenes: domain.scenes
      .filter((scene) => PRACTISABLE.scene.includes(scene.id))
      .map((scene) => ({ id: scene.id, title: t.scenes[scene.id as keyof typeof t.scenes]?.title ?? scene.id })),
  })).filter((domain) => domain.scenes.length > 0);
}
