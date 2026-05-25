import { ArrowRight, ShieldCheck, Sparkles, Waypoints } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumb from "@/components/layout/Breadcrumb";
import {
  buildCatalogPath,
  catalogFamilyEntries,
} from "@/features/catalog/category-links";
import { resolveAssetUrl } from "@/utils/assets";

const productFamilies = catalogFamilyEntries.map((entry) => ({
  label: entry.navLabel || entry.label,
  to: buildCatalogPath({ category: entry.slug }),
}));

const values = [
  {
    icon: Sparkles,
    title: "Edit harder",
    copy:
      "The catalog stays narrower on purpose. Fewer products means stronger hierarchy and clearer choices.",
  },
  {
    icon: Waypoints,
    title: "Connect the lineup",
    copy:
      "Phones, audio, watch, tablet, and Mac are presented as a system rather than isolated SKUs.",
  },
  {
    icon: ShieldCheck,
    title: "Reduce friction",
    copy:
      "Support, checkout, and navigation are treated as part of the product experience, not an afterthought.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-24">
      <Breadcrumb items={[{ label: "Home", to: "/home" }, { label: "About" }]} />

      <div className="cy-shell space-y-16 pt-10 sm:space-y-20">
        <section className="grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-end">
          <div className="max-w-[620px]">
            <p className="cy-kicker">About Cyber</p>
            <h1 className="mt-4 text-[3rem] font-semibold leading-[0.9] tracking-[-0.08em] text-(--text-primary) sm:text-[4.6rem]">
              A storefront rebuilt around the product.
            </h1>
            <p className="mt-6 max-w-[40ch] text-[15px] leading-7 text-(--text-secondary) sm:text-base">
              Cyber is an Apple-focused storefront concept shaped by retail restraint:
              fewer distractions, larger product framing, and a clearer relationship
              between discovery, support, and checkout.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {productFamilies.map((family) => (
              <Link
                key={family.label}
                to={family.to}
                className="rounded-[22px] border border-black/6 bg-white/82 px-5 py-5 text-sm text-(--text-secondary) shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:border-black/10 hover:bg-white hover:text-(--text-primary)"
              >
                {family.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-[36px] border border-black/6 bg-[linear-gradient(180deg,#ffffff_0%,#f3f6fb_100%)] shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.92),transparent_24%),radial-gradient(circle_at_70%_72%,rgba(143,185,255,0.14),transparent_24%)]" />
            <img
              src={resolveAssetUrl("/assets/images/product-hero.png")}
              alt="Apple product lineup"
              className="absolute bottom-[-8%] right-[-8%] w-[860px] max-w-none object-contain opacity-[0.96]"
            />
            <div className="absolute left-6 top-6 rounded-full border border-black/6 bg-white/84 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-(--text-secondary) shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
              Retail concept
            </div>
          </div>

          <div className="space-y-6">
            <div className="cy-panel p-6">
              <p className="cy-kicker">Why it feels calmer</p>
              <p className="mt-4 text-[1.7rem] font-semibold leading-[1.04] tracking-[-0.05em] text-(--text-primary)">
                The interface is asked to support desire, not compete for attention.
              </p>
            </div>
            <div className="grid gap-4">
              {values.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="cy-panel p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl border border-[rgba(143,185,255,0.24)] bg-[rgba(143,185,255,0.12)] p-3 text-(--accent)">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-[1.2rem] font-semibold tracking-[-0.04em] text-(--text-primary)">
                          {item.title}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-(--text-secondary)">
                          {item.copy}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="max-w-[560px]">
            <p className="cy-kicker">Store principles</p>
            <h2 className="mt-4 text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.06em] text-(--text-primary) sm:text-[3.1rem]">
              Every major screen should help you decide faster.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-(--text-secondary) sm:text-base">
              Product images are large, category paths are direct, support is visible,
              and the buying flow is compressed into fewer moments of uncertainty.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                id: "01",
                title: "Larger product canvases",
                copy: "Devices read as objects first, not thumbnails trapped inside utility cards.",
              },
              {
                id: "02",
                title: "Tighter category logic",
                copy: "Mac, iPhone, iPad, Watch, Vision, and AirPods act as simple entry points into the catalog.",
              },
              {
                id: "03",
                title: "Cleaner support path",
                copy: "Contact, order status, and help cues are brought forward instead of buried in a footer maze.",
              },
            ].map((item) => (
              <article key={item.id} className="cy-panel p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-tertiary)">
                  {item.id}
                </p>
                <h3 className="mt-5 text-[1.35rem] font-semibold tracking-[-0.04em] text-(--text-primary)">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-(--text-secondary)">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cy-panel grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">
          <div className="max-w-[620px]">
            <p className="cy-kicker">Continue exploring</p>
            <h2 className="mt-4 text-[2.3rem] font-semibold leading-[0.94] tracking-[-0.06em] text-(--text-primary) sm:text-[3rem]">
              Browse the catalog, or go straight to support.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="cy-btn-primary">
              Browse products
            </Link>
            <Link to="/contact" className="cy-btn-secondary">
              Contact support
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
