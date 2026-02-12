import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashed, "hex");
  const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === AUTH SETUP ===
  if (app.get("env") === "production" || process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      cookie: { secure: app.get("env") === "production" || process.env.NODE_ENV === "production" },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy for Admin
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        if (username === "admin" && password === "admin123") {
          let admin = await storage.getUserByUsername("admin");
          if (!admin) {
            const hashedPass = await hashPassword("admin123");
            admin = await storage.createUser({
              username: "admin",
              password: hashedPass,
              role: "admin",
              name: "Administrator",
              isApproved: true
            });
          }
          return done(null, admin);
        }

        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Incorrect username." });
        if (!user.password) return done(null, false, { message: "Login with Google." });
        
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        console.error("[Auth Error]", err);
        return done(err);
      }
    })
  );

  // Google Strategy for Staff
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "589564514458-sjnr0ga5v7ira3mcjeti5k3gk2drjr1q.apps.googleusercontent.com",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
        callbackURL: "/api/auth/google/callback",
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await storage.getUserByGoogleId(profile.id);
          if (!user) {
            user = await storage.createUser({
              googleId: profile.id,
              name: profile.displayName,
              role: "staff",
              isApproved: false // Admin must approve
            });
          }
          return done(null, user);
        } catch (err) {
          console.error("[Google Auth Error]", err);
          return done(err as any);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user._id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      console.error("[Deserialize User Error]", err);
      done(err);
    }
  });

  // === SEED DATA ===
  try {
    const admin = await storage.getUserByUsername("admin");
    if (!admin) {
      console.log("Seeding admin...");
      const adminPass = await hashPassword("admin123");
      await storage.createUser({ 
        username: "admin", 
        password: adminPass, 
        role: "admin", 
        name: "Administrator",
        isApproved: true
      });
    }
  } catch (err) {
    console.error("[Seeding Error]", err);
  }

  // === API ROUTES ===

  // Auth
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("[Login API Error]", err);
        return next(err);
      }
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      req.logIn(user, (err) => {
        if (err) {
          console.error("[Login Session Error]", err);
          return next(err);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.get(api.auth.google.path, (req, res, next) => {
    const host = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const callbackURL = `${host}/api/auth/google/callback`;
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      callbackURL: callbackURL
    } as any)(req, res, next);
  });

  app.get(api.auth.googleCallback.path, (req, res, next) => {
    const host = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const callbackURL = `${host}/api/auth/google/callback`;
    passport.authenticate("google", { 
      failureRedirect: "/login",
      callbackURL: callbackURL
    } as any)(req, res, next);
  }, (req, res) => {
    res.redirect("/summary");
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("[Logout Error]", err);
        return res.sendStatus(500);
      }
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) return res.json(req.user);
    res.status(401).json({ message: "Not authenticated" });
  });

  // Categories
  app.get(api.categories.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      const categories = await storage.getCategories(user.role === 'admin' ? undefined : user._id);
      res.json(categories);
    } catch (err) {
      console.error("[Categories List Error]", err);
      res.sendStatus(500);
    }
  });

  app.post(api.categories.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.categories.create.input.parse(req.body);
      const user = req.user as any;
      const category = await storage.createCategory({ ...input, createdBy: user._id });
      res.status(201).json(category);
    } catch (err) {
      console.error("[Category Create Error]", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.sendStatus(500);
    }
  });

  // Students
  app.get(api.students.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      const students = await storage.getStudents(user.role === 'admin' ? undefined : user._id);
      res.json(students);
    } catch (err) {
      console.error("[Students List Error]", err);
      res.sendStatus(500);
    }
  });

  app.get(api.students.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) return res.sendStatus(404);
      
      // Check access
      const user = req.user as any;
      if (user.role !== 'admin' && student.staffId.toString() !== user._id.toString()) return res.sendStatus(403);
      
      res.json(student);
    } catch (err) {
      console.error("[Student Get Error]", err);
      res.sendStatus(500);
    }
  });

  app.post(api.students.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.students.create.input.parse(req.body);
      const user = req.user as any;
      const student = await storage.createStudent({ ...input, staffId: user._id });
      res.status(201).json(student);
    } catch (err) {
      console.error("[Student Create Error]", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.sendStatus(500);
    }
  });

  app.delete(api.students.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) return res.sendStatus(404);
      
      const user = req.user as any;
      if (user.role !== 'admin' && student.staffId.toString() !== user._id.toString()) return res.sendStatus(403);

      await storage.deleteStudent(req.params.id);
      res.sendStatus(200);
    } catch (err) {
      console.error("[Student Delete Error]", err);
      res.sendStatus(500);
    }
  });

  // Payments
  app.post(api.payments.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      // Inject staffId from session if not provided or if not admin
      const paymentData = { ...req.body };
      if (!paymentData.staffId || user.role !== 'admin') {
        paymentData.staffId = user._id.toString();
      }

      const input = api.payments.create.input.parse(paymentData);
      
      // Check ownership
      const student = await storage.getStudent(input.studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });
      
      if (user.role !== 'admin' && student.staffId.toString() !== user._id.toString()) return res.sendStatus(403);

      const payment = await storage.addPayment(input);
      await storage.updateStudentBalance(input.studentId, input.amount);
      
      res.status(201).json(payment);
    } catch (err) {
      console.error("[Payment Create Error]", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.sendStatus(500);
    }
  });

  app.get('/api/reports', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { startDate, endDate, staffId } = req.query;
      const user = req.user as any;
      
      const sDate = startDate ? new Date(startDate as string) : new Date(0);
      const eDate = endDate ? new Date(endDate as string) : new Date();
      
      // Staff can only see their own reports
      const targetStaffId = user.role === 'admin' ? (staffId as string) : user._id.toString();
      
      const report = await storage.getReportStats(targetStaffId, sDate, eDate);
      res.json(report);
    } catch (err) {
      console.error("[Report Error]", err);
      res.sendStatus(500);
    }
  });

  app.get(api.payments.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      const payments = await storage.getAllPayments(user.role === 'admin' ? undefined : user._id);
      res.json(payments);
    } catch (err) {
      console.error("[Payments List Error]", err);
      res.sendStatus(500);
    }
  });

  // Dashboard
  app.get(api.dashboard.summary.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      const stats = await storage.getDashboardStats(user._id);
      
      res.json({
        ...stats,
        yearlyBalance: stats.yearlyScheduled - stats.yearlyCollected,
        chartData: [
          { name: 'Monthly', amount: stats.monthlyCollected },
          { name: 'Weekly', amount: stats.weeklyCollected },
          { name: 'Yearly', amount: stats.yearlyCollected },
        ]
      });
    } catch (err) {
      console.error("[Dashboard Summary Error]", err);
      res.sendStatus(500);
    }
  });

  // Admin
  app.get(api.admin.summary.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      if (user.role !== 'admin') return res.sendStatus(403);
      
      const allStaff = await storage.getAllStaff();
      const summaries = await Promise.all(allStaff.map(async (s) => {
        const stats = await storage.getDashboardStats(s._id);
        return {
          staff: s,
          studentCount: stats.totalStudents,
          collectedThisMonth: stats.monthlyCollected,
          collectedThisYear: stats.yearlyCollected
        };
      }));
      
      res.json(summaries);
    } catch (err) {
      console.error("[Admin Summary Error]", err);
      res.sendStatus(500);
    }
  });

  app.post(api.admin.approveStaff.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      if (user.role !== 'admin') return res.sendStatus(403);
      
      await storage.approveStaff(req.params.id);
      res.sendStatus(200);
    } catch (err) {
      console.error("[Approve Staff Error]", err);
      res.sendStatus(500);
    }
  });

  app.patch(api.admin.updateStaff.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      if (user.role !== 'admin') return res.sendStatus(403);
      
      const input = api.admin.updateStaff.input.parse(req.body);
      const staff = await storage.updateStaff(req.params.id, input);
      res.json(staff);
    } catch (err) {
      console.error("[Update Staff Error]", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.sendStatus(500);
    }
  });

  app.delete(api.admin.deleteStaff.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      if (user.role !== 'admin') return res.sendStatus(403);
      
      await storage.deleteStaff(req.params.id);
      res.sendStatus(200);
    } catch (err) {
      console.error("[Delete Staff Error]", err);
      res.sendStatus(500);
    }
  });

  return httpServer;
}
