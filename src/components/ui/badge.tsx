import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        {
          "border-transparent bg-[#262626] text-white": variant === "default",
          "border-transparent bg-emerald-500/10 text-emerald-500": variant === "success",
          "border-transparent bg-amber-500/10 text-amber-500": variant === "warning",
          "border-transparent bg-red-500/10 text-red-500": variant === "danger",
          "border-transparent bg-blue-500/10 text-blue-500": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}
