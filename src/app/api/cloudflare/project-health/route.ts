import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "MyNext-OS-Health-Checker/2.0",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - startTime);

    const isOk = res.ok;
    const statusCode = res.status;
    const serverHeader = res.headers.get("server") || "Cloudflare Edge";
    const contentType = res.headers.get("content-type") || "text/html";
    const cfRay = res.headers.get("cf-ray") || null;

    // Fetch Cloudflare Pages real project metadata if name is provided
    let cfDetails: any = null;
    const projectName = searchParams.get("name");
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (projectName && token && accountId) {
      try {
        const [cfRes, deployRes] = await Promise.all([
          fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ),
          fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments?per_page=1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ),
        ]);

        if (cfRes.ok) {
          const cfJson = await cfRes.json();
          const p = cfJson.result;
          let totalDeployments = 1;
          if (deployRes.ok) {
            const deployJson = await deployRes.json();
            totalDeployments = deployJson.result_info?.total_count || deployJson.result?.length || 1;
          }

          if (p) {
            cfDetails = {
              subdomain: p.subdomain,
              domainsCount: p.domains?.length || 1,
              createdOn: p.created_on,
              productionBranch: p.production_branch || "main",
              totalDeployments,
              lastDeployTime: p.latest_deployment?.created_on || null,
              lastDeployStatus: p.latest_deployment?.latest_stage?.status || "success",
              commitHash: p.latest_deployment?.deployment_trigger?.metadata?.commit_hash || null,
              commitMessage: p.latest_deployment?.deployment_trigger?.metadata?.commit_message || null,
            };
          }
        }
      } catch (cfErr) {
        console.error("Cloudflare project details error:", cfErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: targetUrl,
      isOk,
      statusCode,
      statusText: isOk ? "Operativo (HTTP 200 OK)" : `Respuesta HTTP ${statusCode}`,
      latency,
      ssl: targetUrl.startsWith("https"),
      server: serverHeader,
      contentType,
      cfRay,
      cfDetails,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const latency = Math.round(performance.now() - startTime);
    const isTimeout = err.name === "AbortError";

    return NextResponse.json({
      success: false,
      url: targetUrl,
      isOk: false,
      statusCode: isTimeout ? 504 : 500,
      statusText: isTimeout ? "Tiempo de espera agotado (Timeout)" : `Error de conexión: ${err.message}`,
      latency,
      ssl: targetUrl.startsWith("https"),
      server: "Cloudflare Edge / Unreachable",
      timestamp: new Date().toISOString(),
    });
  }
}
