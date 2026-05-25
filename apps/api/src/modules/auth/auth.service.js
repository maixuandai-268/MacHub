import bcrypt from "bcryptjs";
import { Admin } from "./admin.model.js";
import { RefreshToken } from "./refresh-token.model.js";
import { createHttpError } from "../../utils/createHttpError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/token.js";

export function sanitizeAdmin(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

export async function loginAdminWithEmail(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const rawPassword = String(password || "");

  if (!normalizedEmail || !rawPassword) {
    throw createHttpError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email: normalizedEmail });

  if (!admin || !admin.isActive) {
    throw createHttpError(401, "Invalid admin credentials");
  }

  const isPasswordValid = await bcrypt.compare(rawPassword, admin.passwordHash);

  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid admin credentials");
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const accessToken = signAccessToken(admin);
  const refresh = signRefreshToken(admin);

  await RefreshToken.create({
    adminId: admin._id,
    token: refresh.token,
    expiresAt: refresh.expiresAt,
  });

  return {
    admin: sanitizeAdmin(admin),
    accessToken,
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt,
  };
}

export async function refreshAdminSession(refreshToken) {
  if (!refreshToken) {
    throw createHttpError(401, "Refresh token is required");
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw createHttpError(401, "Invalid or expired refresh token");
  }

  const tokenRecord = await RefreshToken.findOne({
    token: refreshToken,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenRecord) {
    throw createHttpError(401, "Refresh token is unavailable");
  }

  const admin = await Admin.findById(payload.sub);

  if (!admin || !admin.isActive) {
    throw createHttpError(401, "Admin account is unavailable");
  }

  const accessToken = signAccessToken(admin);

  return {
    admin: sanitizeAdmin(admin),
    accessToken,
  };
}

export async function logoutAdminSession(refreshToken) {
  if (!refreshToken) {
    return;
  }

  await RefreshToken.findOneAndUpdate(
    { token: refreshToken },
    { isRevoked: true }
  );
}
