"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, ActivitySquare, MessageSquare, Database, Globe } from "lucide-react";

const BG_IMAGES = [
  "/bg/header-bg.jpg",
  "/bg/chart-bg.jpg",
  "/bg/actions-bg.jpg",
  "/bg/resources-bg.jpg",
];

export default function MonitoringPage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["monitoring-health"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("Failed to fetch health");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5s for monitoring page
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ═══ HEADER with background image ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#333]/50 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/actions-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#D4A853] animate-ping" />
              <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest drop-shadow-lg">Estado del Sistema</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-xl">Monitorización</h1>
            <p className="text-[#d1d1d1] text-sm mt-0.5 drop-shadow-lg">Estado del sistema en tiempo real.</p>
          </div>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-[#d1d1d1] drop-shadow-md">
              {isLoading ? "Conectando..." : "Actualizado en tiempo real"}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ SERVICE CARDS with background images ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MonitorCard 
          title="Base de Datos (Supabase)" 
          description="Almacenamiento principal y autenticación"
          status={health?.services?.supabase?.status}
          latency={health?.services?.supabase?.latency}
          icon={Database}
          bgImage={BG_IMAGES[0]}
        />
        <MonitorCard 
          title="API Interna (NextOS)" 
          description="Endpoints de lógica de negocio"
          status={health?.services?.api?.status}
          latency={health?.services?.api?.latency}
          icon={ActivitySquare}
          bgImage={BG_IMAGES[1]}
        />
        <MonitorCard 
          title="Telegram Bot API" 
          description="Servicio de mensajería y webhooks"
          status={health?.services?.telegram?.status}
          icon={MessageSquare}
          bgImage={BG_IMAGES[2]}
        />
        <MonitorCard 
          title="Cloudflare Edge" 
          description="CDN y Firewall (Fase 2)"
          status={health?.services?.cloudflare?.status || "pending"}
          icon={Globe}
          bgImage={BG_IMAGES[3]}
        />
      </div>
    </div>
  );
}

function MonitorCard({ title, description, status, latency, icon: Icon, bgImage }: any) {
  const isUp = status === "up";
  const isPending = status === "pending";

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#333]/80 shadow-lg hover-glow transition-all duration-300 group h-full">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      
      {/* Decorative large icon */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity z-[1]">
        <Icon className="w-24 h-24 text-white" />
      </div>
      
      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-[#D4A853]/30 shadow-[0_0_12px_rgba(212,168,83,0.15)]">
            <Icon className="w-6 h-6 text-[#D4A853]" />
          </div>
          <Badge variant={isUp ? "success" : isPending ? "warning" : "danger"} className="backdrop-blur-md shadow-md">
            {isUp ? "Operativo" : isPending ? "Próximamente" : "Caído"}
          </Badge>
        </div>
        
        <div className="mt-auto">
          <h3 className="text-lg font-semibold text-white drop-shadow-lg">{title}</h3>
          <p className="text-sm text-[#ccc] mt-1 drop-shadow-md">{description}</p>
          
          {latency !== undefined && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#ccc] bg-black/30 backdrop-blur-sm p-2.5 rounded-lg border border-white/5 w-fit drop-shadow-sm">
              <Server className="w-3 h-3 text-[#D4A853]" />
              Latencia: <span className="text-white font-semibold">{latency}ms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
