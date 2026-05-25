import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useCart } from "@/features/cart/cart.context";
import type { CatalogProduct } from "@/features/catalog/catalog.types";
import type { WishlistItem } from "@/features/cart/cart.types";
import { resolveAssetUrl } from "@/utils/assets";
import { formatCurrencyVnd } from "@/utils/format";

function toCatalogProduct(item: WishlistItem): CatalogProduct {
  const now = new Date().toISOString();

  return {
    id: item.productId,
    slug: item.slug,
    sku: item.sku,
    name: item.name,
    description: item.name,
    price: item.price,
    compareAtPrice: null,
    stock: 1,
    featured: false,
    batteryCapacity: "",
    screenType: "",
    screenDiagonal: "",
    protectionClass: "",
    builtInMemory: "",
    status: "active",
    displayStatus: "normal",
    image: item.image,
    images: [{ url: item.image, alt: item.name, sortOrder: 0 }],
    category: item.categoryName ? { id: "", name: item.categoryName, slug: "" } : null,
    createdAt: now,
    updatedAt: now,
  };
}

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addItem } = useCart();

  return (
    <div className="pb-24">
      <Breadcrumb items={[{ label: "Home", to: "/home" }, { label: "Wishlist" }]} />

      <div className="cy-shell pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-4xl">
            <span className="cy-kicker">Saved products</span>
            <h1 className="mt-5 max-w-[13ch] text-[2.65rem] font-semibold leading-[0.94] tracking-[-0.075em] text-[#1d1d1f] sm:text-[3.35rem] lg:text-[4rem]">
              Wishlist built
              <span className="block text-[rgba(29,29,31,0.46)]">
                for a clearer second look.
              </span>
            </h1>
            <p className="mt-5 max-w-4xl text-[1.08rem] leading-9 text-[#6e6e73] sm:text-[1.22rem]">
              Saved products stay in the same calm storefront language as the rest of the journey, so comparison feels consistent instead of switching into a separate dark mode.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-(--line-soft) bg-white px-5 py-3 text-[15px] font-medium text-(--text-primary) shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
            <Heart className="h-4 w-4 fill-(--accent) text-(--accent)" />
            {wishlist.length} saved item{wishlist.length === 1 ? "" : "s"}
          </div>
        </div>

        {wishlist.length === 0 ? (
          <section className="cy-panel mt-10 px-10 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(143,185,255,0.22)] bg-[rgba(143,185,255,0.14)] text-(--accent)">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.055em] text-[#1d1d1f] sm:text-[2.55rem]">Your wishlist is empty</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-8 text-[#6e6e73] sm:text-[1.08rem]">
              Save products you are considering and come back to them later without losing track.
            </p>
            <Link to="/products" className="cy-btn-primary mt-8 inline-flex h-14 items-center justify-center px-8">
              Explore products
            </Link>
          </section>
        ) : (
          <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {wishlist.map((item) => (
              <article
                key={item.productId}
                className="group overflow-hidden rounded-[28px] border border-(--line-soft) bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(143,185,255,0.2)] hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(143,185,255,0.2)] bg-[rgba(143,185,255,0.14)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-(--accent)">
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    Saved
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(toCatalogProduct(item))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-(--text-secondary) transition hover:bg-black/[0.04] hover:text-(--text-primary)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Link to={`/products/${item.slug}`} className="block">
                  <div className="relative mt-4 flex h-[220px] items-center justify-center overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#eef5fd_100%)] p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(143,185,255,0.16),transparent_34%)]" />
                    <img src={resolveAssetUrl(item.image)} alt={item.name} className="relative z-10 max-h-full object-contain transition duration-300 group-hover:scale-105" />
                  </div>
                  <p className="mt-6 text-xs uppercase tracking-[0.18em] text-(--text-tertiary)">{item.categoryName}</p>
                  <h2 className="mt-3 text-[1.9rem] font-semibold leading-[1.02] tracking-[-0.05em] text-(--text-primary)">{item.name}</h2>
                  <p className="mt-4 text-[2.35rem] font-semibold tracking-[-0.06em] text-(--text-primary)">{formatCurrencyVnd(item.price)}</p>
                </Link>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => addItem(toCatalogProduct(item))}
                    className="cy-btn-primary inline-flex h-12 flex-1 items-center justify-center gap-3 px-5 text-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to cart
                  </button>
                  <Link
                    to={`/products/${item.slug}`}
                    className="cy-btn-secondary inline-flex h-12 flex-1 items-center justify-center px-5 text-sm"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
