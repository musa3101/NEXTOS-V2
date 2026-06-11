"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  
  // Very basic breadcrumbs logic
  const segments = pathname.split("/").filter(Boolean);
  let title = "Dashboard";
  if (segments.length > 0) {
    title = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    if (title === "Clients") title = "Clientes";
    if (title === "Projects") title = "Proyectos";
    if (title === "Documents") title = "Documentos";
    if (title === "Activity") title = "Actividad";
    if (title === "Monitoring") title = "Monitorización";
  }

  return (
    <header className="h-16 glass border-b border-[#333] flex items-center justify-between px-4 md:px-8 bg-[#111]/50 sticky top-0 z-10 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 text-[#A3A3A3] hover:text-white rounded-xl hover:bg-[#262626]/60 transition-colors border border-transparent active:scale-95 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-base md:text-lg font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Placeholder for future actions like search or notifications */}
        <div className="text-sm text-[#A3A3A3] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Sistema Operativo
        </div>
      </div>
    </header>
  );
}
