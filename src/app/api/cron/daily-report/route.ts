import { NextResponse } from "next/server";
import { getCloudflareProjects, getPrimaryProjectUrl } from "@/lib/cloudflare";
import { sendMessage } from "@/lib/telegram";

// Vercel Cron will call this endpoint every day at 06:00 UTC (= 08:00 Madrid/España)
// Protected by CRON_SECRET so only Vercel can trigger it

export async function GET(req: Request) {
  // Auth: Only allow Vercel Cron or manual trigger with secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatId = process.env.TELEGRAM_AUTHORIZED_USER_ID;
  if (!chatId) {
    return NextResponse.json({ error: "No TELEGRAM_AUTHORIZED_USER_ID set" }, { status: 500 });
  }

  try {
    // 1. Fetch all Cloudflare Pages projects
    const projects = await getCloudflareProjects();

    if (!projects || projects.length === 0) {
      await sendMessage(chatId, "⚠️ <b>Informe Matutino</b>\nNo se encontraron proyectos en Cloudflare.");
      return NextResponse.json({ ok: true, projects: 0 });
    }

    // 2. Ping each project's primary URL in parallel
    const results = await Promise.allSettled(
      projects.map(async (project) => {
        const { url, displayDomain } = getPrimaryProjectUrl(project);
        const startTime = Date.now();

        const defaultUrl = `https://${project.subdomain || project.domains?.[0] || `${project.name}.pages.dev`}`;
        const browserHeaders = {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        };

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          let res = await fetch(url, {
            method: "GET",
            headers: browserHeaders,
            signal: controller.signal,
            cache: "no-store",
          });

          // Fallback if custom domain blocked by Cloudflare WAF challenge (403) on datacenter IP
          if (res.status === 403 && url !== defaultUrl) {
            try {
              const fallbackRes = await fetch(defaultUrl, {
                method: "GET",
                headers: browserHeaders,
                signal: AbortSignal.timeout(5000),
                cache: "no-store",
              });
              if (fallbackRes.ok) {
                res = fallbackRes;
              }
            } catch (_) {}
          }

          clearTimeout(timeoutId);
          const latency = Date.now() - startTime;

          return {
            name: project.name,
            domain: displayDomain,
            url,
            status: res.status,
            ok: res.ok,
            latency,
          };
        } catch (err: any) {
          // Fallback on network/abort error to pages.dev
          if (url !== defaultUrl) {
            try {
              const fallbackRes = await fetch(defaultUrl, {
                method: "GET",
                headers: browserHeaders,
                signal: AbortSignal.timeout(5000),
                cache: "no-store",
              });
              if (fallbackRes.ok) {
                return {
                  name: project.name,
                  domain: displayDomain,
                  url,
                  status: fallbackRes.status,
                  ok: fallbackRes.ok,
                  latency: Date.now() - startTime,
                };
              }
            } catch (_) {}
          }

          const latency = Date.now() - startTime;
          return {
            name: project.name,
            domain: displayDomain,
            url,
            status: err.name === "AbortError" ? 504 : 0,
            ok: false,
            latency,
            error: err.message,
          };
        }
      })
    );

    // 3. Parse results
    const siteResults = results.map((r) =>
      r.status === "fulfilled" ? r.value : { name: "?", domain: "?", url: "", status: 0, ok: false, latency: 0, error: "Promise rejected" }
    );

    const totalSites = siteResults.length;
    const upSites = siteResults.filter((s) => s.ok);
    const downSites = siteResults.filter((s) => !s.ok);

    // 4. Build Telegram message
    const now = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid", dateStyle: "full", timeStyle: "short" });

    let message = "";

    if (downSites.length === 0) {
      // All good
      message =
        `☀️ <b>Buenos días, Musa!</b>\n` +
        `📅 ${now}\n\n` +
        `✅ <b>Todas tus ${totalSites} webs están 100% operativas.</b>\n\n`;

      for (const site of upSites) {
        message += `🟢 <b>${site.name}</b> → ${site.domain} (${site.latency}ms)\n`;
      }

      message += `\n🛡️ Todas con HTTPS activo y Cloudflare CDN.\n`;
      message += `<i>Que tengas un gran día! 🚀</i>`;
    } else {
      // Some sites down
      message =
        `🚨 <b>ALERTA MATUTINA — Webs caídas detectadas</b>\n` +
        `📅 ${now}\n\n` +
        `⚠️ <b>${downSites.length} de ${totalSites} webs tienen problemas:</b>\n\n`;

      for (const site of downSites) {
        message += `🔴 <b>${site.name}</b> → ${site.domain}\n`;
        message += `   Estado: HTTP ${site.status} | ${site.error || "Sin respuesta"}\n\n`;
      }

      if (upSites.length > 0) {
        message += `\n✅ <b>${upSites.length} webs funcionando correctamente:</b>\n`;
        for (const site of upSites) {
          message += `🟢 ${site.name} → ${site.domain} (${site.latency}ms)\n`;
        }
      }

      message += `\n<i>Revisa las webs caídas cuanto antes.</i>`;
    }

    await sendMessage(chatId, message);

    return NextResponse.json({
      ok: true,
      total: totalSites,
      up: upSites.length,
      down: downSites.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Daily report cron error:", err);

    // Try to notify even on error
    try {
      await sendMessage(chatId, `❌ <b>Error en el informe matutino</b>\n${err.message}`);
    } catch (_) {}

    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
