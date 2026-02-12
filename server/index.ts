import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { connectDB } from "./db";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const sourceColor = source === "express" ? "\x1b[36m" : "\x1b[32m";
  const reset = "\x1b[0m";
  const timeColor = "\x1b[90m";

  console.log(`${timeColor}${formattedTime}${reset} [${sourceColor}${source}${reset}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const statusColor = res.statusCode >= 400 ? "\x1b[31m" : res.statusCode >= 300 ? "\x1b[33m" : "\x1b[32m";
      const methodColor = "\x1b[35m";
      const reset = "\x1b[0m";

      let logLine = `${methodColor}${req.method}${reset} ${path} ${statusColor}${res.statusCode}${reset} in ${duration}ms`;
      
      if (capturedJsonResponse) {
        const jsonStr = JSON.stringify(capturedJsonResponse);
        const truncated = jsonStr.length > 200 ? jsonStr.substring(0, 200) + "..." : jsonStr;
        logLine += ` :: \x1b[90m${truncated}\x1b[0m`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect to database. Server will continue but DB operations may fail.");
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
