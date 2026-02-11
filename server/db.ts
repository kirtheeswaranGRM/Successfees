import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://successfees:successfees123@successfees.fbzb1ih.mongodb.net/?appName=Successfeest2";

mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, default: "staff" },
  name: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  isApproved: { type: Boolean, default: false },
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  monthlyFee: { type: Number, default: 0 },
  yearlyFee: { type: Number, default: 0 },
  term1Fee: { type: Number, default: 0 },
  term2Fee: { type: Number, default: 0 },
  term3Fee: { type: Number, default: 0 },
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjects: { type: String, required: true },
  totalFees: { type: Number, required: true },
  balance: { type: Number, required: true },
  registrationDate: { type: Date, default: Date.now },
});

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, required: true },
  subjects: { type: String },
  notes: { type: String },
});

export const UserModel = mongoose.model('User', userSchema);
export const CategoryModel = mongoose.model('Category', categorySchema);
export const StudentModel = mongoose.model('Student', studentSchema);
export const PaymentModel = mongoose.model('Payment', paymentSchema);

export const db = {
  users: UserModel,
  categories: CategoryModel,
  students: StudentModel,
  payments: PaymentModel,
};
