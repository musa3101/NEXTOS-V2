"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Loader2, 
  Globe, 
  ExternalLink, 
  Mail, 
  ShieldCheck, 
  FileText,
  UserCheck
} from "lucide-react";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [onlyCloudflare, setOnlyCloudflare] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: async () => {
      const res = await fetch(`/api/clients${search ? `?search=${search}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  // Filter clients to show only those with active Cloudflare pages if checked
  const filteredClients = (clients || []).filter((client: any) => {
    if (!onlyCloudflare) return true;
    
    // Check if client has at least one active Cloudflare project
    return client.projects?.some((p: any) => 
      p.status === "published" || 
      (p.description && p.description.toLowerCase().includes("cloudflare"))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ═══ HEADER with background image ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#333]/50 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/header-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#D4A853] animate-ping" />
              <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest drop-shadow-lg">Gestión de Clientes</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-xl">Clientes</h1>
            <p className="text-[#d1d1d1] text-sm mt-0.5 drop-shadow-lg">Administra los perfiles de clientes y sincronización con Cloudflare.</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(!isFormOpen)} 
            className="bg-[#D4A853] hover:bg-[#c39742] active:scale-[0.98] text-black font-semibold shadow-lg shadow-[#D4A853]/10 hover:shadow-[#D4A853]/25 transition-all duration-300 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isFormOpen ? "Cerrar Formulario" : "Nuevo Cliente"}
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="relative overflow-hidden rounded-xl border border-[#333] shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/bg/services-bg.jpg)" }}
          />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px]" />
          <div className="relative z-10 p-6">
            <ClientForm onSuccess={() => {
              setIsFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ["clients"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            }} />
          </div>
        </div>
      )}

      {/* ═══ MAIN TABLE with background image ═══ */}
      <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg hover-glow transition-all duration-300 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/activity-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        
        <div className="relative z-10">
          {/* Search & Cloudflare Sync Filter Controls */}
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-10 bg-black/40 backdrop-blur-md border-white/10 hover:border-[#D4A853]/30 text-white focus:border-[#D4A853] transition-colors rounded-xl h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-sm border border-white/10 px-4 py-2.5 rounded-xl self-stretch sm:self-auto justify-center">
              <input 
                type="checkbox" 
                id="cfFilter" 
                checked={onlyCloudflare} 
                onChange={(e) => setOnlyCloudflare(e.target.checked)}
                className="rounded border-[#333] text-[#D4A853] focus:ring-[#D4A853] bg-[#111] w-4.5 h-4.5 cursor-pointer accent-[#D4A853]"
              />
              <label htmlFor="cfFilter" className="text-xs text-[#c9c9c9] font-semibold cursor-pointer select-none drop-shadow-sm">
                Solo Sitios Activos (Cloudflare)
              </label>
            </div>
          </div>

          {/* Clients Listing */}
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#D4A853]" />
              <span className="text-xs text-[#c9c9c9] font-medium uppercase tracking-wider animate-pulse drop-shadow-md">Sincronizando con Cloudflare...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/20">
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Cliente</TableHead>
                    <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Empresa</TableHead>
                    <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Email</TableHead>
                    <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Sitio Web (CF)</TableHead>
                    <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Estado CF</TableHead>
                    <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 text-right pr-6 drop-shadow-md">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="text-center py-12 text-[#c9c9c9]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Globe className="w-8 h-8 text-[#555] animate-pulse" />
                          <p className="text-sm font-semibold drop-shadow-md">No se encontraron clientes activos.</p>
                          <p className="text-xs text-[#999]">Intenta desactivando el filtro de Cloudflare.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client: any) => {
                      // Extract active Cloudflare project link & subdomain
                      const cfProj = client.projects?.find((p: any) => 
                        p.status === "published" || 
                        (p.description && p.description.toLowerCase().includes("cloudflare"))
                      );

                      let subdomain = null;
                      if (cfProj?.description) {
                        const subdomainMatch = cfProj.description.match(/Subdomain: ([^\s]+)/);
                        subdomain = subdomainMatch ? subdomainMatch[1] : null;
                      }

                      const isCFActive = cfProj?.status === "published";

                      return (
                        <TableRow key={client.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300">
                          {/* Name & Initials Badge */}
                          <TableCell className="font-semibold text-white py-4 pl-6 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-[#D4A853]/30 text-[#D4A853] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-white leading-none drop-shadow-md">{client.name}</span>
                              <span className="text-[10px] text-[#bbb] mt-1 block uppercase tracking-wider font-semibold">
                                ID: {client.id.substring(0, 8)}
                              </span>
                            </div>
                          </TableCell>

                          {/* Company */}
                          <TableCell className="py-4 text-sm font-medium text-[#ddd] drop-shadow-sm">{client.company || "-"}</TableCell>

                          {/* Email */}
                          <TableCell className="py-4">
                            {client.email ? (
                              <a href={`mailto:${client.email}`} className="text-sm text-[#bbb] hover:text-[#D4A853] transition-colors flex items-center gap-1.5 w-fit drop-shadow-sm">
                                <Mail className="w-3.5 h-3.5 shrink-0" /> {client.email}
                              </a>
                            ) : (
                              <span className="text-sm text-[#555]">-</span>
                            )}
                          </TableCell>

                          {/* Cloudflare Pages Subdomain Link */}
                          <TableCell className="py-4">
                            {subdomain ? (
                              <a 
                                href={`https://${subdomain}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs text-[#D4A853] hover:underline font-bold flex items-center gap-1 w-fit group/link drop-shadow-md"
                              >
                                <Globe className="w-3.5 h-3.5 text-[#D4A853]/80" /> {subdomain} <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                              </a>
                            ) : (
                              <span className="text-xs text-[#666]">No conectado</span>
                            )}
                          </TableCell>

                          {/* Cloudflare Site Deploy Status Badge */}
                          <TableCell className="py-4">
                            {isCFActive ? (
                              <Badge variant="success" className="text-[10px] uppercase font-bold py-0.5 px-2.5 rounded-full flex items-center gap-1.5 w-fit animate-pulse border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-sm">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Subido / Activo
                              </Badge>
                            ) : (
                              <Badge variant="warning" className="text-[10px] uppercase font-bold py-0.5 px-2.5 rounded-full flex items-center gap-1.5 w-fit border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm">
                                No Subido / Lead
                              </Badge>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4 text-right pr-6">
                            <Button variant="ghost" size="sm" className="hover:bg-white/10 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/10 text-xs font-semibold">
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
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
        <h3 className="text-lg font-bold text-white drop-shadow-lg">Crear Nuevo Perfil de Cliente</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#c9c9c9] uppercase tracking-wider pl-0.5 drop-shadow-sm">Nombre *</label>
          <Input name="name" required placeholder="Ej. Juan Pérez" className="bg-black/40 backdrop-blur-md border-white/10" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#c9c9c9] uppercase tracking-wider pl-0.5 drop-shadow-sm">Empresa</label>
          <Input name="company" placeholder="Ej. MyNext" className="bg-black/40 backdrop-blur-md border-white/10" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#c9c9c9] uppercase tracking-wider pl-0.5 drop-shadow-sm">Email</label>
          <Input name="email" type="email" placeholder="Ej. juan@empresa.com" className="bg-black/40 backdrop-blur-md border-white/10" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#c9c9c9] uppercase tracking-wider pl-0.5 drop-shadow-sm">Estado Inicial</label>
          <select 
            name="status" 
            className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853] focus:border-[#D4A853] transition-colors"
          >
            <option value="lead">Prospecto</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>
      {error && (
        <div className="text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-md backdrop-blur-sm">
          ⚠️ {error}
        </div>
      )}
      <div className="pt-2 flex justify-end">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-[#D4A853] hover:bg-[#c39742] text-black font-bold h-11 px-6 rounded-xl cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Guardar Cliente
        </Button>
      </div>
    </form>
  );
}
