import { ArrowRight, LockKeyhole, UserCircle2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  isBlank,
  isValidEmail,
  isValidPhone,
  type ValidationErrors,
} from "@shared/validation/forms";
import { useAuth } from "./auth.context";

type AuthMode = "sign-in" | "sign-up";

type FieldProps = {
  label: string;
  type?: string;
  value: string;
  placeholder: string;
  autoComplete?: string;
  error?: string;
  onChange: (value: string) => void;
};

function Field({
  label,
  type = "text",
  value,
  placeholder,
  autoComplete,
  error,
  onChange,
}: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-(--text-tertiary)">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${label}-error` : undefined}
        spellCheck={false}
        className={[
          "w-full rounded-[1.65rem] border bg-white/95 px-5 py-4 text-[1.05rem] leading-7 text-(--text-primary) shadow-[0_10px_28px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-(--text-tertiary) hover:border-black/12 focus:border-[rgba(0,113,227,0.26)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.08)]",
          error ? "border-rose-300 bg-rose-50/70" : "border-black/8",
        ].join(" ")}
        style={{
          color: "var(--text-primary)",
          WebkitTextFillColor: "var(--text-primary)",
          caretColor: "var(--text-primary)",
        }}
      />
      {error ? (
        <span id={`${label}-error`} className="text-sm text-rose-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function validateSignInForm(email: string, password: string): ValidationErrors {
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

function validateSignUpForm(
  name: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string
): ValidationErrors {
  const errors = validateSignInForm(email, password);

  if (isBlank(name)) {
    errors.name = "Full name is required.";
  }

  if (isBlank(phone)) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!isBlank(password) && password.trim().length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (isBlank(confirmPassword)) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Password confirmation does not match.";
  }

  return errors;
}

export default function AuthExperience({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isBootstrapping, signIn, signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const redirectTarget = useMemo(() => searchParams.get("redirect") || "/home", [searchParams]);
  const registered = searchParams.get("registered") === "1";
  const isSignUp = mode === "sign-up";

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, isBootstrapping, navigate, redirectTarget]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const nextErrors = isSignUp
      ? validateSignUpForm(name, email, phone, password, confirmPassword)
      : validateSignInForm(email, password);

    setFieldErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);

    try {
      if (isSignUp) {
        await signUp({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
        const nextParams = new URLSearchParams();
        nextParams.set("registered", "1");
        const redirect = searchParams.get("redirect");
        if (redirect) {
          nextParams.set("redirect", redirect);
        }
        navigate(`/sign-in?${nextParams.toString()}`, { replace: true });
        return;
      }

      await signIn({ email: email.trim(), password });
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to continue right now.";
      const axiosMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(axiosMessage || message);
    } finally {
      setSubmitting(false);
    }
  }

  function hasErrors(errors: ValidationErrors) {
    return Object.values(errors).some(Boolean);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-(--bg-base) text-(--text-primary)">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(143,185,255,0.18),transparent_30%),radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.82),transparent_24%),radial-gradient(circle_at_80%_74%,rgba(143,185,255,0.1),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_66%)]" />
      <div className="absolute inset-y-0 left-1/2 hidden w-px bg-[linear-gradient(180deg,transparent,rgba(17,24,39,0.08),transparent)] lg:block" />

      <div className="cy-shell relative flex min-h-screen flex-col justify-center py-8 lg:grid lg:grid-cols-[minmax(0,460px)_minmax(0,560px)] lg:justify-center lg:gap-10">
        <div className={["flex items-center", isSignUp ? "lg:order-2" : ""].join(" ")}>
          <div className="relative w-full max-w-[480px] overflow-hidden rounded-[36px] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,248,252,0.88))] px-7 py-9 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10 lg:min-h-[660px] lg:justify-self-end lg:px-8 lg:py-10">
            <div className="absolute left-[-8%] top-[-8%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle_at_center,rgba(143,185,255,0.22),rgba(143,185,255,0)_70%)]" />
            <div className="absolute bottom-[-16%] right-[-10%] h-[280px] w-[280px] rounded-full border border-black/5" />

            <div className="relative flex h-full flex-col justify-between gap-14">
              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-black/6 bg-white/82 px-4 py-2 text-sm text-(--text-secondary) shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <LockKeyhole className="h-4 w-4 text-(--accent)" />
                Customer access
              </div>

              <div className="max-w-[320px] space-y-5">
                <p className="text-xs uppercase tracking-[0.3em] text-(--text-tertiary)">Cyber account</p>
                <div className="space-y-3">
                  <h1 className="text-[2.5rem] font-semibold leading-none tracking-[-0.08em] text-(--text-primary) sm:text-[3.3rem]">
                    {isSignUp ? "Join the" : "Continue to"}
                  </h1>
                  <Link
                    to="/home"
                    className="inline-flex items-center gap-3 text-[2.8rem] font-semibold tracking-[-0.1em] text-(--text-primary) transition hover:translate-x-1 sm:text-[3.8rem]"
                  >
                    Cyber store
                    <ArrowRight className="h-7 w-7 text-(--accent) sm:h-9 sm:w-9" />
                  </Link>
                </div>
                <p className="max-w-[320px] text-[0.98rem] leading-8 text-(--text-secondary)">
                  {isSignUp
                    ? "Create a customer account to keep your saved products, preserve the cart, and move through checkout without losing momentum."
                    : "Sign in to restore your wishlist, saved addresses, and active purchase flow across the storefront."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon={<UserCircle2 className="h-5 w-5" />}
                  title="Guest browsing"
                  copy="Explore the catalog and product detail pages without opening an account."
                />
                <FeatureCard
                  icon={<LockKeyhole className="h-5 w-5" />}
                  title="Member checkout"
                  copy="Unlock cart, saved addresses, order tracking, and payment continuity after sign in."
                />
              </div>
            </div>
          </div>
        </div>

        <div className={["flex items-center", isSignUp ? "lg:order-1" : ""].join(" ")}>
          <div className="cy-panel w-full p-7 sm:p-9">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-(--text-tertiary)">
                {isSignUp ? "Create account" : "Sign in"}
              </p>
              <h2 className="text-[2.3rem] font-semibold tracking-[-0.07em] text-(--text-primary) sm:text-[3rem]">
                {isSignUp ? "Become a customer" : "Continue to your account"}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-(--text-secondary)">
                {isSignUp
                  ? "Register once to keep your saved products, cart, and future orders in one place."
                  : "Use your account to continue with wishlist, cart, and checkout."}
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {!isSignUp && registered ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Account created successfully. Sign in to continue.
                </p>
              ) : null}

              {isSignUp ? (
                <Field
                  label="Full name"
                  value={name}
                  onChange={(value) => {
                    setName(value);
                    setFieldErrors((current) => ({ ...current, name: "" }));
                  }}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  error={fieldErrors.name}
                />
              ) : null}
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  setFieldErrors((current) => ({ ...current, email: "" }));
                }}
                placeholder="you@example.com"
                autoComplete="email"
                error={fieldErrors.email}
              />
              {isSignUp ? (
                <Field
                  label="Phone"
                  value={phone}
                  onChange={(value) => {
                    setPhone(value);
                    setFieldErrors((current) => ({ ...current, phone: "" }));
                  }}
                  placeholder="Your phone number"
                  autoComplete="tel"
                  error={fieldErrors.phone}
                />
              ) : null}
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setFieldErrors((current) => ({ ...current, password: "" }));
                }}
                placeholder="Enter your password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                error={fieldErrors.password}
              />
              {isSignUp ? (
                <Field
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={(value) => {
                    setConfirmPassword(value);
                    setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
                  }}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  error={fieldErrors.confirmPassword}
                />
              ) : null}

              {error ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-(--text-primary) px-6 text-base font-semibold text-white shadow-[0_14px_32px_rgba(29,29,31,0.18)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={isSignUp ? "Create customer account" : "Sign in"}
                aria-busy={submitting}
                style={{
                  color: "#ffffff",
                  WebkitTextFillColor: "#ffffff",
                }}
              >
                {submitting
                  ? isSignUp
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUp
                    ? "Create customer account"
                    : "Sign in"}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 rounded-[28px] border border-black/6 bg-white/78 p-5 text-sm text-(--text-secondary) shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
              <div>{isSignUp ? "Already registered?" : "No customer account yet?"}</div>
              <Link
                to={isSignUp ? `/sign-in${searchParams.toString() ? `?${searchParams.toString()}` : ""}` : `/sign-up${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
                className="font-semibold text-(--text-primary) transition hover:text-(--accent)"
              >
                {isSignUp ? "Sign in here" : "Create one now"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-[24px] border border-black/6 bg-white/84 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm">
      <div className="inline-flex rounded-full border border-[rgba(143,185,255,0.24)] bg-[rgba(143,185,255,0.12)] p-2 text-(--accent)">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.04em] text-(--text-primary)">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{copy}</p>
    </div>
  );
}
