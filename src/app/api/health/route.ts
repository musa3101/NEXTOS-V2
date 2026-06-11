import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { validateCloudflareConnection } from "@/lib/cloudflare";

export async function GET(request: Request) {
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

  // Self-healing check for Telegram Webhook
  const host = request.headers.get("host") || "";
  const isVercel = host && !host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("loca.lt");
  
  if (isVercel && process.env.TELEGRAM_BOT_TOKEN) {
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const vercelUrl = `${protocol}://${host}`;
    await checkAndRestoreWebhook(vercelUrl, process.env.TELEGRAM_BOT_TOKEN);
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

async function checkAndRestoreWebhook(vercelUrl: string, token: string) {
  try {
    const getRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    if (!getRes.ok) return;
    
    const info = await getRes.json();
    const currentUrl = info.result?.url || "";
    const expectedUrl = `${vercelUrl}/api/telegram/webhook`;

    if (currentUrl !== expectedUrl) {
      let shouldRestore = false;

      if (!currentUrl) {
        shouldRestore = true;
      } else if (currentUrl.includes("loca.lt") || currentUrl.includes("localtunnel") || currentUrl.includes("ngrok")) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          
          const pingRes = await fetch(currentUrl, { 
            method: "GET", 
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          
          if (!pingRes.ok || pingRes.status >= 500) {
            shouldRestore = true;
          }
        } catch (pingErr) {
          shouldRestore = true;
        }
      }

      if (shouldRestore) {
        console.log(`[Telegram Webhook Self-Healing] Local tunnel is offline (${currentUrl}). Restoring webhook to Vercel: ${expectedUrl}`);
        
        await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: expectedUrl }),
        });
      }
    }
  } catch (err) {
    console.error("[Telegram Webhook Self-Healing] Error:", err);
  }
}

