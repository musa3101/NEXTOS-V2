import { insforgeAdmin } from "@/lib/insforge/server";
import { sendMessage, sendDocument } from "@/lib/telegram";
import { getCloudflareProjects, getPrimaryProjectUrl, triggerCloudflareDeploy } from "@/lib/cloudflare";
import { generateInvoicePdf, generateDeliveryPdf, generateProposalPdf } from "@/lib/pdf/generate";
import { logActivity } from "@/lib/activity";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = process.env.OPENROUTER_CHAT_MODEL || "google/gemini-2.5-flash";

// Tool schemas for OpenRouter function calling
const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_system_health",
      description: "Comprueba el estado de salud, disponibilidad HTTP y latencia en vivo de todas las webs en Cloudflare y la base de datos.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_clients",
      description: "Obtiene la lista de clientes registrados en el CRM de NextOS.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Filtrar por estado: 'active', 'lead' o 'all'. Por defecto 'active'.",
            enum: ["active", "lead", "all"],
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_projects",
      description: "Obtiene la lista de proyectos web y sitios alojados en Cloudflare Pages.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "trigger_deploy",
      description: "Dispara una nueva compilación y despliegue inmediato en Cloudflare Pages para un proyecto web.",
      parameters: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "Nombre del proyecto en Cloudflare Pages (ej: 'ecuaplac', 'mynext', 'nextlead').",
          },
          branch: {
            type: "string",
            description: "Rama a desplegar (por defecto 'main').",
          },
        },
        required: ["projectName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_invoice",
      description: "Genera una factura oficial en PDF, la registra en la base de datos de NextOS y la envía directamente al Telegram de Musa.",
      parameters: {
        type: "object",
        properties: {
          clientName: {
            type: "string",
            description: "Nombre de la persona o contacto del cliente.",
          },
          company: {
            type: "string",
            description: "Nombre comercial o razón social de la empresa o negocio.",
          },
          clientAddress: {
            type: "string",
            description: "Dirección, ciudad o NIF/CIF del cliente (opcional).",
          },
          items: {
            type: "array",
            description: "Líneas de la factura (conceptos a cobrar).",
            items: {
              type: "object",
              properties: {
                description: { type: "string", description: "Descripción del servicio o producto." },
                quantity: { type: "number", description: "Cantidad (por defecto 1)." },
                unitPrice: { type: "number", description: "Precio unitario sin IVA en euros (€)." },
              },
              required: ["description", "unitPrice"],
            },
          },
          taxRate: {
            type: "number",
            description: "Porcentaje de IVA a aplicar (por defecto 21). Si es exento, usar 0.",
          },
        },
        required: ["clientName", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_proposal",
      description: "Genera un documento PDF oficial de Propuesta de Demo (diseño Luxury MyNext) con el enlace de la demo web, y lo envía por Telegram.",
      parameters: {
        type: "object",
        properties: {
          businessName: {
            type: "string",
            description: "Nombre del negocio o cliente para quien se prepara la propuesta.",
          },
          demoUrl: {
            type: "string",
            description: "URL de la demo o prototipo web (ej: 'https://demo.mynext.dev/restaurante').",
          },
        },
        required: ["businessName", "demoUrl"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_delivery",
      description: "Genera un Acta de Entrega oficial de proyecto web en PDF y la envía por Telegram.",
      parameters: {
        type: "object",
        properties: {
          clientName: {
            type: "string",
            description: "Nombre del cliente o empresa.",
          },
          projectName: {
            type: "string",
            description: "Nombre del proyecto o web entregada.",
          },
          features: {
            type: "array",
            description: "Lista de funcionalidades o entregables incluidos.",
            items: { type: "string" },
          },
        },
        required: ["clientName", "projectName"],
      },
    },
  },
];

// System Prompt configuring the conversational persona
const SYSTEM_PROMPT = `Eres el Asistente de Inteligencia Artificial de NextOS y MyNext, diseñado exclusivamente para Musa.
Tu propósito es actuar como su copiloto ejecutivo, conversacional, eficiente y proactivo en Telegram.

COMPORTAMIENTO Y TONO:
- Comunícate en español natural, cercano, resolutivo y profesional. Trata a Musa cordialmente.
- NUNCA fuerces a Musa a usar comandos de barra (como /factura o /status) ni sintaxis rígida. Comprende el lenguaje natural libremente.
- Si Musa te saluda ("Hola", "Qué tal", "Buenos días"), salúdalo con calidez y ofrécele ayuda con sus webs, clientes, facturas o proyectos.
- Si Musa te pide generar una factura o propuesta pero faltan datos indispensables (por ejemplo, en una factura falta el concepto o el importe; en una propuesta falta la URL de la demo):
  -> PREGÚNTALE amablemente lo que necesitas en una o dos preguntas cortas y directas.
  -> NO inventes precios ni URLs ficticias a menos que él te diga "pon lo que quieras" o te dé datos concretos.
- Cuando tengas los datos necesarios:
  -> Ejecuta la herramienta correspondiente ('create_invoice', 'create_proposal', 'get_system_health', etc.).
  -> Las herramientas de PDF generarán el documento automáticamente y lo enviarán como archivo adjunto a su Telegram.
  -> Tras ejecutar la herramienta, confírmaselo a Musa con un breve resumen amigable y los datos clave (número de documento, importe total, etc.).
- Respeta la brevedad adecuada para mensajería de Telegram: mensajes claros, sin rodeos innecesarios y formateados de manera limpia.`;

/**
 * Handle incoming conversational message from Telegram
 */
export async function handleTelegramAI(chatId: number | string, userText: string): Promise<void> {
  const chatIdStr = chatId.toString();

  try {
    // 1. Save user message to InsForge database for conversation history
    await (insforgeAdmin.from("telegram_messages") as any).insert([
      {
        chat_id: chatIdStr,
        role: "user",
        content: userText,
      },
    ]);

    // 2. Fetch recent conversation history (last 8 messages)
    const { data: historyData } = await (insforgeAdmin.from("telegram_messages") as any)
      .select("role, content")
      .eq("chat_id", chatIdStr)
      .order("created_at", { ascending: false })
      .limit(8);

    const history = (historyData || []).reverse().map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // 3. Assemble messages for LLM
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

    // If history didn't include the current user message (e.g. race condition), ensure it's present
    if (messages[messages.length - 1]?.content !== userText) {
      messages.push({ role: "user", content: userText });
    }

    // 4. Call OpenRouter AI
    const completion = await callOpenRouter(messages, AI_TOOLS);
    const choice = completion.choices?.[0];
    const assistantMessage = choice?.message;

    if (!assistantMessage) {
      await sendMessage(chatId, "⚠️ No pude procesar tu mensaje en este momento. Inténtalo de nuevo.");
      return;
    }

    // 5. Check if model decided to call tools
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      messages.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        let args: any = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch (_) {}

        // Execute corresponding tool
        const toolResult = await executeTool(functionName, args, chatId);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Second call to get final conversational response after tool execution
      const secondCompletion = await callOpenRouter(messages);
      const secondChoice = secondCompletion.choices?.[0];
      const finalContent = secondChoice?.message?.content || "✅ Acción completada con éxito.";

      // Save assistant response to DB
      await (insforgeAdmin.from("telegram_messages") as any).insert([
        {
          chat_id: chatIdStr,
          role: "assistant",
          content: finalContent,
        },
      ]);

      await sendMessage(chatId, finalContent);
      return;
    }

    // Direct conversational reply (e.g., asking for missing info or casual conversation)
    const replyContent = assistantMessage.content || "Entendido, Musa. ¿En qué más puedo ayudarte?";

    // Save assistant response to DB
    await (insforgeAdmin.from("telegram_messages") as any).insert([
      {
        chat_id: chatIdStr,
        role: "assistant",
        content: replyContent,
      },
    ]);

    await sendMessage(chatId, replyContent);
  } catch (error: any) {
    console.error("Error in handleTelegramAI:", error);
    await sendMessage(
      chatId,
      `❌ Hubo un error al procesar tu solicitud: ${error.message || "Error desconocido"}`
    );
  }
}

/**
 * Call OpenRouter API with fallback support
 */
async function callOpenRouter(messages: any[], tools?: any[]): Promise<any> {
  const apiKey = process.env.OPENROUTER_API_KEY || OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY no está configurada en las variables de entorno.");
  }

  const payload: any = {
    model: DEFAULT_MODEL,
    messages,
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
    payload.tool_choice = "auto";
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://nextos-v2.vercel.app",
      "X-Title": "NextOS V2 Telegram Assistant",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("OpenRouter API error:", errorBody);
    throw new Error(`OpenRouter HTTP ${res.status}: ${errorBody}`);
  }

  return await res.json();
}

/**
 * Tool Execution Dispatcher
 */
async function executeTool(name: string, args: any, chatId: number | string): Promise<any> {
  switch (name) {
    case "get_system_health": {
      try {
        const projects = await getCloudflareProjects();
        const siteResults = await Promise.all(
          (projects || []).map(async (project) => {
            const { url, displayDomain } = getPrimaryProjectUrl(project);
            const start = Date.now();
            try {
              const res = await fetch(url, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(6000) });
              return { name: project.name, domain: displayDomain, ok: res.ok, status: res.status, latency: Date.now() - start };
            } catch (e: any) {
              return { name: project.name, domain: displayDomain, ok: false, status: 0, latency: Date.now() - start, error: e.message };
            }
          })
        );

        const up = siteResults.filter((s) => s.ok).length;
        const total = siteResults.length;

        let dbStatus = "ok";
        try {
          await insforgeAdmin.from("clients").select("id").limit(1);
        } catch (_) {
          dbStatus = "error";
        }

        return {
          totalWebsites: total,
          onlineWebsites: up,
          offlineWebsites: total - up,
          databaseStatus: dbStatus,
          sites: siteResults.map((s) => ({
            name: s.name,
            domain: s.domain,
            status: s.ok ? "ONLINE (200 OK)" : `ERROR (${s.status})`,
            latencyMs: s.latency,
          })),
        };
      } catch (err: any) {
        return { error: err.message };
      }
    }

    case "list_clients": {
      try {
        const query = insforgeAdmin.from("clients").select("id, name, company, email, status");
        if (args.status && args.status !== "all") {
          query.eq("status", args.status);
        }
        const { data, error } = await query;
        if (error) throw error;
        return { clients: data || [] };
      } catch (err: any) {
        return { error: err.message };
      }
    }

    case "list_projects": {
      try {
        const projects = await getCloudflareProjects();
        return {
          total: (projects || []).length,
          projects: (projects || []).map((p: any) => ({
            name: p.name,
            domains: p.domains || [p.subdomain],
            productionBranch: p.production_branch || "main",
          })),
        };
      } catch (err: any) {
        return { error: err.message };
      }
    }

    case "trigger_deploy": {
      try {
        const result = await triggerCloudflareDeploy(args.projectName, args.branch || "main");
        await logActivity({
          action: "deploy",
          entityType: "project",
          details: { projectName: args.projectName, branch: args.branch || "main", deploymentId: result.deploymentId },
          source: "telegram",
        });
        return {
          success: true,
          projectName: args.projectName,
          deploymentId: result.deploymentId,
          url: result.url,
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    case "create_invoice": {
      try {
        const clientName = args.clientName || "Cliente";
        const company = args.company || clientName;
        const items = args.items || [{ description: "Servicios Digitales", quantity: 1, unitPrice: 100 }];
        const taxRate = typeof args.taxRate === "number" ? args.taxRate : 21;

        // 1. Find or create client in database
        let clientId: string;
        const { data: existingClient } = await (insforgeAdmin.from("clients") as any)
          .select("id")
          .ilike("name", `%${clientName}%`)
          .limit(1)
          .maybeSingle();

        if (existingClient?.id) {
          clientId = existingClient.id;
        } else {
          const { data: created, error: clientErr } = await (insforgeAdmin.from("clients") as any)
            .insert([{ name: clientName, company, status: "active" }])
            .select();
          if (clientErr || !created?.[0]) throw new Error("No se pudo registrar al cliente.");
          clientId = created[0].id;
        }

        // 2. Generate sequential number
        const year = new Date().getFullYear();
        const randHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
        const number = `FAC-${year}-${randHex}`;

        const subtotal = items.reduce((acc: number, item: any) => acc + (item.unitPrice * (item.quantity || 1)), 0);
        const taxAmount = (subtotal * taxRate) / 100;
        const totalAmount = subtotal + taxAmount;

        // 3. Save document in database
        const { data: docRecord, error: docErr } = await (insforgeAdmin.from("documents") as any)
          .insert([
            {
              client_id: clientId,
              type: "invoice",
              number,
              total_amount: totalAmount,
              status: "sent",
              template_data: {
                clientAddress: args.clientAddress || "",
                items,
                taxRate,
              },
            },
          ])
          .select();

        if (docErr || !docRecord?.[0]) throw new Error(`Error al guardar documento: ${docErr?.message}`);

        // 4. Render PDF
        const pdfBuffer = await generateInvoicePdf({
          number,
          date: new Date().toLocaleDateString("es-ES"),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES"),
          client: {
            name: clientName,
            company,
            address: args.clientAddress || "",
          },
          items: items.map((i: any) => ({
            description: i.description,
            quantity: i.quantity || 1,
            unitPrice: i.unitPrice,
          })),
          taxRate,
        });

        // 5. Send PDF directly to Telegram
        await sendDocument(chatId, pdfBuffer, `${number}.pdf`);

        // 6. Log activity
        await logActivity({
          action: "created",
          entityType: "document",
          entityId: docRecord[0].id,
          details: { number, totalAmount, clientName },
          source: "telegram",
        });

        return {
          success: true,
          number,
          client: clientName,
          totalAmount: totalAmount.toFixed(2),
          subtotal: subtotal.toFixed(2),
          taxRate,
          pdfSent: true,
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    case "create_proposal": {
      try {
        const businessName = args.businessName || "Negocio";
        const demoUrl = args.demoUrl || "https://mynext.dev";

        // 1. Find or create client
        let clientId: string;
        const { data: existingClient } = await (insforgeAdmin.from("clients") as any)
          .select("id")
          .ilike("name", `%${businessName}%`)
          .limit(1)
          .maybeSingle();

        if (existingClient?.id) {
          clientId = existingClient.id;
        } else {
          const { data: created } = await (insforgeAdmin.from("clients") as any)
            .insert([{ name: businessName, company: businessName, status: "lead" }])
            .select();
          clientId = created?.[0]?.id || "";
        }

        // 2. Generate sequential number
        const year = new Date().getFullYear();
        const randHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
        const number = `PRP-${year}-${randHex}`;

        // 3. Save document
        const { data: docRecord } = await (insforgeAdmin.from("documents") as any)
          .insert([
            {
              client_id: clientId || null,
              type: "delivery",
              number,
              status: "sent",
              template_data: {
                is_proposal: true,
                clientName: businessName,
                businessName,
                demoUrl,
              },
            },
          ])
          .select();

        // 4. Render PDF
        const pdfBuffer = await generateProposalPdf({
          businessName,
          demoUrl,
          number,
          date: new Date().toLocaleDateString("es-ES"),
        });

        // 5. Send PDF
        await sendDocument(chatId, pdfBuffer, `${number}.pdf`);

        // 6. Log activity
        if (docRecord?.[0]?.id) {
          await logActivity({
            action: "created",
            entityType: "document",
            entityId: docRecord[0].id,
            details: { number, type: "proposal", businessName },
            source: "telegram",
          });
        }

        return {
          success: true,
          number,
          businessName,
          demoUrl,
          pdfSent: true,
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    case "create_delivery": {
      try {
        const clientName = args.clientName || "Cliente";
        const projectName = args.projectName || "Proyecto Web";
        const deliverables = args.features || args.deliverables || ["Diseño Web Adaptativo", "Alojamiento Cloudflare CDN", "Certificado SSL HTTPS"];

        const year = new Date().getFullYear();
        const randHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
        const number = `ENT-${year}-${randHex}`;

        const pdfBuffer = await generateDeliveryPdf({
          number,
          date: new Date().toLocaleDateString("es-ES"),
          client: {
            name: clientName,
            company: clientName,
          },
          project: {
            name: projectName,
          },
          deliverables,
        });

        await sendDocument(chatId, pdfBuffer, `${number}.pdf`);

        return {
          success: true,
          number,
          clientName,
          projectName,
          pdfSent: true,
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}
