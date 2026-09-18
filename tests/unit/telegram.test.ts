import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendMessage, sendDocument, setWebhook } from "@/lib/telegram";

describe("Telegram Library (src/lib/telegram.ts)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, TELEGRAM_BOT_TOKEN: "mock_test_token_12345" };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("sendMessage", () => {
    it("skips execution and logs warning if TELEGRAM_BOT_TOKEN is missing", async () => {
      delete process.env.TELEGRAM_BOT_TOKEN;
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await sendMessage(123456, "Hello world");
      expect(result).toBeUndefined();
      expect(warnSpy).toHaveBeenCalledWith("TELEGRAM_BOT_TOKEN not set");
      expect(fetch).not.toHaveBeenCalled();
    });

    it("sends message with correct endpoint and HTML parse_mode", async () => {
      const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const res = await sendMessage(987654, "<b>Test Message</b>");
      expect(fetch).toHaveBeenCalledTimes(1);

      const [url, options] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe("https://api.telegram.org/botmock_test_token_12345/sendMessage");
      expect(options?.method).toBe("POST");
      expect(JSON.parse(options?.body as string)).toEqual({
        chat_id: 987654,
        text: "<b>Test Message</b>",
        parse_mode: "HTML",
      });
      expect(res?.status).toBe(200);
    });

    it("handles custom parse_mode (e.g. MarkdownV2)", async () => {
      const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      await sendMessage(987654, "*Bold Text*", "MarkdownV2");
      const [, options] = vi.mocked(fetch).mock.calls[0];
      expect(JSON.parse(options?.body as string).parse_mode).toBe("MarkdownV2");
    });

    it("handles fetch network failure gracefully without throwing", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network connection error"));
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await sendMessage(987654, "Failure check");
      expect(res).toBeUndefined();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("sendDocument", () => {
    it("sends document using FormData", async () => {
      const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const sampleBuffer = Buffer.from("PDF file content sample");
      await sendDocument(123, sampleBuffer, "factura.pdf");

      expect(fetch).toHaveBeenCalledTimes(1);
      const [url, options] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe("https://api.telegram.org/botmock_test_token_12345/sendDocument");
      expect(options?.method).toBe("POST");
      expect(options?.body).toBeInstanceOf(FormData);
    });
  });

  describe("setWebhook", () => {
    it("calls setWebhook endpoint with provided url payload", async () => {
      const mockResult = { ok: true, result: true, description: "Webhook was set" };
      const mockResponse = new Response(JSON.stringify(mockResult), { status: 200 });
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const res = await setWebhook("https://example.com/api/telegram/webhook");
      expect(fetch).toHaveBeenCalledTimes(1);

      const [url, options] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe("https://api.telegram.org/botmock_test_token_12345/setWebhook");
      expect(JSON.parse(options?.body as string)).toEqual({
        url: "https://example.com/api/telegram/webhook",
      });
      expect(res).toEqual(mockResult);
    });
  });
});
