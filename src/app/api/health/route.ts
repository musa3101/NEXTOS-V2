export const runtime = "edge";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { validateCloudflareConnection } from "@/lib/cloudflare";

export async function GET() {
  const start = Date.now();
  let supabaseStatus = "down";
  let supabaseLatency = -1;

  try {
    const { error } = await supabaseAdmin.from("clients").select("id").limit(1);
    if (!error) {
      supabaseStatus = "up";
      supabaseLatency = Date.now() - start;
    }
  } catch (err) {
    // leave as down
  }

  // Basic check for telegram token presence, real check would ping Telegram API
  const telegramStatus = process.env.TELEGRAM_BOT_TOKEN ? "up" : "down";

  // Check Cloudflare connection
  let cloudflareStatus = "down";
  try {
    const cfCheck = await validateCloudflareConnection();
    if (cfCheck.success) {
      cloudflareStatus = "up";
    }
  } catch (err) {
    // leave as down
  }

  return NextResponse.json({
    status: supabaseStatus === "up" ? "healthy" : "degraded",
    services: {
      supabase: {
        status: supabaseStatus,
        latency: supabaseLatency,
      },
      telegram: {
        status: telegramStatus,
      },
      cloudflare: {
        status: cloudflareStatus,
      },
      api: {
        status: "up",
        latency: Date.now() - start,
      }
    },
    timestamp: new Date().toISOString(),
  });
}
