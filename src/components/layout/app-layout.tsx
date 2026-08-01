"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AnimatedBackground } from "./animated-background";
import Link from "next/link";
import { X, LayoutDashboard, FolderKanban, Users, FileText, ActivitySquare } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Proyectos", href: "/projects", icon: FolderKanban },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Docs", href: "/documents", icon: FileText },
  { name: "Monitor", href: "/monitoring", icon: ActivitySquare },
];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/login") {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-[#0c0c0e]">
        <AnimatedBackground />
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#0c0c0e]">
      {/* Dynamic backdrop */}
      <AnimatedBackground />

      {/* Mobile Sidebar Slide-over Drawer (Visible below md) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Glass Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar drawer body */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-[#111] border-r border-[#333]/85 animate-in slide-in-from-left duration-300 z-10">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-[#A3A3A3] hover:text-white rounded-lg hover:bg-[#262626] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main app panel */}
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:flex md:w-64 md:shrink-0 h-full">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* 📱 iOS Native Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121217]/90 backdrop-blur-xl border-t border-[#D4A853]/20 px-2 pt-2 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.7)] flex justify-around items-center">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 min-w-[60px] ${
                isActive
                  ? "text-[#D4A853] font-bold bg-[#D4A853]/10"
                  : "text-[#888] hover:text-[#ccc]"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 text-[#D4A853]" : ""}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
