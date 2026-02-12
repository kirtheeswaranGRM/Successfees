import { 
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Student, type InsertStudent, type StudentWithDetails,
  type Payment, type InsertPayment
} from "@shared/schema";
import { UserModel, CategoryModel, StudentModel, PaymentModel } from "./db";
import mongoose from "mongoose";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllStaff(): Promise<User[]>;
  approveStaff(id: string): Promise<void>;
  updateStaff(id: string, update: Partial<User>): Promise<User>;
  deleteStaff(id: string): Promise<void>;

  // Category
  getCategories(staffId?: string): Promise<Category[]>; 
  createCategory(category: InsertCategory): Promise<Category>;

  // Student
  getStudents(staffId?: string): Promise<StudentWithDetails[]>;
  getStudent(id: string): Promise<StudentWithDetails | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, update: Partial<Student>): Promise<Student>;
  updateStudentBalance(id: string, amountPaid: number): Promise<void>;
  deleteStudent(id: string): Promise<void>;

  // Payment
  addPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByStudent(studentId: string): Promise<Payment[]>;
  getAllPayments(staffId?: string): Promise<any[]>;

  // Dashboard
  getDashboardStats(staffId: string): Promise<{
    totalStudents: number;
    totalCollected: number;
    totalBalance: number;
    monthlyCollected: number;
    weeklyCollected: number;
    yearlyScheduled: number;
    yearlyCollected: number;
    newJoinsThisMonth: number;
    paidStudents: number;
    remainingStudents: number;
  }>;

  getReportStats(staffId: string | undefined, startDate: Date, endDate: Date): Promise<any>;
  
  getAdminStats(): Promise<{
    totalCollected: number;
    totalStudents: number;
  }>;
  clearAllStudents(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const user = await UserModel.findById(id).lean();
    return user ? { ...user, _id: user._id.toString() } as any : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).lean();
    return user ? { ...user, _id: user._id.toString() } as any : undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ googleId }).lean();
    return user ? { ...user, _id: user._id.toString() } as any : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = new UserModel(user);
    await newUser.save();
    const obj = newUser.toObject();
    return { ...obj, _id: obj._id.toString() } as any;
  }

  async getAllStaff(): Promise<User[]> {
    const staff = await UserModel.find({ role: "staff" }).lean();
    return staff.map(s => ({ ...s, _id: s._id.toString() })) as any;
  }

  async approveStaff(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { isApproved: true });
  }

  async updateStaff(id: string, update: Partial<User>): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!user) throw new Error("Staff member not found");
    return { ...user, _id: user._id.toString() } as any;
  }

  async deleteStaff(id: string): Promise<void> {
    // Delete their students, payments, and categories? 
    // For now just the user to avoid orphan data issues if needed, but safer to keep data or reassign.
    // User request just said "remove", usually implies deleting the user.
    await UserModel.findByIdAndDelete(id);
  }

  async getCategories(staffId?: string): Promise<Category[]> {
    const query = staffId ? { createdBy: staffId } : {};
    const categories = await CategoryModel.find(query).lean();
    return categories.map(c => ({ ...c, _id: c._id.toString() })) as any;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = new CategoryModel(category);
    await newCategory.save();
    const obj = newCategory.toObject();
    return { ...obj, _id: obj._id.toString() } as any;
  }

  async getStudents(staffId?: string): Promise<StudentWithDetails[]> {
    const query = staffId ? { staffId } : {};
    const students = await StudentModel.find(query).sort({ registrationDate: -1 }).lean();
    
    return await Promise.all(students.map(async (s) => {
      const category = await CategoryModel.findById(s.categoryId).lean();
      const staff = await UserModel.findById(s.staffId).lean();
      const payments = await PaymentModel.find({ studentId: s._id }).lean();
      return {
        ...s,
        _id: s._id.toString(),
        category: category ? { ...category, _id: category._id.toString() } : null,
        staff: staff ? { ...staff, _id: staff._id.toString() } : null,
        payments: payments.map(p => ({ ...p, _id: p._id.toString() }))
      } as any;
    }));
  }

  async getStudent(id: string): Promise<StudentWithDetails | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const student = await StudentModel.findById(id).lean();
    if (!student) return undefined;

    const category = await CategoryModel.findById(student.categoryId).lean();
    const staff = await UserModel.findById(student.staffId).lean();
    const payments = await PaymentModel.find({ studentId: student._id }).lean();

    return {
      ...student,
      _id: student._id.toString(),
      category: category ? { ...category, _id: category._id.toString() } : null,
      staff: staff ? { ...staff, _id: staff._id.toString() } : null,
      payments: payments.map(p => ({ ...p, _id: p._id.toString() }))
    } as any;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const category = await CategoryModel.findById(student.categoryId);
    if (!category) throw new Error("Category not found");

    const now = new Date();
    const year = now.getFullYear().toString().substring(2); // e.g. "26"
    const className = category.name.toUpperCase().replace(/CLASS|GRADE/g, '').replace(/\s+/g, ''); // Ensure no spaces and no "CLASS/GRADE", e.g. "XII"
    
    // Count students in this category THIS YEAR to get roll number
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const count = await StudentModel.countDocuments({ 
      categoryId: student.categoryId,
      registrationDate: { $gte: startOfYear }
    });
    const rollNo = (count + 1).toString().padStart(3, '0'); // e.g. "001"
    
    const customId = `${year}${className}${rollNo}`;
    
    const studentData = {
      name: student.name,
      phone: student.phone,
      categoryId: student.categoryId,
      staffId: student.staffId,
      subjects: student.subjects,
      totalFees: student.totalFees,
      balance: student.balance ?? student.totalFees,
      customId: customId
    };

    const newStudent = new StudentModel(studentData);
    const saved = await newStudent.save();
    const obj = saved.toObject();
    return { ...obj, _id: obj._id.toString(), customId: obj.customId } as any;
  }

  async updateStudent(id: string, update: Partial<Student>): Promise<Student> {
    const student = await StudentModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!student) throw new Error("Student not found");
    return { ...student, _id: student._id.toString() } as any;
  }

  async updateStudentBalance(id: string, amountPaid: number): Promise<void> {
    await StudentModel.findByIdAndUpdate(id, { $inc: { balance: -amountPaid } });
  }

  async deleteStudent(id: string): Promise<void> {
    await PaymentModel.deleteMany({ studentId: id });
    await StudentModel.findByIdAndDelete(id);
  }

  async addPayment(payment: InsertPayment): Promise<Payment> {
    const newPayment = new PaymentModel(payment);
    await newPayment.save();
    const obj = newPayment.toObject();
    return { ...obj, _id: obj._id.toString() } as any;
  }

  async getPaymentsByStudent(studentId: string): Promise<Payment[]> {
    const payments = await PaymentModel.find({ studentId }).sort({ date: -1 }).lean();
    return payments.map(p => ({ ...p, _id: p._id.toString() })) as any;
  }

  async getAllPayments(staffId?: string): Promise<any[]> {
    const match = staffId ? { "student.staffId": new mongoose.Types.ObjectId(staffId) } : {};
    
    return await PaymentModel.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      { $match: match },
      { $sort: { date: -1 } },
      {
        $project: {
          _id: 1,
          amount: 1,
          type: 1,
          date: 1,
          notes: 1,
          subjects: 1,
          studentName: "$student.name",
          studentId: "$student._id",
          staffId: 1
        }
      }
    ]);
  }

  async getDashboardStats(staffId: string) {
    const studentCount = await StudentModel.countDocuments({ staffId });
    
    const financial = await StudentModel.aggregate([
      { $match: { staffId: new mongoose.Types.ObjectId(staffId) } },
      { $group: { _id: null, totalFees: { $sum: "$totalFees" }, totalBalance: { $sum: "$balance" } } }
    ]);

    const totalCollectedAgg = await PaymentModel.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      { $match: { "student.staffId": new mongoose.Types.ObjectId(staffId) } },
      { $group: { _id: null, sum: { $sum: "$amount" } } }
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const monthlyCollectedAgg = await PaymentModel.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      { 
        $match: { 
          "student.staffId": new mongoose.Types.ObjectId(staffId),
          date: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, sum: { $sum: "$amount" } } }
    ]);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0,0,0,0);

    const weeklyCollectedAgg = await PaymentModel.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      { 
        $match: { 
          "student.staffId": new mongoose.Types.ObjectId(staffId),
          date: { $gte: startOfWeek }
        } 
      },
      { $group: { _id: null, sum: { $sum: "$amount" } } }
    ]);

    const newJoinsThisMonth = await StudentModel.countDocuments({ 
      staffId: new mongoose.Types.ObjectId(staffId), 
      registrationDate: { $gte: startOfMonth } 
    });

    const paidStudents = await StudentModel.countDocuments({
      staffId: new mongoose.Types.ObjectId(staffId),
      balance: { $lte: 0 }
    });

    const remainingStudents = await StudentModel.countDocuments({
      staffId: new mongoose.Types.ObjectId(staffId),
      balance: { $gt: 0 }
    });

    const categoryStats = await StudentModel.aggregate([
      { $match: { staffId: new mongoose.Types.ObjectId(staffId) } },
      {
        $group: {
          _id: "$categoryId",
          studentCount: { $sum: 1 },
          totalFees: { $sum: "$totalFees" },
          totalBalance: { $sum: "$balance" }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 1,
          categoryName: "$category.name",
          studentCount: 1,
          totalFees: 1,
          totalBalance: 1,
          totalCollected: { $subtract: ["$totalFees", "$totalBalance"] }
        }
      }
    ]);

    return {
      totalStudents: studentCount,
      totalCollected: totalCollectedAgg[0]?.sum || 0,
      totalBalance: financial[0]?.totalBalance || 0,
      monthlyCollected: monthlyCollectedAgg[0]?.sum || 0,
      weeklyCollected: weeklyCollectedAgg[0]?.sum || 0,
      yearlyScheduled: financial[0]?.totalFees || 0,
      yearlyCollected: totalCollectedAgg[0]?.sum || 0,
      newJoinsThisMonth,
      paidStudents,
      remainingStudents,
      categoryStats
    };
  }

  async getReportStats(staffId: string | undefined, startDate: Date, endDate: Date) {
    const match: any = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (staffId) {
      match["staffId"] = new mongoose.Types.ObjectId(staffId);
    }

    const payments = await PaymentModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "users",
          localField: "staffId",
          foreignField: "_id",
          as: "staff"
        }
      },
      { $unwind: "$staff" },
      {
        $project: {
          _id: 1,
          amount: 1,
          type: 1,
          date: 1,
          notes: 1,
          subjects: 1,
          studentName: "$student.name",
          staffName: "$staff.name"
        }
      },
      { $sort: { date: -1 } }
    ]);

    const summary = payments.reduce((acc: any, p: any) => {
      acc.totalCollected += p.amount;
      return acc;
    }, { totalCollected: 0, count: payments.length });

    return {
      payments,
      summary
    };
  }

  async getAdminStats() {
     const collected = await PaymentModel.aggregate([{ $group: { _id: null, sum: { $sum: "$amount" } } }]);
     const studentCount = await StudentModel.countDocuments();
     return {
       totalCollected: collected[0]?.sum || 0,
       totalStudents: studentCount
     };
  }

  async clearAllStudents(): Promise<void> {
    await PaymentModel.deleteMany({});
    await StudentModel.deleteMany({});
  }
}

export const storage = new DatabaseStorage();
