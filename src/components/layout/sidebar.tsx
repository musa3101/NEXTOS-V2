"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CalendarClock,
  FileText, 
  ShieldCheck, 
  LogOut 
} from "lucide-react";

import { useState } from "react";
import { AdminSettingsModal } from "./admin-settings-modal";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Proyectos", href: "/projects", icon: FolderKanban },
  { name: "Mantenimiento", href: "/maintenance", icon: CalendarClock },
  { name: "Documentos", href: "/documents", icon: FileText },
  { name: "Monitorización", href: "/monitoring", icon: ShieldCheck },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <>
      <div className="w-full md:w-64 glass md:border-r border-[#333] flex flex-col h-full bg-[#1A1A1A]/30 relative z-10 backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-[#333]">
          <Link href="/" onClick={onLinkClick} className="flex items-center gap-2.5 group">
            <img 
              src="/logo1.png" 
              alt="MyNext Logo" 
              className="w-7 h-7 object-contain rounded-md border border-[#333] p-0.5 bg-[#111] group-hover:scale-105 transition-transform" 
            />
            <span className="text-lg font-bold tracking-widest text-white">
              NEXT<span className="text-[#D4A853]">OS</span>
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

        {/* User Card with Settings trigger & separate Logout action */}
        <div className="p-3 border-t border-[#333] bg-[#1A1A1A]/20">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/30 border border-white/5 hover:border-[#D4A853]/30 transition-all group">
            {/* Clickable user profile info -> opens Settings Modal */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
              title="Abrir ajustes de administrador"
            >
              <div className="relative shrink-0">
                <img 
                  src="/logo2.jpg" 
                  alt="Admin Avatar" 
                  className="w-8 h-8 rounded-full border border-[#D4A853]/60 group-hover:border-[#D4A853] object-cover shadow-sm bg-[#111] transition-colors"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1A1A1A]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white text-xs group-hover:text-[#D4A853] transition-colors truncate">Admin</span>
                <span className="text-[10px] text-[#888] group-hover:text-[#aaa] transition-colors truncate">Ajustes y Perfil</span>
              </div>
            </button>

            {/* Dedicated Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-[#666] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Settings Modal */}
      <AdminSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}
