"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Server, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  BarChart3,
  Eye,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPrimaryProjectUrl } from "@/lib/cloudflare";

interface ProjectDetailModalProps {
  project: any;
  onClose: () => void;
}

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { url, displayDomain, isCustom } = getPrimaryProjectUrl(project);

  const [health, setHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);

  // Function to run live ping & health check
  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch(`/api/cloudflare/project-health?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setHealth({
        success: false,
        statusText: "Error al realizar la verificación",
        latency: 0,
        isOk: false,
      });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, [url]);

  const createdDate = project?.created_on 
    ? new Date(project.created_on).toLocaleDateString("es-ES", { month: "long", day: "numeric", year: "numeric" }) 
    : "Cloudflare Pages";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#D4A853]/30 bg-[#101015]/95 p-5 sm:p-7 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-in zoom-in-95 duration-200 space-y-6 text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#333]/60 pb-5">
          <div className="space-y-1.5">
            {/* gpt-taste Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4A853]">
                Diagnóstico & Monitorización
              </span>
              {isCustom && (
                <Badge className="bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/40 text-[9px] font-bold uppercase">
                  Dominio Custom
                </Badge>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              {project?.name}
            </h2>

            <p className="text-xs font-mono text-[#D4A853] font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {displayDomain}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1f1f26] text-[#a1a1aa] hover:text-white hover:bg-[#2b2b36] transition-colors cursor-pointer border border-[#333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: ESTADO DE SALUD EN TIEMPO REAL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D4A853]" /> Estado de Salud Web (Live Ping)
            </h3>

            <button
              onClick={checkHealth}
              disabled={healthLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1a22] hover:bg-[#262632] border border-[#333] text-xs text-[#ccc] hover:text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D4A853] ${healthLoading ? "animate-spin" : ""}`} />
              Re-comprobar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-[#16161e] border border-[#333]/80 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Estado HTTP</span>
              <div className="mt-2 flex items-center gap-2">
                {healthLoading ? (
                  <span className="text-xs text-[#aaa] font-mono animate-pulse">Comprobando...</span>
                ) : health?.isOk ? (
                  <>
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-400">{health?.statusText || "200 OK"}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-red-400">{health?.statusText || "Sin Respuesta"}</span>
                  </>
                )}
              </div>
            </div>

            {/* Latency Card */}
            <div className="p-4 rounded-2xl bg-[#16161e] border border-[#333]/80 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Latencia Respuesta</span>
              <div className="mt-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D4A853]" />
                <span className="text-base font-extrabold text-white font-mono">
                  {healthLoading ? "--" : `${health?.latency || 0} ms`}
                </span>
              </div>
            </div>

            {/* SSL Card */}
            <div className="p-4 rounded-2xl bg-[#16161e] border border-[#333]/80 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Seguridad SSL</span>
              <div className="mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">HTTPS Encriptado</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ANALÍTICA & TRÁFICO WEB (CLARITY & CLOUDFLARE) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#F38020]" /> Analítica & Tráfico
          </h3>

          <div className="p-5 rounded-2xl bg-[#14141c] border border-[#333]/80 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#1c1c26] rounded-xl border border-[#2a2a38]">
                <span className="text-[9px] text-[#999] uppercase font-bold tracking-wider">Tráfico Cloudflare</span>
                <p className="text-sm font-black text-white mt-1">Activo (CDN Edge)</p>
              </div>
              <div className="p-3 bg-[#1c1c26] rounded-xl border border-[#2a2a38]">
                <span className="text-[9px] text-[#999] uppercase font-bold tracking-wider">Integración Clarity</span>
                <p className="text-sm font-black text-blue-400 mt-1">Habilitado</p>
              </div>
              <div className="p-3 bg-[#1c1c26] rounded-xl border border-[#2a2a38] col-span-2 sm:col-span-1">
                <span className="text-[9px] text-[#999] uppercase font-bold tracking-wider">Nodo Cloudflare</span>
                <p className="text-xs font-mono text-[#D4A853] mt-1">{health?.cfRay || "Cloudflare Global"}</p>
              </div>
            </div>

            {/* Quick Link Buttons for Clarity & Cloudflare Dashboard */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="https://clarity.microsoft.com/projects"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/40 text-blue-400 text-xs font-bold transition-all active:scale-95"
              >
                <Eye className="w-4 h-4" />
                Ver Grabaciones & Calor en Microsoft Clarity
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://dash.cloudflare.com/88059fc16ce7af95af8a73c203ea5f8a/pages/view/${project?.name}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F38020]/15 hover:bg-[#F38020]/25 border border-[#F38020]/40 text-[#F38020] text-xs font-bold transition-all active:scale-95"
              >
                <Zap className="w-4 h-4" />
                Panel de Analítica Cloudflare
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* SECTION 3: INFORMACIÓN DE DESPLIEGUE & VISIT WEB */}
        <div className="pt-2 border-t border-[#333]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#888] space-y-0.5 text-center sm:text-left">
            <p>Creado en Cloudflare: <span className="text-white font-medium">{createdDate}</span></p>
            <p>Rama de código: <span className="text-mono text-[#D4A853]">{project?.production_branch || "main"}</span></p>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto uiverse-btn-gold px-6 py-3.5 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider"
          >
            <Globe className="w-4 h-4" />
            Visitar Web Oficial ({displayDomain})
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>

      </div>
    </div>
  );
}
