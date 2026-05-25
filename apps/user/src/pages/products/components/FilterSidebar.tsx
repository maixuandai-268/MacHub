import { Check, ChevronDown, Search } from "lucide-react";
import { memo, useState } from "react";
import type { CatalogCategory, CatalogProductFilters } from "@/features/catalog/catalog.types";

type FilterKey =
  | "batteryCapacity"
  | "screenType"
  | "screenDiagonal"
  | "protectionClass"
  | "builtInMemory";

type Props = {
  categories: CatalogCategory[];
  activeCategory: string;
  search: string;
  filters: CatalogProductFilters;
  selectedFilters: Record<FilterKey, string[]>;
  onSearch: (value: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onToggleFilter: (key: FilterKey, value: string) => void;
};

const filterSections: Array<{
  key: FilterKey;
  label: string;
  source: keyof CatalogProductFilters;
}> = [
  { key: "batteryCapacity", label: "Battery capacity", source: "batteryCapacity" },
  { key: "screenType", label: "Screen type", source: "screenType" },
  { key: "screenDiagonal", label: "Screen diagonal", source: "screenDiagonal" },
  { key: "protectionClass", label: "Protection class", source: "protectionClass" },
  { key: "builtInMemory", label: "Built-in memory", source: "builtInMemory" },
];

function FilterSidebar({
  categories,
  activeCategory,
  search,
  filters,
  selectedFilters,
  onSearch,
  onSelectCategory,
  onToggleFilter,
}: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    batteryCapacity: false,
    screenType: false,
    screenDiagonal: false,
    protectionClass: false,
    builtInMemory: false,
  });

  function toggleSection(key: string) {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }

  function isCategoryActive(category: CatalogCategory) {
    return activeCategory === category.slug || activeCategory === category.id;
  }

  return (
    <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
      <section className="cy-panel p-6">
        <button
          type="button"
          onClick={() => toggleSection("category")}
          className="mb-4 flex w-full items-center justify-between border-b border-(--line-soft) pb-4"
        >
          <h3 className="text-[1.7rem] font-medium tracking-[-0.04em] text-(--text-primary)">
            Category
          </h3>
          <ChevronDown
            className={[
              "h-5 w-5 text-(--text-secondary) transition",
              openSections.category ? "rotate-180" : "rotate-0",
            ].join(" ")}
          />
        </button>

        <label className="mb-4 flex h-12 items-center gap-3 rounded-2xl border border-(--line-soft) bg-white/82 px-4 text-(--text-tertiary)">
          <Search className="h-4 w-4" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search"
            className="w-full border-0 bg-transparent text-sm text-(--text-primary) outline-none placeholder:text-(--text-tertiary)"
          />
        </label>

        {openSections.category ? (
          <div className="space-y-3 text-[15px] text-(--text-primary)">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={!activeCategory}
                onChange={() => onSelectCategory("")}
                className="h-4 w-4 rounded border-(--line-soft) bg-transparent accent-(--accent)"
              />
              <span>All</span>
              <span className="text-(--text-tertiary)">{categories.length}</span>
            </label>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(isCategoryActive(category) ? "" : category.slug)}
                className="flex w-full items-center gap-3 text-left transition hover:text-(--text-primary)"
              >
                <span
                  className={[
                    "inline-flex h-5 w-5 items-center justify-center rounded-md border transition",
                    isCategoryActive(category)
                      ? "border-(--accent) bg-(--accent)/12 text-(--accent)"
                      : "border-(--line-soft) bg-transparent text-transparent",
                  ].join(" ")}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {filterSections.map((section) => {
        const options = filters[section.source];
        const selectedValues = selectedFilters[section.key];

        return (
          <section key={section.key} className="cy-panel p-6">
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              className="flex w-full items-center justify-between border-b border-(--line-soft) pb-4 text-left"
            >
              <span className="text-[1.05rem] text-(--text-primary)">{section.label}</span>
              <ChevronDown
                className={[
                  "h-4 w-4 text-(--text-secondary) transition",
                  openSections[section.key] ? "rotate-180" : "rotate-0",
                ].join(" ")}
              />
            </button>

            {openSections[section.key] ? (
              options.length ? (
                <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-2 text-[15px] text-(--text-primary)">
                  {options.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={() => onToggleFilter(section.key, option)}
                        className="h-4 w-4 rounded border-(--line-soft) bg-transparent accent-(--accent)"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-(--text-tertiary)">No options available</p>
              )
            ) : null}
          </section>
        );
      })}
    </aside>
  );
}

export default memo(FilterSidebar);
