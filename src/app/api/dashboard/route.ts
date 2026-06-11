export const runtime = "edge";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const [clientsRes, projectsRes, docsRes] = await Promise.all([
      supabaseAdmin.from("clients").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("projects").select("id", { count: "exact", head: true }).eq("status", "development"),
      supabaseAdmin.from("documents").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      totalClients: clientsRes.count || 0,
      activeProjects: projectsRes.count || 0,
      documentsGenerated: docsRes.count || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
