"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Users, 
  FolderKanban, 
  FileText, 
  ActivitySquare, 
  Server, 
  MessageSquare, 
  ArrowRight, 
  Cpu, 
  Database, 
  Layers, 
  Zap, 
  TrendingUp, 
  Activity,
  Plus,
  Globe,
  ExternalLink,
  ShieldCheck,
  Code
} from "lucide-react";
import { Loader } from "@/components/ui/loader";


export default function Dashboard() {
  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["health-status"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("Failed to fetch health");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const res = await fetch("/api/activity?limit=5");
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
  });

  // Client-side animated metrics
  const [cpu, setCpu] = useState(14.2);
  const [ram, setRam] = useState(4.18);
  const [network, setNetwork] = useState(128);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => Math.max(8, Math.min(25, Number((prev + (Math.random() * 4 - 2)).toFixed(1)))));
      setRam(prev => Math.max(4.10, Math.min(4.35, Number((prev + (Math.random() * 0.04 - 0.02)).toFixed(2)))));
      setNetwork(prev => Math.max(80, Math.min(350, Math.round(prev + (Math.random() * 60 - 30)))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const portfolioProjects = [
    { name: "Blessed Barber Studio", url: "blessedbarber.es", status: "production", type: "Web & Reserva" },
    { name: "Bar Cafetería Luna Llena", url: "lunallena.com", status: "production", type: "Web & Menú Digital" },
    { name: "Ecuaplac", url: "ecuaplac.es", status: "production", type: "Corporate Web" },
    { name: "RBARI RESTAURANT", url: "rbari.com", status: "development", type: "Web & Menú" },
    { name: "NEXT ERA", url: "nextera.dev", status: "maintenance", type: "E-commerce" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION — Branding MYNEXT                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D4A853]/20 shadow-2xl group">
        {/* BG Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/header-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 md:p-12">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4A853]"></span>
              </span>
              <span className="text-xs text-[#D4A853] font-bold uppercase tracking-[0.2em] drop-shadow-lg">
                Arquitectura Digital Premium
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
              MYNEXT <span className="font-light text-[#A3A3A3]">COMMAND CENTER</span>
            </h1>
            <p className="text-[#d1d1d1] text-lg max-w-xl font-medium drop-shadow-lg leading-relaxed">
              Control centralizado para el imperio digital de Musa. Monitorización en tiempo real, infraestructura y gestión de clientes.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <a 
              href="https://mynextbymusa.com/" 
              target="_blank"
              rel="noreferrer"
              className="uiverse-btn-gold px-6 py-4 group/btn"
            >
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 bg-[#D4A853]/20 rounded-lg">
                  <Globe className="w-5 h-5 text-[#D4A853]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-widest">Portal Público</span>
                  <span className="text-sm font-semibold group-hover/btn:text-[#D4A853] transition-colors">mynextbymusa.com</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#A3A3A3] ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 1: PORTFOLIO & OPERACIONES                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D4A853]/10 rounded-lg border border-[#D4A853]/20">
            <Code className="w-5 h-5 text-[#D4A853]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Portfolio & Proyectos Activos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolioProjects.map((project, idx) => {
            const beamClass = 
              project.status === "production" 
                ? "uiverse-card-beam-emerald" 
                : project.status === "development" 
                ? "uiverse-card-beam-gold" 
                : "uiverse-card-beam-amber";

            return (
              <div key={idx} className={`group uiverse-card-beam ${beamClass} transition-all duration-300`}>
                <div className="relative z-10 p-5 h-full flex flex-col justify-between min-h-[160px]">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <Badge 
                        variant={project.status === "production" ? "success" : project.status === "development" ? "info" : "warning"}
                        className="backdrop-blur-md shadow-[0_0_10px_rgba(255,255,255,0.02)]"
                      >
                        {project.status === "production" ? "Producción" : project.status === "development" ? "En Desarrollo" : "Mantenimiento"}
                      </Badge>
                      <a href={`https://${project.url}`} target="_blank" rel="noreferrer" className="text-[#A3A3A3] hover:text-[#D4A853] transition-colors p-1 relative z-20">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <h3 className="text-lg font-bold text-white drop-shadow-md">{project.name}</h3>
                    <p className="text-xs text-[#888] font-mono mt-1">{project.url}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#333]/40 flex items-center justify-between">
                    <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#555]" /> {project.type}</span>
                    <span className="flex h-2.5 w-2.5 relative">
                      {project.status === "production" ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 pulse-radar-emerald"></span>
                        </>
                      ) : (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 pulse-radar-amber"></span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Quick Add Project Card */}
          <Link href="/projects" className="group uiverse-dashed-card flex flex-col items-center justify-center p-8 min-h-[160px]">
            <div className="w-12 h-12 rounded-full bg-[#333]/60 group-hover:bg-[#D4A853]/20 flex items-center justify-center mb-3 transition-all duration-300 shadow-[inset_0_0_8px_rgba(0,0,0,0.4)]">
              <Plus className="w-6 h-6 text-[#A3A3A3] group-hover:text-[#D4A853] transition-colors" />
            </div>
            <span className="text-sm font-semibold text-[#A3A3A3] group-hover:text-white transition-colors">Añadir Nuevo Proyecto</span>
          </Link>
        </div>
      </div>

      <hr className="border-[#333]/50" />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 2 & 3: ANALÍTICA Y GESTIÓN TÉCNICA                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Lado Izquierdo: Analítica SaaS (8 columnas) */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4A853]/10 rounded-lg border border-[#D4A853]/20">
              <TrendingUp className="w-5 h-5 text-[#D4A853]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Analítica SaaS</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Total Clientes"
              value={statsLoading ? "-" : stats?.totalClients || 0}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              bgImage="/bg/header-bg.jpg"
            />
            <StatCard
              title="Proyectos (Base Datos)"
              value={statsLoading ? "-" : stats?.activeProjects || 0}
              icon={FolderKanban}
              trend={{ value: 8, isPositive: true }}
              bgImage="/bg/actions-bg.jpg"
            />
            <StatCard
              title="Documentos"
              value={statsLoading ? "-" : stats?.documentsGenerated || 0}
              icon={FileText}
              trend={{ value: 24, isPositive: true }}
              bgImage="/bg/chart-bg.jpg"
            />
          </div>

          {/* Chart Card */}
          <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg hover-glow transition-all duration-300 group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url(/bg/chart-bg.jpg)" }}
            />
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[4px]" />

            <div className="relative z-10 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white drop-shadow-lg">Flujo de Operaciones</h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5 drop-shadow-md">Actividades y peticiones registradas esta semana.</p>
                </div>
                <Badge variant="warning" className="text-[10px] tracking-wide backdrop-blur-md">
                  Últimos 7 días
                </Badge>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="w-full h-48 relative mt-2 select-none">
                <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4A853" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#D4A853" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="160" x2="600" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
                  <path d="M 0 160 Q 100 120, 200 140 T 400 60 T 600 40 L 600 160 L 0 160 Z" fill="url(#chartGrad)" />
                  <path d="M 0 160 Q 100 120, 200 140 T 400 60 T 600 40" fill="none" stroke="#D4A853" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="200" cy="140" r="4.5" fill="#1A1A1A" stroke="#D4A853" strokeWidth="2.5" className="cursor-pointer transition-all hover:r-6" />
                  <circle cx="400" cy="60" r="4.5" fill="#1A1A1A" stroke="#D4A853" strokeWidth="2.5" className="cursor-pointer transition-all hover:r-6" />
                  <circle cx="600" cy="40" r="4.5" fill="#1A1A1A" stroke="#D4A853" strokeWidth="2.5" className="cursor-pointer transition-all hover:r-6" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider px-2 mt-3">
                <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
              </div>
            </div>
          </div>
          
          {/* Actividad Reciente integrada aquí para ahorrar espacio */}
          <div className="relative overflow-hidden rounded-xl border border-[#333]/80 shadow-lg bg-[#1A1A1A]/40 backdrop-blur-sm">
            <div className="p-4 border-b border-[#333]/50 flex justify-between items-center bg-black/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D4A853]" /> Registro de Actividad
              </h3>
              <Link href="/activity" className="text-xs text-[#D4A853] hover:underline flex items-center gap-1">
                Ver historial <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-2">
              {activityLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader size={0.6} />
                </div>
              ) : activity?.length === 0 ? (
                <div className="p-4 text-center text-[#c9c9c9] text-xs">No hay actividad reciente.</div>
              ) : (
                <div className="divide-y divide-[#333]/50">
                  {activity?.slice(0, 3).map((log: any) => ( // Show max 3 here
                    <div key={log.id} className="p-3 flex items-center justify-between hover:bg-black/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#333]/50 rounded-md">
                          {log.entity_type === "client" && <Users className="w-3.5 h-3.5 text-[#D4A853]" />}
                          {log.entity_type === "project" && <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />}
                          {log.entity_type === "document" && <FileText className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            <span className="capitalize text-[#D4A853]">{log.action}</span> {log.entity_type} {log.details?.name ? `- ${log.details.name}` : ""}
                          </p>
                          <p className="text-[10px] text-[#A3A3A3]">{new Date(log.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="bg-black/40 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest text-[#888] border border-[#333]">
                        {log.source}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Lado Derecho: Gestión Técnica & Infraestructura (4 columnas) */}
        <div className="xl:col-span-4 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Server className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Gestión Técnica</h2>
          </div>

          {/* Quick Actions (Minimalist) */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/clients" className="uiverse-action-btn-gold flex flex-col items-center justify-center p-4 rounded-xl bg-[#1A1A1A]/50 border border-[#333] text-center gap-2">
              <Users className="w-5 h-5 text-[#A3A3A3] group-hover:text-[#D4A853] transition-colors relative z-10" />
              <span className="text-xs font-semibold text-white relative z-10">Nuevo Cliente</span>
            </Link>
            <Link href="/documents" className="uiverse-action-btn-blue flex flex-col items-center justify-center p-4 rounded-xl bg-[#1A1A1A]/50 border border-[#333] text-center gap-2">
              <FileText className="w-5 h-5 text-[#A3A3A3] group-hover:text-blue-400 transition-colors relative z-10" />
              <span className="text-xs font-semibold text-white relative z-10">Facturar</span>
            </Link>
          </div>

          {/* Server Resources */}
          <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url(/bg/resources-bg.jpg)" }}
            />
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[4px]" />
            
            <div className="relative z-10 p-5 space-y-5">
              <h3 className="text-sm font-bold text-white drop-shadow-lg flex items-center justify-between border-b border-white/10 pb-3">
                <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-[#D4A853]" /> Servidor Ubuntu</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 pulse-radar-emerald"></span>
                </span>
              </h3>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#A3A3A3]">Uso CPU</span>
                  <span className="text-white">{cpu}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-[#D4A853] progress-shimmer transition-all duration-500" style={{ width: `${cpu}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#A3A3A3]">Memoria RAM</span>
                  <span className="text-white">{ram} GB / 8 GB</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-emerald-500 progress-shimmer transition-all duration-500" style={{ width: `${(ram / 8) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-[#1A1A1A]/40 backdrop-blur-sm rounded-xl border border-[#333] overflow-hidden">
            <div className="p-4 border-b border-[#333]/50 bg-black/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Infraestructura & APIs
              </h3>
            </div>
            <div className="p-2 space-y-1">
              <ServiceStatus 
                name="Base de Datos (Supabase)" 
                status={health?.services?.supabase?.status} 
                icon={Database} 
                latency={health?.services?.supabase?.latency} 
              />
              <ServiceStatus 
                name="Next LaB API Core" 
                status={health?.services?.api?.status} 
                icon={ActivitySquare} 
                latency={health?.services?.api?.latency} 
              />
              <ServiceStatus 
                name="Telegram Webhooks" 
                status={health?.services?.telegram?.status} 
                icon={MessageSquare} 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ServiceStatus({ name, status, icon: Icon, latency }: any) {
  const isUp = status === "up";
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-black/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-[#333]/40 rounded-md border border-[#444]/50 text-[#A3A3A3]">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{name}</p>
          {latency !== undefined && <p className="text-[9px] text-[#888] mt-0.5">Latencia: {latency}ms</p>}
        </div>
      </div>
      <div className="h-2.5 w-2.5 rounded-full relative">
        {isUp ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 pulse-radar-emerald"></span>
          </>
        ) : (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </>
        )}
      </div>
    </div>
  );
}
