import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/stats-card";
import { 
  Users, 
  UserCheck,
  UserMinus,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function SummaryPage() {
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
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-16 w-16 text-rose-500 opacity-20">
          <Clock className="h-full w-full" />
        </div>
        <p className="text-slate-500 font-medium">No summary data available.</p>
      </div>
    );
  }

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Summary</h1>
          <p className="text-slate-500 mt-1">Hello {user?.name}, here is your student status overview.</p>
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
            title="Students Paid"
            value={summary.totalStudents - summary.remainingStudents}
            icon={UserCheck}
            color="accent"
          />
        </motion.div>

        <motion.div variants={item}>
          <StatsCard
            title="Students with Balance"
            value={summary.remainingStudents}
            icon={Clock}
            color="destructive"
          />
        </motion.div>

        <motion.div variants={item}>
          <StatsCard
            title="Completed Payments"
            value={summary.paidStudents}
            icon={CheckCircle2}
            color="secondary"
          />
        </motion.div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl border border-white/10">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Staff Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-1">
              <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Total Paid Amount</p>
              <p className="text-4xl font-bold text-emerald-400">₹{summary.totalCollected.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Total Outstanding Balance</p>
              <p className="text-4xl font-bold text-rose-400">₹{summary.totalBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <div className="h-1 w-8 bg-primary rounded-full" />
          Category Breakdown
        </h3>
        
        {summary.categoryStats && summary.categoryStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summary.categoryStats.map((stat: { categoryName: string, studentCount: number, totalCollected: number, totalBalance: number, totalFees?: number }, i: number) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-900 font-bold text-lg">{stat.categoryName}</p>
                  <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                    {stat.studentCount}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Total Collected</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">₹{stat.totalCollected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Remaining Balance</span>
                    <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">₹{stat.totalBalance.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${(stat.totalCollected / (stat.totalFees || (stat.totalCollected + stat.totalBalance) || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-8 border border-dashed border-slate-200 text-center">
            <p className="text-slate-500">No category statistics available for your students.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
