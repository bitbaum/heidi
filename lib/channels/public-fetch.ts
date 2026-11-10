import { defaultLookup, validateFetchTarget, type LookupFn } from "@bitbaum/ai-kit/web";
import type { Fetch } from "./remote.ts";

/**
 * `fetch` for addresses a learner typed or a feed named — the only kind the
 * channels code fetches.
 *
 * WHY. "Follow a podcast" takes any URL, and a feed then names more URLs (the
 * episode audio, the publisher's transcript). With plain `fetch`, a signed-in
 * person could post `http://127.0.0.1:5432` or the cloud metadata address and
 * read the answer back as "not a feed" versus "unreachable": a port scanner
 * inside the box. Every hop, redirects included, is now judged by ai-kit's
 * `validateFetchTarget` (the fleet's one SSRF rule: loopback, RFC 1918,
 * link-local, carrier NAT, … all refused) before a connection is made.
 *
 * AND A CEILING. A feed is somebody else's file; read whole, a 500 MB "feed"
 * or a server that ignores the opening's Range header was held in memory.
 * Past `MAX_BODY_BYTES` the body is cut off. A feed that large fails to parse
 * and reads as not-a-feed; audio keeps its opening, which is all it is for.
 */
export const MAX_BODY_BYTES = 8 * 1024 * 1024;
const MAX_REDIRECTS = 5;

export function publicFetchWith(base: Fetch, lookup: LookupFn = defaultLookup, maxBytes = MAX_BODY_BYTES): Fetch {
  return async (input, init = {}) => {
    let url = input;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      const verdict = await validateFetchTarget(url, lookup);
      if (!verdict.ok) throw new TypeError(`refused to fetch ${safeHost(url)}: ${verdict.reason}`);
      const res = await base(url, { ...init, redirect: "manual" });
      const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
      if (!location) return capped(res, maxBytes);
      await res.body?.cancel().catch(() => undefined);
      url = new URL(location, url).toString();
    }
    throw new TypeError("too many redirects");
  };
}

/** The real one, for routes and the sweep. */
export const publicFetch: Fetch = publicFetchWith((input, init) => fetch(input, init));

async function capped(res: Response, maxBytes: number): Promise<Response> {
  if (!res.body) return res;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const room = maxBytes - total;
    chunks.push(value.byteLength > room ? value.slice(0, room) : value);
    total += Math.min(value.byteLength, room);
    if (total >= maxBytes) {
      await reader.cancel().catch(() => undefined);
      break;
    }
  }
  const body = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) {
    body.set(chunk, at);
    at += chunk.byteLength;
  }
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "an invalid URL";
  }
}
