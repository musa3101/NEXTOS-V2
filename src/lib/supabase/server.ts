import { insforgeAdmin, getInsforgeAdmin } from "../insforge/server";

// Backward-compatible export redirecting to InsForge Admin
export const supabaseAdmin = insforgeAdmin;
export const getSupabaseAdmin = getInsforgeAdmin;
