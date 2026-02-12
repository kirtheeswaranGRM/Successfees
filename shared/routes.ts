import { z } from 'zod';
import { 
  insertCategorySchema, 
  insertStudentSchema, 
  insertPaymentSchema,
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.any(),
        401: errorSchemas.unauthorized,
      },
    },
    google: {
      method: 'GET' as const,
      path: '/api/auth/google' as const,
    },
    googleCallback: {
      method: 'GET' as const,
      path: '/api/auth/google/callback' as const,
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.any(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
  },
  students: {
    list: {
      method: 'GET' as const,
      path: '/api/students' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/students/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/students' as const,
      input: insertStudentSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/students/:id' as const,
      input: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        subjects: z.string().optional(),
        totalFees: z.number().optional(),
        balance: z.number().optional(),
      }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/students/:id' as const,
      responses: {
        200: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  payments: {
    create: {
      method: 'POST' as const,
      path: '/api/payments' as const,
      input: insertPaymentSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/payments' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
  },
  dashboard: {
    summary: {
      method: 'GET' as const,
      path: '/api/dashboard/summary' as const,
      responses: {
        200: z.object({
          totalStudents: z.number(),
          totalCollected: z.number(),
          totalBalance: z.number(),
          monthlyCollected: z.number(),
          weeklyCollected: z.number(),
          yearlyScheduled: z.number(),
          yearlyCollected: z.number(),
          yearlyBalance: z.number(),
          newJoinsThisMonth: z.number(),
          paidStudents: z.number(),
          remainingStudents: z.number(),
          categoryStats: z.array(z.object({
            categoryName: z.string(),
            studentCount: z.number(),
            totalFees: z.number(),
            totalBalance: z.number(),
            totalCollected: z.number(),
          })).optional(),
          chartData: z.array(z.object({
            name: z.string(),
            amount: z.number(),
          })),
        }),
      },
    },
    reports: {
      method: 'GET' as const,
      path: '/api/reports' as const,
      responses: {
        200: z.any(),
      },
    },
  },
  admin: {
    summary: {
      method: 'GET' as const,
      path: '/api/admin/staff-summary' as const,
      responses: {
        200: z.array(z.any()),
        403: errorSchemas.unauthorized,
      },
    },
    approveStaff: {
      method: 'POST' as const,
      path: '/api/admin/approve-staff/:id' as const,
      responses: {
        200: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
    updateStaff: {
      method: 'PATCH' as const,
      path: '/api/admin/staff/:id' as const,
      input: z.object({
        name: z.string().optional(),
        subject: z.string().optional(),
        isApproved: z.boolean().optional(),
      }),
      responses: {
        200: z.any(),
        403: errorSchemas.unauthorized,
      },
    },
    deleteStaff: {
      method: 'DELETE' as const,
      path: '/api/admin/staff/:id' as const,
      responses: {
        200: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
    resetPassword: {
      method: 'POST' as const,
      path: '/api/admin/reset-password' as const,
      input: z.object({
        password: z.string().min(6),
      }),
      responses: {
        200: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
    clearDatabase: {
      method: 'POST' as const,
      path: '/api/admin/clear-database' as const,
      input: z.object({
        password: z.string(),
      }),
      responses: {
        200: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
