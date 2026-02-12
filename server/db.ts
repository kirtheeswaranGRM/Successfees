import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://successfees:successfees123@successfees.fbzb1ih.mongodb.net/?appName=Successfees";
export async function connectDB() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (err: any) {
    console.error("MongoDB connection error:", err);
    if (err.name === 'MongooseServerSelectionError') {
      console.error("\x1b[31m%s\x1b[0m", "ERROR: Could not connect to MongoDB Atlas cluster.");
      console.error("\x1b[31m%s\x1b[0m", "Please ensure your IP address is whitelisted in MongoDB Atlas (Network Access).");
      console.error("\x1b[31m%s\x1b[0m", "For deployment, you might need to whitelist 0.0.0.0/0.");
    }
    // Don't exit process in development, but maybe in production?
    // For now just rethrow to catch it in index.ts
    throw err;
  }
}

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, default: "staff" },
  name: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  picture: { type: String },
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
  isGlobal: { type: Boolean, default: false },
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjects: { type: String, required: true },
  totalFees: { type: Number, required: true },
  balance: { type: Number, required: true },
  customId: { type: String },
  registrationDate: { type: Date, default: Date.now },
});

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, required: true },
  method: { type: String, default: "Cash" },
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
