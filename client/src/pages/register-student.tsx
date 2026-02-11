import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertStudentSchema } from "@shared/schema";
import { useCreateStudent } from "@/hooks/use-students";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";

const formSchema = insertStudentSchema.extend({
  categoryId: z.string().min(1, "Category is required"),
  totalFees: z.coerce.number().min(1, "Fees must be greater than 0"),
  staffId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterStudent() {
  const [_, setLocation] = useLocation();
  const { mutate, isPending } = useCreateStudent();
  const { data: categories } = useCategories();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      categoryId: "",
      totalFees: 0,
      staffId: user?._id || "",
    },
  });

  // Auto-calculate total fees when category changes, but allow manual override
  const selectedCategoryId = form.watch("categoryId");
  useEffect(() => {
    if (selectedCategoryId && categories) {
      const category = categories.find(c => c._id === selectedCategoryId);
      if (category) {
        const total = (category.monthlyFee || 0) * 12 + (category.yearlyFee || 0) + (category.term1Fee || 0) + (category.term2Fee || 0) + (category.term3Fee || 0);
        form.setValue("totalFees", total);
      }
    }
  }, [selectedCategoryId, categories, form]);

  function onSubmit(data: FormValues) {
    if (!user) return;
    mutate({ ...data, staffId: user._id }, {
      onSuccess: () => setLocation("/students"),
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-display font-bold text-slate-900">Register Student</h1>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalFees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Annual Fees</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-medium" />
                      </FormControl>
                      <FormDescription>Calculated from category, but can be changed.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Link href="/students">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isPending} className="min-w-[120px]">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Register
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
