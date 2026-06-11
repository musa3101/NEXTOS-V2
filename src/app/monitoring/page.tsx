"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, ActivitySquare, MessageSquare, Database, Globe } from "lucide-react";

export default function MonitoringPage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["monitoring-health"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("Failed to fetch health");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5s for monitoring page
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitorización</h1>
          <p className="text-[#A3A3A3] text-sm">Estado del sistema en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-[#A3A3A3]">
            {isLoading ? "Conectando..." : "Actualizado en tiempo real"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MonitorCard 
          title="Base de Datos (Supabase)" 
          description="Almacenamiento principal y autenticación"
          status={health?.services?.supabase?.status}
          latency={health?.services?.supabase?.latency}
          icon={Database}
        />
        <MonitorCard 
          title="API Interna (NextOS)" 
          description="Endpoints de lógica de negocio"
          status={health?.services?.api?.status}
          latency={health?.services?.api?.latency}
          icon={ActivitySquare}
        />
        <MonitorCard 
          title="Telegram Bot API" 
          description="Servicio de mensajería y webhooks"
          status={health?.services?.telegram?.status}
          icon={MessageSquare}
        />
        <MonitorCard 
          title="Cloudflare Edge" 
          description="CDN y Firewall (Fase 2)"
          status={health?.services?.cloudflare?.status || "pending"}
          icon={Globe}
        />
      </div>
    </div>
  );
}

function MonitorCard({ title, description, status, latency, icon: Icon }: any) {
  const isUp = status === "up";
  const isPending = status === "pending";

  return (
    <Card className="flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 text-white" />
      </div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3 bg-[#262626] rounded-xl border border-[#333]">
          <Icon className="w-6 h-6 text-[#D4A853]" />
        </div>
        <Badge variant={isUp ? "success" : isPending ? "warning" : "danger"}>
          {isUp ? "Operativo" : isPending ? "Próximamente" : "Caído"}
        </Badge>
      </div>
      
      <div className="mt-auto relative z-10">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-[#A3A3A3] mt-1">{description}</p>
        
        {latency !== undefined && (
          <div className="mt-4 flex items-center gap-2 text-xs text-[#A3A3A3] bg-[#262626]/50 p-2 rounded border border-[#333]/50 w-fit">
            <Server className="w-3 h-3" />
            Latencia: {latency}ms
          </div>
        )}
      </div>
    </Card>
  );
}
