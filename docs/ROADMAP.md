# ROADMAP — NextOS v2

## ✅ Completado

### v2.0 — Base
- [x] Estructura Next.js 14 App Router
- [x] Autenticación con cookie segura
- [x] Layout responsivo (sidebar + mobile nav)
- [x] Dashboard con KPIs y stats

### v2.1 — Clientes & Proyectos
- [x] CRUD completo de clientes
- [x] CRUD completo de proyectos
- [x] Integración Cloudflare Pages API
- [x] Sincronización automática de dominios

### v2.2 — Documentos & PDF
- [x] Generación de facturas PDF
- [x] Generación de propuestas PDF
- [x] Generación de albaranes PDF
- [x] Templates con logos MN

### v2.3 — Bot Telegram + Responsive Móvil
- [x] Bot de Telegram multimodal (texto, fotos, voz)
- [x] Navegación móvil nativa (bottom nav iOS)
- [x] Safe area insets para iPhone

### v2.4 — Identidad + Sesión + Notificaciones (HOY)
- [x] Icono de app iPhone (logo2.jpg como favicon + apple-icon)
- [x] Manifest PWA completo
- [x] Sesión por inactividad (3 días, rolling cookie)
- [x] Modal de bienvenida dinámico (Buenos días/tardes/noches señor Musa)
- [x] Resumen de actividad por ausencia al entrar
- [x] Web Push Notifications → iPhone nativo
- [x] Service Worker para notificaciones en background
- [x] Alerta automática push si InsForge o Cloudflare caen
- [x] Botón 🔔 en header para test de notificaciones
- [x] Base de datos de clientes desde Cloudflare (CSV + JSON)

---

## 🔄 En progreso

- [ ] Sección de Clientes en NextOS integrada con `clientes_cloudflare.json`
- [ ] Bot Telegram responde con datos de clientes al pedir facturas

---

## 📋 Próximas mejoras prioritarias

### Alta prioridad
1. **Integración clientes → bot Telegram** — Al pedir factura por Telegram, el bot busca los datos del cliente en la DB y rellena automáticamente
2. **Sección Clientes en NextOS** — Tabla, filtros, y vista detalle de cada cliente con todos sus proyectos
3. **Notificaciones en app** — Centro de notificaciones dentro de NextOS (historial de alertas)

### Media prioridad
4. **Informes automáticos mensuales** — PDF de resumen mensual enviado por Telegram/email
5. **Calendario de mantenimientos** — Vista tipo agenda con recordatorios push
6. **Multi-idioma** — Español / Inglés para documentos de clientes internacionales

### Baja prioridad
7. **Dark/Light mode toggle** — Modo claro opcional
8. **Export CSV desde la app** — Exportar clientes/proyectos desde el dashboard
