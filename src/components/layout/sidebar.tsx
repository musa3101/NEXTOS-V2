"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, FileText, Activity, ActivitySquare } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Proyectos", href: "/projects", icon: FolderKanban },
  { name: "Documentos", href: "/documents", icon: FileText },
  { name: "Actividad", href: "/activity", icon: Activity },
  { name: "Monitorización", href: "/monitoring", icon: ActivitySquare },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-64 glass md:border-r border-[#333] flex flex-col h-full bg-[#1A1A1A]/30 relative z-10 backdrop-blur-xl">
      <div className="h-16 flex items-center px-6 border-b border-[#333]">
        <Link href="/" onClick={onLinkClick} className="flex items-center gap-2.5 group">
          <img 
            src="/logo1.png" 
            alt="MyNext Logo" 
            className="w-7 h-7 object-contain rounded-md border border-[#333] p-0.5 bg-[#111] group-hover:scale-105 transition-transform" 
          />
          <span className="text-lg font-bold tracking-widest text-white">
            MY<span className="text-[#D4A853]">NEXT</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-4">
          General
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#D4A853]/10 text-[#D4A853] border-l-2 border-[#D4A853] pl-2.5"
                  : "text-[#A3A3A3] hover:text-white hover:bg-[#262626]/40"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#333] bg-[#1A1A1A]/10">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-[#A3A3A3] rounded-xl border border-transparent hover:border-[#333] transition-colors">
          <img 
            src="/logo2.jpg" 
            alt="Admin Avatar" 
            className="w-8 h-8 rounded-full border border-[#D4A853]/50 object-cover shadow-sm bg-[#111]"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-white text-sm">Admin</span>
            <span className="text-xs text-[#A3A3A3]">NextOS System</span>
          </div>
        </div>
      </div>
    </div>
  );
}
