import jwt from "jsonwebtoken";
import { createHttpError } from "./createHttpError.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getJwtSecret(name) {
  const secret = process.env[name];

  if (!secret) {
    throw createHttpError(500, `Missing ${name}`);
  }

  return secret;
}

export function signAccessToken(subject, audience = "admin") {
  return jwt.sign(
    {
      sub: subject.id,
      email: subject.email,
      role: subject.role || "customer",
      type: "access",
      aud: audience,
    },
    getJwtSecret("JWT_ACCESS_SECRET"),
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

export function signRefreshToken(subject, audience = "admin") {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  const token = jwt.sign(
    {
      sub: subject.id,
      type: "refresh",
      aud: audience,
    },
    getJwtSecret("JWT_REFRESH_SECRET"),
    { expiresIn: Math.floor(REFRESH_TOKEN_TTL_MS / 1000) }
  );

  return {
    token,
    expiresAt,
  };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret("JWT_ACCESS_SECRET"));
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, getJwtSecret("JWT_REFRESH_SECRET"));
}

export function getRefreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: REFRESH_TOKEN_TTL_MS,
  };
}
