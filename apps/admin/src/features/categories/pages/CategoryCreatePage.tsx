import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, PlusCircle, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { uploadAdminImages } from "@/features/uploads/api/uploads.api";
import { hasValidationErrors, isBlank, isNonNegativeInteger, isValidSlug, type ValidationErrors } from "@shared/validation/forms";
import { resolveAssetUrl } from "@/utils/assets";
import { createAdminCategory } from "../api/categories.api";

const surface =
  "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";
const inputClass =
  "h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 text-sm text-black outline-none transition focus:border-black/20 focus:bg-white";

type CategoryFormState = {
  name: string;
  slug: string;
  image: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
};

function Field({
  label,
  value,
  onChange,
  error = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-black/58">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[inputClass, error ? "border-rose-300 bg-rose-50/70" : ""].join(" ")}
        aria-invalid={Boolean(error)}
      />
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </label>
  );
}

function validateCategoryForm(form: CategoryFormState): ValidationErrors {
  const errors: ValidationErrors = {};
  if (isBlank(form.name)) errors.name = "Category name is required.";
  if (isBlank(form.slug)) errors.slug = "Slug is required.";
  else if (!isValidSlug(form.slug)) errors.slug = "Use lowercase letters, numbers, and hyphens only.";
  if (isBlank(form.sortOrder)) errors.sortOrder = "Sort order is required.";
  else if (!isNonNegativeInteger(form.sortOrder)) errors.sortOrder = "Sort order must be a non-negative integer.";
  return errors;
}

export default function CategoryCreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<CategoryFormState>({
    name: "",
    slug: "",
    image: "",
    description: "",
    sortOrder: "1",
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMediaError("");
    setUploading(true);
    try {
      const [uploadedImage] = await uploadAdminImages([file], "categories");
      setForm((current) => ({ ...current, image: uploadedImage?.url || "" }));
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Category image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit() {
    const nextErrors = validateCategoryForm(form);
    setFieldErrors(nextErrors);
    setSubmitError("");
    if (hasValidationErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await createAdminCategory({
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
      });
      navigate("/admin/categories", { replace: true });
    } catch (error) {
      setSubmitError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Unable to create category right now."
          : error instanceof Error
            ? error.message
            : "Unable to create category right now."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-black/45">Create category</p>
          <h1 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.05em] text-black">
            Publish a catalog category
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
          >
            Back to list
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-[#1f1f1f] disabled:opacity-60"
          >
            {submitting ? "Publishing..." : "Publish Category"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className={surface}>
          <div className="rounded-[24px] border border-dashed border-black/12 bg-[#f7f7f8] p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelection}
              className="hidden"
            />
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-white">
              {form.image ? (
                <img src={resolveAssetUrl(form.image)} alt={form.name || "Preview"} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-black/35">
                  <ImagePlus className="mx-auto h-8 w-8" />
                  <p className="mt-3 text-sm">Upload the category image used in storefront navigation and admin preview.</p>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Replace"}
              </button>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, image: "" }))}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
          {mediaError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{mediaError}</div> : null}
        </section>

        <section className={surface}>
          <div className="space-y-4">
            <Field
              label="Category name"
              value={form.name}
              onChange={(value) => {
                setForm((current) => ({ ...current, name: value }));
                setFieldErrors((current) => ({ ...current, name: "" }));
              }}
              error={fieldErrors.name}
            />
            <Field
              label="Slug"
              value={form.slug}
              onChange={(value) => {
                setForm((current) => ({ ...current, slug: value }));
                setFieldErrors((current) => ({ ...current, slug: "" }));
              }}
              error={fieldErrors.slug}
            />
            <Field
              label="Sort order"
              value={form.sortOrder}
              onChange={(value) => {
                setForm((current) => ({ ...current, sortOrder: value }));
                setFieldErrors((current) => ({ ...current, sortOrder: "" }));
              }}
              error={fieldErrors.sortOrder}
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-black/58">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="min-h-32 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f7f7f8] px-4 py-4 text-sm font-medium text-black">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 rounded border-black/20"
              />
              Visible on user storefront
            </label>
            {submitError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{submitError}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
