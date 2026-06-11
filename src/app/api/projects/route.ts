import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { syncCloudflareProjectsToClients } from "@/lib/cloudflare-sync";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  // Trigger background Cloudflare projects & client sync
  try {
    await syncCloudflareProjectsToClients();
  } catch (syncErr: any) {
    console.error("[GET Projects] Background cloudflare sync failed:", syncErr.message);
  }

  let query = supabaseAdmin
    .from("projects")
    .select("*, clients(name, company)")
    .order("created_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, name, description, status, budget, start_date, end_date } = body;

    if (!client_id || !name) {
      return NextResponse.json({ error: "Client ID and Name are required" }, { status: 400 });
    }

    const payload = {
      client_id,
      name,
      description,
      status: status || "pending",
      budget: budget ? parseFloat(budget) : null,
      start_date: start_date || null,
      end_date: end_date || null,
    };

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert(payload as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logActivity({
      action: "created",
      entityType: "project",
      entityId: (data as any)?.id,
      details: { name: (data as any)?.name, client_id },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
