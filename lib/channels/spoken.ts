import { LISTENING_SOURCES } from "../listening/sources.ts";
import type { Spoken } from "./source.ts";

/**
 * What the register says is spoken on this source: by the row pressed, by its
 * address — or by its NAME on the same publisher's domain. A show followed
 * through its feed or a podcast app arrives with an address the register does
 * not list (SRF's "Input" is `srf.ch/audio/input` there and an RSS URL here),
 * and "unknown" then hid the one fact that decides what its transcript is.
 */
export function spokenFor(url: string, register: string | null, show?: { name: string; feedUrl?: string }): Spoken | null {
  const same = (a: string, b: string) => a.replace(/\/+$/, "").toLowerCase() === b.replace(/\/+$/, "").toLowerCase();
  const byRow = LISTENING_SOURCES.find((s) => (register && s.id === register) || same(s.url, url));
  if (byRow) return byRow.spoken;
  if (!show) return null;
  const name = show.name.trim().toLocaleLowerCase("de");
  const hosts = [url, show.feedUrl].map(domainOf).filter(Boolean);
  const byName = LISTENING_SOURCES.find((s) => s.name.trim().toLocaleLowerCase("de") === name && hosts.includes(domainOf(s.url)));
  return byName ? byName.spoken : null;
}

/** `www.srf.ch` → `srf.ch`: the publisher, not the page. */
function domainOf(address: string | undefined): string {
  try {
    return new URL(address ?? "").hostname.split(".").slice(-2).join(".");
  } catch {
    return "";
  }
}
