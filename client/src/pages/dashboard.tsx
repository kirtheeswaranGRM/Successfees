import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/stats-card";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  CalendarClock,
  Wallet,
  Download,
  FileText,
  UserCheck,
  UserMinus,
  UserPlus
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
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useDashboardSummary();

  const downloadReport = async (type: 'day' | 'month' | 'year') => {
    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    if (type === 'day') {
      startDate = startOfDay(now);
      endDate = endOfDay(now);
    } else if (type === 'month') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
    }

    try {
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      const res = await fetch(`/api/reports?${queryParams.toString()}`);
      const data = await res.json();
      
      const doc = new jsPDF();
      const primaryColor: [number, number, number] = [220, 38, 38];
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("SUCCESS ACADEMY", 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${type.toUpperCase()} PERFORMANCE REPORT`, 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), "PPP p")}`, 105, 38, { align: 'center' });
      doc.text(`Period: ${format(startDate, "PP")} - ${format(endDate, "PP")}`, 105, 43, { align: 'center' });

      // Summary Stats
      autoTable(doc, {
        startY: 55,
        head: [['Metric', 'Value']],
        body: [
          ['Staff Name', user?.name || 'N/A'],
          ['Total Payments Collected', data.summary.count.toString()],
          ['Total Amount Collected', `₹${data.summary.totalCollected.toLocaleString()}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryColor }
      });

      // Payments Table
      doc.setFontSize(14);
      doc.text("Transaction Details", 20, (doc as any).lastAutoTable.finalY + 15);

      const tableData = data.payments.map((p: any) => [
        format(new Date(p.date), "dd MMM yyyy"),
        p.studentName,
        p.type.toUpperCase(),
        `₹${p.amount.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Date', 'Student', 'Type', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }
      });

      doc.save(`Success_Academy_${type}_Report_${format(now, "yyyyMMdd")}.pdf`);
    } catch (err) {
      console.error("Failed to generate report", err);
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadReport('day')} className="bg-white">
            <Download className="h-4 w-4 mr-2" /> Day
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadReport('month')} className="bg-white">
            <Download className="h-4 w-4 mr-2" /> Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadReport('year')} className="bg-white">
            <Download className="h-4 w-4 mr-2" /> Year
          </Button>
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
            title="Total Expected"
            value={`₹${summary.yearlyScheduled.toLocaleString()}`}
            icon={TrendingUp}
            color="secondary"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Total Collected"
            value={`₹${summary.yearlyCollected.toLocaleString()}`}
            icon={DollarSign}
            color="accent"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Total Balance"
            value={`₹${summary.totalBalance.toLocaleString()}`}
            icon={Wallet}
            color="destructive"
          />
        </motion.div>
      </div>

      {/* Student Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-600">Paid Students</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.paidStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <UserMinus className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600">Remaining Students</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.remainingStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">New Joins (Month)</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.newJoinsThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
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
                  <span className="font-bold">₹2,50,000</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[65%]" />
                </div>
                <p className="text-xs text-slate-400 text-right">65% Achieved</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Weekly Average</span>
                  <span className="font-mono font-bold">₹{summary.weeklyCollected.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Outstanding</span>
                  <span className="font-mono font-bold text-rose-400">₹{summary.totalBalance.toLocaleString()}</span>
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
