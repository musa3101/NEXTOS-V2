# ROADMAP — NEXTOS V2

## ✅ Completado

- [x] Layout base (sidebar, header, bottom nav móvil, drawer)
- [x] Autenticación con InsForge (login, sesión, logout)
- [x] Dashboard con stats, proyectos Cloudflare, gráfica, actividad e infraestructura
- [x] Sección Clientes — lista, filtro, búsqueda, formulario de creación, sync Cloudflare
- [x] Sección Proyectos — lista y gestión de proyectos
- [x] Sección Documentos — listado, generación de facturas y actas de entrega en PDF
- [x] Sección Actividad — registro de operaciones
- [x] Sección Monitorización — estado de servicios e infraestructura
- [x] Bot de Telegram AI conversacional con memoria persistente y tool calling
  - Herramientas: `get_system_health`, `list_clients`, `list_projects`, `trigger_deploy`, `create_invoice`, `create_proposal`, `create_delivery`, `remember_user_fact`
- [x] Bot de Telegram — soporte multimodal (fotos 📸 y notas de voz 🎙️) con Gemini 2.5 Flash
- [x] Responsividad móvil completa en Documentos y Clientes (vistas card en iPhone)
- [x] Merge dev→main + deploy automático en Vercel

---

## 🔄 En progreso / Próximos pasos prioritarios

- [ ] **Previsualización de documentos** — Modal/drawer con visor inline del PDF al pulsar icono "ojo" en la tabla de documentos
- [ ] **Probar bot multimodal en Telegram** — Enviar fotos y audios reales y validar respuestas
- [ ] **Responsividad móvil** en páginas de Proyectos, Actividad y Monitorización (si fuera necesario)
- [ ] **Mejoras en formulario de facturas** — Guardar borradores, numeración automática personalizable

---

## 💡 Ideas para más adelante

- [ ] Notificaciones push / alertas automáticas cuando una web cae
- [ ] Panel de analítica de ingresos con gráficas reales (facturas por mes)
- [ ] Modo edición de clientes y proyectos (formulario inline)
- [ ] Integración de pagos con Stripe (NextTrade / NextLead SaaS)
- [ ] Exportar listado de documentos a CSV/Excel
