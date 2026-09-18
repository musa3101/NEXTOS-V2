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
- [x] Bot de Telegram con NLP en español (ping de webs, consulta de clientes, saludos conversacionales).
- [x] Informe matutino diario a las 8:00 AM por Telegram con estado de todas las webs.
- [x] Safe area en barra móvil inferior para iPhone (Home indicator).
- [x] Migración completa de backend de Supabase a InsForge (PostgreSQL + SDK `@insforge/sdk`).
- [x] Creación de esquema y tablas relacionales en InsForge (`clients`, `projects`, `documents`, `activity_logs`).
- [x] Sincronización automática de proyectos Cloudflare con InsForge (12 proyectos y 12 clientes).
- [x] Modal de Ajustes de Administrador y Cierre de Sesión seguro e independiente en el Sidebar.
- [x] Eliminación de métricas ficticias de Ubuntu y visualización de infraestructura real en Dashboard.
- [x] Botón interactivo "Refrescar Cloudflare" con spinner y sincronización bidireccional.
- [x] Selector de Clientes y Proyectos en Documentos con carga anticipada y estados claros.
- [x] Configuración de variables de Cloudflare e InsForge en Vercel y despliegue a producción en `main`.
- [x] 100% de suites de tests unitarios pasando (24/24 pruebas).

## 🔄 Tareas en Progreso
- [ ] Validación continua del informe matutino de Telegram.

## 🎯 Próximas Mejoras Prioritarias
- [ ] Configurar `TELEGRAM_AUTHORIZED_USER_ID` en Vercel para habilitar el envío del informe diario a las 8:00 AM.
- [ ] Sección de filtros avanzados y exportación CSV de clientes y facturas.
