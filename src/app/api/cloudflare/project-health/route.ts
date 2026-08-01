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
