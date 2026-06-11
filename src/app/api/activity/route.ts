import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const type = searchParams.get("type"); // e.g. "client", "project", "document"
  const source = searchParams.get("source"); // e.g. "telegram"

  let query = supabaseAdmin
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) query = query.eq("entity_type", type);
  if (source) query = query.eq("source", source);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
