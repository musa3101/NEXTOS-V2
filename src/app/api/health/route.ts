import { NextResponse } from "next/server";
import { insforgeAdmin } from "@/lib/insforge/server";
import { validateCloudflareConnection } from "@/lib/cloudflare";

export async function GET(request: Request) {
  const start = Date.now();
  let dbStatus = "down";
  let dbLatency = -1;

  // Helper for 3s max timeout per check
  const withTimeout = <T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs)),
    ]);
  };

  // Run InsForge and Cloudflare checks in parallel with timeout
  const [dbResult, cfResult] = await Promise.allSettled([
    withTimeout((async () => await insforgeAdmin.from("clients").select("id").limit(1))()),
    withTimeout(validateCloudflareConnection()),
  ]);

  if (dbResult.status === "fulfilled" && !dbResult.value?.error) {
    dbStatus = "up";
    dbLatency = Date.now() - start;
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
    status: dbStatus === "up" && cloudflareStatus === "up" ? "healthy" : "degraded",
    services: {
      insforge: {
        status: dbStatus,
        latency: dbLatency,
      },
      supabase: {
        status: dbStatus,
        latency: dbLatency,
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
