import { notFound } from "next/navigation";

/**
 * Every address under a locale that no page claims.
 *
 * Without this an unknown path matches no route at all, and Next answers it
 * from outside the locale layout: none of the layout's metadata applies, so
 * the 404's share image was emitted against `http://localhost:3000`. Matching
 * the path here and refusing it puts the 404 inside the layout, where
 * `not-found.tsx` and its head tags are the ones served.
 */
export default function UnknownPage() {
  notFound();
}
