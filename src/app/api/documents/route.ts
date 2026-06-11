import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");
  const type = searchParams.get("type");

  let query = supabaseAdmin
    .from("documents")
    .select("*, clients(name), projects(name)")
    .order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);
  if (projectId) query = query.eq("project_id", projectId);
  if (type) query = query.eq("type", type);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, project_id, type, template_data, total_amount } = body;

    if (!client_id || !type || !template_data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate document number e.g. INV-2026-0001
    const prefix = type === "invoice" ? "INV" : "DEL";
    const year = new Date().getFullYear();
    const randomHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const number = `${prefix}-${year}-${randomHex}`;

    const payload = {
      client_id,
      project_id: project_id || null,
      type,
      number,
      template_data,
      total_amount: total_amount ? parseFloat(total_amount) : null,
    };

    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert(payload as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logActivity({
      action: "generated",
      entityType: "document",
      entityId: (data as any)?.id,
      details: { number: (data as any)?.number, type },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
