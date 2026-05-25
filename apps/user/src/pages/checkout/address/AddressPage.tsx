import { useEffect, useMemo, useState } from "react";
import { CirclePlus } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCart } from "@/features/cart/cart.context";
import type { CheckoutAddress } from "@/features/cart/cart.types";
import CheckoutShell from "../CheckoutShell";
import AddressForm from "./components/AddressForm";
import AddressItem from "./components/AddressItem";

export default function AddressPage() {
  const navigate = useNavigate();
  const { items, checkout, selectAddress, saveAddress, deleteAddress } = useCart();
  const [editing, setEditing] = useState<CheckoutAddress | null>(null);
  const [showForm, setShowForm] = useState(false);

  const selectedAddress = useMemo(
    () => checkout.addresses.find((item) => item.id === checkout.selectedAddressId),
    [checkout.addresses, checkout.selectedAddressId]
  );

  useEffect(() => {
    if (checkout.addresses.length === 0) {
      setShowForm(true);
    }
  }, [checkout.addresses.length]);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <CheckoutShell currentStep={1} title="Delivery address">
      <div className="space-y-6">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.22em] text-(--text-tertiary)">Recipient selection</p>
          <p className="mt-4 text-[1.02rem] leading-8 text-[#6e6e73] sm:text-[1.08rem]">
            Choose a saved address or add a new one before the shipping options appear. New customer accounts start here because the first address defines delivery timing and tax context.
          </p>
        </div>

        <div className="space-y-4">
          {checkout.addresses.map((address) => (
            <AddressItem
              key={address.id}
              address={address}
              checked={selectedAddress?.id === address.id}
              onSelect={() => selectAddress(address.id)}
              onEdit={() => {
                setEditing(address);
                setShowForm(true);
              }}
              onDelete={() => deleteAddress(address.id)}
            />
          ))}
        </div>

        {showForm ? (
          <AddressForm
            initialValue={editing || undefined}
            onSave={async (value) => {
              await saveAddress(value);
              setEditing(null);
              setShowForm(false);
            }}
            onCancel={() => {
              setEditing(null);
              setShowForm(false);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="cy-panel flex w-full flex-col items-center justify-center gap-3 border-dashed px-6 py-10 text-(--text-primary) transition hover:border-[rgba(143,185,255,0.32)]"
          >
            <CirclePlus className="h-8 w-8 text-(--accent)" />
            <span className="text-lg font-semibold tracking-[-0.04em]">Add new address</span>
            <span className="text-[15px] text-[#6e6e73]">Create a new destination for this order.</span>
          </button>
        )}

        <div className="flex flex-wrap justify-end gap-4 pt-6">
          <button type="button" onClick={() => navigate("/cart")} className="cy-btn-secondary h-14 min-w-[200px]">
            Back
          </button>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              disabled={!selectedAddress}
              onClick={() => navigate("/checkout/shipping")}
              className="cy-btn-primary h-14 min-w-[220px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to shipping
            </button>
            {!selectedAddress ? (
              <p className="text-sm text-(--text-tertiary)">
                Save and select one delivery address before shipping options unlock.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </CheckoutShell>
  );
}
