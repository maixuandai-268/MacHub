import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { resolveAssetUrl } from "@/utils/assets";
import type { CategoryItem } from "../types";

type Props = {
  categories: CategoryItem[];
  selectedId?: string;
  onSelect?: (categoryId: string) => void;
  onDelete?: (categoryId: string) => void;
};

export function CategoryChips({ categories, selectedId, onSelect, onDelete }: Props) {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect?.(category.id)}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
            aria-pressed={selectedId === category.id}
          >
            <img src={resolveAssetUrl(category.image)} alt={category.name} className="h-14 w-14 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{category.name}</p>
              <p className="mt-1 truncate text-xs text-slate-400">/{category.slug} · {category.productCount} products</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                  !category.isActive
                    ? "bg-amber-100 text-amber-700"
                    : selectedId === category.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {!category.isActive ? "Hidden" : selectedId === category.id ? "Editing" : "Live"}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect?.(category.id);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label={`Edit ${category.name}`}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(category.id);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete ${category.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center lg:flex">
        <div className="-ml-5 pointer-events-auto">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow">
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center lg:flex">
        <div className="-mr-5 pointer-events-auto">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
