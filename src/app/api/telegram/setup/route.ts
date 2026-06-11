import { NextResponse } from "next/server";
import { setWebhook } from "@/lib/telegram";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  // Or override with query param ?url=https://...
  const webhookUrl = searchParams.get("url") || `${protocol}://${host}/api/telegram/webhook`;

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
