import { CheckCircle2, Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export default function AddToCartSection({
  quantity,
  maxQuantity,
  isOutOfStock,
  addedSignal,
  wishlistSignal,
  isWishlisted,
  onDecrease,
  onIncrease,
  onAddToCart,
  onToggleWishlist,
}: {
  quantity: number;
  maxQuantity: number;
  isOutOfStock: boolean;
  addedSignal: number;
  wishlistSignal: number;
  isWishlisted: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}) {
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlistAnimated, setIsWishlistAnimated] = useState(false);

  useEffect(() => {
    if (!addedSignal) {
      return;
    }

    setIsAdded(true);
    const timeout = window.setTimeout(() => {
      setIsAdded(false);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [addedSignal]);

  useEffect(() => {
    if (!wishlistSignal) {
      return;
    }

    setIsWishlistAnimated(true);
    const timeout = window.setTimeout(() => {
      setIsWishlistAnimated(false);
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [wishlistSignal]);

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <div
        className={[
          "inline-flex h-14 items-center rounded-2xl border px-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)]",
          isOutOfStock ? "border-(--line-soft) bg-white/68" : "border-(--line-soft) bg-white/82",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onDecrease}
          disabled={isOutOfStock}
          className="h-10 w-10 text-xl text-(--text-secondary) disabled:cursor-not-allowed disabled:text-(--text-tertiary)"
        >
          -
        </button>
        <span className="w-12 text-center text-lg font-medium text-(--text-primary)">{quantity}</span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={isOutOfStock || quantity >= maxQuantity}
          className="h-10 w-10 text-xl text-(--text-secondary) disabled:cursor-not-allowed disabled:text-(--text-tertiary)"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleWishlist}
        className={[
          "inline-flex h-14 items-center justify-center gap-3 rounded-2xl border px-8 text-[15px] font-medium transition duration-300",
          isWishlisted
            ? "border-rose-300/40 bg-rose-50 text-rose-600 shadow-[0_18px_42px_rgba(244,63,94,0.12)]"
            : "border-(--line-soft) bg-white/82 text-(--text-primary) hover:bg-white",
          isWishlistAnimated ? "scale-[1.02]" : "",
        ].join(" ")}
      >
        <Heart className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} />
        {isWishlisted ? "Saved" : "Wishlist"}
      </button>

      <button
        type="button"
        onClick={onAddToCart}
        disabled={isOutOfStock}
        className={[
          "relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 text-[15px] font-medium transition duration-300",
          isOutOfStock
            ? "cursor-not-allowed border border-(--line-soft) bg-white/68 text-(--text-tertiary) shadow-none"
            : isAdded
              ? "bg-emerald-300 text-[#102014] shadow-[0_18px_42px_rgba(74,222,128,0.16)]"
              : "bg-[#1d1d1f] text-white shadow-[0_18px_42px_rgba(29,29,31,0.14)] hover:bg-black",
        ].join(" ")}
      >
        <span
          className={[
            "absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition duration-700",
            isAdded ? "translate-x-full" : "-translate-x-full",
          ].join(" ")}
        />
        {isAdded ? (
          <CheckCircle2 className="relative z-10 h-5 w-5" />
        ) : (
          <ShoppingCart className="relative z-10 h-5 w-5" />
        )}
        <span className="relative z-10">
          {isOutOfStock ? "Out of stock" : isAdded ? "Added to cart" : "Add to cart"}
        </span>
      </button>
    </div>
  );
}
