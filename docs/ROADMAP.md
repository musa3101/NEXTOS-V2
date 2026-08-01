# Roadmap - NEXTOS V2

## ✅ Tareas Completadas
- [x] Configuración inicial del repositorio Next.js 16 con React 19 y Tailwind CSS v4 en rama `dev`.
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

## 🔄 Tareas en Progreso
- [ ] Subir todos los cambios de `dev` a `main` y desplegar en Vercel (pendiente de OK del usuario).
- [ ] Conexión de métricas extendidas de clientes y facturación.

## 🎯 Próximas Mejoras Prioritarias
- [ ] Disparador de despliegues (Trigger Deploy) manual a Cloudflare desde NextOS.
- [ ] Generar `CRON_SECRET` en Vercel para proteger el endpoint del informe matutino.
- [ ] Integrar API real de Microsoft Clarity para métricas embebidas (si disponible).
- [ ] Sección de actividad reciente en el Dashboard (últimos documentos, deploys, pings).
