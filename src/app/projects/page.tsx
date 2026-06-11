"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, X } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Proyectos</h1>
          <p className="text-[#A3A3A3] text-sm">Administra los proyectos de desarrollo.</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus className="w-4 h-4 mr-2" />
          {isFormOpen ? "Cerrar Formulario" : "Nuevo Proyecto"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="p-6">
          <ProjectForm onSuccess={() => {
            setIsFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ["projects"] });
          }} />
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A853]" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-[#A3A3A3]">
                    No se encontraron proyectos.
                  </TableCell>
                </TableRow>
              ) : (
                projects?.map((project: any) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium text-white">{project.name}</TableCell>
                    <TableCell>{project.clients?.name || "-"}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{project.budget ? `€${project.budget}` : "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project)}>Ver Detalles</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#1A1A1A] border border-[#333] w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#111]/50">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
                <p className="text-sm text-[#A3A3A3]">Detalles del proyecto de desarrollo.</p>
              </div>
              <button 
                onClick={() => setSelectedProject(null)} 
                className="text-[#A3A3A3] hover:text-white p-1 rounded-md hover:bg-[#262626]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase font-semibold">Cliente</p>
                  <p className="text-white mt-1 font-medium">{selectedProject.clients?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase font-semibold">Estado</p>
                  <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase font-semibold">Presupuesto</p>
                  <p className="text-[#D4A853] mt-1 font-semibold">
                    {selectedProject.budget ? `€${selectedProject.budget}` : "Sin presupuesto"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase font-semibold">Fecha de Inicio</p>
                  <p className="text-white mt-1">
                    {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-[#333]">
                <p className="text-xs text-[#A3A3A3] uppercase font-semibold">Descripción / Notas</p>
                <p className="text-[#E5E5E5] mt-1.5 leading-relaxed bg-[#262626]/30 p-3 rounded-lg border border-[#333] whitespace-pre-wrap">
                  {selectedProject.description || "Sin descripción proporcionada."}
                </p>
              </div>

              {selectedProject.description?.includes("Cloudflare Pages Site") && (
                <div className="pt-2 border-t border-[#333]">
                  <p className="text-xs text-[#A3A3A3] uppercase font-semibold">Enlace del Sitio Web (Cloudflare)</p>
                  {(() => {
                    const subdomainMatch = selectedProject.description.match(/Subdomain: ([^\s]+)/);
                    const subdomain = subdomainMatch ? subdomainMatch[1] : null;
                    if (subdomain) {
                      return (
                        <a 
                          href={`https://${subdomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center mt-2 text-[#D4A853] hover:underline font-semibold"
                        >
                          Visitar sitio web en producción ↗
                        </a>
                      );
                    }
                    return <p className="text-white mt-1">Subdominio no especificado.</p>;
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-[#111]/30 border-t border-[#333] flex justify-end">
              <Button onClick={() => setSelectedProject(null)} className="bg-[#262626] border border-[#333]">
                Cerrar
              </Button>
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
      <h3 className="text-lg font-medium text-white mb-4">Crear Proyecto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-[#A3A3A3]">Nombre del Proyecto *</label>
          <Input name="name" required placeholder="Ej. Web Corporativa" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[#A3A3A3]">Cliente *</label>
          <select 
            name="client_id" 
            required
            className="flex h-10 w-full rounded-md border border-[#333] bg-[#1A1A1A] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
          >
            <option value="">Selecciona un cliente...</option>
            {clients?.map((client: any) => (
              <option key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ""}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[#A3A3A3]">Estado</label>
          <select 
            name="status" 
            className="flex h-10 w-full rounded-md border border-[#333] bg-[#1A1A1A] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
          >
            <option value="pending">Pendiente</option>
            <option value="development">En Desarrollo</option>
            <option value="review">En Revisión</option>
            <option value="published">Publicado</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[#A3A3A3]">Presupuesto (€)</label>
          <Input name="budget" type="number" step="0.01" placeholder="Ej. 1500.00" />
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Guardar Proyecto
        </Button>
      </div>
    </form>
  );
}
