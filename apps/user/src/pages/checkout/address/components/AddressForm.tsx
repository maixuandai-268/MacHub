import axios from "axios";
import { useState } from "react";
import {
  isBlank,
  isValidEmail,
  isValidPhone,
  type ValidationErrors,
} from "@shared/validation/forms";
import type { CheckoutAddress } from "@/features/cart/cart.types";

const emptyAddress: CheckoutAddress = {
  id: "",
  label: "HOME",
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  ward: "",
  district: "",
  city: "",
  country: "Vietnam",
  postalCode: "",
  isDefault: false,
};

function FormField({
  value,
  placeholder,
  onChange,
  className = "",
  error = "",
  type = "text",
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
  type?: string;
}) {
  return (
    <div className={["space-y-2", className].join(" ")}>
      <input
        type={type}
        className={[
          "cy-input",
          error ? "border-rose-300 bg-rose-50/70 focus:border-rose-300 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : "",
        ].join(" ")}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}

function validateAddressForm(form: CheckoutAddress): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(form.fullName)) {
    errors.fullName = "Full name is required.";
  }

  if (!isBlank(form.email) && !isValidEmail(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (isBlank(form.phone)) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhone(form.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (isBlank(form.addressLine1)) {
    errors.addressLine1 = "Address line 1 is required.";
  }

  if (isBlank(form.city)) {
    errors.city = "City is required.";
  }

  return errors;
}

export default function AddressForm({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue?: CheckoutAddress;
  onSave: (value: CheckoutAddress) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CheckoutAddress>(
    initialValue ||
      {
        ...emptyAddress,
        id: "",
        isDefault: true,
      }
  );
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState("");

  function updateField<K extends keyof CheckoutAddress>(key: K, value: CheckoutAddress[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setSubmitError("");
  }

  return (
    <div className="cy-panel p-6 sm:p-7">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">
          {initialValue ? "Edit address" : "New address"}
        </p>
        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-(--text-primary)">Recipient details</h3>
        <p className="mt-3 text-sm text-(--text-secondary)">
          Required to continue: Full name, Phone, Address line 1, and City.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField value={form.fullName} onChange={(value) => updateField("fullName", value)} placeholder="Full name" error={fieldErrors.fullName} />
        <FormField value={form.label} onChange={(value) => updateField("label", value.toUpperCase())} placeholder="Label (HOME / OFFICE)" error={fieldErrors.label} />
        <FormField value={form.email} onChange={(value) => updateField("email", value)} placeholder="Email" type="email" error={fieldErrors.email} />
        <FormField value={form.phone} onChange={(value) => updateField("phone", value)} placeholder="Phone" error={fieldErrors.phone} />
        <FormField
          className="md:col-span-2"
          value={form.addressLine1}
          onChange={(value) => updateField("addressLine1", value)}
          placeholder="Address line 1"
          error={fieldErrors.addressLine1}
        />
        <FormField
          className="md:col-span-2"
          value={form.addressLine2}
          onChange={(value) => updateField("addressLine2", value)}
          placeholder="Address line 2"
        />
        <FormField value={form.ward} onChange={(value) => updateField("ward", value)} placeholder="Ward" />
        <FormField value={form.district} onChange={(value) => updateField("district", value)} placeholder="District" />
        <FormField value={form.city} onChange={(value) => updateField("city", value)} placeholder="City" error={fieldErrors.city} />
        <FormField value={form.postalCode} onChange={(value) => updateField("postalCode", value)} placeholder="Postal code" />
        <FormField value={form.country} onChange={(value) => updateField("country", value)} placeholder="Country" />
      </div>

      <label className="mt-5 flex items-center gap-3 text-sm text-(--text-secondary)">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
          className="h-4 w-4 accent-(--accent)"
        />
        Set as default address
      </label>

      {submitError ? <p className="mt-5 text-sm text-rose-700">{submitError}</p> : null}

      <div className="mt-7 flex flex-wrap gap-4">
        <button type="button" onClick={onCancel} className="cy-btn-secondary h-12 px-6 text-sm">
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            const nextErrors = validateAddressForm(form);
            setFieldErrors(nextErrors);

            if (Object.values(nextErrors).some(Boolean)) {
              setSubmitError("Please complete the required fields before saving this address.");
              return;
            }

            setSaving(true);
            try {
              await onSave(form);
              setSubmitError("");
            } catch (error) {
              const apiMessage =
                axios.isAxiosError<{ message?: string }>(error)
                  ? error.response?.data?.message
                  : "";
              setSubmitError(
                apiMessage ||
                  (error instanceof Error ? error.message : "Unable to save this address right now.")
              );
            } finally {
              setSaving(false);
            }
          }}
          className="cy-btn-primary h-12 px-6 text-sm disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save address"}
        </button>
      </div>
    </div>
  );
}
