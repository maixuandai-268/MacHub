import Breadcrumb from "@/components/layout/Breadcrumb";
import { useCart } from "@/features/cart/cart.context";
import CartList from "./components/CartList";
import OrderSummary from "./components/OrderSummary";

export default function CartPage() {
  const { items, subtotal, shippingFee, tax, total, updateQuantity, removeItem } = useCart();

  return (
    <div className="pb-24">
      <Breadcrumb items={[{ label: "Home", to: "/home" }, { label: "Cart" }]} />

      <div className="cy-shell pt-10 sm:pt-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-10">
            <div className="max-w-4xl">
              <span className="cy-kicker">Shopping Bag</span>
              <h1 className="mt-5 max-w-[13ch] text-[2.65rem] font-semibold leading-[0.94] tracking-[-0.075em] text-[#1d1d1f] sm:text-[3.35rem] lg:text-[4rem]">
                Build the order
                <span className="block text-[rgba(29,29,31,0.46)]">
                  before the payment flow starts.
                </span>
              </h1>
              <p className="mt-5 max-w-4xl text-[1.08rem] leading-9 text-[#6e6e73] sm:text-[1.22rem]">
                Review devices, adjust quantities, and confirm the totals before moving into shipping and payment.
              </p>
            </div>

            {items.length === 0 ? (
              <div className="cy-panel px-8 py-16 text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-(--text-tertiary)">Cart is empty</p>
                <p className="mx-auto mt-4 max-w-2xl text-[1.22rem] leading-10 text-[#6e6e73] sm:text-[1.34rem]">
                  Add a few devices to start your order. The checkout flow will unlock automatically once something is in the bag.
                </p>
              </div>
            ) : (
              <div className="cy-panel overflow-hidden p-5 sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-(--line-soft) pb-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-(--text-tertiary)">Active order</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-(--text-primary)">
                      {items.length} {items.length === 1 ? "device" : "devices"} ready
                    </p>
                  </div>
                  <div className="rounded-full border border-(--line-soft) bg-white/[0.03] px-4 py-2 text-sm text-(--text-secondary)">
                    Tax and shipping calculated live
                  </div>
                </div>

                <CartList
                  items={items}
                  onDecrease={(id, quantity) => updateQuantity(id, Math.max(1, quantity))}
                  onIncrease={updateQuantity}
                  onRemove={removeItem}
                />
              </div>
            )}
          </section>

          <aside>
            <OrderSummary subtotal={subtotal} tax={tax} shippingFee={shippingFee} total={total} />
          </aside>
        </div>
      </div>
    </div>
  );
}
