import type { AuthPayload } from "./auth.types";

const CUSTOMER_AUTH_STORAGE_KEY = "cybershop_customer_auth";
const AUTH_EVENT_NAME = "cybershop:auth-change";

type StoredAuth = {
  customer: AuthPayload["customer"];
  accessToken: string;
};

function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME));
  }
}

export function getCustomerAuthEventName() {
  return AUTH_EVENT_NAME;
}

export function getStoredCustomerAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CUSTOMER_AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function getStoredCustomer() {
  return getStoredCustomerAuth()?.customer || null;
}

export function getCustomerAccessToken() {
  return getStoredCustomerAuth()?.accessToken || "";
}

export function setStoredCustomerAuth(payload: StoredAuth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMER_AUTH_STORAGE_KEY, JSON.stringify(payload));
  emitAuthChange();
}

export function patchStoredCustomerAuth(payload: Partial<StoredAuth>) {
  const current = getStoredCustomerAuth();
  if (!current) return;

  setStoredCustomerAuth({
    customer: payload.customer || current.customer,
    accessToken: payload.accessToken || current.accessToken,
  });
}

export function clearStoredCustomerAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
  emitAuthChange();
}
