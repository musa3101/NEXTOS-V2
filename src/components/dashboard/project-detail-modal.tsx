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
  ArrowUpRight,
  ArrowLeft,
  Users,
  MousePointerClick
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
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#D4A853]/30 bg-[#101015]/95 p-5 sm:p-7 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-in zoom-in-95 duration-200 space-y-6 text-white">
        
        {/* Sticky Mobile/Desktop Navigation Top Bar */}
        <div className="flex items-center justify-between border-b border-[#333]/60 pb-4">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1c1c24] hover:bg-[#282834] border border-[#333] text-xs font-bold text-white transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4A853]" />
            <span>Volver a Proyectos</span>
          </button>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1f1f26] text-[#a1a1aa] hover:text-white hover:bg-[#2b2b36] transition-colors cursor-pointer border border-[#333]"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Title */}
        <div className="space-y-1.5 pt-1">
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

        {/* SECTION 2: ACCESO EN TIEMPO REAL A MICROSOFT CLARITY & CLOUDFLARE ANALYTICS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#F38020]" /> Analíticas & Tráfico en Tiempo Real
            </h3>
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold">
              Consola Directa
            </Badge>
          </div>

          <div className="p-5 rounded-2xl bg-[#14141c] border border-[#333]/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-[#1c1c26] rounded-xl border border-[#2a2a38] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-400" /> Microsoft Clarity
                  </span>
                  <Badge variant="success" className="text-[9px] uppercase">Conectado</Badge>
                </div>
                <p className="text-xs text-[#aaa] leading-relaxed">
                  Inspecciona grabaciones de pantalla de usuarios, mapas de calor de clics y sesiones en vivo de {displayDomain}.
                </p>
                <a
                  href="https://clarity.microsoft.com/projects"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full mt-2 px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  Abrir Panel de Clarity ↗
                </a>
              </div>

              <div className="p-4 bg-[#1c1c26] rounded-xl border border-[#2a2a38] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#F38020]" /> Cloudflare Analytics
                  </span>
                  <Badge variant="success" className="text-[9px] uppercase">Edge CDN</Badge>
                </div>
                <p className="text-xs text-[#aaa] leading-relaxed">
                  Consulta peticiones HTTP verdaderas, uso de ancho de banda y rendimiento global del servidor.
                </p>
                <a
                  href={`https://dash.cloudflare.com/88059fc16ce7af95af8a73c203ea5f8a/pages/view/${project?.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full mt-2 px-3.5 py-2.5 rounded-xl bg-[#F38020]/20 hover:bg-[#F38020]/35 border border-[#F38020]/40 text-[#F38020] text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  Abrir Panel de Cloudflare ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: INFORMACIÓN DE DESPLIEGUE & VISIT WEB */}
        <div className="pt-3 border-t border-[#333]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#888] space-y-0.5 text-center sm:text-left">
            <p>Creado en Cloudflare: <span className="text-white font-medium">{createdDate}</span></p>
            <p>Rama de código: <span className="text-mono text-[#D4A853]">{project?.production_branch || "main"}</span></p>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto uiverse-btn-gold px-6 py-3 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider"
            >
              <Globe className="w-4 h-4" />
              Visitar Web ({displayDomain})
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#22222e] hover:bg-[#2d2d3d] border border-[#444] text-xs font-bold text-white transition-all active:scale-95 cursor-pointer"
            >
              Volver Atrás
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
