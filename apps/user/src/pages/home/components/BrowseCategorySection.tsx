import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { buildCatalogCategoryPath } from "@/features/catalog/category-links";

const setupSteps = [
  {
    id: "01",
    title: "Flagship phone core",
    copy:
      "Start with a hero device that carries the visual weight of the setup and anchors the entire collection.",
    to: buildCatalogCategoryPath("iphone"),
  },
  {
    id: "02",
    title: "Wearables and audio",
    copy:
      "Layer in watch and audio products as supporting pieces so the homepage feels like a kit, not a catalog dump.",
    to: buildCatalogCategoryPath("airpods"),
  },
  {
    id: "03",
    title: "Portable performance",
    copy:
      "Close with a Mac surface to give the composition depth and make the archive feel complete.",
    to: buildCatalogCategoryPath("mac"),
  },
];

const backOutEase = [0.34, 1.56, 0.64, 1] as const;

const leftVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: backOutEase },
  },
};

const rightContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.12,
    },
  },
};

const rightItemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: backOutEase },
  },
};

export default function BrowseCategorySection() {
  return (
    <motion.section
      className="relative py-14 sm:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-8 2xl:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1fr)] lg:items-start lg:gap-x-12">
          <motion.div className="relative flex min-h-0 flex-col justify-start" variants={leftVariants}>
            <div className="relative z-20 mt-30 max-w-[340px] sm:max-w-[430px]">
              <p className="cy-kicker">The architecture of a setup</p>
              <h2 className="mt-4 text-[2.6rem] font-semibold leading-[0.94] tracking-[-0.07em] text-[#1d1d1f] sm:text-[3.8rem]">
                Build around
                <span className="block font-light text-[rgba(29,29,31,0.46)]">
                  one strong object.
                </span>
              </h2>
              <p className="mt-5 max-w-[34ch] text-[15px] leading-7 text-(--text-secondary) sm:text-base">
                Premium electronics do not need louder layouts. They need a
                clearer hierarchy, stronger staging, and room for materials to
                read correctly inside lighter, calmer surfaces.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="relative ml-auto grid w-full max-w-[620px] gap-4 xl:max-w-[660px]"
            variants={rightContainerVariants}
          >
            {setupSteps.map((item) => (
              <motion.div
                key={item.id}
                variants={rightItemVariants}
                className="grid items-start gap-4 rounded-[28px] border border-black/6 bg-[rgba(255,255,255,0.88)] px-5 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition-transform sm:grid-cols-[52px_minmax(0,1fr)] sm:px-6 sm:py-5"
              >
                <div className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-[rgba(245,245,247,0.9)] text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-secondary)">
                    {item.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-[1.3rem] font-semibold tracking-[-0.04em] text-[#1d1d1f] sm:text-[1.55rem]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-[46ch] text-[14px] leading-6 text-(--text-secondary)">
                    {item.copy}
                  </p>
                  <Link
                    to={item.to}
                    className="mt-4 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-(--text-primary) transition hover:text-(--accent)"
                  >
                    {item.id === "01"
                      ? "Explore iPhone"
                      : item.id === "02"
                        ? "Explore audio"
                        : "Explore Mac"}
                    <span className="h-px w-7 bg-current" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
