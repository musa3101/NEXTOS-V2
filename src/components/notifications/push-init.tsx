"use client";

/**
 * PushInit — registers the Service Worker and subscribes the device to
 * Web Push notifications. Runs once after the user logs in.
 *
 * Flow:
 * 1. Register /sw.js
 * 2. Ask for notification permission (browser prompt)
 * 3. Subscribe to push with VAPID public key
 * 4. POST subscription to /api/push/subscribe → saved in InsForge
 */

import { useEffect } from "react";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

export function PushInit() {
  useEffect(() => {
    async function initPush() {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      try {
        // 1. Register Service Worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        await navigator.serviceWorker.ready;

        // 2. Check current permission state
        const currentPerm = Notification.permission;
        if (currentPerm === "denied") return; // user explicitly blocked it

        // 3. Check if already subscribed
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          // Refresh subscription in InsForge (in case it expired)
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(existingSub.toJSON()),
          });
          return;
        }

        // 4. Ask for permission (only once per device — browser handles this)
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // 5. Subscribe to push
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) {
          console.warn("[PushInit] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // 6. Save subscription to InsForge
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });

        console.log("[NextOS] 🔔 Push notifications activadas");
      } catch (err) {
        // Silent fail — push is a nice-to-have, not critical
        console.warn("[PushInit] Push setup failed:", err);
      }
    }

    // Small delay so the login animation completes first
    const timer = setTimeout(initPush, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null; // No UI — invisible component
}
