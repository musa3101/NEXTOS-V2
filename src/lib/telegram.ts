function getTelegramApi() {
  return `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
}

export async function sendMessage(chatId: string | number, text: string, parseMode: string = "HTML") {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set");
    return;
  }

  try {
    const res = await fetch(`${getTelegramApi()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.error("Telegram sendMessage failed:", errText);
      // Fallback: retry without parse_mode if entity parsing failed
      if (parseMode && errText.includes("can't parse entities")) {
        const plainText = text.replace(/<[^>]*>/g, "");
        return await fetch(`${getTelegramApi()}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: plainText,
          }),
        });
      }
    }
    return res;
  } catch (err) {
    console.error("Telegram API Error:", err);
  }
}

export async function sendDocument(chatId: string | number, buffer: Buffer, filename: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  try {
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    
    // Create a Blob from the Buffer to append to FormData
    const blob = new Blob([buffer as any], { type: "application/pdf" });
    formData.append("document", blob, filename);

    const res = await fetch(`${getTelegramApi()}/sendDocument`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      console.error("Telegram sendDocument failed:", await res.text());
    }
    return res;
  } catch (err) {
    console.error("Telegram API Error:", err);
  }
}

/**
 * Get a direct download URL for a Telegram file (photo, voice, audio, document).
 * Uses getFile API to get file_path, then constructs the download URL.
 */
export async function getFileUrl(fileId: string): Promise<string | null> {
  if (!process.env.TELEGRAM_BOT_TOKEN) return null;

  try {
    const res = await fetch(`${getTelegramApi()}/getFile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId }),
    });

    if (!res.ok) {
      console.error("Telegram getFile failed:", await res.text());
      return null;
    }

    const data = await res.json();
    const filePath = data?.result?.file_path;
    if (!filePath) return null;

    return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
  } catch (err) {
    console.error("Telegram getFile error:", err);
    return null;
  }
}

/**
 * Download a Telegram file and return it as a base64 data URI.
 * Returns { base64DataUri, mimeType } or null on failure.
 */
export async function downloadFileAsBase64(
  fileId: string,
  fallbackMime: string = "application/octet-stream"
): Promise<{ base64DataUri: string; mimeType: string } | null> {
  const url = await getFileUrl(fileId);
  if (!url) return null;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed to download Telegram file:", res.status);
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || fallbackMime;
    const base64 = buffer.toString("base64");
    const base64DataUri = `data:${contentType};base64,${base64}`;

    return { base64DataUri, mimeType: contentType };
  } catch (err) {
    console.error("Telegram file download error:", err);
    return null;
  }
}

export async function setWebhook(url: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  const res = await fetch(`${getTelegramApi()}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  
  return res.json();
}
