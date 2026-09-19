"use client";

import React from "react";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0c0c0e]">
      {/* High-performance Mobile GPU Radial Ambient Glow (0% blur overhead, ultra-smooth 60-120 FPS on iPhone) */}
      <div 
        className="absolute inset-0 md:hidden pointer-events-none opacity-80"
        style={{
          background: "radial-gradient(circle at 15% 15%, rgba(212, 168, 83, 0.08) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(212, 168, 83, 0.05) 0%, transparent 50%)"
        }}
      />

      {/* Desktop Hardware-Accelerated Ambient Blobs (hidden on mobile to prevent GPU thermal throttling) */}
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#D4A853]/6 blur-[120px] animate-blob-1 pointer-events-none opacity-60 transform-gpu will-change-transform" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#D4A853]/4 blur-[100px] animate-blob-2 pointer-events-none opacity-50 transform-gpu will-change-transform" />
      
      {/* Subtle modern grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Soft vignette gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0c0c0e]/30 to-[#0c0c0e] pointer-events-none" />
    </div>
  );
}
