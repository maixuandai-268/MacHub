import { ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { CatalogProduct } from "@/features/catalog/catalog.types";
import { formatCurrencyVnd } from "@/utils/format";
import VariantSelector, { type CapacityOption, type FinishOption } from "./VariantSelector";

export default function ProductInfo({
  product,
  selectedFinish,
  selectedFinishLabel,
  onSelectFinish,
  finishes,
  showFinishSelector,
  showCapacitySelector,
  selectedCapacity,
  onSelectCapacity,
  capacities,
  displayPrice,
  stockLabel,
  isOutOfStock,
}: {
  product: CatalogProduct;
  selectedFinish: string;
  selectedFinishLabel: string;
  onSelectFinish: (value: string) => void;
  finishes: FinishOption[];
  showFinishSelector: boolean;
  showCapacitySelector: boolean;
  selectedCapacity: string;
  onSelectCapacity: (value: string) => void;
  capacities: CapacityOption[];
  displayPrice: number;
  stockLabel: string;
  isOutOfStock: boolean;
}) {
  const quickSpecs = [
    { label: "Display", value: product.screenDiagonal || "Studio panel" },
    { label: "Battery", value: product.batteryCapacity || "All-day" },
    { label: "Platform", value: product.screenType || product.category?.name || "Apple hardware" },
  ];

  const selectedConfiguration = showFinishSelector
    ? showCapacitySelector && selectedCapacity
      ? `${selectedFinishLabel} · ${selectedCapacity}`
      : selectedFinishLabel
    : showCapacitySelector && selectedCapacity
      ? selectedCapacity
      : "Standard configuration";

  return (
    <div className="space-y-6">
      <p className="cy-kicker">{product.category?.name || "Apple hardware"}</p>
      <h1 className="text-[2.4rem] font-semibold tracking-[-0.06em] text-(--text-primary) sm:text-[3.2rem] xl:text-[4rem]">
        {product.name}
      </h1>

      <div className="rounded-[30px] border border-black/6 bg-white/82 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--text-tertiary)">
              Selected configuration
            </p>
            <p className="mt-2 text-[1.05rem] font-medium text-(--text-primary)">
              {selectedConfiguration}
            </p>
          </div>
          <div className="text-right">
            <span className="block font-mono text-[2rem] font-semibold tracking-[-0.04em] text-(--text-primary) sm:text-[2.35rem]">
              {formatCurrencyVnd(displayPrice)}
            </span>
            {product.compareAtPrice ? (
              <span className="mt-1 block font-mono text-sm text-(--text-tertiary) line-through">
                {formatCurrencyVnd(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-5 max-w-[48ch] text-[15px] leading-7 text-(--text-secondary)">
          {product.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="cy-chip">{product.category?.name || "Electronics"}</span>
          <span className="cy-chip">{product.displayStatus || "Featured"}</span>
          <span
            className={[
              "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
              isOutOfStock ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            {stockLabel}
          </span>
        </div>
      </div>

      {showFinishSelector || showCapacitySelector ? (
        <div className="rounded-[30px] border border-black/6 bg-white/82 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <VariantSelector
            finishes={finishes}
            selectedFinish={selectedFinish}
            onSelectFinish={onSelectFinish}
            showFinishSelector={showFinishSelector}
            showCapacitySelector={showCapacitySelector}
            capacities={capacities}
            selectedCapacity={selectedCapacity}
            onSelectCapacity={onSelectCapacity}
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {quickSpecs.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-(--line-soft) bg-white/82 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-(--text-tertiary)">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-medium text-(--text-primary)">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-[24px] border border-(--line-soft) bg-white/82 p-4 text-sm text-(--text-secondary)">
          <Truck className="h-5 w-5 text-(--accent)" />
          <div>
            <p>Fast delivery</p>
            <p className="font-medium text-(--text-primary)">1-2 business days</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[24px] border border-(--line-soft) bg-white/82 p-4 text-sm text-(--text-secondary)">
          <ShieldCheck className="h-5 w-5 text-(--accent)" />
          <div>
            <p>Warranty</p>
            <p className="font-medium text-(--text-primary)">Official 12 months</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[24px] border border-(--line-soft) bg-white/82 p-4 text-sm text-(--text-secondary)">
          <Sparkles className="h-5 w-5 text-(--accent)" />
          <div>
            <p>Condition</p>
            <p className="font-medium text-(--text-primary)">Premium finish</p>
          </div>
        </div>
      </div>
    </div>
  );
}
