import crypto from "crypto";
import { createHttpError } from "../../utils/createHttpError.js";

const DEFAULT_PAYMENT_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const DEFAULT_ORDER_TYPE = "other";
const DEFAULT_LOCALE = "vn";
const DEFAULT_EXPIRE_MINUTES = 15;

function trimTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function encodeVnpComponent(value) {
  return encodeURIComponent(String(value))
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");
}

function buildEncodedPairs(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => [encodeVnpComponent(key), encodeVnpComponent(value)]);
}

function buildEncodedQuery(params) {
  return buildEncodedPairs(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function buildHmac(hashSecret, payload) {
  return crypto.createHmac("sha512", hashSecret).update(Buffer.from(payload, "utf-8")).digest("hex");
}

export function getVnpayConfig() {
  const apiPublicUrl = trimTrailingSlash(process.env.API_PUBLIC_URL);
  const clientUserUrl = trimTrailingSlash(process.env.CLIENT_USER_URL);
  const paymentUrl = String(process.env.VNPAY_PAYMENT_URL || DEFAULT_PAYMENT_URL).trim();
  const tmnCode = String(process.env.VNPAY_TMN_CODE || "").trim();
  const hashSecret = String(process.env.VNPAY_HASH_SECRET || "").trim();
  const returnUrl = String(process.env.VNPAY_RETURN_URL || (apiPublicUrl ? `${apiPublicUrl}/api/payments/vnpay/return` : "")).trim();
  const ipnUrl = String(process.env.VNPAY_IPN_URL || (apiPublicUrl ? `${apiPublicUrl}/api/payments/vnpay/ipn` : "")).trim();
  const frontendReturnUrl = String(process.env.VNPAY_FRONTEND_RETURN_URL || (clientUserUrl ? `${clientUserUrl}/checkout/payment/result` : "")).trim();
  const orderType = String(process.env.VNPAY_ORDER_TYPE || DEFAULT_ORDER_TYPE).trim();
  const locale = String(process.env.VNPAY_LOCALE || DEFAULT_LOCALE).trim();
  const expireMinutes = Number(process.env.VNPAY_EXPIRE_MINUTES || DEFAULT_EXPIRE_MINUTES);

  if (!tmnCode || !hashSecret || !paymentUrl || !returnUrl || !ipnUrl || !frontendReturnUrl) {
    throw createHttpError(
      500,
      "VNPay configuration is incomplete. Check VNPAY_TMN_CODE, VNPAY_HASH_SECRET, API_PUBLIC_URL, and CLIENT_USER_URL."
    );
  }

  return {
    tmnCode,
    hashSecret,
    paymentUrl,
    returnUrl,
    ipnUrl,
    frontendReturnUrl,
    orderType,
    locale,
    expireMinutes: Number.isFinite(expireMinutes) && expireMinutes > 0 ? expireMinutes : DEFAULT_EXPIRE_MINUTES,
  };
}

export function formatVnpDate(date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}

export function getClientIp(req) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const rawIp =
    forwardedFor ||
    req.ip ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "";

  return rawIp.replace(/^::ffff:/, "") || "127.0.0.1";
}

export function buildVnpayPaymentUrl(baseUrl, hashSecret, params) {
  const query = buildEncodedQuery(params);
  const secureHash = buildHmac(hashSecret, query);
  return `${baseUrl}?${query}&vnp_SecureHash=${secureHash}`;
}

export function verifyVnpaySignature(query, hashSecret) {
  const params = {};

  for (const [key, value] of Object.entries(query || {})) {
    if (!key.startsWith("vnp_")) {
      continue;
    }

    params[key] = Array.isArray(value) ? value[0] : String(value || "");
  }

  const receivedSecureHash = params.vnp_SecureHash || "";
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const signData = buildEncodedQuery(params);
  const expectedSecureHash = buildHmac(hashSecret, signData);

  return {
    params,
    receivedSecureHash,
    expectedSecureHash,
    isValid: Boolean(receivedSecureHash) && receivedSecureHash === expectedSecureHash,
  };
}

export function buildFrontendResultUrl(baseUrl, query) {
  const url = new URL(baseUrl);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

export function normalizeOrderInfo(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);
}
