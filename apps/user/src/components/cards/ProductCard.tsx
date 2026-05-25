import { memo } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { CatalogProduct } from "@/features/catalog/catalog.types";
import { useAuth } from "@/features/auth/auth.context";
import { useCart } from "@/features/cart/cart.context";
import { formatCurrencyVnd } from "@/utils/format";
import { resolveAssetUrl } from "@/utils/assets";

type ProductCardProps = {
  product: CatalogProduct;
};

type CatalogProductCardProps = {
  product: CatalogProduct;
  isAuthenticated: boolean;
  isWishlisted: boolean;
  onWishlistToggle: (product: CatalogProduct) => void;
};

type ProductCardContentProps = {
  product: CatalogProduct;
  isAuthenticated: boolean;
  isWishlisted: boolean;
  onWishlistToggle: (product: CatalogProduct) => void;
};

function ProductCardContent({
  product,
  isAuthenticated,
  isWishlisted,
  onWishlistToggle,
}: ProductCardContentProps) {
  const navigate = useNavigate();
  const isOutOfStock = product.stock <= 0 || product.status === "out_of_stock";
  const stockLabel = isOutOfStock ? "Unavailable" : `${product.stock} in stock`;
  const description =
    product.description.length > 96
      ? `${product.description.slice(0, 93)}...`
      : product.description;

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-black/7 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f8_100%)] p-4 shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-black/10 hover:shadow-[0_20px_44px_rgba(15,23,42,0.12)]">
      <div className="pointer-events-none absolute inset-x-8 top-4 h-24 rounded-full bg-[radial-gradient(circle,rgba(143,185,255,0.16),transparent_72%)] opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
      {isOutOfStock ? (
        <span className="absolute left-5 top-5 z-10 rounded-full border border-rose-300/40 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">
          Out of stock
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            navigate(`/sign-in?redirect=${encodeURIComponent(`/products/${product.slug}`)}`);
            return;
          }
          onWishlistToggle(product);
        }}
        className={[
          "absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/88 shadow-[0_8px_20px_rgba(15,23,42,0.06)] backdrop-blur transition focus:outline-none",
          isWishlisted
            ? "border-rose-300/40 bg-rose-50 text-rose-500 shadow-[0_12px_30px_rgba(244,63,94,0.12)]"
            : "border-black/8 text-(--text-tertiary) hover:border-black/12 hover:text-(--text-primary)",
        ].join(" ")}
      >
        <Heart
          className={[
            "h-4 w-4",
            isWishlisted ? "text-rose-500" : "text-(--text-tertiary)",
          ].join(" ")}
          fill={isWishlisted ? "currentColor" : "none"}
        />
      </button>

      <Link to={`/products/${product.slug}`} className="block">
        <div className="flex aspect-[1/1] min-h-[300px] items-center justify-center rounded-[26px] border border-black/6 bg-[radial-gradient(circle_at_50%_14%,rgba(178,208,255,0.24),rgba(255,255,255,0.94)_38%,rgba(243,245,248,1)_100%)] p-8 sm:min-h-[332px] sm:p-10">
          <img
            src={resolveAssetUrl(product.image || "/assets/images/iphone-17.png")}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full max-h-[240px] w-full object-contain drop-shadow-[0_24px_42px_rgba(15,23,42,0.14)] transition duration-500 group-hover:scale-[1.05] sm:max-h-[268px]"
          />
        </div>

        <div className="space-y-5 p-2 pt-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-(--text-tertiary)">
              {product.category?.name || "Apple hardware"}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--text-tertiary)">
              {product.category?.name || "Catalog"}
            </p>
          </div>

          <div>
            <h3 className="text-[1.15rem] font-semibold leading-6 tracking-[-0.04em] text-(--text-primary)">
              {product.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{description}</p>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="block text-[1.35rem] font-semibold tracking-[-0.04em] text-(--text-primary)">
                {formatCurrencyVnd(product.price)}
              </span>
              <span
                className={[
                  "block text-xs uppercase tracking-[0.18em]",
                  isOutOfStock ? "text-rose-500" : "text-emerald-600",
                ].join(" ")}
              >
                {stockLabel}
              </span>
            </div>

            {product.compareAtPrice ? (
              <span className="font-mono text-sm text-(--text-tertiary) line-through">
                {formatCurrencyVnd(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="mt-5 flex items-center justify-between border-t border-black/6 pt-4">
        <span className="text-sm font-medium text-(--text-secondary)">
          {isOutOfStock ? "View details" : "Explore product"}
        </span>
        <Link
          to={`/products/${product.slug}`}
          className="inline-flex min-h-[2.35rem] items-center justify-center rounded-full bg-[#1d1d1f] px-4 text-sm font-medium text-white shadow-[0_10px_22px_rgba(29,29,31,0.14)] transition hover:bg-black"
        >
          Buy
        </Link>
      </div>
    </article>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useCart();

  return (
    <ProductCardContent
      product={product}
      isAuthenticated={isAuthenticated}
      isWishlisted={isInWishlist(product.id, product.slug)}
      onWishlistToggle={toggleWishlist}
    />
  );
}

export const CatalogProductCard = memo(function CatalogProductCard({
  product,
  isAuthenticated,
  isWishlisted,
  onWishlistToggle,
}: CatalogProductCardProps) {
  return (
    <ProductCardContent
      product={product}
      isAuthenticated={isAuthenticated}
      isWishlisted={isWishlisted}
      onWishlistToggle={onWishlistToggle}
    />
  );
});
