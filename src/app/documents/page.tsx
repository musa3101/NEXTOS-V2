"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Plus, Trash2, X, Sparkles, FileText, PackageCheck, ExternalLink } from "lucide-react";
import { Loader } from "@/components/ui/loader";
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
  return (
    <Suspense fallback={<div className="p-16 flex items-center justify-center"><Loader size={1.0} /></div>}>
      <DocumentsContent />
    </Suspense>
  );
}

function DocumentsContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"invoice" | "proposal" | "delivery">("invoice");
  const [activeFilter, setActiveFilter] = useState<"all" | "invoice" | "proposal" | "delivery">("all");

  // Open modal automatically if URL has action=new or type=...
  useEffect(() => {
    const action = searchParams.get("action");
    const typeParam = searchParams.get("type");
    if (action === "new" || typeParam) {
      if (typeParam === "proposal" || typeParam === "invoice" || typeParam === "delivery") {
        setSelectedType(typeParam);
      }
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  // Queries
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await fetch(`/api/documents`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const openCreator = (type: "invoice" | "proposal" | "delivery") => {
    setSelectedType(type);
    setIsCreateOpen(true);
  };

  const filteredDocuments = (documents || []).filter((d: any) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "proposal") {
      return d.type === "proposal" || (d.type === "delivery" && d.template_data?.is_proposal);
    }
    return d.type === activeFilter;
  });

  const getDocBadge = (doc: any) => {
    const isProposal = doc.type === "proposal" || (doc.type === "delivery" && doc.template_data?.is_proposal);
    if (isProposal) {
      return <Badge variant="info" className="bg-blue-500/20 text-blue-400 border border-blue-500/30">Propuesta Demo</Badge>;
    }
    if (doc.type === "invoice") {
      return <Badge variant="warning" className="bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/30">Factura</Badge>;
    }
    return <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Entrega</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* ═══ HEADER with background image ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#333]/50 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/services-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 sm:p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#D4A853] animate-ping" />
              <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest drop-shadow-lg">Documentación Oficial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-xl">Generador de Documentos</h1>
            <p className="text-[#d1d1d1] text-xs sm:text-sm mt-0.5 drop-shadow-lg">Facturas, propuestas de demo web y actas de entrega en PDF.</p>
          </div>

          {/* Quick Creator Actions */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => openCreator("invoice")}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#c39742] active:scale-[0.98] text-black text-xs font-bold shadow-lg shadow-[#D4A853]/15 transition-all cursor-pointer touch-manipulation min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              Nuevo Documento
            </button>
            <button
              onClick={() => openCreator("proposal")}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-blue-500/15 transition-all cursor-pointer touch-manipulation min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              Propuesta Demo
            </button>
            <button
              onClick={() => openCreator("delivery")}
              className="hidden sm:flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#222] hover:bg-[#2e2e2e] border border-white/10 active:scale-[0.98] text-white text-xs font-semibold transition-all cursor-pointer touch-manipulation min-h-[44px]"
            >
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              Entrega
            </button>
          </div>
        </div>
      </div>

      {/* ═══ STATS SUMMARY GRID ═══ */}
      {(() => {
        const totalInvoiced = (documents || [])
          .filter((d: any) => d.type === "invoice" && d.total_amount)
          .reduce((sum: number, d: any) => sum + Number(d.total_amount || 0), 0);
        const invoiceCount = (documents || []).filter((d: any) => d.type === "invoice").length;
        const proposalCount = (documents || []).filter((d: any) => d.type === "proposal" || (d.type === "delivery" && d.template_data?.is_proposal)).length;
        const deliveryCount = (documents || []).filter((d: any) => d.type === "delivery" && !d.template_data?.is_proposal).length;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141419]/80 border border-[#333]/80 backdrop-blur-md flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">Total Documentos</span>
              <p className="text-xl sm:text-2xl font-black text-white mt-1 sm:mt-2">{isLoading ? "-" : (documents || []).length}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141419]/80 border border-[#D4A853]/30 backdrop-blur-md flex flex-col justify-between shadow-[0_0_15px_rgba(212,168,83,0.08)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A853]">Total Facturado</span>
              <p className="text-xl sm:text-2xl font-black text-[#D4A853] mt-1 sm:mt-2">{isLoading ? "-" : `€${totalInvoiced.toFixed(2)}`}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141419]/80 border border-[#333]/80 backdrop-blur-md flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">Desglose de Tipos</span>
              <p className="text-xs sm:text-sm font-bold text-white mt-1 sm:mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[#D4A853]">{invoiceCount} Facturas</span>
                <span className="text-[#555]">·</span>
                <span className="text-blue-400">{proposalCount} Propuestas</span>
                <span className="text-[#555]">·</span>
                <span className="text-emerald-400">{deliveryCount} Entregas</span>
              </p>
            </div>
          </div>
        );
      })()}

      {/* ═══ FILTER TABS ═══ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: "Todos" },
          { id: "invoice", label: "Facturas" },
          { id: "proposal", label: "Propuestas Demo" },
          { id: "delivery", label: "Entregas" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer touch-manipulation min-h-[36px] ${
              activeFilter === tab.id
                ? "bg-[#D4A853] text-black shadow-md shadow-[#D4A853]/20"
                : "bg-[#1A1A1A] text-[#A3A3A3] hover:text-white border border-[#333]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ DOCUMENTS LIST (Cards on mobile, Table on desktop) ═══ */}
      <div className="relative overflow-hidden rounded-xl border border-[#333]/85 shadow-lg group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/chart-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
        
        <div className="relative z-10">
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader size={1.0} />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center text-[#c9c9c9] text-sm drop-shadow-md">
              No hay documentos generados en esta categoría.
            </div>
          ) : (
            <>
              {/* Mobile: card list (hidden on md+) */}
              <div className="md:hidden divide-y divide-white/10">
                {filteredDocuments.map((doc: any) => {
                  const clientName = doc.clients?.name || doc.template_data?.clientName || doc.template_data?.businessName || "Cliente General";
                  return (
                    <div key={doc.id} className="p-4 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm tracking-wide">{doc.number}</span>
                        {getDocBadge(doc)}
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#A3A3A3]">
                        <span className="truncate max-w-[200px] text-white/90 font-medium">{clientName}</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                      {doc.total_amount && (
                        <div className="text-xs font-bold text-[#D4A853]">
                          Total: €{Number(doc.total_amount).toFixed(2)}
                        </div>
                      )}
                      <div className="pt-1 flex justify-end">
                        {/* Native anchor tag: guarantees iOS Safari NEVER blocks PDF popup */}
                        <a 
                          href={`/api/documents/${doc.id}/pdf`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold border border-white/15 shadow-sm transition-all touch-manipulation min-h-[40px]"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D4A853]" />
                          <span>Descargar PDF</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: table (hidden on mobile) */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-black/30">
                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                      <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Número</TableHead>
                      <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Tipo</TableHead>
                      <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Cliente / Negocio</TableHead>
                      <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Importe</TableHead>
                      <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 drop-shadow-md">Fecha</TableHead>
                      <TableHead className="text-white font-bold text-xs uppercase tracking-wider py-4 text-right drop-shadow-md">PDF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc: any) => {
                      const clientName = doc.clients?.name || doc.template_data?.clientName || doc.template_data?.businessName || "-";
                      return (
                        <TableRow key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300">
                          <TableCell className="font-semibold text-white">{doc.number}</TableCell>
                          <TableCell>{getDocBadge(doc)}</TableCell>
                          <TableCell className="text-[#ccc]">{clientName}</TableCell>
                          <TableCell className="text-[#D4A853] font-bold">
                            {doc.total_amount ? `€${Number(doc.total_amount).toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell className="text-[#aaa]">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            {/* Native anchor tag: guarantees iOS Safari NEVER blocks PDF */}
                            <a 
                              href={`/api/documents/${doc.id}/pdf`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold border border-white/15 transition-all"
                            >
                              <Download className="w-3.5 h-3.5 text-[#D4A853]" />
                              <span>Descargar</span>
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ MOBILE-OPTIMIZED FULL-HEIGHT SLIDE-OVER / MODAL CREATOR ═══ */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          {/* Modal Container: On mobile it is full screen with fixed bottom bar for safe keyboard interaction */}
          <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl bg-[#111116] border-0 sm:border border-[#333] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            
            {/* Modal Sticky Header */}
            <div className="h-16 pt-[env(safe-area-inset-top)] sm:pt-0 px-4 sm:px-6 border-b border-white/10 flex justify-between items-center bg-[#15151b] shrink-0 z-20">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#D4A853]/15 rounded-lg border border-[#D4A853]/30">
                  {selectedType === "invoice" && <FileText className="w-5 h-5 text-[#D4A853]" />}
                  {selectedType === "proposal" && <Sparkles className="w-5 h-5 text-blue-400" />}
                  {selectedType === "delivery" && <PackageCheck className="w-5 h-5 text-emerald-400" />}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {selectedType === "invoice" && "Generar Factura Oficial"}
                    {selectedType === "proposal" && "Generar Propuesta de Demo"}
                    {selectedType === "delivery" && "Generar Acta de Entrega"}
                  </h2>
                  <p className="text-[11px] text-[#888]">Documento PDF con diseño Luxury MyNext.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                aria-label="Cerrar modal"
                className="text-[#A3A3A3] hover:text-white p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <DocumentForm 
              initialType={selectedType}
              onTypeChange={setSelectedType}
              clients={clients || []} 
              projects={projects || []} 
              isLoadingClients={clientsLoading}
              onClose={() => setIsCreateOpen(false)}
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface DocumentFormProps {
  initialType: "invoice" | "proposal" | "delivery";
  onTypeChange?: (type: "invoice" | "proposal" | "delivery") => void;
  clients: any[];
  projects: any[];
  isLoadingClients?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function DocumentForm({ initialType, onTypeChange, clients, projects, isLoadingClients, onClose, onSuccess }: DocumentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Basic Fields
  const [type, setType] = useState<"invoice" | "proposal" | "delivery">(initialType);
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");

  // Proposal Specific Fields
  const [proposalBusinessName, setProposalBusinessName] = useState("");
  const [proposalDemoUrl, setProposalDemoUrl] = useState("https://mynextbymusa.com");

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

    setLoading(true);
    setError(null);

    const clientObj = clients.find(c => c.id === clientId);
    const projectObj = projects.find(p => p.id === projectId);

    let templateData: any = {};
    let totalAmount: number | null = null;

    if (type === "proposal") {
      const businessName = proposalBusinessName || clientObj?.name || clientObj?.company;
      if (!businessName) {
        setError("Por favor, introduce el nombre del negocio o cliente para la propuesta.");
        setLoading(false);
        return;
      }
      templateData = {
        is_proposal: true,
        businessName,
        clientName: businessName,
        demoUrl: proposalDemoUrl || "https://mynextbymusa.com",
        date: new Date().toLocaleDateString("es-ES"),
      };
    } else if (type === "invoice") {
      if (!clientId) {
        setError("Por favor, selecciona un cliente para la factura.");
        setLoading(false);
        return;
      }
      if (invoiceItems.some(item => !item.description)) {
        setError("Todos los conceptos de la factura deben tener una descripción.");
        setLoading(false);
        return;
      }
      totalAmount = total;
      templateData = {
        number: "",
        date: new Date().toLocaleDateString("es-ES"),
        dueDate: new Date(dueDate).toLocaleDateString("es-ES"),
        client: {
          name: clientObj?.name || "",
          company: clientObj?.company || clientObj?.name || "",
          address: clientObj?.notes ? clientObj.notes.substring(0, 80) : ""
        },
        items: invoiceItems.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })),
        taxRate: Number(taxRate)
      };
    } else {
      if (!clientId) {
        setError("Por favor, selecciona un cliente para el acta de entrega.");
        setLoading(false);
        return;
      }
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
          client_id: clientId || null,
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
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs sm:text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Document Type Selector Tabs */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">Tipo de Documento</label>
          <div className="grid grid-cols-3 gap-2 bg-[#1A1A1A] p-1 rounded-xl border border-[#333]">
            <button
              type="button"
              onClick={() => {
                setType("invoice");
                onTypeChange?.("invoice");
              }}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation ${
                type === "invoice" ? "bg-[#D4A853] text-black shadow-md" : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              Factura
            </button>
            <button
              type="button"
              onClick={() => {
                setType("proposal");
                onTypeChange?.("proposal");
              }}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation ${
                type === "proposal" ? "bg-blue-600 text-white shadow-md" : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              Propuesta Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setType("delivery");
                onTypeChange?.("delivery");
              }}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation ${
                type === "delivery" ? "bg-emerald-600 text-white shadow-md" : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              Entrega
            </button>
          </div>
        </div>

        {/* ═══ PROPOSAL SPECIFIC FIELDS ═══ */}
        {type === "proposal" && (
          <div className="space-y-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
            <div className="space-y-1.5">
              <label className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">Nombre del Negocio o Cliente *</label>
              <Input 
                placeholder="Ej. Restaurante Sol / Inmobiliaria Costa" 
                value={proposalBusinessName} 
                onChange={(e) => setProposalBusinessName(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">URL de la Demo Web</label>
              <Input 
                placeholder="https://restaurante-sol.pages.dev" 
                value={proposalDemoUrl} 
                onChange={(e) => setProposalDemoUrl(e.target.value)}
                required 
              />
              <p className="text-[10px] text-[#888]">Este enlace aparecerá con botón destacado en la propuesta PDF.</p>
            </div>
          </div>
        )}

        {/* ═══ CLIENT & PROJECT SELECTORS (FOR INVOICE & DELIVERY) ═══ */}
        {type !== "proposal" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">Cliente *</label>
              <select 
                value={clientId} 
                onChange={(e) => {
                  setClientId(e.target.value);
                  setProjectId("");
                }}
                required
                className="flex h-10 w-full rounded-md border border-[#333] bg-[#1A1A1A] px-3 py-2 text-base md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
              >
                <option value="">
                  {isLoadingClients ? "-- Cargando clientes... --" : clients.length === 0 ? "-- No hay clientes --" : "-- Seleccionar cliente --"}
                </option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">Proyecto Relacionado</label>
              <select 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)}
                disabled={!clientId}
                className="flex h-10 w-full rounded-md border border-[#333] bg-[#1A1A1A] px-3 py-2 text-base md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853] disabled:opacity-50"
              >
                <option value="">-- Ninguno / General --</option>
                {(filteredProjects.length > 0 ? filteredProjects : projects).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ═══ INVOICE SPECIFIC FIELDS ═══ */}
        {type === "invoice" && (
          <div className="space-y-5 border-t border-[#333] pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">IVA (%)</label>
                <Input 
                  type="number" 
                  value={taxRate} 
                  onChange={(e) => setTaxRate(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">Fecha de Vencimiento</label>
                <Input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">Conceptos / Líneas</label>
                <button 
                  type="button" 
                  onClick={addInvoiceItem} 
                  className="flex items-center gap-1 text-xs text-[#D4A853] bg-[#D4A853]/10 hover:bg-[#D4A853]/20 px-2.5 py-1.5 rounded-lg border border-[#D4A853]/30 cursor-pointer touch-manipulation min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir
                </button>
              </div>

              <div className="space-y-3">
                {invoiceItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center bg-[#1A1A1A]/80 p-3 rounded-xl border border-[#333]">
                    <div className="flex-1 min-w-0">
                      <Input 
                        placeholder="Ej. Desarrollo Frontend y Diseño UI" 
                        value={item.description} 
                        onChange={(e) => updateInvoiceItem(index, "description", e.target.value)}
                        required 
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-24">
                        <Input 
                          type="number" 
                          placeholder="Cant." 
                          value={item.quantity} 
                          onChange={(e) => updateInvoiceItem(index, "quantity", Number(e.target.value))}
                          min="1"
                          required 
                        />
                      </div>
                      <div className="flex-1 sm:w-28">
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="Precio €" 
                          value={item.unitPrice} 
                          onChange={(e) => updateInvoiceItem(index, "unitPrice", Number(e.target.value))}
                          required 
                        />
                      </div>
                      {invoiceItems.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeInvoiceItem(index)}
                          aria-label="Eliminar concepto"
                          className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 cursor-pointer shrink-0 touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations Box */}
              <div className="flex justify-end pt-2">
                <div className="bg-[#1A1A1A] border border-[#333] p-3.5 rounded-xl w-full sm:max-w-xs space-y-1.5 text-xs text-[#A3A3A3]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white font-medium">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA ({taxRate}%):</span>
                    <span className="text-white font-medium">€{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#333] pt-1.5 text-sm">
                    <span className="text-white font-bold">TOTAL:</span>
                    <span className="text-[#D4A853] font-bold text-base">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ DELIVERY SPECIFIC FIELDS ═══ */}
        {type === "delivery" && (
          <div className="space-y-5 border-t border-[#333] pt-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">Resumen de Entrega *</label>
              <textarea 
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Entrega final del software, código fuente y despliegue en producción..."
                className="flex w-full rounded-md border border-[#333] bg-[#1A1A1A] px-3 py-2 text-base md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">Stack Tecnológico</label>
                <Input 
                  placeholder="Next.js, Supabase, Tailwind, Cloudflare" 
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">Entregables</label>
                <Input 
                  placeholder="Repositorio, Despliegue, Credenciales" 
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-wider">Credenciales de Acceso (Opcional)</label>
                <button 
                  type="button" 
                  onClick={addCredential} 
                  className="flex items-center gap-1 text-xs text-[#D4A853] bg-[#D4A853]/10 hover:bg-[#D4A853]/20 px-2.5 py-1.5 rounded-lg border border-[#D4A853]/30 cursor-pointer touch-manipulation min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir
                </button>
              </div>

              <div className="space-y-2.5">
                {credentials.map((cred, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 bg-[#1A1A1A]/80 p-3 rounded-xl border border-[#333] items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#888] uppercase">Servicio</label>
                      <Input 
                        placeholder="Vercel" 
                        value={cred.service} 
                        onChange={(e) => updateCredential(index, "service", e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#888] uppercase">URL/Host</label>
                      <Input 
                        placeholder="vercel.com" 
                        value={cred.url} 
                        onChange={(e) => updateCredential(index, "url", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#888] uppercase">Usuario</label>
                      <Input 
                        placeholder="admin@empresa.com" 
                        value={cred.username} 
                        onChange={(e) => updateCredential(index, "username", e.target.value)}
                        required 
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-[#888] uppercase">Contraseña</label>
                        <Input 
                          type="password"
                          placeholder="••••••••" 
                          value={cred.password || ""} 
                          onChange={(e) => updateCredential(index, "password", e.target.value)}
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeCredential(index)}
                        aria-label="Eliminar credencial"
                        className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 cursor-pointer shrink-0 touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ STICKY PINNED FOOTER ACTION BAR (Always visible and accessible above keyboard on iOS) ═══ */}
      <div className="sticky bottom-0 left-0 right-0 p-3.5 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#141419]/95 border-t border-white/10 backdrop-blur-xl flex justify-end items-center gap-2.5 z-30 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#A3A3A3] hover:text-white active:scale-95 transition-all cursor-pointer touch-manipulation min-h-[44px]"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#c39742] active:scale-[0.98] text-black text-xs sm:text-sm font-bold shadow-lg shadow-[#D4A853]/20 disabled:opacity-50 transition-all cursor-pointer touch-manipulation min-h-[44px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando...
            </>
          ) : (
            `Generar ${type === "invoice" ? "Factura" : type === "proposal" ? "Propuesta" : "Entrega"}`
          )}
        </button>
      </div>
    </form>
  );
}
