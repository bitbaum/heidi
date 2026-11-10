/**
 * The push services browsers actually hand out, by host.
 *
 * The server POSTs to whatever endpoint is stored, so an endpoint is an
 * outbound request somebody else chose. "Any https URL" let a signed-in
 * person point the box at an address of their choosing, inside the network
 * included. Every browser that can subscribe gives one of these.
 */
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^([a-z0-9-]+\.)*push\.services\.mozilla\.com$/, /^([a-z0-9-]+\.)*push\.apple\.com$/, /^[a-z0-9-]+\.notify\.windows\.com$/];

export function isPushService(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && url.port === "" && !url.username && PUSH_HOSTS.some((host) => host.test(url.hostname));
  } catch {
    return false;
  }
}
