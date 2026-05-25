import { Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import type { ProductStatus } from "../types";

type Props = {
  active: ProductStatus;
  onChange: (status: ProductStatus) => void;
  search: string;
  onSearch: (value: string) => void;
  totalProducts: number;
};

export function CategoriesToolbar({
  active,
  onChange,
  search,
  onSearch,
  totalProducts,
}: Props) {
  const tabs: { key: ProductStatus; label: string }[] = [
    { key: "all", label: `All Product (${totalProducts})` },
    { key: "featured", label: "Featured Products" },
    { key: "sale", label: "On Sale" },
    { key: "out_of_stock", label: "Out of Stock" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#f3f4f6] p-1.5">
          {tabs.map((tab) => {
            const isActive = active === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange(tab.key)}
                className={[
                  "rounded-xl px-4 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-11 min-w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:min-w-[320px]">
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search your product"
              className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <Search size={18} className="text-slate-500" />
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
          >
            <Filter size={18} />
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
          >
            <Plus size={18} />
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
