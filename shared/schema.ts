import { z } from "zod";

// User Roles
export const UserRole = {
  ADMIN: "admin",
  STAFF: "staff",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// === SCHEMAS ===

export const insertUserSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  role: z.string().default("staff"),
  name: z.string(),
  googleId: z.string().optional(),
  isApproved: z.boolean().default(false),
});

export const insertCategorySchema = z.object({
  name: z.string(),
  createdBy: z.string(), // Staff ID (MongoDB ObjectId)
  monthlyFee: z.number().default(0),
  yearlyFee: z.number().default(0),
  term1Fee: z.number().default(0),
  term2Fee: z.number().default(0),
  term3Fee: z.number().default(0),
});

export const insertStudentSchema = z.object({
  name: z.string(),
  phone: z.string(),
  categoryId: z.string(), // Category ID
  staffId: z.string(), // Assigned staff
  totalFees: z.number(),
  balance: z.number().optional(),
});

export const insertPaymentSchema = z.object({
  studentId: z.string(),
  amount: z.number(),
  type: z.string(), // 'monthly' | 'yearly' | 'term'
  notes: z.string().optional(),
});

// === TYPES ===

export type User = z.infer<typeof insertUserSchema> & { _id: string };
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = z.infer<typeof insertCategorySchema> & { _id: string };
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Student = z.infer<typeof insertStudentSchema> & { _id: string, registrationDate: Date, balance: number };
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Payment = z.infer<typeof insertPaymentSchema> & { _id: string, date: Date };
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// === API CONTRACT TYPES ===

export type CreateCategoryRequest = InsertCategory;
export type CreateStudentRequest = InsertStudent;
export type AddPaymentRequest = InsertPayment;

export type StudentWithDetails = Student & {
  category: Category;
  staff: User;
  payments: Payment[];
};

export type DashboardSummary = {
  totalStudents: number;
  totalCollected: number;
  totalBalance: number;
  monthlyCollected: number;
  weeklyCollected: number;
  yearlyScheduled: number;
  yearlyCollected: number;
  yearlyBalance: number;
};

export type StaffSummary = {
  staff: User;
  studentCount: number;
  collectedThisMonth: number;
  collectedThisYear: number;
};
