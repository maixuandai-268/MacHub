export type ValidationErrors = Record<string, string>;

export function isBlank(value: string | null | undefined) {
  return !String(value || "").trim();
}

export function hasValidationErrors(errors: ValidationErrors) {
  return Object.values(errors).some(Boolean);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isValidPhone(value: string) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || "").trim());
}

export function isNonNegativeInteger(value: string) {
  return /^\d+$/.test(String(value || "").trim());
}

export function isNonNegativeNumber(value: string) {
  if (isBlank(value)) {
    return false;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}
