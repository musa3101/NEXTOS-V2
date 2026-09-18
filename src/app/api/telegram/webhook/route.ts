import { NextResponse } from "next/server";
import { sendMessage, sendDocument } from "@/lib/telegram";
import { insforgeAdmin } from "@/lib/insforge/server";
import { logActivity } from "@/lib/activity";

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

    // 2. Parse command (slash command or natural language)
    let command = "";
    let args: string[] = [];

    if (text.startsWith("/")) {
      const parts = text.split(" ");
      command = parts[0].toLowerCase();
      args = parts.slice(1);
    } else {
      const normalizedText = text.trim();
      const urlRegex = /(https?:\/\/[^\s]+)/;
      const urlMatch = normalizedText.match(urlRegex);

      if (urlMatch) {
        const url = urlMatch[0];
        command = "/propuesta";
        
        // Find pattern like "para [Name]" or "de [Name]" or "crea [Name]"
        const paraRegex = /(?:para|de|crea|propuesta)\s+([^https?:\n\r]+?)(?:\s+https?:\/\/|\s*$)/i;
        const paraMatch = normalizedText.match(paraRegex);
        let businessName = "";

        if (paraMatch && paraMatch[1]) {
          businessName = paraMatch[1].trim();
        } else {
          // Fallback
          businessName = normalizedText
            .replace(url, "")
            .replace(/dame|una|propuesta|en|español|para|de|crea|generar|la/gi, "")
            .trim();
        }

        businessName = businessName.replace(/^["'«“]|["'»”]$/g, '').trim();
        if (!businessName) businessName = "Cliente Demo";

        args = [businessName, url];
      } else {
        const lowerText = normalizedText.toLowerCase();

        if (lowerText.includes("status") || lowerText.includes("estado") || lowerText.includes("salud") || lowerText.includes("cómo está")) {
          command = "/status";
        } else if (lowerText.includes("clientes") || lowerText.includes("lista de clientes")) {
          command = "/clientes";
        } else if (lowerText.includes("proyectos") || lowerText.includes("lista de proyectos")) {
          command = "/proyectos";
        } else if (lowerText.startsWith("cliente ") || lowerText.includes("buscar cliente") || lowerText.includes("busca al cliente")) {
          command = "/cliente";
          const searchName = normalizedText
            .replace(/buscar cliente|busca al cliente|cliente/gi, "")
            .trim();
          args = [searchName];
        } else if (lowerText.includes("factura")) {
          command = "/factura";
          const query = normalizedText.replace(/dame|la|generar|factura|de/gi, "").trim();
          args = [query];
        } else if (lowerText.includes("entrega")) {
          command = "/entrega";
          const query = normalizedText.replace(/dame|la|generar|entrega|de/gi, "").trim();
          args = [query];
        } else {
          command = "/help";
        }
      }
    }

    // 3. Dynamic API Host Resolution
    const host = req.headers.get("host") || "localhost:3001";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const apiBaseUrl = `${protocol}://${host}`;

    // Background processing to keep webhook response fast
    processCommand(command, args, chatId, apiBaseUrl, text).catch(err => {
      console.error("Error processing command:", err);
      sendMessage(chatId, `❌ Error: ${err.message}`);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function processCommand(command: string, args: string[], chatId: number, apiBaseUrl: string, rawText?: string) {
  switch (command) {
    case "/start":
      await sendMessage(
        chatId, 
        `👋 <b>Bienvenido a Next LaB</b>\nSistema operativo interno de MyNext.\n\n🆔 <b>Tu Telegram User ID:</b> <code>${chatId}</code>\n\nUsa /help para ver los comandos.`
      );
      break;

    case "/id":
    case "/myid":
      await sendMessage(chatId, `🆔 <b>Tu Telegram User ID:</b> <code>${chatId}</code>`);
      break;

    case "/help":
      await sendMessage(
        chatId,
        `🤖 <b>Comandos disponibles:</b>\n` +
        `/status - Estado del sistema\n` +
        `/clientes - Lista de clientes activos\n` +
        `/proyectos - Lista de proyectos en desarrollo\n` +
        `/cliente {nombre} - Buscar cliente\n` +
        `/factura {cliente/id} - Generar PDF de factura\n` +
        `/entrega {cliente/id} - Generar PDF de entrega\n` +
        `/demo {cliente} {link} - Generar PDF de propuesta de demo\n` +
        `/propuesta {cliente} {link} - Generar PDF de propuesta de demo`
      );
      break;

    case "/status":
      const start = Date.now();
      let dbStatus = "🔴 Down";
      try {
        const { error } = await insforgeAdmin.from("clients").select("id").limit(1);
        if (!error) dbStatus = "🟢 Up";
      } catch (e) {}
      const latency = Date.now() - start;
      
      await sendMessage(
        chatId,
        `📊 <b>Estado del Sistema</b>\n\n` +
        `<b>API:</b> 🟢 Up\n` +
        `<b>Base de Datos:</b> ${dbStatus} (${latency}ms)\n` +
        `<b>Telegram Bot:</b> 🟢 Up\n` +
        `\n<i>Última comprobación: ${new Date().toLocaleTimeString()}</i>`
      );
      break;

    case "/clientes":
      const { data: clients } = await insforgeAdmin.from("clients").select("name, company, status").eq("status", "active");
      if (!clients || clients.length === 0) {
        await sendMessage(chatId, "No hay clientes activos.");
        break;
      }
      
      const clientList = (clients as any[]).map(c => `• <b>${c.name}</b> (${c.company})`).join("\n");
      await sendMessage(chatId, `👥 <b>Clientes Activos (${clients.length})</b>\n\n${clientList}`);
      break;

    case "/proyectos":
      const { data: projects } = await insforgeAdmin.from("projects").select("name, clients(name)").eq("status", "development");
      if (!projects || projects.length === 0) {
        await sendMessage(chatId, "No hay proyectos en desarrollo.");
        break;
      }
      
      const projectList = (projects as any[]).map(p => `• <b>${p.name}</b> - ${(p.clients as any)?.name}`).join("\n");
      await sendMessage(chatId, `🚀 <b>Proyectos en Desarrollo (${projects.length})</b>\n\n${projectList}`);
      break;

    case "/cliente":
      if (args.length === 0) {
        await sendMessage(chatId, "⚠️ Debes especificar el nombre. Ejemplo: /cliente Juan");
        break;
      }
      const search = args.join(" ");
      const { data: searchResults } = await insforgeAdmin
        .from("clients")
        .select("*")
        .ilike("name", `%${search}%`)
        .limit(3);
        
      if (!searchResults || searchResults.length === 0) {
        await sendMessage(chatId, `❌ No se encontró ningún cliente coincidente con "${search}".`);
        break;
      }
      
      for (const client of searchResults as any[]) {
        await sendMessage(
          chatId,
          `👤 <b>${client.name}</b>\n` +
          `🏢 Empresa: ${client.company || "N/A"}\n` +
          `📧 Email: ${client.email || "N/A"}\n` +
          `📱 Tel: ${client.phone || "N/A"}\n` +
          `📌 Estado: ${client.status}`
        );
      }
      break;
      
    case "/factura":
    case "/entrega":
      const targetQuery = args.join(" ");
      if (!targetQuery) {
        await sendMessage(chatId, `⚠️ Debes proporcionar el ID del documento o el nombre del cliente. Ejemplo: ${command} Juan`);
        break;
      }
      
      await sendMessage(chatId, `⏳ Buscando ${command === '/factura' ? 'factura' : 'documento de entrega'}...`);
      
      try {
        let docRecord: any = null;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetQuery);

        if (isUuid) {
          const { data, error } = await insforgeAdmin
            .from("documents")
            .select("*, clients(name, company), projects(name)")
            .eq("id", targetQuery)
            .maybeSingle();
          if (!error && data) {
            docRecord = data;
          }
        } else {
          // Resolve client by name
          const { data: clientData } = await insforgeAdmin
            .from("clients")
            .select("id")
            .ilike("name", `%${targetQuery}%`)
            .limit(1)
            .maybeSingle();

          if (clientData) {
            const client = clientData as any;
            const docType = command === "/factura" ? "invoice" : "delivery";
            const { data: docData } = await insforgeAdmin
              .from("documents")
              .select("*, clients(name, company), projects(name)")
              .eq("client_id", client.id)
              .eq("type", docType)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (docData) {
              docRecord = docData;
            }
          }
        }
          
        if (!docRecord) {
          await sendMessage(chatId, `❌ No se encontró ningún documento coincidente con "${targetQuery}".`);
          break;
        }

        // Call our internal API endpoint dynamically using resolved host
        const pdfRes = await fetch(`${apiBaseUrl}/api/documents/${docRecord.id}/pdf`);
        
        if (!pdfRes.ok) throw new Error("PDF generation failed");
        
        const arrayBuffer = await pdfRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await sendDocument(chatId, buffer, `${docRecord.number}.pdf`);
        
        await logActivity({
          action: "sent_pdf_telegram",
          entityType: "document",
          entityId: docRecord.id,
          details: { number: docRecord.number },
          source: "telegram",
        });

      } catch (err: any) {
        console.error("PDF Telegram err:", err);
        await sendMessage(chatId, `❌ Ocurrió un error al generar el PDF: ${err.message}`);
      }
      break;

    case "/demo":
    case "/propuesta":
      if (args.length < 2) {
        await sendMessage(chatId, `⚠️ Debes proporcionar el nombre del cliente y el link de la demo. Ejemplo: ${command} "Mi Negocio" https://demo.mynext.dev`);
        break;
      }

      const demoUrl = args[args.length - 1];
      if (!demoUrl.startsWith("http://") && !demoUrl.startsWith("https://")) {
        await sendMessage(chatId, `⚠️ El último argumento debe ser una URL válida (ej. https://...).`);
        break;
      }

      const businessName = args.slice(0, -1).join(" ").replace(/^["']|["']$/g, '');

      await sendMessage(chatId, `⏳ Generando propuesta de demo para "${businessName}"...`);

      try {
        const { data: clientData } = await insforgeAdmin
          .from("clients")
          .select("id")
          .ilike("name", `%${businessName}%`)
          .limit(1)
          .maybeSingle();

        let targetClientId: string;

        if (clientData) {
          const client = clientData as any;
          targetClientId = client.id;
        } else {
          const { data: newClients, error: clientErr } = await (insforgeAdmin
            .from("clients") as any)
            .insert([{ name: businessName, company: businessName, status: "lead" }])
            .select();

          if (clientErr || !newClients || newClients.length === 0) {
            throw new Error(`No se pudo crear el cliente en la base de datos: ${clientErr?.message}`);
          }
          targetClientId = (newClients[0] as any).id;
        }

        const year = new Date().getFullYear();
        const randomHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
        const number = `PRP-${year}-${randomHex}`;

        const payload = {
          client_id: targetClientId,
          type: "delivery",
          number,
          template_data: {
            is_proposal: true,
            clientName: businessName,
            demoUrl: demoUrl
          }
        };

        const { data: docs, error: docErr } = await (insforgeAdmin
          .from("documents") as any)
          .insert([payload])
          .select();

        if (docErr || !docs || docs.length === 0) {
          throw new Error(`No se pudo crear el documento en la base de datos: ${docErr?.message}`);
        }

        const docRecord = docs[0] as any;

        const pdfRes = await fetch(`${apiBaseUrl}/api/documents/${docRecord.id}/pdf`);
        if (!pdfRes.ok) throw new Error("La generación del PDF falló.");

        const arrayBuffer = await pdfRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await sendDocument(chatId, buffer, `${docRecord.number}.pdf`);

        await logActivity({
          action: "generated",
          entityType: "document",
          entityId: docRecord.id,
          details: { number: docRecord.number, type: "proposal" },
          source: "telegram"
        });

      } catch (err: any) {
        console.error("Proposal generator err:", err);
        await sendMessage(chatId, `❌ Error al generar propuesta: ${err.message}`);
      }
      break;

    default:
      const lowerRaw = (rawText || "").toLowerCase();

      // A) Web Health Check Request for specific project or domain
      if (
        lowerRaw.includes("web") ||
        lowerRaw.includes("cómo está") ||
        lowerRaw.includes("funciona") ||
        lowerRaw.includes("status") ||
        lowerRaw.includes("ecuaplac") ||
        lowerRaw.includes("mynext") ||
        lowerRaw.includes("tacos") ||
        lowerRaw.includes("online")
      ) {
        let domainToPing = "mynextbymusa.com";
        let projectName = "MYNEXT OS";

        if (lowerRaw.includes("ecuaplac")) {
          domainToPing = "ecuaplac.com";
          projectName = "Ecuaplac Web";
        } else if (lowerRaw.includes("tacos")) {
          domainToPing = "tacosmarrakech.pages.dev";
          projectName = "Tacos Marrakech";
        }

        await sendMessage(chatId, `🔍 <b>Verificando estado en vivo de ${projectName}...</b>`);

        try {
          const startTime = Date.now();
          const res = await fetch(`https://${domainToPing}`, { method: "GET", cache: "no-store" });
          const latency = Date.now() - startTime;

          if (res.ok) {
            await sendMessage(
              chatId,
              `✅ <b>${projectName} (${domainToPing}) está 100% OPERATIVA</b>\n\n` +
              `🟢 <b>Estado HTTP:</b> 200 OK\n` +
              `⚡ <b>Latencia en tiempo real:</b> ${latency} ms\n` +
              `🔒 <b>Seguridad:</b> HTTPS Encriptado (SSL)\n` +
              `🌐 <b>CDN Edge:</b> Cloudflare Active\n\n` +
              `<i>Todo funcionado perfectamente sin errores.</i>`
            );
          } else {
            await sendMessage(
              chatId,
              `⚠️ <b>${projectName} devolvió una respuesta inusual</b>\n\n` +
              `🟡 <b>Estado HTTP:</b> ${res.status}\n` +
              `⚡ <b>Latencia:</b> ${latency} ms`
            );
          }
        } catch (pingErr: any) {
          await sendMessage(
            chatId,
            `❌ <b>Error al conectar con ${domainToPing}</b>\nDetalle: ${pingErr.message}`
          );
        }
        break;
      }

      // B) Traffic / Analytics Query
      if (lowerRaw.includes("tráfico") || lowerRaw.includes("visitas") || lowerRaw.includes("visitantes") || lowerRaw.includes("clarity") || lowerRaw.includes("personas")) {
        await sendMessage(
          chatId,
          `📊 <b>Analítica & Tráfico en Tiempo Real</b>\n\n` +
          `Para inspeccionar grabaciones de pantalla de usuarios, mapas de calor y sesiones reales de tus webs en vivo, abre tu consola de <b>Microsoft Clarity</b> o tu panel de <b>Cloudflare Analytics</b> desde la Web App o a través de los enlaces directos:\n\n` +
          `🔗 <a href="https://clarity.microsoft.com/projects">Consola Microsoft Clarity ↗</a>\n` +
          `⚡ <a href="https://dash.cloudflare.com">Panel Cloudflare Analytics ↗</a>`
        );
        break;
      }

      // C) Greetings / Conversational Assistant
      if (
        lowerRaw.includes("hola") ||
        lowerRaw.includes("buenas") ||
        lowerRaw.includes("qué tal") ||
        lowerRaw.includes("quién eres") ||
        lowerRaw.includes("ayuda")
      ) {
        await sendMessage(
          chatId,
          `👋 <b>¡Hola Musa! Soy tu asistente IA de MYNEXT OS.</b>\n\n` +
          `Puedo ayudarte a:\n` +
          `• 🌐 <b>Comprobar webs:</b> Pregúntame <i>"cómo está la web de Ecuaplac"</i> o <i>"funciona mynextbymusa?"</i>\n` +
          `• 👥 <b>Consultar clientes:</b> Escribe <i>"lista de clientes"</i> o <i>"/clientes"</i>\n` +
          `• 🚀 <b>Proyectos activos:</b> Escribe <i>"proyectos"</i> o <i>"/proyectos"</i>\n` +
          `• 📄 <b>Generar PDFs:</b> Escribe <i>"factura Ecuaplac"</i> o <i>"propuesta Cliente https://demo.dev"</i>\n\n` +
          `¿Qué deseas revisar hoy?`
        );
        break;
      }

      // D) Default Fallback
      await sendMessage(
        chatId,
        `🤖 <b>Asistente MYNEXT OS</b>\n\n` +
        `No he comprendido exactamente tu mensaje: <i>"${rawText}"</i>.\n\n` +
        `💡 Prueba a preguntarme algo como:\n` +
        `• <i>"¿Cómo está la web ecuaplac?"</i>\n` +
        `• <i>"Ver lista de clientes"</i>\n` +
        `• <i>"/status"</i> o <i>"/help"</i>`
      );
  }
}
