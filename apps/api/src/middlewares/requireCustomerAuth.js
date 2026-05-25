import { Customer } from "../modules/customers/customer.model.js";
import { createHttpError } from "../utils/createHttpError.js";
import { verifyAccessToken } from "../utils/token.js";

export async function requireCustomerAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Customer authentication is required");
    }

    const accessToken = authHeader.slice("Bearer ".length).trim();
    let payload;

    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      throw createHttpError(401, "Invalid or expired access token");
    }

    if (payload.aud !== "customer") {
      throw createHttpError(401, "Invalid customer token");
    }

    const customer = await Customer.findById(payload.sub);

    if (!customer || !customer.isRegistered || customer.status === "inactive") {
      throw createHttpError(401, "Customer account is unavailable");
    }

    req.customer = customer;
    next();
  } catch (error) {
    next(error);
  }
}
