import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { MemStorage } from "./storage";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize in-memory storage
const storage = new MemStorage();

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (body: any) {
    capturedJsonResponse = body;
    return originalResJson.call(res, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Register API routes with in-memory storage
const server = registerRoutes(app, storage);

// Setup Vite in development
if (process.env.NODE_ENV !== "production") {
  setupVite(app, server);
} else {
  serveStatic(app);
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
  log(`Server running on port ${port}`);
});
