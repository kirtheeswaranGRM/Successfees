import { useStudent, useUpdateStudent } from "@/hooks/use-students";
import { useRoute, Link } from "wouter";
import { PaymentModal } from "@/components/payment-modal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Phone, Calendar, Download, FileText, Share2, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentDetails() {
  const [match, params] = useRoute("/students/:id");
  const isMobile = useIsMobile();
  const id = params?.id || "";
  const { data: student, isLoading } = useStudent(id);
  const updateStudent = useUpdateStudent();
  const [isEditingFees, setIsEditingFees] = useState(false);
  const [editTotalFees, setEditTotalFees] = useState("");
  const [editBalance, setEditBalance] = useState("");

  if (isLoading) return <div className="p-4 md:p-8"><Skeleton className="h-96 w-full rounded-xl" /></div>;
  if (!student) return <div className="p-8 text-center text-muted-foreground">Student not found</div>;

  const handleEditFees = () => {
    setEditTotalFees(student.totalFees.toString());
    setEditBalance(student.balance.toString());
    setIsEditingFees(true);
  };

  const saveFees = () => {
    updateStudent.mutate({
      id: student._id,
      data: {
        totalFees: Number(editTotalFees),
        balance: Number(editBalance),
      }
    }, {
      onSuccess: () => setIsEditingFees(false)
    });
  };

  const getPDF = () => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [190, 0, 0]; // Deep Red matching logo
    
    // Add Logo
    const img = new Image();
    img.src = "/logo.jpeg";
    
    // Helper for centering text
    const centerText = (text: string, y: number, size = 12, color = [0, 0, 0], font = "helvetica", style = "normal") => {
      doc.setFont(font, style);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (210 - textWidth) / 2, y);
    };

    // Header Section with Logo
    doc.addImage(img, 'JPEG', 85, 10, 40, 25);
    
    centerText("SUCCESS ACADEMY", 45, 24, primaryColor, "times", "bold");
    centerText("ACCURACY • EFFORT • THRIVING", 52, 10, primaryColor, "helvetica", "normal");

    // Divider
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 58, 190, 58);

    centerText("Official Fee Payment Receipt", 70, 18, [0, 0, 0], "helvetica", "bold");

    // Summary Table
    autoTable(doc, {
      startY: 80,
      body: [
        ["Student Name", student.name],
        ["Student ID", student.customId || student._id.substring(student._id.length - 6).toUpperCase()],
        ["Course Name", student.category.name],
        ["Receipt Date", format(new Date(), "dd/MM/yyyy")],
        ["Receipt No.", `#${Math.floor(100000 + Math.random() * 900000)}`],
      ],
      theme: 'grid',
      styles: { fontSize: 11, cellPadding: 4, lineColor: [200, 200, 200] },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [220, 220, 220], cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 20, right: 20 }
    });

    const studentInfoY = (doc as any).lastAutoTable.finalY || 120;

    // Divider
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, studentInfoY + 5, 190, studentInfoY + 5);

    // Calculate Next Due Date (5th of next month)
    const today = new Date();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 5);
    const nextDueDate = format(nextMonthDate, "dd/MM/yyyy");

    // Payment History and Summary Side by Side
    const tableData = student.payments.map((p: any) => [
      format(new Date(p.date || ""), "dd/MM/yyyy"),
      p.type.toUpperCase(),
      p.subjects || "-",
      p.method || "Cash",
      `Rs. ${p.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: studentInfoY + 15,
      head: [["Date", "Type", "Subjects", "Method", "Amount Paid"]],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 32 },
        3: { halign: 'center', cellWidth: 18 },
        4: { halign: 'center', fontStyle: 'bold', cellWidth: 25 }
      },
      margin: { left: 15 },
      tableWidth: 115
    });

    // Financial Summary Table on the right
    autoTable(doc, {
      startY: studentInfoY + 15,
      body: [
        ["Total Course Fees", `Rs. ${student.totalFees.toLocaleString()}`],
        ["Amount Received", `Rs. ${(student.totalFees - student.balance).toLocaleString()}`],
        ["Balance Due", `Rs. ${student.balance.toLocaleString()}`],
        ["Next Due Date", nextDueDate]
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, lineColor: [200, 200, 200] },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 40 },
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 25 }
      },
      margin: { left: 132 }
    });

    // Footer Section
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer Divider
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 45, 190, pageHeight - 45);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Dr. M. SANTHOSH, M.Sc. (Physics), M.SC. (Maths,), B.Ec.Phil., Ph.D.,", 20, pageHeight - 38);
    
    doc.setFont("helvetica", "normal");
    doc.text("Physicict & Mathematician | Chairman, Success Academy", 20, pageHeight - 33);
    
    doc.text("Maduari – 6251001", 20, pageHeight - 28);
    doc.text("Contact: 950021553443", 140, pageHeight - 28);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    centerText("This is an official computer-generated receipt. No signature required.", pageHeight - 15);
    
    return doc;
  };

  const generateReceipt = () => {
    const doc = getPDF();
    doc.save(`${student.name.replace(/\s+/g, '_')}_Receipt.pdf`);
  };

  const shareReceipt = async () => {
    const doc = getPDF();
    const pdfBlob = doc.output('blob');
    const fileName = `${student.name.replace(/\s+/g, '_')}_Receipt.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Fee Receipt',
          text: `Fee Receipt for ${student.name}`,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      }
    } else {
      // Fallback: Try to open WhatsApp with text if file share fails
      const text = `Fee Receipt for ${student.name}. Please download from the portal.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };


  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-3xl font-display font-bold text-slate-900">{student.name}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> ID: {student.customId || student._id.substring(student._id.length - 6).toUpperCase()}</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.phone}</span>
              {!isMobile && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Registered: {format(new Date(student.registrationDate || ""), "PP")}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={generateReceipt} className="flex-1 md:flex-none">
            <Download className={isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"} /> 
            {!isMobile && "Download PDF"}
          </Button>
          <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={shareReceipt} className="flex-1 md:flex-none">
            <Share2 className={isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"} />
            {!isMobile && "Share"}
          </Button>
          <PaymentModal student={student} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Financial Overview Card */}
        <Card className="md:col-span-1 shadow-md border-none bg-slate-900 text-white">
          <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-white font-display text-lg md:text-xl">Fee Summary</CardTitle>
            <Dialog open={isEditingFees} onOpenChange={setIsEditingFees}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={handleEditFees}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Fee Information</DialogTitle>
                  <DialogDescription>
                    Update the total course fees and current balance for {student.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="totalFees">Total Course Fees</Label>
                    <Input
                      id="totalFees"
                      type="number"
                      value={editTotalFees}
                      onChange={(e) => setEditTotalFees(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="balance">Balance Due</Label>
                    <Input
                      id="balance"
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditingFees(false)}>Cancel</Button>
                  <Button onClick={saveFees} disabled={updateStudent.isPending}>
                    {updateStudent.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0 md:pt-0">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm md:text-base">Total Fees</span>
              <span className="font-bold text-base md:text-lg">Rs. {student.totalFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm md:text-base">Total Paid</span>
              <span className="font-bold text-base md:text-lg text-emerald-400">Rs. {(student.totalFees - student.balance).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 md:py-4">
              <span className="text-slate-400 font-medium text-sm md:text-base">Balance Due</span>
              <span className="font-bold text-2xl md:text-3xl text-rose-400">Rs. {student.balance.toLocaleString()}</span>
            </div>
            <div className="bg-white/10 p-3 md:p-4 rounded-xl">
              <p className="text-xs md:text-sm font-medium mb-0.5 md:mb-1 text-slate-300">Category Plan</p>
              <p className="font-bold text-base md:text-lg">{student.category.name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="md:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            {student.payments.length === 0 ? (
              <div className="text-center py-8 md:py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {student.payments.map((payment: any) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm md:text-base">
                        Rs
                      </div>
                      <div>
                        <p className="font-medium text-sm md:text-base text-slate-900 capitalize">
                          {payment.type} Payment <span className="text-[10px] md:text-xs text-slate-400 font-normal ml-1">({payment.method || "Cash"})</span>
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-500">{format(new Date(payment.date || ""), "PPP")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm md:text-base text-emerald-600">+Rs. {payment.amount}</p>
                      {payment.notes && <p className="text-[10px] md:text-xs text-slate-400 max-w-[100px] md:max-w-[150px] truncate">{payment.notes}</p>}
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

