import { asyncHandler } from "../../utils/asyncHandler.js";
import { getRefreshCookieOptions } from "../../utils/token.js";
import {
  loginAdminWithEmail,
  logoutAdminSession,
  refreshAdminSession,
  sanitizeAdmin,
} from "./auth.service.js";

function resolveRefreshToken(req) {
  return req.cookies.refreshToken || req.body.refreshToken || "";
}

export const loginAdmin = asyncHandler(async (req, res) => {
  const session = await loginAdminWithEmail(req.body.email, req.body.password);

  res.cookie(
    "refreshToken",
    session.refreshToken,
    getRefreshCookieOptions()
  );

  res.json({
    success: true,
    message: "Admin login successful",
    data: {
      admin: session.admin,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      refreshTokenExpiresAt: session.refreshTokenExpiresAt,
    },
  });
});

export const getCurrentAdmin = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Current admin fetched successfully",
    data: sanitizeAdmin(req.admin),
  });
});

export const refreshAdmin = asyncHandler(async (req, res) => {
  const session = await refreshAdminSession(resolveRefreshToken(req));

  res.json({
    success: true,
    message: "Access token refreshed successfully",
    data: session,
  });
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  await logoutAdminSession(resolveRefreshToken(req));
  res.clearCookie("refreshToken", getRefreshCookieOptions());

  res.json({
    success: true,
    message: "Admin logout successful",
    data: null,
  });
});
