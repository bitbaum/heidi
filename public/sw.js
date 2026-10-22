/**
 * Heidi's service worker — Web Push only.
 *
 * Root scope, so a notification arrives whatever page is open, or none. It
 * caches nothing and intercepts no request: the site works exactly as it did
 * without it, and a stale worker cannot serve a stale page.
 *
 * Two events. `push` shows the notification the server sent (title, body,
 * where to go); `notificationclick` brings a Heidi tab to the front and
 * sends it there, or opens one.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "Heidi", body: "", url: "/", tag: "heidi" };
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      data: { url: data.url },
      icon: "/icon.svg",
      renotify: false,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.notification.close();
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        try {
          if (new URL(client.url).origin === self.location.origin) {
            await client.focus();
            if ("navigate" in client) await client.navigate(url);
            return;
          }
        } catch {
          /* a client that cannot be read is skipped */
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
