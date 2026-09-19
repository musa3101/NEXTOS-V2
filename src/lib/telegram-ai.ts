import { insforgeAdmin } from "@/lib/insforge/server";
import { sendMessage, sendDocument } from "@/lib/telegram";
import { getCloudflareProjects, getPrimaryProjectUrl, triggerCloudflareDeploy } from "@/lib/cloudflare";
import { generateInvoicePdf, generateDeliveryPdf, generateProposalPdf } from "@/lib/pdf/generate";
import { logActivity } from "@/lib/activity";
import {
  getLatestCommits,
  getCommitDetails,
  getRepositoryStatus,
  listUserRepositories,
  getWorkflowRuns,
} from "@/lib/github";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Primary direct free engine: Google AI Studio gemini-3.6-flash (100% gratis, multimodal y con function calling)
const GOOGLE_MODEL = "gemini-3.6-flash";
// Fallbacks en OpenRouter si Google estuviera saturado
const OPENROUTER_PRIMARY_MODEL = process.env.OPENROUTER_CHAT_MODEL || "google/gemini-2.5-flash";
const OPENROUTER_FALLBACK_MODEL = "meta-llama/llama-3.3-70b-instruct";

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
      name: "remember_user_fact",
      description: "Guarda un dato, preferencia o instrucción permanente sobre Musa, su negocio, sus clientes o acuerdos para recordarlo siempre en futuras conversaciones.",
      parameters: {
        type: "object",
        properties: {
          fact: {
            type: "string",
            description: "Información importante que Musa quiere que recuerdes siempre (ej: 'El NIF de Musa es 12345678Z', 'A Pedro le aplicamos 15% de descuento', etc.).",
          },
        },
        required: ["fact"],
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
      description: "Genera un documento PDF oficial de Propuesta Interactiva (diseño Luxury MyNext) con el botón dorado interactivo [TU WEB], y lo envía por Telegram.",
      parameters: {
        type: "object",
        properties: {
          businessName: {
            type: "string",
            description: "Nombre del negocio o cliente para quien se prepara la propuesta.",
          },
          demoUrl: {
            type: "string",
            description: "URL de la web o prototipo interactivo (ej: 'https://shopisafer.com' o 'https://demo.mynextbymusa.com'). OBLIGATORIO para el botón [TU WEB].",
          },
          clientName: {
            type: "string",
            description: "Nombre de pila del cliente (ej: 'Camila', 'Goyo').",
          },
          adminUrl: {
            type: "string",
            description: "URL opcional al panel de administración o backend (para incluir botón adicional [PANEL ADMIN]).",
          },
          features: {
            type: "array",
            items: { type: "string" },
            description: "Pilares o puntos destacados de la propuesta (ej: Experiencia de usuario, Panel de gestión).",
          },
          introMessage: {
            type: "string",
            description: "Mensaje introductorio personalizado (opcional).",
          },
          closingMessage: {
            type: "string",
            description: "Mensaje de cierre o llamada de seguimiento (opcional).",
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
      description: "Genera un Acta de Entrega oficial de proyecto web en PDF con el botón interactivo [TU WEB] y la envía por Telegram.",
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
          demoUrl: {
            type: "string",
            description: "URL pública de la web entregada (ej: 'https://ecuaplac.com' o 'https://blessdbarber.pages.dev'). OBLIGATORIA para que el cliente pueda pulsar [TU WEB] y acceder.",
          },
          adminUrl: {
            type: "string",
            description: "URL opcional al panel de control o backend del cliente (para incluir botón [PANEL ADMIN]).",
          },
          deliverables: {
            type: "array",
            items: { type: "string" },
            description: "Lista de funcionalidades, mejoras o entregables realizados (SEO, diseño responsive, panel backend, etc.).",
          },
          summary: {
            type: "string",
            description: "Resumen introductorio del trabajo realizado (opcional).",
          },
          closingMessage: {
            type: "string",
            description: "Mensaje de cierre y soporte post-entrega (opcional).",
          },
        },
        required: ["clientName", "projectName", "demoUrl"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_github_activity",
      description: "Consulta los últimos commits, fecha, autor y estado general de un repositorio en GitHub. Por defecto revisa el repositorio principal NEXTOS-V2.",
      parameters: {
        type: "object",
        properties: {
          repo: {
            type: "string",
            description: "Nombre del repositorio (ej: 'NEXTOS-V2'). Por defecto 'NEXTOS-V2'.",
          },
          limit: {
            type: "number",
            description: "Número de commits a consultar (por defecto 5).",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_github_commit_details",
      description: "Consulta el detalle profundo de un commit específico en GitHub: archivos modificados, líneas añadidas/eliminadas y resumen de cambios.",
      parameters: {
        type: "object",
        properties: {
          sha: {
            type: "string",
            description: "El hash SHA o identificador del commit (ej: 'e696432').",
          },
          repo: {
            type: "string",
            description: "Nombre del repositorio (por defecto 'NEXTOS-V2').",
          },
        },
        required: ["sha"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_github_ci_status",
      description: "Comprueba el estado de las GitHub Actions, pruebas automáticas y workflows de CI/CD para detectar si hubo fallos de compilación o tests.",
      parameters: {
        type: "object",
        properties: {
          repo: {
            type: "string",
            description: "Nombre del repositorio (por defecto 'NEXTOS-V2').",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_github_repos",
      description: "Lista los repositorios en la cuenta de GitHub de Musa (musa3101) con su visibilidad y fecha de última actualización.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

// Base System Prompt
const SYSTEM_PROMPT = `Eres el Asistente Ejecutivo de Inteligencia Artificial de NextOS y MyNext, diseñado exclusivamente para Musa.
Tu propósito es actuar como su copiloto de confianza, proactivo, resolutivo y eficiente en Telegram.

CONTEXTO DE MUSA Y MYNEXT:
- Musa es el fundador, desarrollador principal y director de MyNext (agencia de tecnología, software a medida y desarrollo web de alto impacto con base en Palma de Mallorca).
- Marca y plataforma insignia: mynextbymusa.com.
- Sistema operativo interno: NextOS (Next.js 16, InsForge PostgreSQL, Cloudflare Edge CDN, PDFs automáticos).
- Cuenta y repositorios en GitHub: musa3101 (repositorio principal del sistema: NEXTOS-V2).
- Filosofía de trabajo: Máxima exigencia estética (dark mode premium, estética luxury suiza / Bento Grid, tipografía impecable) y rendimiento técnico extremo.

ACCESO DIRECTO A GITHUB (musa3101):
- Tienes acceso total a los repositorios de GitHub de Musa.
- Si Musa pregunta qué ha pasado en el repo, qué cambios se subieron, o si algo falló, usa 'get_github_activity' o 'get_github_commit_details' para revisar los commits y archivos modificados.
- Puedes verificar si los builds o workflows pasaron con 'get_github_ci_status' y listar proyectos con 'list_github_repos'.
- Filosofía de trabajo: Máxima exigencia estética (dark mode premium, estética luxury suiza / Bento Grid, tipografía impecable) y rendimiento técnico extremo.

CLIENTES VIP Y PROYECTOS CLAVE (Webs pagadas y en producción):
1. Ecuaplac (ecuaplac.com): Cliente prioritario de reformas, placas y acabados interiores en Palma.
2. Gran Marrakech: Restaurante marroquí de alta gastronomía en Palma de Mallorca.
3. Tacos Marrakech: Cadena de tacos con dos locales activos en Palma (Pere Garau y Plaza Columnas).
4. Blessed Barber Studio (blessedstudio.pages.dev): Barbería y estética masculina premium.
5. Bar Luna Llena (barlunallena.pages.dev): Restauración y tapas.
6. Mezquita Ar-Rahma: Proyecto web comunitario.
7. SaaS propios: NextTrade (plataforma trading/finanzas) y NextLead (lead generation y scraping con Apify).

COMPORTAMIENTO Y TONO:
- Comunícate en español natural, cercano, resolutivo y profesional. Trata a Musa cordialmente y como tu director.
- NUNCA fuerces a Musa a usar comandos de barra (como /factura o /status) ni sintaxis rígida. Comprende el lenguaje natural libremente.
- Si Musa te saluda ("Hola", "Qué tal", "Buenas"), salúdalo con calidez y ofrécele ayuda con sus webs, clientes, facturas o proyectos.
- Facturación: IVA del 21% por defecto. Si faltan datos clave para una factura o propuesta (concepto, precio o link), pregúntale amablemente en una o dos preguntas cortas.

REGLA DE ORO SUPREMA: URL DE LA WEB EN PROPUESTAS Y ENTREGAS (PDFs Interactivos):
- Todos los documentos de Propuesta comercial ('create_proposal') y de Acta de Entrega de proyecto ('create_delivery') incorporan un botón dorado central [TU WEB] para que el cliente pulse y entre directamente a su web o demo interactiva.
- POR TANTO, LA URL DE LA WEB ('demoUrl') ES SIEMPRE ESTRICTAMENTE OBLIGATORIA.
- Si Musa te pide generar una propuesta o un acta de entrega y NO ha proporcionado la URL de la web:
  ¡ESTÁ TERMINANTEMENTE PROHIBIDO INVENTARTE LA URL O EJECUTAR LA HERRAMIENTA SIN ELLA!
  DEBES RESPONDERLE AMABLEMENTE PIDIÉNDOLE LA URL DE LA WEB ANTES DE CONTINUAR:
  "Musa, ¿cuál es la URL de la web para enlazar el botón [TU WEB] interactivo en el PDF?"
- Solo cuando Musa te dé la URL de la web (o si ya la incluyó en su mensaje), ejecutas la herramienta correspondiente ('create_proposal' o 'create_delivery') para generar el PDF y enviárselo directamente a Telegram.

- Cuando tengas todos los datos, ejecuta la herramienta correspondiente ('create_invoice', 'create_proposal', 'create_delivery', 'get_system_health', etc.). Las herramientas de PDF generarán el documento y se lo enviarán como archivo adjunto a su Telegram al instante.
- ALERTA CRÍTICA: Si mynextbymusa.com o las webs de sus clientes prioritarios (Ecuaplac, Tacos Marrakech, Gran Marrakech, Blessed Studio, Luna Llena) tienen caídas o problemas, avísale con máxima prioridad.
- Si Musa te indica algún dato nuevo que recordar, guárdalo con 'remember_user_fact'.
- Respeta la brevedad adecuada para mensajería de Telegram: mensajes claros, sin rodeos innecesarios y formateados limpiamente.`;

/**
 * Handle incoming conversational message from Telegram
 */
export async function handleTelegramAI(chatId: number | string, userText: string): Promise<void> {
  const chatIdStr = chatId.toString();

  try {
    // 1. Save user message to InsForge database
    await (insforgeAdmin.from("telegram_messages") as any).insert([
      {
        chat_id: chatIdStr,
        role: "user",
        content: userText,
      },
    ]);

    // 2. Fetch persistent durable memories for this chat
    let persistentMemoryText = "";
    try {
      const { data: memories } = await (insforgeAdmin.from("telegram_user_memory") as any)
        .select("memory_text")
        .eq("chat_id", chatIdStr)
        .order("created_at", { ascending: true });

      if (memories && memories.length > 0) {
        persistentMemoryText =
          "\n\nMEMORIA PERMANENTE RECORDADA SOBRE MUSA Y SU NEGOCIO:\n" +
          memories.map((m: any, i: number) => `• ${m.memory_text}`).join("\n");
      }
    } catch (_) {}

    // 3. Fetch recent conversation history (last 20 messages for rich conversational context)
    const { data: historyData } = await (insforgeAdmin.from("telegram_messages") as any)
      .select("role, content")
      .eq("chat_id", chatIdStr)
      .order("created_at", { ascending: false })
      .limit(20);

    const history = (historyData || []).reverse().map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // 4. Assemble messages for LLM
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT + persistentMemoryText },
      ...history,
    ];

    if (messages[messages.length - 1]?.content !== userText) {
      messages.push({ role: "user", content: userText });
    }

    // 5. Call OpenRouter AI
    const completion = await callOpenRouter(messages, AI_TOOLS);
    const choice = completion.choices?.[0];
    const assistantMessage = choice?.message;

    if (!assistantMessage) {
      await sendMessage(chatId, "⚠️ No pude procesar tu mensaje en este momento. Inténtalo de nuevo.");
      return;
    }

    // 6. Check if model decided to call tools
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

    // Direct conversational reply
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
 * Call AI API with priority to Google AI Studio (100% free, ultra-fast gemini-3.6-flash)
 * and automatic fallback to OpenRouter.
 */
async function callOpenRouter(messages: any[], tools?: any[]): Promise<any> {
  const geminiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY || OPENROUTER_API_KEY;

  // 1. Primary Engine: Google AI Studio (100% gratis, sin coste de saldo, ultra-rápido)
  if (geminiKey) {
    try {
      const payload: any = {
        model: GOOGLE_MODEL,
        messages,
      };

      if (tools && tools.length > 0) {
        payload.tools = tools;
        payload.tool_choice = "auto";
      }

      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${geminiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }

      const errorText = await res.text();
      console.warn(`Google AI Studio status ${res.status}: ${errorText}. Activando fallback a OpenRouter...`);
    } catch (e) {
      console.warn("Google AI Studio connection error, activando fallback a OpenRouter:", e);
    }
  }

  // 2. Fallback Engine: OpenRouter
  if (!openRouterKey) {
    throw new Error("Ni GEMINI_API_KEY ni OPENROUTER_API_KEY están configuradas en las variables de entorno.");
  }

  const payload: any = {
    model: OPENROUTER_PRIMARY_MODEL,
    messages,
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
    payload.tool_choice = "auto";
  }

  const headers = {
    "Authorization": `Bearer ${openRouterKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://nextos-v2.vercel.app",
    "X-Title": "NextOS V2 Telegram Assistant",
  };

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }

    console.warn(`OpenRouter primary model ${OPENROUTER_PRIMARY_MODEL} returned ${res.status}, trying fallback ${OPENROUTER_FALLBACK_MODEL}...`);
  } catch (e) {
    console.warn(`OpenRouter primary model error, trying fallback ${OPENROUTER_FALLBACK_MODEL}:`, e);
  }

  // Fallback to secondary model on OpenRouter
  payload.model = OPENROUTER_FALLBACK_MODEL;
  const fallbackRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!fallbackRes.ok) {
    const errorBody = await fallbackRes.text();
    console.error("OpenRouter fallback error:", errorBody);
    throw new Error(`OpenRouter HTTP ${fallbackRes.status}: ${errorBody}`);
  }

  return await fallbackRes.json();
}


/**
 * Tool Execution Dispatcher
 */
async function executeTool(name: string, args: any, chatId: number | string): Promise<any> {
  switch (name) {
    case "remember_user_fact": {
      try {
        await (insforgeAdmin.from("telegram_user_memory") as any).insert([
          {
            chat_id: chatId.toString(),
            memory_text: args.fact,
          },
        ]);
        return { success: true, saved: args.fact };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    case "get_system_health": {
      try {
        const projects = await getCloudflareProjects();
        const browserHeaders = {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        };

        const siteResults = await Promise.all(
          (projects || []).map(async (project) => {
            const { url, displayDomain } = getPrimaryProjectUrl(project);
            const defaultUrl = `https://${project.subdomain || project.domains?.[0] || `${project.name}.pages.dev`}`;
            const start = Date.now();

            try {
              let res = await fetch(url, {
                method: "GET",
                headers: browserHeaders,
                cache: "no-store",
                signal: AbortSignal.timeout(7000),
              });

              // If custom domain is challenged with 403 by Cloudflare WAF on datacenter IP, check pages.dev
              if (res.status === 403 && url !== defaultUrl) {
                try {
                  const fallbackRes = await fetch(defaultUrl, {
                    method: "GET",
                    headers: browserHeaders,
                    cache: "no-store",
                    signal: AbortSignal.timeout(5000),
                  });
                  if (fallbackRes.ok) {
                    res = fallbackRes;
                  }
                } catch (_) {}
              }

              return {
                name: project.name,
                domain: displayDomain,
                ok: res.ok,
                status: res.status,
                latency: Date.now() - start,
              };
            } catch (e: any) {
              // Fallback check on network/abort error
              if (url !== defaultUrl) {
                try {
                  const fallbackRes = await fetch(defaultUrl, {
                    method: "GET",
                    headers: browserHeaders,
                    cache: "no-store",
                    signal: AbortSignal.timeout(5000),
                  });
                  if (fallbackRes.ok) {
                    return {
                      name: project.name,
                      domain: displayDomain,
                      ok: true,
                      status: 200,
                      latency: Date.now() - start,
                    };
                  }
                } catch (_) {}
              }

              return {
                name: project.name,
                domain: displayDomain,
                ok: false,
                status: 0,
                latency: Date.now() - start,
                error: e.message,
              };
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
        const demoUrl = args.demoUrl;
        if (!demoUrl) {
          throw new Error("La URL de la web (demoUrl) es obligatoria para incluir el botón interactivo [TU WEB].");
        }

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
              template_data: {
                is_proposal: true,
                clientName: args.clientName || businessName,
                businessName,
                demoUrl,
                adminUrl: args.adminUrl,
                features: args.features,
              },
            },
          ])
          .select();

        // 4. Render PDF with Luxury MyNext Proposal layout
        const pdfBuffer = await generateProposalPdf({
          businessName,
          clientName: args.clientName,
          demoUrl,
          adminUrl: args.adminUrl,
          features: args.features,
          introMessage: args.introMessage,
          closingMessage: args.closingMessage,
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
            details: { number, type: "proposal", businessName, demoUrl },
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
        const demoUrl = args.demoUrl || args.webUrl;
        if (!demoUrl) {
          throw new Error("La URL de la web (demoUrl) es obligatoria para incluir el botón interactivo [TU WEB].");
        }

        const deliverables = args.deliverables || args.features || [
          "Diseño Web Adaptativo y optimización Mobile-First",
          "Optimización SEO y posicionamiento local",
          "Alojamiento de ultra-alta velocidad en Cloudflare CDN",
          "Certificado de seguridad SSL HTTPS activo",
          "Formulario de contacto y enlaces directos a WhatsApp",
        ];

        const year = new Date().getFullYear();
        const randHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
        const number = `ENT-${year}-${randHex}`;

        // 1. Save document in database
        let clientId: string;
        const { data: existingClient } = await (insforgeAdmin.from("clients") as any)
          .select("id")
          .ilike("name", `%${clientName}%`)
          .limit(1)
          .maybeSingle();

        if (existingClient?.id) {
          clientId = existingClient.id;
        } else {
          const { data: created } = await (insforgeAdmin.from("clients") as any)
            .insert([{ name: clientName, company: clientName, status: "active" }])
            .select();
          clientId = created?.[0]?.id || "";
        }

        const { data: docRecord } = await (insforgeAdmin.from("documents") as any)
          .insert([
            {
              client_id: clientId || null,
              type: "delivery",
              number,
              template_data: {
                is_proposal: false,
                clientName,
                projectName,
                demoUrl,
                adminUrl: args.adminUrl,
                deliverables,
                summary: args.summary,
              },
            },
          ])
          .select();

        // 2. Render Delivery PDF
        const pdfBuffer = await generateDeliveryPdf({
          number,
          date: new Date().toLocaleDateString("es-ES"),
          client: {
            name: clientName,
            company: clientName,
          },
          project: {
            name: projectName,
            demoUrl,
            adminUrl: args.adminUrl,
          },
          deliverables,
          summary: args.summary,
          closingMessage: args.closingMessage,
        });

        // 3. Send to Telegram
        await sendDocument(chatId, pdfBuffer, `${number}.pdf`);

        // 4. Log activity
        if (docRecord?.[0]?.id) {
          await logActivity({
            action: "created",
            entityType: "document",
            entityId: docRecord[0].id,
            details: { number, type: "delivery", clientName, projectName, demoUrl },
            source: "telegram",
          });
        }

        return {
          success: true,
          number,
          clientName,
          projectName,
          demoUrl,
          pdfSent: true,
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    case "get_github_activity": {
      try {
        const repo = args.repo || "NEXTOS-V2";
        const limit = args.limit || 5;
        const commits = await getLatestCommits(repo, limit);
        const repoInfo = await getRepositoryStatus(repo);
        return {
          repo,
          defaultBranch: repoInfo.defaultBranch,
          openIssues: repoInfo.openIssuesCount,
          lastPushedAt: repoInfo.pushedAt,
          recentCommits: commits,
        };
      } catch (err: any) {
        return { error: err.message };
      }
    }

    case "get_github_commit_details": {
      try {
        const repo = args.repo || "NEXTOS-V2";
        const details = await getCommitDetails(args.sha, repo);
        if (!details) return { error: `No se encontró el commit ${args.sha} en ${repo}` };
        return {
          sha: details.sha,
          author: details.author,
          date: details.date,
          message: details.message,
          totalFilesChanged: details.files.length,
          stats: details.stats,
          changedFiles: details.files.map((f: any) => ({
            file: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            snippet: f.patchSnippet,
          })),
        };
      } catch (err: any) {
        return { error: err.message };
      }
    }

    case "get_github_ci_status": {
      try {
        const repo = args.repo || "NEXTOS-V2";
        const runs = await getWorkflowRuns(repo);
        return {
          repo,
          totalRunsFound: runs.totalCount,
          runs: runs.runs || [],
        };
      } catch (err: any) {
        return { error: err.message };
      }
    }

    case "list_github_repos": {
      try {
        const repos = await listUserRepositories(10);
        return {
          total: repos.length,
          repos,
        };
      } catch (err: any) {
        return { error: err.message };
      }
    }

    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}


// ============================================================
// MULTIMODAL SUPPORT (Images + Voice/Audio)
// ============================================================

export interface MultimodalInput {
  type: "image" | "audio";
  base64DataUri: string;
  mimeType: string;
  userText: string;
}

/**
 * Handle incoming multimodal message (photo or voice/audio) from Telegram.
 * Constructs a multimodal content array for Gemini/OpenRouter and processes
 * the response with full tool calling + memory support.
 */
export async function handleTelegramAIMultimodal(
  chatId: number | string,
  input: MultimodalInput
): Promise<void> {
  const chatIdStr = chatId.toString();

  try {
    // 1. Save user message to DB (text representation)
    const messageLabel =
      input.type === "image"
        ? `📸 [Imagen] ${input.userText}`
        : `🎙️ [Audio] ${input.userText}`;

    await (insforgeAdmin.from("telegram_messages") as any).insert([
      {
        chat_id: chatIdStr,
        role: "user",
        content: messageLabel,
      },
    ]);

    // 2. Fetch persistent memories
    let persistentMemoryText = "";
    try {
      const { data: memories } = await (insforgeAdmin.from("telegram_user_memory") as any)
        .select("memory_text")
        .eq("chat_id", chatIdStr)
        .order("created_at", { ascending: true });

      if (memories && memories.length > 0) {
        persistentMemoryText =
          "\n\nMEMORIA PERMANENTE RECORDADA SOBRE MUSA Y SU NEGOCIO:\n" +
          memories.map((m: any) => `• ${m.memory_text}`).join("\n");
      }
    } catch (_) {}

    // 3. Fetch recent conversation history (last 20 messages)
    const { data: historyData } = await (insforgeAdmin.from("telegram_messages") as any)
      .select("role, content")
      .eq("chat_id", chatIdStr)
      .order("created_at", { ascending: false })
      .limit(20);

    const history = (historyData || []).reverse().map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // 4. Build multimodal content for the current message
    const multimodalContent: any[] = [];

    if (input.type === "image") {
      multimodalContent.push({
        type: "image_url",
        image_url: { url: input.base64DataUri },
      });
    } else if (input.type === "audio") {
      // For audio: Gemini on OpenRouter supports input_audio content parts
      multimodalContent.push({
        type: "input_audio",
        input_audio: {
          data: input.base64DataUri.split(",")[1] || input.base64DataUri,
          format: input.mimeType.includes("ogg") ? "ogg" : input.mimeType.includes("mp3") ? "mp3" : "wav",
        },
      });
    }

    // Always include the user text alongside the media
    multimodalContent.push({
      type: "text",
      text: input.userText,
    });

    // 5. Assemble messages for LLM
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT + persistentMemoryText },
      ...history.slice(0, -1), // History except the last (which is the current multimodal message label)
      {
        role: "user",
        content: multimodalContent,
      },
    ];

    // 6. Call OpenRouter AI (with tools)
    const completion = await callOpenRouter(messages, AI_TOOLS);
    const choice = completion.choices?.[0];
    const assistantMessage = choice?.message;

    if (!assistantMessage) {
      await sendMessage(chatId, "⚠️ No pude procesar tu mensaje en este momento. Inténtalo de nuevo.");
      return;
    }

    // 7. Handle tool calls (same flow as text messages)
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      messages.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        let args: any = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch (_) {}

        const toolResult = await executeTool(functionName, args, chatId);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Second call for final conversational response
      const secondCompletion = await callOpenRouter(messages);
      const finalContent = secondCompletion.choices?.[0]?.message?.content || "✅ Acción completada.";

      await (insforgeAdmin.from("telegram_messages") as any).insert([
        { chat_id: chatIdStr, role: "assistant", content: finalContent },
      ]);

      await sendMessage(chatId, finalContent);
      return;
    }

    // 8. Direct conversational reply
    const replyContent = assistantMessage.content || "Entendido, Musa. ¿En qué más puedo ayudarte?";

    await (insforgeAdmin.from("telegram_messages") as any).insert([
      { chat_id: chatIdStr, role: "assistant", content: replyContent },
    ]);

    await sendMessage(chatId, replyContent);
  } catch (error: any) {
    console.error("Error in handleTelegramAIMultimodal:", error);
    await sendMessage(
      chatId,
      `❌ Error al procesar el ${input.type === "image" ? "imagen" : "audio"}: ${error.message || "Error desconocido"}`
    );
  }
}
