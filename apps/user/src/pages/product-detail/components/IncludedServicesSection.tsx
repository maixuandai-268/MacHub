import type { ProductServiceItem } from "../data/product-content";

export default function IncludedServicesSection({ services }: { services: ProductServiceItem[] }) {
  return (
    <section className="space-y-8 rounded-[36px] border border-black/6 bg-[linear-gradient(180deg,#ffffff_0%,#f6f7fa_100%)] px-6 py-14 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:px-10 sm:py-16">
      <div className="text-center">
        <h2 className="mx-auto max-w-[12ch] text-[2.3rem] font-semibold leading-[0.98] tracking-[-0.06em] text-(--text-primary) sm:text-[3.1rem]">
          Your new device comes with so much more.
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => (
          <article
            key={service.title}
            className="rounded-[28px] border border-black/6 bg-white/88 p-6 text-center shadow-[0_14px_32px_rgba(15,23,42,0.04)]"
          >
            <div
              className={[
                "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]",
                service.accentClassName,
              ].join(" ")}
            >
              {service.badge}
            </div>
            <h3 className="mt-5 text-[1.2rem] font-semibold tracking-[-0.04em] text-(--text-primary)">
              {service.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-(--text-secondary)">{service.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
