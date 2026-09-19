"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarClock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Zap, 
  Plus, 
  RefreshCw,
  Search,
  Sparkles,
  CalendarPlus,
  ArrowUpRight
} from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface MaintenanceItem {
  id: string;
  name: string;
  clientName: string;
  url: string;
  createdOn: string;
  lastMaintenanceOn: string;
  nextMaintenanceOn: string;
  cycleDays: number;
  daysRemaining: number;
  status: "ok" | "warning" | "urgent";
  googleCalendarUrl: string;
  checklist: {
    backups: boolean;
    sslDns: boolean;
    depsSecurity: boolean;
    speedAudit: boolean;
  };
  notes: string;
}

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "ok" | "warning" | "urgent">("all");
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const { data, isLoading, refetch, isRefetching } = useQuery<{
    success: boolean;
    count: number;
    urgentCount: number;
    warningCount: number;
    data: MaintenanceItem[];
  }>({
    queryKey: ["maintenance-items"],
    queryFn: async () => {
      const res = await fetch("/api/maintenance");
      if (!res.ok) throw new Error("Failed to fetch maintenance items");
      return res.json();
    },
  });

  const toggleCheck = (itemId: string, taskKey: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [`${itemId}-${taskKey}`]: !prev[`${itemId}-${taskKey}`]
    }));
  };

  const items = data?.data || [];

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && item.status === filterStatus;
  });

  const totalCount = items.length;
  const okCount = items.filter(i => i.status === "ok").length;
  const warningCount = items.filter(i => i.status === "warning").length;
  const urgentCount = items.filter(i => i.status === "urgent").length;

  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* ═══ HERO HEADER (gpt-taste & uipro-max) ═══ */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#D4A853]/25 shadow-2xl group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/header-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/50" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 md:p-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A853]"></span>
              </span>
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4A853]">
                Operaciones & Garantías Técnicas
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl">
              Mantenimiento <span className="font-light text-[#A3A3A3]">&amp; Calendario</span>
            </h1>

            <p className="text-sm md:text-base text-[#c4c4c4] font-medium leading-relaxed max-w-prose">
              Ciclo de vida y revisiones periódicas de todas las webs desplegadas. Registra la creación, programa las inspecciones y sincroniza con Google Calendar en 1 clic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="bg-black/40 hover:bg-black/60 border border-white/10 text-white text-xs font-semibold rounded-xl h-11 px-4 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 text-[#D4A853] ${isRefetching ? "animate-spin" : ""}`} />
              {isRefetching ? "Actualizando..." : "Sincronizar"}
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ BENTO KPI COUNTERS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141417]/80 backdrop-blur-md border border-white/10 hover:border-[#D4A853]/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888]">Total Webs</span>
            <div className="p-2 rounded-xl bg-white/5 text-[#D4A853]">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight mt-2">{totalCount}</p>
          <span className="text-[11px] text-[#777] font-medium">Sitios con mantenimiento</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141417]/80 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888]">Al Día</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 tracking-tight mt-2">{okCount}</p>
          <span className="text-[11px] text-[#777] font-medium">Revisión &gt; 15 días</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141417]/80 backdrop-blur-md border border-white/10 hover:border-amber-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888]">Próximas</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400 tracking-tight mt-2">{warningCount}</p>
          <span className="text-[11px] text-[#777] font-medium">En menos de 10 días</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141417]/80 backdrop-blur-md border border-white/10 hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888]">Urgentes</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-400 tracking-tight mt-2">{urgentCount}</p>
          <span className="text-[11px] text-[#777] font-medium">Vencidos o hoy</span>
        </div>
      </div>

      {/* ═══ FILTROS Y BÚSQUEDA ═══ */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-[#141417]/60 backdrop-blur-md border border-white/10">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]" />
          <input
            type="text"
            placeholder="Buscar por web o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 hover:border-[#D4A853]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A853] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 self-stretch sm:self-auto justify-center overflow-x-auto">
          {(["all", "ok", "warning", "urgent"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? "bg-[#D4A853] text-black shadow-sm"
                  : "text-[#888] hover:text-white"
              }`}
            >
              {st === "all" ? "Todos" : st === "ok" ? "Al Día" : st === "warning" ? "Próximos" : "Urgentes"}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ LISTADO BENTO DE PROYECTOS ═══ */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3">
          <Loader size={1.2} />
          <span className="text-xs text-[#888] font-bold uppercase tracking-wider animate-pulse">
            Calculando ciclos y calendarios...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#141417]/40 border border-white/10">
          <CalendarClock className="w-10 h-10 text-[#444] mx-auto mb-3" />
          <p className="text-white font-bold text-base">No hay revisiones con este filtro</p>
          <p className="text-xs text-[#777] mt-1">Prueba cambiando el término de búsqueda o el estado del filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const isUrgent = item.status === "urgent";
            const isWarning = item.status === "warning";
            const isOk = item.status === "ok";

            return (
              <div 
                key={item.id}
                className={`relative overflow-hidden rounded-2xl bg-[#141417]/80 backdrop-blur-xl border transition-all duration-300 p-6 flex flex-col justify-between group hover:shadow-2xl ${
                  isUrgent 
                    ? "border-rose-500/40 hover:border-rose-500/70" 
                    : isWarning 
                    ? "border-amber-500/35 hover:border-amber-500/60" 
                    : "border-white/10 hover:border-[#D4A853]/40"
                }`}
              >
                {/* Status Glow Indicator */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white tracking-tight truncate capitalize">
                        {item.name}
                      </h3>
                      {isUrgent ? (
                        <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0.5 px-2 rounded-full border border-rose-500/40 bg-rose-500/15 text-rose-300">
                          Vencido
                        </Badge>
                      ) : isWarning ? (
                        <Badge variant="warning" className="text-[10px] uppercase font-bold py-0.5 px-2 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300">
                          {item.daysRemaining} días
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px] uppercase font-bold py-0.5 px-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          Al día
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#999] font-medium truncate">
                      Cliente: <span className="text-white font-semibold">{item.clientName}</span>
                    </p>
                  </div>

                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-black/40 border border-white/10 text-[#888] hover:text-[#D4A853] hover:border-[#D4A853]/30 transition-all shrink-0 cursor-pointer"
                    title={`Visitar ${item.url}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Timeline info dates */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5 mb-5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#777] block">Creación / Lanzamiento</span>
                    <span className="text-white font-semibold mt-0.5 block">{formatDate(item.createdOn)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#777] block">Próxima Revisión</span>
                    <span className={`font-bold mt-0.5 block ${isUrgent ? "text-rose-400" : isWarning ? "text-amber-400" : "text-white"}`}>
                      {formatDate(item.nextMaintenanceOn)}
                    </span>
                  </div>
                </div>

                {/* Checklist preventivo */}
                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#777] block">
                    Protocolo Preventivo (Checklist)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label 
                      onClick={() => toggleCheck(item.id, "ssl")}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={completedItems[`${item.id}-ssl`] ?? item.checklist.sslDns}
                        readOnly
                        className="rounded border-[#333] text-[#D4A853] focus:ring-[#D4A853] bg-[#111] w-4 h-4 accent-[#D4A853]"
                      />
                      <span className="text-[#ccc] text-[11px] font-medium">SSL &amp; DNS Cloudflare</span>
                    </label>

                    <label 
                      onClick={() => toggleCheck(item.id, "backups")}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={completedItems[`${item.id}-backups`] ?? item.checklist.backups}
                        readOnly
                        className="rounded border-[#333] text-[#D4A853] focus:ring-[#D4A853] bg-[#111] w-4 h-4 accent-[#D4A853]"
                      />
                      <span className="text-[#ccc] text-[11px] font-medium">Backup BD &amp; Storage</span>
                    </label>

                    <label 
                      onClick={() => toggleCheck(item.id, "deps")}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={completedItems[`${item.id}-deps`] ?? item.checklist.depsSecurity}
                        readOnly
                        className="rounded border-[#333] text-[#D4A853] focus:ring-[#D4A853] bg-[#111] w-4 h-4 accent-[#D4A853]"
                      />
                      <span className="text-[#ccc] text-[11px] font-medium">Parches de Seguridad</span>
                    </label>

                    <label 
                      onClick={() => toggleCheck(item.id, "speed")}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={completedItems[`${item.id}-speed`] ?? item.checklist.speedAudit}
                        readOnly
                        className="rounded border-[#333] text-[#D4A853] focus:ring-[#D4A853] bg-[#111] w-4 h-4 accent-[#D4A853]"
                      />
                      <span className="text-[#ccc] text-[11px] font-medium">Test de Velocidad</span>
                    </label>
                  </div>
                </div>

                {/* Direct Google Calendar Action Button */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#777] font-semibold">Ciclo: {item.cycleDays} días</span>
                  
                  <a
                    href={item.googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#c39742] hover:from-[#e0b45e] hover:to-[#ce9f46] active:scale-[0.98] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#D4A853]/15 transition-all cursor-pointer"
                    title="Añadir recordatorio y checklist en Google Calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Google Calendar</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
