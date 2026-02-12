import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStudents, useDeleteStudent } from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, MoreVertical, Trash2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export default function StudentsPage() {
  const { data: students, isLoading } = useStudents();
  const { mutate: deleteStudent } = useDeleteStudent();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const filteredStudents = students?.filter((student: any) => 
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.phone.includes(search)
  );

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">Students</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">Manage enrollments and fee status.</p>
        </div>
        <Link href="/students/new">
          <Button className="shadow-lg shadow-primary/25 rounded-xl w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Register New Student
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              className="pl-9 bg-white h-9 md:h-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isMobile ? (
          <div className="divide-y divide-slate-100">
            {filteredStudents?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No students found.
              </div>
            )}
            {filteredStudents?.map((student: any) => {
              const paid = student.totalFees - student.balance;
              const progress = (paid / student.totalFees) * 100;
              return (
                <div 
                  key={student._id} 
                  className="p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  onClick={() => setLocation(`/students/${student._id}`)}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{student.name}</h3>
                      <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-normal bg-white shrink-0">
                        {student.category.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{student.phone}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className={student.balance > 0 ? "text-rose-600 font-semibold" : "text-emerald-600"}>
                        Bal: ₹{student.balance.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${progress === 100 ? "bg-emerald-500" : "bg-primary"}`} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
                </div>
              );
            })}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Student Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Fees</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
              {filteredStudents?.map((student: any) => {
                const paid = student.totalFees - student.balance;
                const progress = (paid / student.totalFees) * 100;
                
                return (
                  <TableRow 
                    key={student._id} 
                    className="group cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setLocation(`/students/${student._id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-900">{student.name}</span>
                        <span className="text-xs text-slate-500">{student.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal bg-white">
                        {student.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{student.totalFees.toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">₹{paid.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={student.balance > 0 ? "text-rose-600 font-bold" : "text-slate-400"}>
                        ₹{student.balance.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${progress === 100 ? "bg-emerald-500" : "bg-primary"}`} 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{Math.round(progress)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {user?.role === "admin" && (
                            <>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete {student.name}'s record and all associated payment history.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-destructive hover:bg-destructive/90"
                                      onClick={() => deleteStudent(student._id)}
                                    >
                                      Delete Record
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

