import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import {
  isBlank,
  isValidEmail,
  type ValidationErrors,
} from "@shared/validation/forms";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginAdmin } from "../auth.api";

function validateAdminLogin(email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(email)) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (isBlank(password)) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@cybershop.com");
  const [password, setPassword] = useState("Admin@123456");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const nextErrors = validateAdminLogin(email, password);
    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSubmitting(true);

    try {
      await loginAdmin({ email, password });
      const nextPath = (location.state as { from?: string } | null)?.from || "/admin/dashboard";
      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError("Login failed. Check the admin credentials and API server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f8fafc,#f8fafc_45%,#e2e8f0)] px-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">CyberShop</p>
            <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((current) => ({ ...current, email: "" }));
                setError("");
              }}
              aria-invalid={Boolean(fieldErrors.email)}
              className={fieldErrors.email ? "border-red-300 bg-red-50/70 focus:border-red-500 focus:ring-red-100" : ""}
            />
            {fieldErrors.email ? <p className="text-sm text-red-600">{fieldErrors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((current) => ({ ...current, password: "" }));
                setError("");
              }}
              aria-invalid={Boolean(fieldErrors.password)}
              className={fieldErrors.password ? "border-red-300 bg-red-50/70 focus:border-red-500 focus:ring-red-100" : ""}
            />
            {fieldErrors.password ? <p className="text-sm text-red-600">{fieldErrors.password}</p> : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in to Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}
