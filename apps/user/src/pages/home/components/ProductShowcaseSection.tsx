import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { buildCatalogCategoryPath } from "@/features/catalog/category-links";
import { resolveAssetUrl } from "@/utils/assets";
import { formatCurrencyVnd } from "@/utils/format";

const clarityQuotes = [
  {
    quote:
      "The storefront finally feels curated. Products read like hero objects instead of template cards.",
    name: "Minh Anh",
    role: "Customer / Mobile buyer",
  },
  {
    quote:
      "Checkout feels calmer and more premium now. The whole flow looks expensive without becoming loud.",
    name: "Bao Chau",
    role: "Customer / Audio category",
  },
  {
    quote:
      "The hierarchy is cleaner. You can scan phones, wearables, and laptops without losing visual focus.",
    name: "Quoc Viet",
    role: "Customer / Flagship shopper",
  },
  {
    quote:
      "The lighter cards feel calmer and more premium. The hardware now gets the first read, not the chrome around it.",
    name: "Admin review",
    role: "Internal storefront check",
  },
];

const backOutEase = [0.34, 1.56, 0.64, 1] as const;

const archiveRowLeftVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const archiveRowRightVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      staggerDirection: -1,
    },
  },
};

const archiveCardFromLeftVariants = {
  hidden: {
    opacity: 0,
    x: -100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: backOutEase,
    },
  },
};

const archiveCardFromRightVariants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: backOutEase,
    },
  },
};

const archiveCards = [
  {
    eyebrow: "New",
    title: "iPhone 17 Pro",
    copy: "All-out Pro performance with the strongest camera and finish in the lineup.",
    price: 32990000,
    image: "/assets/images/iphone-17-pro.png",
    to: buildCatalogCategoryPath("iphone"),
    imageClassName:
      "mx-auto h-[208px] w-full max-w-[224px] object-contain object-bottom transition duration-500 group-hover:scale-[1.04] sm:h-[224px] sm:max-w-[242px]",
  },
  {
    eyebrow: "New",
    title: "iPhone 17",
    copy: "The everyday flagship surface, tuned for lighter use and a cleaner silhouette.",
    price: 23990000,
    image: "/assets/images/iphone-17.png",
    to: buildCatalogCategoryPath("iphone"),
    imageClassName:
      "mx-auto h-[206px] w-full max-w-[220px] object-contain object-bottom transition duration-500 group-hover:scale-[1.04] sm:h-[222px] sm:max-w-[238px]",
  },
  {
    eyebrow: "New",
    title: "iPhone 17e",
    copy: "Value-packed iPhone hardware staged with the same visual priority as the top tier.",
    price: 18990000,
    image: "/assets/images/iphone-17e.png",
    to: buildCatalogCategoryPath("iphone"),
    imageClassName:
      "mx-auto h-[202px] w-full max-w-[216px] object-contain object-bottom transition duration-500 group-hover:scale-[1.04] sm:h-[218px] sm:max-w-[234px]",
  },
  {
    eyebrow: "New",
    title: "iPhone 16",
    copy: "A calmer mainstream iPhone pick for people who want the latest shape without the Pro weight.",
    price: 21990000,
    image: "/assets/images/iphone-16.png",
    to: buildCatalogCategoryPath("iphone"),
    imageClassName:
      "mx-auto h-[202px] w-full max-w-[216px] object-contain object-bottom transition duration-500 group-hover:scale-[1.04] sm:h-[218px] sm:max-w-[234px]",
  },
  {
    eyebrow: "Audio",
    title: "AirPods Max",
    copy: "Over-ear audio hardware with the strongest studio presence in the archive.",
    price: 14990000,
    image: "/assets/images/airpods-max.png",
    to: buildCatalogCategoryPath("airpods"),
    imageClassName:
      "mx-auto h-[184px] w-full max-w-[210px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[196px] sm:max-w-[224px]",
  },
  {
    eyebrow: "Audio",
    title: "AirPods Pro 3",
    copy: "Compact in-ear audio that still reads like a hero object on a dark field.",
    price: 6490000,
    image: "/assets/images/airpods-pro-3.png",
    to: buildCatalogCategoryPath("airpods"),
    imageClassName:
      "mx-auto h-[168px] w-full max-w-[186px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[182px] sm:max-w-[202px]",
  },
  {
    eyebrow: "Audio",
    title: "AirPods 4",
    copy: "The everyday audio option, staged with less clutter and more product focus.",
    price: 3490000,
    image: "/assets/images/airpods-4.png",
    to: buildCatalogCategoryPath("airpods"),
    imageClassName:
      "mx-auto h-[162px] w-full max-w-[178px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[176px] sm:max-w-[192px]",
  },
  {
    eyebrow: "Watch",
    title: "Apple Watch Ultra 3",
    copy: "The bold watch choice, treated like a rugged precision instrument rather than an accessory.",
    price: 22990000,
    image: "/assets/images/apple-watch-ultra-3.png",
    to: buildCatalogCategoryPath("apple-watch"),
    imageClassName:
      "mx-auto h-[188px] w-full max-w-[204px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[202px] sm:max-w-[218px]",
  },
  {
    eyebrow: "Watch",
    title: "Apple Watch Series 11",
    copy: "A more refined watch surface for everyday wear, tracking, and smaller gestures.",
    price: 11990000,
    image: "/assets/images/apple-watch-series-11.png",
    to: buildCatalogCategoryPath("apple-watch"),
    imageClassName:
      "mx-auto h-[184px] w-full max-w-[198px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[198px] sm:max-w-[212px]",
  },
  {
    eyebrow: "Watch",
    title: "Apple Watch SE",
    copy: "The lighter watch option, framed as a clean entry point into the category.",
    price: 6990000,
    image: "/assets/images/apple-watch-se.png",
    to: buildCatalogCategoryPath("apple-watch"),
    imageClassName:
      "mx-auto h-[180px] w-full max-w-[194px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[194px] sm:max-w-[208px]",
  },
  {
    eyebrow: "Mac",
    title: "MacBook Pro 14",
    copy: "Portable pro power, presented like a compact work surface instead of a laptop listing.",
    price: 46990000,
    image: "/assets/images/macbook-pro-14-inch.png",
    to: buildCatalogCategoryPath("mac"),
    imageClassName:
      "mx-auto h-[164px] w-full max-w-[246px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[178px] sm:max-w-[268px]",
  },
  {
    eyebrow: "Mac",
    title: "MacBook Pro 16",
    copy: "The larger pro machine, staged for heavier sessions and deeper desk setups.",
    price: 68990000,
    image: "/assets/images/macbook-pro-16-inch.png",
    to: buildCatalogCategoryPath("mac"),
    imageClassName:
      "mx-auto h-[166px] w-full max-w-[252px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[180px] sm:max-w-[274px]",
  },
  {
    eyebrow: "iPad",
    title: "iPad Pro 13",
    copy: "The most expansive iPad canvas, framed for studio notes and creative work.",
    price: 34990000,
    image: "/assets/images/ipad-pro-13-inch.png",
    to: buildCatalogCategoryPath("ipad"),
    imageClassName:
      "mx-auto h-[222px] w-full max-w-[294px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[242px] sm:max-w-[320px]",
  },
  {
    eyebrow: "iPad",
    title: "iPad mini",
    copy: "Small-format tablet hardware that still deserves a premium presentation.",
    price: 15990000,
    image: "/assets/images/ipad-mini.png",
    to: buildCatalogCategoryPath("ipad"),
    imageClassName:
      "mx-auto h-[214px] w-full max-w-[272px] object-contain transition duration-500 group-hover:scale-[1.04] sm:h-[232px] sm:max-w-[296px]",
  },
];

function ArchiveCard({
  eyebrow,
  title,
  copy,
  price,
  image,
  to,
  imageClassName,
}: {
  eyebrow?: string;
  title: string;
  copy: string;
  price: number;
  image: string;
  to: string;
  imageClassName: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex h-[368px] flex-col overflow-hidden rounded-[28px] border border-black/7 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f8_100%)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition duration-500 hover:-translate-y-[3px] hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:h-[394px] sm:p-6"
    >
      <div className="relative flex h-full flex-1 flex-col">
        <div className="flex h-[216px] items-end justify-center overflow-hidden px-2 sm:h-[230px]">
          <img
            src={resolveAssetUrl(image)}
            alt={title}
            className={`${imageClassName} !w-auto drop-shadow-[0_18px_28px_rgba(15,23,42,0.12)]`}
          />
        </div>

        <div className="mt-5 flex flex-1 flex-col px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#bf4800]">
            {eyebrow ?? "New"}
          </p>
          <h3 className="mt-3 max-w-[12ch] text-[1.3rem] font-semibold leading-[1.04] tracking-[-0.045em] text-[#1d1d1f] sm:text-[1.44rem]">
            {title}
          </h3>
          <p className="mt-2 max-w-[28ch] text-[14px] leading-6 text-(--text-secondary) line-clamp-2">
            {copy}
          </p>

          <div className="mt-auto flex items-center justify-between gap-4 pt-5">
            <p className="text-[14px] font-semibold text-[#1d1d1f]">
              {formatCurrencyVnd(price)}
            </p>
            <span className="inline-flex min-h-[2.35rem] items-center justify-center rounded-full bg-[#1d1d1f] px-4 text-sm font-medium text-white shadow-[0_10px_22px_rgba(29,29,31,0.14)] transition group-hover:bg-black">
              Buy
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <article className="rounded-[28px] border border-black/6 bg-white/82 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <div className="flex gap-1 text-[#bf4800]">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-sm leading-7 text-(--text-secondary)">{quote}</p>
      <div className="mt-6">
        <p className="text-sm font-medium text-[#1d1d1f]">{name}</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-(--text-tertiary)">
          {role}
        </p>
      </div>
    </article>
  );
}

export default function ProductShowcaseSection() {
  const rows = [
    archiveCards.slice(0, 4),
    archiveCards.slice(4, 8),
    archiveCards.slice(8, 12),
  ].filter((row) => row.length > 0);

  return (
    <>
    <section className="bg-[#fbfbfd] py-14 sm:py-20">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-8 2xl:px-10">
          <motion.div
            className="mb-10 max-w-[720px]"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: backOutEase }}
          >
            <p className="cy-kicker">The archive</p>
            <h2 className="mt-3 max-w-[15ch] text-[2.15rem] font-semibold leading-[0.98] tracking-[-0.06em] text-[#1d1d1f] sm:text-[2.7rem]">
              Explore the catalog
              <span className="text-[rgba(29,29,31,0.46)]">
                {" "}
                as a set of product worlds.
              </span>
            </h2>
          </motion.div>

          <div className="space-y-5">
            {rows.map((row, rowIndex) => {
              const rowFromLeft = rowIndex % 2 === 0;
              return (
                <motion.div
                  key={`archive-row-${rowIndex}`}
                  variants={rowFromLeft ? archiveRowLeftVariants : archiveRowRightVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
                >
                  {row.map((card) => (
                    <motion.div
                      key={card.title}
                      variants={rowFromLeft ? archiveCardFromLeftVariants : archiveCardFromRightVariants}
                    >
                      <ArchiveCard {...card} />
                    </motion.div>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="cy-shell">
          <div className="rounded-[36px] bg-[rgba(255,255,255,0.76)] px-2 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-4 lg:px-8 lg:py-12">
            <div className="text-center">
              <p className="text-[2.2rem] italic tracking-[-0.05em] text-[#1d1d1f] sm:text-[3rem]">
                Clarity.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-[1100px] gap-5 md:grid-cols-2 xl:grid-cols-[0.9fr_1.05fr_0.9fr]">
              <div className="md:translate-y-6">
                <TestimonialCard {...clarityQuotes[0]} />
              </div>
              <div className="space-y-5">
                <TestimonialCard {...clarityQuotes[1]} />
                <TestimonialCard {...clarityQuotes[2]} />
              </div>
              <div className="md:translate-y-10">
                <TestimonialCard {...clarityQuotes[3]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 pt-4 sm:pb-16">
        <div className="cy-shell">
          <div className="relative overflow-hidden rounded-[42px] border border-[#d9e7f5] bg-[linear-gradient(180deg,#f9fcff_0%,#eef6ff_52%,#f7fbff_100%)] px-6 py-14 text-center shadow-[0_18px_48px_rgba(163,193,223,0.12)] sm:px-8 lg:px-12 lg:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.94),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(176,210,244,0.24),transparent_32%)]" />
            <div className="pointer-events-none absolute left-[-8%] top-[18%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(255,255,255,0)_68%)] opacity-90 blur-[6px]" />
            <div className="pointer-events-none absolute bottom-[-18%] left-1/2 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(173,208,244,0.32),rgba(173,208,244,0.1)_40%,rgba(173,208,244,0)_72%)] blur-[18px]" />
            <div className="pointer-events-none absolute right-[-8%] top-1/2 h-[460px] w-[460px] -translate-y-1/2 opacity-60">
              <div className="absolute inset-[10%] rounded-full border border-[rgba(130,173,219,0.16)]" />
              <div className="absolute inset-[19%] rounded-full border border-[rgba(130,173,219,0.14)]" />
              <div className="absolute inset-[28%] rounded-full border border-[rgba(130,173,219,0.12)]" />
              <div className="absolute inset-[37%] rounded-full border border-[rgba(130,173,219,0.1)]" />
              <div className="absolute inset-[46%] rounded-full border border-[rgba(130,173,219,0.08)]" />
            </div>
            <div className="pointer-events-none absolute bottom-[-12%] left-[-6%] h-[240px] w-[240px] rounded-full border border-[rgba(242,179,123,0.12)] opacity-60 blur-[1px]" />
            <div className="pointer-events-none absolute bottom-[12%] right-[11%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(205,225,245,0.28),rgba(205,225,245,0)_72%)] blur-[10px]" />

            <div className="relative mx-auto max-w-[760px]">
              <p className="cy-kicker">Join the drop list</p>
              <h2 className="mx-auto mt-4 max-w-[11ch] text-[2.5rem] font-semibold leading-[0.96] tracking-[-0.07em] text-[#1d1d1f] sm:text-[3.8rem]">
                Never a generic storefront.
              </h2>
              <p className="mx-auto mt-5 max-w-[40ch] text-[15px] leading-7 text-(--text-secondary) sm:text-base">
                Browse launch alerts, restock notes, and the cleaner side of
                premium electronics retail without the usual visual noise.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/sign-up" className="cy-btn-primary">
                  Join the archive
                </Link>
                <Link to="/products" className="cy-btn-secondary">
                  Browse catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

