import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPaymentSchema } from "@shared/schema";
import { useAddPayment } from "@/hooks/use-students";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, IndianRupee } from "lucide-react";
import { type StudentWithDetails } from "@shared/schema";

const formSchema = insertPaymentSchema.omit({ staffId: true }).extend({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  studentId: z.string(),
});

type PaymentFormValues = z.infer<typeof formSchema>;

export function PaymentModal({ student }: { student: StudentWithDetails }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useAddPayment();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: student._id,
      amount: "" as any,
      type: "monthly",
      method: "Cash",
      subjects: student.subjects || "",
      notes: "",
    },
  });

  function onSubmit(data: PaymentFormValues) {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset({
          studentId: student._id,
          amount: "" as any,
          type: "monthly",
          method: "Cash",
          notes: "",
        });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/20">
          <CreditCard className="h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Add a new payment record for <span className="font-semibold text-primary">{student.name}</span>.
            Current Balance: <span className="font-mono text-destructive">₹{student.balance}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="number" className="pl-9" placeholder="0.00" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects Paying For</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Maths, Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Fee</SelectItem>
                      <SelectItem value="term">Term Fee</SelectItem>
                      <SelectItem value="yearly">Yearly Fee</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="GPay">GPay</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Check number, bank transfer ref, etc." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Processing..." : "Confirm Payment"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
