"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, X } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export default function ProjectsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch(`/api/projects`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'development': return <Badge variant="info">Desarrollo</Badge>;
      case 'review': return <Badge variant="warning">Revisión</Badge>;
      case 'published': return <Badge variant="success">Publicado</Badge>;
      case 'maintenance': return <Badge variant="default">Mantenimiento</Badge>;
      default: return <Badge variant="default">Pendiente</Badge>;
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ═══ HEADER with background image ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#333]/50 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/chart-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#D4A853] animate-ping" />
              <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest drop-shadow-lg">Gestión de Proyectos</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-xl">Proyectos</h1>
            <p className="text-[#d1d1d1] text-sm mt-0.5 drop-shadow-lg">Administra los proyectos de desarrollo.</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-[#D4A853] hover:bg-[#c39742] active:scale-[0.98] text-black font-semibold shadow-lg shadow-[#D4A853]/10 hover:shadow-[#D4A853]/25 transition-all duration-300 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isFormOpen ? "Cerrar Formulario" : "Nuevo Proyecto"}
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="relative overflow-hidden rounded-xl border border-[#333] shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/bg/actions-bg.jpg)" }}
          />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px]" />
          <div className="relative z-10 p-6">
            <ProjectForm onSuccess={() => {
              setIsFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ["projects"] });
            }} />
          </div>
        </div>
      )}

      {/* ═══ TABLE with background image ═══ */}
      <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg hover-glow transition-all duration-300 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/resources-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        
        <div className="relative z-10">
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader size={1.0} />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Nombre</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Cliente</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Estado</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Presupuesto</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 text-right drop-shadow-md">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects?.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="text-center py-8 text-[#c9c9c9] drop-shadow-md">
                      No se encontraron proyectos.
                    </TableCell>
                  </TableRow>
                ) : (
                  projects?.map((project: any) => (
                    <TableRow key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300">
                      <TableCell className="font-medium text-white drop-shadow-md">{project.name}</TableCell>
                      <TableCell className="text-[#ccc] drop-shadow-sm">{project.clients?.name || "-"}</TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell className="text-[#D4A853] font-semibold drop-shadow-md">{project.budget ? `€${project.budget}` : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project)} className="hover:bg-white/10 hover:text-white text-xs font-semibold">Ver Detalles</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative overflow-hidden w-full max-w-lg rounded-xl shadow-2xl flex flex-col border border-[#333]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/bg/services-bg.jpg)" }}
            />
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[3px]" />
            
            <div className="relative z-10">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">{selectedProject.name}</h2>
                  <p className="text-sm text-[#bbb] drop-shadow-md">Detalles del proyecto de desarrollo.</p>
                </div>
                <button 
                  onClick={() => setSelectedProject(null)} 
                  className="text-[#A3A3A3] hover:text-white p-1 rounded-md hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#bbb] uppercase font-semibold drop-shadow-sm">Cliente</p>
                    <p className="text-white mt-1 font-medium drop-shadow-md">{selectedProject.clients?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#bbb] uppercase font-semibold drop-shadow-sm">Estado</p>
                    <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#bbb] uppercase font-semibold drop-shadow-sm">Presupuesto</p>
                    <p className="text-[#D4A853] mt-1 font-semibold drop-shadow-md">
                      {selectedProject.budget ? `€${selectedProject.budget}` : "Sin presupuesto"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#bbb] uppercase font-semibold drop-shadow-sm">Fecha de Inicio</p>
                    <p className="text-white mt-1 drop-shadow-md">
                      {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-[#bbb] uppercase font-semibold drop-shadow-sm">Descripción / Notas</p>
                  <p className="text-[#ddd] mt-1.5 leading-relaxed bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/5 whitespace-pre-wrap drop-shadow-sm">
                    {selectedProject.description || "Sin descripción proporcionada."}
                  </p>
                </div>

                {selectedProject.description?.includes("Cloudflare Pages Site") && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-[#bbb] uppercase font-semibold drop-shadow-sm">Enlace del Sitio Web (Cloudflare)</p>
                    {(() => {
                      const subdomainMatch = selectedProject.description.match(/Subdomain: ([^\s]+)/);
                      const subdomain = subdomainMatch ? subdomainMatch[1] : null;
                      if (subdomain) {
                        return (
                          <a 
                            href={`https://${subdomain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center mt-2 text-[#D4A853] hover:underline font-semibold drop-shadow-md"
                          >
                            Visitar sitio web en producción ↗
                          </a>
                        );
                      }
                      return <p className="text-white mt-1 drop-shadow-md">Subdominio no especificado.</p>;
                    })()}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 flex justify-end">
                <Button onClick={() => setSelectedProject(null)} className="bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20">
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const { data: clients } = useQuery({
    queryKey: ["clients-dropdown"],
    queryFn: async () => {
      const res = await fetch(`/api/clients`);
      return res.json();
    },
  });
  
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-white mb-4 drop-shadow-lg">Crear Proyecto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-[#c9c9c9] font-semibold uppercase drop-shadow-sm">Nombre del Proyecto *</label>
          <Input name="name" required placeholder="Ej. Web Corporativa" className="bg-black/40 backdrop-blur-md border-white/10" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[#c9c9c9] font-semibold uppercase drop-shadow-sm">Cliente *</label>
          <select 
            name="client_id" 
            required
            className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
          >
            <option value="">Selecciona un cliente...</option>
            {clients?.map((client: any) => (
              <option key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ""}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[#c9c9c9] font-semibold uppercase drop-shadow-sm">Estado</label>
          <select 
            name="status" 
            className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
          >
            <option value="pending">Pendiente</option>
            <option value="development">En Desarrollo</option>
            <option value="review">En Revisión</option>
            <option value="published">Publicado</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[#c9c9c9] font-semibold uppercase drop-shadow-sm">Presupuesto (€)</label>
          <Input name="budget" type="number" step="0.01" placeholder="Ej. 1500.00" className="bg-black/40 backdrop-blur-md border-white/10" />
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading} className="bg-[#D4A853] hover:bg-[#c39742] text-black font-bold rounded-xl cursor-pointer">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Guardar Proyecto
        </Button>
      </div>
    </form>
  );
}
