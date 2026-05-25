import { Link } from "react-router-dom";
import { buildCatalogCategoryPath } from "@/features/catalog/category-links";
import { resolveAssetUrl } from "@/utils/assets";

const storeCategories = [
  {
    label: "Mac",
    image: "/assets/images/macbook-air-13-inch.png",
    to: buildCatalogCategoryPath("mac"),
    imageClassName: "h-[58px] w-auto sm:h-[66px]",
  },
  {
    label: "iPhone",
    image: "/assets/images/iphone-17.png",
    to: buildCatalogCategoryPath("iphone"),
    imageClassName: "h-[60px] w-auto sm:h-[68px]",
  },
  {
    label: "iPad",
    image: "/assets/images/ipad-pro-11-inch.png",
    to: buildCatalogCategoryPath("ipad"),
    imageClassName: "h-[58px] w-auto sm:h-[66px]",
  },
  {
    label: "Apple Watch",
    image: "/assets/images/apple-watch-series-11.png",
    to: buildCatalogCategoryPath("apple-watch"),
    imageClassName: "h-[54px] w-auto sm:h-[60px]",
  },
  {
    label: "Apple Vision Pro",
    image: "/assets/images/apple-vision-pro.png",
    to: buildCatalogCategoryPath("apple-vision-pro"),
    imageClassName: "h-[46px] w-auto sm:h-[52px]",
  },
  {
    label: "AirPods",
    image: "/assets/images/airpods-pro-3.png",
    to: buildCatalogCategoryPath("airpods"),
    imageClassName: "h-[50px] w-auto sm:h-[58px]",
  },
];

export default function StoreIntroSection() {
  return (
    <section className="pb-10 pt-12 sm:pt-14 lg:pt-16">
      <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-8 2xl:px-10">
        <div className="flex flex-col gap-8 pb-8 sm:gap-10 sm:pb-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[680px]">
              <h2 className="text-[1.05rem] font-semibold leading-[1] tracking-[-0.04em] text-[#1d1d1f] sm:text-[1.12rem] lg:text-[1.18rem]">
                Store.
              </h2>
            </div>

            <div className="max-w-[320px] lg:pt-4 lg:text-right">
              <p className="text-[1.08rem] font-semibold leading-[1.28] tracking-[-0.04em] text-[#1d1d1f] sm:text-[1.26rem]">
                The best way to buy the products you love.
              </p>
              <div className="mt-4 space-y-2 text-sm text-[rgba(29,29,31,0.62)]">
                <Link
                  to="/contact"
                  className="block font-medium text-(--accent) transition hover:text-(--accent-strong)"
                >
                  Connect with CyberShop
                </Link>
                <Link
                  to="/products"
                  className="block font-medium text-(--accent) transition hover:text-(--accent-strong)"
                >
                  Explore the catalog
                </Link>
              </div>
            </div>
          </div>

          <div className="-mx-3 overflow-x-auto px-3 pb-2 sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0">
            <div className="mx-auto flex min-w-max justify-center gap-10 sm:gap-12 lg:gap-14">
              {storeCategories.map((category) => (
                <Link
                  key={category.label}
                  to={category.to}
                  className="group flex min-w-[150px] flex-col items-center gap-5 rounded-[28px] px-1 py-3 text-center transition hover:-translate-y-[2px] sm:min-w-[168px]"
                >
                  <div className="flex h-[128px] w-[150px] items-center justify-center sm:h-[144px] sm:w-[168px]">
                    <img
                      src={resolveAssetUrl(category.image)}
                      alt={category.label}
                      className={`${category.imageClassName} scale-[1.32] object-contain transition duration-500 group-hover:scale-[1.38]`}
                    />
                  </div>
                  <span className="text-[16px] font-medium tracking-[-0.02em] text-[#1d1d1f]">
                    {category.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
