import { Pencil, X } from "lucide-react";
import type { CheckoutAddress } from "@/features/cart/cart.types";

export default function AddressItem({
  address,
  checked,
  onSelect,
  onEdit,
  onDelete,
}: {
  address: CheckoutAddress;
  checked: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={[
        "grid gap-5 rounded-[28px] border p-6 transition sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start",
        checked
          ? "border-[rgba(143,185,255,0.4)] bg-[linear-gradient(180deg,rgba(143,185,255,0.16),rgba(255,255,255,0.03))]"
          : "border-(--line-soft) bg-white/[0.03]",
      ].join(" ")}
    >
      <label className="flex items-start pt-1">
        <input type="radio" checked={checked} onChange={onSelect} className="mt-1 h-5 w-5 accent-(--accent)" />
      </label>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-semibold tracking-[-0.05em] text-(--text-primary)">{address.fullName}</h3>
          <span className="rounded-full border border-(--line-soft) bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-(--text-secondary)">
            {address.label}
          </span>
          {address.isDefault ? (
            <span className="rounded-full border border-[rgba(143,185,255,0.24)] bg-[rgba(143,185,255,0.12)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-(--accent)">
              Default
            </span>
          ) : null}
        </div>
        <div className="mt-4 space-y-2 text-sm leading-7 text-(--text-secondary)">
          <p>{address.addressLine1}</p>
          {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
          <p>
            {[address.ward, address.district, address.city].filter(Boolean).join(", ")}
            {address.postalCode ? ` ${address.postalCode}` : ""}
          </p>
          <p>{address.phone}</p>
          {address.email ? <p>{address.email}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-(--line-soft) text-(--text-secondary) transition hover:border-[rgba(255,255,255,0.22)] hover:text-(--text-primary)"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-(--line-soft) text-(--text-secondary) transition hover:border-[rgba(255,255,255,0.22)] hover:text-(--text-primary)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
