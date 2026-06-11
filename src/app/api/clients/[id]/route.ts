export const runtime = "edge";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { Database } from "@/lib/supabase/types";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*, projects(*), documents(*)")
    .eq("id", resolvedParams.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    
    const updateData = { ...body, updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin
      .from("clients")
      // @ts-ignore
      .update(updateData)
      .eq("id", resolvedParams.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const updatedClient = data as any;
    await logActivity({
      action: "updated",
      entityType: "client",
      entityId: updatedClient?.id || resolvedParams.id,
      details: { name: updatedClient?.name, changes: Object.keys(body) },
    });

    return NextResponse.json(updatedClient);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { data, error } = await supabaseAdmin
    .from("clients")
    .delete()
    .eq("id", resolvedParams.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logActivity({
    action: "deleted",
    entityType: "client",
    entityId: resolvedParams.id,
    details: { name: (data as any)?.name },
  });

  return NextResponse.json({ success: true });
}
