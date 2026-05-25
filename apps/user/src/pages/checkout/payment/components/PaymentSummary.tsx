import type { CartItem, CheckoutAddress, ShippingMethod } from "@/features/cart/cart.types";
import { resolveAssetUrl } from "@/utils/assets";
import { formatCurrencyVnd } from "@/utils/format";

export default function PaymentSummary({
  items,
  address,
  shippingMethod,
  subtotal,
  tax,
  shippingFee,
  total,
}: {
  items: CartItem[];
  address: CheckoutAddress | undefined;
  shippingMethod: ShippingMethod | undefined;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
}) {
  return (
    <aside className="cy-panel h-fit p-6 sm:p-7">
      <div>
        <span className="cy-kicker">Order Snapshot</span>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-(--text-primary)">Final review</h2>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 rounded-[24px] border border-(--line-soft) bg-white/[0.03] p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-(--line-soft) bg-white/[0.04] p-2">
              <img src={resolveAssetUrl(item.image)} alt={item.name} className="max-h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-(--text-primary)">{item.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-(--text-tertiary)">Qty {item.quantity}</p>
            </div>
            <p className="font-mono text-sm font-semibold text-(--text-primary)">{formatCurrencyVnd(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-(--line-soft) bg-white/[0.03] p-4 text-sm leading-7 text-(--text-secondary)">
        <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">Delivery address</p>
        <p className="mt-3 text-(--text-primary)">{address ? `${address.addressLine1}, ${address.city}` : "No address selected"}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">Shipping method</p>
        <p className="mt-3 text-(--text-primary)">{shippingMethod?.label || "Free"}</p>
      </div>

      <div className="mt-6 space-y-4 border-t border-(--line-soft) pt-6 text-sm text-(--text-secondary)">
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
        <div className="flex items-center justify-between pt-3 text-base font-semibold text-(--text-primary)">
          <span>Total</span>
          <span className="font-mono text-2xl tracking-[-0.05em]">{formatCurrencyVnd(total)}</span>
        </div>
      </div>
    </aside>
  );
}
