import { supabaseAdmin } from "./supabase/server";

export async function logActivity({
  action,
  entityType,
  entityId,
  details = {},
  source = "web",
}: {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  source?: "web" | "telegram" | "system";
}) {
  try {
    const payload = {
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      source,
    };
    const { error } = await supabaseAdmin.from("activity_logs").insert(payload as any);
    
    if (error) {
      console.error("Failed to log activity:", error);
    }
  } catch (err) {
    console.error("Error logging activity:", err);
  }
}
