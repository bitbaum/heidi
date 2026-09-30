import { eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { preferences } from "../../db/schema.ts";
import { isLocale, type Locale } from "../../i18n/locales.ts";

/** The language this learner last chose, or null. A retired locale reads as null. */
export async function savedLocale(actorId: string): Promise<Locale | null> {
  const [row] = await db
    .select({ locale: preferences.locale })
    .from(preferences)
    .where(eq(preferences.actorId, actorId));
  return row && isLocale(row.locale) ? row.locale : null;
}

export async function saveLocale(actorId: string, locale: Locale): Promise<void> {
  await db
    .insert(preferences)
    .values({ actorId, locale })
    .onConflictDoUpdate({ target: preferences.actorId, set: { locale, updatedAt: new Date() } });
}
