import type { PaymentMethod } from "@/features/cart/cart.types";

const tabs: { id: PaymentMethod; label: string; helper: string }[] = [
  { id: "vnpay", label: "VNPay", helper: "Hosted gateway" },
  { id: "cod", label: "Cash on delivery", helper: "Pay at handoff" },
];

export default function PaymentMethodTabs({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            "rounded-[24px] border px-5 py-5 text-left transition",
            value === tab.id
              ? "border-[rgba(143,185,255,0.4)] bg-[linear-gradient(180deg,rgba(143,185,255,0.16),rgba(255,255,255,0.03))]"
              : "border-(--line-soft) bg-white/[0.03] hover:border-[rgba(255,255,255,0.18)]",
          ].join(" ")}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">{tab.helper}</p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.05em] text-(--text-primary)">{tab.label}</p>
        </button>
      ))}
    </div>
  );
}
