import {
  Camera,
  Cloud,
  Fingerprint,
  Laptop,
  MessageCircleMore,
  Smartphone,
  Watch,
} from "lucide-react";

export default function SetupSpecialistSection() {
  const icons = [MessageCircleMore, Smartphone, Laptop, Fingerprint, Watch, Cloud, Camera];

  return (
    <section className="rounded-[36px] border border-black/6 bg-[linear-gradient(180deg,#f6f7fb_0%,#f2f3f8_100%)] px-6 py-14 text-center shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:px-10 sm:py-16">
      <div className="mx-auto max-w-[860px]">
        <h2 className="mx-auto max-w-[12ch] text-[2.3rem] font-semibold leading-[0.98] tracking-[-0.06em] text-(--text-primary) sm:text-[3.1rem]">
          Set up your device with one-on-one sessions and guided support.
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-(--accent)">
          {icons.map((Icon, index) => (
            <div
              key={index}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(14,165,233,0.18)] bg-white/78"
            >
              <Icon className="h-7 w-7" />
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-[42ch] text-[15px] leading-8 text-(--text-secondary) sm:text-lg">
          When you buy directly from the storefront, setup help, migration questions,
          accessory pairing, and first-run guidance stay close to the purchase flow.
        </p>

        <button
          type="button"
          className="mt-8 inline-flex items-center gap-2 text-base font-medium text-(--accent) transition hover:text-(--accent-strong)"
        >
          Learn more about personal setup
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-sm">
            +
          </span>
        </button>
      </div>
    </section>
  );
}
