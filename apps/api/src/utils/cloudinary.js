import crypto from "crypto";
import path from "path";

function normalizeSegment(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCloudinaryConfig() {
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();
  const folderRoot = normalizeSegment(process.env.CLOUDINARY_UPLOAD_FOLDER || "cybershop");

  return {
    cloudName,
    apiKey,
    apiSecret,
    folderRoot,
  };
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return Boolean(cloudName && apiKey && apiSecret);
}

function buildFolder(scope) {
  const { folderRoot } = getCloudinaryConfig();
  const normalizedScope = normalizeSegment(scope) || "products";
  return [folderRoot, normalizedScope].filter(Boolean).join("/");
}

function buildSignature(params, apiSecret) {
  const serializedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${serializedParams}${apiSecret}`).digest("hex");
}

export async function uploadBufferToCloudinary({ buffer, mimeType, originalname, scope }) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = buildFolder(scope);
  const signature = buildSignature({ folder, timestamp }, apiSecret);
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const extension = path.extname(originalname || "").toLowerCase() || ".png";
  const formData = new FormData();

  formData.append(
    "file",
    new Blob([buffer], { type: mimeType || "application/octet-stream" }),
    originalname || `image${extension}`
  );
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Cloudinary upload failed");
  }

  return {
    url: payload.secure_url,
    alt: "",
    filename: `${payload.public_id?.split("/").pop() || payload.original_filename || "image"}.${
      payload.format || extension.replace(/^\./, "")
    }`,
    mimeType,
    size: payload.bytes,
    publicId: payload.public_id,
  };
}
