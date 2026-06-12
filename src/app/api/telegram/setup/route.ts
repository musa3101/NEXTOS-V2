import { NextResponse } from "next/server";
import { setWebhook } from "@/lib/telegram";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  // Use edge function URL if provided, otherwise fallback to local
  const webhookUrl = searchParams.get("url") || process.env.SUPABASE_EDGE_FUNCTION_URL || `${protocol}://${host}/api/telegram/webhook`;

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 500 });
  }

  const result = await setWebhook(webhookUrl);
  
  return NextResponse.json({
    success: true,
    webhookUrl,
    result
  });
}
