"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  ShieldCheck, 
  Database, 
  Globe, 
  MessageSquare, 
  RefreshCw, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSettingsModal({ isOpen, onClose }: AdminSettingsModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleSyncCloudflare = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      // Trigger clients background sync
      const res = await fetch("/api/clients");
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["clients"] });
        await queryClient.invalidateQueries({ queryKey: ["cloudflare-projects"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        await queryClient.invalidateQueries({ queryKey: ["projects"] });
        setSyncStatus("¡Sincronización completada con éxito!");
      } else {
        setSyncStatus("Error al sincronizar con Cloudflare.");
      }
    } catch (err) {
      setSyncStatus("Fallo de conexión al sincronizar.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        onClose();
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#333] shadow-2xl bg-[#121217] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="relative h-24 overflow-hidden border-b border-white/10">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/bg/header-bg.jpg)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-black/60 to-black/30" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-black/50 text-[#A3A3A3] hover:text-white border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar & Identity */}
        <div className="relative px-6 pb-4 pt-0">
          <div className="-mt-12 mb-3 flex items-end justify-between">
            <div className="relative">
              <img 
                src="/logo2.jpg" 
                alt="Admin Avatar" 
                className="w-20 h-20 rounded-2xl border-2 border-[#D4A853] object-cover shadow-2xl bg-[#111]"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#121217]"></span>
              </span>
            </div>
            <Badge className="bg-[#D4A853]/15 text-[#D4A853] border border-[#D4A853]/40 text-[10px] uppercase font-bold tracking-widest px-3 py-1">
              Super Administrador
            </Badge>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Admin</h2>
            <p className="text-xs text-[#A3A3A3] font-mono mt-0.5">mynextbymusa@gmail.com</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-2 space-y-5 overflow-y-auto max-h-[60vh]">
          
          {/* Services connectivity info */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3]">
              Infraestructura Conectada
            </span>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">InsForge PostgreSQL</p>
                    <p className="text-[10px] text-[#888]">Base de datos relacional (eu-central)</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Activo
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F38020]/10 text-[#F38020] border border-[#F38020]/20">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Cloudflare Pages & Edge</p>
                    <p className="text-[10px] text-[#888]">12 Proyectos en tiempo real</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Conectado
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#229ED9]/10 text-[#229ED9] border border-[#229ED9]/20">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Telegram Bot API</p>
                    <p className="text-[10px] text-[#888]">Webhooks y notificaciones matutinas</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Online
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick sync action */}
          <div className="p-4 rounded-xl bg-[#1A1A22] border border-[#D4A853]/20 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Sincronización Cloudflare ↔ InsForge</p>
                <p className="text-[11px] text-[#A3A3A3]">Descarga y actualiza clientes y sitios activos.</p>
              </div>
              <Button
                size="sm"
                onClick={handleSyncCloudflare}
                disabled={isSyncing}
                className="bg-[#D4A853] hover:bg-[#c39742] text-black font-semibold text-xs px-3 rounded-lg cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Sincronizando..." : "Sincronizar"}
              </Button>
            </div>
            {syncStatus && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{syncStatus}</span>
              </div>
            )}
          </div>

          {/* Danger zone / Logout */}
          <div className="border-t border-[#333]/60 pt-4">
            {!confirmLogout ? (
              <Button
                variant="ghost"
                onClick={() => setConfirmLogout(true)}
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl justify-center text-xs font-semibold py-2.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            ) : (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                <p className="text-xs text-red-300 font-semibold text-center">
                  ¿Seguro que deseas cerrar la sesión de NextOS?
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmLogout(false)}
                    className="flex-1 text-xs text-[#bbb] hover:text-white border border-[#444]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                  >
                    {isLoggingOut ? "Saliendo..." : "Sí, Cerrar Sesión"}
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
