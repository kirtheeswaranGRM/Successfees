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
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Staff Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-1">
              <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Total No. of Students</p>
              <p className="text-4xl font-bold">{summary.totalStudents}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Total Outstanding Balance</p>
              <p className="text-4xl font-bold text-rose-400">₹{summary.totalBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
