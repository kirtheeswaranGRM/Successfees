import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  CreditCard,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  if (!user.isApproved && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
          <div className="mx-auto w-24 h-24 overflow-hidden rounded-2xl shadow-lg border-4 border-white mb-6">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Account Pending Approval</h2>
          <p className="text-slate-600">
            Welcome, <strong>{user.name}</strong>! Your staff account has been created, but it requires administrator approval before you can access the portal.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
            Please contact the administrator to approve your access.
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Summary", icon: LayoutDashboard, href: "/summary" },
    { label: "Students", icon: Users, href: "/students" },
    { label: "Fee Categories", icon: CreditCard, href: "/categories" },
    { label: "Payment Records", icon: History, href: "/payments" },
    ...(user.role === "admin" ? [
      { label: "Admin Panel", icon: Settings, href: "/admin" }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-display font-bold text-xl text-primary flex items-center gap-2">
          <img src="/logo.jpeg" alt="Logo" className="h-8 w-8 object-cover rounded-lg" />
          Success Academy
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/10">
          <div className="font-display font-bold text-2xl flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="leading-tight">Success<br/><span className="text-slate-400 font-normal text-sm">Academy</span></span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-8">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group",
                    location === item.href 
                      ? "bg-primary text-white font-medium shadow-lg shadow-primary/25" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", location === item.href ? "text-white" : "text-slate-500 group-hover:text-white")} />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-auto">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
