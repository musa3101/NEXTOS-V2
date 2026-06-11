"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2, Users, FolderKanban, FileText, Bot } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export default function ActivityPage() {
  const { data: activity, isLoading } = useQuery({
    queryKey: ["all-activity"],
    queryFn: async () => {
      const res = await fetch(`/api/activity?limit=100`);
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ═══ HEADER with background image ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#333]/50 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url(/bg/activity-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#D4A853] animate-ping" />
            <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest drop-shadow-lg">Registro del Sistema</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-xl">Historial de Actividad</h1>
          <p className="text-[#d1d1d1] text-sm mt-0.5 drop-shadow-lg">Registro completo de eventos del sistema Next LaB.</p>
        </div>
      </div>

      {/* ═══ TIMELINE with background image ═══ */}
      <div className="relative overflow-hidden rounded-xl border border-[#333]/80 shadow-lg group">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/bg/resources-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        
        <div className="relative z-10 p-6">
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader size={1.0} />
            </div>
          ) : activity?.length === 0 ? (
            <div className="p-12 text-center text-[#c9c9c9] drop-shadow-md">No hay actividad registrada en el sistema.</div>
          ) : (
            <div className="relative border-l border-[#D4A853]/30 ml-4 space-y-6 py-4">
              {activity?.map((log: any) => (
                <div key={log.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <span className="absolute -left-3.5 top-1 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border-2 border-[#D4A853]/40 flex items-center justify-center shadow-[0_0_8px_rgba(212,168,83,0.2)]">
                    {log.source === "telegram" ? (
                      <Bot className="w-3 h-3 text-[#D4A853]" />
                    ) : log.entity_type === "client" ? (
                      <Users className="w-3 h-3 text-[#D4A853]" />
                    ) : log.entity_type === "project" ? (
                      <FolderKanban className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <FileText className="w-3 h-3 text-blue-400" />
                    )}
                  </span>
                  
                  <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:bg-black/40 hover:border-[#D4A853]/20 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-white capitalize drop-shadow-md">
                        {log.action} {log.entity_type}
                      </p>
                      <span className="text-xs text-[#bbb] drop-shadow-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-[#ccc] drop-shadow-sm">
                      {log.details?.name && <p>Nombre: {log.details.name}</p>}
                      {log.details?.number && <p>Documento: {log.details.number}</p>}
                      <p className="mt-2 text-xs">Origen: <span className="uppercase text-[#D4A853] font-bold">{log.source}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
