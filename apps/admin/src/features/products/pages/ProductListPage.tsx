import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import axios from "axios";
import { formatCurrencyVnd } from "@shared/formatters/currency";
import {
  hasValidationErrors,
  isBlank,
  isNonNegativeInteger,
  isNonNegativeNumber,
  type ValidationErrors,
} from "@shared/validation/forms";
import { getAdminCategories } from "@/features/categories/api/categories.api";
import { uploadAdminImages, type UploadedImageAsset } from "@/features/uploads/api/uploads.api";
import { AdminModalShell } from "@/components/feedback/AdminModalShell";
import { resolveAssetUrl } from "@/utils/assets";
import {
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  type AdminProduct,
} from "../api/products.api";

const surface = "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";
const inputClass =
  "h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 text-sm text-black outline-none transition focus:border-black/20 focus:bg-white";
const fmt = (value: number) => formatCurrencyVnd(value);

type ProductFormState = {
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  categoryId: string;
  description: string;
  featured: boolean;
  status: string;
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

function getStatusBadgeClass(status: string) {
  if (status === "archived") return "bg-black/6 text-black/55";
  if (status === "draft") return "bg-amber-100 text-amber-700";
  if (status === "out_of_stock") return "bg-rose-100 text-rose-600";
  return "bg-emerald-100 text-emerald-700";
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function createDefaultForm(categoryId = ""): ProductFormState {
  return {
    name: "",
    sku: "",
    price: "0",
    compareAtPrice: "",
    stock: "0",
    categoryId,
    description: "",
    featured: false,
    status: "active",
  };
}

function mapProductToForm(product: AdminProduct): ProductFormState {
  return {
    name: product.name,
    sku: product.sku,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    stock: String(product.stock),
    categoryId: product.category?.id || "",
    description: product.description,
    featured: product.featured,
    status: product.status,
  };
}

function mapProductToImages(product: AdminProduct): UploadedImageAsset[] {
  if (product.images?.length) {
    return product.images.map((image, index) => ({
      url: image.url,
      alt: image.alt,
      filename: `${product.id}-${index}`,
      mimeType: "image/*",
      size: 0,
    }));
  }

  if (product.image) {
    return [
      {
        url: product.image,
        alt: product.name,
        filename: `${product.id}-primary`,
        mimeType: "image/*",
        size: 0,
      },
    ];
  }

  return [];
}

function validateProductForm(form: ProductFormState, imageCount: number): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(form.name)) errors.name = "Product name is required.";
  if (isBlank(form.sku)) errors.sku = "SKU is required.";

  if (isBlank(form.price)) errors.price = "Price is required.";
  else if (!isNonNegativeNumber(form.price)) errors.price = "Price must be a non-negative number.";

  if (!isBlank(form.compareAtPrice) && !isNonNegativeNumber(form.compareAtPrice)) {
    errors.compareAtPrice = "Compare-at price must be a non-negative number.";
  }

  if (isBlank(form.stock)) errors.stock = "Stock is required.";
  else if (!isNonNegativeInteger(form.stock)) errors.stock = "Stock must be a non-negative integer.";

  if (isBlank(form.categoryId)) errors.categoryId = "Choose a category.";
  if (imageCount === 0) errors.images = "Upload at least one product image.";

  return errors;
}

export default function ProductListPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [images, setImages] = useState<UploadedImageAsset[]>([]);
  const [mediaError, setMediaError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "featured" | "active" | "out_of_stock" | "archived">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allProductsCount, setAllProductsCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductFormState>(createDefaultForm());
  const pageSize = 12;

  async function loadProducts() {
    setLoading(true);

    try {
      const filters: Record<string, string | number | boolean> = { page, limit: pageSize, search };
      if (status === "featured") filters.featured = true;
      else if (status !== "all") filters.status = status;

      const [
        productResponse,
        categoryResponse,
        allResponse,
        featuredResponse,
        activeResponse,
        outResponse,
        archivedResponse,
      ] = await Promise.all([
        getAdminProducts(filters),
        getAdminCategories({ limit: 50 }),
        getAdminProducts({ page: 1, limit: 1 }),
        getAdminProducts({ page: 1, limit: 1, featured: true }),
        getAdminProducts({ page: 1, limit: 1, status: "active" }),
        getAdminProducts({ page: 1, limit: 1, status: "out_of_stock" }),
        getAdminProducts({ page: 1, limit: 1, status: "archived" }),
      ]);

      const nextCategories = categoryResponse.data.map((item) => ({ id: item.id, name: item.name }));
      setProducts(productResponse.data);
      setCategories(nextCategories);
      setTotalPages(productResponse.meta?.totalPages || 1);
      setAllProductsCount(allResponse.meta?.total || 0);
      setFeaturedCount(featuredResponse.meta?.total || 0);
      setActiveCount(activeResponse.meta?.total || 0);
      setOutOfStockCount(outResponse.meta?.total || 0);
      setArchivedCount(archivedResponse.meta?.total || 0);
      setForm((current) => (current.categoryId ? current : createDefaultForm(nextCategories[0]?.id || "")));
    } catch (error) {
      setFeedback({
        tone: "error",
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || "Could not load products."
          : "Could not load products.",
      });
    } finally {
      setLoading(false);
    }
  }

  function resetEditState(nextCategoryId = categories[0]?.id || "") {
    setEditingProduct(null);
    setImages([]);
    setMediaError("");
    setSubmitError("");
    setFieldErrors({});
    setUploading(false);
    setForm(createDefaultForm(nextCategoryId));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openEditModal(product: AdminProduct) {
    setEditingProduct(product);
    setMediaError("");
    setSubmitError("");
    setFieldErrors({});
    setImages(mapProductToImages(product));
    setForm(mapProductToForm(product));
    setFeedback(null);
  }

  function openArchiveModal(product: AdminProduct) {
    setArchiveTarget(product);
    setFeedback(null);
  }

  async function handleArchiveConfirmed() {
    if (!archiveTarget) return;

    try {
      const archivedProduct = await deleteAdminProduct(archiveTarget.id);
      setArchiveTarget(null);
      if (editingProduct?.id === archivedProduct.id) {
        resetEditState();
      }
      await loadProducts();
      setFeedback({ tone: "success", message: `${archivedProduct.name} archived successfully.` });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || "Could not archive the product."
          : "Could not archive the product.",
      });
    }
  }

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setMediaError("");
    setUploading(true);

    try {
      const uploadedImages = await uploadAdminImages(selectedFiles, "products");
      setImages((current) => [...current, ...uploadedImages]);
      setFieldErrors((current) => ({ ...current, images: "" }));
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const openFilePicker = () => fileInputRef.current?.click();
  const removeImage = (indexToRemove: number) =>
    setImages((current) => current.filter((_, index) => index !== indexToRemove));
  const setPrimaryImage = (indexToPromote: number) =>
    setImages((current) => {
      const next = [...current];
      const [selected] = next.splice(indexToPromote, 1);
      if (!selected) return current;
      next.unshift(selected);
      return next;
    });

  async function handleSave() {
    if (!editingProduct) return;

    const nextErrors = validateProductForm(form, images.length);
    setFieldErrors(nextErrors);
    setSubmitError("");

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    setSaving(true);
    try {
      const updatedProduct = await updateAdminProduct(editingProduct.id, {
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        stock: Number(form.stock),
        categoryId: form.categoryId,
        description: form.description,
        images: images.map((image, index) => ({ url: image.url, alt: form.name, sortOrder: index })),
        status: form.status,
        featured: form.featured,
      });

      resetEditState();
      await loadProducts();
      setFeedback({ tone: "success", message: `${updatedProduct.name} updated successfully.` });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSubmitError(error.response?.data?.message || "Could not update the product right now.");
      } else {
        setSubmitError("Could not update the product right now.");
      }
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, [page, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  useEffect(() => {
    if (!feedback) return;
    const timeoutId = window.setTimeout(() => setFeedback(null), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const topCards = [
    { label: "All Products", value: allProductsCount },
    { label: "Featured", value: featuredCount },
    { label: "Active", value: activeCount },
    { label: "Out of Stock", value: outOfStockCount },
    { label: "Archived", value: archivedCount },
  ];

  const modalProductSummary = useMemo(() => {
    if (!editingProduct) return null;
    return products.find((item) => item.id === editingProduct.id) || editingProduct;
  }, [editingProduct, products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-black/45">Product list</p>
          <h1 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.05em] text-black">Shared catalog inventory</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-[#1f1f1f]"
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Link>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
          >
            More Action
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {feedback ? (
        <div
          className={[
            "flex items-center justify-between gap-3 rounded-[24px] border px-5 py-4 text-sm font-medium",
            feedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-600",
          ].join(" ")}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/15 text-current transition hover:bg-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {topCards.map((card) => (
          <section key={card.label} className={surface}>
            <p className="text-sm font-medium text-black/45">{card.label}</p>
            <p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">{card.value.toLocaleString("en-US")}</p>
            <p className="mt-2 text-sm text-black/42">
              {card.label === "Archived" ? "Soft-deleted products retained for audit" : "Live inventory snapshot"}
            </p>
          </section>
        ))}
      </div>

      <section className={surface}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="inline-flex flex-1 flex-wrap rounded-full bg-[#f5f5f5] p-1 text-sm">
            {([
              ["all", "All Product"],
              ["featured", "Featured Products"],
              ["active", "Active"],
              ["out_of_stock", "Out of Stock"],
              ["archived", "Archived"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={[
                  "rounded-full px-4 py-2 font-medium transition",
                  status === value ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex h-12 w-full max-w-[360px] items-center gap-3 rounded-2xl bg-[#f5f5f5] px-4 text-black/35 xl:w-[320px] xl:flex-none">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your product"
              className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/35"
            />
          </label>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-black/45">
            Loading products...
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7f7f8] text-black/48">
                <tr>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">Created Date</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Stock</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-black/45">
                      No products match the current filter.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t border-black/6">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#f7f7f8]">
                            <img
                              src={resolveAssetUrl(product.image || "/assets/images/iphone-17.png")}
                              alt={product.name}
                              className="max-h-10 object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-black">{product.name}</p>
                            <p className="mt-1 text-sm text-black/42">SKU {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-black/42">{new Date(product.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-black/65">{product.category?.name || "No category"}</td>
                      <td className="px-5 py-4 font-medium text-black">{fmt(product.price)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            product.status === "out_of_stock" ? "bg-rose-100 text-rose-600" : "bg-black text-white",
                          ].join(" ")}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
                            getStatusBadgeClass(product.status),
                          ].join(" ")}
                        >
                          {formatStatusLabel(product.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black transition hover:bg-black hover:text-white"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openArchiveModal(product)}
                            disabled={product.status === "archived"}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/25 disabled:hover:bg-transparent disabled:hover:text-black/25"
                            aria-label={`Archive ${product.name}`}
                            title={product.status === "archived" ? "This product is already archived." : "Archive this product"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </button>
          <p className="text-sm text-black/45">
            Page {page} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-40"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </section>

      {editingProduct ? (
        <AdminModalShell
          title="Edit product"
          subtitle={modalProductSummary ? `Updating ${modalProductSummary.name}` : "Updating catalog entry"}
          onClose={() => resetEditState()}
        >
          <div className="px-6 py-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelection}
              className="hidden"
            />

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Product name"
                    value={form.name}
                    onChange={(value) => {
                      setForm((current) => ({ ...current, name: value }));
                      setFieldErrors((current) => ({ ...current, name: "" }));
                    }}
                    error={fieldErrors.name}
                  />
                  <Field
                    label="SKU"
                    value={form.sku}
                    onChange={(value) => {
                      setForm((current) => ({ ...current, sku: value }));
                      setFieldErrors((current) => ({ ...current, sku: "" }));
                    }}
                    error={fieldErrors.sku}
                  />
                  <Field
                    label="Price"
                    value={form.price}
                    onChange={(value) => {
                      setForm((current) => ({ ...current, price: value }));
                      setFieldErrors((current) => ({ ...current, price: "" }));
                    }}
                    error={fieldErrors.price}
                  />
                  <Field
                    label="Compare at price"
                    value={form.compareAtPrice}
                    onChange={(value) => {
                      setForm((current) => ({ ...current, compareAtPrice: value }));
                      setFieldErrors((current) => ({ ...current, compareAtPrice: "" }));
                    }}
                    error={fieldErrors.compareAtPrice}
                  />
                  <Field
                    label="Stock"
                    value={form.stock}
                    onChange={(value) => {
                      setForm((current) => ({ ...current, stock: value }));
                      setFieldErrors((current) => ({ ...current, stock: "" }));
                    }}
                    error={fieldErrors.stock}
                  />
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-black/58">Category</span>
                    <select
                      value={form.categoryId}
                      onChange={(event) => {
                        setForm((current) => ({ ...current, categoryId: event.target.value }));
                        setFieldErrors((current) => ({ ...current, categoryId: "" }));
                      }}
                      className={[inputClass, fieldErrors.categoryId ? "border-rose-300 bg-rose-50/70" : ""].join(" ")}
                      aria-invalid={Boolean(fieldErrors.categoryId)}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.categoryId ? <span className="text-sm text-rose-600">{fieldErrors.categoryId}</span> : null}
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-black/58">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    className="min-h-32 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 py-3 text-sm text-black outline-none transition focus:border-black/20 focus:bg-white"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f7f7f8] px-4 py-4 text-sm font-medium text-black">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                      className="h-4 w-4 rounded border-black/20"
                    />
                    Featured on user storefront
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-black/58">Status</span>
                    <select
                      value={form.status}
                      onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                      className={inputClass}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                </div>

                {submitError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {submitError}
                  </div>
                ) : null}
              </section>

              <section className="space-y-5">
                <div className="rounded-[24px] border border-dashed border-black/12 bg-[#f7f7f8] p-4">
                  <div className="flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-white">
                    {images[0]?.url ? (
                      <img
                        src={resolveAssetUrl(images[0].url)}
                        alt={form.name || "Preview"}
                        className="max-h-[180px] object-contain"
                      />
                    ) : (
                      <div className="text-center text-black/35">
                        <ImagePlus className="mx-auto h-8 w-8" />
                        <p className="mt-3 text-sm">Upload product imagery to update the storefront gallery.</p>
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
                      {uploading ? "Uploading..." : "Add more"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImages([]);
                        setFieldErrors((current) => ({ ...current, images: "Upload at least one product image." }));
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </button>
                  </div>
                </div>

                {images.length ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {images.map((image, index) => (
                      <div key={`${image.filename}-${index}`} className="rounded-[22px] border border-black/10 bg-[#f7f7f8] p-3">
                        <div className="flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-white">
                          <img
                            src={resolveAssetUrl(image.url)}
                            alt={form.name || `Product image ${index + 1}`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className={[
                              "inline-flex h-9 items-center justify-center rounded-full px-3 text-xs font-semibold transition",
                              index === 0
                                ? "bg-black text-white"
                                : "border border-black/10 bg-white text-black hover:bg-black hover:text-white",
                            ].join(" ")}
                          >
                            <Star className="mr-1.5 h-3.5 w-3.5" />
                            {index === 0 ? "Primary" : "Make cover"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-500 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {fieldErrors.images ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{fieldErrors.images}</div> : null}
                {mediaError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{mediaError}</div> : null}
              </section>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-black/8 px-6 py-5">
            <div className="text-sm text-black/45">
              {modalProductSummary ? `Editing ${modalProductSummary.name} from the shared catalog.` : "Review the product details before saving."}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => resetEditState()}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-[#1f1f1f] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </AdminModalShell>
      ) : null}

      {archiveTarget ? (
        <AdminModalShell
          title="Archive product"
          subtitle="Confirm archive action"
          onClose={() => setArchiveTarget(null)}
          widthClass="max-w-xl"
        >
          <div className="space-y-5 px-6 py-6">
            <div className="rounded-[24px] border border-black/8 bg-[#fafafa] p-5">
              <p className="text-sm font-medium text-black/45">Selected product</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">{archiveTarget.name}</h3>
              <p className="mt-3 text-sm text-black/58">
                This will hide the product from the storefront and move it into the archived inventory view. Existing order history remains intact.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/8 bg-[#fafafa] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">SKU</p>
                <p className="mt-2 text-sm font-medium text-black">{archiveTarget.sku}</p>
              </div>
              <div className="rounded-2xl border border-black/8 bg-[#fafafa] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">Status</p>
                <p className="mt-2 text-sm font-medium capitalize text-black">{formatStatusLabel(archiveTarget.status)}</p>
              </div>
              <div className="rounded-2xl border border-black/8 bg-[#fafafa] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">Stock</p>
                <p className="mt-2 text-sm font-medium text-black">{archiveTarget.stock}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-black/8 px-6 py-5">
            <button
              type="button"
              onClick={() => setArchiveTarget(null)}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            >
              Keep product
            </button>
            <button
              type="button"
              onClick={handleArchiveConfirmed}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-rose-500 px-5 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Archive product
            </button>
          </div>
        </AdminModalShell>
      ) : null}
    </div>
  );
}
