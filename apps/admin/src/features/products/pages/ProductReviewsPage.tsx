import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ImagePlus, MoreHorizontal, Pencil, PlusCircle, Search, Star, Trash2, Upload, XCircle } from "lucide-react";
import { formatCurrencyVnd } from '@shared/formatters/currency';
import { getAdminCategories } from "@/features/categories/api/categories.api";
import { uploadAdminImages, type UploadedImageAsset } from "@/features/uploads/api/uploads.api";
import { resolveAssetUrl } from "@/utils/assets";
import { adjustAdminProductInventory, deleteAdminProduct, getAdminProducts, updateAdminProduct, type AdminProduct } from "../api/products.api";

const surface = "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";
const fmt = (value: number) => formatCurrencyVnd(value);

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-black/58">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 text-sm outline-none" /></label>;
}

export default function ProductListPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [images, setImages] = useState<UploadedImageAsset[]>([]);
  const [mediaError, setMediaError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "featured" | "active" | "out_of_stock">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allProductsCount, setAllProductsCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [form, setForm] = useState({ name: "", sku: "", price: "0", compareAtPrice: "", stock: "0", categoryId: "", description: "", featured: false, status: "active" });
  const [adjustment, setAdjustment] = useState({ type: "increase" as "increase" | "decrease" | "set", quantity: "0", reason: "manual_restock", note: "" });
  const pageSize = 12;

  async function loadProducts() {
    setLoading(true);
    try {
      const filters: Record<string, string | number | boolean> = { page, limit: pageSize, search };
      if (status === "featured") filters.featured = true;
      else if (status !== "all") filters.status = status;
      const [productResponse, categoryResponse, allResponse, featuredResponse, activeResponse, outResponse] = await Promise.all([
        getAdminProducts(filters),
        getAdminCategories({ limit: 50 }),
        getAdminProducts({ page: 1, limit: 1 }),
        getAdminProducts({ page: 1, limit: 1, featured: true }),
        getAdminProducts({ page: 1, limit: 1, status: "active" }),
        getAdminProducts({ page: 1, limit: 1, status: "out_of_stock" }),
      ]);
      setProducts(productResponse.data);
      setTotalPages(productResponse.meta?.totalPages || 1);
      setCategories(categoryResponse.data.map((item) => ({ id: item.id, name: item.name })));
      setAllProductsCount(allResponse.meta?.total || 0);
      setFeaturedCount(featuredResponse.meta?.total || 0);
      setActiveCount(activeResponse.meta?.total || 0);
      setOutOfStockCount(outResponse.meta?.total || 0);
      setSelectedProductId((current) => productResponse.data.some((item) => item.id === current) ? current : "");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadProducts(); }, [page, search, status]);
  useEffect(() => { setPage(1); }, [search, status]);

  const topCards = [
    { label: "All Products", value: allProductsCount },
    { label: "Featured", value: featuredCount },
    { label: "Active", value: activeCount },
    { label: "Out of Stock", value: outOfStockCount },
  ];
  const selectedProduct = useMemo(() => products.find((item) => item.id === selectedProductId) || null, [products, selectedProductId]);

  function resetForm() {
    setSelectedProductId(""); setImages([]); setMediaError("");
    setForm({ name: "", sku: "", price: "0", compareAtPrice: "", stock: "0", categoryId: categories[0]?.id || "", description: "", featured: false, status: "active" });
    setAdjustment({ type: "increase", quantity: "0", reason: "manual_restock", note: "" });
  }

  function handleEdit(product: AdminProduct) {
    setSelectedProductId(product.id); setMediaError("");
    setForm({ name: product.name, sku: product.sku, price: String(product.price), compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "", stock: String(product.stock), categoryId: product.category?.id || "", description: product.description, featured: product.featured, status: product.status });
    setImages(product.images?.length ? product.images.map((image, index) => ({ url: image.url, alt: image.alt, filename: `${product.id}-${index}`, mimeType: "image/*", size: 0 })) : product.image ? [{ url: product.image, alt: product.name, filename: `${product.id}-primary`, mimeType: "image/*", size: 0 }] : []);
  }

  async function handleDelete(productId: string) {
    await deleteAdminProduct(productId);
    if (selectedProductId === productId) resetForm();
    await loadProducts();
  }

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;
    setMediaError(""); setUploading(true);
    try {
      const uploadedImages = await uploadAdminImages(selectedFiles, "products");
      setImages((current) => [...current, ...uploadedImages]);
    }
    catch (error) { setMediaError(error instanceof Error ? error.message : "Image upload failed"); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  const openFilePicker = () => fileInputRef.current?.click();
  const removeImage = (indexToRemove: number) => setImages((current) => current.filter((_, index) => index !== indexToRemove));
  const setPrimaryImage = (indexToPromote: number) => setImages((current) => {
    const next = [...current]; const [selected] = next.splice(indexToPromote, 1); if (!selected) return current; next.unshift(selected); return next;
  });

  async function handleSave() {
    if (!selectedProductId) return;
    setSaving(true);
    try {
      await updateAdminProduct(selectedProductId, {
        name: form.name, sku: form.sku, price: Number(form.price), compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        stock: Number(form.stock), categoryId: form.categoryId, description: form.description,
        images: images.map((image, index) => ({ url: image.url, alt: form.name, sortOrder: index })), status: form.status, featured: form.featured,
      });
      resetForm(); await loadProducts();
    } finally { setSaving(false); }
  }

  async function handleInventoryAdjust() {
    if (!selectedProductId) return;
    setSaving(true);
    try {
      await adjustAdminProductInventory(selectedProductId, { type: adjustment.type, quantity: Number(adjustment.quantity), reason: adjustment.reason, note: adjustment.note });
      setAdjustment((current) => ({ ...current, quantity: "0", note: "" })); await loadProducts();
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div><p className="text-sm font-medium text-black/45">Product list</p><h1 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.05em] text-black">Shared catalog inventory</h1></div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/products/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-[#1f1f1f]"><PlusCircle className="h-4 w-4" />Add Product</Link>
          <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white">More Action<MoreHorizontal className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{topCards.map((card) => <section key={card.label} className={surface}><p className="text-sm font-medium text-black/45">{card.label}</p><p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">{card.value.toLocaleString("en-US")}</p><p className="mt-2 text-sm text-black/42">Live inventory snapshot</p></section>)}</div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <section className={surface}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="inline-flex rounded-full bg-[#f5f5f5] p-1 text-sm">{([["all", `All Product (${allProductsCount})`], ["featured", "Featured Products"], ["active", "Active"], ["out_of_stock", "Out of Stock"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setStatus(value)} className={["rounded-full px-4 py-2 font-medium transition", status === value ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black"].join(" ")}>{label}</button>)}</div>
            <label className="flex h-12 min-w-[280px] items-center gap-3 rounded-2xl bg-[#f5f5f5] px-4 text-black/35"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your product" className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/35" /></label>
          </div>

          {loading ? <div className="mt-6 rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-black/45">Loading products...</div> : (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f7f7f8] text-black/48"><tr><th className="px-5 py-4 font-medium">Product</th><th className="px-5 py-4 font-medium">Created Date</th><th className="px-5 py-4 font-medium">Category</th><th className="px-5 py-4 font-medium">Price</th><th className="px-5 py-4 font-medium">Stock</th><th className="px-5 py-4 font-medium">Action</th></tr></thead>
                <tbody>{products.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-black/45">No products match the current filter.</td></tr> : products.map((product) => <tr key={product.id} className="border-t border-black/6"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#f7f7f8]"><img src={resolveAssetUrl(product.image || "/assets/images/iphone-17.png")} alt={product.name} className="max-h-10 object-contain" /></div><div><p className="font-semibold text-black">{product.name}</p><p className="mt-1 text-sm text-black/42">SKU {product.sku}</p></div></div></td><td className="px-5 py-4 text-black/42">{new Date(product.createdAt).toLocaleDateString()}</td><td className="px-5 py-4 text-black/65">{product.category?.name || "No category"}</td><td className="px-5 py-4 font-medium text-black">{fmt(product.price)}</td><td className="px-5 py-4"><span className={["inline-flex rounded-full px-3 py-1 text-xs font-semibold", product.status === "out_of_stock" ? "bg-rose-100 text-rose-600" : "bg-black text-white"].join(" ")}>{product.stock}</span></td><td className="px-5 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => handleEdit(product)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black transition hover:bg-black hover:text-white"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => handleDelete(product.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-500 hover:text-white"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-40"><ChevronLeft className="mr-2 h-4 w-4" />Previous</button>
            <p className="text-sm text-black/45">Page {page} of {totalPages}</p>
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-40">Next<ChevronRight className="ml-2 h-4 w-4" /></button>
          </div>
        </section>

        <section className={surface}>
          <p className="text-sm font-medium text-black/45">{selectedProductId ? "Edit product" : "Select a product"}</p>
          <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">Product update</h2>

          <div className="mt-6 space-y-4">
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelection} className="hidden" />
            <Field label="Product name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
            <Field label="SKU" value={form.sku} onChange={(value) => setForm((current) => ({ ...current, sku: value }))} />
            <div className="grid gap-4 md:grid-cols-2"><Field label="Price" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} /><Field label="Compare at price" value={form.compareAtPrice} onChange={(value) => setForm((current) => ({ ...current, compareAtPrice: value }))} /></div>
            <div className="grid gap-4 md:grid-cols-2"><Field label="Stock" value={form.stock} onChange={(value) => setForm((current) => ({ ...current, stock: value }))} /><label className="block space-y-2"><span className="text-sm font-medium text-black/58">Category</span><select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className="h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 text-sm outline-none"><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div>
            <label className="block space-y-2"><span className="text-sm font-medium text-black/58">Description</span><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 py-3 text-sm outline-none" /></label>
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f7f7f8] px-4 py-4 text-sm font-medium text-black"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} className="h-4 w-4 rounded border-black/20" />Featured on user storefront</label>

            <div className="rounded-[24px] border border-dashed border-black/12 bg-[#f7f7f8] p-4">
              <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-white">{images[0]?.url ? <img src={resolveAssetUrl(images[0].url)} alt={form.name || "Preview"} className="max-h-[160px] object-contain" /> : <div className="text-center text-black/35"><ImagePlus className="mx-auto h-8 w-8" /><p className="mt-3 text-sm">Upload product images to update the storefront gallery.</p></div>}</div>
              <div className="mt-4 grid grid-cols-3 gap-3"><button type="button" onClick={openFilePicker} disabled={uploading} className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"><PlusCircle className="mr-2 h-4 w-4" />Upload</button><button type="button" onClick={openFilePicker} disabled={uploading} className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"><Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Add more"}</button><button type="button" onClick={() => setImages([])} className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white"><XCircle className="mr-2 h-4 w-4" />Clear</button></div>
            </div>

            {images.length ? <div className="grid gap-3 sm:grid-cols-3">{images.map((image, index) => <div key={`${image.filename}-${index}`} className="rounded-[22px] border border-black/10 bg-[#f7f7f8] p-3"><div className="flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-white"><img src={resolveAssetUrl(image.url)} alt={form.name || `Product image ${index + 1}`} className="h-full w-full object-contain" /></div><div className="mt-3 flex items-center justify-between gap-2"><button type="button" onClick={() => setPrimaryImage(index)} className={["inline-flex h-9 items-center justify-center rounded-full px-3 text-xs font-semibold transition", index === 0 ? "bg-black text-white" : "border border-black/10 bg-white text-black hover:bg-black hover:text-white"].join(" ")}><Star className="mr-1.5 h-3.5 w-3.5" />{index === 0 ? "Primary" : "Make cover"}</button><button type="button" onClick={() => removeImage(index)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-500 hover:text-white"><XCircle className="h-4 w-4" /></button></div></div>)}</div> : null}
            {mediaError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{mediaError}</div> : null}

            <div className="flex gap-3 pt-2"><button type="button" onClick={handleSave} disabled={!selectedProductId || saving} className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-[#1f1f1f] disabled:opacity-60">{saving ? "Saving..." : "Update Product"}</button><button type="button" onClick={resetForm} className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white">Reset</button></div>

            {selectedProduct ? <div className="rounded-[24px] border border-black/8 bg-[#fbfbfb] p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-black/45">Inventory control</p><h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-black">Stock adjustment</h3></div><span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">Current {selectedProduct.stock}</span></div><div className="mt-4 space-y-4"><div className="grid gap-4 md:grid-cols-2"><label className="block space-y-2"><span className="text-sm font-medium text-black/58">Adjustment type</span><select value={adjustment.type} onChange={(event) => setAdjustment((current) => ({ ...current, type: event.target.value as "increase" | "decrease" | "set" }))} className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"><option value="increase">Increase</option><option value="decrease">Decrease</option><option value="set">Set exact stock</option></select></label><Field label="Quantity" value={adjustment.quantity} onChange={(value) => setAdjustment((current) => ({ ...current, quantity: value }))} /></div><label className="block space-y-2"><span className="text-sm font-medium text-black/58">Reason</span><select value={adjustment.reason} onChange={(event) => setAdjustment((current) => ({ ...current, reason: event.target.value }))} className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"><option value="manual_restock">Manual restock</option><option value="damage_writeoff">Damage write-off</option><option value="stock_correction">Stock correction</option><option value="store_transfer">Store transfer</option></select></label><label className="block space-y-2"><span className="text-sm font-medium text-black/58">Note</span><textarea value={adjustment.note} onChange={(event) => setAdjustment((current) => ({ ...current, note: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none" placeholder="Explain why stock changed." /></label><button type="button" onClick={handleInventoryAdjust} disabled={saving || Number(adjustment.quantity) < 0} className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60">{saving ? "Applying..." : "Apply Stock Adjustment"}</button></div></div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
