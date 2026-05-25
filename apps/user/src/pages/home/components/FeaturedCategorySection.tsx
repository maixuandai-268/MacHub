import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { resolveAssetUrl } from "@/utils/assets";

type CarouselItem = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  price?: number;
  copy?: string;
  image: string;
  to: string;
  imageClassName: string;
  imageWrapClassName?: string;
  cardClassName?: string;
  textClassName?: string;
};

const curatedItems: CarouselItem[] = [
  {
    eyebrow: "New",
    title: "iPhone 17 Pro Max",
    subtitle: "A18 Pro. Camera-first. Titanium-sharp.",
    copy: "From 38.990.000 VND or 1.624.583 VND/mo. for 24 mo.",
    price: 38990000,
    image: "/assets/images/iphone-17-promax.png",
    to: "/products/iphone-17-pro-max",
    imageClassName:
      "mx-auto h-[245px] w-full max-w-[238px] object-contain sm:h-[275px] sm:max-w-[268px]",
    imageWrapClassName: "min-h-[246px] sm:min-h-[290px]",
    cardClassName: "bg-[linear-gradient(180deg,#ffffff_0%,#f8f9fb_100%)]",
  },
  {
    eyebrow: "New",
    title: "iPad Pro 13-inch",
    subtitle: "Ultra Retina XDR. M5. Pencil-first.",
    copy: "From 34.990.000 VND or 1.457.916 VND/mo. for 24 mo.",
    price: 34990000,
    image: "/assets/images/ipad-pro-13-inch.png",
    to: "/products/ipad-pro-13-inch",
    imageClassName:
      "mx-auto h-[250px] w-full max-w-[278px] object-contain sm:h-[284px] sm:max-w-[318px]",
    imageWrapClassName: "min-h-[246px] sm:min-h-[290px]",
    cardClassName: "bg-[linear-gradient(180deg,#eaf6ff_0%,#d7ecfb_100%)]",
  },
  {
    eyebrow: "New",
    title: "Apple Watch Series 11",
    subtitle: "The most personal health surface.",
    copy: "From 11.490.000 VND or 478.750 VND/mo. for 24 mo.",
    price: 11490000,
    image: "/assets/images/apple-watch-series-11.png",
    to: "/products/apple-watch-series-11",
    imageClassName:
      "mx-auto h-[232px] w-full max-w-[262px] object-contain sm:h-[264px] sm:max-w-[294px]",
    imageWrapClassName: "min-h-[246px] sm:min-h-[290px]",
    cardClassName: "bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f7_100%)]",
  },
  {
    eyebrow: "New",
    title: "iPhone 17",
    subtitle: "Everyday flagship. Clean silhouette.",
    copy: "From 25.990.000 VND or 1.082.916 VND/mo. for 24 mo.",
    price: 25990000,
    image: "/assets/images/iphone-17.png",
    to: "/products/iphone-17",
    imageClassName:
      "mx-auto h-[240px] w-full max-w-[228px] object-contain sm:h-[270px] sm:max-w-[260px]",
    imageWrapClassName: "min-h-[246px] sm:min-h-[290px]",
    cardClassName: "bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fb_100%)]",
  },
  {
    eyebrow: "New",
    title: "AirPods Pro 3",
    subtitle: "Adaptive Audio with quieter edges.",
    copy: "From 6.490.000 VND or 270.416 VND/mo. for 24 mo.",
    price: 6490000,
    image: "/assets/images/airpods-pro-3.png",
    to: "/products/airpods-pro-3",
    imageClassName:
      "mx-auto h-[214px] w-full max-w-[224px] object-contain sm:h-[242px] sm:max-w-[252px]",
    imageWrapClassName: "min-h-[246px] sm:min-h-[290px]",
    cardClassName: "bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fa_100%)]",
  },
  {
    eyebrow: "New",
    title: "Apple Vision Pro",
    subtitle: "Spatial computing, kept impossibly quiet.",
    copy: "From 89.990.000 VND or 3.749.583 VND/mo. for 24 mo.",
    price: 89990000,
    image: "/assets/images/apple-vision-pro.png",
    to: "/products/apple-vision-pro",
    imageClassName:
      "mx-auto h-[180px] w-full max-w-[238px] object-contain sm:h-[210px] sm:max-w-[276px]",
    imageWrapClassName: "min-h-[246px] sm:min-h-[290px]",
    cardClassName: "bg-[linear-gradient(180deg,#101114_0%,#23252c_100%)]",
    textClassName: "text-white",
  },
  {
    eyebrow: "New",
    title: "MacBook Pro 14-inch",
    subtitle: "Portable pro power for heavier sessions.",
    copy: "From 46.990.000 VND or 1.957.916 VND/mo. for 24 mo.",
    price: 46990000,
    image: "/assets/images/macbook-pro-14-inch.png",
    to: "/products/macbook-pro-14-inch",
    imageClassName:
      "mx-auto h-[212px] w-full max-w-[320px] object-contain sm:h-[242px] sm:max-w-[370px]",
    imageWrapClassName: "min-h-[246px] sm:min-h-[290px]",
    cardClassName: "bg-[linear-gradient(180deg,#f7f7fb_0%,#eef2f8_100%)]",
  },
];

export default function FeaturedCategorySection() {
  const carouselItems = useMemo<CarouselItem[]>(() => curatedItems.slice(0, 9), []);
  const loopItems = useMemo(() => [...carouselItems, ...carouselItems], [carouselItems]);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLAnchorElement | null>(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const stepRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const applyTransform = useCallback((value: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    track.style.transform = `translate3d(-${value}px, 0, 0)`;
  }, []);

  const measureTrack = useCallback(() => {
    const firstCard = firstCardRef.current;
    const track = trackRef.current;
    if (!firstCard || !track || carouselItems.length === 0) {
      stepRef.current = 0;
      loopWidthRef.current = 0;
      return;
    }

    const cardWidth = firstCard.getBoundingClientRect().width;
    const gapValue = Number.parseFloat(window.getComputedStyle(track).gap || "0");
    const step = cardWidth + gapValue;

    stepRef.current = step;
    loopWidthRef.current = step * carouselItems.length;
    offsetRef.current = offsetRef.current % loopWidthRef.current;
    applyTransform(offsetRef.current);
  }, [applyTransform, carouselItems.length]);

  const nudgeCarousel = useCallback(
    (direction: 1 | -1) => {
      if (!loopWidthRef.current || !stepRef.current) {
        return;
      }

      offsetRef.current =
        (offsetRef.current + direction * stepRef.current + loopWidthRef.current) %
        loopWidthRef.current;
      applyTransform(offsetRef.current);
    },
    [applyTransform]
  );

  useEffect(() => {
    measureTrack();

    const handleResize = () => measureTrack();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [measureTrack]);

  useEffect(() => {
    const speed = 28;

    const tick = (time: number) => {
      if (previousTimeRef.current === null) {
        previousTimeRef.current = time;
      }

      const delta = time - previousTimeRef.current;
      previousTimeRef.current = time;

      if (!isHovered && loopWidthRef.current > 0) {
        offsetRef.current = (offsetRef.current + speed * (delta / 1000)) % loopWidthRef.current;
        applyTransform(offsetRef.current);
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      previousTimeRef.current = null;
    };
  }, [applyTransform, isHovered]);

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-8 2xl:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[720px]">
            <p className="cy-kicker">Curated flagships</p>
            <h2 className="mt-3 max-w-[14ch] text-[2.2rem] font-semibold leading-[0.96] tracking-[-0.06em] text-[#1d1d1f] sm:text-[3rem]">
              The latest.
              <span className="text-[rgba(29,29,31,0.46)]">
                {" "}
                Take a look at what's new, right now.
              </span>
            </h2>
            <p className="mt-4 max-w-[48ch] text-[15px] leading-7 text-(--text-secondary) sm:text-base">
              A tighter edit of the products worth opening first, staged as
              full cards instead of another dense strip.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-(--text-secondary) transition hover:text-(--text-primary)"
          >
            View complete archive
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-base shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
              {"->"}
            </span>
          </Link>
        </div>

        <div
          className="group relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            type="button"
            aria-label="Previous featured products"
            onClick={() => nudgeCarousel(-1)}
            className={[
              "absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-[rgba(255,255,255,0.82)] text-(--text-primary) shadow-[0_18px_42px_rgba(15,23,42,0.14)] backdrop-blur-xl transition duration-300",
              isHovered
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
            ].join(" ")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Next featured products"
            onClick={() => nudgeCarousel(1)}
            className={[
              "absolute right-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-[rgba(255,255,255,0.82)] text-(--text-primary) shadow-[0_18px_42px_rgba(15,23,42,0.14)] backdrop-blur-xl transition duration-300",
              isHovered
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
            ].join(" ")}
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="overflow-hidden">
            <div ref={trackRef} className="flex gap-5 will-change-transform">
              {loopItems.map((item, index) => (
                <Link
                  key={`${item.title}-${index}`}
                  ref={index === 0 ? firstCardRef : null}
                  to={item.to}
                  className={[
                      "group/card relative w-[300px] shrink-0 overflow-hidden rounded-[28px] border border-black/7 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition duration-500 hover:-translate-y-[3px] hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)] sm:w-[340px] sm:p-5 xl:w-[400px]",
                    item.cardClassName ?? "bg-white",
                    item.textClassName ?? "text-[#1d1d1f]",
                  ].join(" ")}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),transparent_36%)] opacity-0 transition duration-500 group-hover/card:opacity-100" />

                    <div className="relative flex h-[420px] flex-col sm:h-[460px] xl:h-[500px]">
                    <div className="space-y-3">
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${item.textClassName ? "text-white/80" : "text-[#bf4800]"}`}
                      >
                        {item.eyebrow ?? "New"}
                      </p>
                      <h3
                        className={`max-w-[11.5ch] text-[1.66rem] font-semibold leading-[1.02] tracking-[-0.05em] ${item.textClassName ? "text-white" : "text-[#1d1d1f]"} sm:text-[2rem]`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`max-w-[18ch] text-[1rem] font-medium leading-7 tracking-[-0.02em] ${item.textClassName ? "text-white/88" : "text-[#1d1d1f]"}`}
                      >
                        {item.subtitle}
                      </p>
                      {item.copy ? (
                        <p
                          className={`max-w-[28ch] text-[14px] leading-6 ${item.textClassName ? "text-white/70" : "text-(--text-secondary)"}`}
                        >
                          {item.copy}
                        </p>
                      ) : null}
                    </div>

                    <div
                      className={[
                        "mt-auto flex items-end justify-center overflow-hidden",
                        item.imageWrapClassName ?? "",
                      ].join(" ")}
                    >
                      <img
                        src={resolveAssetUrl(item.image)}
                        alt={item.title}
                        className={[
                          item.imageClassName,
                          "transition duration-500 group-hover/card:scale-[1.03]",
                        ].join(" ")}
                      />
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
