import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { generalLimiter } from "./middleware/rate-limiter";
import { v1Router } from "./routes/v1";

const app = express();

// ── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [env.WEB_URL, "http://localhost:3000", "http://localhost:8081"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ── Logging ─────────────────────────────────────────────────
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
}

// ── Compression ─────────────────────────────────────────────
app.use(compression());

// ── Rate Limiting ───────────────────────────────────────────
app.use("/api/", generalLimiter);

// ── Health Check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      service: "D-Chemistry API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
  });
});

// ── API Routes ──────────────────────────────────────────────
app.use("/api/v1", v1Router);

// ── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ── Error Handler ───────────────────────────────────────────
app.use(errorHandler);

export { app };
