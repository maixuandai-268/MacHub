import { ArrowRight, Landmark, ShieldCheck } from "lucide-react";

export default function CreditCardForm({
  method,
  sameAsBilling,
  onToggleSameAsBilling,
}: {
  method: "vnpay" | "cod";
  sameAsBilling: boolean;
  onToggleSameAsBilling: (value: boolean) => void;
}) {
  if (method === "vnpay") {
    return (
      <div className="space-y-5">
        <div className="rounded-[28px] border border-[rgba(143,185,255,0.26)] bg-[linear-gradient(180deg,rgba(143,185,255,0.14),rgba(255,255,255,0.03))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-3 text-(--accent)">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.22em]">VNPay Sandbox</p>
          </div>
          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-(--text-primary)">Redirect payment flow</h3>
          <div className="mt-5 space-y-3 text-sm leading-7 text-(--text-secondary)">
            <p>You will leave the storefront and complete the transaction on the hosted VNPay page.</p>
            <p>Use the sandbox bank and card credentials on the next screen to simulate a success or failure case.</p>
            <p>The order only becomes paid after the backend receives a valid server-to-server IPN confirmation.</p>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-(--line-soft) bg-white/[0.04] px-4 py-2 text-sm text-(--text-primary)">
            Continue to the hosted gateway
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-(--text-secondary)">
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={(event) => onToggleSameAsBilling(event.target.checked)}
            className="h-4 w-4 accent-(--accent)"
          />
          Shipping address is also the billing address
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-(--line-soft) bg-white/[0.03] p-6">
        <div className="flex items-center gap-3 text-(--accent)">
          <Landmark className="h-5 w-5" />
          <p className="text-xs uppercase tracking-[0.22em]">Cash on delivery</p>
        </div>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-(--text-primary)">Pay when the order arrives</h3>
        <div className="mt-5 space-y-3 text-sm leading-7 text-(--text-secondary)">
          <p>The order is created immediately and remains pending payment until the package is handed over.</p>
          <p>This method avoids any redirect and keeps the flow inside the storefront.</p>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-(--text-secondary)">
        <input
          type="checkbox"
          checked={sameAsBilling}
          onChange={(event) => onToggleSameAsBilling(event.target.checked)}
          className="h-4 w-4 accent-(--accent)"
        />
        Shipping address is also the billing address
      </label>
    </div>
  );
}
