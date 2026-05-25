import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { resolveAssetUrl } from "@/utils/assets";
import type { ProductGalleryItem } from "../data/product-content";

export default function ProductGallery({
  items,
  name,
  glowColor,
  finishLabel,
}: {
  items: ProductGalleryItem[];
  name: string;
  glowColor: string;
  finishLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState("");
  const activeItem = items[activeIndex] || items[0] || null;
  const hasNavigation = items.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    setImageSrc(resolveAssetUrl(activeItem?.image));
  }, [activeItem]);

  function move(step: 1 | -1) {
    if (!items.length) {
      return;
    }

    setActiveIndex((current) => (current + step + items.length) % items.length);
  }

  return (
    <div>
      <div
        className="relative order-1 flex h-[360px] items-end justify-center rounded-[34px] border border-black/6 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:order-2 sm:h-[460px] sm:p-6 lg:h-[560px] lg:p-8 xl:h-[min(78vh,760px)]"
        style={{
          background: `radial-gradient(circle_at_50%_16%, ${glowColor}, rgba(255,255,255,0.94) 36%, rgba(244,246,249,1) 100%)`,
        }}
      >
        {finishLabel ? (
          <div className="absolute left-6 top-6 rounded-full border border-black/6 bg-white/84 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-(--text-secondary) shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
            {finishLabel}
          </div>
        ) : null}
        {activeItem?.label ? (
          <div className="absolute right-6 top-6 rounded-full border border-black/6 bg-white/84 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-(--text-secondary) shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
            {activeItem.label}
          </div>
        ) : null}
        <img
          src={imageSrc}
          alt={activeItem?.alt || name}
          className={[
            "max-h-[68%] w-full object-contain drop-shadow-[0_28px_54px_rgba(15,23,42,0.14)] sm:max-h-[72%] lg:max-h-[76%] xl:max-h-[78%]",
            activeItem?.imageClassName || "",
          ].join(" ")}
          onError={() => setImageSrc(resolveAssetUrl(activeItem?.fallbackImage))}
        />

        {hasNavigation ? (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 sm:bottom-6 sm:gap-4">
            <button
              type="button"
              aria-label="Previous product image"
              onClick={() => move(-1)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/8 bg-white/84 text-(--text-secondary) shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:bg-white hover:text-(--text-primary)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-black/6 bg-white/84 px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show ${item.label}`}
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "h-2.5 w-2.5 rounded-full transition",
                    activeIndex === index ? "bg-(--text-primary)" : "bg-black/18 hover:bg-black/35",
                  ].join(" ")}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next product image"
              onClick={() => move(1)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/8 bg-white/84 text-(--text-secondary) shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:bg-white hover:text-(--text-primary)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
