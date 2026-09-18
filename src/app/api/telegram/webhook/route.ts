import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/telegram";
import { insforgeAdmin } from "@/lib/insforge/server";
import { handleTelegramAI } from "@/lib/telegram-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Telegram sends 'message' object
    if (!body.message || !body.message.text) {
      return NextResponse.json({ ok: true }); // Ignore non-text messages
    }

    const { chat, text, from } = body.message;
    const chatId = chat.id;
    const userId = from.id.toString();

    // 1. Authorization Check
    const authUserId = process.env.TELEGRAM_AUTHORIZED_USER_ID;
    if (authUserId && userId !== authUserId) {
      await sendMessage(chatId, "🚫 <b>No autorizado</b>\nNo tienes permisos para usar este bot.");
      return NextResponse.json({ ok: true });
    }

    const trimmedText = text.trim();

    // 2. Fast command shortcuts
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
        `Si falta algún dato para una factura o propuesta, te iré preguntando paso a paso para preparártela en PDF.\n\n` +
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

    // 3. Conversational AI Agent with Memory & System Tools
    await handleTelegramAI(chatId, trimmedText);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
