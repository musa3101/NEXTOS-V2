export const runtime = "edge";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { syncCloudflareProjectsToClients } from "@/lib/cloudflare-sync";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  // Trigger background Cloudflare projects & client sync
  try {
    await syncCloudflareProjectsToClients();
  } catch (syncErr: any) {
    console.error("[GET Clients] Background cloudflare sync failed:", syncErr.message);
  }

  let query = supabaseAdmin.from("clients").select("*").order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: clients, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch all projects to map client-projects associations in memory
  const { data: projects, error: projectsErr } = await supabaseAdmin
    .from("projects")
    .select("*");

  if (projectsErr) {
    return NextResponse.json({ error: projectsErr.message }, { status: 500 });
  }

  const clientsWithProjects = (clients || []).map((client: any) => {
    const clientProjects = (projects || []).filter((p: any) => p.client_id === client.id);
    return {
      ...client,
      projects: clientProjects
    };
  });

  return NextResponse.json(clientsWithProjects);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, status, notes } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const payload = { name, company, email, phone, status: status || "lead", notes };
    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert(payload as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logActivity({
      action: "created",
      entityType: "client",
      entityId: (data as any)?.id,
      details: { name: (data as any)?.name },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
