"use client";

import React from "react";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0c0c0e]">
      {/* Dynamic blurred mesh gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#D4A853]/7 blur-[140px] animate-blob-1 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#D4A853]/5 blur-[120px] animate-blob-2 pointer-events-none opacity-50" />
      
      {/* Subtle modern grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Soft vignette gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0c0c0e]/30 to-[#0c0c0e] pointer-events-none" />
    </div>
  );
}
