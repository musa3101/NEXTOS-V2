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
      {/* Header section with brand tag */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#333]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D4A853] animate-ping" />
            <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest">SaaS Core Principal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Bienvenido a NextOS</h1>
          <p className="text-[#A3A3A3] text-sm mt-0.5">Control centralizado, monitorización en tiempo real y automatización de MyNext.</p>
        </div>
        
        {/* Quick info chip */}
        <div className="flex items-center gap-3 bg-[#1A1A1A]/40 border border-[#333] px-4 py-2 rounded-xl text-xs text-[#A3A3A3] glass">
          <div className="flex flex-col">
            <span className="text-[9px] text-[#555] font-bold uppercase">Sesión de Usuario</span>
            <span className="text-white font-medium">mynextbymusa@gmail.com</span>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Clientes"
          value={statsLoading ? "-" : stats?.totalClients || 0}
          icon={Users}
          description="Clientes registrados en base de datos"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Proyectos Activos"
          value={statsLoading ? "-" : stats?.activeProjects || 0}
          icon={FolderKanban}
          description="Proyectos en desarrollo / Cloudflare"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Documentos"
          value={statsLoading ? "-" : stats?.documentsGenerated || 0}
          icon={FileText}
          description="PDFs de facturación y entregas"
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          title="Salud del Sistema"
          value={healthLoading ? "-" : (health?.status === "healthy" ? "Óptimo" : "Degradado")}
          icon={ActivitySquare}
          description="Estado general de servidores API"
        />
      </div>

      {/* Central Interactive Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Chart & Recent Activity) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Custom SVG Interactive Chart Card */}
          <Card className="p-6 bg-[#1A1A1A]/60 border border-[#333]/85 rounded-xl hover-glow transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#D4A853]" /> Rendimiento y Operaciones
                </h3>
                <p className="text-xs text-[#A3A3A3] mt-0.5">Actividades y peticiones registradas esta semana.</p>
              </div>
              <Badge variant="warning" className="text-[10px] tracking-wide">
                Últimos 7 días
              </Badge>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="w-full h-48 relative mt-2 select-none">
              <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A853" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#D4A853" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#333" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="600" y2="75" stroke="#333" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#333" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="#333" strokeWidth="0.5" strokeDasharray="3 3" />

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

                {/* Chart Dots & Tooltips */}
                <circle cx="200" cy="140" r="4" fill="#1A1A1A" stroke="#D4A853" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                <circle cx="400" cy="60" r="4" fill="#1A1A1A" stroke="#D4A853" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                <circle cx="600" cy="40" r="4" fill="#1A1A1A" stroke="#D4A853" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
              </svg>
              
              {/* Custom SVG Tooltip Indicator */}
              <div className="absolute top-[35px] left-[375px] glass border border-[#D4A853]/40 bg-[#111]/90 rounded-md p-1.5 text-[10px] text-[#D4A853] shadow-md pointer-events-none">
                <span className="font-semibold text-white">Pico de Actividad</span>: +14 Logs
              </div>
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] text-[#555] font-semibold uppercase tracking-wider px-2 mt-3">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </Card>

          {/* Recent Activity List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#D4A853]" /> Actividad Reciente
              </h2>
              <Link href="/activity" className="text-xs text-[#D4A853] hover:underline flex items-center gap-1">
                Ver historial completo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <Card className="p-0 overflow-hidden border border-[#333]/80 bg-transparent">
              {activityLoading ? (
                <div className="p-8 text-center text-[#A3A3A3]">Cargando actividad...</div>
              ) : activity?.length === 0 ? (
                <div className="p-8 text-center text-[#A3A3A3] glass rounded-xl">No hay actividad reciente.</div>
              ) : (
                <div className="space-y-3">
                  {activity?.map((log: any) => (
                    <div key={log.id} className="glass p-4 rounded-xl flex items-start gap-4 hover:bg-[#262626]/20 transition-all duration-300 hover:border-[#444] border border-[#333]/50">
                      <div className="p-2 bg-[#262626] rounded-xl border border-[#333] mt-1 shrink-0">
                        {log.entity_type === "client" && <Users className="w-4 h-4 text-[#D4A853]" />}
                        {log.entity_type === "project" && <FolderKanban className="w-4 h-4 text-emerald-500" />}
                        {log.entity_type === "document" && <FileText className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">
                          <span className="font-semibold text-[#D4A853] capitalize">{log.action}</span> {log.entity_type}
                          {log.details?.name ? ` - ${log.details.name}` : ""}
                          {log.details?.number ? ` - ${log.details.number}` : ""}
                        </p>
                        <p className="text-xs text-[#A3A3A3] mt-1.5 flex items-center gap-2">
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                          <span className="text-[#333]">•</span>
                          <span className="bg-[#262626] px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest text-[#A3A3A3]">
                            {log.source}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Columns (Quick Actions, Services & System Metrics) */}
        <div className="space-y-8">
          
          {/* Quick Actions Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#D4A853]" /> Acciones Rápidas
            </h2>
            <Card className="p-4 bg-[#1A1A1A]/60 border border-[#333]/80 space-y-3.5 hover-glow transition-all duration-300">
              <Link href="/clients" className="flex items-center justify-between p-3 rounded-xl bg-[#262626]/30 border border-[#333]/50 hover:bg-[#262626]/80 hover:border-[#D4A853]/40 transition-all group">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4A853]" /> Registrar Cliente
                </span>
                <Plus className="w-4 h-4 text-[#A3A3A3] group-hover:text-white transition-colors" />
              </Link>
              
              <Link href="/projects" className="flex items-center justify-between p-3 rounded-xl bg-[#262626]/30 border border-[#333]/50 hover:bg-[#262626]/80 hover:border-[#D4A853]/40 transition-all group">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-emerald-500" /> Crear Proyecto
                </span>
                <Plus className="w-4 h-4 text-[#A3A3A3] group-hover:text-white transition-colors" />
              </Link>

              <Link href="/documents" className="flex items-center justify-between p-3 rounded-xl bg-[#262626]/30 border border-[#333]/50 hover:bg-[#262626]/80 hover:border-[#D4A853]/40 transition-all group">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Generar Documento
                </span>
                <Plus className="w-4 h-4 text-[#A3A3A3] group-hover:text-white transition-colors" />
              </Link>
            </Card>
          </div>

          {/* System resource metrics (Live Animation) */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D4A853]" /> Recursos de Servidor
            </h2>
            <Card className="p-5 bg-[#1A1A1A]/60 border border-[#333]/85 space-y-5 rounded-xl hover-glow transition-all duration-300">
              
              {/* CPU Usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#A3A3A3] flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> CPU (Server)</span>
                  <span className="text-white">{cpu}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#262626] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4A853] to-amber-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${cpu}%` }} 
                  />
                </div>
              </div>

              {/* Memory Usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#A3A3A3] flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> RAM (Asignada)</span>
                  <span className="text-white">{ram} GB / 8 GB</span>
                </div>
                <div className="h-1.5 w-full bg-[#262626] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#D4A853] transition-all duration-1000 ease-out" 
                    style={{ width: `${(ram / 8) * 100}%` }} 
                  />
                </div>
              </div>

              {/* Network Usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#A3A3A3] flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> Ancho de Banda</span>
                  <span className="text-white">{network} req/m</span>
                </div>
                <div className="h-1.5 w-full bg-[#262626] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${(network / 400) * 100}%` }} 
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Service Status List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#D4A853]" /> Estado de Servicios
            </h2>
            <Card className="flex flex-col gap-3.5 p-4 border border-[#333]/85 bg-[#1A1A1A]/40">
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
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

function ServiceStatus({ name, status, icon: Icon, latency }: any) {
  const isUp = status === "up";
  
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#262626]/20 border border-[#333]/60 hover:border-[#444] transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-[#262626]/80 rounded-lg border border-[#333] text-[#A3A3A3]">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{name}</p>
          {latency !== undefined && <p className="text-[10px] text-[#A3A3A3] mt-0.5">Latencia: {latency}ms</p>}
        </div>
      </div>
      <Badge variant={isUp ? "success" : "danger"} className="text-[10px] py-0.5 px-2 rounded-full font-bold">
        {isUp ? "Operativo" : "Error"}
      </Badge>
    </div>
  );
}
