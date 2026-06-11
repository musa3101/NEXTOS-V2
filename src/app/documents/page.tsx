"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CredentialItem {
  service: string;
  url: string;
  username: string;
  password?: string;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Queries
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await fetch(`/api/documents`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
    enabled: isCreateOpen,
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: isCreateOpen,
  });

  const handleDownload = (id: string, number: string) => {
    window.open(`/api/documents/${id}/pdf`, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ═══ HEADER with background image ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#333]/50 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/services-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#D4A853] animate-ping" />
              <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest drop-shadow-lg">Documentación</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-xl">Documentos Dinámicos</h1>
            <p className="text-[#d1d1d1] text-sm mt-0.5 drop-shadow-lg">Facturas y entregas generadas en PDF.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[#D4A853] hover:bg-[#c39742] active:scale-[0.98] text-black font-semibold shadow-lg shadow-[#D4A853]/10 hover:shadow-[#D4A853]/25 transition-all duration-300 rounded-xl cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Documento
          </Button>
        </div>
      </div>

      {/* ═══ TABLE with background image ═══ */}
      <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg hover-glow transition-all duration-300 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/chart-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        
        <div className="relative z-10">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4A853]" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Número</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Tipo</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Cliente</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Fecha</TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 text-right drop-shadow-md">PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents?.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="text-center py-8 text-[#c9c9c9] drop-shadow-md">
                      No hay documentos generados.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents?.map((doc: any) => (
                    <TableRow key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300">
                      <TableCell className="font-medium text-white drop-shadow-md">{doc.number}</TableCell>
                      <TableCell>
                        <Badge variant={doc.type === "invoice" ? "warning" : "info"} className="backdrop-blur-sm">
                          {doc.type === "invoice" ? "Factura" : "Entrega"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#ccc] drop-shadow-sm">{doc.clients?.name || "-"}</TableCell>
                      <TableCell className="text-[#ccc] drop-shadow-sm">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="secondary" size="sm" onClick={() => handleDownload(doc.id, doc.number)} className="bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 text-white">
                          <Download className="w-4 h-4 mr-2" /> Descargar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Slide-over or Modal Creator */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative overflow-hidden w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-[#333]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/bg/header-bg.jpg)" }}
            />
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[3px]" />
            
            <div className="relative z-10 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">Generar Nuevo Documento</h2>
                  <p className="text-sm text-[#bbb] drop-shadow-md">Crea facturas o actas de entrega para tus clientes.</p>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)} 
                  className="text-[#A3A3A3] hover:text-white p-1 rounded-md hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Scrollable Form */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <DocumentForm 
                  clients={clients || []} 
                  projects={projects || []} 
                  onSuccess={() => {
                    setIsCreateOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["documents"] });
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DocumentFormProps {
  clients: any[];
  projects: any[];
  onSuccess: () => void;
}

function DocumentForm({ clients, projects, onSuccess }: DocumentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Basic Fields
  const [type, setType] = useState<"invoice" | "delivery">("invoice");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");

  // Invoice Specific Fields
  const [taxRate, setTaxRate] = useState(21);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unitPrice: 0 }
  ]);

  // Delivery Specific Fields
  const [summary, setSummary] = useState("");
  const [stack, setStack] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);

  // Filter projects by selected client
  const filteredProjects = projects.filter(p => p.client_id === clientId);

  // Live calculations for Invoice
  const subtotal = invoiceItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  // Invoice Items Management
  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };
  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };
  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...invoiceItems];
    updated[index] = { ...updated[index], [field]: value };
    setInvoiceItems(updated);
  };

  // Credentials Management
  const addCredential = () => {
    setCredentials([...credentials, { service: "", url: "", username: "", password: "" }]);
  };
  const removeCredential = (index: number) => {
    setCredentials(credentials.filter((_, i) => i !== index));
  };
  const updateCredential = (index: number, field: keyof CredentialItem, value: string) => {
    const updated = [...credentials];
    updated[index] = { ...updated[index], [field]: value };
    setCredentials(updated);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) {
      setError("Por favor, selecciona un cliente.");
      return;
    }

    setLoading(true);
    setError(null);

    const clientObj = clients.find(c => c.id === clientId);
    const projectObj = projects.find(p => p.id === projectId);

    let templateData: any = {};
    let totalAmount: number | null = null;

    if (type === "invoice") {
      if (invoiceItems.some(item => !item.description)) {
        setError("Todos los conceptos de la factura deben tener una descripción.");
        setLoading(false);
        return;
      }
      totalAmount = total;
      templateData = {
        number: "", // Generated by backend, but included for PDF consistency
        date: new Date().toLocaleDateString("es-ES"),
        dueDate: new Date(dueDate).toLocaleDateString("es-ES"),
        client: {
          name: clientObj?.name || "",
          company: clientObj?.company || clientObj?.name || "",
          address: clientObj?.notes ? clientObj.notes.substring(0, 80) : "" // Fallback/notes
        },
        items: invoiceItems.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })),
        taxRate: Number(taxRate)
      };
    } else {
      if (!summary) {
        setError("Por favor, incluye un resumen de entrega.");
        setLoading(false);
        return;
      }
      templateData = {
        number: "",
        date: new Date().toLocaleDateString("es-ES"),
        client: {
          name: clientObj?.name || "",
          company: clientObj?.company || clientObj?.name || ""
        },
        project: {
          name: projectObj?.name || "Proyecto Software"
        },
        summary,
        stack: stack.split(",").map(s => s.trim()).filter(Boolean),
        deliverables: deliverables.split(",").map(d => d.trim()).filter(Boolean),
        credentials: credentials.map(c => ({
          service: c.service,
          url: c.url,
          username: c.username,
          password: c.password || ""
        }))
      };
    }

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          project_id: projectId || null,
          type,
          template_data: templateData,
          total_amount: totalAmount
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ocurrió un error al guardar.");
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Main Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-[#A3A3A3] font-semibold uppercase">Tipo de Documento</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value as any)}
            className="flex h-10 w-full rounded-md border border-[#333] bg-[#1A1A1A] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
          >
            <option value="invoice">Factura</option>
            <option value="delivery">Entrega de Proyecto</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#A3A3A3] font-semibold uppercase">Cliente *</label>
          <select 
            value={clientId} 
            onChange={(e) => {
              setClientId(e.target.value);
              setProjectId(""); // Reset project selector
            }}
            required
            className="flex h-10 w-full rounded-md border border-[#333] bg-[#1A1A1A] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
          >
            <option value="">-- Seleccionar --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#A3A3A3] font-semibold uppercase">Proyecto Relacionado</label>
          <select 
            value={projectId} 
            onChange={(e) => setProjectId(e.target.value)}
            disabled={!clientId}
            className="flex h-10 w-full rounded-md border border-[#333] bg-[#1A1A1A] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853] disabled:opacity-50"
          >
            <option value="">-- Ninguno / General --</option>
            {filteredProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoice Specific Fields Sub-form */}
      {type === "invoice" && (
        <div className="space-y-6 border-t border-[#333] pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-[#A3A3A3] font-semibold uppercase">IVA (%)</label>
              <Input 
                type="number" 
                value={taxRate} 
                onChange={(e) => setTaxRate(Number(e.target.value))} 
                className="bg-[#1A1A1A]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#A3A3A3] font-semibold uppercase">Fecha de Vencimiento</label>
              <Input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                className="bg-[#1A1A1A]" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs text-[#A3A3A3] font-semibold uppercase">Conceptos / Líneas de Factura</label>
              <Button type="button" size="sm" onClick={addInvoiceItem} className="bg-[#262626] hover:bg-[#333] border border-[#444]">
                <Plus className="w-4 h-4 mr-1 text-[#D4A853]" /> Añadir concepto
              </Button>
            </div>

            <div className="space-y-3">
              {invoiceItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-center bg-[#262626]/30 p-3 rounded-lg border border-[#333]">
                  <div className="flex-1">
                    <Input 
                      placeholder="Ej. Diseño UI/UX y Wireframing" 
                      value={item.description} 
                      onChange={(e) => updateInvoiceItem(index, "description", e.target.value)}
                      className="bg-[#1A1A1A] h-9" 
                      required 
                    />
                  </div>
                  <div className="w-24">
                    <Input 
                      type="number" 
                      placeholder="Cant." 
                      value={item.quantity} 
                      onChange={(e) => updateInvoiceItem(index, "quantity", Number(e.target.value))}
                      className="bg-[#1A1A1A] h-9" 
                      min="1"
                      required 
                    />
                  </div>
                  <div className="w-32">
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="Precio €" 
                      value={item.unitPrice} 
                      onChange={(e) => updateInvoiceItem(index, "unitPrice", Number(e.target.value))}
                      className="bg-[#1A1A1A] h-9" 
                      required 
                    />
                  </div>
                  {invoiceItems.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeInvoiceItem(index)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-9 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Calculations Box */}
            <div className="flex justify-end pt-4">
              <div className="bg-[#1A1A1A] border border-[#333] p-4 rounded-lg w-full max-w-xs space-y-2 text-sm text-[#A3A3A3]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white font-medium">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({taxRate}%):</span>
                  <span className="text-white font-medium">€{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-[#333] pt-2 text-base">
                  <span className="text-white font-bold">TOTAL:</span>
                  <span className="text-[#D4A853] font-bold">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Specific Fields Sub-form */}
      {type === "delivery" && (
        <div className="space-y-6 border-t border-[#333] pt-6">
          <div className="space-y-2">
            <label className="text-xs text-[#A3A3A3] font-semibold uppercase">Resumen del Proyecto / Entrega *</label>
            <textarea 
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ej. Este documento consolida la entrega final del software e-commerce, incluyendo el despliegue del frontend, la base de datos de producción y las claves de acceso correspondientes."
              className="flex w-full rounded-md border border-[#333] bg-[#1A1A1A] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-[#A3A3A3] font-semibold uppercase">Stack Tecnológico (Separado por comas)</label>
              <Input 
                placeholder="Ej. Next.js, Supabase, Tailwind, Cloudflare" 
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                className="bg-[#1A1A1A]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#A3A3A3] font-semibold uppercase">Entregables (Separados por comas)</label>
              <Input 
                placeholder="Ej. Repositorio de código, Despliegue en producción, Manual de API" 
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                className="bg-[#1A1A1A]" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs text-[#A3A3A3] font-semibold uppercase">Credenciales de Acceso (Opcional)</label>
              <Button type="button" size="sm" onClick={addCredential} className="bg-[#262626] hover:bg-[#333] border border-[#444]">
                <Plus className="w-4 h-4 mr-1 text-[#D4A853]" /> Añadir credencial
              </Button>
            </div>

            <div className="space-y-3">
              {credentials.map((cred, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-[#262626]/30 p-3 rounded-lg border border-[#333] items-end relative">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A3A3A3] uppercase">Servicio</label>
                    <Input 
                      placeholder="Ej. Vercel" 
                      value={cred.service} 
                      onChange={(e) => updateCredential(index, "service", e.target.value)}
                      className="bg-[#1A1A1A] h-9" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A3A3A3] uppercase">URL/Host</label>
                    <Input 
                      placeholder="Ej. vercel.com" 
                      value={cred.url} 
                      onChange={(e) => updateCredential(index, "url", e.target.value)}
                      className="bg-[#1A1A1A] h-9" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A3A3A3] uppercase">Usuario</label>
                    <Input 
                      placeholder="Ej. admin@company.com" 
                      value={cred.username} 
                      onChange={(e) => updateCredential(index, "username", e.target.value)}
                      className="bg-[#1A1A1A] h-9" 
                      required 
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] text-[#A3A3A3] uppercase">Contraseña</label>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        value={cred.password || ""} 
                        onChange={(e) => updateCredential(index, "password", e.target.value)}
                        className="bg-[#1A1A1A] h-9" 
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeCredential(index)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-9 p-2 mt-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="border-t border-[#333] pt-6 flex justify-end gap-3">
        <Button 
          type="submit" 
          disabled={loading} 
          className="bg-[#D4A853] hover:bg-[#c39742] text-black font-semibold min-w-[120px]"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Guardar Documento"}
        </Button>
      </div>
    </form>
  );
}
