import bcrypt from "bcryptjs";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createHttpError } from "../../utils/createHttpError.js";
import { RefreshToken } from "../auth/refresh-token.model.js";
import { getRefreshCookieOptions, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/token.js";
import { Customer } from "./customer.model.js";

function sanitizeCustomerSession(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    isRegistered: customer.isRegistered,
    status: customer.status,
    totalSpend: customer.totalSpend,
    orderCount: customer.orderCount,
    addresses: customer.addresses,
    lastLoginAt: customer.lastLoginAt,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

function resolveRefreshToken(req) {
  return req.cookies.customerRefreshToken || req.body.refreshToken || "";
}

export const registerCustomer = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const phone = String(req.body.phone || "").trim();
  const password = String(req.body.password || "");

  if (!name || !email || !phone || !password) {
    throw createHttpError(400, "Name, email, phone, and password are required");
  }

  if (password.length < 6) {
    throw createHttpError(400, "Password must be at least 6 characters");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw createHttpError(400, "Email is not valid");
  }

  let customer = await Customer.findOne({
    $or: [{ email }, { phone }],
  });

  if (customer?.isRegistered) {
    throw createHttpError(409, "Customer account already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (customer) {
    customer.name = name;
    customer.email = email;
    customer.phone = phone;
    customer.passwordHash = passwordHash;
    customer.isRegistered = true;
    customer.status = customer.status === "inactive" ? "active" : customer.status;
    await customer.save();
  } else {
    customer = await Customer.create({
      name,
      email,
      phone,
      passwordHash,
      isRegistered: true,
      status: "active",
      addresses: [],
    });
  }

  customer.lastLoginAt = new Date();
  await customer.save();

  const accessToken = signAccessToken(customer, "customer");
  const refresh = signRefreshToken(customer, "customer");

  await RefreshToken.create({
    customerId: customer._id,
    token: refresh.token,
    expiresAt: refresh.expiresAt,
  });

  res.cookie("customerRefreshToken", refresh.token, getRefreshCookieOptions());

  res.status(201).json({
    success: true,
    message: "Customer registration successful",
    data: {
      customer: sanitizeCustomerSession(customer),
      accessToken,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
    },
  });
});

export const loginCustomer = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    throw createHttpError(400, "Email and password are required");
  }

  const customer = await Customer.findOne({ email });

  if (!customer || !customer.isRegistered || !customer.passwordHash) {
    throw createHttpError(401, "Invalid customer credentials");
  }

  const isValid = await bcrypt.compare(password, customer.passwordHash);
  if (!isValid) {
    throw createHttpError(401, "Invalid customer credentials");
  }

  customer.lastLoginAt = new Date();
  await customer.save();

  const accessToken = signAccessToken(customer, "customer");
  const refresh = signRefreshToken(customer, "customer");

  await RefreshToken.create({
    customerId: customer._id,
    token: refresh.token,
    expiresAt: refresh.expiresAt,
  });

  res.cookie("customerRefreshToken", refresh.token, getRefreshCookieOptions());

  res.json({
    success: true,
    message: "Customer login successful",
    data: {
      customer: sanitizeCustomerSession(customer),
      accessToken,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
    },
  });
});

export const getCurrentCustomer = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Current customer fetched successfully",
    data: sanitizeCustomerSession(req.customer),
  });
});

export const refreshCustomer = asyncHandler(async (req, res) => {
  const refreshToken = resolveRefreshToken(req);

  if (!refreshToken) {
    throw createHttpError(401, "Refresh token is required");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw createHttpError(401, "Invalid or expired refresh token");
  }

  if (payload.aud !== "customer") {
    throw createHttpError(401, "Invalid customer refresh token");
  }

  const tokenRecord = await RefreshToken.findOne({
    token: refreshToken,
    customerId: { $ne: null },
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenRecord) {
    throw createHttpError(401, "Refresh token is unavailable");
  }

  const customer = await Customer.findById(payload.sub);

  if (!customer || !customer.isRegistered || customer.status === "inactive") {
    throw createHttpError(401, "Customer account is unavailable");
  }

  res.json({
    success: true,
    message: "Customer access token refreshed successfully",
    data: {
      customer: sanitizeCustomerSession(customer),
      accessToken: signAccessToken(customer, "customer"),
    },
  });
});

export const logoutCustomer = asyncHandler(async (req, res) => {
  const refreshToken = resolveRefreshToken(req);

  if (refreshToken) {
    await RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
  }

  res.clearCookie("customerRefreshToken", getRefreshCookieOptions());
  res.json({
    success: true,
    message: "Customer logout successful",
    data: null,
  });
});
