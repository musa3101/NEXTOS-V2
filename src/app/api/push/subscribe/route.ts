// POST /api/push/subscribe
// Saves a Web Push subscription (endpoint + keys) to InsForge.
// Called by the client when the user grants notification permission.

import { NextResponse } from "next/server";
import { insforgeAdmin } from "@/lib/insforge/server";

export async function POST(req: Request) {
  try {
    const subscription = await req.json();

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
    }

    // Upsert: avoid duplicates by endpoint
    const { error } = await insforgeAdmin.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("[push/subscribe] InsForge error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/push/subscribe — remove on logout or permission revoke
export async function DELETE(req: Request) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: "endpoint requerido" }, { status: 400 });

    await insforgeAdmin.from("push_subscriptions").delete().eq("endpoint", endpoint);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
