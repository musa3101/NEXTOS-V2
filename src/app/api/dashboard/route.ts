import { NextResponse } from "next/server";
import { insforgeAdmin } from "@/lib/insforge/server";

export async function GET() {
  try {
    const [clientsRes, projectsRes, docsRes] = await Promise.all([
      insforgeAdmin.from("clients").select("id", { count: "exact", head: true }),
      insforgeAdmin.from("projects").select("id", { count: "exact", head: true }).eq("status", "development"),
      insforgeAdmin.from("documents").select("id", { count: "exact", head: true }),
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
