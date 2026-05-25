import { Clock3, Headphones, Mail, MessageSquareText, PhoneCall, Send } from "lucide-react";
import { useState } from "react";
import {
  isBlank,
  isValidEmail,
  type ValidationErrors,
} from "@shared/validation/forms";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { submitContactInquiry } from "@/features/contact/contact.service";

const supportPaths = [
  {
    icon: MessageSquareText,
    title: "Product help",
    value: "Fast comparison guidance",
    copy: "Use this when someone is choosing between Mac, iPhone, iPad, Watch, Vision, or AirPods.",
  },
  {
    icon: Mail,
    title: "Order support",
    value: "duongtuong131004@gmail.com",
    copy: "Best for payment questions, order changes, and after-purchase help.",
  },
  {
    icon: PhoneCall,
    title: "Sales line",
    value: "0862128904",
    copy: "Ideal for urgent questions that need a real person on the same day.",
  },
];

const quickAnswers = [
  {
    title: "Typical response time",
    copy: "Most support questions are answered on the same business day.",
  },
  {
    title: "Best way to reach us",
    copy: "Use the message form for detailed product or order issues. It keeps context in one place.",
  },
  {
    title: "What to include",
    copy: "Mention your product name or order code so the first reply can be more specific.",
  },
];

function validateContactForm(
  name: string,
  email: string,
  subject: string,
  message: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(name)) {
    errors.name = "Name is required.";
  }

  if (isBlank(email)) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (isBlank(subject)) {
    errors.subject = "Subject is required.";
  }

  if (isBlank(message)) {
    errors.message = "Message is required.";
  } else if (message.trim().length < 10) {
    errors.message = "Message should be at least 10 characters.";
  }

  return errors;
}

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  function clearFieldError(field: string) {
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setError("");
  }

  return (
    <div className="pb-24">
      <Breadcrumb items={[{ label: "Home", to: "/home" }, { label: "Contact" }]} />

      <div className="cy-shell space-y-16 pt-10 sm:space-y-20">
        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="max-w-[620px]">
            <p className="cy-kicker">Contact</p>
            <h1 className="mt-4 text-[3rem] font-semibold leading-[0.9] tracking-[-0.08em] text-(--text-primary) sm:text-[4.6rem]">
              Find the fastest path to help.
            </h1>
            <p className="mt-6 max-w-[40ch] text-[15px] leading-7 text-(--text-secondary) sm:text-base">
              We treat support as part of the storefront, not a page hidden after checkout.
              Reach out for product comparisons, order updates, payment questions, or a second opinion before you buy.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {supportPaths.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="cy-panel p-5">
                  <div className="rounded-2xl border border-[rgba(143,185,255,0.24)] bg-[rgba(143,185,255,0.12)] p-3 text-(--accent)">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-sm text-(--text-tertiary)">{item.title}</p>
                  <p className="mt-1 text-[1rem] font-semibold tracking-[-0.03em] text-(--text-primary)">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-(--text-secondary)">{item.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-4">
            <article className="cy-panel p-7">
              <p className="cy-kicker">Before you write</p>
              <h2 className="mt-4 text-[2rem] font-semibold leading-[0.96] tracking-[-0.05em] text-(--text-primary)">
                Start with the simplest channel first.
              </h2>
              <div className="mt-6 space-y-4">
                {quickAnswers.map((item, index) => (
                  <div
                    key={item.title}
                    className="grid gap-3 border-t border-(--line-soft) pt-4 first:border-t-0 first:pt-0 md:grid-cols-[56px_1fr]"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-tertiary)">
                      0{index + 1}
                    </p>
                    <div>
                      <h3 className="text-[1.08rem] font-semibold tracking-[-0.03em] text-(--text-primary)">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-(--text-secondary)">{item.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="cy-panel p-6">
              <div className="flex items-center gap-3 text-sm text-(--text-secondary)">
                <Clock3 className="h-4 w-4 text-(--accent)" />
                Support window: Monday to Friday, 09:00 to 18:00
              </div>
            </article>
          </div>

          <article className="cy-panel p-7 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="cy-kicker">Send a message</p>
                <h2 className="mt-4 text-[2.2rem] font-semibold leading-[0.96] tracking-[-0.05em] text-(--text-primary)">
                  Talk to a real person.
                </h2>
              </div>
              <div className="rounded-full border border-[rgba(143,185,255,0.24)] bg-[rgba(143,185,255,0.12)] p-3 text-(--accent)">
                <Headphones className="h-5 w-5" />
              </div>
            </div>

            <form
              className="mt-8 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setError("");
                setSubmitted(false);
                const nextErrors = validateContactForm(name, email, subject, message);
                setFieldErrors(nextErrors);

                if (Object.values(nextErrors).some(Boolean)) {
                  return;
                }

                setIsSubmitting(true);

                try {
                  await submitContactInquiry({ name, email, subject, message });
                  setSubmitted(true);
                  setSubject("");
                  setName("");
                  setEmail("");
                  setMessage("");
                } catch {
                  setError("Unable to send your message right now. Please try again.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearFieldError("name");
                  }}
                  placeholder="Your name"
                  className={[
                    "cy-input",
                    fieldErrors.name
                      ? "border-rose-300 bg-rose-50/70 focus:border-rose-300 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]"
                      : "",
                  ].join(" ")}
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                <input
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearFieldError("email");
                  }}
                  placeholder="Email address"
                  className={[
                    "cy-input",
                    fieldErrors.email
                      ? "border-rose-300 bg-rose-50/70 focus:border-rose-300 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]"
                      : "",
                  ].join(" ")}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
              </div>
              {fieldErrors.name || fieldErrors.email ? (
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="text-sm text-rose-700">{fieldErrors.name || ""}</div>
                  <div className="text-sm text-rose-700">{fieldErrors.email || ""}</div>
                </div>
              ) : null}
              <input
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value);
                  clearFieldError("subject");
                }}
                placeholder="Subject"
                className={[
                  "cy-input",
                  fieldErrors.subject
                    ? "border-rose-300 bg-rose-50/70 focus:border-rose-300 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]"
                    : "",
                ].join(" ")}
                aria-invalid={Boolean(fieldErrors.subject)}
              />
              {fieldErrors.subject ? <div className="text-sm text-rose-700">{fieldErrors.subject}</div> : null}
              <textarea
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  clearFieldError("message");
                }}
                placeholder="Tell us what you need"
                className={[
                  "min-h-[200px] rounded-[24px] border bg-white/84 px-4 py-4 text-sm leading-7 text-(--text-primary) outline-none transition placeholder:text-(--text-tertiary)",
                  fieldErrors.message
                    ? "border-rose-300 bg-rose-50/70 focus:border-rose-300 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]"
                    : "border-(--line-soft) focus:border-[rgba(0,113,227,0.26)] focus:shadow-[0_0_0_4px_rgba(0,113,227,0.08)]",
                ].join(" ")}
                aria-invalid={Boolean(fieldErrors.message)}
              />
              {fieldErrors.message ? <div className="text-sm text-rose-700">{fieldErrors.message}</div> : null}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-(--text-secondary)">
                  Best for sales guidance, order help, and after-purchase questions.
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cy-btn-primary inline-flex h-14 items-center justify-center gap-3 px-8 disabled:opacity-60"
                >
                  <span className="text-white">{isSubmitting ? "Sending..." : "Send message"}</span>
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
              {submitted ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Message sent successfully. Support now has your request.
                </div>
              ) : null}
            </form>
          </article>
        </section>
      </div>
    </div>
  );
}
