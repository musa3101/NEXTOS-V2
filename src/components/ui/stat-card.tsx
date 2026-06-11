import { Card } from "./card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgImage?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, bgImage }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#333] shadow-lg hover-glow transition-all duration-300 group">
      {/* Background image layer */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      {/* Dark overlay for readability */}
      <div className={`absolute inset-0 ${bgImage ? 'bg-black/60 backdrop-blur-[2px]' : 'bg-[#1A1A1A]/80'}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#c9c9c9] drop-shadow-md">{title}</h3>
          <div className="p-2 bg-[#1A1A1A]/70 backdrop-blur-md rounded-lg border border-[#D4A853]/30 shadow-[0_0_12px_rgba(212,168,83,0.15)]">
            <Icon className="w-4 h-4 text-[#D4A853]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">{value}</h2>
          {trend && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm ${trend.isPositive ? 'text-emerald-400 bg-emerald-500/15' : 'text-red-400 bg-red-500/15'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        {description && <p className="text-xs text-[#bbb] drop-shadow-md">{description}</p>}
      </div>
    </div>
  );
}
