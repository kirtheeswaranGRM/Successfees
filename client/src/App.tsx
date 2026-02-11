import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutShell } from "@/components/layout-shell";
import NotFound from "@/pages/not-found";
import Splash from "@/pages/splash";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import StudentsPage from "@/pages/students";
import StudentDetails from "@/pages/student-details";
import RegisterStudent from "@/pages/register-student";
import CategoriesPage from "@/pages/categories";
import AdminPage from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route path="/dashboard">
        <LayoutShell><Dashboard /></LayoutShell>
      </Route>
      <Route path="/students">
        <LayoutShell><StudentsPage /></LayoutShell>
      </Route>
      <Route path="/students/new">
        <LayoutShell><RegisterStudent /></LayoutShell>
      </Route>
      <Route path="/students/:id">
        <LayoutShell><StudentDetails /></LayoutShell>
      </Route>
      <Route path="/categories">
        <LayoutShell><CategoriesPage /></LayoutShell>
      </Route>
      <Route path="/admin">
        <LayoutShell><AdminPage /></LayoutShell>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
