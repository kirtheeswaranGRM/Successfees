import { useState } from "react";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCategorySchema } from "@shared/schema";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Plus, CreditCard } from "lucide-react";

const formSchema = insertCategorySchema.extend({
  monthlyFee: z.coerce.number(),
  yearlyFee: z.coerce.number(),
  term1Fee: z.coerce.number(),
  term2Fee: z.coerce.number(),
  term3Fee: z.coerce.number(),
  createdBy: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const { mutate, isPending } = useCreateCategory();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      monthlyFee: 0,
      yearlyFee: 0,
      term1Fee: 0,
      term2Fee: 0,
      term3Fee: 0,
      createdBy: user?._id || "",
    },
  });

  function onSubmit(data: FormValues) {
    if (!user) return;
    mutate({ ...data, createdBy: user._id }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Fee Categories</h1>
          <p className="text-slate-500 mt-1">Define fee structures for different classes or groups.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Create Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Fee Structure</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Grade 10, Science Stream" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Fee</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearlyFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yearly Fee</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="term1Fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term 1</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="term2Fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term 2</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="term3Fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term 3</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Creating..." : "Save Category"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Name</TableHead>
              <TableHead>Monthly</TableHead>
              <TableHead>Yearly</TableHead>
              <TableHead>Term 1</TableHead>
              <TableHead>Term 2</TableHead>
              <TableHead>Term 3</TableHead>
              <TableHead className="text-right">Total Annual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((cat: any) => {
              const total = (cat.monthlyFee || 0) * 12 + (cat.yearlyFee || 0) + (cat.term1Fee || 0) + (cat.term2Fee || 0) + (cat.term3Fee || 0);
              return (
                <TableRow key={cat._id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    {cat.name}
                  </TableCell>
                  <TableCell>${cat.monthlyFee}</TableCell>
                  <TableCell>${cat.yearlyFee}</TableCell>
                  <TableCell>${cat.term1Fee}</TableCell>
                  <TableCell>${cat.term2Fee}</TableCell>
                  <TableCell>${cat.term3Fee}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    ${total.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
