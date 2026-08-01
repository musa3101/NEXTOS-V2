import { NextResponse } from "next/server";
import { getCloudflareProjects } from "@/lib/cloudflare";

export async function GET() {
  try {
    const projects = await getCloudflareProjects();
    return NextResponse.json({ success: true, count: projects.length, data: projects });
  } catch (error: any) {
    console.error("[GET /api/cloudflare/projects] Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch Cloudflare projects" },
      { status: 500 }
    );
  }
}
