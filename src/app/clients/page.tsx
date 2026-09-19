"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { 
  Search, 
  Plus, 
  Loader2, 
  Globe, 
  ExternalLink, 
  Mail, 
  MessageSquare,
  Phone,
  ShieldCheck, 
  FileText,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  LayoutGrid,
  List,
  Sparkles,
  Receipt,
  CalendarClock,
  ArrowUpRight,
  Briefcase
} from "lucide-react";
import { Loader } from "@/components/ui/loader";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "lead" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ["clients", search],
    queryFn: async () => {
      const res = await fetch(`/api/clients${search ? `?search=${search}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await fetch("/api/clients");
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setSyncFeedback("¡Sincronizado con éxito con Cloudflare!");
    } catch (err) {
      setSyncFeedback("Error al sincronizar");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  const allClients = clients || [];

  const filteredClients = allClients.filter((client: any) => {
    if (statusFilter === "all") return true;
    return client.status === statusFilter;
  });

  // Calculate metrics
  const totalCount = allClients.length;
  const activeCount = allClients.filter((c: any) => c.status === "active").length;
  const leadCount = allClients.filter((c: any) => c.status === "lead").length;
  const totalWebs = allClients.reduce((acc: number, c: any) => acc + (c.projects?.length || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* ═══ HERO BRANDING (gpt-taste & uipro-max) ═══ */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#D4A853]/25 shadow-2xl group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/header-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/50" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 sm:p-8 md:p-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A853]"></span>
              </span>
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4A853]">
                Directorio Ejecutivo &amp; Cuentas
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl">
              Clientes <span className="font-light text-[#A3A3A3]">&amp; Portafolio</span>
            </h1>
            
            <p className="text-sm md:text-base text-[#c4c4c4] font-medium leading-relaxed max-w-prose">
              Gestión estratégica de relaciones y cuentas clave. Contacto directo por WhatsApp/Email, webs desplegadas en Cloudflare y estados de facturación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-black/40 hover:bg-black/60 border border-white/10 text-white text-xs font-semibold rounded-xl h-11 px-4 cursor-pointer disabled:opacity-50 shadow-sm"
              title="Sincronizar proyectos de Cloudflare con la base de datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 text-[#D4A853] ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Sincronizando..." : "Sincronizar Cloudflare"}
            </Button>
            <Button 
              onClick={() => setIsFormOpen(!isFormOpen)} 
              className="bg-[#D4A853] hover:bg-[#c39742] active:scale-[0.98] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#D4A853]/15 transition-all duration-300 rounded-xl cursor-pointer h-11 px-5"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {isFormOpen ? "Cerrar" : "Nuevo Cliente"}
            </Button>
          </div>
        </div>
      </div>

      {syncFeedback && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* ═══ FORMULARIO DESPLEGABLE CON CRISTAL AHUMADO ═══ */}
      {isFormOpen && (
        <div className="relative overflow-hidden rounded-2xl border border-[#D4A853]/30 bg-[#161619]/90 backdrop-blur-xl p-6 md:p-8 shadow-2xl animate-in slide-in-from-top-3 duration-300">
          <ClientForm onSuccess={() => {
            setIsFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          }} />
        </div>
      )}

      {/* ═══ BENTO KPI COUNTERS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141417]/80 backdrop-blur-md border border-white/10 hover:border-[#D4A853]/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888]">Total Clientes</span>
            <div className="p-2 rounded-xl bg-white/5 text-[#D4A853]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight mt-2">{totalCount}</p>
          <span className="text-[11px] text-[#777] font-medium">Cuentas registradas</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141417]/80 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888]">Activos / VIP</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 tracking-tight mt-2">{activeCount}</p>
          <span className="text-[11px] text-[#777] font-medium">Con contratos en vigor</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141417]/80 backdrop-blur-md border border-white/10 hover:border-amber-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888]">Prospectos</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400 tracking-tight mt-2">{leadCount}</p>
          <span className="text-[11px] text-[#777] font-medium">En fase de propuesta</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141417]/80 backdrop-blur-md border border-white/10 hover:border-[#D4A853]/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888]">Webs Vinculadas</span>
            <div className="p-2 rounded-xl bg-[#D4A853]/10 text-[#D4A853]">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#D4A853] tracking-tight mt-2">{totalWebs}</p>
          <span className="text-[11px] text-[#777] font-medium">Sitios activos en Cloudflare</span>
        </div>
      </div>

      {/* ═══ BARRA DE BÚSQUEDA, FILTROS Y SELECTOR DE VISTA ═══ */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-[#141417]/60 backdrop-blur-md border border-white/10">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]" />
          <input
            placeholder="Buscar por cliente, empresa o correo..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 hover:border-[#D4A853]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A853] transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status filter pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 overflow-x-auto">
            {(["all", "active", "lead", "inactive"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-[#D4A853] text-black shadow-sm"
                    : "text-[#888] hover:text-white"
                }`}
              >
                {st === "all" ? "Todos" : st === "active" ? "Activos" : st === "lead" ? "Leads" : "Inactivos"}
              </button>
            ))}
          </div>

          {/* View mode toggle: Grid / Table */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white/15 text-[#D4A853]" : "text-[#777] hover:text-white"
              }`}
              title="Vista de Tarjetas Ejecutivas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-white/15 text-[#D4A853]" : "text-[#777] hover:text-white"
              }`}
              title="Vista de Tabla Detallada"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ LISTADO DE CLIENTES (GRID BENTO vs TABLA) ═══ */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3">
          <Loader size={1.2} />
          <span className="text-xs text-[#888] font-bold uppercase tracking-wider animate-pulse">
            Cargando directorio de clientes...
          </span>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#141417]/40 border border-white/10">
          <Briefcase className="w-10 h-10 text-[#444] mx-auto mb-3" />
          <p className="text-white font-bold text-base">No se encontraron clientes</p>
          <p className="text-xs text-[#777] mt-1">Prueba cambiando los filtros o sincroniza con Cloudflare.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* ═══ VISTA BENTO CARDS EJECUTIVAS ═══ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client: any) => {
            const initials = client.name
              ? client.name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()
              : "CL";

            const projects = client.projects || [];
            const primaryProject = projects[0];

            return (
              <div
                key={client.id}
                className="relative overflow-hidden rounded-2xl bg-[#141417]/80 backdrop-blur-xl border border-white/10 hover:border-[#D4A853]/40 transition-all duration-300 p-6 flex flex-col justify-between group hover:shadow-2xl"
              >
                <div>
                  {/* Card Header: Avatar, Name & Status */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A853]/25 to-black border border-[#D4A853]/40 text-[#D4A853] flex items-center justify-center font-black text-base shadow-lg shadow-[#D4A853]/10 shrink-0 group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-white tracking-tight truncate group-hover:text-[#D4A853] transition-colors">
                          {client.name}
                        </h3>
                        {client.company && (
                          <p className="text-xs text-[#888] font-medium truncate">
                            {client.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {client.status === "active" ? (
                      <Badge variant="success" className="text-[10px] uppercase font-bold py-0.5 px-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shrink-0">
                        Activo
                      </Badge>
                    ) : client.status === "lead" ? (
                      <Badge variant="warning" className="text-[10px] uppercase font-bold py-0.5 px-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 shrink-0">
                        Lead
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0.5 px-2.5 rounded-full shrink-0">
                        Inactivo
                      </Badge>
                    )}
                  </div>

                  {/* Canales de Contacto Rápido */}
                  <div className="flex items-center gap-2 mb-4">
                    {client.email ? (
                      <a
                        href={`mailto:${client.email}?subject=Seguimiento%20Web%20-%20MYNEXT`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-[#d1d1d1] font-semibold transition-colors truncate"
                        title={client.email}
                      >
                        <Mail className="w-3.5 h-3.5 text-[#D4A853] shrink-0" />
                        <span className="truncate text-[11px]">{client.email}</span>
                      </a>
                    ) : (
                      <span className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#555] text-center">
                        Sin email
                      </span>
                    )}

                    {client.phone ? (
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors shrink-0"
                        title="Chat en WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[11px]">WhatsApp</span>
                      </a>
                    ) : null}
                  </div>

                  {/* Proyectos / Webs del Cliente */}
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#666] block">
                      Webs Desplegadas ({projects.length})
                    </span>

                    {projects.length === 0 ? (
                      <div className="py-2 px-3 rounded-xl bg-black/20 border border-white/5 text-[11px] text-[#666] italic">
                        Sin proyectos asignados
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {projects.slice(0, 2).map((proj: any) => {
                          let cleanSubdomain = proj.name ? `${proj.name}.pages.dev` : "";
                          if (proj.name?.toLowerCase() === "mynextbymusa") cleanSubdomain = "mynextbymusa.com";
                          if (proj.name?.toLowerCase() === "ecuaplac") cleanSubdomain = "ecuaplac.com";

                          return (
                            <a
                              key={proj.id}
                              href={`https://${cleanSubdomain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-[#D4A853]/30 transition-all text-xs group/proj"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Globe className="w-3.5 h-3.5 text-[#D4A853] shrink-0" />
                                <span className="text-white font-medium truncate">{proj.name}</span>
                              </div>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#777] group-hover/proj:text-[#D4A853] transition-colors shrink-0" />
                            </a>
                          );
                        })}
                        {projects.length > 2 && (
                          <span className="text-[10px] text-[#777] font-semibold block text-right">
                            +{projects.length - 2} web(s) más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones Rápidas del Cliente */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <Link
                    href={`/documents?action=new&type=invoice&client=${encodeURIComponent(client.name)}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#d1d1d1] hover:text-white font-semibold text-[11px] transition-colors"
                  >
                    <Receipt className="w-3 h-3 text-[#D4A853]" />
                    <span>Facturar</span>
                  </Link>

                  <Link
                    href={`/documents?action=new&type=proposal&client=${encodeURIComponent(client.name)}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#d1d1d1] hover:text-white font-semibold text-[11px] transition-colors"
                  >
                    <FileText className="w-3 h-3 text-[#D4A853]" />
                    <span>Propuesta</span>
                  </Link>

                  <Link
                    href="/maintenance"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#888] hover:text-[#D4A853] transition-colors"
                    title="Ver Mantenimiento"
                  >
                    <CalendarClock className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ═══ VISTA TABLA DETALLADA DE ALTO RENDIMIENTO ═══ */
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141417]/80 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4">Cliente</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4">Empresa</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4">Email</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4">Webs Asociadas</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4">Estado</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client: any) => {
                  const projects = client.projects || [];
                  const primaryProject = projects[0];

                  return (
                    <TableRow key={client.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-white py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] flex items-center justify-center font-bold text-xs">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#aaa] text-xs py-4">{client.company || "-"}</TableCell>
                      <TableCell className="text-[#aaa] text-xs py-4">{client.email || "-"}</TableCell>
                      <TableCell className="py-4">
                        {primaryProject ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#D4A853] font-semibold">
                            <Globe className="w-3 h-3" />
                            <span>{primaryProject.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#666]">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {client.status === "active" ? (
                          <Badge variant="success" className="text-[10px] uppercase font-bold py-0.5 px-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] uppercase font-bold py-0.5 px-2 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
                            Lead
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/documents?action=new&type=invoice&client=${encodeURIComponent(client.name)}`}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#d1d1d1] hover:text-[#D4A853] transition-colors"
                            title="Emitir Factura"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href="/maintenance"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#d1d1d1] hover:text-[#D4A853] transition-colors"
                            title="Ver Mantenimiento"
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        onSuccess();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to create client");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
        <UserCheck className="w-5 h-5 text-[#D4A853]" />
        <h3 className="text-lg font-bold text-white drop-shadow-lg">Nuevo Registro de Cliente</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#c9c9c9] uppercase tracking-wider pl-0.5">Nombre Completo *</label>
          <Input name="name" required placeholder="Ej. Juan Pérez" className="bg-black/40 backdrop-blur-md border-white/10 text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#c9c9c9] uppercase tracking-wider pl-0.5">Empresa / Negocio</label>
          <Input name="company" placeholder="Ej. Restaurante Marrakech" className="bg-black/40 backdrop-blur-md border-white/10 text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#c9c9c9] uppercase tracking-wider pl-0.5">Email de Facturación</label>
          <Input name="email" type="email" placeholder="Ej. contacto@cliente.com" className="bg-black/40 backdrop-blur-md border-white/10 text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#c9c9c9] uppercase tracking-wider pl-0.5">Teléfono / WhatsApp</label>
          <Input name="phone" placeholder="Ej. +34 600 000 000" className="bg-black/40 backdrop-blur-md border-white/10 text-white" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-[#c9c9c9] uppercase tracking-wider pl-0.5">Estado Inicial</label>
          <select 
            name="status" 
            className="flex h-10 w-full rounded-xl border border-white/10 bg-black/40 backdrop-blur-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853] focus:border-[#D4A853] transition-colors cursor-pointer"
          >
            <option value="active">Activo (Cliente en vigor)</option>
            <option value="lead">Prospecto (En negociación / propuesta)</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>
      {error && (
        <div className="text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          ⚠️ {error}
        </div>
      )}
      <div className="pt-2 flex justify-end">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-[#D4A853] hover:bg-[#c39742] text-black font-bold h-11 px-6 rounded-xl cursor-pointer shadow-lg shadow-[#D4A853]/20"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Guardar Perfil
        </Button>
      </div>
    </form>
  );
}
