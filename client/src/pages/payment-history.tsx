import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PaymentHistoryPage() {
  const [search, setSearch] = useState("");
  const { data: payments, isLoading } = useQuery<any[]>({
    queryKey: [api.payments.list.path],
    queryFn: async () => {
      const res = await fetch(api.payments.list.path);
      if (!res.ok) throw new Error("Failed to fetch payments");
      return await res.json();
    },
  });

  const filteredPayments = payments?.filter((p) =>
    p.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const headers = ["Date", "Student", "Type", "Amount", "Notes"];
    const rows = filteredPayments?.map((p) => [
      format(new Date(p.date), "dd/MM/yyyy"),
      p.studentName,
      p.type,
      p.amount,
      p.notes || ""
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows?.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
            <History className="h-8 w-8 text-primary" />
            Payment Records
          </h1>
          <p className="text-slate-500 mt-1">Full history of all student fee collections.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!filteredPayments?.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by student name..." 
              className="pl-9 bg-white"
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
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Date</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredPayments?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No payment records found.
                  </TableCell>
                </TableRow>
              )}
              {filteredPayments?.map((payment) => (
                <TableRow key={payment._id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-500">
                    {format(new Date(payment.date), "dd MMM yyyy, hh:mm a")}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {payment.studentName}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {payment.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-emerald-600 font-bold">
                    ₹{payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-500 italic text-sm">
                    {payment.notes || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
