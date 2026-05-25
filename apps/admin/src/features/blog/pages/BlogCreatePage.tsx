import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, PlusCircle, Trash2, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { uploadAdminImages } from "@/features/uploads/api/uploads.api";
import { createAdminBlogPost } from "../api/blog.api";
import { hasValidationErrors, isBlank, isValidSlug, type ValidationErrors } from "@shared/validation/forms";
import { resolveAssetUrl } from "@/utils/assets";

const surface =
  "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";
const inputClass =
  "h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 text-sm text-black outline-none transition focus:border-black/20 focus:bg-white";

type BlogSectionForm = {
  heading: string;
  body: string;
};

type BlogFormState = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image: string;
  readTime: string;
  status: string;
  publishedAt: string;
  authorName: string;
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

function createEmptySection(): BlogSectionForm {
  return { heading: "", body: "" };
}

function createDefaultForm(): BlogFormState {
  return {
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    image: "",
    readTime: "4 min read",
    status: "draft",
    publishedAt: "",
    authorName: "CyberShop Editorial",
  };
}

function validateBlogForm(form: BlogFormState, sections: BlogSectionForm[]): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(form.title)) errors.title = "Title is required.";
  if (isBlank(form.slug)) errors.slug = "Slug is required.";
  else if (!isValidSlug(form.slug)) errors.slug = "Use lowercase letters, numbers, and hyphens only.";
  if (isBlank(form.category)) errors.category = "Category is required.";
  if (isBlank(form.excerpt)) errors.excerpt = "Excerpt is required.";
  if (isBlank(form.authorName)) errors.authorName = "Author is required.";
  if (isBlank(form.image)) errors.image = "Cover image is required.";

  const hasSectionContent = sections.some(
    (section) => !isBlank(section.heading) && !isBlank(section.body)
  );
  if (!hasSectionContent) errors.sections = "Add at least one section with a heading and body.";

  return errors;
}

export default function BlogCreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<BlogFormState>(createDefaultForm());
  const [sections, setSections] = useState<BlogSectionForm[]>([createEmptySection()]);
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
      const [uploadedImage] = await uploadAdminImages([file], "blog");
      setForm((current) => ({ ...current, image: uploadedImage?.url || "" }));
      setFieldErrors((current) => ({ ...current, image: "" }));
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Cover upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function updateSection(index: number, patch: Partial<BlogSectionForm>) {
    setSections((current) =>
      current.map((section, currentIndex) =>
        currentIndex === index ? { ...section, ...patch } : section
      )
    );
    setFieldErrors((current) => ({ ...current, sections: "" }));
  }

  function addSection() {
    setSections((current) => [...current, createEmptySection()]);
  }

  function removeSection(indexToRemove: number) {
    setSections((current) =>
      current.length === 1 ? [createEmptySection()] : current.filter((_, index) => index !== indexToRemove)
    );
  }

  function buildPayload() {
    return {
      ...form,
      publishedAt: form.publishedAt || null,
      sections: sections
        .map((section) => ({
          heading: section.heading.trim(),
          body: section.body
            .split(/\n\s*\n/g)
            .map((item) => item.trim())
            .filter(Boolean),
        }))
        .filter((section) => section.heading && section.body.length),
    };
  }

  async function handleSubmit() {
    const nextErrors = validateBlogForm(form, sections);
    setFieldErrors(nextErrors);
    setSubmitError("");

    if (hasValidationErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await createAdminBlogPost(buildPayload());
      navigate("/admin/blog", { replace: true });
    } catch (error) {
      setSubmitError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Unable to create article right now."
          : error instanceof Error
            ? error.message
            : "Unable to create article right now."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-black/45">Create article</p>
          <h1 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.05em] text-black">
            Publish to the storefront journal
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/blog")}
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
            {submitting ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelection}
        className="hidden"
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className={surface}>
          <div className="rounded-[24px] border border-dashed border-black/12 bg-[#f7f7f8] p-4">
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-white">
              {form.image ? (
                <img
                  src={resolveAssetUrl(form.image)}
                  alt={form.title || "Preview"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-black/35">
                  <ImagePlus className="mx-auto h-8 w-8" />
                  <p className="mt-3 text-sm">Upload the cover image used on the blog listing and detail hero.</p>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload
              </button>
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Replace"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm((current) => ({ ...current, image: "" }));
                  setFieldErrors((current) => ({ ...current, image: "Cover image is required." }));
                }}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          {fieldErrors.image ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {fieldErrors.image}
            </div>
          ) : null}
          {mediaError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {mediaError}
            </div>
          ) : null}
        </section>

        <section className={surface}>
          <div className="space-y-4">
            <Field
              label="Title"
              value={form.title}
              onChange={(value) => {
                setForm((current) => ({ ...current, title: value }));
                setFieldErrors((current) => ({ ...current, title: "" }));
              }}
              error={fieldErrors.title}
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
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Category"
                value={form.category}
                onChange={(value) => {
                  setForm((current) => ({ ...current, category: value }));
                  setFieldErrors((current) => ({ ...current, category: "" }));
                }}
                error={fieldErrors.category}
              />
              <Field
                label="Read time"
                value={form.readTime}
                onChange={(value) => setForm((current) => ({ ...current, readTime: value }))}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Author"
                value={form.authorName}
                onChange={(value) => {
                  setForm((current) => ({ ...current, authorName: value }));
                  setFieldErrors((current) => ({ ...current, authorName: "" }));
                }}
                error={fieldErrors.authorName}
              />
              <label className="block space-y-2">
                <span className="text-sm font-medium text-black/58">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className={inputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-black/58">Published date</span>
              <input
                type="date"
                value={form.publishedAt}
                onChange={(event) => setForm((current) => ({ ...current, publishedAt: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-black/58">Excerpt</span>
              <textarea
                value={form.excerpt}
                onChange={(event) => {
                  setForm((current) => ({ ...current, excerpt: event.target.value }));
                  setFieldErrors((current) => ({ ...current, excerpt: "" }));
                }}
                className={[
                  "min-h-24 w-full rounded-2xl border bg-[#f5f5f5] px-4 py-3 text-sm outline-none",
                  fieldErrors.excerpt ? "border-rose-300 bg-rose-50/70" : "border-black/10",
                ].join(" ")}
                aria-invalid={Boolean(fieldErrors.excerpt)}
              />
              {fieldErrors.excerpt ? <span className="text-sm text-rose-600">{fieldErrors.excerpt}</span> : null}
            </label>
          </div>
        </section>
      </div>

      <section className={surface}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-black/45">Story sections</p>
            <p className="mt-1 text-sm text-black/42">Separate paragraphs with a blank line in each section body.</p>
          </div>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
          >
            Add section
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {sections.map((section, index) => (
            <div key={`section-${index}`} className="rounded-[20px] border border-black/8 bg-[#fbfbfb] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-black">Section {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                <Field
                  label="Section heading"
                  value={section.heading}
                  onChange={(value) => updateSection(index, { heading: value })}
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-black/58">Section body</span>
                  <textarea
                    value={section.body}
                    onChange={(event) => updateSection(index, { body: event.target.value })}
                    className="min-h-32 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 py-3 text-sm outline-none"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {fieldErrors.sections ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {fieldErrors.sections}
          </div>
        ) : null}
        {submitError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {submitError}
          </div>
        ) : null}
      </section>
    </div>
  );
}
