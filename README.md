# 🎓 Success Fees Management System

A sophisticated, full-stack fee management platform designed for academies to streamline student enrollments, track payments, and visualize financial growth.

---

## 🚀 Key Features

- **🛡️ Secure Authentication**: Dual-system login featuring Admin (Local) and Staff (Google OAuth2).
- **📋 Student Lifecycle**: Effortless registration with automated, intelligent ID generation (`YearClassRollNo`).
- **💰 Financial Intelligence**: 
  - Real-time balance tracking.
  - Multi-tier fee structures (Monthly, Yearly, Term).
  - Categorized financial breakdowns.
- **📊 Interactive Dashboard**: Visual analytics using Recharts for revenue and student distribution.
- **🛠️ Admin Control Center**: Global oversight with staff management and database maintenance tools.
- **📄 Professional Receipts**: High-quality PDF generation for all student transactions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Framer Motion
- **State Management**: TanStack Query (React Query)
- **Visualization**: Recharts

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB with Mongoose
- **Validation**: Zod (Type-safe schemas)
- **Security**: Passport.js & Scrypt Hashing

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB Atlas account or local MongoDB instance

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Success_fees
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_uri
   SESSION_SECRET=your_secure_secret
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   ```

4. **Run Development Mode**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure

```
├── client/          # React frontend application
├── server/          # Express backend & storage logic
├── shared/          # Shared Zod schemas & types
├── dist/            # Compiled production build
└── script/          # Build and automation scripts
```

---

## 🛡️ Security & Reliability

- **Schema Validation**: Every API request is validated via Zod to prevent data corruption.
- **Transaction Safety**: Automatic balance synchronization between payments and student records.
- **Race Condition Prevention**: Intelligent roll number generation (Per-category, Per-year).

---

## 📄 License
This project is proprietary. All rights reserved.
