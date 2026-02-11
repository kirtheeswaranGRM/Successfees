import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Users, BarChart3 } from "lucide-react";

export default function Splash() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-display font-bold text-2xl text-slate-900">
          <div className="h-10 w-10 overflow-hidden rounded-xl shadow-lg shadow-primary/30">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          Success Academy
        </div>
        <Link href="/auth">
          <Button variant="outline" className="hidden md:flex">Sign In</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 flex flex-col md:flex-row items-center gap-12 py-12 md:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-primary text-sm font-medium border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New Academic Year 2025 Ready
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight text-slate-900">
            Smart Fee <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Management</span> <br/>
            Made Simple.
          </h1>
          
          <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
            Streamline your educational institute's financial operations. Track payments, manage students, and generate reports with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth">
              <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Login to Portal <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t border-slate-200 flex gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span className="font-medium">Secure Data</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Multi-User</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Analytics</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
            {/* Abstract UI representation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-8">
                <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-10 w-10 bg-slate-100 rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl h-32 animate-pulse" />
                <div className="bg-purple-50 p-4 rounded-2xl h-32 animate-pulse" />
              </div>
              <div className="space-y-3 pt-4">
                <div className="h-12 w-full bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-12 w-full bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-12 w-full bg-slate-50 rounded-xl animate-pulse" />
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                $
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Total Collected</p>
                <p className="text-xl font-bold text-slate-900">$124,500</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
