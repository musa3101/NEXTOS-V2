# Roadmap - NEXTOS V2

## ✅ Tareas Completadas
- [x] Configuración inicial del repositorio Next.js 16 con React 19 y Tailwind CSS v4.
- [x] Conexión en vivo con la cuenta principal de Cloudflare (`mynextbymusa@gmail.com`).
- [x] Detección automática de dominios personalizados (`mynextbymusa.com`, `ecuaplac.com`).
- [x] Paleta flotante interactiva por proyecto (`ProjectDetailModal`) al hacer clic en cualquier recuadro.
- [x] Comprobación de salud server-side en vivo (código HTTP 200, latencia en ms, SSL y CDN Ray ID).
- [x] Acceso directo a Microsoft Clarity y Cloudflare Analytics desde cada proyecto.
- [x] Experiencia Web App móvil para iPhone con Barra de Navegación Inferior (Bottom Tab Bar).
- [x] Datos reales de Cloudflare Pages API (despliegues totales, commit hash, rama activa) — sin datos falsos.
- [x] Plantillas PDF rediseñadas: Facturas (estilo ECUAPLAC) y Entregas/Propuestas (estilo dark luxury bilingüe).
- [x] Migración completa de backend de Supabase a InsForge (PostgreSQL + SDK `@insforge/sdk`).
- [x] Creación de esquema y tablas relacionales en InsForge (`clients`, `projects`, `documents`, `activity_logs`, `telegram_messages`).
- [x] Sincronización automática de proyectos Cloudflare con InsForge (12 proyectos y 12 clientes).
- [x] Modal de Ajustes de Administrador y Cierre de Sesión seguro e independiente en el Sidebar.
- [x] Eliminación de métricas ficticias de Ubuntu y visualización de infraestructura real en Dashboard.
- [x] Botón interactivo "Refrescar Cloudflare" con spinner y sincronización bidireccional.
- [x] Selector de Clientes y Proyectos en Documentos con carga anticipada y estados claros.
- [x] Botón de despliegue manual a Cloudflare Pages ("Desplegar Ahora") integrado en el modal del proyecto.
- [x] Configuración de `TELEGRAM_AUTHORIZED_USER_ID` en `.env.local` y Vercel (Producción, Preview y Dev).
- [x] Informe matutino diario a las 8:00 AM por Telegram probado y operativo.
- [x] **Asistente de IA Conversacional para Telegram (`src/lib/telegram-ai.ts`):**
  - Conectado a InsForge OpenRouter AI (`google/gemini-2.5-flash`).
  - Memoria conversacional por chat en PostgreSQL (`telegram_messages`).
  - Sin comandos obligatorios: diálogo fluido en lenguaje natural español.
  - Generación de preguntas guiadas si faltan datos para facturas o propuestas.
  - Ejecución de herramientas (Function Calling): salud de webs, clientes, proyectos, despliegues y PDFs.
  - Envío automático de archivos PDF oficiales al chat de Telegram.
- [x] 100% de suites de tests unitarios pasando (24/24 pruebas).
- [x] Despliegue en producción verificado en `https://nextos-v2.vercel.app`.

## 🔄 Tareas en Progreso
- [ ] Optimización continua de respuestas y herramientas del asistente de IA.

## 🎯 Próximas Mejoras Prioritarias
- [ ] Soporte para notas de voz en Telegram (transcripción automática con Whisper a texto).
- [ ] Sección de filtros avanzados y exportación CSV de clientes y facturas.
