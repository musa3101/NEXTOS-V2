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


import { getPrimaryProjectUrl } from "@/lib/cloudflare";
import { ProjectDetailModal } from "@/components/dashboard/project-detail-modal";

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState<any>(null);

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

  // Fetch Cloudflare real projects
  const { data: cfData, isLoading: cfLoading, refetch: refetchCf } = useQuery({
    queryKey: ["cloudflare-projects"],
    queryFn: async () => {
      const res = await fetch("/api/cloudflare/projects");
      if (!res.ok) throw new Error("Failed to fetch Cloudflare projects");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const cfProjects = cfData?.data || [];

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION — Branding MYNEXT                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#D4A853]/25 shadow-2xl group">
        {/* BG Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/header-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/50" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 md:p-12">
          <div className="space-y-3 max-w-2xl">
            {/* gpt-taste Eyebrow */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4A853]"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4A853] drop-shadow">
                Ecosistema Digital Musa
              </span>
            </div>

            {/* gpt-taste Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl leading-none">
              MYNEXT <span className="font-light text-[#A3A3A3]">COMMAND CENTER</span>
            </h1>

            <p className="text-[#d1d1d1] text-sm sm:text-base md:text-lg font-medium drop-shadow-lg leading-relaxed max-w-prose">
              Panel de control operativo en tiempo real. Monitorización de servidores, clientes e infraestructura de Cloudflare.
            </p>
          </div>
          
          <div className="flex flex-row md:flex-col gap-3 shrink-0">
            <a 
              href="https://mynextbymusa.com/" 
              target="_blank"
              rel="noreferrer"
              className="uiverse-btn-gold px-5 py-3.5 sm:px-6 sm:py-4 group/btn w-full sm:w-auto"
            >
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 bg-[#D4A853]/20 rounded-lg">
                  <Globe className="w-5 h-5 text-[#D4A853]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[9px] text-[#A3A3A3] font-bold uppercase tracking-widest">Web Oficial</span>
                  <span className="text-xs sm:text-sm font-semibold group-hover/btn:text-[#D4A853] transition-colors">mynextbymusa.com</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#A3A3A3] ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 1: PROYECTOS CLOUDFLARE PAGES & EDGE NETWORK       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F38020]/10 rounded-xl border border-[#F38020]/30 shadow-[0_0_15px_rgba(243,128,32,0.15)]">
              <Zap className="w-5 h-5 text-[#F38020]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Cloudflare Pages & Dominio Real</h2>
                <Badge variant="warning" className="border-[#F38020]/40 text-[#F38020] bg-[#F38020]/10 text-[10px] uppercase font-bold tracking-widest">
                  Live Sync
                </Badge>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-0.5">Sincronizados en tiempo real con tu cuenta oficial ({cfProjects.length} webs activas).</p>
            </div>
          </div>

          <button 
            onClick={() => refetchCf()} 
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] active:scale-95 text-xs text-[#ccc] hover:text-white transition-all w-fit cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-[#F38020]" />
            Refrescar Cloudflare
          </button>
        </div>
        
        {cfLoading ? (
          <div className="p-12 flex flex-col items-center justify-center bg-[#141419]/60 rounded-2xl border border-[#333]/50 backdrop-blur-md">
            <Loader size={1} />
            <p className="text-xs text-[#A3A3A3] mt-4 font-mono">Conectando con Cloudflare API...</p>
          </div>
        ) : cfProjects.length === 0 ? (
          <div className="p-8 text-center bg-[#141419]/60 rounded-2xl border border-[#333]">
            <p className="text-sm text-[#ccc]">No se encontraron proyectos en la cuenta de Cloudflare.</p>
          </div>
        ) : (
          /* Bento Grid layout for projects */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {cfProjects.map((project: any, idx: number) => {
              const { url, displayDomain, isCustom } = getPrimaryProjectUrl(project);
              const createdDate = project.created_on ? new Date(project.created_on).toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "numeric" }) : null;
              
              return (
                <div 
                  key={project.id || idx} 
                  onClick={() => setSelectedProject(project)}
                  className={`group relative overflow-hidden rounded-2xl border cursor-pointer ${
                    isCustom 
                      ? "border-[#D4A853]/40 bg-[#171510]/80 shadow-[0_0_20px_rgba(212,168,83,0.12)]" 
                      : "border-[#333]/80 bg-[#121217]/80 hover:border-[#D4A853]/30"
                  } backdrop-blur-md transition-all duration-300 hover:scale-[1.015] active:scale-95 flex flex-col justify-between p-5 min-h-[175px]`}
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isCustom ? (
                          <Badge className="bg-[#D4A853]/15 text-[#D4A853] border border-[#D4A853]/40 text-[9px] uppercase font-bold tracking-wider">
                            Dominio Custom
                          </Badge>
                        ) : (
                          <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase">
                            Producción
                          </Badge>
                        )}
                        {project.production_branch && (
                          <span className="text-[9px] font-mono text-[#888] bg-black/50 px-2 py-0.5 rounded border border-[#333]">
                            {project.production_branch}
                          </span>
                        )}
                      </div>
                      
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-2 rounded-xl bg-black/40 text-[#A3A3A3] hover:text-[#D4A853] hover:bg-[#D4A853]/10 border border-[#333] transition-all relative z-20 shrink-0"
                        title={`Visitar ${displayDomain}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white tracking-tight drop-shadow-md group-hover:text-[#D4A853] transition-colors">
                      {project.name}
                    </h3>
                    
                    <p className={`text-xs font-mono mt-1 truncate ${isCustom ? "text-[#D4A853] font-semibold" : "text-[#999]"}`}>
                      {displayDomain}
                    </p>
                  </div>

                  <div className="relative z-10 mt-5 pt-3 border-t border-[#333]/50 flex items-center justify-between">
                    <span className="text-[11px] text-[#A3A3A3] flex items-center gap-1.5 font-medium">
                      <Globe className="w-3.5 h-3.5 text-[#F38020]" />
                      {createdDate ? `Creado: ${createdDate}` : "Cloudflare Edge"}
                    </span>

                    <span className="flex h-2.5 w-2.5 relative" title="Estado activo en la red Cloudflare">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 pulse-radar-emerald"></span>
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Project Card */}
            <Link href="/projects" className="group uiverse-dashed-card flex flex-col items-center justify-center p-6 min-h-[175px] rounded-2xl active:scale-95 transition-transform">
              <div className="w-12 h-12 rounded-full bg-[#333]/60 group-hover:bg-[#D4A853]/20 flex items-center justify-center mb-3 transition-all duration-300 shadow-[inset_0_0_8px_rgba(0,0,0,0.4)]">
                <Plus className="w-6 h-6 text-[#A3A3A3] group-hover:text-[#D4A853] transition-colors" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#A3A3A3] group-hover:text-white transition-colors">Gestionar en NextOS</span>
            </Link>
          </div>
        )}
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

      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
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
