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
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-2 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#A3A3A3]">{title}</h3>
        <div className="p-2 bg-[#262626] rounded-md border border-[#333]">
          <Icon className="w-4 h-4 text-[#D4A853]" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-bold text-white">{value}</h2>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {description && <p className="text-xs text-[#A3A3A3]">{description}</p>}
    </Card>
  );
}
