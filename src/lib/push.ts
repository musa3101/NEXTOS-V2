// ── Server-side Web Push helper ────────────────────────────────
// Used by API routes to send push notifications to all subscribers.

import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mynextbymusa@gmail.com";

webpush.setVapidDetails(
  `mailto:${VAPID_EMAIL}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  urgency?: "normal" | "high";
}

/**
 * Send a push notification to a single PushSubscription object.
 */
export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        icon: "/apple-icon.png",
        badge: "/apple-icon.png",
        url: "/",
        ...payload,
      }),
      {
        urgency: payload.urgency === "high" ? "high" : "normal",
        TTL: 86400, // 24h
      }
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Send a push notification to ALL stored subscriptions via InsForge.
 * Returns counts of successes and failures.
 */
export async function broadcastPush(payload: PushPayload) {
  const { insforgeAdmin } = await import("@/lib/insforge/server");

  const { data: subs, error } = await insforgeAdmin
    .from("push_subscriptions")
    .select("*");

  if (error || !subs?.length) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (row: any) => {
      const sub: webpush.PushSubscription = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      };
      const result = await sendPushNotification(sub, payload);
      if (result.success) {
        sent++;
      } else {
        failed++;
        // Remove stale/invalid subscriptions automatically
        if (result.error?.includes("410") || result.error?.includes("404")) {
          await insforgeAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", row.endpoint);
        }
      }
    })
  );

  return { sent, failed };
}
