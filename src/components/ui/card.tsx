import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-xl border border-[#333] bg-[#1A1A1A]/80 shadow-lg text-white p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
