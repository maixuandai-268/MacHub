import { Navigate, useNavigate } from "react-router-dom";
import { useCart } from "@/features/cart/cart.context";
import CheckoutShell from "../CheckoutShell";
import ShippingMethodList from "./components/ShippingMethodList";

export default function ShippingPage() {
  const navigate = useNavigate();
  const { items, checkout, shippingMethods, setShippingMethod } = useCart();

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <CheckoutShell currentStep={2} title="Shipping method">
      <div className="space-y-6">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.22em] text-(--text-tertiary)">Delivery speed</p>
          <p className="mt-4 text-[1.02rem] leading-8 text-[#6e6e73] sm:text-[1.08rem]">
            Pick the delivery rhythm that fits the order. ETA, surface treatment, and motion language stay consistent with the darker storefront.
          </p>
        </div>

        <ShippingMethodList methods={shippingMethods} selectedMethodId={checkout.shippingMethodId} onSelect={setShippingMethod} />

        <div className="flex flex-wrap justify-end gap-4 pt-6">
          <button type="button" onClick={() => navigate("/checkout/address")} className="cy-btn-secondary h-14 min-w-[200px]">
            Back
          </button>
          <button type="button" onClick={() => navigate("/checkout/payment")} className="cy-btn-primary h-14 min-w-[220px]">
            Continue to payment
          </button>
        </div>
      </div>
    </CheckoutShell>
  );
}
