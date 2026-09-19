// POST /api/push/send
// Sends a push notification to ALL subscribed devices.
// Protected: only callable from internal API routes or with the admin cookie.
// Body: { title, body, url?, urgency? }

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { broadcastPush, PushPayload } from "@/lib/push";

export async function POST(req: Request) {
  // Basic auth check — must have nextos_session cookie
  const cookieStore = await cookies();
  const session = cookieStore.get("nextos_session")?.value;

  // Also allow internal server-to-server calls via X-Internal-Token
  const internalToken = req.headers.get("x-internal-token");
  const isInternal = internalToken === process.env.ADMIN_PASSWORD;

  if (!session && !isInternal) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json() as PushPayload;

    if (!body.title || !body.body) {
      return NextResponse.json({ error: "title y body son requeridos" }, { status: 400 });
    }

    const result = await broadcastPush({
      icon: "/apple-icon.png",
      badge: "/apple-icon.png",
      url: body.url || "/",
      urgency: "normal",
      ...body,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
