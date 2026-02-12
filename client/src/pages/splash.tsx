import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function Splash() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        setLocation("/summary");
      } else {
        setLocation("/auth");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center space-y-8"
      >
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute -inset-10 bg-primary/20 rounded-full blur-3xl"
          />
          <div className="h-40 w-40 mx-auto overflow-hidden rounded-3xl shadow-2xl relative">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900"
          >
            Success Academy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-slate-500 font-medium tracking-[0.2em] uppercase text-sm"
          >
            Empowering Excellence
          </motion.p>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="h-1 w-24 bg-primary/30 mx-auto rounded-full mt-8"
        />
      </motion.div>
    </div>
  );
}
