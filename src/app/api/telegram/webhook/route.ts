import { NextResponse } from "next/server";
import { sendMessage, downloadFileAsBase64 } from "@/lib/telegram";
import { insforgeAdmin } from "@/lib/insforge/server";
import { handleTelegramAI, handleTelegramAIMultimodal } from "@/lib/telegram-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Telegram sends 'message' object
    const message = body.message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const { chat, from } = message;
    const chatId = chat.id;
    const userId = from.id.toString();

    // 1. Authorization Check
    const authUserId = process.env.TELEGRAM_AUTHORIZED_USER_ID;
    if (authUserId && userId !== authUserId) {
      await sendMessage(chatId, "🚫 <b>No autorizado</b>\nNo tienes permisos para usar este bot.");
      return NextResponse.json({ ok: true });
    }

    // 2. Determine message type: text, photo, voice/audio
    const hasPhoto = message.photo && message.photo.length > 0;
    const hasVoice = !!message.voice;
    const hasAudio = !!message.audio;
    const hasText = !!message.text;
    const caption = message.caption || "";

    // 3. Fast command shortcuts (only for pure text messages)
    if (hasText) {
      const trimmedText = message.text.trim();

      if (trimmedText === "/start") {
        await sendMessage(
          chatId,
          `👋 <b>¡Hola Musa! Bienvenido a NextOS AI</b>\n` +
          `Soy tu asistente de inteligencia artificial para MyNext.\n\n` +
          `💬 Puedes hablarme en lenguaje natural cuando quieras, sin memorizar comandos. Por ejemplo:\n` +
          `• <i>"¿Cómo están mis webs hoy?"</i>\n` +
          `• <i>"Hazme una factura para Juan de diseño web"</i>\n` +
          `• <i>"Crea una propuesta de demo para el restaurante Sol"</i>\n` +
          `• <i>"¿Cuáles son los clientes activos?"</i>\n` +
          `• <i>"Despliega la web de ecuaplac"</i>\n\n` +
          `📸 También puedes enviarme <b>fotos</b> y <b>notas de voz</b> — analizo imágenes y entiendo audios.\n\n` +
          `🆔 <i>Tu User ID:</i> <code>${chatId}</code>`
        );
        return NextResponse.json({ ok: true });
      }

      if (trimmedText === "/id" || trimmedText === "/myid") {
        await sendMessage(chatId, `🆔 <b>Tu Telegram User ID:</b> <code>${chatId}</code>`);
        return NextResponse.json({ ok: true });
      }

      if (trimmedText === "/clear" || trimmedText === "/reset") {
        try {
          await (insforgeAdmin.from("telegram_messages") as any)
            .delete()
            .eq("chat_id", chatId.toString());
        } catch (_) {}
        await sendMessage(chatId, "🧹 <b>Memoria de conversación reiniciada.</b>\n¿En qué te puedo ayudar ahora, Musa?");
        return NextResponse.json({ ok: true });
      }

      // Pure text → standard AI handler
      await handleTelegramAI(chatId, trimmedText);
      return NextResponse.json({ ok: true });
    }

    // 4. Photo message → download highest resolution and send to multimodal AI
    if (hasPhoto) {
      // Telegram provides multiple sizes, last one is highest resolution
      const bestPhoto = message.photo[message.photo.length - 1];
      const fileId = bestPhoto.file_id;

      const imageData = await downloadFileAsBase64(fileId, "image/jpeg");
      if (!imageData) {
        await sendMessage(chatId, "⚠️ No pude descargar la imagen. Inténtalo de nuevo.");
        return NextResponse.json({ ok: true });
      }

      await handleTelegramAIMultimodal(chatId, {
        type: "image",
        base64DataUri: imageData.base64DataUri,
        mimeType: imageData.mimeType,
        userText: caption || "Analiza esta imagen.",
      });

      return NextResponse.json({ ok: true });
    }

    // 5. Voice note or audio file → download and send to multimodal AI
    if (hasVoice || hasAudio) {
      const fileId = hasVoice ? message.voice.file_id : message.audio.file_id;
      const mime = hasVoice ? "audio/ogg" : (message.audio.mime_type || "audio/mpeg");

      const audioData = await downloadFileAsBase64(fileId, mime);
      if (!audioData) {
        await sendMessage(chatId, "⚠️ No pude descargar el audio. Inténtalo de nuevo.");
        return NextResponse.json({ ok: true });
      }

      await handleTelegramAIMultimodal(chatId, {
        type: "audio",
        base64DataUri: audioData.base64DataUri,
        mimeType: audioData.mimeType,
        userText: caption || "Escucha este audio y responde.",
      });

      return NextResponse.json({ ok: true });
    }

    // 6. Unsupported message types (stickers, documents, etc.) — acknowledge gracefully
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

