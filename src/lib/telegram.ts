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
      console.error("Telegram sendMessage failed:", await res.text());
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

export async function setWebhook(url: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  const res = await fetch(`${getTelegramApi()}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  
  return res.json();
}
