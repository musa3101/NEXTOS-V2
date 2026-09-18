import { NextResponse } from "next/server";
import { insforgeAdmin } from "@/lib/insforge/server";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  let query = insforgeAdmin
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

    const { data, error } = await (insforgeAdmin
      .from("projects") as any)
      .insert([payload])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const record = Array.isArray(data) ? data[0] : data;

    await logActivity({
      action: "created",
      entityType: "project",
      entityId: record?.id,
      details: { name: record?.name, client_id },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
