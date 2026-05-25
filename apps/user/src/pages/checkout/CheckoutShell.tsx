import { MapPin, Truck, WalletCards } from "lucide-react";
import type { ReactNode } from "react";

const steps = [
  { id: 1, label: "Address", helper: "Choose recipient", icon: MapPin },
  { id: 2, label: "Shipping", helper: "Delivery speed", icon: Truck },
  { id: 3, label: "Payment", helper: "Complete purchase", icon: WalletCards },
];

export default function CheckoutShell({
  currentStep,
  title,
  children,
}: {
  currentStep: 1 | 2 | 3;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="pb-24">
      <div className="cy-shell pt-12">
        <div className="mb-10 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-end">
          <div className="space-y-4">
            <span className="cy-kicker">Checkout Flow</span>
            <h1 className="text-[2.65rem] font-semibold leading-[0.94] tracking-[-0.075em] text-[#1d1d1f] sm:text-[3.35rem] lg:text-[4rem]">
              {title}
              <span className="block text-[rgba(29,29,31,0.46)]">
                Keep the next step calm and easy to read.
              </span>
            </h1>
            <p className="max-w-2xl text-[1.02rem] leading-8 text-[#6e6e73] sm:text-[1.08rem]">
              Every step is designed to feel calm, clear, and trustworthy. Progress stays visible and the total context remains easy to scan.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isPast = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={[
                    "rounded-[28px] border px-5 py-5 transition",
                    isActive
                      ? "border-[rgba(143,185,255,0.4)] bg-[linear-gradient(180deg,rgba(143,185,255,0.16),rgba(255,255,255,0.03))] shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
                      : "border-(--line-soft) bg-white/[0.03]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={[
                        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border",
                        isActive || isPast
                          ? "border-[rgba(143,185,255,0.36)] bg-[rgba(143,185,255,0.12)] text-(--text-primary)"
                          : "border-(--line-soft) text-(--text-secondary)",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-(--text-tertiary)">0{step.id}</span>
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">{step.helper}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-(--text-primary)">{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
