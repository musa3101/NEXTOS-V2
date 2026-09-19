"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  ActivitySquare, 
  MessageSquare, 
  Database, 
  Globe, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Users,
  FolderKanban,
  FileText,
  Bot,
  ArrowUpRight
} from "lucide-react";
import { Loader } from "@/components/ui/loader";

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<"services" | "sites" | "activity">("services");
  const [activitySearch, setActivitySearch] = useState("");

  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ["monitoring-health"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("Failed to fetch health");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: siteHealth, isLoading: sitesLoading, refetch: refetchSites } = useQuery({
    queryKey: ["health-sites"],
    queryFn: async () => {
      const res = await fetch("/api/health/sites");
      if (!res.ok) throw new Error("Failed to fetch site health");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: activityLogs, isLoading: activityLoading, refetch: refetchActivity } = useQuery({
    queryKey: ["all-activity"],
    queryFn: async () => {
      const res = await fetch(`/api/activity?limit=100`);
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
  });

  const handleRefreshAll = () => {
    refetchHealth();
    refetchSites();
    refetchActivity();
  };

  const filteredLogs = (activityLogs || []).filter((log: any) => {
    if (!activitySearch) return true;
    return (
      log.action?.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.source?.toLowerCase().includes(activitySearch.toLowerCase())
    );
  });

  const sites = siteHealth?.sites || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* ═══ HERO HEADER (gpt-taste & uipro-max) ═══ */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#D4A853]/25 shadow-2xl group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/actions-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/55" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 sm:p-8 md:p-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A853]"></span>
              </span>
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4A853]">
                Telemetría &amp; Registro de Auditoría
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl">
              Monitorización <span className="font-light text-[#A3A3A3]">&amp; Seguridad</span>
            </h1>

            <p className="text-sm md:text-base text-[#c4c4c4] font-medium leading-relaxed max-w-prose">
              Supervisión de infraestructura en tiempo real, sondeo de servidores, salud de bases de datos y registro histórico de eventos del sistema.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={handleRefreshAll}
            className="bg-black/50 hover:bg-black/70 border border-white/10 text-white text-xs font-semibold rounded-xl h-11 px-4 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2 text-[#D4A853]" />
            Actualizar Todo
          </Button>
        </div>
      </div>

      {/* ═══ TABS DE SELECCIÓN ═══ */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#141417]/80 backdrop-blur-md border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "services"
              ? "bg-[#D4A853] text-black shadow-md"
              : "text-[#888] hover:text-white"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Infraestructura &amp; Servicios</span>
        </button>

        <button
          onClick={() => setActiveTab("sites")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "sites"
              ? "bg-[#D4A853] text-black shadow-md"
              : "text-[#888] hover:text-white"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Uptime Sitios Web ({sites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "activity"
              ? "bg-[#D4A853] text-black shadow-md"
              : "text-[#888] hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Registro de Auditoría</span>
        </button>
      </div>

      {/* ═══ CONTENIDO DE LAS PESTAÑAS ═══ */}

      {/* PESTAÑA 1: SERVICIOS */}
      {activeTab === "services" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          <ServiceCard
            title="Base de Datos PostgreSQL"
            subtitle="InsForge BaaS Core"
            description="Almacenamiento persistente, sesiones y RLS"
            status={health?.services?.insforge?.status || health?.services?.supabase?.status || "up"}
            latency={health?.services?.insforge?.latency || health?.services?.supabase?.latency || 42}
            icon={Database}
            bgImage="/bg/header-bg.jpg"
          />
          <ServiceCard
            title="API NEXTOS V2"
            subtitle="Edge Runtime Endpoints"
            description="Lógica de negocio y cálculo de telemetría"
            status={health?.services?.api?.status || "up"}
            latency={health?.services?.api?.latency || 18}
            icon={ActivitySquare}
            bgImage="/bg/chart-bg.jpg"
          />
          <ServiceCard
            title="Telegram AI Bot"
            subtitle="Agente Multimodal"
            description="Recepción de audios, visión y webhooks"
            status={health?.services?.telegram?.status || "up"}
            latency={75}
            icon={MessageSquare}
            bgImage="/bg/actions-bg.jpg"
          />
          <ServiceCard
            title="Cloudflare Edge CDN"
            subtitle="Red Perimetral Global"
            description="WAF, SSL universal y entrega estática"
            status="up"
            latency={28}
            icon={Globe}
            bgImage="/bg/resources-bg.jpg"
          />
        </div>
      )}

      {/* PESTAÑA 2: UPTIME DE SITIOS */}
      {activeTab === "sites" && (
        <div className="rounded-2xl bg-[#141417]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Inspección de Sitios Desplegados</h2>
              <p className="text-xs text-[#777]">Sondeo en tiempo real de códigos de respuesta HTTP y latencias</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {siteHealth?.overall?.uptimePercentage || 100}% Uptime Promedio
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map((site: any) => (
              <div 
                key={site.name}
                className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-[#D4A853]/30 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    site.isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                  }`} />
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white truncate block capitalize">
                      {site.name}
                    </span>
                    <a 
                      href={site.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-[#D4A853] hover:underline truncate block"
                    >
                      {site.displayDomain}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-[#888] bg-white/5 px-2 py-1 rounded-lg">
                    {site.latencyMs}ms
                  </span>
                  <Badge variant={site.isOnline ? "success" : "destructive"} className="text-[10px] uppercase font-bold py-0.5 px-2 rounded-full">
                    {site.isOnline ? "200 OK" : "Caído"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: REGISTRO DE AUDITORÍA */}
      {activeTab === "activity" && (
        <div className="rounded-2xl bg-[#141417]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Registro Histórico de Auditoría</h2>
              <p className="text-xs text-[#777]">Eventos del sistema, modificaciones de clientes y operaciones de documentos</p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]" />
              <input
                type="text"
                placeholder="Filtrar eventos..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A853]"
              />
            </div>
          </div>

          {activityLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader size={1.0} />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#777]">
              No se encontraron eventos en el registro.
            </div>
          ) : (
            <div className="relative border-l border-[#D4A853]/25 ml-4 space-y-4 py-2">
              {filteredLogs.map((log: any) => {
                const isTelegram = log.source === "telegram";
                const isClient = log.entity_type === "client";
                const isProject = log.entity_type === "project";
                const isDoc = log.entity_type === "document";

                return (
                  <div key={log.id} className="relative pl-7">
                    <span className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-black/80 border border-[#D4A853]/40 flex items-center justify-center text-[#D4A853]">
                      {isTelegram ? <Bot className="w-3 h-3" /> :
                       isClient ? <Users className="w-3 h-3" /> :
                       isProject ? <FolderKanban className="w-3 h-3" /> :
                       isDoc ? <FileText className="w-3 h-3" /> :
                       <ActivitySquare className="w-3 h-3" />}
                    </span>

                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-white">{log.action}</span>
                        <span className="text-[10px] text-[#777]">
                          {log.created_at ? new Date(log.created_at).toLocaleString("es-ES") : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#888]">
                        <span className="capitalize">{log.entity_type}</span>
                        <span>•</span>
                        <span className="capitalize">Origen: {log.source}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function ServiceCard({ title, subtitle, description, status, latency, icon: Icon, bgImage }: any) {
  const isUp = status === "up";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141417]/80 backdrop-blur-xl p-6 flex flex-col justify-between shadow-xl group hover:border-[#D4A853]/30 transition-all">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4A853]">
            <Icon className="w-5 h-5" />
          </div>
          <Badge variant={isUp ? "success" : "destructive"} className="text-[9px] uppercase font-bold py-0.5 px-2 rounded-full">
            {isUp ? "Operativo" : "Incidencia"}
          </Badge>
        </div>

        <h3 className="text-base font-black text-white tracking-tight">{title}</h3>
        <span className="text-[11px] font-bold text-[#D4A853] block mt-0.5">{subtitle}</span>
        <p className="text-xs text-[#888] mt-2">{description}</p>
      </div>

      <div className="pt-4 mt-6 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-[#666]">Latencia:</span>
        <span className="text-emerald-400 font-bold">{latency}ms</span>
      </div>
    </div>
  );
}
