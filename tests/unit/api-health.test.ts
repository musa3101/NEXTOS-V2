import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSelect, mockFrom, mockValidateCloudflareConnection } = vi.hoisted(() => {
  const mockSelect = vi.fn().mockReturnValue({
    limit: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
  });
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
  }));
  const mockValidateCloudflareConnection = vi.fn().mockResolvedValue({ success: true });
  return { mockSelect, mockFrom, mockValidateCloudflareConnection };
});

vi.mock("@/lib/insforge/server", () => ({
  insforgeAdmin: {
    from: mockFrom,
  },
}));

vi.mock("@/lib/cloudflare", () => ({
  validateCloudflareConnection: () => mockValidateCloudflareConnection(),
}));

import { GET } from "@/app/api/health/route";

describe("Health API Route (src/app/api/health/route.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TELEGRAM_BOT_TOKEN = "mock_token";
  });

  it("returns healthy status when all services (Supabase, Cloudflare, Telegram) are up", async () => {
    const req = new Request("http://localhost:3000/api/health", {
      headers: { host: "localhost:3000" },
    });

    const response = await GET(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.status).toBe("healthy");
    expect(json.services.supabase.status).toBe("up");
    expect(json.services.cloudflare.status).toBe("up");
    expect(json.services.telegram.status).toBe("up");
    expect(json.services.api.status).toBe("up");
    expect(json.timestamp).toBeDefined();
  });

  it("returns degraded status when Supabase fails", async () => {
    mockSelect.mockReturnValueOnce({
      limit: vi.fn().mockResolvedValue({ data: null, error: { message: "DB Error" } }),
    });

    const req = new Request("http://localhost:3000/api/health", {
      headers: { host: "localhost:3000" },
    });

    const response = await GET(req);
    const json = await response.json();

    expect(json.status).toBe("degraded");
    expect(json.services.supabase.status).toBe("down");
  });

  it("marks telegram as down if TELEGRAM_BOT_TOKEN is not set", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;

    const req = new Request("http://localhost:3000/api/health", {
      headers: { host: "localhost:3000" },
    });

    const response = await GET(req);
    const json = await response.json();

    expect(json.services.telegram.status).toBe("down");
  });
});
