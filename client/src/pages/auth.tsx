import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Lock, UserCog } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

const loginSchema = api.auth.login.input;

export default function AuthPage() {
  const { login, isLoggingIn, user } = useAuth();
  const [location, setLocation] = useLocation();
  const [pendingApproval, setPendingApproval] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "pending_approval") {
      setPendingApproval(true);
    }
  }, []);

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof loginSchema>) {
    login(data, {
      onSuccess: () => setLocation("/dashboard"),
    });
  }

  const handleGoogleLogin = () => {
    window.location.href = api.auth.google.path;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-4">
        {pendingApproval && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900 animate-in fade-in slide-in-from-top-4">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <AlertTitle>Pending Approval</AlertTitle>
            <AlertDescription>
              Your account is waiting for administrator approval. Please contact the admin.
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full border-slate-200 shadow-xl relative z-10 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="mx-auto w-20 h-20 overflow-hidden rounded-2xl shadow-lg shadow-primary/25 mb-4 border-2 border-white">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <CardTitle className="text-2xl font-bold font-display">
              {isAdminMode ? "Admin Login" : "Staff Portal"}
            </CardTitle>
            <CardDescription>
              {isAdminMode 
                ? "Enter administrator credentials" 
                : "Sign in with your Google account to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isAdminMode ? (
              <div className="space-y-4">
                <Button 
                  variant="default" 
                  className="w-full h-12 bg-[#4285F4] hover:bg-[#357ae8] text-white transition-all shadow-md flex items-center justify-center gap-3 font-semibold text-lg"
                  onClick={handleGoogleLogin}
                >
                  <SiGoogle className="w-5 h-5" />
                  Sign in with Google
                </Button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">Restricted Area</span>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full h-11 text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setIsAdminMode(true)}
                >
                  <UserCog className="w-4 w-4" />
                  Administrator Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg" disabled={isLoggingIn}>
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
                        </>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" /> Secure Sign In
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
                
                <Button 
                  variant="ghost" 
                  className="w-full h-11 text-slate-500 hover:text-slate-700"
                  onClick={() => setIsAdminMode(false)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff Login
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t p-4 bg-slate-50/50">
            <Button variant="ghost" className="text-sm text-muted-foreground" onClick={() => setLocation("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Website
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
