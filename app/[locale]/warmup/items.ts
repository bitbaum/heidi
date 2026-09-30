import { PACK_ITEMS } from "@/lib/domain/practice/published";
import { LADDER, OPENER } from "@/lib/domain/warmup/ladder";

/** Only the warm-up's own questions travel to the browser, not the whole pool. */
const WARMUP_IDS = new Set([OPENER, ...LADDER.flat()]);
export const WARMUP_ITEMS = PACK_ITEMS.filter((item) => WARMUP_IDS.has(item.id));
