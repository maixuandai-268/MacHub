import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, ShieldAlert, ShieldX } from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useAuth } from "@/features/auth/auth.context";
import { useCart } from "@/features/cart/cart.context";
import { getVnpayPaymentStatus } from "@/features/order/order.service";
import { formatCurrencyVnd } from "@/utils/format";

type ResultTone = "loading" | "success" | "pending" | "failed" | "invalid";

const toneStyles: Record<ResultTone, { chip: string; icon: typeof Clock3 }> = {
  loading: { chip: "border-sky-400/20 bg-sky-400/10 text-sky-200", icon: Clock3 },
  success: { chip: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200", icon: CheckCircle2 },
  pending: { chip: "border-amber-400/20 bg-amber-400/10 text-amber-200", icon: Clock3 },
  failed: { chip: "border-rose-400/20 bg-rose-400/10 text-rose-200", icon: ShieldX },
  invalid: { chip: "border-slate-400/20 bg-slate-400/10 text-slate-200", icon: ShieldAlert },
};

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();
  const { clearCart } = useCart();
  const [tone, setTone] = useState<ResultTone>("loading");
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getVnpayPaymentStatus>>["order"] | null>(null);
  const didHandleSuccess = useRef(false);

  const mode = searchParams.get("mode");
  const provider = searchParams.get("provider");
  const txnRef = searchParams.get("txnRef");
  const orderCode = searchParams.get("orderCode");
  const initialResult = searchParams.get("result");

  async function safeRefreshProfile() {
    try {
      await refreshProfile();
    } catch {
      // Payment result should stay readable even if profile refresh lags behind.
    }
  }

  useEffect(() => {
    let cancelled = false;
    let timeoutId = 0;

    async function handleSuccessOnce() {
      if (didHandleSuccess.current) {
        return;
      }

      didHandleSuccess.current = true;
      clearCart();
      await safeRefreshProfile();
    }

    async function loadStatus(attempt = 0) {
      if (!txnRef) {
        setTone(initialResult === "invalid" ? "invalid" : "failed");
        return;
      }

      try {
        const next = await getVnpayPaymentStatus(txnRef);

        if (cancelled) {
          return;
        }

        setOrder(next.order);

        if (next.order.paymentStatus === "paid") {
          setTone("success");
          await handleSuccessOnce();
          return;
        }

        if (next.order.paymentStatus === "failed") {
          setTone("failed");
          await safeRefreshProfile();
          return;
        }

        setTone(initialResult === "success" ? "pending" : "failed");

        if (!next.isFinal && initialResult === "success" && attempt < 7) {
          timeoutId = window.setTimeout(() => {
            void loadStatus(attempt + 1);
          }, 2000);
        }
      } catch {
        if (!cancelled) {
          setTone(initialResult === "invalid" ? "invalid" : "failed");
        }
      }
    }

    if (mode === "cod") {
      setTone("success");
      return () => {
        cancelled = true;
      };
    }

    if (provider !== "vnpay") {
      setTone("invalid");
      return () => {
        cancelled = true;
      };
    }

    if (initialResult === "invalid") {
      setTone("invalid");
      return () => {
        cancelled = true;
      };
    }

    void loadStatus();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [clearCart, initialResult, mode, provider, refreshProfile, txnRef]);

  const headline = useMemo(() => {
    if (mode === "cod") {
      return "Cash on delivery order created";
    }

    switch (tone) {
      case "success":
        return "VNPay payment confirmed";
      case "pending":
        return "VNPay is finalizing your payment";
      case "failed":
        return "VNPay payment failed";
      case "invalid":
        return "Invalid VNPay response";
      default:
        return "Checking payment status";
    }
  }, [mode, tone]);

  const description = useMemo(() => {
    if (mode === "cod") {
      return "The order is already in the store system and will be collected when the shipment is delivered.";
    }

    switch (tone) {
      case "success":
        return "The backend has accepted a valid VNPay confirmation and the order is now ready for fulfillment.";
      case "pending":
        return "The return redirect completed, but the storefront is still waiting for the server-to-server IPN confirmation.";
      case "failed":
        return "VNPay reported that the transaction did not complete successfully. You can go back and try a different route.";
      case "invalid":
        return "The callback data could not be trusted, so the storefront marked this result as invalid.";
      default:
        return "The storefront is checking the freshest status from the backend.";
    }
  }, [mode, tone]);

  if (mode !== "cod" && provider !== "vnpay") {
    return <Navigate to="/home" replace />;
  }

  const toneConfig = toneStyles[tone];
  const ToneIcon = toneConfig.icon;

  return (
    <div className="pb-24">
      <Breadcrumb items={[{ label: "Home", to: "/home" }, { label: "Payment result" }]} />

      <div className="cy-shell py-12">
        <article className="cy-panel overflow-hidden p-7 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(143,185,255,0.72),transparent)]" />

          <div className={["inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold", toneConfig.chip].join(" ")}>
            <ToneIcon className="h-4 w-4" />
            {tone === "loading" ? "Checking" : tone.toUpperCase()}
          </div>

          <div className="mt-6 grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <h1 className="max-w-[14ch] text-5xl font-semibold tracking-[-0.08em] text-(--text-primary) sm:text-6xl">
                {headline}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-(--text-secondary)">{description}</p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/profile" className="cy-btn-primary inline-flex h-14 items-center justify-center px-6">
                  View my orders
                </Link>
                <Link to="/products" className="cy-btn-secondary inline-flex h-14 items-center justify-center px-6">
                  Continue shopping
                </Link>
                {tone === "failed" || tone === "invalid" ? (
                  <Link to="/checkout/payment" className="inline-flex h-14 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 px-6 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/18">
                    Try payment again
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-[32px] border border-(--line-soft) bg-white/[0.03] p-6">
              <div className="space-y-5">
                <Meta label="Txn Ref" value={txnRef || "N/A"} />
                <Meta label="Order code" value={order?.orderCode || orderCode || "Pending"} />
                <Meta label="Payment status" value={mode === "cod" ? "pending" : order?.paymentStatus || tone} />
                <Meta label="Total" value={order ? formatCurrencyVnd(order.totalAmount) : "Updating"} />
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3 rounded-[24px] border border-(--line-soft) bg-white/[0.03] px-5 py-4 text-sm text-(--text-secondary)">
            <ArrowRight className="h-4 w-4 text-(--accent)" />
            Orders and payment state stay synchronized through the backend status endpoint, even after the hosted VNPay redirect returns.
          </div>
        </article>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-(--text-primary)">{value}</p>
    </div>
  );
}
