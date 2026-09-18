import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockInsert, mockFrom } = vi.hoisted(() => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn(() => ({
    insert: mockInsert,
  }));
  return { mockInsert, mockFrom };
});

vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: {
    from: mockFrom,
  },
}));

import { logActivity } from "@/lib/activity";

describe("Activity Logger (src/lib/activity.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts activity log record to supabaseAdmin with correct payload", async () => {
    await logActivity({
      action: "DEPLOY_TRIGGERED",
      entityType: "project",
      entityId: "prj_123",
      details: { environment: "production" },
      source: "web",
    });

    expect(mockFrom).toHaveBeenCalledWith("activity_logs");
    expect(mockInsert).toHaveBeenCalledWith({
      action: "DEPLOY_TRIGGERED",
      entity_type: "project",
      entity_id: "prj_123",
      details: { environment: "production" },
      source: "web",
    });
  });

  it("uses default values for details and source", async () => {
    await logActivity({
      action: "PING_TEST",
      entityType: "system",
    });

    expect(mockInsert).toHaveBeenCalledWith({
      action: "PING_TEST",
      entity_type: "system",
      entity_id: undefined,
      details: {},
      source: "web",
    });
  });

  it("catches and logs error without crashing when Supabase returns an error", async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: "Database connection failed" } });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await logActivity({
      action: "ERROR_TEST",
      entityType: "test",
    });

    expect(consoleSpy).toHaveBeenCalledWith("Failed to log activity:", {
      message: "Database connection failed",
    });
  });
});
