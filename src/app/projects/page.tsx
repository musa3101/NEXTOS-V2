"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, X, FolderKanban, ExternalLink } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-16 flex items-center justify-center"><Loader size={1.0} /></div>}>
      <ProjectsContent />
    </Suspense>
  );
}

function ProjectsContent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Open form if action=new in URL
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setIsFormOpen(true);
    }
  }, [searchParams]);

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
      case 'development': return <Badge variant="info" className="bg-blue-500/20 text-blue-400 border border-blue-500/30">Desarrollo</Badge>;
      case 'review': return <Badge variant="warning" className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Revisión</Badge>;
      case 'published': return <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Publicado</Badge>;
      case 'maintenance': return <Badge variant="default" className="bg-purple-500/20 text-purple-400 border border-purple-500/30">Mantenimiento</Badge>;
      default: return <Badge variant="default">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* ═══ HEADER with background image ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#333]/50 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/chart-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 sm:p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#D4A853] animate-ping" />
              <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest drop-shadow-lg">Gestión de Proyectos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-xl">Proyectos de Desarrollo</h1>
            <p className="text-[#d1d1d1] text-xs sm:text-sm mt-0.5 drop-shadow-lg">Administra tus webs, apps y presupuestos asociados.</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-[#D4A853] hover:bg-[#c39742] active:scale-[0.98] text-black font-semibold shadow-lg shadow-[#D4A853]/15 transition-all duration-300 rounded-xl cursor-pointer touch-manipulation min-h-[44px] w-full sm:w-auto"
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[3px]" />
          <div className="relative z-10 p-5 sm:p-6">
            <ProjectForm onSuccess={() => {
              setIsFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ["projects"] });
            }} />
          </div>
        </div>
      )}

      {/* ═══ PROJECTS LIST (Mobile Cards, Desktop Table) ═══ */}
      <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/resources-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
        
        <div className="relative z-10">
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader size={1.0} />
            </div>
          ) : (
            <>
              {/* Mobile: cards view (hidden on md+) */}
              <div className="md:hidden divide-y divide-white/10">
                {projects?.length === 0 ? (
                  <div className="p-8 text-center text-[#c9c9c9] text-sm">No se encontraron proyectos.</div>
                ) : (
                  projects?.map((project: any) => (
                    <div key={project.id} className="p-4 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm tracking-wide truncate">{project.name}</span>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#A3A3A3]">
                        <span>Cliente: <strong className="text-white/90">{project.clients?.name || "-"}</strong></span>
                        <span className="text-[#D4A853] font-bold">{project.budget ? `€${project.budget}` : ""}</span>
                      </div>
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-white font-semibold border border-white/10 transition-all touch-manipulation min-h-[36px]"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop: table (hidden on mobile) */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-black/30">
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
                            <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project)} className="hover:bg-white/10 hover:text-white text-xs font-semibold">
                              Ver Detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal (Mobile optimized) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="relative overflow-hidden w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-[#333] bg-[#141419] max-h-[90vh]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/bg/services-bg.jpg)" }}
            />
            <div className="absolute inset-0 bg-black/85 backdrop-blur-[3px]" />
            
            <div className="relative z-10 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-black/30">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">{selectedProject.name}</h2>
                  <p className="text-xs text-[#bbb] drop-shadow-md">Detalles del proyecto de desarrollo.</p>
                </div>
                <button 
                  onClick={() => setSelectedProject(null)} 
                  className="text-[#A3A3A3] hover:text-white p-2 rounded-lg hover:bg-white/10 touch-manipulation cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4 text-sm overflow-y-auto flex-1 overscroll-contain">
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
                  <p className="text-[#ddd] mt-1.5 text-xs sm:text-sm leading-relaxed bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-white/5 whitespace-pre-wrap drop-shadow-sm">
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
                            className="inline-flex items-center gap-1.5 mt-2 text-[#D4A853] hover:underline font-semibold drop-shadow-md text-xs sm:text-sm touch-manipulation"
                          >
                            <span>Visitar sitio web en producción</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        );
                      }
                      return <p className="text-white mt-1 drop-shadow-md text-xs">Subdominio no especificado.</p>;
                    })()}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 flex justify-end bg-black/40">
                <Button onClick={() => setSelectedProject(null)} className="bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 min-h-[44px]">
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
      <h3 className="text-base sm:text-lg font-bold text-white mb-3 drop-shadow-lg">Crear Nuevo Proyecto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-[#c9c9c9] font-semibold uppercase drop-shadow-sm">Nombre del Proyecto *</label>
          <Input name="name" required placeholder="Ej. Web Corporativa" className="bg-black/40 backdrop-blur-md border-white/10" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#c9c9c9] font-semibold uppercase drop-shadow-sm">Cliente *</label>
          <select 
            name="client_id" 
            required
            className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-3 py-2 text-base md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
          >
            <option value="">Selecciona un cliente...</option>
            {clients?.map((client: any) => (
              <option key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ""}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#c9c9c9] font-semibold uppercase drop-shadow-sm">Estado</label>
          <select 
            name="status" 
            className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-3 py-2 text-base md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
          >
            <option value="pending">Pendiente</option>
            <option value="development">En Desarrollo</option>
            <option value="review">En Revisión</option>
            <option value="published">Publicado</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#c9c9c9] font-semibold uppercase drop-shadow-sm">Presupuesto (€)</label>
          <Input name="budget" type="number" step="0.01" placeholder="Ej. 1500.00" className="bg-black/40 backdrop-blur-md border-white/10" />
        </div>
      </div>
      <div className="pt-3 flex justify-end">
        <Button type="submit" disabled={loading} className="bg-[#D4A853] hover:bg-[#c39742] text-black font-bold rounded-xl cursor-pointer min-h-[44px] w-full sm:w-auto">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Guardar Proyecto
        </Button>
      </div>
    </form>
  );
}
