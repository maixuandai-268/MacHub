import type { ShippingMethod } from "@/features/cart/cart.types";

export default function ShippingMethodItem({
  method,
  checked,
  onSelect,
}: {
  method: ShippingMethod;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 rounded-[28px] border px-6 py-6 text-left transition",
        checked
          ? "border-[rgba(143,185,255,0.4)] bg-[linear-gradient(180deg,rgba(143,185,255,0.16),rgba(255,255,255,0.03))]"
          : "border-(--line-soft) bg-white/[0.03] hover:border-[rgba(255,255,255,0.18)]",
      ].join(" ")}
    >
      <input type="radio" checked={checked} readOnly className="h-5 w-5 accent-(--accent)" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xl font-semibold tracking-[-0.05em] text-(--text-primary)">{method.label}</span>
          {checked ? (
            <span className="rounded-full border border-[rgba(143,185,255,0.24)] bg-[rgba(143,185,255,0.12)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-(--accent)">
              Selected
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-7 text-(--text-secondary)">{method.description}</p>
      </div>
      <span className="font-mono text-sm uppercase tracking-[0.2em] text-(--text-secondary)">{method.etaLabel}</span>
    </button>
  );
}
