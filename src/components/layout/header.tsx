"use client";

import { usePathname } from "next/navigation";
import { Menu, Plus, FileText, Sparkles, Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const [alerting, setAlerting] = useState(false);
  
  // Very basic breadcrumbs logic
  const segments = pathname.split("/").filter(Boolean);
  let title = "Dashboard";
  if (segments.length > 0) {
    title = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    if (title === "Clients") title = "Clientes";
    if (title === "Projects") title = "Proyectos";
    if (title === "Documents") title = "Documentos";
    if (title === "Activity") title = "Actividad";
    if (title === "Monitoring") title = "Monitorización";
  }

  async function sendTestAlert() {
    if (alerting) return;
    setAlerting(true);
    try {
      await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "🔔 NextOS — Alerta de Prueba",
          body: "Las notificaciones push están funcionando correctamente en tu iPhone.",
          url: "/monitoring",
          urgency: "high",
        }),
      });
    } catch {}
    setTimeout(() => setAlerting(false), 2000);
  }

  return (
    <header className="min-h-16 pt-[env(safe-area-inset-top)] glass border-b border-[#333] flex items-center justify-between px-3 sm:px-4 md:px-8 bg-[#111]/70 sticky top-0 z-30 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-2 h-16">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            aria-label="Abrir menú de navegación"
            className="md:hidden p-2 text-[#A3A3A3] hover:text-white rounded-xl hover:bg-[#262626]/60 transition-colors border border-transparent active:scale-95 cursor-pointer touch-manipulation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Document Action on Mobile & Desktop */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/documents?action=new&type=invoice"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#D4A853]/15 border border-[#D4A853]/35 text-[#D4A853] hover:bg-[#D4A853]/25 transition-all active:scale-95 text-xs font-semibold touch-manipulation"
            title="Crear Factura"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Factura</span>
            <span className="sm:hidden">Factura</span>
          </Link>
          <Link
            href="/documents?action=new&type=proposal"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/35 text-blue-400 hover:bg-blue-500/25 transition-all active:scale-95 text-xs font-semibold touch-manipulation"
            title="Crear Propuesta de Demo"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Propuesta</span>
            <span className="sm:hidden">Demo</span>
          </Link>
        </div>

        {/* 🔔 Push Alert Button */}
        <button
          onClick={sendTestAlert}
          title="Enviar notificación de prueba al iPhone"
          className={`p-2 rounded-xl border transition-all active:scale-95 touch-manipulation ${
            alerting
              ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10 animate-pulse"
              : "text-[#A3A3A3] hover:text-[#D4A853] border-transparent hover:border-[#D4A853]/30 hover:bg-[#D4A853]/10"
          }`}
          aria-label="Enviar alerta push"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* System Status indicator */}
        <div className="hidden lg:flex text-xs text-[#A3A3A3] items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Sistema Operativo
        </div>
      </div>
    </header>
  );
}
