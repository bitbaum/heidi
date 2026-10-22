import webpush from "web-push";
import type { PushPayload, Subscription } from "../channels/sweep.ts";

/**
 * Web Push, the way Loki does it (loki `src/lib/push.ts`): VAPID keys from
 * the environment, one call per browser, and a 404 or 410 from the push
 * service read as "this browser forgot us" rather than as an error.
 *
 * THE KEY IS READ FROM THE SERVER AT REQUEST TIME, never inlined at build.
 * Loki shipped a phone subscribed against a key the server could not sign
 * for — the push service accepted every message and no phone ever showed
 * one. `/api/push/public-key` hands the browser the same key this file signs
 * with, so the two cannot disagree.
 *
 * Unconfigured is a normal state, not a failure: without the three variables
 * the settings page says notifications are not set up here, and everything
 * else (the page, the "new" markers) works as before.
 */
let configured = false;

export function pushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

export function publicKey(): string {
  return (process.env.VAPID_PUBLIC_KEY ?? "").trim();
}

function configure(): boolean {
  if (configured) return true;
  if (!pushConfigured()) return false;
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT!.trim(), publicKey(), process.env.VAPID_PRIVATE_KEY!.trim());
    configured = true;
    return true;
  } catch {
    return false;
  }
}

export async function sendPush(subscription: Subscription, payload: PushPayload): Promise<{ ok: boolean; dead: boolean }> {
  if (!configure()) return { ok: false, dead: false };
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload),
      // A day: a notification about a video is still true tomorrow, and a
      // phone that was off overnight should get it in the morning.
      { TTL: 24 * 60 * 60 },
    );
    return { ok: true, dead: false };
  } catch (error) {
    const status = error && typeof error === "object" && "statusCode" in error ? Number((error as { statusCode: unknown }).statusCode) : undefined;
    return { ok: false, dead: status === 404 || status === 410 };
  }
}
