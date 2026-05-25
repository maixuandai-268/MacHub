import { Link } from "react-router-dom";
import { resolveAssetUrl } from "@/utils/assets";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-10 pt-6 text-(--text-primary) sm:pb-12 sm:pt-10 lg:min-h-[calc(100vh-5.5rem)] lg:pt-[60px]">
      <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-8 2xl:px-10">
        <div className="relative grid gap-8 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-5 xl:gap-x-10">
          <div className="hidden lg:flex lg:items-start">
            <div className="inline-flex items-center rounded-full border border-black/8 bg-white/82 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-(--text-secondary) shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              Studio archive
            </div>
          </div>

          <div className="hidden lg:flex lg:justify-end lg:items-start lg:pr-[6%]">
            <div className="inline-flex items-center rounded-full border border-black/8 bg-white/82 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-(--text-secondary) shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              New arrival
            </div>
          </div>

          <div className="relative z-10 flex min-h-full flex-col justify-start pb-6 pt-4 animate-fade-in-left sm:pt-6 lg:row-start-2 lg:pb-8 lg:pt-0">
            <div className="max-w-[620px]">
              <div className="inline-flex items-center rounded-full border border-black/8 bg-white/82 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-(--text-secondary) shadow-[0_10px_30px_rgba(15,23,42,0.06)] lg:hidden">
                Studio archive
              </div>

              <h1 className="mt-30 max-w-[8ch] text-[3.2rem] font-semibold leading-[0.9] tracking-[-0.1em] text-[#1d1d1f] sm:text-[4.4rem] lg:text-[5.4rem] xl:text-[6.2rem] 2xl:text-[6.9rem]">
                Flagship  
                <span className="block font-light text-[rgba(29,29,31,0.56)]">hardware.</span>
              </h1>

              <p className="mt-6 max-w-[42ch] text-[15px] leading-7 text-(--text-secondary) sm:text-base sm:leading-8">
                CyberShop, reimagined through the logic of the Apple Store: quieter cards, clearer
                hierarchy, and stronger product framing for the devices people open first.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/products/iphone-17-pro" className="cy-btn-primary !text-white">
                  <span className="text-white">View collection</span>
                </Link>
                <Link to="/products" className="cy-btn-secondary">
                  Shop flagships
                </Link>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[360px] flex-col animate-fade-in-right pt-4 sm:min-h-[460px] sm:pt-6 lg:row-start-2 lg:min-h-full lg:justify-start lg:pt-0">
            <div className="flex justify-end pr-[6%] lg:hidden">
              <div className="inline-flex items-center rounded-full border border-black/8 bg-white/82 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-(--text-secondary) shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                New arrival
              </div>
            </div>

            <div className="relative mt-5 min-h-[360px] flex-1 sm:min-h-[460px] lg:min-h-[520px] xl:min-h-[560px]">
              <div className="pointer-events-none absolute left-1/2 top-[6%] h-[72%] w-[86%] -translate-x-1/2 rounded-[72px] bg-[radial-gradient(circle_at_center,rgba(147,197,253,0.18),rgba(191,219,254,0.1)_38%,rgba(191,219,254,0)_72%)] sm:w-[80%] lg:w-[74%] lg:rounded-[92px]" />
              <div className="absolute inset-x-[2%] bottom-0 top-0 rounded-[40px] border border-[#d6e7f5] bg-[#eef7ff] shadow-[-24px_-20px_60px_rgba(173,205,232,0.12),24px_-20px_60px_rgba(173,205,232,0.12)] sm:inset-x-[3%] sm:rounded-[48px] lg:inset-x-[4%] lg:rounded-[56px]" />
              <img
                src={resolveAssetUrl("/assets/images/iphone-17-pro.png")}
                alt="iPhone 17 Pro hero"
                className="absolute bottom-[-8px] left-1/2 z-[1] w-[320px] max-w-none -translate-x-1/2 object-contain drop-shadow-[0_35px_70px_rgba(15,23,42,0.18)] sm:bottom-[-14px] sm:w-[420px] lg:bottom-[-24px] lg:w-[560px] xl:bottom-[-100px] xl:w-[1500px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
