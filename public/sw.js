// ============================================================
// 🔔 NextOS Service Worker — Web Push + Offline Cache
// ============================================================
// Handles background push notifications on iPhone/Android PWA.
// Requires iOS 16.4+ with the app installed from Safari.

const CACHE_NAME = "nextos-v1";

// ── Install & Activate ──────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// ── Push Event ───────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "NextOS", body: event.data.text() };
  }

  const {
    title = "NextOS",
    body = "Tienes una notificación nueva",
    icon = "/apple-icon.png",
    badge = "/apple-icon.png",
    tag = "nextos-alert",
    url = "/",
    urgency = "normal",
  } = payload;

  const options = {
    body,
    icon,
    badge,
    tag,
    data: { url },
    requireInteraction: urgency === "high",
    vibrate: urgency === "high" ? [200, 100, 200, 100, 400] : [100, 50, 100],
    actions:
      urgency === "high"
        ? [
            { action: "open", title: "Abrir NextOS" },
            { action: "dismiss", title: "Descartar" },
          ]
        : [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click ────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.postMessage({ type: "NAVIGATE", url });
            return;
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
