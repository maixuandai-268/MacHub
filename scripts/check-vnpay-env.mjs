import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const apiEnvPath = path.join(rootDir, "apps", "api", ".env");
const userEnvPath = path.join(rootDir, "apps", "user", ".env");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function isConfigured(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return false;
  }

  return ![
    "replace_me",
    "replace_me_too",
    "https://your-public-https-api",
    "your_sandbox_tmn_code",
    "your_sandbox_hash_secret",
  ].includes(normalized);
}

function printMissing(prefix, keys, env) {
  const missing = keys.filter((key) => !isConfigured(env?.[key]));

  if (missing.length === 0) {
    console.log(`${prefix}: OK`);
    return true;
  }

  console.log(`${prefix}: missing -> ${missing.join(", ")}`);
  return false;
}

const apiEnv = readEnvFile(apiEnvPath);
const userEnv = readEnvFile(userEnvPath);

if (!apiEnv) {
  console.error(`Missing ${apiEnvPath}`);
  process.exit(1);
}

if (!userEnv) {
  console.error(`Missing ${userEnvPath}`);
  process.exit(1);
}

printSection("VNPay Local Env Check");

const apiRequired = [
  "PORT",
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "API_PUBLIC_URL",
  "CLIENT_USER_URL",
  "VNPAY_TMN_CODE",
  "VNPAY_HASH_SECRET",
];

const userRequired = ["VITE_API_URL"];

const apiOk = printMissing("apps/api/.env", apiRequired, apiEnv);
const userOk = printMissing("apps/user/.env", userRequired, userEnv);

const apiPublicUrl = String(apiEnv.API_PUBLIC_URL || "").replace(/\/+$/, "");
const clientUserUrl = String(apiEnv.CLIENT_USER_URL || "").replace(/\/+$/, "");

printSection("Derived Callback URLs");
console.log(
  `Return URL: ${apiEnv.VNPAY_RETURN_URL || (apiPublicUrl ? `${apiPublicUrl}/api/payments/vnpay/return` : "[cannot derive]")}`
);
console.log(
  `IPN URL: ${apiEnv.VNPAY_IPN_URL || (apiPublicUrl ? `${apiPublicUrl}/api/payments/vnpay/ipn` : "[cannot derive]")}`
);
console.log(
  `Frontend result URL: ${
    apiEnv.VNPAY_FRONTEND_RETURN_URL ||
    (clientUserUrl ? `${clientUserUrl}/checkout/payment/result` : "[cannot derive]")
  }`
);

printSection("Run Checklist");
console.log("1. Make sure MongoDB is running.");
console.log("2. Make sure API_PUBLIC_URL is a public HTTPS URL.");
console.log("3. Restart the API after changing .env values.");
console.log("4. Run seed data before testing checkout.");

if (!apiOk || !userOk) {
  process.exit(1);
}

console.log("\nReady to run.");
