import { formatCurrencyVnd } from "@/utils/format";

export type FinishOption = {
  value: string;
  label: string;
  swatch: string;
};

export type CapacityOption = {
  value: string;
  label: string;
  price: number;
};

export default function VariantSelector({
  finishes,
  selectedFinish,
  onSelectFinish,
  showFinishSelector,
  showCapacitySelector,
  capacities,
  selectedCapacity,
  onSelectCapacity,
}: {
  finishes: FinishOption[];
  selectedFinish: string;
  onSelectFinish: (value: string) => void;
  showFinishSelector: boolean;
  showCapacitySelector: boolean;
  capacities: CapacityOption[];
  selectedCapacity: string;
  onSelectCapacity: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      {showFinishSelector ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--text-tertiary)">
            Color
          </p>
          <p className="mt-2 text-[1.05rem] font-medium text-(--text-primary)">
            Pick your favourite color.
          </p>
          <div className="mt-4 flex items-center gap-3">
            {finishes.map((finish) => (
              <button
                key={finish.value}
                type="button"
                aria-label={finish.label}
                onClick={() => onSelectFinish(finish.value)}
                className={[
                  "h-11 w-11 rounded-full border-2 transition",
                  selectedFinish === finish.value
                    ? "border-(--text-primary) scale-105 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                    : "border-white/0 hover:border-black/12",
                ].join(" ")}
                style={{ backgroundColor: finish.swatch }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {showCapacitySelector ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--text-tertiary)">
            Storage
          </p>
          <p className="mt-2 text-[1.05rem] font-medium text-(--text-primary)">
            Pick the capacity that fits your setup.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {capacities.map((capacity) => (
              <button
                key={capacity.value}
                type="button"
                onClick={() => onSelectCapacity(capacity.value)}
                className={[
                  "rounded-[22px] border px-4 py-4 text-left transition",
                  selectedCapacity === capacity.value
                    ? "border-(--accent) bg-(--accent-soft) text-(--text-primary) shadow-[0_12px_28px_rgba(14,165,233,0.1)]"
                    : "border-(--line-soft) bg-white/82 text-(--text-secondary) hover:border-(--line-strong) hover:text-(--text-primary)",
                ].join(" ")}
              >
                <span className="block text-[1.1rem] font-medium">{capacity.label}</span>
                <span className="mt-1 block text-sm text-(--text-secondary)">
                  {formatCurrencyVnd(capacity.price)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
