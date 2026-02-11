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
    const primaryColor: [number, number, number] = [220, 38, 38]; // Professional Red matching logo
    const secondaryColor: [number, number, number] = [51, 65, 85]; // Slate 700
    
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
    doc.addImage(img, 'JPEG', 85, 10, 40, 40);
    
    centerText("SUCCESS ACADEMY", 60, 24, primaryColor, "helvetica", "bold");
    centerText("ACCURACY • EFFORT • THRIVING", 68, 10, secondaryColor, "helvetica", "italic");
    centerText("SINCE 2005", 73, 8, [150, 150, 150], "helvetica", "normal");
    centerText("Official Fee Payment Receipt", 85, 16, [0, 0, 0], "helvetica", "bold");

    // Background Decorative Elements
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.1);
    doc.rect(5, 5, 200, 287); // Page Border

    // Divider
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.8);
    doc.line(20, 92, 190, 92);

    // Student Information Block
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 100, 80, 35, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 100, 80, 35, 'S');

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("STUDENT DETAILS", 25, 107);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(student.name, 25, 115);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`ID: ${student._id.substring(student._id.length - 6).toUpperCase()}`, 25, 122);
    doc.text(`Course: ${student.category.name}`, 25, 129);
    
    // Receipt Info Block
    doc.setFillColor(248, 250, 252);
    doc.rect(110, 100, 80, 35, 'F');
    doc.rect(110, 100, 80, 35, 'S');

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("RECEIPT INFORMATION", 115, 107);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Date: ${format(new Date(), "PPP")}`, 115, 115);
    doc.text(`Receipt No: #${Math.floor(100000 + Math.random() * 900000)}`, 115, 122);
    doc.text(`Status: COMPLETED`, 115, 129);

    // Payment History Table
    const tableData = student.payments.map((p: any) => [
      format(new Date(p.date || ""), "dd MMM yyyy"),
      p.type.toUpperCase(),
      `₹${p.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 145,
      head: [["Date", "Payment Type", "Amount Paid"]],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 6
      },
      styles: {
        fontSize: 11,
        cellPadding: 5,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 50, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'center' },
        2: { cellWidth: 50, halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto'
    });

    const finalY = (doc as any).lastAutoTable.finalY || 160;

    // Summary Box
    const boxWidth = 70;
    const boxX = 120;
    doc.setFillColor(241, 245, 249); 
    doc.rect(boxX, finalY + 10, boxWidth, 45, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(boxX, finalY + 10, boxWidth, 45, 'S');

    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Total Course Fees:", boxX + 5, finalY + 20);
    doc.text("Amount Received:", boxX + 5, finalY + 30);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`₹${student.totalFees.toLocaleString()}`, boxX + boxWidth - 5, finalY + 20, { align: 'right' });
    doc.setTextColor(16, 185, 129);
    doc.text(`₹${(student.totalFees - student.balance).toLocaleString()}`, boxX + boxWidth - 5, finalY + 30, { align: 'right' });

    // Outstanding Balance Highlight
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]); 
    doc.rect(boxX + 2, finalY + 35, boxWidth - 4, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("BALANCE DUE:", boxX + 5, finalY + 43);
    doc.setFontSize(13);
    doc.text(`₹${student.balance.toLocaleString()}`, boxX + boxWidth - 5, finalY + 43, { align: 'right' });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "bold");
    centerText("Dr. M. SANTHOSH, M.Sc (Physics)., M.Sc (Maths)., M.Phil., B.Ed., Ph.D.,", pageHeight - 45);
    centerText("Physicist & Mathematician", pageHeight - 40);
    
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    centerText("Chairman, Success Academy, Madurai – 625001.", pageHeight - 32);
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    centerText("Contact: 95002155343", pageHeight - 25);
    centerText("This is an official computer-generated receipt. No signature required.", pageHeight - 18);
    
    // Decorative Line at Bottom
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(2);
    doc.line(20, pageHeight - 10, 190, pageHeight - 10);

    doc.save(`${student.name.replace(/\s+/g, '_')}_Receipt.pdf`);
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
              <span className="font-bold text-lg">₹{student.totalFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400">Total Paid</span>
              <span className="font-bold text-lg text-emerald-400">₹{(student.totalFees - student.balance).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-slate-400 font-medium">Balance Due</span>
              <span className="font-bold text-3xl text-rose-400">₹{student.balance.toLocaleString()}</span>
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
                        ₹
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 capitalize">{payment.type} Payment</p>
                        <p className="text-xs text-slate-500">{format(new Date(payment.date || ""), "PPP")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">+₹{payment.amount}</p>
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
