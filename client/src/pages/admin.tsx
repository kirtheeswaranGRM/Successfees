import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  if (user && user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const { data: staffSummary, isLoading } = useQuery<any[]>({
    queryKey: [api.admin.summary.path],
    queryFn: async () => {
      const res = await fetch(api.admin.summary.path);
      if (!res.ok) throw new Error("Failed to fetch admin data");
      return await res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const res = await fetch(buildUrl(api.admin.approveStaff.path, { id: staffId }), {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to approve staff");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.summary.path] });
      toast({
        title: "Staff Approved",
        description: "The staff member can now log in and access the portal."
      });
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-primary" />
          Admin Control Center
        </h1>
        <p className="text-slate-500 mt-1">Monitor staff performance and manage account approvals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : (
          staffSummary?.map((stat) => (
            <Card key={stat.staff._id} className="shadow-md hover:shadow-xl transition-shadow border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {stat.staff.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{stat.staff.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{stat.staff.role}</p>
                  </div>
                </div>
                {!stat.staff.isApproved && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    onClick={() => approveMutation.mutate(stat.staff._id)}
                    disabled={approveMutation.isPending}
                  >
                    <Clock className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
                {stat.staff.isApproved && stat.staff.role === 'staff' && (
                  <div className="text-emerald-600 flex items-center text-xs font-medium">
                    <CheckCircle className="h-4 w-4 mr-1" /> Approved
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Students Managed</span>
                    <span className="font-bold bg-slate-100 px-2 py-0.5 rounded-md">{stat.studentCount}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Month Collection</span>
                      <span className="font-bold text-emerald-600">${stat.collectedThisMonth.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>Total Year: ${stat.collectedThisYear.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
