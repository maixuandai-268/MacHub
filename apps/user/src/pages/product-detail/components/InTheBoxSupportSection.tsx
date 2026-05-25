import { Box, LifeBuoy, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import type { ProductBoxItem, ProductSupportItem } from "../data/product-content";

export default function InTheBoxSupportSection({
  inTheBox,
  supportItems,
}: {
  inTheBox: ProductBoxItem[];
  supportItems: ProductSupportItem[];
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
      <article className="rounded-[32px] border border-black/6 bg-white/82 p-7 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-[rgba(14,165,233,0.16)] bg-[rgba(14,165,233,0.08)] p-3 text-(--accent)">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <p className="cy-kicker">In the box</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-[-0.05em] text-(--text-primary)">
              Everything you need to start clean.
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {inTheBox.map((item) => (
            <div key={item.title} className="rounded-[24px] border border-black/6 bg-white px-5 py-4">
              <h3 className="text-base font-semibold text-(--text-primary)">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{item.copy}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[32px] border border-black/6 bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] p-7 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <p className="cy-kicker">Support & delivery</p>
        <h2 className="mt-3 max-w-[12ch] text-[2rem] font-semibold leading-[0.96] tracking-[-0.06em] text-(--text-primary)">
          Buying direct keeps the handoff smoother.
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {supportItems.map((item, index) => {
            const icons = [Truck, ShieldCheck, LifeBuoy, PackageCheck];
            const Icon = icons[index % icons.length];

            return (
              <div
                key={item.title}
                className="rounded-[24px] border border-black/6 bg-white/88 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
              >
                <div className="rounded-2xl border border-[rgba(14,165,233,0.14)] bg-[rgba(14,165,233,0.07)] p-3 text-(--accent) w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-(--text-primary)">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
