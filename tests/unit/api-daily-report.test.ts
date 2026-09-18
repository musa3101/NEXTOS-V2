import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetCloudflareProjects = vi.fn();
const mockGetPrimaryProjectUrl = vi.fn();

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareProjects: () => mockGetCloudflareProjects(),
  getPrimaryProjectUrl: (project: any) => mockGetPrimaryProjectUrl(project),
}));

const mockSendMessage = vi.fn().mockResolvedValue({ ok: true });
vi.mock("@/lib/telegram", () => ({
  sendMessage: (...args: any[]) => mockSendMessage(...args),
}));

import { GET } from "@/app/api/cron/daily-report/route";

describe("Daily Report Cron API (src/app/api/cron/daily-report/route.ts)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      CRON_SECRET: "test_secret_123",
      TELEGRAM_AUTHORIZED_USER_ID: "998877",
    };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("blocks requests with missing or invalid Bearer token when CRON_SECRET is set", async () => {
    const req = new Request("http://localhost:3000/api/cron/daily-report", {
      headers: { authorization: "Bearer wrong_secret" },
    });

    const response = await GET(req);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("returns 500 when TELEGRAM_AUTHORIZED_USER_ID is missing", async () => {
    delete process.env.TELEGRAM_AUTHORIZED_USER_ID;

    const req = new Request("http://localhost:3000/api/cron/daily-report", {
      headers: { authorization: "Bearer test_secret_123" },
    });

    const response = await GET(req);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toContain("TELEGRAM_AUTHORIZED_USER_ID");
  });

  it("sends Telegram alert when all websites are up", async () => {
    mockGetCloudflareProjects.mockResolvedValueOnce([
      { name: "ecuaplac", canonical_deployment: { url: "https://ecuaplac.pages.dev" } },
      { name: "mynext", canonical_deployment: { url: "https://mynext.pages.dev" } },
    ]);

    mockGetPrimaryProjectUrl
      .mockReturnValueOnce({ url: "https://ecuaplac.com", displayDomain: "ecuaplac.com" })
      .mockReturnValueOnce({ url: "https://mynextbymusa.com", displayDomain: "mynextbymusa.com" });

    vi.mocked(fetch).mockResolvedValue(
      new Response("OK", { status: 200, statusText: "OK" })
    );

    const req = new Request("http://localhost:3000/api/cron/daily-report", {
      headers: { authorization: "Bearer test_secret_123" },
    });

    const response = await GET(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.total).toBe(2);
    expect(json.up).toBe(2);
    expect(json.down).toBe(0);

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    const [sentChatId, sentMessage] = mockSendMessage.mock.calls[0];
    expect(sentChatId).toBe("998877");
    expect(sentMessage).toContain("Buenos días");
    expect(sentMessage).toContain("ecuaplac.com");
  });
});
