import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useAuth } from "@/features/auth/auth.context";
import {
  formatCategoryToken,
  getCategoryQueryValue,
  getUserCategoryName,
} from "@/features/catalog/category-links";
import {
  getCatalogCategories,
  getCatalogProductFilters,
  getCatalogProducts,
} from "@/features/catalog/catalog.service";
import { useCart } from "@/features/cart/cart.context";
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductFilters,
} from "@/features/catalog/catalog.types";
import FilterSidebar from "./components/FilterSidebar";
import ProductGrid from "./components/ProductGrid";
type FilterKey =
  | "batteryCapacity"
  | "screenType"
  | "screenDiagonal"
  | "protectionClass"
  | "builtInMemory";

const filterKeys: FilterKey[] = [
  "batteryCapacity",
  "screenType",
  "screenDiagonal",
  "protectionClass",
  "builtInMemory",
];

function emptyFilters(): CatalogProductFilters {
  return {
    batteryCapacity: [],
    screenType: [],
    screenDiagonal: [],
    protectionClass: [],
    builtInMemory: [],
  };
}

function buildSelectedFilters(searchParams: URLSearchParams): Record<FilterKey, string[]> {
  return {
    batteryCapacity: searchParams.getAll("batteryCapacity"),
    screenType: searchParams.getAll("screenType"),
    screenDiagonal: searchParams.getAll("screenDiagonal"),
    protectionClass: searchParams.getAll("protectionClass"),
    builtInMemory: searchParams.getAll("builtInMemory"),
  };
}

function buildFilterSignature(filters: Record<FilterKey, string[]>) {
  return filterKeys.map((key) => `${key}:${filters[key].join("|")}`).join(";");
}

export default function ProductsPage() {
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, wishlist } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [filters, setFilters] = useState<CatalogProductFilters>(emptyFilters());
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [page, setPage] = useState(1);

  const searchParamsKey = searchParams.toString();
  const searchQuery = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || "";
  const filterParamsKey = filterKeys
    .map((key) => `${key}:${searchParams.getAll(key).join("|")}`)
    .join(";");
  const selectedFilters = useMemo(() => buildSelectedFilters(searchParams), [filterParamsKey]);
  const selectedFiltersSignature = useMemo(
    () => buildFilterSignature(selectedFilters),
    [selectedFilters]
  );
  const deferredSearch = useDeferredValue(search);
  const wishlistedKeys = useMemo(() => {
    const keys = new Set<string>();

    wishlist.forEach((item) => {
      keys.add(item.productId);
      if (item.slug) {
        keys.add(item.slug);
      }
    });

    return keys;
  }, [wishlist]);

  useEffect(() => {
    setSearch((current) => (current === searchQuery ? current : searchQuery));
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      const response = await getCatalogCategories({ limit: 20 });

      if (!cancelled) {
        setCategories(response.data);
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeCategory || categories.length === 0) {
      return;
    }

    const matchedCategory = categories.find(
      (item) => item.slug === activeCategory || item.id === activeCategory
    );

    if (!matchedCategory) {
      return;
    }

    const canonicalCategory = getCategoryQueryValue(matchedCategory);

    if (canonicalCategory === activeCategory) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("category", canonicalCategory);
    setSearchParams(params, { replace: true });
  }, [activeCategory, categories, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      const response = await getCatalogProductFilters(
        activeCategory ? { category: activeCategory } : undefined
      );

      if (!cancelled) {
        setFilters(response.data);
      }
    }

    void loadFilters();

    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsProductsLoading(true);

      try {
        const productParams: Record<string, string | number | boolean | string[]> = { limit: 100 };

        if (activeCategory) {
          productParams.category = activeCategory;
        }

        filterKeys.forEach((key) => {
          if (selectedFilters[key].length) {
            productParams[key] = selectedFilters[key];
          }
        });

        const response = await getCatalogProducts(productParams);

        if (!cancelled) {
          setProducts(response.data);
        }
      } finally {
        if (!cancelled) {
          setIsProductsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, selectedFiltersSignature]);

  const visibleProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(deferredSearch.toLowerCase())
    );
  }, [deferredSearch, products]);

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const pagedProducts = useMemo(
    () => visibleProducts.slice((page - 1) * pageSize, page * pageSize),
    [page, visibleProducts]
  );
  const activeCategoryRecord = useMemo(
    () =>
      categories.find((item) => item.id === activeCategory || item.slug === activeCategory),
    [activeCategory, categories]
  );
  const activeCategoryName = activeCategoryRecord
    ? getUserCategoryName(activeCategoryRecord)
    : activeCategory
      ? formatCategoryToken(activeCategory)
      : "Catalog";

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, search, selectedFiltersSignature]);

  const buildParamsForCategory = useCallback((categorySlug: string) => {
    const params = new URLSearchParams();
    if (categorySlug) {
      params.set("category", categorySlug);
    }
    if (search.trim()) {
      params.set("search", search.trim());
    }
    return params;
  }, [search]);

  const handleSelectCategory = useCallback((categorySlug: string) => {
    setSearchParams(buildParamsForCategory(categorySlug));
  }, [buildParamsForCategory, setSearchParams]);

  const toggleFilter = useCallback((key: FilterKey, value: string) => {
    const params = new URLSearchParams(searchParamsKey);
    const currentValues = params.getAll(key);
    params.delete(key);

    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    nextValues.forEach((item) => params.append(key, item));

    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }

    setSearchParams(params);
  }, [search, searchParamsKey, setSearchParams]);

  const clearCatalogFilters = useCallback(() => {
    setSearch("");
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const handleCatalogSearch = useCallback((nextValue: string) => {
    setSearch(nextValue);
    if (nextValue.trim() || !searchQuery) {
      return;
    }

    const params = new URLSearchParams(searchParamsKey);
    params.delete("search");
    setSearchParams(params, { replace: true });
  }, [searchParamsKey, searchQuery, setSearchParams]);

  return (
    <div className="bg-transparent pb-20">
      <Breadcrumb
        items={
          activeCategory
            ? [
                { label: "Home", to: "/home" },
                { label: "Catalog", to: "/products" },
                { label: activeCategoryName },
              ]
            : [{ label: "Home", to: "/home" }, { label: "Catalog" }]
        }
      />

      <div className="cy-shell grid gap-10 pt-10 lg:grid-cols-[320px_minmax(0,1fr)]">
        <FilterSidebar
          categories={categories}
          activeCategory={activeCategory}
          search={search}
          filters={filters}
          selectedFilters={selectedFilters}
          onSearch={handleCatalogSearch}
          onSelectCategory={handleSelectCategory}
          onToggleFilter={toggleFilter}
        />

        <div className="space-y-8">
          <div className="cy-panel p-5">
            <p className="cy-kicker">Catalog state</p>
            <p className="mt-2 text-[1.05rem] text-(--text-secondary)">
              Selected products:{" "}
              <span className="font-semibold text-(--text-primary)">
                {visibleProducts.length}
              </span>
            </p>
          </div>

          {isProductsLoading && products.length === 0 ? (
            <div className="cy-panel rounded-[28px] border-dashed px-6 py-20 text-center text-sm text-(--text-secondary)">
              Loading products...
            </div>
          ) : !visibleProducts.length ? (
            <div className="cy-panel px-6 py-16 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-(--text-tertiary)">
                Catalog state
              </p>
              <h3 className="mt-4 text-[1.9rem] font-semibold tracking-[-0.05em] text-(--text-primary)">
                No products match the current view.
              </h3>
              <p className="mx-auto mt-4 max-w-[42ch] text-sm leading-7 text-(--text-secondary) sm:text-base">
                This usually means the active category, search query, or selected
                filters narrowed the catalog down to zero results.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={clearCatalogFilters} className="cy-btn-primary">
                  Reset catalog
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCatalogSearch("");
                    setPage(1);
                  }}
                  className="cy-btn-secondary"
                >
                  Clear search only
                </button>
              </div>
            </div>
          ) : (
            <ProductGrid
              products={pagedProducts}
              isAuthenticated={isAuthenticated}
              wishlistedKeys={wishlistedKeys}
              onWishlistToggle={toggleWishlist}
            />
          )}

          <div className="flex items-center justify-center gap-3 pt-4 text-sm text-(--text-secondary)">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--line-soft) bg-white/82 transition hover:border-(--line-strong) hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).slice(0, 4).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={[
                    "h-10 min-w-10 rounded-xl px-3",
                    page === pageNumber
                      ? "bg-(--accent) text-white"
                      : "border border-(--line-soft) bg-white/82 text-(--text-secondary) hover:border-(--line-strong) hover:bg-white",
                  ].join(" ")}
                >
                  {pageNumber}
                </button>
              );
            })}
            {totalPages > 4 ? <span className="px-1 text-(--text-tertiary)">....</span> : null}
            {totalPages > 4 ? (
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className={[
                  "h-10 min-w-10 rounded-xl px-3",
                  page === totalPages
                    ? "bg-(--accent) text-white"
                    : "border border-(--line-soft) bg-white/82 text-(--text-secondary) hover:border-(--line-strong) hover:bg-white",
                ].join(" ")}
              >
                {totalPages}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--line-soft) bg-white/82 transition hover:border-(--line-strong) hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
