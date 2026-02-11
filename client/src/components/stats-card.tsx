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
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold font-display tracking-tight">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-xl", colors[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn(
              "font-medium mr-2 px-1.5 py-0.5 rounded",
              trendUp ? "text-emerald-700 bg-emerald-100" : "text-rose-700 bg-rose-100"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
