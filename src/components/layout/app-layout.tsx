"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AnimatedBackground } from "./animated-background";
import { X } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
