import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { ProductCard } from "@/components/cards/ProductCard";
import { useAuth } from "@/features/auth/auth.context";
import {
  buildCatalogCategoryPath,
  getCategoryQueryValue,
} from "@/features/catalog/category-links";
import { getCatalogProducts } from "@/features/catalog/catalog.service";
import { useCart } from "@/features/cart/cart.context";
import { getProductDetail } from "@/features/product/product.service";
import type { CatalogProduct } from "@/features/catalog/catalog.types";
import type { ProductDetail } from "@/features/product/product.types";
import AddToCartSection from "./components/AddToCartSection";
import IncludedServicesSection from "./components/IncludedServicesSection";
import InTheBoxSupportSection from "./components/InTheBoxSupportSection";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductSpecs from "./components/ProductSpecs";
import SetupSpecialistSection from "./components/SetupSpecialistSection";
import WhyThisModelSection from "./components/WhyThisModelSection";
import {
  getIncludedServices,
  getInTheBoxItems,
  getProductGallery,
  getProductSpecs,
  getSupportDeliveryItems,
  getWhyThisModel,
} from "./data/product-content";
import type { CapacityOption, FinishOption } from "./components/VariantSelector";

function getDisplayCategoryName(categoryName: string | undefined) {
  return categoryName || "Catalog";
}

function parseCapacityToGb(value: string) {
  const normalized = value.trim().toUpperCase();

  if (normalized.endsWith("TB")) {
    return Number.parseInt(normalized.replace("TB", "").trim(), 10) * 1024;
  }

  if (normalized.endsWith("GB")) {
    return Number.parseInt(normalized.replace("GB", "").trim(), 10);
  }

  return null;
}

function getFinishOptions(product: ProductDetail): FinishOption[] {
  switch (product.category?.slug) {
    case "mac":
      return [
        { value: "midnight", label: "Midnight", swatch: "#11151d" },
        { value: "blue", label: "Sky Blue", swatch: "#3f506d" },
        { value: "starlight", label: "Starlight", swatch: "#9aa7b8" },
        { value: "space-gray", label: "Space Gray", swatch: "#666d80" },
        { value: "silver", label: "Silver", swatch: "#dce4ed" },
      ];
    case "iphone":
      return [
        { value: "black", label: "Black Titanium", swatch: "#1b1d22" },
        { value: "blue", label: "Deep Blue", swatch: "#44506a" },
        { value: "natural", label: "Natural", swatch: "#bbb7ac" },
        { value: "orange", label: "Cosmic Orange", swatch: "#c97a42" },
      ];
    case "ipad":
      return [
        { value: "space-black", label: "Space Black", swatch: "#1a1d23" },
        { value: "silver", label: "Silver", swatch: "#d6dde6" },
        { value: "blue", label: "Blue", swatch: "#5f718b" },
        { value: "purple", label: "Purple", swatch: "#8b7ea8" },
      ];
    case "apple-watch":
      return [
        { value: "black", label: "Black", swatch: "#16181e" },
        { value: "natural", label: "Natural Titanium", swatch: "#bdb7aa" },
        { value: "silver", label: "Silver", swatch: "#dde5ee" },
      ];
    case "airpods":
      return [
        { value: "white", label: "White", swatch: "#f4f6f8" },
      ];
    case "apple-vision-pro":
      return [
        { value: "silver", label: "Silver", swatch: "#d9e1ea" },
      ];
    default:
      return [
        { value: "default", label: "Standard color", swatch: "#dce4ed" },
      ];
  }
}

function getCapacityLadder(product: ProductDetail) {
  switch (product.category?.slug) {
    case "mac":
      return {
        256: 0,
        512: 5000000,
        1024: 12000000,
        2048: 22000000,
      } as Record<number, number>;
    case "iphone":
      return {
        128: 0,
        256: 3000000,
        512: 8000000,
        1024: 14000000,
        2048: 24000000,
      } as Record<number, number>;
    case "ipad":
      return {
        128: 0,
        256: 4000000,
        512: 10000000,
        1024: 18000000,
      } as Record<number, number>;
    case "apple-vision-pro":
      return {
        256: 0,
        512: 9000000,
        1024: 18000000,
      } as Record<number, number>;
    default:
      return null;
  }
}

function getCapacityOptions(product: ProductDetail): CapacityOption[] {
  const ladder = getCapacityLadder(product);
  const baseCapacity = parseCapacityToGb(product.builtInMemory || "");

  if (!ladder || !baseCapacity || !(baseCapacity in ladder)) {
    return product.builtInMemory
      ? [{ value: product.builtInMemory, label: product.builtInMemory, price: product.price }]
      : [];
  }

  return Object.keys(ladder)
    .map(Number)
    .sort((left, right) => left - right)
    .map((capacity) => ({
      value: capacity >= 1024 && capacity % 1024 === 0 ? `${capacity / 1024}TB` : `${capacity}GB`,
      label: capacity >= 1024 && capacity % 1024 === 0 ? `${capacity / 1024}TB` : `${capacity}GB`,
      price: product.price + ladder[capacity] - ladder[baseCapacity],
    }));
}

function getCapacityPrice(product: ProductDetail, capacity: string) {
  const capacityOptions = getCapacityOptions(product);
  return capacityOptions.find((option) => option.value === capacity)?.price || product.price;
}

function hasConfigurableCapacity(product: ProductDetail, capacityOptions: CapacityOption[]) {
  return !["apple-watch", "airpods"].includes(product.category?.slug || "") && capacityOptions.length > 1;
}

function hasConfigurableFinish(product: ProductDetail, finishOptions: FinishOption[]) {
  return !["apple-watch", "airpods"].includes(product.category?.slug || "") && finishOptions.length > 1;
}

function RelatedProducts({ products }: { products: CatalogProduct[] }) {
  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="cy-kicker">Related products</p>
          <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-(--text-primary)">
            More hardware in the same visual lane.
          </h2>
        </div>
        <Link
          to="/products"
          className="text-sm font-semibold text-(--text-secondary) transition hover:text-(--text-primary)"
        >
          View catalog
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default function ProductDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem, isInWishlist, toggleWishlist } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProduct[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedFinish, setSelectedFinish] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [addedSignal, setAddedSignal] = useState(0);
  const [wishlistSignal, setWishlistSignal] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      const detail = await getProductDetail(slug);
      setProduct(detail);
      const related = await getCatalogProducts({
        category: detail.category?.slug || detail.category?.id || "",
        limit: 8,
      });
      setRelatedProducts(related.data.filter((item) => item.slug !== detail.slug).slice(0, 4));
    }

    void loadData();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    setQuantity((current) => Math.min(Math.max(1, current), Math.max(product.stock, 1)));
  }, [product]);

  const finishOptions = useMemo(() => (product ? getFinishOptions(product) : []), [product]);
  const capacityOptions = useMemo(() => (product ? getCapacityOptions(product) : []), [product]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedFinish(finishOptions[0]?.value || "");
    setSelectedCapacity(product.builtInMemory || capacityOptions[0]?.value || "");
  }, [capacityOptions, finishOptions, product]);

  const gallery = useMemo(
    () => (product ? getProductGallery(product, selectedFinish) : []),
    [product, selectedFinish]
  );
  const specs = useMemo(() => (product ? getProductSpecs(product) : []), [product]);
  const whyThisModel = useMemo(() => (product ? getWhyThisModel(product) : []), [product]);
  const activeFinishLabel = useMemo(() => {
    const matchedFinish = finishOptions.find((finish) => finish.value === selectedFinish);
    return matchedFinish?.label || finishOptions[0]?.label || "Selected color";
  }, [finishOptions, selectedFinish]);
  const showFinishSelector = useMemo(
    () => (product ? hasConfigurableFinish(product, finishOptions) : false),
    [finishOptions, product]
  );
  const showCapacitySelector = useMemo(
    () => (product ? hasConfigurableCapacity(product, capacityOptions) : false),
    [capacityOptions, product]
  );
  const inTheBox = useMemo(
    () =>
      product ? getInTheBoxItems(product, selectedCapacity || product.builtInMemory, activeFinishLabel) : [],
    [activeFinishLabel, product, selectedCapacity]
  );
  const supportItems = useMemo(() => (product ? getSupportDeliveryItems(product) : []), [product]);
  const includedServices = useMemo(() => (product ? getIncludedServices(product) : []), [product]);

  if (!product) {
    return <div className="px-4 py-16 text-center text-sm text-(--text-secondary)">Loading product...</div>;
  }

  const categoryLabel = getDisplayCategoryName(product.category?.name);
  const wishlisted = isInWishlist(product.id, product.slug);
  const isOutOfStock = product.stock <= 0 || product.status === "out_of_stock";
  const maxQuantity = Math.max(product.stock, 1);
  const activeFinish =
    finishOptions.find((finish) => finish.value === selectedFinish) || finishOptions[0] || null;
  const selectedCapacityValue = showCapacitySelector
    ? selectedCapacity || product.builtInMemory || capacityOptions[0]?.value || ""
    : product.builtInMemory || "";
  const displayPrice = showCapacitySelector ? getCapacityPrice(product, selectedCapacityValue) : product.price;
  const stockLabel = isOutOfStock ? "Out of stock" : `${product.stock} in stock`;

  return (
    <div className="bg-transparent pb-20">
      <Breadcrumb
        items={[
          { label: "Home", to: "/home" },
          { label: "Catalog", to: "/products" },
          {
            label: categoryLabel,
            to: product.category
              ? buildCatalogCategoryPath(getCategoryQueryValue(product.category))
              : "/products",
          },
          { label: product.name },
        ]}
      />

      <div className="cy-shell space-y-16 pt-10">
        <section className="grid gap-10 xl:min-h-[calc(100vh-11rem)] xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,520px)] xl:items-start">
          <div className="xl:sticky xl:top-28">
            <ProductGallery
              items={gallery}
              name={product.name}
              glowColor={`${activeFinish?.swatch || "#dce4ed"}33`}
              finishLabel={showFinishSelector ? activeFinish?.label || "Selected color" : ""}
            />
          </div>
          <div className="space-y-6">
            <ProductInfo
              product={product}
              selectedFinish={selectedFinish}
              selectedFinishLabel={activeFinishLabel}
              onSelectFinish={setSelectedFinish}
              finishes={finishOptions}
              showFinishSelector={showFinishSelector}
              showCapacitySelector={showCapacitySelector}
              selectedCapacity={selectedCapacityValue}
              onSelectCapacity={setSelectedCapacity}
              capacities={capacityOptions}
              displayPrice={displayPrice}
              stockLabel={stockLabel}
              isOutOfStock={isOutOfStock}
            />
            <div className="rounded-[30px] border border-black/6 bg-white/82 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--text-tertiary)">
                    Buy flow
                  </p>
                  <p className="mt-2 text-sm text-(--text-secondary)">
                    Choose quantity and continue with the selected configuration.
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                    isOutOfStock ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  {stockLabel}
                </span>
              </div>
              <AddToCartSection
                quantity={quantity}
                maxQuantity={maxQuantity}
                isOutOfStock={isOutOfStock}
                addedSignal={addedSignal}
                wishlistSignal={wishlistSignal}
                isWishlisted={wishlisted}
                onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
                onIncrease={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                onAddToCart={() => {
                  if (!isAuthenticated) {
                    navigate(`/sign-in?redirect=${encodeURIComponent(`/products/${product.slug}`)}`);
                    return;
                  }
                  if (isOutOfStock) {
                    return;
                  }
                  addItem(
                    {
                      ...product,
                      builtInMemory: selectedCapacityValue,
                      price: displayPrice,
                    },
                    quantity
                  );
                  setAddedSignal(Date.now());
                }}
                onToggleWishlist={() => {
                  if (!isAuthenticated) {
                    navigate(`/sign-in?redirect=${encodeURIComponent(`/products/${product.slug}`)}`);
                    return;
                  }
                  toggleWishlist(product);
                  setWishlistSignal(Date.now());
                }}
              />
            </div>
          </div>
        </section>

        <WhyThisModelSection reasons={whyThisModel} />
        <ProductSpecs specs={specs} />
        <InTheBoxSupportSection inTheBox={inTheBox} supportItems={supportItems} />
        <SetupSpecialistSection />
        <IncludedServicesSection services={includedServices} />
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
