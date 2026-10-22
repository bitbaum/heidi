"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Web Push for this browser, after Loki's `use-push-subscription.ts`.
 *
 * Register the worker, read the permission without asking for it, and only
 * on a press: ask, subscribe, mirror the subscription to the server. The
 * VAPID key comes from the server at that moment (`/api/push/public-key`),
 * the same key the server signs with — never from the build.
 */
export type PushStatus = "loading" | "unsupported" | "unconfigured" | "denied" | "off" | "on" | "working" | "error";

const SW_PATH = "/sw.js";

function supported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
}

/** iPhone and iPad Safari only push for a site on the Home Screen. */
export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const touchMac = ua.includes("Macintosh") && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(ua) || touchMac;
}

function standalone(): boolean {
  return typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true);
}

export function usePush(locale: string) {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [needsHomeScreen, setNeedsHomeScreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supported()) {
        if (!cancelled) {
          setNeedsHomeScreen(isIos() && !standalone());
          setStatus("unsupported");
        }
        return;
      }
      try {
        const reg = await navigator.serviceWorker.register(SW_PATH);
        if (cancelled) return;
        if (Notification.permission === "denied") return setStatus("denied");
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setStatus(sub ? "on" : "off");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const turnOn = useCallback(async () => {
    if (!supported()) return;
    setStatus("working");
    try {
      const keyRes = await fetch("/api/push/public-key");
      if (keyRes.status === 503) return setStatus("unconfigured");
      if (!keyRes.ok) return setStatus("error");
      const { publicKey } = (await keyRes.json()) as { publicKey: string };

      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (permission !== "granted") return setStatus(permission === "denied" ? "denied" : "off");

      const reg = await navigator.serviceWorker.register(SW_PATH);
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(publicKey) as BufferSource }));
      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: { endpoint: json.endpoint, keys: json.keys }, locale }),
      });
      setStatus(res.ok ? "on" : "error");
    } catch {
      setStatus("error");
    }
  }, [locale]);

  const turnOff = useCallback(async () => {
    if (!supported()) return;
    setStatus("working");
    try {
      const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => undefined);
        await sub.unsubscribe().catch(() => undefined);
      }
      setStatus("off");
    } catch {
      setStatus("error");
    }
  }, []);

  return { status, needsHomeScreen, turnOn, turnOff };
}

/** The server's base64url key as the bytes `subscribe` wants. */
function toKey(base64url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}
