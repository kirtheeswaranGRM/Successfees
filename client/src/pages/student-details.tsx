import { useStudent } from "@/hooks/use-students";
import { useRoute, Link } from "wouter";
import { PaymentModal } from "@/components/payment-modal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Phone, Calendar, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function StudentDetails() {
  const [match, params] = useRoute("/students/:id");
  const id = params?.id || "";
  const { data: student, isLoading } = useStudent(id);

  if (isLoading) return <div className="p-8"><Skeleton className="h-96 w-full rounded-xl" /></div>;
  if (!student) return <div className="p-8 text-center text-muted-foreground">Student not found</div>;

  const generateReceipt = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("SUCCESS ACADEMY", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Fee Statement Receipt", 105, 30, { align: "center" });
    
    // Student Info
    doc.text(`Student Name: ${student.name}`, 20, 50);
    doc.text(`Category: ${student.category.name}`, 20, 60);
    doc.text(`Date: ${format(new Date(), "PP")}`, 150, 50);

    // Table
    const tableData = student.payments.map((p: any) => [
      format(new Date(p.date || ""), "PP"),
      p.type.toUpperCase(),
      `$${p.amount}`,
      p.notes || "-"
    ]);

    autoTable(doc, {
      startY: 70,
      head: [["Date", "Type", "Amount", "Notes"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;

    // Summary
    doc.text(`Total Fees: $${student.totalFees}`, 140, finalY + 20);
    doc.text(`Paid: $${student.totalFees - student.balance}`, 140, finalY + 30);
    doc.setTextColor(220, 53, 69);
    doc.text(`Balance Due: $${student.balance}`, 140, finalY + 40);

    doc.save(`${student.name}_receipt.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">{student.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> ID: {student._id.substring(student._id.length - 6).toUpperCase()}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.phone}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Registered: {format(new Date(student.registrationDate || ""), "PP")}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={generateReceipt}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <PaymentModal student={student} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financial Overview Card */}
        <Card className="md:col-span-1 shadow-md border-none bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-white font-display">Fee Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400">Total Fees</span>
              <span className="font-bold text-lg">${student.totalFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400">Total Paid</span>
              <span className="font-bold text-lg text-emerald-400">${(student.totalFees - student.balance).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-slate-400 font-medium">Balance Due</span>
              <span className="font-bold text-3xl text-rose-400">${student.balance.toLocaleString()}</span>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-sm font-medium mb-1 text-slate-300">Category Plan</p>
              <p className="font-bold text-lg">{student.category.name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="md:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {student.payments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {student.payments.map((payment: any) => (
                  <div key={payment._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        $
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 capitalize">{payment.type} Payment</p>
                        <p className="text-xs text-slate-500">{format(new Date(payment.date || ""), "PPP")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">+${payment.amount}</p>
                      {payment.notes && <p className="text-xs text-slate-400 max-w-[150px] truncate">{payment.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
