import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/stats-card";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  CalendarClock,
  Wallet
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (!summary) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-slate-500">Academic Year</p>
          <p className="text-lg font-bold text-primary">2024 - 2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item}>
          <StatsCard
            title="Total Students"
            value={summary.totalStudents}
            icon={Users}
            color="primary"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Collected This Month"
            value={`$${summary.monthlyCollected.toLocaleString()}`}
            icon={CalendarClock}
            color="secondary"
            trend="12%"
            trendUp={true}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Yearly Collection"
            value={`$${summary.yearlyCollected.toLocaleString()}`}
            icon={DollarSign}
            color="accent"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Pending Balance"
            value={`$${summary.totalBalance.toLocaleString()}`}
            icon={Wallet}
            color="destructive"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full shadow-md border-none">
            <CardHeader>
              <CardTitle className="font-display text-xl">Collection Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full shadow-md border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-white font-display text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Target Collection</span>
                  <span className="font-bold">$250,000</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[65%]" />
                </div>
                <p className="text-xs text-slate-400 text-right">65% Achieved</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Weekly Average</span>
                  <span className="font-mono font-bold">${summary.weeklyCollected.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Outstanding</span>
                  <span className="font-mono font-bold text-rose-400">${summary.totalBalance.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-slate-400 italic">
                  "Consistent follow-ups have improved collection rates by 15% this quarter."
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
