import { Admin } from "../modules/auth/admin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createHttpError } from "../utils/createHttpError.js";
import { verifyAccessToken } from "../utils/token.js";

export const requireAdminAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw createHttpError(401, "Missing bearer token");
  }

  const accessToken = authHeader.slice("Bearer ".length).trim();
  let payload;

  try {
    payload = verifyAccessToken(accessToken);
  } catch {
    throw createHttpError(401, "Invalid or expired access token");
  }

  const admin = await Admin.findById(payload.sub).select("-passwordHash");

  if (!admin || !admin.isActive) {
    throw createHttpError(401, "Admin account is unavailable");
  }

  req.admin = admin;
  next();
});
