import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, TrendingUp, CheckCircle, Clock, Settings2, Trash2, Save, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [clearDbPassword, setClearDbPassword] = useState("");
  const [isClearingDb, setIsClearingDb] = useState(false);
  const [clearCatPassword, setClearCatPassword] = useState("");
  const [isClearingCats, setIsClearingCats] = useState(false);

  if (user && user.role !== "admin") {
    setLocation("/summary");
    return null;
  }

  const clearDatabaseMutation = useMutation({
    mutationFn: async (password: string) => {
      await apiRequest("POST", api.admin.clearDatabase.path, { password });
    },
    onSuccess: () => {
      setIsClearingDb(false);
      setClearDbPassword("");
      queryClient.invalidateQueries({ queryKey: [api.students.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.payments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.summary.path] });
      toast({ title: "Database Cleared", description: "All student and payment records have been deleted." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to clear database",
        variant: "destructive" 
      });
    }
  });

  const clearCategoriesMutation = useMutation({
    mutationFn: async (password: string) => {
      await apiRequest("POST", api.admin.clearCategories.path, { password });
    },
    onSuccess: () => {
      setIsClearingCats(false);
      setClearCatPassword("");
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.summary.path] });
      toast({ title: "Categories Cleared", description: "All fee categories have been deleted." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to clear categories",
        variant: "destructive" 
      });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      await apiRequest("POST", api.admin.resetPassword.path, { password });
    },
    onSuccess: () => {
      setIsResettingPassword(false);
      setNewPassword("");
      toast({ title: "Success", description: "Admin password has been updated." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to reset password",
        variant: "destructive" 
      });
    }
  });

  const { data: staffSummary, isLoading } = useQuery<any[]>({
    queryKey: [api.admin.summary.path],
    queryFn: async () => {
      const res = await fetch(api.admin.summary.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin data");
      return await res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (staffId: string) => {
      await apiRequest("POST", buildUrl(api.admin.approveStaff.path, { id: staffId }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.summary.path] });
      toast({
        title: "Staff Approved",
        description: "The staff member can now log in and access the portal."
      });
      setLocation("/summary");
    }
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await apiRequest("PATCH", buildUrl(api.admin.updateStaff.path, { id }), data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.summary.path] });
      setEditingStaff(null);
      toast({ title: "Staff Updated", description: "Staff details have been saved." });
    }
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", buildUrl(api.admin.deleteStaff.path, { id }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      setEditingStaff(null);
      toast({ title: "Staff Removed", description: "Staff member has been deleted." });
    }
  });

  const totalStudents = staffSummary?.reduce((acc, s) => acc + s.studentCount, 0) || 0;
  const totalCollected = staffSummary?.reduce((acc, s) => acc + s.collectedThisYear, 0) || 0;
  const pendingStaffCount = staffSummary?.filter(s => !s.staff.isApproved).length || 0;

  const chartData = staffSummary?.map(s => ({
    name: s.staff.name,
    collected: s.collectedThisYear,
    students: s.studentCount
  })) || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleDownloadSummary = () => {
    const headers = ["Staff Name", "Subject", "Students", "Monthly Collection", "Yearly Total", "Outstanding Balance"];
    const rows = staffSummary?.map(s => [
      s.staff.name,
      s.staff.subject || "N/A",
      s.studentCount,
      s.collectedThisMonth,
      s.collectedThisYear,
      s.totalBalance
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows?.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `academy_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Control Center
          </h1>
          <p className="text-slate-500 mt-1">Global academy overview and staff management.</p>
        </div>
        
        <div className="flex gap-4">
          <Dialog open={isResettingPassword} onOpenChange={setIsResettingPassword}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings2 className="h-4 w-4" /> Reset Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Admin Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={() => resetPasswordMutation.mutate(newPassword)}
                  disabled={resetPasswordMutation.isPending || newPassword.length < 6}
                >
                  Update Password
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isClearingDb} onOpenChange={setIsClearingDb}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" /> Clear Students
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" /> Danger Zone: Clear Database
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-500">
                  This will <strong>permanently delete all student records and payment history</strong>. 
                  Roll numbers for new students will start from 001 again.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Verify Admin Password</Label>
                  <Input 
                    id="admin-password" 
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={clearDbPassword} 
                    onChange={(e) => setClearDbPassword(e.target.value)}
                  />
                </div>
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={() => clearDatabaseMutation.mutate(clearDbPassword)}
                  disabled={clearDatabaseMutation.isPending || !clearDbPassword}
                >
                  {clearDatabaseMutation.isPending ? "Clearing..." : "Confirm Delete All"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isClearingCats} onOpenChange={setIsClearingCats}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" /> Clear Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" /> Danger Zone: Clear Categories
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-500">
                  This will <strong>permanently delete all fee categories</strong>. 
                  <br /><br />
                  <span className="text-rose-600 font-bold">Important:</span> You must <strong>Clear Students</strong> first before categories can be removed.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="cat-password">Verify Admin Password</Label>
                  <Input 
                    id="cat-password" 
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={clearCatPassword} 
                    onChange={(e) => setClearCatPassword(e.target.value)}
                  />
                </div>
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={() => clearCategoriesMutation.mutate(clearCatPassword)}
                  disabled={clearCategoriesMutation.isPending || !clearCatPassword}
                >
                  {clearCategoriesMutation.isPending ? "Clearing..." : "Confirm Delete Categories"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2" onClick={handleDownloadSummary}>
            <Download className="h-4 w-4" /> Export Summary
          </Button>
          <Card className="bg-primary text-white border-none shadow-lg px-6 py-3">
            <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Total Collection</p>
            <p className="text-2xl font-bold font-display">₹{totalCollected.toLocaleString()}</p>
          </Card>
          <Card className="bg-slate-900 text-white border-none shadow-lg px-6 py-3">
            <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Total Students</p>
            <p className="text-2xl font-bold font-display">{totalStudents}</p>
          </Card>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Revenue by Staff (Yearly)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="collected" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Staff Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {chartData.map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">{s.name}</span>
                  <span className="font-bold">{s.students} Students</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${(s.collected / (totalCollected || 1)) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length]
                    }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {pendingStaffCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-amber-900">{pendingStaffCount} Staff Pending Approval</p>
              <p className="text-sm text-amber-700">New registrations require your review.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : (
          staffSummary?.map((stat) => (
            <Card key={stat.staff._id} className="shadow-md hover:shadow-xl transition-shadow border-none group relative">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    {stat.staff.picture ? (
                      <img src={stat.staff.picture} alt={stat.staff.name} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">
                        {stat.staff.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{stat.staff.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">
                      {stat.staff.subject || stat.staff.role}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {!stat.staff.isApproved && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 h-8"
                      onClick={() => approveMutation.mutate(stat.staff._id)}
                      disabled={approveMutation.isPending}
                    >
                      Approve
                    </Button>
                  )}
                  
                  <Dialog open={editingStaff?._id === stat.staff._id} onOpenChange={(open) => setEditingStaff(open ? stat.staff : null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Staff Member</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={editingStaff?.name || ""} 
                            onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject / Department</Label>
                          <Input 
                            id="subject" 
                            placeholder="e.g. Mathematics"
                            value={editingStaff?.subject || ""} 
                            onChange={(e) => setEditingStaff({...editingStaff, subject: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-between pt-4">
                          <Button 
                            variant="destructive" 
                            className="gap-2"
                            onClick={() => {
                              if(confirm("Are you sure you want to remove this staff member?")) {
                                deleteStaffMutation.mutate(stat.staff._id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> Remove Staff
                          </Button>
                          <Button 
                            className="gap-2"
                            onClick={() => updateStaffMutation.mutate({ 
                              id: stat.staff._id, 
                              data: { name: editingStaff.name, subject: editingStaff.subject } 
                            })}
                            disabled={updateStaffMutation.isPending}
                          >
                            <Save className="h-4 w-4" /> Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                      <span className="font-bold text-emerald-600">₹{stat.collectedThisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Outstanding Balance</span>
                      <span className="font-bold text-rose-600">₹{(stat.totalBalance || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>Total Year: ₹{stat.collectedThisYear.toLocaleString()}</span>
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
