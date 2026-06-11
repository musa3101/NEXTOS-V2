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
  Plus
} from "lucide-react";

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HEADER SECTION — Misty Peak background                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#333]/50 group">
        {/* BG Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/header-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-[#D4A853] animate-ping" />
              <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest drop-shadow-lg">SaaS Core Principal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-xl">Bienvenido a NextOS</h1>
            <p className="text-[#d1d1d1] text-sm mt-1 drop-shadow-lg">Control centralizado, monitorización en tiempo real y automatización de MyNext.</p>
          </div>
          
          {/* Quick info chip */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl text-xs text-[#d1d1d1] shadow-xl">
            <div className="flex flex-col">
              <span className="text-[9px] text-[#888] font-bold uppercase">Sesión de Usuario</span>
              <span className="text-white font-medium">mynextbymusa@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* KPI STAT CARDS — Wallpaper 4k dark waves as subtle bg      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Clientes"
          value={statsLoading ? "-" : stats?.totalClients || 0}
          icon={Users}
          description="Clientes registrados en base de datos"
          trend={{ value: 12, isPositive: true }}
          bgImage="/bg/header-bg.jpg"
        />
        <StatCard
          title="Proyectos Activos"
          value={statsLoading ? "-" : stats?.activeProjects || 0}
          icon={FolderKanban}
          description="Proyectos en desarrollo / Cloudflare"
          trend={{ value: 8, isPositive: true }}
          bgImage="/bg/actions-bg.jpg"
        />
        <StatCard
          title="Documentos"
          value={statsLoading ? "-" : stats?.documentsGenerated || 0}
          icon={FileText}
          description="PDFs de facturación y entregas"
          trend={{ value: 24, isPositive: true }}
          bgImage="/bg/chart-bg.jpg"
        />
        <StatCard
          title="Salud del Sistema"
          value={healthLoading ? "-" : (health?.status === "healthy" ? "Óptimo" : "Degradado")}
          icon={ActivitySquare}
          description="Estado general de servidores API"
          bgImage="/bg/resources-bg.jpg"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CENTRAL CONTENT GRID                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Chart & Activity) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ─── CHART CARD — Abstract waves background ─── */}
          <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg hover-glow transition-all duration-300 group">
            {/* BG Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url(/bg/chart-bg.jpg)" }}
            />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-[#D4A853]/5" />

            <div className="relative z-10 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-lg">
                    <TrendingUp className="w-5 h-5 text-[#D4A853]" /> Rendimiento y Operaciones
                  </h3>
                  <p className="text-xs text-[#c9c9c9] mt-0.5 drop-shadow-md">Actividades y peticiones registradas esta semana.</p>
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
                      <stop offset="0%" stopColor="#D4A853" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#D4A853" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="160" x2="600" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />

                  {/* Area Background Gradient */}
                  <path 
                    d="M 0 160 Q 100 120, 200 140 T 400 60 T 600 40 L 600 160 L 0 160 Z" 
                    fill="url(#chartGrad)" 
                  />

                  {/* Area Line */}
                  <path 
                    d="M 0 160 Q 100 120, 200 140 T 400 60 T 600 40" 
                    fill="none" 
                    stroke="#D4A853" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />

                  {/* Chart Dots */}
                  <circle cx="200" cy="140" r="4" fill="#1A1A1A" stroke="#D4A853" strokeWidth="2" className="cursor-pointer transition-all" />
                  <circle cx="400" cy="60" r="4" fill="#1A1A1A" stroke="#D4A853" strokeWidth="2" className="cursor-pointer transition-all" />
                  <circle cx="600" cy="40" r="4" fill="#1A1A1A" stroke="#D4A853" strokeWidth="2" className="cursor-pointer transition-all" />
                </svg>
                
                {/* Tooltip */}
                <div className="absolute top-[35px] left-[375px] bg-black/70 backdrop-blur-md border border-[#D4A853]/40 rounded-md p-1.5 text-[10px] text-[#D4A853] shadow-lg pointer-events-none">
                  <span className="font-semibold text-white">Pico de Actividad</span>: +14 Logs
                </div>
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-[#999] font-semibold uppercase tracking-wider px-2 mt-3">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>
            </div>
          </div>

          {/* ─── RECENT ACTIVITY — Mystic Haven background ─── */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#D4A853]" /> Actividad Reciente
              </h2>
              <Link href="/activity" className="text-xs text-[#D4A853] hover:underline flex items-center gap-1">
                Ver historial completo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-[#333]/80 shadow-lg group">
              {/* BG Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url(/bg/activity-bg.jpg)" }}
              />
              <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />

              <div className="relative z-10 p-1">
                {activityLoading ? (
                  <div className="p-8 text-center text-[#c9c9c9]">Cargando actividad...</div>
                ) : activity?.length === 0 ? (
                  <div className="p-8 text-center text-[#c9c9c9]">No hay actividad reciente.</div>
                ) : (
                  <div className="space-y-2 p-2">
                    {activity?.map((log: any) => (
                      <div key={log.id} className="bg-black/30 backdrop-blur-md p-4 rounded-xl flex items-start gap-4 hover:bg-black/50 transition-all duration-300 border border-white/5 hover:border-[#D4A853]/20">
                        <div className="p-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 mt-1 shrink-0">
                          {log.entity_type === "client" && <Users className="w-4 h-4 text-[#D4A853]" />}
                          {log.entity_type === "project" && <FolderKanban className="w-4 h-4 text-emerald-400" />}
                          {log.entity_type === "document" && <FileText className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium drop-shadow-md">
                            <span className="font-semibold text-[#D4A853] capitalize">{log.action}</span> {log.entity_type}
                            {log.details?.name ? ` - ${log.details.name}` : ""}
                            {log.details?.number ? ` - ${log.details.number}` : ""}
                          </p>
                          <p className="text-xs text-[#bbb] mt-1.5 flex items-center gap-2 drop-shadow-sm">
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                            <span className="text-white/20">•</span>
                            <span className="bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest text-[#ccc]">
                              {log.source}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Quick Actions, Resources, Services) */}
        <div className="space-y-8">
          
          {/* ─── QUICK ACTIONS — Abstract waves bg ─── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#D4A853]" /> Acciones Rápidas
            </h2>
            <div className="relative overflow-hidden rounded-xl border border-[#333]/80 shadow-lg hover-glow transition-all duration-300 group">
              {/* BG Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url(/bg/actions-bg.jpg)" }}
              />
              <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
              
              <div className="relative z-10 p-4 space-y-3.5">
                <Link href="/clients" className="flex items-center justify-between p-3 rounded-xl bg-black/30 backdrop-blur-sm border border-white/5 hover:bg-black/50 hover:border-[#D4A853]/30 transition-all group/link">
                  <span className="text-xs font-semibold text-white flex items-center gap-2 drop-shadow-md">
                    <Users className="w-4 h-4 text-[#D4A853]" /> Registrar Cliente
                  </span>
                  <Plus className="w-4 h-4 text-[#888] group-hover/link:text-white transition-colors" />
                </Link>
                
                <Link href="/projects" className="flex items-center justify-between p-3 rounded-xl bg-black/30 backdrop-blur-sm border border-white/5 hover:bg-black/50 hover:border-[#D4A853]/30 transition-all group/link">
                  <span className="text-xs font-semibold text-white flex items-center gap-2 drop-shadow-md">
                    <FolderKanban className="w-4 h-4 text-emerald-400" /> Crear Proyecto
                  </span>
                  <Plus className="w-4 h-4 text-[#888] group-hover/link:text-white transition-colors" />
                </Link>

                <Link href="/documents" className="flex items-center justify-between p-3 rounded-xl bg-black/30 backdrop-blur-sm border border-white/5 hover:bg-black/50 hover:border-[#D4A853]/30 transition-all group/link">
                  <span className="text-xs font-semibold text-white flex items-center gap-2 drop-shadow-md">
                    <FileText className="w-4 h-4 text-blue-400" /> Generar Documento
                  </span>
                  <Plus className="w-4 h-4 text-[#888] group-hover/link:text-white transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* ─── SERVER RESOURCES — Colorful Serenity bg ─── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D4A853]" /> Recursos de Servidor
            </h2>
            <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg hover-glow transition-all duration-300 group">
              {/* BG Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url(/bg/resources-bg.jpg)" }}
              />
              <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px]" />
              
              <div className="relative z-10 p-5 space-y-5">
                
                {/* CPU Usage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#c9c9c9] flex items-center gap-1.5 drop-shadow-md"><Cpu className="w-3.5 h-3.5" /> CPU (Server)</span>
                    <span className="text-white drop-shadow-lg">{cpu}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4A853] to-amber-400 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(212,168,83,0.4)]" 
                      style={{ width: `${cpu}%` }} 
                    />
                  </div>
                </div>

                {/* Memory Usage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#c9c9c9] flex items-center gap-1.5 drop-shadow-md"><Database className="w-3.5 h-3.5" /> RAM (Asignada)</span>
                    <span className="text-white drop-shadow-lg">{ram} GB / 8 GB</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4A853] to-[#e8c36a] transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(212,168,83,0.3)]" 
                      style={{ width: `${(ram / 8) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Network Usage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#c9c9c9] flex items-center gap-1.5 drop-shadow-md"><Server className="w-3.5 h-3.5" /> Ancho de Banda</span>
                    <span className="text-white drop-shadow-lg">{network} req/m</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                      style={{ width: `${(network / 400) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── SERVICE STATUS — Japanese art bg ─── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#D4A853]" /> Estado de Servicios
            </h2>
            <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg group">
              {/* BG Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url(/bg/services-bg.jpg)" }}
              />
              <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

              <div className="relative z-10 flex flex-col gap-3.5 p-4">
                <ServiceStatus 
                  name="Supabase Database" 
                  status={health?.services?.supabase?.status} 
                  icon={Database} 
                  latency={health?.services?.supabase?.latency} 
                />
                <ServiceStatus 
                  name="NextOS API" 
                  status={health?.services?.api?.status} 
                  icon={ActivitySquare} 
                  latency={health?.services?.api?.latency} 
                />
                <ServiceStatus 
                  name="Telegram Bot API" 
                  status={health?.services?.telegram?.status} 
                  icon={MessageSquare} 
                />
              </div>
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
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 backdrop-blur-md border border-white/5 hover:border-[#D4A853]/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-[#c9c9c9]">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white drop-shadow-md">{name}</p>
          {latency !== undefined && <p className="text-[10px] text-[#bbb] mt-0.5 drop-shadow-sm">Latencia: {latency}ms</p>}
        </div>
      </div>
      <Badge variant={isUp ? "success" : "danger"} className="text-[10px] py-0.5 px-2 rounded-full font-bold backdrop-blur-md shadow-md">
        {isUp ? "Operativo" : "Error"}
      </Badge>
    </div>
  );
}
