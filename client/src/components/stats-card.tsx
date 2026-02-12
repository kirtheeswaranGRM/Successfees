import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: "primary" | "secondary" | "accent" | "destructive" | "default";
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  className,
  color = "default" 
}: StatsCardProps) {
  
  const colors = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
    destructive: "text-destructive bg-destructive/10",
    default: "text-slate-600 bg-slate-100",
  };

  return (
    <Card className={cn("overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300", className)}>
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] md:text-sm font-medium text-muted-foreground mb-0.5 md:mb-1 truncate">{title}</p>
            <h3 className="text-base md:text-2xl font-bold font-display tracking-tight truncate">{value}</h3>
          </div>
          <div className={cn("p-1.5 md:p-3 rounded-lg md:rounded-xl flex-shrink-0", colors[color])}>
            <Icon className="h-4 w-4 md:h-6 md:w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-2 md:mt-4 flex items-center text-[10px] md:text-sm">
            <span className={cn(
              "font-medium mr-1 md:mr-2 px-1 py-0.5 rounded",
              trendUp ? "text-emerald-700 bg-emerald-100" : "text-rose-700 bg-rose-100"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </span>
            <span className="text-muted-foreground hidden md:inline">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

