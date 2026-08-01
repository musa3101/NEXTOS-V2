import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  className?: string;
  size?: number; // scale multiplier, default is 1
}

export function Loader({ className, size = 1 }: LoaderProps) {
  const pixelSize = Math.round(48 * size);

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className || ""}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop ring */}
        <div 
          className="absolute rounded-full bg-[#D4A853]/20 blur-md animate-pulse"
          style={{ width: `${pixelSize * 1.4}px`, height: `${pixelSize * 1.4}px` }}
        />
        
        {/* Hardware-accelerated smooth spinner */}
        <Loader2 
          className="animate-spin text-[#D4A853] relative z-10" 
          style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
        />
      </div>
    </div>
  );
}
