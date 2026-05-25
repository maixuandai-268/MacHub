import { Minus, Plus, X } from "lucide-react";
import type { CartItem as CartItemType } from "@/features/cart/cart.types";
import { resolveAssetUrl } from "@/utils/assets";
import { formatCurrencyVnd } from "@/utils/format";

export default function CartItem({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItemType;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="grid gap-6 border-b border-(--line-soft) py-6 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-(--line-soft) bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_22px_50px_rgba(0,0,0,0.22)]">
        <img src={resolveAssetUrl(item.image)} alt={item.name} className="max-h-full object-contain" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-(--line-soft) bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-(--text-tertiary)">
            {item.categoryName}
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">{item.sku}</span>
        </div>
        <h3 className="mt-4 max-w-[28ch] text-xl font-semibold leading-8 tracking-[-0.05em] text-(--text-primary)">
          {item.name}
        </h3>
        <p className="mt-3 text-sm text-(--text-secondary)">Unit price {formatCurrencyVnd(item.price)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:justify-end">
        <div className="inline-flex items-center rounded-full border border-(--line-soft) bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={onDecrease}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-(--text-secondary) transition hover:bg-white/[0.06] hover:text-(--text-primary)"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="min-w-[44px] text-center font-mono text-sm font-medium text-(--text-primary)">{item.quantity}</div>
          <button
            type="button"
            onClick={onIncrease}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-(--text-secondary) transition hover:bg-white/[0.06] hover:text-(--text-primary)"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <p className="min-w-[160px] text-right font-mono text-2xl font-semibold tracking-[-0.05em] text-(--text-primary)">
          {formatCurrencyVnd(item.price * item.quantity)}
        </p>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-(--line-soft) text-(--text-secondary) transition hover:border-[rgba(255,255,255,0.22)] hover:text-(--text-primary)"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}
