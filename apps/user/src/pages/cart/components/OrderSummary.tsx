import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";
import { formatCurrencyVnd } from "@/utils/format";

export default function OrderSummary({
  subtotal,
  tax,
  shippingFee,
  total,
}: {
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
}) {
  return (
    <div className="cy-panel sticky top-28 overflow-hidden p-7">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(143,185,255,0.65),transparent)]" />

      <div>
        <span className="cy-kicker">Order Summary</span>
        <h2 className="mt-4 text-[2.15rem] font-semibold tracking-[-0.065em] text-[#1d1d1f] sm:text-[2.45rem]">
          Checkout snapshot
        </h2>
        <p className="mt-3 text-[1.02rem] leading-8 text-[#6e6e73] sm:text-[1.08rem]">
          Promo and loyalty inputs are kept visually lightweight here. The core signal is trust, transparency, and a clear path into checkout.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">Promo code</p>
          <input className="cy-input" placeholder="Enter code" />
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">Loyalty card</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input className="cy-input flex-1" placeholder="Your member number" />
            <button type="button" className="cy-btn-secondary h-14 px-5 text-sm">
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-4 border-y border-(--line-soft) py-6 text-[15px] text-(--text-secondary)">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-mono text-(--text-primary)">{formatCurrencyVnd(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Estimated tax</span>
          <span className="font-mono text-(--text-primary)">{formatCurrencyVnd(tax)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping & handling</span>
          <span className="font-mono text-(--text-primary)">{formatCurrencyVnd(shippingFee)}</span>
        </div>
        <div className="flex items-center justify-between pt-4 text-base font-semibold text-(--text-primary)">
          <span>Total</span>
          <span className="font-mono text-2xl tracking-[-0.05em]">{formatCurrencyVnd(total)}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-(--text-secondary)">
        <div className="flex items-center gap-3 rounded-2xl border border-(--line-soft) bg-white/[0.03] px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-(--accent)" />
          Secure checkout and protected payment handoff
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-(--line-soft) bg-white/[0.03] px-4 py-3">
          <Truck className="h-4 w-4 text-(--accent)" />
          Shipping ETA will be confirmed before payment
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-(--line-soft) bg-white/[0.03] px-4 py-3">
          <Sparkles className="h-4 w-4 text-(--accent)" />
          Inventory is reserved only when the next steps begin
        </div>
      </div>

      <Link to="/checkout/address" className="cy-btn-primary mt-8 inline-flex h-14 w-full items-center justify-center">
        Proceed to checkout
      </Link>
    </div>
  );
}
