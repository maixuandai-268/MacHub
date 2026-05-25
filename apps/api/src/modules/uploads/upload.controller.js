import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { createHttpError } from "../../utils/createHttpError.js";
import { isCloudinaryConfigured, uploadBufferToCloudinary } from "../../utils/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRootDir = path.resolve(__dirname, "../../../uploads");
const allowedScopes = new Set(["products", "categories", "blog"]);
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

function sanitizeSegment(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveUploadScope(scope) {
  const normalizedScope = sanitizeSegment(scope) || "products";

  if (!allowedScopes.has(normalizedScope)) {
    throw createHttpError(400, "Unsupported upload scope");
  }

  return normalizedScope;
}

function buildFilename(originalname) {
  const extension = path.extname(originalname || "").toLowerCase() || ".png";
  const basename = sanitizeSegment(path.basename(originalname || "image", extension)) || "image";

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${basename}${extension}`;
}

const storage = multer.diskStorage({
  destination(req, _file, callback) {
    try {
      const scope = resolveUploadScope(req.query.scope);
      const targetDir = path.join(uploadsRootDir, scope);
      fs.mkdirSync(targetDir, { recursive: true });
      callback(null, targetDir);
    } catch (error) {
      callback(error);
    }
  },
  filename(_req, file, callback) {
    callback(null, buildFilename(file.originalname));
  },
});

const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: isCloudinaryConfigured() ? memoryStorage : storage,
  limits: {
    fileSize: 6 * 1024 * 1024,
    files: 8,
  },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(createHttpError(400, "Only image uploads are supported"));
      return;
    }

    callback(null, true);
  },
});

function mapUploadedFile(scope, file) {
  return {
    url: `/uploads/${scope}/${file.filename}`,
    alt: "",
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
  };
}

export function uploadAdminImages(req, res, next) {
  upload.array("files", 8)(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        next(createHttpError(400, error.message));
        return;
      }

      next(error);
      return;
    }

    next();
  });
}

export async function createAdminUploadResponse(req, res) {
  const scope = resolveUploadScope(req.query.scope);
  const files = Array.isArray(req.files) ? req.files : [];

  if (!files.length) {
    throw createHttpError(400, "At least one image file is required");
  }

  const uploadedFiles = isCloudinaryConfigured()
    ? await Promise.all(
        files.map((file) =>
          uploadBufferToCloudinary({
            buffer: file.buffer,
            mimeType: file.mimetype,
            originalname: file.originalname,
            scope,
          })
        )
      )
    : files.map((file) => mapUploadedFile(scope, file));

  res.status(201).json({
    success: true,
    message: "Images uploaded successfully",
    data: uploadedFiles,
  });
}
