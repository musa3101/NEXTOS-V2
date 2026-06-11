"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2, Users, FolderKanban, FileText, Bot } from "lucide-react";

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
      <div>
        <h1 className="text-2xl font-bold text-white">Historial de Actividad</h1>
        <p className="text-[#A3A3A3] text-sm">Registro completo de eventos del sistema NextOS.</p>
      </div>

      <Card className="p-0 border-none bg-transparent">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A853]" />
          </div>
        ) : activity?.length === 0 ? (
          <div className="p-12 text-center text-[#A3A3A3] glass rounded-xl">No hay actividad registrada en el sistema.</div>
        ) : (
          <div className="relative border-l border-[#333] ml-4 space-y-8 py-4">
            {activity?.map((log: any) => (
              <div key={log.id} className="relative pl-8">
                {/* Timeline Dot */}
                <span className="absolute -left-3.5 top-1 w-7 h-7 rounded-full bg-[#1A1A1A] border-2 border-[#333] flex items-center justify-center">
                  {log.source === "telegram" ? (
                    <Bot className="w-3 h-3 text-[#D4A853]" />
                  ) : log.entity_type === "client" ? (
                    <Users className="w-3 h-3 text-[#A3A3A3]" />
                  ) : log.entity_type === "project" ? (
                    <FolderKanban className="w-3 h-3 text-[#A3A3A3]" />
                  ) : (
                    <FileText className="w-3 h-3 text-[#A3A3A3]" />
                  )}
                </span>
                
                <Card className="p-4 bg-[#1A1A1A]/50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-white capitalize">
                      {log.action} {log.entity_type}
                    </p>
                    <span className="text-xs text-[#A3A3A3]">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-[#A3A3A3]">
                    {log.details?.name && <p>Nombre: {log.details.name}</p>}
                    {log.details?.number && <p>Documento: {log.details.number}</p>}
                    <p className="mt-2 text-xs">Origen: <span className="uppercase text-[#D4A853]">{log.source}</span></p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
