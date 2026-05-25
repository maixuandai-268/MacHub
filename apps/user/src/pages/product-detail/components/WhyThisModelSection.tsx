import type { ProductReason } from "../data/product-content";

export default function WhyThisModelSection({ reasons }: { reasons: ProductReason[] }) {
  return (
    <section className="space-y-8">
      <div className="max-w-[740px]">
        <p className="cy-kicker">Why this model</p>
        <h2 className="mt-3 text-[2.2rem] font-semibold leading-[0.96] tracking-[-0.06em] text-(--text-primary) sm:text-[2.8rem]">
          A cleaner reason to choose this configuration.
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {reasons.map((reason) => (
          <article
            key={reason.title}
            className="rounded-[28px] border border-black/6 bg-white/82 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]"
          >
            <h3 className="text-[1.2rem] font-semibold tracking-[-0.04em] text-(--text-primary)">
              {reason.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-(--text-secondary)">{reason.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
