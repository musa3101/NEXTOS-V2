import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { validateCloudflareConnection } from "@/lib/cloudflare";

export async function GET(request: Request) {
  const start = Date.now();
  let supabaseStatus = "down";
  let supabaseLatency = -1;

  // Helper for 2s max timeout per check
  const withTimeout = <T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs)),
    ]);
  };

  // Run Supabase and Cloudflare checks in parallel with timeout
  const [sbResult, cfResult] = await Promise.allSettled([
    withTimeout((async () => await supabaseAdmin.from("clients").select("id").limit(1))()),
    withTimeout(validateCloudflareConnection()),
  ]);

  if (sbResult.status === "fulfilled" && (!sbResult.value?.error || sbResult.value?.error?.code === "PGRST205")) {
    supabaseStatus = "up";
    supabaseLatency = Date.now() - start;
  }

  const telegramStatus = process.env.TELEGRAM_BOT_TOKEN ? "up" : "down";

  let cloudflareStatus = "down";
  if (cfResult.status === "fulfilled" && cfResult.value?.success) {
    cloudflareStatus = "up";
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

