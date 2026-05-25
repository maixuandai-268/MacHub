import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sharedImagesDir = path.resolve(__dirname, "../../../shared/assets/images");
const uploadsDir = path.resolve(__dirname, "../uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const allowedOrigins = new Set(
  [
    process.env.CLIENT_USER_URL,
    process.env.CLIENT_ADMIN_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ].filter(Boolean)
);

const allowedVercelProjectPrefixes = [
  process.env.CLIENT_USER_URL,
  process.env.CLIENT_ADMIN_URL,
]
  .map((value) => {
    try {
      const url = new URL(value);
      return url.hostname.endsWith(".vercel.app") ? url.hostname.replace(/\.vercel\.app$/, "") : "";
    } catch {
      return "";
    }
  })
  .filter(Boolean);

function isAllowedLocalOrigin(origin) {
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function isAllowedVercelPreviewOrigin(origin) {
  try {
    const url = new URL(origin);

    if (url.protocol !== "https:" || !url.hostname.endsWith(".vercel.app")) {
      return false;
    }

    return allowedVercelProjectPrefixes.some(
      (prefix) =>
        url.hostname === `${prefix}.vercel.app` ||
        url.hostname.startsWith(`${prefix}-`)
    );
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.has(origin) ||
        isAllowedLocalOrigin(origin) ||
        isAllowedVercelPreviewOrigin(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));
app.use("/assets/images", express.static(sharedImagesDir));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "CyberShop API is running",
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
