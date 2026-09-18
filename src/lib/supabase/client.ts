import { insforge, getInsforge } from "../insforge/client";

// Backward-compatible export redirecting to InsForge
export const supabase = insforge;
export const getSupabase = getInsforge;
