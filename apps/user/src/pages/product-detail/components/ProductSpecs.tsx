import type { ProductSpecRow } from "../data/product-content";

export default function ProductSpecs({ specs }: { specs: ProductSpecRow[] }) {
  return (
    <section className="cy-panel px-6 py-8 sm:px-8 sm:py-10">
      <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-(--text-primary)">
        Technical details
      </h2>
      <p className="mt-5 text-[15px] leading-7 text-(--text-secondary)">
        A cleaner spec layout that reads like a premium product sheet instead of
        filler copy. Key hardware attributes are kept direct and easy to scan.
      </p>

      <div className="mt-8 space-y-3">
        {specs.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[1.2fr_0.8fr] border-b border-(--line-soft) py-4 text-[15px]"
          >
            <span className="text-(--text-primary)">{item.label}</span>
            <span className="text-right text-(--text-secondary)">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
